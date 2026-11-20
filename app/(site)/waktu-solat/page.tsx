import PrayerWidget from '@/app/components/PrayerWidget';
import { getPrayerDays } from '@/lib/data/prayer';
import { getSettings } from '@/lib/data/settings';
import { DEFAULT_OFFSETS } from '@/lib/data/settings';
import { addDays, formatTimeMY, todayMY } from '@/lib/time/clock';
import { safe } from '@/lib/safe';

export const metadata = { title: 'Waktu Solat · Surau Elmina Valley' };
export const dynamic = 'force-dynamic';

export default async function WaktuSolat() {
  const today = todayMY();
  const monthStart = `${today.slice(0, 8)}01`;
  const monthEnd = `${today.slice(0, 8)}${String(new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7), 0)).getUTCDate()).padStart(2, '0')}`;
  const [days, settings] = await Promise.all([
    safe(getPrayerDays(monthStart, addDays(monthEnd, 1)), []),
    safe(getSettings(), { prayerZone: 'SGR01', iqamahOffsets: DEFAULT_OFFSETS }),
  ]);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 lg:px-8">
      <h1 className="text-4xl font-bold">Waktu Solat</h1>
      <PrayerWidget days={days} initialDate={today} offsets={settings.iqamahOffsets} />
      {days.length > 0 ? (
        <div className="overflow-x-auto rounded-3xl bg-white p-4">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-darkgrey">
                {['Tarikh', 'Subuh', 'Syuruk', 'Zohor', 'Asar', 'Maghrib', 'Isyak'].map((h) => <th key={h} className="px-2 py-2 font-normal">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {days.filter((d) => d.date <= monthEnd).map((d) => (
                <tr key={d.date} className={d.date === today ? 'bg-lightblue font-semibold' : ''}>
                  <td className="px-2 py-1.5">{Number(d.date.slice(8))}</td>
                  {(['subuh', 'syuruk', 'zohor', 'asar', 'maghrib', 'isyak'] as const).map((p) => <td key={p} className="px-2 py-1.5">{formatTimeMY(d[p]).replace(/ \w+$/, '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-darkgrey">Sumber: JAKIM, zon {settings.prayerZone}.</p>
        </div>
      ) : null}
    </main>
  );
}
