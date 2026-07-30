import { Notice, PluginSettingTab, Setting, type App } from "obsidian";
import { t, type MessageKey } from "./i18n";
import type CalendarOfNotesPlugin from "../main";
import type { FilenameDateLocation } from "./types";

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
        .setName(t(settings, "settingsProperty"))
        .setDesc(t(settings, "settingsPropertyDesc"))
        .addText((text) => text
          .setPlaceholder("date")
          .setValue(settings.propertyName)
          .onChange((value) => this.plugin.scheduleSettingsUpdate({ propertyName: value.trim() }, true)));
    }

    if (settings.dateSource !== "property") {
      const examples: Record<FilenameDateLocation, string> = {
        start: "2026-07-30 Note title",
        anywhere: "Meeting notes 2026-07-30",
        entire: "2026-07-30",
        custom: "^(?<date>\\d{4}-\\d{2}-\\d{2})"
      };
      new Setting(containerEl)
        .setName(t(settings, "settingsFilenameLocation"))
        .setDesc(`${t(settings, "settingsFilenameLocationDesc")} ${t(settings, "example")}: ${examples[settings.filenameDateLocation]}`)
        .addDropdown((dropdown) => dropdown
          .addOptions({
            start: t(settings, "dateAtStart"),
            anywhere: t(settings, "dateAnywhere"),
            entire: t(settings, "dateEntireName"),
            custom: t(settings, "dateCustom")
          })
          .setValue(settings.filenameDateLocation)
          .onChange(async (value) => {
            await this.plugin.updateSettings({ filenameDateLocation: value as FilenameDateLocation }, true);
            this.display();
          }));
    }

    if (settings.dateSource !== "property" && settings.filenameDateLocation === "custom") {
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

    new Setting(containerEl)
      .setName(t(settings, "settingsExcluded"))
      .setDesc(t(settings, "settingsExcludedDesc"))
      .addTextArea((text) => {
        text.setValue(settings.excludedFolders.join("\n"));
        text.inputEl.rows = 4;
        text.onChange((value) => this.plugin.scheduleSettingsUpdate({
          excludedFolders: value.split(/\r?\n/).map((folder) => folder.trim()).filter(Boolean)
        }, true));
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
