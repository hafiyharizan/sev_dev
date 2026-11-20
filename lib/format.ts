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
