import {
  Notice,
  PluginSettingTab,
  Setting,
  requireApiVersion,
  type App,
  type SettingDefinition,
  type SettingDefinitionItem
} from "obsidian";
import { t } from "./i18n";
import type CalendarOfNotesPlugin from "../main";
import type { CalendarOfNotesSettings, FilenameDateFormat, FilenameDateLocation } from "./types";

type SettingKey = keyof CalendarOfNotesSettings;

const INDEX_SETTING_KEYS = new Set<SettingKey>([
  "dateSource",
  "propertyNames",
  "filenameDateLocation",
  "filenameDateFormat",
  "filenamePattern",
  "includedFolders",
  "excludedFolders",
  "includedTags",
  "excludedTags"
]);

export class CalendarOfNotesSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: CalendarOfNotesPlugin) {
    super(app, plugin);
  }

  display(): void {
    this.renderLegacySettings();
  }

  getSettingDefinitions(): SettingDefinitionItem<SettingKey>[] {
    const settings = this.plugin.settings;
    const isPropertyEnabled = () => settings.dateSource !== "filename";
    const isFilenameEnabled = () => settings.dateSource !== "property";
    const isBuiltInFilenameFormat = () => isFilenameEnabled() && settings.filenameDateFormat !== "custom";
    const isCustomFilenameFormat = () => isFilenameEnabled() && settings.filenameDateFormat === "custom";

    return [
      {
        type: "group",
        heading: t(settings, "sectionGeneral"),
        cls: "calendar-of-notes-settings-group",
        items: [
          {
            name: t(settings, "settingsLanguage"),
            desc: t(settings, "settingsLanguageDesc"),
            control: {
              type: "dropdown",
              key: "language",
              defaultValue: "auto",
              options: { auto: t(settings, "auto"), en: t(settings, "english"), ko: t(settings, "korean") }
            }
          },
          {
            name: t(settings, "settingsDefaultView"),
            control: {
              type: "dropdown",
              key: "defaultView",
              defaultValue: "month",
              options: { month: t(settings, "monthView"), week: t(settings, "weekView"), year: t(settings, "yearView") }
            }
          },
          {
            name: t(settings, "settingsStartup"),
            control: {
              type: "dropdown",
              key: "startupDate",
              defaultValue: "today",
              options: { today: t(settings, "today"), "last-viewed": t(settings, "lastViewed") }
            }
          }
        ]
      },
      {
        type: "group",
        heading: t(settings, "sectionMatching"),
        cls: "calendar-of-notes-settings-group",
        items: [
          {
            name: t(settings, "settingsDateSource"),
            desc: t(settings, "settingsDateSourceDesc"),
            control: {
              type: "dropdown",
              key: "dateSource",
              defaultValue: "property-first",
              options: {
                "property-first": t(settings, "propertyFirst"),
                filename: t(settings, "filenameOnly"),
                property: t(settings, "propertyOnly"),
                both: t(settings, "both")
              }
            }
          },
          {
            name: t(settings, "settingsProperties"),
            desc: t(settings, "settingsPropertiesDesc"),
            visible: isPropertyEnabled,
            control: {
              type: "textarea",
              key: "propertyNames",
              defaultValue: "date",
              placeholder: "date\ncreated\npublished",
              rows: 3
            }
          },
          {
            name: t(settings, "settingsFilenameFormat"),
            desc: t(settings, "settingsFilenameFormatDesc"),
            visible: isFilenameEnabled,
            control: {
              type: "dropdown",
              key: "filenameDateFormat",
              defaultValue: "yyyy-mm-dd",
              options: {
                "yyyy-mm-dd": "YYYY-MM-DD",
                "yyyy.mm.dd": "YYYY.MM.DD",
                "yyyy_mm_dd": "YYYY_MM_DD",
                yyyymmdd: "YYYYMMDD",
                custom: t(settings, "dateCustom")
              }
            }
          },
          {
            name: t(settings, "settingsFilenameLocation"),
            desc: `${t(settings, "settingsFilenameLocationDesc")} ${t(settings, "example")}: ${filenameExample(settings.filenameDateFormat, settings.filenameDateLocation)}`,
            visible: isBuiltInFilenameFormat,
            control: {
              type: "dropdown",
              key: "filenameDateLocation",
              defaultValue: "start",
              options: {
                start: t(settings, "dateAtStart"),
                anywhere: t(settings, "dateAnywhere"),
                entire: t(settings, "dateEntireName")
              }
            }
          },
          {
            name: t(settings, "settingsPattern"),
            desc: t(settings, "settingsPatternDesc"),
            visible: isCustomFilenameFormat,
            control: {
              type: "textarea",
              key: "filenamePattern",
              defaultValue: "^(?<date>\\d{4}-\\d{2}-\\d{2})(?:\\s|$)",
              rows: 2,
              validate: (value) => {
                try {
                  new RegExp(value);
                  return undefined;
                } catch {
                  return t(settings, "invalidPattern");
                }
              }
            }
          }
        ]
      },
      {
        type: "group",
        heading: t(settings, "sectionFilters"),
        cls: "calendar-of-notes-settings-group",
        items: [
          listSetting(settings, "settingsIncluded", "settingsIncludedDesc", "includedFolders", "Journal\nProjects"),
          listSetting(settings, "settingsExcluded", "settingsExcludedDesc", "excludedFolders", "Templates\nArchive"),
          listSetting(settings, "settingsIncludedTags", "settingsIncludedTagsDesc", "includedTags", "project\ncalendar"),
          listSetting(settings, "settingsExcludedTags", "settingsExcludedTagsDesc", "excludedTags", "archive\nprivate")
        ]
      },
      {
        type: "group",
        heading: t(settings, "sectionBehavior"),
        cls: "calendar-of-notes-settings-group",
        items: [
          {
            name: t(settings, "settingsClick"),
            control: {
              type: "dropdown",
              key: "clickBehavior",
              defaultValue: "smart",
              options: { smart: t(settings, "smart"), list: t(settings, "alwaysList"), select: t(settings, "selectOnly") }
            }
          },
          {
            name: t(settings, "settingsList"),
            control: {
              type: "dropdown",
              key: "listDisplay",
              defaultValue: "popup",
              options: { below: t(settings, "below"), popup: t(settings, "popup"), hidden: t(settings, "hidden") }
            }
          },
          {
            name: t(settings, "settingsSort"),
            control: {
              type: "dropdown",
              key: "noteSort",
              defaultValue: "name",
              options: { name: t(settings, "name"), modified: t(settings, "modified"), created: t(settings, "created"), path: t(settings, "path") }
            }
          },
          {
            name: t(settings, "settingsOpenLocation"),
            desc: t(settings, "settingsOpenLocationDesc"),
            control: {
              type: "dropdown",
              key: "openLocation",
              defaultValue: "current",
              options: {
                current: t(settings, "openCurrent"),
                tab: t(settings, "openTab"),
                split: t(settings, "openSplit")
              }
            }
          }
        ]
      },
      {
        type: "group",
        heading: t(settings, "sectionDisplay"),
        cls: "calendar-of-notes-settings-group",
        items: [
          {
            name: t(settings, "settingsWeekStart"),
            control: {
              type: "dropdown",
              key: "weekStart",
              defaultValue: "locale",
              options: { locale: t(settings, "localeDefault"), sunday: t(settings, "sunday"), monday: t(settings, "monday") }
            }
          },
          {
            name: t(settings, "settingsAdjacent"),
            control: { type: "toggle", key: "showAdjacentMonthDays", defaultValue: true }
          },
          {
            name: t(settings, "settingsPaths"),
            control: { type: "toggle", key: "showNotePaths", defaultValue: false }
          }
        ]
      }
    ];
  }

  getControlValue(key: string): unknown {
    const settingKey = key as SettingKey;
    const value = this.plugin.settings[settingKey];
    return Array.isArray(value) ? value.join("\n") : value;
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    const settingKey = key as SettingKey;
    const nextValue = isListSetting(settingKey) ? splitLines(typeof value === "string" ? value : "") : value;
    const changes = { [settingKey]: nextValue } as Partial<CalendarOfNotesSettings>;
    const rebuildIndex = INDEX_SETTING_KEYS.has(settingKey);

    if (rebuildIndex) this.plugin.scheduleSettingsUpdate(changes, true);
    else await this.plugin.updateSettings(changes, false);

    if (settingKey === "language" || settingKey === "dateSource" || settingKey === "filenameDateFormat" || settingKey === "filenameDateLocation") {
      if (requireApiVersion("1.13.0")) this.update();
      else this.renderLegacySettings();
    } else if (requireApiVersion("1.13.0")) {
      this.refreshDomState();
    }
  }

  private renderLegacySettings(): void {
    this.containerEl.empty();
    this.containerEl.addClass("calendar-of-notes-settings");

    for (const item of this.getSettingDefinitions()) {
      if (!("type" in item) || item.type !== "group" || !isVisible(item.visible)) continue;
      if (item.heading) {
        const heading = new Setting(this.containerEl).setName(item.heading).setHeading();
        heading.settingEl.addClass("calendar-of-notes-settings-section");
      }
      for (const definition of item.items ?? []) {
        if (("type" in definition && definition.type === "page") ||
            !isVisible(definition.visible) || !("control" in definition) || !definition.control) continue;
        this.renderLegacyControl(definition);
      }
    }
  }

  private renderLegacyControl(definition: SettingDefinition<SettingKey>): void {
    if (!("control" in definition) || !definition.control) return;
    const control = definition.control;
    const row = new Setting(this.containerEl).setName(definition.name);
    if (definition.desc) row.setDesc(definition.desc);
    const value = this.getControlValue(control.key);

    if (control.type === "dropdown") {
      row.addDropdown((dropdown) => dropdown
        .addOptions(control.options)
        .setValue(typeof value === "string" ? value : String(control.defaultValue ?? ""))
        .onChange((next) => this.setControlValue(control.key, next)));
      return;
    }
    if (control.type === "toggle") {
      row.addToggle((toggle) => toggle
        .setValue(typeof value === "boolean" ? value : control.defaultValue ?? false)
        .onChange((next) => this.setControlValue(control.key, next)));
      return;
    }
    if (control.type === "textarea") {
      row.addTextArea((text) => {
        text.setValue(typeof value === "string" ? value : control.defaultValue ?? "");
        if (control.placeholder) text.setPlaceholder(control.placeholder);
        if (control.rows) text.inputEl.rows = control.rows;
        text.onChange(async (next) => {
          const error = await control.validate?.(next);
          if (error) {
            new Notice(error);
            return;
          }
          await this.setControlValue(control.key, next);
        });
      });
      return;
    }
    if (control.type === "text") {
      row.addText((text) => {
        text.setValue(typeof value === "string" ? value : control.defaultValue ?? "");
        if (control.placeholder) text.setPlaceholder(control.placeholder);
        text.onChange(async (next) => {
          const error = await control.validate?.(next);
          if (error) {
            new Notice(error);
            return;
          }
          await this.setControlValue(control.key, next);
        });
      });
    }
  }
}

