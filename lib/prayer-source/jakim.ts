import type { DayTimes } from '@/lib/types';

// JAKIM writes Malay month abbreviations ("01-Dis-2026"); accept English ones too.
const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, mac: 3, apr: 4, may: 5, mei: 5, jun: 6, jul: 7,
  aug: 8, ogo: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12, dis: 12,
};

function parseDate(raw: unknown): string {
  const m = typeof raw === 'string' ? /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(raw.trim()) : null;
  const month = m ? MONTHS[m[2].toLowerCase()] : undefined;
  if (!m || !month) throw new Error(`JAKIM: unrecognised date ${JSON.stringify(raw)}`);
  return `${m[3]}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

function parseTime(raw: unknown, field: string): string {
  const m = typeof raw === 'string' ? /^(\d{2}:\d{2})(:\d{2})?$/.exec(raw) : null;
  if (!m) throw new Error(`JAKIM: bad ${field} time ${JSON.stringify(raw)}`);
  return m[1];
}

/** e-Solat `takwimsolat` month response -> DayTimes[]. Throws on anything unexpected. */
export function parseJakimMonth(json: unknown): DayTimes[] {
  const rows = (json as { prayerTime?: unknown })?.prayerTime;
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('JAKIM: no prayerTime array');
  return rows.map((r: Record<string, unknown>) => ({
    date: parseDate(r.date),
    imsak: parseTime(r.imsak, 'imsak'),
    subuh: parseTime(r.fajr, 'fajr'),
    syuruk: parseTime(r.syuruk, 'syuruk'),
    zohor: parseTime(r.dhuhr, 'dhuhr'),
    asar: parseTime(r.asr, 'asr'),
    maghrib: parseTime(r.maghrib, 'maghrib'),
    isyak: parseTime(r.isha, 'isha'),
  }));
}

type FetchFn = (input: string) => Promise<Response>;

/** `month` is 1-12. The adapter boundary: swap this function if the source changes. */
export async function fetchJakimMonth(
  zone: string,
  year: number,
  month: number,
  fetchFn: FetchFn = (u) => fetch(u, { cache: 'no-store' }),
): Promise<DayTimes[]> {
  const url =
    'https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat' +
    `&zone=${encodeURIComponent(zone)}&period=month&month=${month}&year=${year}`;
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`JAKIM responded ${res.status}`);
  return parseJakimMonth(await res.json());
}
