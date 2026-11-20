import { describe, it, expect } from 'vitest';
import { newInvite, checkInvite } from '@/lib/invite';

const now = new Date('2026-11-20T10:00:00Z');
const plus = (ms: number) => new Date(now.getTime() + ms);
const DAY = 24 * 60 * 60 * 1000;

describe('newInvite', () => {
  it('makes a 24-char url-safe code that expires in 7 days', () => {
    const inv = newInvite(now);
    expect(inv.code).toMatch(/^[A-Za-z0-9_-]{24}$/);
    expect(inv.expiresAt).toBe(plus(7 * DAY).toISOString());
  });

  it('never repeats', () => {
    expect(newInvite(now).code).not.toBe(newInvite(now).code);
  });
});

describe('checkInvite', () => {
  const stored = { code: 'ABCDEFGHIJKLMNOPQRSTUVWX', expiresAt: plus(7 * DAY).toISOString() };

  it('accepts the matching code within 7 days', () => {
    expect(checkInvite(stored, stored.code, plus(6 * DAY))).toBe('ok');
  });

  it('reports expired one minute after the expiry', () => {
    expect(checkInvite(stored, stored.code, plus(7 * DAY + 60_000))).toBe('expired');
  });

  it('rejects a wrong code, even one of the right length', () => {
    expect(checkInvite(stored, 'ABCDEFGHIJKLMNOPQRSTUVWY', now)).toBe('invalid');
    expect(checkInvite(stored, 'short', now)).toBe('invalid');
    expect(checkInvite(stored, '', now)).toBe('invalid');
  });

  it('is invalid when the invite was cancelled or replaced (no stored code)', () => {
    expect(checkInvite({ code: null, expiresAt: null }, 'anything', now)).toBe('invalid');
  });

  it('a replaced invite no longer accepts the old code', () => {
    const replaced = { code: 'ZZZZZZZZZZZZZZZZZZZZZZZZ', expiresAt: plus(7 * DAY).toISOString() };
    expect(checkInvite(replaced, stored.code, now)).toBe('invalid');
  });
});
