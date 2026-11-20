'use client';

import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { formatTimeMY, formatCountdown, nowMinutesMY, todayMY } from '@/lib/time/clock';
import { iqamahTimes, nextPrayer, rolloverDays } from '@/lib/time/prayer';
import { PRAYERS, type DayTimes, type IqamahOffsets, type Prayer } from '@/lib/types';

const LABELS: Record<Prayer | 'syuruk', string> = { subuh: 'Subuh', syuruk: 'Syuruk', zohor: 'Zohor', asar: 'Asar', maghrib: 'Maghrib', isyak: 'Isyak' };
const ROWS = ['subuh', 'syuruk', 'zohor', 'asar', 'maghrib', 'isyak'] as const;

/** Today's times with iqamah beside azan and a live countdown. The countdown starts after mount (the server has no phone clock). */
export default function PrayerWidget({
  today, tomorrow, offsets,
}: { today: DayTimes | null; tomorrow: DayTimes | null; offsets: IqamahOffsets }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const days = now ? rolloverDays(today, tomorrow, todayMY(now)) : { today, tomorrow };
  if (!days.today) {
    return <section className="rounded-3xl bg-white p-6">Waktu solat belum tersedia.</section>;
  }
  const iqamah = iqamahTimes(days.today, offsets);
  const next = now ? nextPrayer(days.today, days.tomorrow, nowMinutesMY(now)) : null;
  const isNext = (p: string) => next && !next.isTomorrow && next.prayer === p;

  return (
    <section aria-label="Waktu solat" className="rounded-3xl bg-white p-6 shadow-sm">
      {next ? (
        <p className="mb-4 text-lg font-semibold" aria-live="polite">
          {next.isTomorrow ? 'Subuh esok' : LABELS[next.prayer]} dalam {formatCountdown(next.minutesUntil)}
        </p>
      ) : null}
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-darkgrey">
            <th className="pb-2 font-normal">Solat</th>
            <th className="pb-2 font-normal">Azan</th>
            <th className="pb-2 font-normal">Iqamah</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((p) => (
            <m.tr key={p} initial={false} animate={{ backgroundColor: isNext(p) ? '#d9e8ff' : '#ffffff' }} transition={{ duration: 0.3 }} className={isNext(p) ? 'font-semibold' : ''}>
              <td className="rounded-l-lg px-2 py-2">{LABELS[p]}</td>
              <td className="px-2 py-2">{formatTimeMY(days.today![p])}</td>
              <td className="rounded-r-lg px-2 py-2">{(PRAYERS as readonly string[]).includes(p) ? formatTimeMY(iqamah[p as Prayer]) : '—'}</td>
            </m.tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
