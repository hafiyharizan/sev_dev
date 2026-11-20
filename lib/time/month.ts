// All date math is on YYYY-MM-DD strings via UTC Dates, so the machine's timezone never matters.

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const parse = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
};

/** weekday 0=Sunday; nth is 1-5 (the 2nd Wednesday -> nth 2). */
export function weekdayPosition(date: string): { weekday: number; nth: number } {
  const { d, weekday } = parse(date);
  return { weekday, nth: Math.ceil(d / 7) };
}

/** `month` is 1-12. Returns null when that month has no such week (e.g. a 5th Sunday). */
export function dateForPosition(year: number, month: number, weekday: number, nth: number): string | null {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + 7 * (nth - 1);
  return day > daysIn(year, month) ? null : fmt(year, month, day);
}

export function copyMonthDates<T extends { date: string }>(
  src: T[],
  year: number,
  month: number,
): { mapped: (T & { newDate: string })[]; skipped: T[] } {
  const mapped: (T & { newDate: string })[] = [];
  const skipped: T[] = [];
  for (const item of src) {
    const { weekday, nth } = weekdayPosition(item.date);
    const newDate = dateForPosition(year, month, weekday, nth);
    if (newDate) mapped.push({ ...item, newDate });
    else skipped.push(item);
  }
  return { mapped, skipped };
}

export function weekdaysInMonth(year: number, month: number, weekday: number): string[] {
  const out: string[] = [];
  for (let d = 1; d <= daysIn(year, month); d++) {
    if (new Date(Date.UTC(year, month - 1, d)).getUTCDay() === weekday) out.push(fmt(year, month, d));
  }
  return out;
}

/** Monday-first weeks; days outside the month are null. */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const lead = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysIn(year, month); d++) cells.push(fmt(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
