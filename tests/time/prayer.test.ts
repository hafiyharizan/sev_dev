import { describe, it, expect } from 'vitest';
import { iqamahTimes, nextPrayer } from '@/lib/time/prayer';
import type { DayTimes, IqamahOffsets } from '@/lib/types';

const day = (date: string): DayTimes => ({
  date, imsak: '05:40', subuh: '05:50', syuruk: '07:00',
  zohor: '13:16', asar: '16:28', maghrib: '19:14', isyak: '20:25',
});
const offsets: IqamahOffsets = { subuh: 15, zohor: 10, asar: 10, maghrib: 10, isyak: 10 };

describe('iqamahTimes', () => {
  it('adds the configured offset to each azan', () => {
    const r = iqamahTimes(day('2026-11-20'), offsets);
    expect(r.maghrib).toBe('19:24');
    expect(r.subuh).toBe('06:05');
  });
});

describe('nextPrayer', () => {
  it('picks the next azan today and counts minutes', () => {
    const r = nextPrayer(day('2026-11-20'), day('2026-11-21'), 14 * 60);
    expect(r).toEqual({ prayer: 'asar', time: '16:28', minutesUntil: 148, isTomorrow: false });
  });

  it('rolls over to tomorrow\'s subuh after isyak, spanning midnight', () => {
    const tomorrow = { ...day('2026-11-21'), subuh: '05:51' };
    const r = nextPrayer(day('2026-11-20'), tomorrow, 22 * 60);
    expect(r).toEqual({ prayer: 'subuh', time: '05:51', minutesUntil: 2 * 60 + 5 * 60 + 51, isTomorrow: true });
  });

  it('returns null when no times are available', () => {
    expect(nextPrayer(null, null, 600)).toBeNull();
  });

  it('returns null after isyak when tomorrow is not yet downloaded', () => {
    expect(nextPrayer(day('2026-11-20'), null, 22 * 60)).toBeNull();
  });
});
