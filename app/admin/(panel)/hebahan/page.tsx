import Link from 'next/link';
import ConfirmDelete from '@/app/components/admin/ConfirmDelete';
import { listPostsForAdmin } from '@/lib/data/posts';
import { formatDateMY } from '@/lib/format';
import { deletePost } from './actions';

export const dynamic = 'force-dynamic';

export default async function HebahanAdmin() {
  const posts = await listPostsForAdmin();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Hebahan</h1>
        <Link href="/admin/hebahan/baru" className="min-h-[44px] rounded-full bg-navyblue px-5 py-3 text-white">+ Hebahan</Link>
      </div>
      {posts.length === 0 ? (
        <p>Tiada rekod lagi. Klik &apos;+ Hebahan&apos; untuk mula.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.pinned ? '📌 ' : ''}{p.title}</p>
                <p className="text-sm text-darkgrey">{p.type === 'buletin' ? 'Buletin' : 'Pengumuman'} · {formatDateMY(p.publishedAt)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={`/admin/hebahan/${p.id}`} className="inline-flex min-h-[44px] items-center rounded-lg border border-linegrey px-3 text-sm">Sunting</Link>
                <ConfirmDelete action={deletePost.bind(null, p.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
