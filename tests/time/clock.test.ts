import { describe, it, expect } from 'vitest';
import { toMinutes, addMinutes, formatTimeMY, todayMY, nowMinutesMY } from '@/lib/time/clock';

describe('clock', () => {
  it('toMinutes converts HH:MM', () => {
    expect(toMinutes('05:50')).toBe(350);
  });

  it('addMinutes wraps past midnight', () => {
    expect(addMinutes('19:14', 10)).toBe('19:24');
    expect(addMinutes('23:50', 20)).toBe('00:10');
  });

  it('formatTimeMY uses Malay day-part suffixes', () => {
    expect(formatTimeMY('19:24')).toBe('7:24 mlm');
    expect(formatTimeMY('05:50')).toBe('5:50 pagi');
    expect(formatTimeMY('13:16')).toBe('1:16 tgh');
    expect(formatTimeMY('16:28')).toBe('4:28 ptg');
    expect(formatTimeMY('12:00')).toBe('12:00 tgh');
    expect(formatTimeMY('00:30')).toBe('12:30 pagi');
  });

  it('todayMY is the Malaysia date, not the UTC date (00:30 MYT is still yesterday in UTC)', () => {
    expect(todayMY(new Date('2026-11-19T16:30:00Z'))).toBe('2026-11-20');
    expect(todayMY(new Date('2026-11-19T15:59:00Z'))).toBe('2026-11-19');
  });

  it('nowMinutesMY is minutes since midnight in Malaysia', () => {
    expect(nowMinutesMY(new Date('2026-11-19T16:30:00Z'))).toBe(30);
  });
});
