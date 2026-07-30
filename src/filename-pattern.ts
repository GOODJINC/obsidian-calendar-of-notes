import type { FilenameDateLocation } from "./types";

const BUILT_IN_PATTERNS: Record<Exclude<FilenameDateLocation, "custom">, string> = {
  start: "^(?<date>\\d{4}-\\d{2}-\\d{2})(?:$|[\\s_-])",
  anywhere: "(?:^|[^\\d])(?<date>\\d{4}-\\d{2}-\\d{2})(?!\\d)",
  entire: "^(?<date>\\d{4}-\\d{2}-\\d{2})$"
};

export function resolveFilenamePattern(location: FilenameDateLocation, customPattern: string): string {
  return location === "custom" ? customPattern : BUILT_IN_PATTERNS[location];
}
