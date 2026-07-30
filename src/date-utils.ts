export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/;

export function parseIsoDate(value: unknown): string | null {
  if (typeof value === "string") {
    const match = value.trim().match(ISO_DATE_PREFIX);
    if (!match) return null;
    const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    return isValidDate(date) ? toIsoDate(date) : null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toIsoDate({
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate()
    });
  }

  if (typeof value === "object" && value !== null && "format" in value) {
    const formatter = (value as { format?: unknown }).format;
    if (typeof formatter === "function") {
      return parseIsoDate(formatter.call(value, "YYYY-MM-DD"));
    }
  }

  return null;
}

export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const wantsSeparator = value.endsWith("-");
  if (digits.length <= 4) return digits + (digits.length === 4 && wantsSeparator ? "-" : "");
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}${digits.length === 6 && wantsSeparator ? "-" : ""}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function parseCalendarDate(iso: string): CalendarDate | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const result = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return isValidDate(result) ? result : null;
}

export function toIsoDate(date: CalendarDate): string {
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function todayIso(): string {
  const now = new Date();
  return toIsoDate({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
}

export function isValidDate(date: CalendarDate): boolean {
  if (!Number.isInteger(date.year) || date.year < 1 || date.year > 9999) return false;
  if (!Number.isInteger(date.month) || date.month < 1 || date.month > 12) return false;
  return Number.isInteger(date.day) && date.day >= 1 && date.day <= daysInMonth(date.year, date.month);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addDays(iso: string, amount: number): string {
  const date = parseCalendarDate(iso);
  if (!date) return iso;
  const utc = new Date(Date.UTC(date.year, date.month - 1, date.day + amount));
  return toIsoDate({ year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1, day: utc.getUTCDate() });
}

export function addMonths(anchor: CalendarDate, amount: number): CalendarDate {
  const utc = new Date(Date.UTC(anchor.year, anchor.month - 1 + amount, 1));
  const year = utc.getUTCFullYear();
  const month = utc.getUTCMonth() + 1;
  return { year, month, day: Math.min(anchor.day, daysInMonth(year, month)) };
}

export function startOfWeek(iso: string, weekStartsOn: number): string {
  const parsed = parseCalendarDate(iso);
  if (!parsed) return iso;
  const dayOfWeek = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).getUTCDay();
  return addDays(iso, -((dayOfWeek - weekStartsOn + 7) % 7));
}

export function dayOfWeek(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function dateToLocalDate(iso: string): Date {
  const parsed = parseCalendarDate(iso);
  if (!parsed) return new Date();
  return new Date(parsed.year, parsed.month - 1, parsed.day, 12);
}

export function compareIsoDates(left: string, right: string): number {
  return left.localeCompare(right);
}
