import { describe, it, expect } from 'vitest';
import {
  rowToTiming, validateSessionInput, planNewSessions, planCopy, validateProgramType, validateSpeaker, selectableSpeakers,
} from '@/lib/schedule';

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const TYPE = '3f2b8c1e-0a4d-4c55-9a11-aaaaaaaaaaaa';
const SPK = '3f2b8c1e-0a4d-4c55-9a11-bbbbbbbbbbbb';
const base = { date: '2026-11-11', program_type_id: TYPE };

describe('rowToTiming', () => {
  it('reads prayer and fixed timing, null when unset', () => {
    expect(rowToTiming({ time_mode: 'prayer', anchor_prayer: 'maghrib', offset_minutes: 0, fixed_time: null }))
      .toEqual({ mode: 'prayer', anchor: 'maghrib', offsetMinutes: 0 });
    expect(rowToTiming({ time_mode: 'fixed', anchor_prayer: null, offset_minutes: null, fixed_time: '09:00' }))
      .toEqual({ mode: 'fixed', time: '09:00' });
    expect(rowToTiming({ time_mode: null, anchor_prayer: null, offset_minutes: null, fixed_time: null })).toBeNull();
  });
});

describe('validateSessionInput', () => {
  it('accepts date + program type and defaults to scheduled with no override', () => {
    expect(validateSessionInput(fd(base))).toEqual({
      ok: true,
      value: { date: '2026-11-11', programTypeId: TYPE, speakerId: null, topic: null, kitab: null, notes: null,
        status: 'scheduled', timing: null, repeatWeekly: false },
    });
  });

  it('keeps topic, kitab, speaker, status and the repeat flag', () => {
    const r = validateSessionInput(fd({ ...base, topic: 'Akidah', kitab: 'Sullamut Taufiq', speaker_id: SPK, status: 'cancelled', repeat_weekly: 'on' }));
    expect(r).toMatchObject({ ok: true, value: { topic: 'Akidah', kitab: 'Sullamut Taufiq', speakerId: SPK, status: 'cancelled', repeatWeekly: true } });
  });

  it('rejects a missing/invalid date and program type', () => {
    expect(validateSessionInput(fd({ program_type_id: TYPE }))).toEqual({ ok: false, error: 'Tarikh diperlukan.' });
    expect(validateSessionInput(fd({ date: '2026-02-30', program_type_id: TYPE }))).toEqual({ ok: false, error: 'Tarikh diperlukan.' });
    expect(validateSessionInput(fd({ date: '2026-11-11' }))).toEqual({ ok: false, error: 'Jenis program diperlukan.' });
  });

  it('reads a custom prayer-relative or fixed time only when ticked', () => {
    expect(validateSessionInput(fd({ ...base, time_mode: 'fixed', time: '09:00' }))).toMatchObject({ value: { timing: null } });
    expect(validateSessionInput(fd({ ...base, custom_time: 'on', time_mode: 'prayer', anchor: 'isyak', offset: '30' })))
      .toMatchObject({ value: { timing: { mode: 'prayer', anchor: 'isyak', offsetMinutes: 30 } } });
    expect(validateSessionInput(fd({ ...base, custom_time: 'on', time_mode: 'fixed', time: '09:00' })))
      .toMatchObject({ value: { timing: { mode: 'fixed', time: '09:00' } } });
  });

  it('rejects bad custom times', () => {
    expect(validateSessionInput(fd({ ...base, custom_time: 'on', time_mode: 'fixed', time: '25:99' })))
      .toEqual({ ok: false, error: 'Masa tidak sah.' });
    expect(validateSessionInput(fd({ ...base, custom_time: 'on', time_mode: 'prayer', anchor: 'isyak', offset: '999' })))
      .toEqual({ ok: false, error: 'Anjakan masa tidak sah.' });
  });
});

describe('planNewSessions', () => {
  const input = { date: '2026-11-11', programTypeId: TYPE, speakerId: SPK, topic: 'Akidah', kitab: null, notes: null,
    status: 'scheduled' as const, timing: null, repeatWeekly: false };

  it('makes one row with a date-prefixed slug', () => {
    const rows = planNewSessions(input, 'Kuliah Maghrib', []);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ date: '2026-11-11', slug: '2026-11-11-akidah', program_type_id: TYPE, speaker_id: SPK, topic: 'Akidah' });
  });

  it('falls back to the program type name when there is no topic', () => {
    const rows = planNewSessions({ ...input, topic: null }, 'Yassin / Tahlil / Doa Selamat', []);
    expect(rows[0].slug).toBe('2026-11-11-yassin-tahlil-doa-selamat');
  });

  it('repeats weekly: one row for every same weekday in that month', () => {
    const rows = planNewSessions({ ...input, date: '2026-11-12', topic: null, repeatWeekly: true }, 'Yassin', []);
    expect(rows.map((r) => r.date)).toEqual(['2026-11-05', '2026-11-12', '2026-11-19', '2026-11-26']);
    expect(new Set(rows.map((r) => r.slug)).size).toBe(4);
  });

  it('suffixes -2 when the slug is taken', () => {
    expect(planNewSessions(input, 'Kuliah Maghrib', ['2026-11-11-akidah'])[0].slug).toBe('2026-11-11-akidah-2');
  });

  it('stores the timing override columns', () => {
    const rows = planNewSessions({ ...input, timing: { mode: 'fixed', time: '09:00' } }, 'X', []);
    expect(rows[0]).toMatchObject({ time_mode: 'fixed', fixed_time: '09:00', anchor_prayer: null, offset_minutes: null });
  });
});

