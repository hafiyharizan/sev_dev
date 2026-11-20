import type { DayTimes, Timing } from '@/lib/types';
import { addMinutes, formatTimeMY } from './clock';

export function resolveTiming(override: Timing | null, typeDefault: Timing): Timing {
  return override ?? typeDefault;
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Human label plus the computed clock time (HH:MM). For prayer-based timing the time is null
 * when that day's prayer times are not available; the label alone is still shown.
 */
export function sessionTimeLabel(t: Timing, day: DayTimes | null): { label: string; time: string | null } {
  if (t.mode === 'fixed') return { label: formatTimeMY(t.time), time: t.time };
  const prayer = capitalise(t.anchor);
  const label =
    t.offsetMinutes === 0
      ? `Selepas ${prayer}`
      : t.offsetMinutes > 0
        ? `${t.offsetMinutes} minit selepas ${prayer}`
        : `${-t.offsetMinutes} minit sebelum ${prayer}`;
  return { label, time: day ? addMinutes(day[t.anchor], t.offsetMinutes) : null };
}
