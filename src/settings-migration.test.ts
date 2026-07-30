import { describe, expect, it } from "vitest";
import { migrateSettings } from "./settings-migration";

describe("settings migration", () => {
  it("migrates the legacy single property and custom location", () => {
    const settings = migrateSettings({
      propertyName: "created",
      filenameDateLocation: "custom",
      filenamePattern: "^(?<date>\\d{4}-\\d{2}-\\d{2})"
    });
    expect(settings.propertyNames).toEqual(["created"]);
    expect(settings.filenameDateFormat).toBe("custom");
    expect(settings.filenameDateLocation).toBe("start");
  });

  it("sanitizes persisted list settings", () => {
    const settings = migrateSettings({
      propertyNames: ["date", " date ", "created", 7],
      includedFolders: [" Journal ", ""],
      includedTags: ["project", "project"]
    });
    expect(settings.propertyNames).toEqual(["date", "created"]);
    expect(settings.includedFolders).toEqual(["Journal"]);
    expect(settings.includedTags).toEqual(["project"]);
  });
});
