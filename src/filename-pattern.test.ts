import { describe, expect, it } from "vitest";
import { resolveFilenamePattern } from "./filename-pattern";

function matchedDate(filename: string, mode: "start" | "anywhere" | "entire"): string | null {
  const match = new RegExp(resolveFilenamePattern(mode, "")).exec(filename);
  return match?.groups?.date ?? null;
}

describe("filename date position", () => {
  it("matches a date at the beginning", () => {
    expect(matchedDate("2026-07-30 Note title", "start")).toBe("2026-07-30");
    expect(matchedDate("Note title 2026-07-30", "start")).toBeNull();
  });

  it("matches a date anywhere", () => {
    expect(matchedDate("Meeting notes 2026-07-30 final", "anywhere")).toBe("2026-07-30");
  });

  it("can require the entire filename to be a date", () => {
    expect(matchedDate("2026-07-30", "entire")).toBe("2026-07-30");
    expect(matchedDate("2026-07-30 Note title", "entire")).toBeNull();
  });
});
