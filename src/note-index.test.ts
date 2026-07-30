import { beforeEach, describe, expect, it } from "vitest";
import type { App, TFile } from "obsidian";
import { NoteDateIndex } from "./note-index";
import { DEFAULT_SETTINGS, type CalendarOfNotesSettings } from "./types";

interface FakeCache {
  frontmatter?: Record<string, unknown>;
  allTags?: string[];
}

function file(path: string): TFile {
  const name = path.slice(path.lastIndexOf("/") + 1).replace(/\.md$/, "");
  return { path, basename: name, extension: "md", stat: { ctime: 1, mtime: 1, size: 1 } } as TFile;
}

describe("NoteDateIndex", () => {
  let settings: CalendarOfNotesSettings;

  beforeEach(() => {
    settings = {
      ...DEFAULT_SETTINGS,
      propertyNames: ["date", "created"],
      excludedFolders: [],
      includedFolders: [],
      includedTags: [],
      excludedTags: []
    };
  });

  function createIndex(files: TFile[], caches: Map<string, FakeCache>): NoteDateIndex {
    const app = {
      vault: { getMarkdownFiles: () => files },
      metadataCache: { getFileCache: (target: TFile) => caches.get(target.path) ?? null }
    } as unknown as App;
    return new NoteDateIndex(app, () => settings);
  }

  it("indexes multiple properties and a built-in filename format", () => {
    settings.dateSource = "both";
    settings.filenameDateFormat = "yyyymmdd";
    const note = file("Journal/20260730 Note.md");
    const index = createIndex([note], new Map([[note.path, {
      frontmatter: { date: "2026-07-29", created: "2026-07-28" }
    }]]));

    index.rebuild();
    expect(index.count("2026-07-30")).toBe(1);
    expect(index.count("2026-07-29")).toBe(1);
    expect(index.count("2026-07-28")).toBe(1);
  });

  it("applies folder and hierarchical tag filters", () => {
    settings.includedFolders = ["Journal"];
    settings.includedTags = ["project"];
    settings.excludedTags = ["archive"];
    const included = file("Journal/2026-07-30 Included.md");
    const excludedByTag = file("Journal/2026-07-30 Archived.md");
    const excludedByFolder = file("Notes/2026-07-30 Other.md");
    const index = createIndex([included, excludedByTag, excludedByFolder], new Map([
      [included.path, { allTags: ["#project/calendar"] }],
      [excludedByTag.path, { allTags: ["#project", "#archive/old"] }],
      [excludedByFolder.path, { allTags: ["#project"] }]
    ]));

    index.rebuild();
    expect(index.get("2026-07-30").map((entry) => entry.file.path)).toEqual([included.path]);
  });

  it("uses filename dates only when property-first has no valid property date", () => {
    settings.dateSource = "property-first";
    const withProperty = file("Journal/2026-07-30 Property.md");
    const withFallback = file("Journal/2026-07-31 Fallback.md");
    const index = createIndex([withProperty, withFallback], new Map([
      [withProperty.path, { frontmatter: { date: "2026-08-01" } }],
      [withFallback.path, { frontmatter: { date: "invalid" } }]
    ]));

    index.rebuild();
    expect(index.count("2026-07-30")).toBe(0);
    expect(index.count("2026-08-01")).toBe(1);
    expect(index.count("2026-07-31")).toBe(1);
  });
});
