import Link from 'next/link';
import ConfirmDelete from '@/app/components/admin/ConfirmDelete';
import { listLinks } from '@/lib/data/links';
import LinkForm from './LinkForm';
import { deleteLink } from './actions';

export const dynamic = 'force-dynamic';

export default async function BorangAdmin({ searchParams }: { searchParams: { id?: string } }) {
  const links = await listLinks();
  const editing = links.find((l) => l.id === searchParams.id) ?? null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Borang & Pautan</h1>
      {links.length === 0 ? <p>Tiada rekod lagi.</p> : (
        <ul className="space-y-3">
          {links.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{l.title}</p>
                <p className="truncate text-sm text-darkgrey">{l.category} · {l.url}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={`/admin/borang?id=${l.id}`} className="inline-flex min-h-[44px] items-center rounded-lg border border-linegrey px-3 text-sm">Sunting</Link>
                <ConfirmDelete action={deleteLink.bind(null, l.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <LinkForm link={editing} />
    </div>
  );
}
