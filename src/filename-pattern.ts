import { parseCalendarDate, parseIsoDate, toIsoDate } from "./date-utils";
import type { FilenameDateFormat, FilenameDateLocation } from "./types";

const FORMAT_PATTERNS: Record<Exclude<FilenameDateFormat, "custom">, string> = {
  "yyyy-mm-dd": "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})",
  "yyyy.mm.dd": "(?<year>\\d{4})\\.(?<month>\\d{2})\\.(?<day>\\d{2})",
  "yyyy_mm_dd": "(?<year>\\d{4})_(?<month>\\d{2})_(?<day>\\d{2})",
  yyyymmdd: "(?<year>\\d{4})(?<month>\\d{2})(?<day>\\d{2})"
};

export function resolveFilenamePattern(
  location: FilenameDateLocation,
  format: FilenameDateFormat,
  customPattern: string
): string {
  if (format === "custom") return customPattern;
  const date = FORMAT_PATTERNS[format];
  if (location === "start") return `^${date}(?!\\d)`;
  if (location === "anywhere") return `(?:^|[^\\d])${date}(?!\\d)`;
  return `^${date}$`;
}

export function extractFilenameDate(
  filename: string,
  regex: RegExp,
  format: FilenameDateFormat
): string | null {
  regex.lastIndex = 0;
  const match = regex.exec(filename);
  if (!match) return null;
  if (format === "custom") return parseIsoDate(match.groups?.date ?? match[1] ?? match[0]);

  const year = Number(match.groups?.year);
  const month = Number(match.groups?.month);
  const day = Number(match.groups?.day);
  const parsed = parseCalendarDate(`${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  return parsed ? toIsoDate(parsed) : null;
}
