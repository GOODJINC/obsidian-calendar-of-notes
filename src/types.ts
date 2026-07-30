import type { TFile } from "obsidian";

export type Language = "auto" | "en" | "ko";
export type CalendarViewMode = "month" | "week" | "year";
export type DateSource = "filename" | "property" | "property-first" | "both";
export type FilenameDateLocation = "start" | "anywhere" | "entire" | "custom";
export type ClickBehavior = "smart" | "list" | "select";
export type ListDisplay = "below" | "popup" | "hidden";
export type WeekStart = "locale" | "sunday" | "monday";
export type NoteSort = "name" | "modified" | "created" | "path";
export type StartupDate = "today" | "last-viewed";

export interface CalendarOfNotesSettings {
  language: Language;
  defaultView: CalendarViewMode;
  dateSource: DateSource;
  propertyName: string;
  filenameDateLocation: FilenameDateLocation;
  filenamePattern: string;
  excludedFolders: string[];
  clickBehavior: ClickBehavior;
  listDisplay: ListDisplay;
  weekStart: WeekStart;
  noteSort: NoteSort;
  startupDate: StartupDate;
  showAdjacentMonthDays: boolean;
  showNotePaths: boolean;
  lastViewedDate: string | null;
}

export interface NoteEntry {
  file: TFile;
  dates: string[];
}

export const DEFAULT_SETTINGS: CalendarOfNotesSettings = {
  language: "auto",
  defaultView: "month",
  dateSource: "property-first",
  propertyName: "date",
  filenameDateLocation: "start",
  filenamePattern: "^(?<date>\\d{4}-\\d{2}-\\d{2})(?:\\s|$)",
  excludedFolders: ["Templates"],
  clickBehavior: "smart",
  listDisplay: "popup",
  weekStart: "locale",
  noteSort: "name",
  startupDate: "today",
  showAdjacentMonthDays: true,
  showNotePaths: false,
  lastViewedDate: null
};
