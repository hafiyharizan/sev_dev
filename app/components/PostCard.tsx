import Link from 'next/link';
import FadeIn from './FadeIn';
import { formatDateMY } from '@/lib/format';
import type { Post } from '@/lib/posts';

export default function PostCard({ post }: { post: Post }) {
  const inner = (
    <>
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" loading="lazy" decoding="async" className="h-60 w-full rounded-3xl object-cover" />
      ) : null}
      <div className="pt-4">
        <span className="rounded-full bg-lightblue px-3 py-1 text-xs font-semibold text-blue">
          {post.type === 'buletin' ? 'Buletin' : 'Pengumuman'}
        </span>
        <h3 className="pt-3 text-2xl font-bold text-black">{post.title}</h3>
        {post.subtitle ? <p className="pt-1 text-lg font-semibold text-black">{post.subtitle}</p> : null}
        <p className="pt-2 text-sm opacity-75">{formatDateMY(post.publishedAt)}</p>
      </div>
    </>
  );
  const cls = 'block rounded-3xl bg-white p-4 shadow-sm';
  return (
    <FadeIn>
    {post.externalUrl ? (
    <a href={post.externalUrl} className={cls}
      {...(post.externalUrl.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      aria-label={post.title}>
      {inner}
    </a>
  ) : (
    <Link href={`/hebahan/${post.slug}`} className={cls} aria-label={post.title}>{inner}</Link>
  )}
    </FadeIn>
  );
}
