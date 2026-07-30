import { ItemView, setIcon, type WorkspaceLeaf } from "obsidian";
import {
  addDays,
  addMonths,
  dateToLocalDate,
  dayOfWeek,
  parseCalendarDate,
  startOfWeek,
  todayIso,
  toIsoDate
} from "./date-utils";
import { intlLocale, t } from "./i18n";
import { JumpToDateModal, NoteListModal, PeriodPickerModal, clampDay, formatLongDate, renderNoteList } from "./modals";
import type { NoteDateIndex } from "./note-index";
import type { CalendarOfNotesSettings, CalendarViewMode } from "./types";

export const CALENDAR_VIEW_TYPE = "calendar-of-notes-view";

export interface CalendarViewHost {
  settings: CalendarOfNotesSettings;
  index: NoteDateIndex;
  rememberDate(date: string): void;
}

interface ViewState extends Record<string, unknown> {
  anchor?: string;
  selected?: string;
  mode?: CalendarViewMode;
}

export class CalendarOfNotesView extends ItemView {
  private anchor = todayIso();
  private selected = todayIso();
  private mode: CalendarViewMode;
  private bodyEl: HTMLElement | null = null;
  private listEl: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, private readonly host: CalendarViewHost) {
    super(leaf);
    const remembered = host.settings.startupDate === "last-viewed" ? host.settings.lastViewedDate : null;
    this.anchor = remembered ?? todayIso();
    this.selected = this.anchor;
    this.mode = host.settings.defaultView;
  }

  getViewType(): string { return CALENDAR_VIEW_TYPE; }
  getDisplayText(): string { return t(this.host.settings, "viewName"); }
  getIcon(): string { return "calendar-days"; }

  async onOpen(): Promise<void> {
    this.contentEl.addClass("calendar-of-notes-view");
    this.registerEvent(this.host.index.on("changed", () => this.render()));
    this.render();
  }

  getState(): ViewState {
    return { anchor: this.anchor, selected: this.selected, mode: this.mode };
  }

  async setState(state: ViewState): Promise<void> {
    if (state.anchor && parseCalendarDate(state.anchor)) this.anchor = state.anchor;
    if (state.selected && parseCalendarDate(state.selected)) this.selected = state.selected;
    if (state.mode && ["month", "week", "year"].includes(state.mode)) this.mode = state.mode;
    this.render();
  }

  refresh(): void { this.render(); }

  goToDate(date: string): void {
    if (!parseCalendarDate(date)) return;
    this.anchor = date;
    this.selected = date;
    this.host.rememberDate(date);
    this.render();
  }

  private render(): void {
    const settings = this.host.settings;
    this.contentEl.empty();
    const root = this.contentEl.createDiv("calendar-of-notes-root");
    this.renderToolbar(root);
    this.bodyEl = root.createDiv("calendar-of-notes-body");

    if (this.mode === "month") this.renderMonth(this.bodyEl);
    if (this.mode === "week") this.renderWeek(this.bodyEl);
    if (this.mode === "year") this.renderYear(this.bodyEl);

    this.listEl = root.createDiv("calendar-of-notes-list-region");
    if (settings.listDisplay === "below") this.renderSelectedList();
    else this.listEl.hide();
  }

  private renderToolbar(root: HTMLElement): void {
    const settings = this.host.settings;
    const toolbar = root.createDiv("calendar-of-notes-toolbar");
    const previous = this.iconButton(toolbar, "chevron-left", t(settings, "previous"), () => this.navigate(-1));
    previous.addClass("calendar-of-notes-nav-button");
    const title = toolbar.createEl("button", { cls: "calendar-of-notes-title", text: this.periodTitle() });
    title.onclick = () => this.openPeriodPicker();
    const next = this.iconButton(toolbar, "chevron-right", t(settings, "next"), () => this.navigate(1));
    next.addClass("calendar-of-notes-nav-button");

    const actions = root.createDiv("calendar-of-notes-actions");
    const modes = actions.createDiv("calendar-of-notes-view-switcher");
    this.modeButton(modes, "M", "month", t(settings, "monthView"));
    this.modeButton(modes, "W", "week", t(settings, "weekView"));
    this.modeButton(modes, "Y", "year", t(settings, "yearView"));
    this.iconButton(actions, "locate-fixed", t(settings, "today"), () => this.goToDate(todayIso()));
    this.iconButton(actions, "calendar-search", t(settings, "jumpToDate"), () => {
      new JumpToDateModal(this.app, settings, this.selected, (date) => this.goToDate(date)).open();
    });
  }

  private renderMonth(container: HTMLElement): void {
    const parsed = parseCalendarDate(this.anchor);
    if (!parsed) return;
    const start = this.weekStart();
    this.renderWeekdayHeader(container, start, false);
    const offset = (dayOfWeek(parsed.year, parsed.month, 1) - start + 7) % 7;
    const firstCell = addDays(toIsoDate({ year: parsed.year, month: parsed.month, day: 1 }), -offset);
    const grid = container.createDiv("calendar-of-notes-month-grid");
    grid.setAttribute("role", "grid");
    for (let index = 0; index < 42; index += 1) {
      const date = addDays(firstCell, index);
      const cellDate = parseCalendarDate(date);
      if (!cellDate) continue;
      const adjacent = cellDate.month !== parsed.month;
      this.renderDayCell(grid, date, { adjacent, compact: false });
    }
  }

  private renderWeek(container: HTMLElement): void {
    const first = startOfWeek(this.anchor, this.weekStart());
    const grid = container.createDiv("calendar-of-notes-week-grid");
    for (let index = 0; index < 7; index += 1) {
      const date = addDays(first, index);
      const card = grid.createDiv("calendar-of-notes-week-card");
      const local = dateToLocalDate(date);
      card.createDiv({
        cls: "calendar-of-notes-weekday-name",
        text: new Intl.DateTimeFormat(intlLocale(this.host.settings), { weekday: "short" }).format(local)
      });
      this.renderDayCell(card, date, { adjacent: false, compact: false });
      const preview = card.createDiv("calendar-of-notes-week-preview");
      const entries = this.host.index.get(date).slice(0, 3);
      for (const entry of entries) {
        const button = preview.createEl("button", { text: entry.file.basename });
        button.onclick = () => void this.app.workspace.getLeaf(false).openFile(entry.file);
      }
      const remaining = this.host.index.count(date) - entries.length;
      if (remaining > 0) preview.createDiv({ cls: "calendar-of-notes-more", text: `+${remaining}` });
    }
  }

  private renderYear(container: HTMLElement): void {
    const parsed = parseCalendarDate(this.anchor);
    if (!parsed) return;
    const yearGrid = container.createDiv("calendar-of-notes-year-grid");
    const start = this.weekStart();
    for (let month = 1; month <= 12; month += 1) {
      const mini = yearGrid.createDiv("calendar-of-notes-mini-month");
      const monthButton = mini.createEl("button", {
        cls: "calendar-of-notes-mini-title",
        text: new Intl.DateTimeFormat(intlLocale(this.host.settings), { month: "short" }).format(new Date(parsed.year, month - 1, 1))
      });
      monthButton.onclick = () => {
        this.anchor = clampDay(parsed.year, month, parsed.day);
        this.mode = "month";
        this.render();
      };
      this.renderWeekdayHeader(mini, start, true);
      const grid = mini.createDiv("calendar-of-notes-mini-grid");
      const offset = (dayOfWeek(parsed.year, month, 1) - start + 7) % 7;
      for (let index = 0; index < offset; index += 1) grid.createSpan("calendar-of-notes-mini-blank");
      const count = new Date(Date.UTC(parsed.year, month, 0)).getUTCDate();
      for (let day = 1; day <= count; day += 1) {
        this.renderDayCell(grid, toIsoDate({ year: parsed.year, month, day }), { adjacent: false, compact: true });
      }
      const trailing = (7 - ((offset + count) % 7)) % 7;
      for (let index = 0; index < trailing; index += 1) grid.createSpan("calendar-of-notes-mini-blank");
    }
  }

  private renderWeekdayHeader(container: HTMLElement, start: number, compact: boolean): void {
    const header = container.createDiv(compact ? "calendar-of-notes-mini-weekdays" : "calendar-of-notes-weekdays");
    const baseSunday = new Date(2024, 0, 7, 12);
    for (let index = 0; index < 7; index += 1) {
      const day = new Date(baseSunday);
      day.setDate(baseSunday.getDate() + ((start + index) % 7));
      const format: Intl.DateTimeFormatOptions = { weekday: compact ? "narrow" : "short" };
      header.createSpan({ text: new Intl.DateTimeFormat(intlLocale(this.host.settings), format).format(day) });
    }
  }

  private renderDayCell(
    container: HTMLElement,
    date: string,
    options: { adjacent: boolean; compact: boolean }
  ): void {
    const parsed = parseCalendarDate(date);
    if (!parsed) return;
    const count = this.host.index.count(date);
    const button = container.createEl("button", {
      cls: options.compact ? "calendar-of-notes-mini-day" : "calendar-of-notes-day",
      attr: {
        "data-date": date,
        "aria-label": `${formatLongDate(date, this.host.settings)}, ${count} ${count === 1 ? t(this.host.settings, "note") : t(this.host.settings, "notes")}`
      }
    });
    button.createSpan({ cls: "calendar-of-notes-day-number", text: String(parsed.day) });
    if (count > 0) this.renderMarkers(button, count, options.compact);
    if (date === todayIso()) button.addClass("is-today");
    if (date === this.selected) button.addClass("is-selected");
    if (options.adjacent) {
      button.addClass("is-adjacent");
      if (!this.host.settings.showAdjacentMonthDays) {
        button.addClass("is-hidden-adjacent");
        button.disabled = true;
      }
    }
    button.onclick = (event) => this.handleDateClick(date, event);
    if (!options.compact) button.onkeydown = (event) => this.handleDayKeydown(event, date);
  }

  private renderMarkers(button: HTMLElement, count: number, compact: boolean): void {
    const marker = button.createSpan("calendar-of-notes-markers");
    if (compact) {
      marker.createSpan("calendar-of-notes-dot");
      return;
    }
    const dots = Math.min(count, 3);
    for (let index = 0; index < dots; index += 1) marker.createSpan("calendar-of-notes-dot");
    if (count > 3) marker.createSpan({ cls: "calendar-of-notes-plus", text: "+" });
  }

  private handleDateClick(date: string, event: MouseEvent): void {
    this.selected = date;
    this.anchor = date;
    this.host.rememberDate(date);
    const entries = this.host.index.get(date);
    const behavior = this.host.settings.clickBehavior;

    if (behavior === "smart" && entries.length === 1) {
      void this.app.workspace.getLeaf(event.metaKey || event.ctrlKey ? "tab" : false).openFile(entries[0].file);
    } else if (behavior === "list" || (behavior === "smart" && entries.length > 1)) {
      this.showList(date);
    }
    this.render();
  }

  private showList(date: string): void {
    const display = this.host.settings.listDisplay;
    if (display === "below") {
      this.renderSelectedList();
      return;
    }
    if (display === "popup" || this.host.settings.clickBehavior === "smart") {
      new NoteListModal(this.app, this.host.settings, date, this.host.index.get(date)).open();
    }
  }

  private renderSelectedList(): void {
    if (!this.listEl) return;
    this.listEl.show();
    this.listEl.empty();
    const entries = this.host.index.get(this.selected);
    const count = entries.length;
    this.listEl.createDiv({
      cls: "calendar-of-notes-list-heading",
      text: `${formatLongDate(this.selected, this.host.settings)} · ${count} ${count === 1 ? t(this.host.settings, "note") : t(this.host.settings, "notes")}`
    });
    const list = this.listEl.createDiv();
    renderNoteList(list, this.app, this.host.settings, entries);
  }

  private handleDayKeydown(event: KeyboardEvent, date: string): void {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const offset = offsets[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const next = addDays(date, offset);
    this.goToDate(next);
    window.setTimeout(() => {
      this.contentEl.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus();
    });
  }

  private navigate(direction: number): void {
    const parsed = parseCalendarDate(this.anchor);
    if (!parsed) return;
    if (this.mode === "week") this.anchor = addDays(this.anchor, direction * 7);
    if (this.mode === "month") this.anchor = toIsoDate(addMonths(parsed, direction));
    if (this.mode === "year") this.anchor = clampDay(parsed.year + direction, parsed.month, parsed.day);
    this.render();
  }

  private openPeriodPicker(): void {
    const parsed = parseCalendarDate(this.anchor);
    if (!parsed) return;
    if (this.mode === "week") {
      new JumpToDateModal(this.app, this.host.settings, this.anchor, (date) => this.goToDate(date)).open();
      return;
    }
    new PeriodPickerModal(this.app, this.host.settings, parsed.year, (year, month) => {
      this.anchor = clampDay(year, month, parsed.day);
      this.selected = this.anchor;
      this.mode = "month";
      this.host.rememberDate(this.anchor);
      this.render();
    }).open();
  }

  private periodTitle(): string {
    const locale = intlLocale(this.host.settings);
    const date = dateToLocalDate(this.anchor);
    if (this.mode === "year") return new Intl.DateTimeFormat(locale, { year: "numeric" }).format(date);
    if (this.mode === "week") {
      const first = startOfWeek(this.anchor, this.weekStart());
      const last = addDays(first, 6);
      const short = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
      return `${short.format(dateToLocalDate(first))} – ${short.format(dateToLocalDate(last))}`;
    }
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(date);
  }

  private weekStart(): number {
    const setting = this.host.settings.weekStart;
    if (setting === "sunday") return 0;
    if (setting === "monday") return 1;
    return intlLocale(this.host.settings) === "ko-KR" ? 0 : 0;
  }

  private modeButton(container: HTMLElement, label: string, mode: CalendarViewMode, ariaLabel: string): void {
    const button = container.createEl("button", { text: label, attr: { "aria-label": ariaLabel, title: ariaLabel } });
    if (this.mode === mode) button.addClass("is-active");
    button.onclick = () => { this.mode = mode; this.render(); };
  }

  private iconButton(container: HTMLElement, icon: string, label: string, onClick: () => void): HTMLButtonElement {
    const button = container.createEl("button", { attr: { "aria-label": label, title: label } });
    setIcon(button, icon);
    button.onclick = onClick;
    return button;
  }
}
