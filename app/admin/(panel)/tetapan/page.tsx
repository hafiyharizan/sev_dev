import Link from 'next/link';
import { getSettings } from '@/lib/data/settings';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function Tetapan() {
  const s = await getSettings();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tetapan</h1>
      <SettingsForm zone={s.prayerZone} offsets={s.iqamahOffsets} />
      <Link href="/admin/tetapan/jemputan" className="inline-block min-h-[44px] underline">Jemputan & senarai admin →</Link>
    </div>
  );
}
