import Link from 'next/link';
import ConfirmDelete from '@/app/components/admin/ConfirmDelete';
import CopyMonthButton from '@/app/components/admin/CopyMonthButton';
import PosterPreview from '@/app/components/admin/PosterPreview';
import { listProgramTypes, listSessions } from '@/lib/data/schedule';
import { formatDateMY } from '@/lib/format';
import { buildPosterModel } from '@/lib/poster/model';
import { sessionTimeLabel } from '@/lib/time/session-time';
import { todayMY } from '@/lib/time/clock';
import { deleteSession } from './actions';

export const dynamic = 'force-dynamic';

const pad = (n: number) => String(n).padStart(2, '0');

export default async function JadualAdmin({ searchParams }: { searchParams: { bulan?: string } }) {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(searchParams.bulan ?? '') ?? /^(\d{4})-(\d{2})$/.exec(todayMY().slice(0, 7))!;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const key = `${year}-${pad(month)}`;
  const prev = month === 1 ? `${year - 1}-12` : `${year}-${pad(month - 1)}`;
  const next = month === 12 ? `${year + 1}-01` : `${year}-${pad(month + 1)}`;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const [sessions, types] = await Promise.all([listSessions(`${key}-01`, `${key}-${pad(last)}`), listProgramTypes()]);
  const crowded = buildPosterModel(year, month, sessions, types).weeks.flat().filter((c) => c.crowded).map((c) => c.day);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Jadual</h1>
        <Link href={`/admin/jadual/sesi/baru?tarikh=${key}-01`} className="min-h-[44px] rounded-full bg-navyblue px-5 py-3 text-white">+ Sesi</Link>
      </div>
      <nav aria-label="Bulan" className="flex items-center gap-4">
        <Link href={`/admin/jadual?bulan=${prev}`} className="min-h-[44px] px-3 py-3" aria-label="Bulan sebelum">←</Link>
        <span className="font-medium">{formatDateMY(`${key}-01`).replace(/^1 /, '')}</span>
        <Link href={`/admin/jadual?bulan=${next}`} className="min-h-[44px] px-3 py-3" aria-label="Bulan seterusnya">→</Link>
      </nav>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href="/admin/jadual/jenis" className="min-h-[44px] underline">Jenis Program</Link>
        <Link href="/admin/jadual/ustaz" className="min-h-[44px] underline">Ustaz</Link>
      </div>
      <CopyMonthButton year={year} month={month} />
      {crowded.length > 0 ? (
        <p role="status" className="rounded-xl bg-yellow-50 p-3 text-sm">Hari padat pada poster (teks dipendekkan atau lebih 2 sesi): {crowded.join(', ')}.</p>
      ) : null}
      {sessions.length === 0 ? (
        <p>Tiada rekod lagi. Klik &apos;+ Sesi&apos; untuk mula.</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => {
            const t = sessionTimeLabel(s.timing, null);
            return (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ background: s.type.colour }} aria-hidden="true" />
                    <span className={`truncate ${s.status === 'cancelled' ? 'line-through' : ''}`}>{s.topic ?? s.type.name}</span>
                  </p>
                  <p className="text-sm text-darkgrey">{formatDateMY(s.date)} · {t.label}{s.speaker ? ` · ${s.speaker.name}` : ''}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={`/admin/jadual/sesi/${s.id}`} className="inline-flex min-h-[44px] items-center rounded-lg border border-linegrey px-3 text-sm">Sunting</Link>
                  <ConfirmDelete action={deleteSession.bind(null, s.id)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <PosterPreview month={key} />
    </div>
  );
}
