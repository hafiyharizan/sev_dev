import { describe, it, expect } from 'vitest';
import { formatDateMY } from '@/lib/format';

describe('formatDateMY', () => {
  it('formats in Malay using the Malaysia calendar day', () => {
    expect(formatDateMY('2026-05-16T00:00:00+08:00')).toBe('16 Mei 2026');
    // 20:00 UTC on Dec 31 is already Jan 1 in Malaysia
    expect(formatDateMY('2026-12-31T20:00:00Z')).toBe('1 Januari 2027');
  });

  it('accepts a plain YYYY-MM-DD date without shifting it', () => {
    expect(formatDateMY('2026-11-20')).toBe('20 November 2026');
  });
});
