import Link from 'next/link';
import type { Metadata } from 'next';
import SessionCard from '@/app/components/SessionCard';
import { getPrayerDays } from '@/lib/data/prayer';
import { listProgramTypes, listSessions } from '@/lib/data/schedule';
import { formatDateMY, formatDayMY } from '@/lib/format';
import { safe } from '@/lib/safe';
import { monthGrid } from '@/lib/time/month';
import { todayMY } from '@/lib/time/clock';
import type { SessionView } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

const pad = (n: number) => String(n).padStart(2, '0');
const parseMonth = (raw?: string) => {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(raw ?? '') ?? /^(\d{4})-(\d{2})$/.exec(todayMY().slice(0, 7))!;
  return { year: Number(m[1]), month: Number(m[2]), key: `${m[1]}-${m[2]}` };
};

export async function generateMetadata({ searchParams }: { searchParams: { bulan?: string } }): Promise<Metadata> {
  const { key } = parseMonth(searchParams.bulan);
  return {
    title: 'Jadual Kuliah & Program · Surau Elmina Valley',
    description: 'Jadual kuliah dan program imarah Surau Elmina Valley.',
    openGraph: { title: 'Jadual Kuliah & Program Imarah', images: [`/jadual/${key}/poster.png`] },
  };
}

export default async function JadualPage({ searchParams }: { searchParams: { bulan?: string; jenis?: string } }) {
  const { year, month, key } = parseMonth(searchParams.bulan);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prev = month === 1 ? `${year - 1}-12` : `${year}-${pad(month - 1)}`;
  const next = month === 12 ? `${year + 1}-01` : `${year}-${pad(month + 1)}`;
  const today = todayMY();

  const [all, types, prayerDays] = await Promise.all([
    safe(listSessions(`${key}-01`, `${key}-${pad(last)}`), [] as SessionView[]),
    safe(listProgramTypes(), []),
    safe(getPrayerDays(`${key}-01`, `${key}-${pad(last)}`), []),
  ]);
  const sessions = searchParams.jenis ? all.filter((s) => s.type.id === searchParams.jenis) : all;
  const day = (d: string) => prayerDays.find((x) => x.date === d) ?? null;
  const byDate = new Map<string, SessionView[]>();
  for (const s of sessions) byDate.set(s.date, [...(byDate.get(s.date) ?? []), s]);
  const q = (bulan: string, jenis?: string) => `/jadual?bulan=${bulan}${jenis ? `&jenis=${jenis}` : ''}`;
  const heading = (d: string) => (d === today ? 'Hari ini' : formatDayMY(d));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="text-4xl font-bold">Jadual Kuliah & Program</h1>
      <nav aria-label="Bulan" className="mt-4 flex items-center gap-4">
        <Link href={q(prev, searchParams.jenis)} aria-label="Bulan sebelum" className="min-h-[44px] px-3 py-3">←</Link>
        <span className="text-lg font-medium">{formatDateMY(`${key}-01`).replace(/^1 /, '')}</span>
        <Link href={q(next, searchParams.jenis)} aria-label="Bulan seterusnya" className="min-h-[44px] px-3 py-3">→</Link>
        <Link href={`/jadual/${key}/poster.png`} className="ml-auto min-h-[44px] rounded-full bg-navyblue px-4 py-3 text-sm text-white">Poster bulan ini</Link>
      </nav>

      <nav aria-label="Tapis jenis program" className="mt-4 flex flex-wrap gap-2">
        <Link href={q(key)} aria-current={!searchParams.jenis ? 'page' : undefined}
          className={`min-h-[44px] rounded-full px-4 py-3 text-sm ${!searchParams.jenis ? 'bg-navyblue text-white' : 'bg-white'}`}>Semua</Link>
        {types.map((t) => (
          <Link key={t.id} href={q(key, t.id)} aria-current={searchParams.jenis === t.id ? 'page' : undefined}
            className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm ${searchParams.jenis === t.id ? 'bg-navyblue text-white' : 'bg-white'}`}>
            <span className="h-3 w-3 rounded-full" style={{ background: t.colour }} aria-hidden="true" />{t.name}
          </Link>
        ))}
      </nav>

      {sessions.length === 0 ? <p className="mt-10">Tiada sesi untuk bulan ini.</p> : null}

      {/* phones: agenda list */}
      <div className="mt-8 space-y-6 md:hidden">
        {Array.from(byDate.entries()).map(([d, list]) => (
          <section key={d} className={d < today ? 'opacity-60' : ''}>
            <h2 className="mb-2 font-semibold">{heading(d)}</h2>
            <div className="space-y-3">{list.map((s) => <SessionCard key={s.id} session={s} day={day(d)} />)}</div>
          </section>
        ))}
      </div>

      {/* tablet / desktop: month grid in the poster's style */}
      <div className="mt-8 hidden md:block">
        <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold">
          {['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'].map((n) => <div key={n} className="rounded-lg bg-navyblue py-2 text-white">{n}</div>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {monthGrid(year, month).flat().map((d, i) => (
            d === null ? <div key={i} /> : (
              <div key={d} className={`min-h-[120px] rounded-xl bg-white p-2 ${d === today ? 'ring-2 ring-blue' : ''}`}>
                <p className="font-bold">{Number(d.slice(8))}</p>
                <div className="mt-1 space-y-1">
                  {(byDate.get(d) ?? []).map((s) => (
                    <Link key={s.id} href={`/jadual/${s.slug}`} className={`block rounded-lg p-1.5 text-xs ${s.status === 'cancelled' ? 'line-through opacity-60' : ''}`} style={{ background: s.type.colour }}>
                      <span className="block font-bold uppercase leading-tight text-black">{s.topic ?? s.type.name}</span>
                      {s.speaker ? <span className="block text-black">{s.speaker.name}</span> : null}
                    </Link>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </main>
  );
}
