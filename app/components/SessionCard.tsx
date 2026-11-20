import Link from 'next/link';
import { formatTimeMY } from '@/lib/time/clock';
import { sessionTimeLabel } from '@/lib/time/session-time';
import type { SessionView } from '@/lib/schedule';
import type { DayTimes } from '@/lib/types';

/** `day` = that session date's prayer times (null when not downloaded yet: the label alone is shown). */
export default function SessionCard({ session: s, day, showDate }: { session: SessionView; day: DayTimes | null; showDate?: string }) {
  const t = sessionTimeLabel(s.timing, day);
  const cancelled = s.status === 'cancelled';
  return (
    <Link href={`/jadual/${s.slug}`} className="flex items-stretch gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <span className="w-2 shrink-0 rounded-full" style={{ background: s.type.colour }} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-darkgrey">{showDate ? `${showDate} · ` : ''}{s.type.name}</p>
        <p className={`text-xl font-bold ${cancelled ? 'line-through opacity-60' : ''}`}>{s.topic ?? s.type.name}</p>
        {s.kitab ? <p className="text-sm">{s.kitab}</p> : null}
        {s.speaker ? <p className="text-sm font-medium">{s.speaker.name}</p> : null}
        <p className="mt-1 text-sm">
          {cancelled ? 'Dibatalkan' : `${t.label}${t.time ? ` · ${formatTimeMY(t.time)}` : ''}`}
        </p>
      </div>
      {s.speaker?.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.speaker.photoUrl} alt="" loading="lazy" decoding="async" className="h-16 w-16 shrink-0 self-center rounded-full object-cover" />
      ) : null}
    </Link>
  );
}
