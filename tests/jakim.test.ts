import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseJakimMonth, fetchJakimMonth } from '@/lib/prayer-source/jakim';

const fixture = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8'));

describe('parseJakimMonth', () => {
  it('maps the real November 2026 response (SGR01) to DayTimes', () => {
    const days = parseJakimMonth(fixture('jakim-month.json'));
    expect(days).toHaveLength(30);
    expect(days[0]).toEqual({
      date: '2026-11-01', imsak: '05:38', subuh: '05:48', syuruk: '06:55',
      zohor: '13:00', asar: '16:20', maghrib: '18:58', isyak: '20:09',
    });
  });

  it('parses December, where JAKIM writes the Malay month "Dis"', () => {
    const days = parseJakimMonth(fixture('jakim-month-dec.json'));
    expect(days).toHaveLength(31);
    expect(days[0].date).toBe('2026-12-01');
    expect(days[30].date).toBe('2026-12-31');
  });

  it.each([
    ['01-Jan-2026', '2026-01-01'], ['02-Feb-2026', '2026-02-02'], ['03-Mac-2026', '2026-03-03'],
    ['03-Mar-2026', '2026-03-03'], ['04-Apr-2026', '2026-04-04'], ['05-Mei-2026', '2026-05-05'],
    ['05-May-2026', '2026-05-05'], ['06-Jun-2026', '2026-06-06'], ['07-Jul-2026', '2026-07-07'],
    ['08-Ogo-2026', '2026-08-08'], ['08-Aug-2026', '2026-08-08'], ['09-Sep-2026', '2026-09-09'],
    ['10-Okt-2026', '2026-10-10'], ['10-Oct-2026', '2026-10-10'], ['11-Nov-2026', '2026-11-11'],
    ['12-Dis-2026', '2026-12-12'], ['12-Dec-2026', '2026-12-12'],
  ])('parses the date %s', (raw, iso) => {
    const row = { date: raw, imsak: '05:00:00', fajr: '05:10:00', syuruk: '06:00:00', dhuhr: '13:00:00',
      asr: '16:00:00', maghrib: '19:00:00', isha: '20:00:00' };
    expect(parseJakimMonth({ prayerTime: [row] })[0].date).toBe(iso);
  });

  it('throws on malformed input instead of returning garbage', () => {
    expect(() => parseJakimMonth({})).toThrow();
    expect(() => parseJakimMonth({ prayerTime: [{ date: 'garbage' }] })).toThrow();
    expect(() => parseJakimMonth({ prayerTime: [{ date: '01-Nov-2026', imsak: 'x' }] })).toThrow();
  });
});

describe('fetchJakimMonth', () => {
  it('requests the zone, month and year and parses the response', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(JSON.stringify(fixture('jakim-month-dec.json'))));
    const days = await fetchJakimMonth('SGR01', 2026, 12, fetchFn);
    const url = String(fetchFn.mock.calls[0][0]);
    expect(url).toContain('zone=SGR01');
    expect(url).toContain('month=12');
    expect(url).toContain('year=2026');
    expect(days).toHaveLength(31);
  });

  it('throws when JAKIM answers with an error status', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response('nope', { status: 503 }));
    await expect(fetchJakimMonth('SGR01', 2026, 12, fetchFn)).rejects.toThrow(/503/);
  });
});
