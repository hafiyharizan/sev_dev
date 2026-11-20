import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({ insert: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ createServiceClient: () => ({ from: () => ({ insert: h.insert }) }) }));

import { POST } from '@/app/api/track/route';

const post = (body: unknown) =>
  new Request('http://localhost/api/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });

beforeEach(() => h.insert.mockReset().mockResolvedValue({ error: null }));

describe('POST /api/track', () => {
  it('records a known event and answers 204', async () => {
    const res = await POST(post({ type: 'qr_scan', path: '/' }));
    expect(res.status).toBe(204);
    expect(h.insert).toHaveBeenCalledTimes(1);
    expect(h.insert).toHaveBeenCalledWith({ type: 'qr_scan', path: '/' });
  });

  it('accepts all three event types', async () => {
    for (const type of ['qr_scan', 'pwa_install', 'share_click']) {
      expect((await POST(post({ type, path: '/x' }))).status).toBe(204);
    }
  });

  it('rejects an unknown type without writing', async () => {
    expect((await POST(post({ type: 'hack', path: '/' }))).status).toBe(400);
    expect(h.insert).not.toHaveBeenCalled();
  });

  it('rejects a path longer than 300 characters, a non-string path and malformed JSON', async () => {
    expect((await POST(post({ type: 'qr_scan', path: '/' + 'a'.repeat(300) }))).status).toBe(400);
    expect((await POST(post({ type: 'qr_scan', path: 5 }))).status).toBe(400);
    expect((await POST(post('{not json'))).status).toBe(400);
    expect(h.insert).not.toHaveBeenCalled();
  });

  it('still answers 204 when the database write fails (tracking must never break a page)', async () => {
    h.insert.mockResolvedValue({ error: new Error('db') });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await POST(post({ type: 'qr_scan', path: '/' }))).status).toBe(204);
    spy.mockRestore();
  });
});
