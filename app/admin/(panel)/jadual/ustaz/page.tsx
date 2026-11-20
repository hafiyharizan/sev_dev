import Link from 'next/link';
import ConfirmDelete from '@/app/components/admin/ConfirmDelete';
import { listSpeakers } from '@/lib/data/schedule';
import SpeakerForm from './SpeakerForm';
import { deleteSpeaker } from './actions';

export const dynamic = 'force-dynamic';

export default async function UstazPage({ searchParams }: { searchParams: { id?: string } }) {
  const speakers = await listSpeakers();
  const editing = speakers.find((s) => s.id === searchParams.id) ?? null;
  return (
    <div className="space-y-6">
      <Link href="/admin/jadual" className="inline-block min-h-[44px] underline">← Jadual</Link>
      <h1 className="text-2xl font-bold">Ustaz</h1>
      {speakers.length === 0 ? <p>Tiada rekod lagi.</p> : (
        <ul className="space-y-3">
          {speakers.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
              <div className="flex min-w-0 items-center gap-3">
                {s.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photoUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                ) : <span className="h-12 w-12 shrink-0 rounded-full bg-lightgrey" aria-hidden="true" />}
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="text-sm text-darkgrey">{s.active ? 'Aktif' : 'Tidak aktif'}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={`/admin/jadual/ustaz?id=${s.id}`} className="inline-flex min-h-[44px] items-center rounded-lg border border-linegrey px-3 text-sm">Sunting</Link>
                <ConfirmDelete action={deleteSpeaker.bind(null, s.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <SpeakerForm speaker={editing} />
    </div>
  );
}
