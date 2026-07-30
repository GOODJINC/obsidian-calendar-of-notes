import { describe, expect, it } from "vitest";
import { matchesNoteFilters, type NoteFilterSettings } from "./note-filter";

const defaults: NoteFilterSettings = {
  includedFolders: [],
  excludedFolders: [],
  includedTags: [],
  excludedTags: []
};

describe("note filters", () => {
  it("includes all notes when filters are empty", () => {
    expect(matchesNoteFilters("Notes/Example.md", [], defaults)).toBe(true);
  });

  it("supports included folders and their descendants", () => {
    const settings = { ...defaults, includedFolders: ["Journal"] };
    expect(matchesNoteFilters("Journal/2026/Note.md", [], settings)).toBe(true);
    expect(matchesNoteFilters("Projects/Note.md", [], settings)).toBe(false);
  });

  it("gives excluded folders priority", () => {
    const settings = { ...defaults, includedFolders: ["Journal"], excludedFolders: ["Journal/Private"] };
    expect(matchesNoteFilters("Journal/Private/Note.md", [], settings)).toBe(false);
  });

  it("matches parent tags and gives excluded tags priority", () => {
    const settings = { ...defaults, includedTags: ["project"], excludedTags: ["archive"] };
    expect(matchesNoteFilters("Notes/One.md", ["#project/calendar"], settings)).toBe(true);
    expect(matchesNoteFilters("Notes/Two.md", ["#project", "#archive/old"], settings)).toBe(false);
    expect(matchesNoteFilters("Notes/Three.md", ["#personal"], settings)).toBe(false);
  });
});
