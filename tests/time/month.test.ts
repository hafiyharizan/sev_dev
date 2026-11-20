import { describe, it, expect } from 'vitest';
import { weekdayPosition, dateForPosition, copyMonthDates, weekdaysInMonth, monthGrid } from '@/lib/time/month';

describe('weekdayPosition / dateForPosition', () => {
  it('2026-11-11 is the 2nd Wednesday', () => {
    expect(weekdayPosition('2026-11-11')).toEqual({ weekday: 3, nth: 2 });
  });

  it('finds the nth weekday of a month, or null when the month has no such week', () => {
    expect(dateForPosition(2026, 12, 3, 2)).toBe('2026-12-09');
    expect(dateForPosition(2027, 2, 0, 5)).toBeNull();
  });
});

describe('copyMonthDates', () => {
  it('maps by weekday position (2nd Wednesday -> 2nd Wednesday)', () => {
    const { mapped, skipped } = copyMonthDates([{ date: '2026-11-11', topic: 'Akidah' }], 2026, 12);
    expect(skipped).toEqual([]);
    expect(mapped).toEqual([{ date: '2026-11-11', topic: 'Akidah', newDate: '2026-12-09' }]);
  });

  it('skips and lists sessions whose weekday position does not exist (5th Sunday into Feb 2027)', () => {
    const src = [{ date: '2026-11-29', topic: 'Sirah' }];
    const { mapped, skipped } = copyMonthDates(src, 2027, 2);
    expect(mapped).toEqual([]);
    expect(skipped).toEqual(src);
  });
});

describe('weekdaysInMonth', () => {
  it('lists every Thursday in November 2026', () => {
    expect(weekdaysInMonth(2026, 11, 4)).toEqual(['2026-11-05', '2026-11-12', '2026-11-19', '2026-11-26']);
  });
});

describe('monthGrid', () => {
  it('is Monday-first with null padding (November 2026 has 6 rows)', () => {
    const g = monthGrid(2026, 11);
    expect(g).toHaveLength(6);
    expect(g[0]).toEqual([null, null, null, null, null, null, '2026-11-01']);
    expect(g[5]).toEqual(['2026-11-30', null, null, null, null, null, null]);
  });

  it('handles a leap February', () => {
    expect(monthGrid(2028, 2).flat().filter(Boolean)).toHaveLength(29);
  });
});
