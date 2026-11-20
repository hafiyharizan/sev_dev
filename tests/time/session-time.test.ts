import { describe, it, expect } from 'vitest';
import { resolveTiming, sessionTimeLabel } from '@/lib/time/session-time';
import type { DayTimes, Timing } from '@/lib/types';

const day: DayTimes = {
  date: '2026-11-11', imsak: '05:40', subuh: '05:50', syuruk: '07:00',
  zohor: '13:16', asar: '16:28', maghrib: '19:14', isyak: '20:25',
};
const maghrib: Timing = { mode: 'prayer', anchor: 'maghrib', offsetMinutes: 0 };

describe('resolveTiming', () => {
  it('uses the override when present, otherwise the type default', () => {
    const fixed: Timing = { mode: 'fixed', time: '09:00' };
    expect(resolveTiming(fixed, maghrib)).toBe(fixed);
    expect(resolveTiming(null, maghrib)).toBe(maghrib);
  });
});

describe('sessionTimeLabel', () => {
  it('falls back to the label only when prayer times are missing', () => {
    expect(sessionTimeLabel(maghrib, null)).toEqual({ label: 'Selepas Maghrib', time: null });
  });

  it('computes the clock time from the day\'s prayer time', () => {
    expect(sessionTimeLabel(maghrib, day)).toEqual({ label: 'Selepas Maghrib', time: '19:14' });
  });

  it('applies a positive or negative offset and says so in the label', () => {
    const after: Timing = { mode: 'prayer', anchor: 'isyak', offsetMinutes: 30 };
    const before: Timing = { mode: 'prayer', anchor: 'subuh', offsetMinutes: -20 };
    expect(sessionTimeLabel(after, day)).toEqual({ label: '30 minit selepas Isyak', time: '20:55' });
    expect(sessionTimeLabel(before, day)).toEqual({ label: '20 minit sebelum Subuh', time: '05:30' });
  });

  it('formats a fixed time without needing prayer times', () => {
    expect(sessionTimeLabel({ mode: 'fixed', time: '09:00' }, null)).toEqual({ label: '9:00 pagi', time: '09:00' });
  });
});
