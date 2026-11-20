export const PRAYERS = ['subuh', 'zohor', 'asar', 'maghrib', 'isyak'] as const;
export type Prayer = (typeof PRAYERS)[number];

/** One day of prayer times. All times are local Malaysia `HH:MM`. */
export type DayTimes = {
  date: string; // YYYY-MM-DD
  imsak: string;
  subuh: string;
  syuruk: string;
  zohor: string;
  asar: string;
  maghrib: string;
  isyak: string;
};

/** Minutes after azan at which iqamah is held, per prayer. */
export type IqamahOffsets = Record<Prayer, number>;

export type Timing =
  | { mode: 'prayer'; anchor: Prayer; offsetMinutes: number }
  | { mode: 'fixed'; time: string };
