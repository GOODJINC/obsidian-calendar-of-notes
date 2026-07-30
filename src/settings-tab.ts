import { Notice, PluginSettingTab, Setting, type App } from "obsidian";
import { t, type MessageKey } from "./i18n";
import type CalendarOfNotesPlugin from "../main";
import type { FilenameDateFormat, FilenameDateLocation } from "./types";

export class CalendarOfNotesSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: CalendarOfNotesPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.settings;
    containerEl.empty();
    containerEl.addClass("calendar-of-notes-settings");

    this.addSection("sectionGeneral", "sectionGeneralDesc");

    new Setting(containerEl)
      .setName(t(settings, "settingsLanguage"))
      .setDesc(t(settings, "settingsLanguageDesc"))
      .addDropdown((dropdown) => dropdown
        .addOptions({ auto: t(settings, "auto"), en: t(settings, "english"), ko: t(settings, "korean") })
        .setValue(settings.language)
        .onChange(async (value) => {
          await this.plugin.updateSettings({ language: value as typeof settings.language }, false);
          this.display();
        }));

    new Setting(containerEl)
      .setName(t(settings, "settingsDefaultView"))
      .addDropdown((dropdown) => dropdown
        .addOptions({ month: t(settings, "monthView"), week: t(settings, "weekView"), year: t(settings, "yearView") })
        .setValue(settings.defaultView)
        .onChange((value) => this.plugin.updateSettings({ defaultView: value as typeof settings.defaultView }, false)));

    new Setting(containerEl)
      .setName(t(settings, "settingsStartup"))
      .addDropdown((dropdown) => dropdown
        .addOptions({ today: t(settings, "today"), "last-viewed": t(settings, "lastViewed") })
        .setValue(settings.startupDate)
        .onChange((value) => this.plugin.updateSettings({ startupDate: value as typeof settings.startupDate }, false)));

    this.addSection("sectionMatching", "sectionMatchingDesc");

    new Setting(containerEl)
      .setName(t(settings, "settingsDateSource"))
      .setDesc(t(settings, "settingsDateSourceDesc"))
      .addDropdown((dropdown) => dropdown
        .addOptions({
          "property-first": t(settings, "propertyFirst"),
          filename: t(settings, "filenameOnly"),
          property: t(settings, "propertyOnly"),
          both: t(settings, "both")
        })
        .setValue(settings.dateSource)
        .onChange(async (value) => {
          await this.plugin.updateSettings({ dateSource: value as typeof settings.dateSource }, true);
          this.display();
        }));

    if (settings.dateSource !== "filename") {
      new Setting(containerEl)
        .setName(t(settings, "settingsProperties"))
        .setDesc(t(settings, "settingsPropertiesDesc"))
        .addTextArea((text) => {
          text.setPlaceholder("date\ncreated\npublished");
          text.setValue(settings.propertyNames.join("\n"));
          text.inputEl.rows = 3;
          text.onChange((value) => this.plugin.scheduleSettingsUpdate({
            propertyNames: splitLines(value)
          }, true));
        });
    }

    if (settings.dateSource !== "property") {
      new Setting(containerEl)
        .setName(t(settings, "settingsFilenameFormat"))
        .setDesc(t(settings, "settingsFilenameFormatDesc"))
        .addDropdown((dropdown) => dropdown
          .addOptions({
            "yyyy-mm-dd": "YYYY-MM-DD",
            "yyyy.mm.dd": "YYYY.MM.DD",
            "yyyy_mm_dd": "YYYY_MM_DD",
            yyyymmdd: "YYYYMMDD",
            custom: t(settings, "dateCustom")
          })
          .setValue(settings.filenameDateFormat)
          .onChange(async (value) => {
            await this.plugin.updateSettings({ filenameDateFormat: value as FilenameDateFormat }, true);
            this.display();
          }));
    }

    if (settings.dateSource !== "property" && settings.filenameDateFormat !== "custom") {
      new Setting(containerEl)
        .setName(t(settings, "settingsFilenameLocation"))
        .setDesc(`${t(settings, "settingsFilenameLocationDesc")} ${t(settings, "example")}: ${filenameExample(settings.filenameDateFormat, settings.filenameDateLocation)}`)
        .addDropdown((dropdown) => dropdown
          .addOptions({
            start: t(settings, "dateAtStart"),
            anywhere: t(settings, "dateAnywhere"),
            entire: t(settings, "dateEntireName")
          })
          .setValue(settings.filenameDateLocation)
          .onChange(async (value) => {
            await this.plugin.updateSettings({ filenameDateLocation: value as FilenameDateLocation }, true);
            this.display();
          }));
    }

    if (settings.dateSource !== "property" && settings.filenameDateFormat === "custom") {
      new Setting(containerEl)
        .setName(t(settings, "settingsPattern"))
        .setDesc(t(settings, "settingsPatternDesc"))
        .addTextArea((text) => {
          text.setValue(settings.filenamePattern);
          text.inputEl.rows = 2;
          text.inputEl.addClass("calendar-of-notes-pattern-input");
          text.onChange((value) => {
            try {
              new RegExp(value);
              text.inputEl.removeClass("is-invalid");
              this.plugin.scheduleSettingsUpdate({ filenamePattern: value }, true);
            } catch {
              text.inputEl.addClass("is-invalid");
              new Notice(t(settings, "invalidPattern"));
            }
          });
        });
    }

    this.addSection("sectionFilters", "sectionFiltersDesc");

    new Setting(containerEl)
      .setName(t(settings, "settingsIncluded"))
      .setDesc(t(settings, "settingsIncludedDesc"))
      .addTextArea((text) => {
        text.setValue(settings.includedFolders.join("\n"));
        text.inputEl.rows = 3;
        text.onChange((value) => this.plugin.scheduleSettingsUpdate({ includedFolders: splitLines(value) }, true));
      });

    new Setting(containerEl)
      .setName(t(settings, "settingsExcluded"))
      .setDesc(t(settings, "settingsExcludedDesc"))
      .addTextArea((text) => {
        text.setValue(settings.excludedFolders.join("\n"));
        text.inputEl.rows = 4;
        text.onChange((value) => this.plugin.scheduleSettingsUpdate({
          excludedFolders: splitLines(value)
        }, true));
      });

    new Setting(containerEl)
      .setName(t(settings, "settingsIncludedTags"))
      .setDesc(t(settings, "settingsIncludedTagsDesc"))
      .addTextArea((text) => {
        text.setPlaceholder("project\ncalendar");
        text.setValue(settings.includedTags.join("\n"));
        text.inputEl.rows = 3;
        text.onChange((value) => this.plugin.scheduleSettingsUpdate({ includedTags: splitLines(value) }, true));
      });

    new Setting(containerEl)
      .setName(t(settings, "settingsExcludedTags"))
      .setDesc(t(settings, "settingsExcludedTagsDesc"))
      .addTextArea((text) => {
        text.setPlaceholder("archive\nprivate");
        text.setValue(settings.excludedTags.join("\n"));
        text.inputEl.rows = 3;
        text.onChange((value) => this.plugin.scheduleSettingsUpdate({ excludedTags: splitLines(value) }, true));
      });

    this.addSection("sectionBehavior", "sectionBehaviorDesc");

    new Setting(containerEl)
      .setName(t(settings, "settingsClick"))
      .addDropdown((dropdown) => dropdown
        .addOptions({ smart: t(settings, "smart"), list: t(settings, "alwaysList"), select: t(settings, "selectOnly") })
        .setValue(settings.clickBehavior)
        .onChange((value) => this.plugin.updateSettings({ clickBehavior: value as typeof settings.clickBehavior }, false)));

    new Setting(containerEl)
      .setName(t(settings, "settingsList"))
      .addDropdown((dropdown) => dropdown
        .addOptions({ below: t(settings, "below"), popup: t(settings, "popup"), hidden: t(settings, "hidden") })
        .setValue(settings.listDisplay)
        .onChange((value) => this.plugin.updateSettings({ listDisplay: value as typeof settings.listDisplay }, false)));

    new Setting(containerEl)
      .setName(t(settings, "settingsSort"))
      .addDropdown((dropdown) => dropdown
        .addOptions({ name: t(settings, "name"), modified: t(settings, "modified"), created: t(settings, "created"), path: t(settings, "path") })
        .setValue(settings.noteSort)
        .onChange((value) => this.plugin.updateSettings({ noteSort: value as typeof settings.noteSort }, false)));

    new Setting(containerEl)
      .setName(t(settings, "settingsOpenLocation"))
      .setDesc(t(settings, "settingsOpenLocationDesc"))
      .addDropdown((dropdown) => dropdown
        .addOptions({
          current: t(settings, "openCurrent"),
          tab: t(settings, "openTab"),
          split: t(settings, "openSplit")
        })
        .setValue(settings.openLocation)
        .onChange((value) => this.plugin.updateSettings({ openLocation: value as typeof settings.openLocation }, false)));

    this.addSection("sectionDisplay", "sectionDisplayDesc");

    new Setting(containerEl)
      .setName(t(settings, "settingsWeekStart"))
      .addDropdown((dropdown) => dropdown
        .addOptions({ locale: t(settings, "localeDefault"), sunday: t(settings, "sunday"), monday: t(settings, "monday") })
        .setValue(settings.weekStart)
        .onChange((value) => this.plugin.updateSettings({ weekStart: value as typeof settings.weekStart }, false)));

    new Setting(containerEl)
      .setName(t(settings, "settingsAdjacent"))
      .addToggle((toggle) => toggle
        .setValue(settings.showAdjacentMonthDays)
        .onChange((value) => this.plugin.updateSettings({ showAdjacentMonthDays: value }, false)));

    new Setting(containerEl)
      .setName(t(settings, "settingsPaths"))
      .addToggle((toggle) => toggle
        .setValue(settings.showNotePaths)
        .onChange((value) => this.plugin.updateSettings({ showNotePaths: value }, false)));
  }

  private addSection(titleKey: MessageKey, descriptionKey: MessageKey): void {
    const heading = new Setting(this.containerEl)
      .setName(t(this.plugin.settings, titleKey))
      .setDesc(t(this.plugin.settings, descriptionKey))
      .setHeading();
    heading.settingEl.addClass("calendar-of-notes-settings-section");
  }
}

function splitLines(value: string): string[] {
  return [...new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))];
}

function filenameExample(format: Exclude<FilenameDateFormat, "custom">, location: FilenameDateLocation): string {
  const date = {
    "yyyy-mm-dd": "2026-07-30",
    "yyyy.mm.dd": "2026.07.30",
    "yyyy_mm_dd": "2026_07_30",
    yyyymmdd: "20260730"
  }[format];
  if (location === "start") return `${date} Note title`;
  if (location === "anywhere") return `Meeting ${date} notes`;
  return date;
}
