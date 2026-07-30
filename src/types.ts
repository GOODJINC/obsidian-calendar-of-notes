import type { TFile } from "obsidian";

export type Language = "auto" | "en" | "ko";
export type CalendarViewMode = "month" | "week" | "year";
export type DateSource = "filename" | "property" | "property-first" | "both";
export type FilenameDateLocation = "start" | "anywhere" | "entire";
export type FilenameDateFormat = "yyyy-mm-dd" | "yyyy.mm.dd" | "yyyy_mm_dd" | "yyyymmdd" | "custom";
export type ClickBehavior = "smart" | "list" | "select";
export type ListDisplay = "below" | "popup" | "hidden";
export type WeekStart = "locale" | "sunday" | "monday";
export type NoteSort = "name" | "modified" | "created" | "path";
export type StartupDate = "today" | "last-viewed";
export type NoteOpenLocation = "current" | "tab" | "split";

export interface CalendarOfNotesSettings {
  language: Language;
  defaultView: CalendarViewMode;
  dateSource: DateSource;
  propertyNames: string[];
  filenameDateLocation: FilenameDateLocation;
  filenameDateFormat: FilenameDateFormat;
  filenamePattern: string;
  includedFolders: string[];
  excludedFolders: string[];
  includedTags: string[];
  excludedTags: string[];
  clickBehavior: ClickBehavior;
  listDisplay: ListDisplay;
  openLocation: NoteOpenLocation;
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
  propertyNames: ["date"],
  filenameDateLocation: "start",
  filenameDateFormat: "yyyy-mm-dd",
  filenamePattern: "^(?<date>\\d{4}-\\d{2}-\\d{2})(?:\\s|$)",
  includedFolders: [],
  excludedFolders: ["Templates"],
  includedTags: [],
  excludedTags: [],
  clickBehavior: "smart",
  listDisplay: "popup",
  openLocation: "current",
  weekStart: "locale",
  noteSort: "name",
  startupDate: "today",
  showAdjacentMonthDays: true,
  showNotePaths: false,
  lastViewedDate: null
};
