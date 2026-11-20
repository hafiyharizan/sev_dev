const MYT_OFFSET_MS = 8 * 60 * 60 * 1000; // Malaysia is UTC+8 all year

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function addMinutes(hhmm: string, n: number): string {
  const total = (((toMinutes(hhmm) + n) % 1440) + 1440) % 1440;
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(total % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/** "19:24" -> "7:24 mlm". Suffixes: pagi <12, tgh 12-13, ptg 14-18, mlm 19+. */
export function formatTimeMY(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = h % 12 || 12;
  const suffix = h < 12 ? 'pagi' : h < 14 ? 'tgh' : h < 19 ? 'ptg' : 'mlm';
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Today's date in Malaysia (YYYY-MM-DD). Never use the server's local date: Vercel runs in UTC. */
export function todayMY(now: Date = new Date()): string {
  return new Date(now.getTime() + MYT_OFFSET_MS).toISOString().slice(0, 10);
}

export function nowMinutesMY(now: Date = new Date()): number {
  const d = new Date(now.getTime() + MYT_OFFSET_MS);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** 42 -> "42 minit", 65 -> "1 jam 5 minit", 120 -> "2 jam". */
export function formatCountdown(minutes: number): string {
  if (minutes < 1) return 'kurang seminit';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} minit`;
  return m === 0 ? `${h} jam` : `${h} jam ${m} minit`;
}
