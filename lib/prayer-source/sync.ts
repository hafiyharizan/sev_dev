export type YearMonth = { year: number; month: number };

/** Months to download on `today` (YYYY-MM-DD, Malaysia): this month, plus next month in the last 7 days. */
export function monthsToSync(today: string): YearMonth[] {
  const [year, month, day] = today.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const months: YearMonth[] = [{ year, month }];
  if (day > daysInMonth - 7) {
    months.push(month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 });
  }
  return months;
}
