import { Events, TFile, normalizePath, type App } from "obsidian";
import { parseIsoDate } from "./date-utils";
import { resolveFilenamePattern } from "./filename-pattern";
import type { CalendarOfNotesSettings, NoteEntry } from "./types";

export class NoteDateIndex extends Events {
  private readonly byDate = new Map<string, Map<string, NoteEntry>>();
  private readonly datesByPath = new Map<string, Set<string>>();
  private filenameRegex: RegExp | null = null;

  constructor(
    private readonly app: App,
    private getSettings: () => CalendarOfNotesSettings
  ) {
    super();
    this.compileFilenamePattern();
  }

  rebuild(): void {
    this.byDate.clear();
    this.datesByPath.clear();
    this.compileFilenamePattern();
    for (const file of this.app.vault.getMarkdownFiles()) this.indexFile(file, false);
    this.trigger("changed");
  }

  indexFile(file: TFile, notify = true): void {
    this.removePath(file.path, false);
    if (this.isExcluded(file.path)) {
      if (notify) this.trigger("changed", file.path);
      return;
    }

    const dates = this.extractDates(file);
    if (dates.size > 0) this.datesByPath.set(file.path, dates);

    const entry: NoteEntry = { file, dates: [...dates].sort() };
    for (const date of dates) {
      let entries = this.byDate.get(date);
      if (!entries) {
        entries = new Map<string, NoteEntry>();
        this.byDate.set(date, entries);
      }
      entries.set(file.path, entry);
    }
    if (notify) this.trigger("changed", file.path);
  }

  removeFile(file: TFile): void {
    this.removePath(file.path, true);
  }

  renameFile(file: TFile, oldPath: string): void {
    this.removePath(oldPath, false);
    this.indexFile(file, true);
  }

  get(date: string): NoteEntry[] {
    const entries = [...(this.byDate.get(date)?.values() ?? [])];
    const sort = this.getSettings().noteSort;
    return entries.sort((left, right) => {
      if (sort === "modified") return right.file.stat.mtime - left.file.stat.mtime;
      if (sort === "created") return right.file.stat.ctime - left.file.stat.ctime;
      if (sort === "path") return left.file.path.localeCompare(right.file.path);
      return left.file.basename.localeCompare(right.file.basename);
    });
  }

  count(date: string): number {
    return this.byDate.get(date)?.size ?? 0;
  }

  private removePath(path: string, notify: boolean): void {
    const dates = this.datesByPath.get(path);
    if (!dates) return;
    for (const date of dates) {
      const entries = this.byDate.get(date);
      entries?.delete(path);
      if (entries?.size === 0) this.byDate.delete(date);
    }
    this.datesByPath.delete(path);
    if (notify) this.trigger("changed", path);
  }

  private extractDates(file: TFile): Set<string> {
    const settings = this.getSettings();
    const filenameDates = this.extractFilenameDates(file);
    const propertyDates = this.extractPropertyDates(file);

    if (settings.dateSource === "filename") return filenameDates;
    if (settings.dateSource === "property") return propertyDates;
    if (settings.dateSource === "both") return new Set([...filenameDates, ...propertyDates]);
    return propertyDates.size > 0 ? propertyDates : filenameDates;
  }

  private extractFilenameDates(file: TFile): Set<string> {
    const dates = new Set<string>();
    if (!this.filenameRegex) return dates;
    this.filenameRegex.lastIndex = 0;
    const match = this.filenameRegex.exec(file.basename);
    const candidate = match?.groups?.date ?? match?.[1] ?? match?.[0];
    const date = parseIsoDate(candidate);
    if (date) dates.add(date);
    return dates;
  }

  private extractPropertyDates(file: TFile): Set<string> {
    const dates = new Set<string>();
    const propertyName = this.getSettings().propertyName.trim();
    if (!propertyName) return dates;
    const value = this.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName];
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      const date = parseIsoDate(item);
      if (date) dates.add(date);
    }
    return dates;
  }

  private compileFilenamePattern(): void {
    try {
      const settings = this.getSettings();
      this.filenameRegex = new RegExp(resolveFilenamePattern(settings.filenameDateLocation, settings.filenamePattern));
    } catch {
      this.filenameRegex = null;
    }
  }

  private isExcluded(path: string): boolean {
    const normalizedPath = normalizePath(path);
    return this.getSettings().excludedFolders.some((folder) => {
      const normalizedFolder = normalizePath(folder.trim()).replace(/\/$/, "");
      return normalizedFolder.length > 0 &&
        (normalizedPath === normalizedFolder || normalizedPath.startsWith(`${normalizedFolder}/`));
    });
  }
}
