import Link from 'next/link';
import PostCard from '@/app/components/PostCard';
import { listPosts } from '@/lib/data/posts';
import { safe } from '@/lib/safe';

export const metadata = { title: 'Hebahan · Surau Elmina Valley' };
export const revalidate = 3600;

const FILTERS = [
  { key: undefined, label: 'Semua' },
  { key: 'pengumuman', label: 'Pengumuman' },
  { key: 'buletin', label: 'Buletin' },
] as const;

export default async function HebahanPage({ searchParams }: { searchParams: { jenis?: string } }) {
  const jenis = searchParams.jenis === 'pengumuman' || searchParams.jenis === 'buletin' ? searchParams.jenis : undefined;
  const posts = await safe(listPosts({ type: jenis }), []);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="text-4xl font-bold">Hebahan</h1>
      <nav aria-label="Tapis" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f.label} href={f.key ? `/hebahan?jenis=${f.key}` : '/hebahan'}
            aria-current={f.key === jenis ? 'page' : undefined}
            className={`min-h-[44px] rounded-full px-4 py-3 text-sm ${f.key === jenis ? 'bg-navyblue text-white' : 'bg-white'}`}>
            {f.label}
          </Link>
        ))}
      </nav>
      {posts.length === 0 ? (
        <p className="mt-10">Tiada hebahan lagi.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </main>
  );
}
