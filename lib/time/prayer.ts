import { PRAYERS, type DayTimes, type IqamahOffsets, type Prayer } from '@/lib/types';
import { addDays, addMinutes, toMinutes } from './clock';

export function iqamahTimes(day: DayTimes, offsets: IqamahOffsets): Record<Prayer, string> {
  const out = {} as Record<Prayer, string>;
  for (const p of PRAYERS) out[p] = addMinutes(day[p], offsets[p]);
  return out;
}

export type NextPrayer = { prayer: Prayer; time: string; minutesUntil: number; isTomorrow: boolean };

/** Next azan after `nowMin` (minutes since midnight, Malaysia). After isyak it rolls to tomorrow's subuh. */
export function nextPrayer(today: DayTimes | null, tomorrow: DayTimes | null, nowMin: number): NextPrayer | null {
  if (!today) return null;
  for (const p of PRAYERS) {
    const t = toMinutes(today[p]);
    if (t > nowMin) return { prayer: p, time: today[p], minutesUntil: t - nowMin, isTomorrow: false };
  }
  if (!tomorrow) return null;
  return {
    prayer: 'subuh',
    time: tomorrow.subuh,
    minutesUntil: 1440 - nowMin + toMinutes(tomorrow.subuh),
    isTomorrow: true,
  };
}

/**
 * Picks today and tomorrow from the cached days using the phone's own date. The page holds a whole month, so the
 * widget keeps working for days after it was loaded, even offline.
 */
export function pickDays(days: DayTimes[], clientDate: string): { today: DayTimes | null; tomorrow: DayTimes | null } {
  const tomorrowDate = addDays(clientDate, 1);
  return {
    today: days.find((d) => d.date === clientDate) ?? null,
    tomorrow: days.find((d) => d.date === tomorrowDate) ?? null,
  };
}
