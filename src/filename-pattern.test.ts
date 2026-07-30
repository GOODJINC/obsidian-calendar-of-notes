import { describe, expect, it } from "vitest";
import { extractFilenameDate, resolveFilenamePattern } from "./filename-pattern";
import type { FilenameDateFormat, FilenameDateLocation } from "./types";

function matchedDate(filename: string, format: FilenameDateFormat, location: FilenameDateLocation): string | null {
  const regex = new RegExp(resolveFilenamePattern(location, format, ""));
  return extractFilenameDate(filename, regex, format);
}

describe("filename date matching", () => {
  it.each([
    ["2026-07-30 Note title", "yyyy-mm-dd"],
    ["2026.07.30 Note title", "yyyy.mm.dd"],
    ["2026_07_30 Note title", "yyyy_mm_dd"],
    ["20260730 Note title", "yyyymmdd"]
  ] as const)("parses %s using %s", (filename, format) => {
    expect(matchedDate(filename, format, "start")).toBe("2026-07-30");
  });

  it("matches a date anywhere", () => {
    expect(matchedDate("Meeting notes 2026.07.30 final", "yyyy.mm.dd", "anywhere")).toBe("2026-07-30");
  });

  it("can require the entire filename to be a date", () => {
    expect(matchedDate("20260730", "yyyymmdd", "entire")).toBe("2026-07-30");
    expect(matchedDate("20260730 Note title", "yyyymmdd", "entire")).toBeNull();
  });

  it("rejects invalid calendar dates", () => {
    expect(matchedDate("2026-02-29 Note title", "yyyy-mm-dd", "start")).toBeNull();
  });

  it("keeps advanced ISO-date capture patterns", () => {
    const pattern = "date-(?<date>\\d{4}-\\d{2}-\\d{2})";
    expect(extractFilenameDate("date-2026-07-30", new RegExp(pattern), "custom")).toBe("2026-07-30");
  });
});
