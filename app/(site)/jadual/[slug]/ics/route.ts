import { getPrayerDays } from '@/lib/data/prayer';
import { getSessionBySlug } from '@/lib/data/schedule';
import { sessionTimeLabel } from '@/lib/time/session-time';
import { buildIcs } from '@/lib/ics';
import { safe } from '@/lib/safe';

export const dynamic = 'force-dynamic';

/** "+ Kalendar": a one-event .ics. Timed when the clock time is known, otherwise an all-day event. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const s = await getSessionBySlug(params.slug);
  if (!s) return new Response('Not found', { status: 404 });
  const [day] = await safe(getPrayerDays(s.date, s.date), []);
  const { time } = sessionTimeLabel(s.timing, day ?? null);

  const ics = buildIcs({
    uid: `${s.id}@surauelminavalley.com`,
    title: `${s.topic ?? s.type.name} (${s.type.name})`,
    description: [s.kitab, s.speaker?.name, s.notes].filter(Boolean).join('\n'),
    location: 'Surau Elmina Valley',
    durationMinutes: 60,
    ...(time ? { startUtc: new Date(`${s.date}T${time}:00+08:00`) } : { allDayDate: s.date }),
  });
  return new Response(ics, {
    headers: { 'content-type': 'text/calendar; charset=utf-8', 'content-disposition': `attachment; filename="${s.slug}.ics"` },
  });
}
