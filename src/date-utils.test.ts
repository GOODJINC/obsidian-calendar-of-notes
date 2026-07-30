import { describe, expect, it } from "vitest";
import { addDays, addMonths, daysInMonth, formatDateInput, parseCalendarDate, parseIsoDate, startOfWeek, toIsoDate } from "./date-utils";

describe("date utilities", () => {
  it("parses strict ISO dates and date-time prefixes", () => {
    expect(parseIsoDate("2026-07-30")).toBe("2026-07-30");
    expect(parseIsoDate("2026-07-30T23:30:00-08:00")).toBe("2026-07-30");
    expect(parseIsoDate("2026-07-30 note")).toBe("2026-07-30");
  });

  it("rejects invalid and ambiguous dates", () => {
    expect(parseIsoDate("2026-02-29")).toBeNull();
    expect(parseIsoDate("07/30/2026")).toBeNull();
    expect(parseIsoDate("2026-13-01")).toBeNull();
  });

  it("handles leap years and month boundaries", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2024-12-31", 1)).toBe("2025-01-01");
  });

  it("clamps the day when changing months", () => {
    expect(toIsoDate(addMonths({ year: 2026, month: 1, day: 31 }, 1))).toBe("2026-02-28");
    expect(toIsoDate(addMonths({ year: 2024, month: 1, day: 31 }, 1))).toBe("2024-02-29");
  });

  it("finds Sunday or Monday week starts", () => {
    expect(startOfWeek("2026-07-30", 0)).toBe("2026-07-26");
    expect(startOfWeek("2026-07-30", 1)).toBe("2026-07-27");
  });

  it("round-trips calendar dates", () => {
    expect(parseCalendarDate("2026-07-30")).toEqual({ year: 2026, month: 7, day: 30 });
    expect(parseCalendarDate("2026-7-30")).toBeNull();
  });

  it("formats compact and partially separated date input", () => {
    expect(formatDateInput("20260730")).toBe("2026-07-30");
    expect(formatDateInput("2026-")).toBe("2026-");
    expect(formatDateInput("2026-07-")).toBe("2026-07-");
    expect(formatDateInput("2026.07.30")).toBe("2026-07-30");
    expect(formatDateInput("202607301234")).toBe("2026-07-30");
  });
});