describe('planCopy', () => {
  const prev = (date: string, topic: string | null) => ({
    date, program_type_id: TYPE, speaker_id: SPK, topic, kitab: null, notes: null, time_mode: null, anchor_prayer: null,
    offset_minutes: null, fixed_time: null,
  });
  const names = { [TYPE]: 'Kuliah Maghrib' };

  it('maps the 2nd Wednesday to the 2nd Wednesday of the new month', () => {
    const { rows, skipped } = planCopy([prev('2026-11-11', 'Akidah')], 2026, 12, [], names);
    expect(skipped).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ date: '2026-12-09', topic: 'Akidah', status: 'scheduled', slug: '2026-12-09-akidah', speaker_id: SPK });
  });

  it('skips and lists sessions whose weekday position does not exist (5th Friday into Feb 2027)', () => {
    const { rows, skipped } = planCopy([prev('2027-01-29', 'Fiqah')], 2027, 2, [], names);
    expect(rows).toEqual([]);
    expect(skipped).toEqual([{ date: '2027-01-29', topic: 'Fiqah' }]);
  });

  it('keeps slugs unique across the copied rows', () => {
    const { rows } = planCopy([prev('2026-11-04', null), prev('2026-11-04', null)], 2026, 12, [], names);
    expect(rows[0].slug).not.toBe(rows[1].slug);
  });
});

describe('validateProgramType', () => {
  it('accepts a prayer-timed type', () => {
    expect(validateProgramType(fd({ name: 'Kuliah Maghrib', colour: '#A87BF0', time_mode: 'prayer', anchor: 'maghrib', offset: '0' })))
      .toMatchObject({ ok: true, value: { name: 'Kuliah Maghrib', colour: '#A87BF0', timing: { mode: 'prayer', anchor: 'maghrib', offsetMinutes: 0 } } });
  });

  it('accepts a fixed-time type and rejects a bad colour or name', () => {
    expect(validateProgramType(fd({ name: 'Dhuha', colour: '#E3B04B', time_mode: 'fixed', time: '09:00' })))
      .toMatchObject({ ok: true, value: { timing: { mode: 'fixed', time: '09:00' } } });
    expect(validateProgramType(fd({ name: 'X', colour: 'red', time_mode: 'fixed', time: '09:00' }))).toEqual({ ok: false, error: 'Warna tidak sah.' });
    expect(validateProgramType(fd({ name: '', colour: '#E3B04B', time_mode: 'fixed', time: '09:00' }))).toEqual({ ok: false, error: 'Nama diperlukan.' });
  });
});

describe('validateSpeaker', () => {
  it('needs a name and only accepts photos from the speakers folder', () => {
    expect(validateSpeaker(fd({ name: '' }))).toEqual({ ok: false, error: 'Nama diperlukan.' });
    expect(validateSpeaker(fd({ name: 'Imam Sobri', photo_path: 'uploads/posts/0b8f9d3e-1c2a-4f5b-9a77-123456789abc.webp' })))
      .toEqual({ ok: false, error: 'Gambar tidak sah.' });
    expect(validateSpeaker(fd({ name: 'Imam Sobri', photo_path: 'uploads/speakers/0b8f9d3e-1c2a-4f5b-9a77-123456789abc.webp' })))
      .toMatchObject({ ok: true, value: { name: 'Imam Sobri', active: false } });
  });
});

describe('selectableSpeakers', () => {
  const sp = (id: string, active: boolean) => ({ id, name: id, titleLine: null, photoPath: null, photoUrl: null, active });
  const all = [sp('a', true), sp('b', false), sp('c', true)];

  it('lists active speakers for a new session', () => {
    expect(selectableSpeakers(all, null).map((x) => x.id)).toEqual(['a', 'c']);
  });

  it('keeps the current speaker of an existing session even if now inactive, so editing does not drop him', () => {
    expect(selectableSpeakers(all, 'b').map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
});
