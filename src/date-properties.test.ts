import { describe, expect, it } from "vitest";
import { extractPropertyDates } from "./date-properties";

describe("multiple date properties", () => {
  it("collects valid dates from every configured property", () => {
    const dates = extractPropertyDates({
      date: "2026-07-30",
      created: "2026-07-29T15:00:00+09:00",
      published: ["2026-08-01", "invalid"]
    }, ["date", "created", "published"]);

    expect([...dates]).toEqual(["2026-07-30", "2026-07-29", "2026-08-01"]);
  });

  it("ignores missing, blank, invalid, and duplicate values", () => {
    const dates = extractPropertyDates({ date: "2026-07-30", created: ["2026-07-30", "2026-02-29"] }, [
      "date",
      " ",
      "missing",
      "created"
    ]);
    expect([...dates]).toEqual(["2026-07-30"]);
  });
});
