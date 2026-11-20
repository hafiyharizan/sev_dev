import Link from 'next/link';
import Banner from '../components/Banner/index';
import Dedicated from '../components/Dedicated/index';
import FAQ from '../components/FAQ/index';
import PostCard from '../components/PostCard';
import PrayerWidget from '../components/PrayerWidget';
import SessionCard from '../components/SessionCard';
import { getPrayerDays } from '@/lib/data/prayer';
import { listPosts } from '@/lib/data/posts';
import { listSessions } from '@/lib/data/schedule';
import { DEFAULT_OFFSETS, getSettings } from '@/lib/data/settings';
import { safe } from '@/lib/safe';
import { todayMY } from '@/lib/time/clock';
import type { SessionView } from '@/lib/schedule';

export const dynamic = 'force-dynamic'; // "today" changes; the data reads below are still cached by tag

const addDays = (date: string, n: number) => new Date(new Date(`${date}T00:00:00Z`).getTime() + n * 86_400_000).toISOString().slice(0, 10);

export default async function Home() {
  const today = todayMY();
  const [prayerDays, settings, sessions, posts] = await Promise.all([
    safe(getPrayerDays(today, addDays(today, 31)), []),
    safe(getSettings(), { prayerZone: 'SGR01', iqamahOffsets: DEFAULT_OFFSETS }),
    safe(listSessions(today, addDays(today, 31)), [] as SessionView[]),
    safe(listPosts({ limit: 6 }), []),
  ]);
  const day = (d: string) => prayerDays.find((x) => x.date === d) ?? null;
  const todays = sessions.filter((s) => s.date === today);
  const upcoming = sessions.filter((s) => s.date > today).slice(0, 3);

  return (
    <main>
      <Banner />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-2 lg:px-8">
        <PrayerWidget today={day(today)} tomorrow={day(addDays(today, 1))} offsets={settings.iqamahOffsets} />
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Malam ini / Hari ini</h2>
          {todays.length === 0 ? <p>Tiada program hari ini.</p> : todays.map((s) => <SessionCard key={s.id} session={s} day={day(today)} />)}
          {upcoming.length > 0 ? (
            <>
              <h2 className="pt-2 text-xl font-bold">Seterusnya</h2>
              {upcoming.map((s) => <SessionCard key={s.id} session={s} day={day(s.date)} showDate={s.date.slice(8) + '/' + s.date.slice(5, 7)} />)}
            </>
          ) : null}
          <Link href="/jadual" className="inline-block min-h-[44px] underline">Lihat jadual penuh →</Link>
        </div>
      </section>
      {posts.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <h2 className="text-3xl font-bold">Hebahan Terkini</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
          <Link href="/hebahan" className="mt-6 inline-block min-h-[44px] underline">Semua hebahan →</Link>
        </section>
      ) : null}
      <FAQ />
      <Dedicated />
    </main>
  );
}
