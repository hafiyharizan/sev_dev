import { describe, it, expect } from 'vitest';
import { buildPosterModel, truncate } from '@/lib/poster/model';
import type { SessionView, ProgramType } from '@/lib/schedule';

const maghrib = { id: 't1', name: 'Kuliah Maghrib', colour: '#A87BF0', sortOrder: 1, durationMinutes: null,
  timing: { mode: 'prayer' as const, anchor: 'maghrib' as const, offsetMinutes: 0 } };
const yassin: ProgramType = { ...maghrib, id: 't3', name: 'Yassin / Tahlil / Doa Selamat', colour: '#D9D9D9', sortOrder: 3 };
const types: ProgramType[] = [maghrib, yassin];

const session = (date: string, o: Partial<SessionView> = {}): SessionView => ({
  id: date, slug: date, date, status: 'scheduled', topic: 'Topik', kitab: null, notes: null,
  type: { id: maghrib.id, name: maghrib.name, colour: maghrib.colour },
  speaker: { name: 'Ustaz A', titleLine: null, photoUrl: 'https://x/a.webp' }, timing: maghrib.timing, ...o,
});

describe('truncate', () => {
  it('leaves short text and cuts long text to max with an ellipsis', () => {
    expect(truncate('Akidah', 22)).toBe('Akidah');
    const t = truncate('x'.repeat(40), 22);
    expect(t).toHaveLength(22);
    expect(t.endsWith('…')).toBe(true);
  });
});

describe('buildPosterModel', () => {
  it('titles the month in Malay and lists the legend', () => {
    const m = buildPosterModel(2026, 11, [], types);
    expect(m.title).toBe('NOV 2026');
    expect(m.legend).toEqual([{ name: 'Kuliah Maghrib', colour: '#A87BF0' }, { name: 'Yassin / Tahlil / Doa Selamat', colour: '#D9D9D9' }]);
  });

  it('lays out November 2026 as 6 Monday-first weeks with Nov 4 holding its session', () => {
    const m = buildPosterModel(2026, 11, [session('2026-11-04', { topic: 'Mastika Hadith' })], types);
    expect(m.weeks).toHaveLength(6);
    const nov4 = m.weeks.flat().find((c) => c.date === '2026-11-04')!;
    expect(nov4.day).toBe(4);
    expect(nov4.blocks).toEqual([{ colour: '#A87BF0', topic: 'Mastika Hadith', kitab: null, speakerName: 'Ustaz A',
      photoUrl: 'https://x/a.webp', cancelled: false }]);
    expect(m.weeks[0][0]).toMatchObject({ date: null, day: null, blocks: [] });
  });

  it('shortens long text with an ellipsis and flags the crowded day', () => {
    const long = 'Tafsir dan Tadabur Surah Al-Baqarah ayat terpilih';
    const m = buildPosterModel(2026, 11, [session('2026-11-20', { topic: long }), session('2026-11-20', { topic: 'Al-Quran' })], types);
    const cell = m.weeks.flat().find((c) => c.date === '2026-11-20')!;
    expect(cell.blocks[0].topic).toHaveLength(22);
    expect(cell.blocks[0].topic.endsWith('…')).toBe(true);
    expect(cell.crowded).toBe(true);
  });

  it('copes with a session that has no speaker, photo or topic', () => {
    const s = session('2026-11-12', { topic: null, speaker: null, type: { id: yassin.id, name: yassin.name, colour: yassin.colour } });
    const cell = buildPosterModel(2026, 11, [s], types).weeks.flat().find((c) => c.date === '2026-11-12')!;
    expect(cell.blocks[0]).toMatchObject({ topic: 'Yassin / Tahlil / Doa Selamat', speakerName: null, photoUrl: null });
    expect(cell.crowded).toBe(false);
  });

  it('marks cancelled sessions and ignores sessions outside the month', () => {
    const m = buildPosterModel(2026, 11, [session('2026-11-05', { status: 'cancelled' }), session('2026-12-03')], types);
    expect(m.weeks.flat().find((c) => c.date === '2026-11-05')!.blocks[0].cancelled).toBe(true);
    expect(m.weeks.flat().flatMap((c) => c.blocks)).toHaveLength(1);
  });
});
