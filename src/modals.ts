import { Modal, Notice, Setting, TFile, type App } from "obsidian";
import { daysInMonth, formatDateInput, parseCalendarDate, parseIsoDate, toIsoDate } from "./date-utils";
import { intlLocale, t } from "./i18n";
import { resolveLeafOpenTarget } from "./open-location";
import type { CalendarOfNotesSettings, NoteEntry } from "./types";

export class NoteListModal extends Modal {
  constructor(
    app: App,
    private readonly settings: CalendarOfNotesSettings,
    private readonly date: string,
    private readonly entries: NoteEntry[]
  ) {
    super(app);
  }

  onOpen(): void {
    this.modalEl.addClass("calendar-of-notes-list-modal");
    this.titleEl.setText(formatLongDate(this.date, this.settings));
    renderNoteList(this.contentEl, this.app, this.settings, this.entries, () => this.close());
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export class JumpToDateModal extends Modal {
  constructor(
    app: App,
    private readonly settings: CalendarOfNotesSettings,
    private readonly initialDate: string,
    private readonly onChoose: (date: string) => void
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText(t(this.settings, "jumpToDate"));
    let value = this.initialDate;
    let input: HTMLInputElement | null = null;
    const setting = new Setting(this.contentEl)
      .setName(t(this.settings, "jumpToDate"))
      .addText((text) => {
        input = text.inputEl;
        text.setPlaceholder("YYYY-MM-DD").setValue(value).onChange((next) => {
          const formatted = formatDateInput(next);
          value = formatted;
          if (formatted !== next) {
            text.setValue(formatted);
            window.setTimeout(() => text.inputEl.setSelectionRange(formatted.length, formatted.length));
          }
        });
        text.inputEl.type = "text";
        text.inputEl.inputMode = "numeric";
        text.inputEl.autocomplete = "off";
        text.inputEl.maxLength = 10;
        text.inputEl.addEventListener("keydown", (event) => {
          if (event.key === "Enter") this.submit(value);
        });
      });
    setting.addButton((button) => button.setButtonText(t(this.settings, "go")).setCta().onClick(() => this.submit(value)));
    window.setTimeout(() => {
      input?.focus();
      input?.select();
    });
  }

  private submit(value: string): void {
    const parsed = parseIsoDate(value);
    if (!parsed) {
      new Notice(t(this.settings, "invalidDate"));
      return;
    }
    this.close();
    this.onChoose(parsed);
  }
}

export class PeriodPickerModal extends Modal {
  private year: number;
  private showYears = false;

  constructor(
    app: App,
    private readonly settings: CalendarOfNotesSettings,
    initialYear: number,
    private readonly onChooseMonth: (year: number, month: number) => void
  ) {
    super(app);
    this.year = initialYear;
  }

  onOpen(): void {
    this.modalEl.addClass("calendar-of-notes-period-modal");
    this.render();
  }

  private render(): void {
    this.contentEl.empty();
    this.titleEl.setText(this.showYears ? t(this.settings, "chooseYear") : t(this.settings, "chooseMonth"));
    const navigation = this.contentEl.createDiv("calendar-of-notes-picker-nav");
    const previous = navigation.createEl("button", { text: "‹", attr: { "aria-label": t(this.settings, "previous") } });
    const title = navigation.createEl("button", { text: String(this.year) });
    const next = navigation.createEl("button", { text: "›", attr: { "aria-label": t(this.settings, "next") } });
    previous.onclick = () => { this.year += this.showYears ? -12 : -1; this.render(); };
    next.onclick = () => { this.year += this.showYears ? 12 : 1; this.render(); };
    title.onclick = () => { this.showYears = !this.showYears; this.render(); };

    const grid = this.contentEl.createDiv("calendar-of-notes-picker-grid");
    if (this.showYears) {
      const start = this.year - 5;
      for (let year = start; year < start + 12; year += 1) {
        const button = grid.createEl("button", { text: String(year) });
        if (year === this.year) button.addClass("is-selected");
        button.onclick = () => { this.year = year; this.showYears = false; this.render(); };
      }
      return;
    }

    const locale = intlLocale(this.settings);
    for (let month = 1; month <= 12; month += 1) {
      const label = new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(this.year, month - 1, 1));
      const button = grid.createEl("button", { text: label });
      button.onclick = () => {
        this.close();
        this.onChooseMonth(this.year, month);
      };
    }
  }
}

export function renderNoteList(
  container: HTMLElement,
  app: App,
  settings: CalendarOfNotesSettings,
  entries: NoteEntry[],
  afterOpen?: () => void
): void {
  container.empty();
  if (entries.length === 0) {
    container.createDiv({ cls: "calendar-of-notes-empty", text: t(settings, "noNotes") });
    return;
  }
  const list = container.createEl("ul", { cls: "calendar-of-notes-note-list" });
  for (const entry of entries) {
    const item = list.createEl("li");
    const button = item.createEl("button", { cls: "calendar-of-notes-note-link" });
    button.createSpan({ cls: "calendar-of-notes-note-name", text: entry.file.basename });
    if (settings.showNotePaths) button.createSpan({ cls: "calendar-of-notes-note-path", text: parentPath(entry.file) });
    button.onclick = (event) => {
      openNote(app, settings, entry.file, event.metaKey || event.ctrlKey);
      afterOpen?.();
    };
  }
}

export function openNote(
  app: App,
  settings: CalendarOfNotesSettings,
  file: TFile,
  forceNewTab = false
): void {
  void app.workspace.getLeaf(resolveLeafOpenTarget(settings.openLocation, forceNewTab)).openFile(file);
}

export function formatLongDate(iso: string, settings: CalendarOfNotesSettings): string {
  const parsed = parseCalendarDate(iso);
  if (!parsed) return iso;
  const date = new Date(parsed.year, parsed.month - 1, parsed.day, 12);
  return new Intl.DateTimeFormat(intlLocale(settings), {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function parentPath(file: TFile): string {
  const slash = file.path.lastIndexOf("/");
  return slash < 0 ? "/" : file.path.slice(0, slash);
}

export function clampDay(year: number, month: number, day: number): string {
  return toIsoDate({ year, month, day: Math.min(day, daysInMonth(year, month)) });
}
