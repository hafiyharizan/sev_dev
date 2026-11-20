import { PRAYERS, type DayTimes, type IqamahOffsets, type Prayer } from '@/lib/types';
import { addMinutes, toMinutes } from './clock';

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
 * Server pages are cached, so the phone's clock can be past midnight while it still holds yesterday's "today".
 * Re-aligns the two days to the client's current date.
 */
export function rolloverDays(
  today: DayTimes | null, tomorrow: DayTimes | null, clientDate: string,
): { today: DayTimes | null; tomorrow: DayTimes | null } {
  if (today && today.date === clientDate) return { today, tomorrow };
  if (tomorrow && tomorrow.date === clientDate) return { today: tomorrow, tomorrow: null };
  return { today: null, tomorrow: null };
}
