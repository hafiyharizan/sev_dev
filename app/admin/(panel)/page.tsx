import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMonthlyCounts } from '@/lib/data/analytics';
import { getLatestFetchedAt } from '@/lib/data/prayer';
import { formatDateMY } from '@/lib/format';
import { todayMY } from '@/lib/time/clock';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createClient();
  const [year, month] = todayMY().split('-').map(Number);
  const ym = `${year}-${String(month).padStart(2, '0')}`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const count = (table: string) => supabase.from(table).select('*', { count: 'exact', head: true });

  const [posts, links, sessions, counts, fetchedAt] = await Promise.all([
    count('posts'),
    count('links'),
    count('sessions').gte('date', `${ym}-01`).lte('date', `${ym}-${lastDay}`),
    getMonthlyCounts(year, month),
    getLatestFetchedAt(),
  ]);

  const tiles = [
    { label: 'Hebahan', value: posts.count ?? 0 },
    { label: 'Sesi bulan ini', value: sessions.count ?? 0 },
    { label: 'Borang & pautan', value: links.count ?? 0 },
    { label: 'Dipasang (bulan ini)', value: counts.pwa_install },
    { label: 'Imbasan QR (bulan ini)', value: counts.qr_scan },
    { label: 'Kongsi (bulan ini)', value: counts.share_click },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Utama</h1>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/hebahan/baru" className="min-h-[44px] rounded-full bg-navyblue px-5 py-3 text-white">+ Hebahan</Link>
        <Link href="/admin/jadual/sesi/baru" className="min-h-[44px] rounded-full bg-blue px-5 py-3 text-white">+ Sesi</Link>
      </div>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl bg-white p-4">
            <dt className="text-sm text-darkgrey">{t.label}</dt>
            <dd className="text-3xl font-bold">{t.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm">
        Waktu solat dikemas kini: {fetchedAt ? formatDateMY(fetchedAt) : 'belum pernah — maklumkan Hafiy'}
      </p>
      <p className="text-sm">
        Jumlah lawatan: <a className="underline" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">buka Vercel Analytics</a>
      </p>
    </div>
  );
}
