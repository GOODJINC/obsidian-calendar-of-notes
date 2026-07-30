import { DEFAULT_SETTINGS, type CalendarOfNotesSettings } from "./types";

type StoredSettings = Partial<Omit<CalendarOfNotesSettings, "filenameDateLocation" | "filenameDateFormat">> & {
  propertyName?: unknown;
  filenameDateLocation?: CalendarOfNotesSettings["filenameDateLocation"] | "custom";
  filenameDateFormat?: CalendarOfNotesSettings["filenameDateFormat"];
};

export function migrateSettings(value: unknown): CalendarOfNotesSettings {
  const stored = isRecord(value) ? value as StoredSettings : {};
  const {
    propertyName: legacyPropertyName,
    filenameDateLocation: storedLocation,
    filenameDateFormat: storedFormat,
    ...storedSettings
  } = stored;

  const settings: CalendarOfNotesSettings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    filenameDateLocation: storedLocation === "start" || storedLocation === "anywhere" || storedLocation === "entire"
      ? storedLocation
      : DEFAULT_SETTINGS.filenameDateLocation,
    filenameDateFormat: storedFormat ?? DEFAULT_SETTINGS.filenameDateFormat,
    propertyNames: sanitizeList(storedSettings.propertyNames, [
      typeof legacyPropertyName === "string" ? legacyPropertyName : DEFAULT_SETTINGS.propertyNames[0]
    ]),
    includedFolders: sanitizeList(storedSettings.includedFolders, DEFAULT_SETTINGS.includedFolders),
    excludedFolders: sanitizeList(storedSettings.excludedFolders, DEFAULT_SETTINGS.excludedFolders),
    includedTags: sanitizeList(storedSettings.includedTags, DEFAULT_SETTINGS.includedTags),
    excludedTags: sanitizeList(storedSettings.excludedTags, DEFAULT_SETTINGS.excludedTags)
  };

  if (!storedLocation && stored.filenamePattern && stored.filenamePattern !== DEFAULT_SETTINGS.filenamePattern) {
    settings.filenameDateFormat = "custom";
  }
  if (storedLocation === "custom") settings.filenameDateFormat = "custom";
  if (!["yyyy-mm-dd", "yyyy.mm.dd", "yyyy_mm_dd", "yyyymmdd", "custom"].includes(settings.filenameDateFormat)) {
    settings.filenameDateFormat = DEFAULT_SETTINGS.filenameDateFormat;
  }
  if (!["current", "tab", "split"].includes(settings.openLocation)) {
    settings.openLocation = DEFAULT_SETTINGS.openLocation;
  }
  return settings;
}

function sanitizeList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback.map((item) => item.trim()).filter(Boolean);
  return [...new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
