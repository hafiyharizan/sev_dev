import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import ShareButton from '@/app/components/ShareButton';
import { getPrayerDays } from '@/lib/data/prayer';
import { getSessionBySlug } from '@/lib/data/schedule';
import { formatDayMY } from '@/lib/format';
import { formatTimeMY } from '@/lib/time/clock';
import { sessionTimeLabel } from '@/lib/time/session-time';
import { safe } from '@/lib/safe';

export const dynamic = 'force-dynamic';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = MONTH.test(params.slug) ? null : await getSessionBySlug(params.slug);
  if (!s) return { title: 'Sesi tidak dijumpai' };
  const title = `${s.topic ?? s.type.name} · ${s.type.name}`;
  const description = [formatDayMY(s.date), s.speaker?.name, s.kitab].filter(Boolean).join(' · ');
  return {
    title: `${title} · Surau Elmina Valley`,
    description,
    openGraph: { title, description, images: [s.speaker?.photoUrl ?? `/jadual/${s.date.slice(0, 7)}/poster.png`] },
  };
}

export default async function SessionPage({ params }: { params: { slug: string } }) {
  if (MONTH.test(params.slug)) redirect(`/jadual?bulan=${params.slug}`);
  const s = await getSessionBySlug(params.slug);
  if (!s) notFound();
  const [day] = await safe(getPrayerDays(s.date, s.date), []);
  const t = sessionTimeLabel(s.timing, day ?? null);
  const cancelled = s.status === 'cancelled';

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <Link href={`/jadual?bulan=${s.date.slice(0, 7)}`} className="inline-block min-h-[44px] underline">← Jadual</Link>
      <div className="mt-4 rounded-3xl bg-white p-6">
        <p className="flex items-center gap-2 text-sm">
          <span className="h-3 w-3 rounded-full" style={{ background: s.type.colour }} aria-hidden="true" />{s.type.name}
        </p>
        <h1 className={`mt-2 text-4xl font-bold ${cancelled ? 'line-through opacity-60' : ''}`}>{s.topic ?? s.type.name}</h1>
        {cancelled ? <p className="mt-2 font-semibold text-red-700">Sesi ini dibatalkan.</p> : null}
        {s.kitab ? <p className="mt-1 text-lg">{s.kitab}</p> : null}
        <p className="mt-4 text-lg">{formatDayMY(s.date)}</p>
        <p className="text-lg font-semibold">{t.label}{t.time ? ` · ${formatTimeMY(t.time)}` : ''}</p>
        {s.speaker ? (
          <div className="mt-6 flex items-center gap-4">
            {s.speaker.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.speaker.photoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : null}
            <div>
              <p className="text-lg font-semibold">{s.speaker.name}</p>
              {s.speaker.titleLine ? <p className="text-sm">{s.speaker.titleLine}</p> : null}
            </div>
          </div>
        ) : null}
        {s.notes ? <p className="mt-6 whitespace-pre-line">{s.notes}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <ShareButton path={`/jadual/${s.slug}`} title={`${s.topic ?? s.type.name} – ${formatDayMY(s.date)}`} />
          <a href={`/jadual/${s.slug}/ics`} className="inline-flex min-h-[44px] items-center rounded-full border border-navyblue px-5 text-navyblue">+ Kalendar</a>
        </div>
      </div>
    </main>
  );
}
