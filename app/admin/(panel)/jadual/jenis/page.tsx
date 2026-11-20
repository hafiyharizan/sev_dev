import Link from 'next/link';
import ConfirmDelete from '@/app/components/admin/ConfirmDelete';
import { listProgramTypes } from '@/lib/data/schedule';
import { countSessionsByType } from '@/lib/data/schedule-admin';
import { sessionTimeLabel } from '@/lib/time/session-time';
import TypeForm from './TypeForm';
import { deleteProgramType } from './actions';

export const dynamic = 'force-dynamic';

export default async function JenisPage({ searchParams }: { searchParams: { id?: string } }) {
  const [types, used] = await Promise.all([listProgramTypes(), countSessionsByType()]);
  const editing = types.find((t) => t.id === searchParams.id) ?? null;
  return (
    <div className="space-y-6">
      <Link href="/admin/jadual" className="inline-block min-h-[44px] underline">← Jadual</Link>
      <h1 className="text-2xl font-bold">Jenis Program</h1>
      <ul className="space-y-3">
        {types.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-6 w-6 shrink-0 rounded-md" style={{ background: t.colour }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate font-medium">{t.name}</p>
                <p className="text-sm text-darkgrey">{sessionTimeLabel(t.timing, null).label} · {used[t.id] ?? 0} sesi</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href={`/admin/jadual/jenis?id=${t.id}`} className="inline-flex min-h-[44px] items-center rounded-lg border border-linegrey px-3 text-sm">Sunting</Link>
              {(used[t.id] ?? 0) === 0 ? <ConfirmDelete action={deleteProgramType.bind(null, t.id)} /> : null}
            </div>
          </li>
        ))}
      </ul>
      <TypeForm type={editing} />
    </div>
  );
}
