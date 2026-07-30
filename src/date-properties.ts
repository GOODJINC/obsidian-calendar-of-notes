import { parseIsoDate } from "./date-utils";

export function extractPropertyDates(
  frontmatter: Record<string, unknown> | undefined,
  propertyNames: string[]
): Set<string> {
  const dates = new Set<string>();
  if (!frontmatter) return dates;

  for (const rawName of propertyNames) {
    const propertyName = rawName.trim();
    if (!propertyName) continue;
    const value = frontmatter[propertyName];
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      const date = parseIsoDate(item);
      if (date) dates.add(date);
    }
  }
  return dates;
}