function listSetting(
  settings: CalendarOfNotesSettings,
  nameKey: "settingsIncluded" | "settingsExcluded" | "settingsIncludedTags" | "settingsExcludedTags",
  descKey: "settingsIncludedDesc" | "settingsExcludedDesc" | "settingsIncludedTagsDesc" | "settingsExcludedTagsDesc",
  key: "includedFolders" | "excludedFolders" | "includedTags" | "excludedTags",
  placeholder: string
): SettingDefinition<SettingKey> {
  return {
    name: t(settings, nameKey),
    desc: t(settings, descKey),
    control: { type: "textarea", key, defaultValue: "", placeholder, rows: 3 }
  };
}

function isListSetting(key: SettingKey): key is "propertyNames" | "includedFolders" | "excludedFolders" | "includedTags" | "excludedTags" {
  return ["propertyNames", "includedFolders", "excludedFolders", "includedTags", "excludedTags"].includes(key);
}

function splitLines(value: string): string[] {
  return [...new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))];
}

function filenameExample(format: FilenameDateFormat, location: FilenameDateLocation): string {
  const date = {
    "yyyy-mm-dd": "2026-07-30",
    "yyyy.mm.dd": "2026.07.30",
    "yyyy_mm_dd": "2026_07_30",
    yyyymmdd: "20260730",
    custom: "2026-07-30"
  }[format];
  if (location === "start") return `${date} Note title`;
  if (location === "anywhere") return `Meeting ${date} notes`;
  return date;
}

function isVisible(value: boolean | (() => boolean) | undefined): boolean {
  return typeof value === "function" ? value() : value !== false;
}
