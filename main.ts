import { Plugin, TFile, type TAbstractFile } from "obsidian";
import { CalendarOfNotesView, CALENDAR_VIEW_TYPE } from "./src/calendar-view";
import { todayIso } from "./src/date-utils";
import { t } from "./src/i18n";
import { NoteDateIndex } from "./src/note-index";
import { migrateSettings } from "./src/settings-migration";
import { CalendarOfNotesSettingTab } from "./src/settings-tab";
import { DEFAULT_SETTINGS, type CalendarOfNotesSettings } from "./src/types";

export default class CalendarOfNotesPlugin extends Plugin {
  settings: CalendarOfNotesSettings = { ...DEFAULT_SETTINGS };
  index = new NoteDateIndex(this.app, () => this.settings);
  private settingsTimer: number | null = null;
  private pendingIndexRebuild = false;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.index = new NoteDateIndex(this.app, () => this.settings);

    this.registerView(CALENDAR_VIEW_TYPE, (leaf) => new CalendarOfNotesView(leaf, this));
    this.addSettingTab(new CalendarOfNotesSettingTab(this.app, this));

    this.addRibbonIcon("calendar-days", t(this.settings, "openCalendar"), () => void this.activateView());
    this.addCommand({
      id: "open-calendar",
      name: t(this.settings, "openCalendar"),
      callback: () => void this.activateView()
    });
    this.addCommand({
      id: "go-to-today",
      name: t(this.settings, "today"),
      callback: () => void this.goToDate(todayIso())
    });

    this.app.workspace.onLayoutReady(() => {
      this.index.rebuild();
      this.registerEvent(this.app.vault.on("create", (file) => this.handleCreate(file)));
      this.registerEvent(this.app.vault.on("delete", (file) => this.handleDelete(file)));
      this.registerEvent(this.app.vault.on("rename", (file, oldPath) => this.handleRename(file, oldPath)));
      this.registerEvent(this.app.metadataCache.on("changed", (file) => this.index.indexFile(file)));
      this.registerEvent(this.app.metadataCache.on("resolved", () => this.index.rebuild()));
    });
  }

  onunload(): void {
    if (this.settingsTimer !== null) window.clearTimeout(this.settingsTimer);
    this.app.workspace.detachLeavesOfType(CALENDAR_VIEW_TYPE);
  }

  async activateView(): Promise<void> {
    let leaf = this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: CALENDAR_VIEW_TYPE, active: true });
    }
    await this.app.workspace.revealLeaf(leaf);
  }

  async goToDate(date: string): Promise<void> {
    await this.activateView();
    const view = this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE)[0]?.view;
    if (view instanceof CalendarOfNotesView) view.goToDate(date);
  }

  rememberDate(date: string): void {
    if (this.settings.lastViewedDate === date) return;
    this.settings.lastViewedDate = date;
    void this.saveData(this.settings);
  }

  async updateSettings(changes: Partial<CalendarOfNotesSettings>, rebuildIndex: boolean): Promise<void> {
    Object.assign(this.settings, changes);
    await this.saveData(this.settings);
    if (rebuildIndex) this.index.rebuild();
    this.refreshViews();
  }

  scheduleSettingsUpdate(changes: Partial<CalendarOfNotesSettings>, rebuildIndex: boolean): void {
    Object.assign(this.settings, changes);
    this.pendingIndexRebuild ||= rebuildIndex;
    if (this.settingsTimer !== null) window.clearTimeout(this.settingsTimer);
    this.settingsTimer = window.setTimeout(() => {
      this.settingsTimer = null;
      void this.saveData(this.settings);
      if (this.pendingIndexRebuild) this.index.rebuild();
      this.pendingIndexRebuild = false;
      this.refreshViews();
    }, 350);
  }

  private async loadSettings(): Promise<void> {
    this.settings = migrateSettings(await this.loadData());
  }

  private refreshViews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE)) {
      if (leaf.view instanceof CalendarOfNotesView) leaf.view.refresh();
    }
  }

  private handleCreate(file: TAbstractFile): void {
    if (file instanceof TFile && file.extension === "md") this.index.indexFile(file);
  }

  private handleDelete(file: TAbstractFile): void {
    if (file instanceof TFile && file.extension === "md") this.index.removeFile(file);
  }

  private handleRename(file: TAbstractFile, oldPath: string): void {
    if (file instanceof TFile && file.extension === "md") this.index.renameFile(file, oldPath);
  }
}
