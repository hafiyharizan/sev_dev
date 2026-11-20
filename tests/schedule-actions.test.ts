import { describe, it, expect, vi, beforeEach } from 'vitest';

// Every awaited query pops the next scripted result, in the order the action issues them.
const h = vi.hoisted(() => ({
  requireUser: vi.fn(),
  revalidateTag: vi.fn(),
  deleteFile: vi.fn(),
  queue: [] as unknown[],
  calls: [] as { table: string; op: string; arg: unknown }[],
}));

vi.mock('@/lib/auth', () => ({ requireUser: h.requireUser }));
vi.mock('@/lib/storage-server', () => ({ deleteFile: h.deleteFile }));
vi.mock('next/cache', () => ({ revalidateTag: h.revalidateTag }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: (table: string) => {
      const q: Record<string, unknown> = {};
      for (const op of ['select', 'eq', 'like', 'gte', 'lte', 'insert', 'update', 'delete', 'order']) {
        q[op] = (arg: unknown) => { h.calls.push({ table, op, arg }); return q; };
      }
      q.maybeSingle = () => q;
      q.then = (resolve: (v: unknown) => void) => resolve(h.queue.shift() ?? { data: null, error: null });
      return q;
    },
  }),
}));

import { saveSession, copyLastMonth, deleteSession } from '@/app/admin/(panel)/jadual/actions';
import { deleteProgramType } from '@/app/admin/(panel)/jadual/jenis/actions';

const TYPE = '3f2b8c1e-0a4d-4c55-9a11-aaaaaaaaaaaa';
const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const inserted = () => h.calls.filter((c) => c.op === 'insert').map((c) => c.arg as Record<string, unknown>[]);

beforeEach(() => {
  h.requireUser.mockReset().mockResolvedValue({ id: 'u', email: 'a@b.c' });
  h.revalidateTag.mockReset();
  h.queue = [];
  h.calls = [];
});

describe('saveSession', () => {
  it('returns a session-expired message (keeping the form) and writes nothing when nobody is logged in', async () => {
    h.requireUser.mockRejectedValue(new Error('UNAUTHORIZED'));
    expect(await saveSession({}, fd({ date: '2026-11-11', program_type_id: TYPE }))).toEqual({ error: 'Sesi tamat. Sila log masuk semula.' });
    expect(h.calls).toEqual([]);
  });

  it('returns validation errors without touching the database', async () => {
    expect(await saveSession({}, fd({ program_type_id: TYPE }))).toEqual({ error: 'Tarikh diperlukan.' });
    expect(h.calls).toEqual([]);
  });

  it('creates a session with a date-prefixed slug and busts the schedule cache', async () => {
    h.queue = [{ data: { name: 'Kuliah Maghrib' } }, { data: [] }, { error: null }];
    const r = await saveSession({}, fd({ date: '2026-11-11', program_type_id: TYPE, topic: 'Akidah' }));
    expect(r).toEqual({ ok: true, created: 1 });
    expect(inserted()[0][0]).toMatchObject({ date: '2026-11-11', slug: '2026-11-11-akidah', program_type_id: TYPE });
    for (const tag of ['sessions', 'program_types', 'speakers']) expect(h.revalidateTag).toHaveBeenCalledWith(tag);
  });

  it('repeats weekly: one row per matching weekday in the month', async () => {
    h.queue = [{ data: { name: 'Yassin' } }, { data: [] }, { error: null }];
    const r = await saveSession({}, fd({ date: '2026-11-12', program_type_id: TYPE, repeat_weekly: 'on' }));
    expect(r).toEqual({ ok: true, created: 4 });
    expect(inserted()[0].map((x) => x.date)).toEqual(['2026-11-05', '2026-11-12', '2026-11-19', '2026-11-26']);
  });

  it('on edit updates the row and keeps the slug', async () => {
    h.queue = [{ error: null }];
    const r = await saveSession({}, fd({ id: 's1', date: '2026-11-12', program_type_id: TYPE, topic: 'Baru' }));
    expect(r).toEqual({ ok: true, created: 0 });
    const update = h.calls.find((c) => c.op === 'update')!.arg as Record<string, unknown>;
    expect(update).toMatchObject({ topic: 'Baru', date: '2026-11-12' });
    expect(update).not.toHaveProperty('slug');
  });
});

describe('copyLastMonth', () => {
  it('rejects nonsense months', async () => {
    expect(await copyLastMonth(2026, 13)).toEqual({ error: 'Bulan tidak sah.' });
  });

  it('throws UNAUTHORIZED when nobody is logged in', async () => {
    h.requireUser.mockRejectedValue(new Error('UNAUTHORIZED'));
    await expect(copyLastMonth(2027, 2)).rejects.toThrow('UNAUTHORIZED');
  });

  it('refuses when the target month already has sessions (no accidental double copy)', async () => {
    h.queue = [{ count: 3 }];
    expect(await copyLastMonth(2027, 2)).toEqual({ error: 'Bulan ini sudah ada sesi. Padam atau tambah secara manual.' });
    expect(inserted()).toEqual([]);
  });

  it('copies by weekday position and reports what it could not place (5th Friday into Feb 2027)', async () => {
    const prev = [
      { date: '2027-01-08', program_type_id: TYPE, speaker_id: null, topic: 'Akidah', kitab: null, notes: null, time_mode: null, anchor_prayer: null, offset_minutes: null, fixed_time: null },
      { date: '2027-01-29', program_type_id: TYPE, speaker_id: null, topic: 'Fiqah', kitab: null, notes: null, time_mode: null, anchor_prayer: null, offset_minutes: null, fixed_time: null },
    ];
    h.queue = [{ count: 0 }, { data: prev }, { data: [] }, { data: [{ id: TYPE, name: 'Kuliah Maghrib' }] }, { error: null }];
    const r = await copyLastMonth(2027, 2);
    expect(r).toEqual({ created: 1, skipped: [{ date: '2027-01-29', topic: 'Fiqah' }] });
    expect(inserted()[0][0]).toMatchObject({ date: '2027-02-12', slug: '2027-02-12-akidah' });
  });
});

describe('deleteSession / deleteProgramType', () => {
  it('deleteSession needs a user', async () => {
    h.requireUser.mockRejectedValue(new Error('UNAUTHORIZED'));
    await expect(deleteSession('s1')).rejects.toThrow('UNAUTHORIZED');
  });

  it('a program type still used by sessions is not deleted', async () => {
    h.queue = [{ count: 2 }];
    await deleteProgramType('t1');
    expect(h.calls.some((c) => c.op === 'delete')).toBe(false);
  });

  it('an unused program type is deleted', async () => {
    h.queue = [{ count: 0 }, { error: null }];
    await deleteProgramType('t1');
    expect(h.calls.some((c) => c.table === 'program_types' && c.op === 'delete')).toBe(true);
  });
});
