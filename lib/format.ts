/** "16 Mei 2026". Accepts an ISO timestamp or a plain YYYY-MM-DD date; always shows the Malaysia calendar day. */
export function formatDateMY(value: string): string {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+08:00` : value;
  return new Date(iso).toLocaleDateString('ms-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "Rabu, 11 November": weekday and day in Malay, for agenda headings. Takes a plain YYYY-MM-DD date. */
export function formatDayMY(date: string): string {
  const d = new Date(`${date}T00:00:00+08:00`);
  const opts = { timeZone: 'Asia/Kuala_Lumpur' } as const;
  const weekday = d.toLocaleDateString('ms-MY', { ...opts, weekday: 'long' });
  const rest = d.toLocaleDateString('ms-MY', { ...opts, day: 'numeric', month: 'long' });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${rest}`;
}
