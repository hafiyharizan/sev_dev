import { describe, it, expect, vi, beforeEach } from 'vitest';

const { upsert, revalidateTag, fetchJakimMonth } = vi.hoisted(() => ({
  upsert: vi.fn(),
  revalidateTag: vi.fn(),
  fetchJakimMonth: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidateTag }));
vi.mock('@/lib/prayer-source/jakim', () => ({ fetchJakimMonth }));
vi.mock('@/lib/time/clock', async (orig) => ({ ...(await orig<object>()), todayMY: () => '2026-12-26' }));
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    from: (table: string) =>
      table === 'settings'
        ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { value: 'SGR01' } }) }) }) }
        : { upsert },
  }),
}));

import { GET } from '@/app/api/cron/daily/route';

const req = (auth?: string) =>
  new Request('http://localhost/api/cron/daily', { headers: auth ? { authorization: auth } : {} });
const day = (date: string) => ({ date, imsak: '05:00', subuh: '05:10', syuruk: '06:00', zohor: '13:00', asar: '16:00', maghrib: '19:00', isyak: '20:00' });

beforeEach(() => {
  process.env.CRON_SECRET = 's3cret';
  upsert.mockReset().mockResolvedValue({ error: null });
  revalidateTag.mockReset();
  fetchJakimMonth.mockReset().mockImplementation(async (_z: string, y: number, m: number) => [
    day(`${y}-${String(m).padStart(2, '0')}-01`),
  ]);
});

describe('GET /api/cron/daily', () => {
  it('rejects a request without the bearer secret', async () => {
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req('Bearer wrong'))).status).toBe(401);
    expect(fetchJakimMonth).not.toHaveBeenCalled();
  });

  it('syncs this month and next (late December -> January) and busts the cache tag', async () => {
    const res = await GET(req('Bearer s3cret'));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, days: 2 });
    expect(fetchJakimMonth).toHaveBeenCalledWith('SGR01', 2026, 12);
    expect(fetchJakimMonth).toHaveBeenCalledWith('SGR01', 2027, 1);
    const [rows, opts] = upsert.mock.calls[0];
    expect(opts).toEqual({ onConflict: 'date' });
    expect(rows[0]).toMatchObject({ date: '2026-12-01', zone: 'SGR01', subuh: '05:10' });
    expect(rows[0].fetched_at).toBeTruthy();
    expect(revalidateTag).toHaveBeenCalledWith('prayer_times');
  });

  it('keeps the existing rows and reports ok:false when JAKIM is down', async () => {
    fetchJakimMonth.mockRejectedValue(new Error('JAKIM 503'));
    const res = await GET(req('Bearer s3cret'));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: false });
    expect(upsert).not.toHaveBeenCalled();
  });
});
