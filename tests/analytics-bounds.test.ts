import { describe, it, expect } from 'vitest';
import { monthBoundsMY } from '@/lib/data/analytics';

describe('monthBoundsMY', () => {
  it('a Malaysia month starts at 16:00 UTC the day before', () => {
    expect(monthBoundsMY(2026, 11)).toEqual({ from: '2026-10-31T16:00:00.000Z', to: '2026-11-30T16:00:00.000Z' });
  });

  it('rolls December into January', () => {
    expect(monthBoundsMY(2026, 12)).toEqual({ from: '2026-11-30T16:00:00.000Z', to: '2026-12-31T16:00:00.000Z' });
  });
});
