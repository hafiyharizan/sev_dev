import { describe, it, expect } from 'vitest';
import { monthsToSync } from '@/lib/prayer-source/sync';

describe('monthsToSync', () => {
  it('is just the current month early in the month', () => {
    expect(monthsToSync('2026-11-23')).toEqual([{ year: 2026, month: 11 }]);
  });

  it('adds next month in the last 7 days of the month', () => {
    expect(monthsToSync('2026-11-24')).toEqual([{ year: 2026, month: 11 }, { year: 2026, month: 12 }]);
  });

  it('rolls December into January of the next year', () => {
    expect(monthsToSync('2026-12-26')).toEqual([{ year: 2026, month: 12 }, { year: 2027, month: 1 }]);
  });

  it('respects a 28-day February', () => {
    expect(monthsToSync('2027-02-21')).toEqual([{ year: 2027, month: 2 }]);
    expect(monthsToSync('2027-02-22')).toEqual([{ year: 2027, month: 2 }, { year: 2027, month: 3 }]);
  });
});
