import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ShareButton from '@/app/components/ShareButton';
import { getPostBySlug } from '@/lib/data/posts';
import { formatDateMY } from '@/lib/format';
import { postDescription } from '@/lib/posts';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Hebahan tidak dijumpai' };
  const description = postDescription(post);
  return {
    title: `${post.title} · Surau Elmina Valley`,
    description,
    openGraph: { title: post.title, description, type: 'article', ...(post.imageUrl ? { images: [post.imageUrl] } : {}) },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="w-full rounded-3xl" />
      ) : null}
      <p className="mt-6 text-sm opacity-75">{formatDateMY(post.publishedAt)}</p>
      <h1 className="mt-2 text-4xl font-bold">{post.title}</h1>
      {post.subtitle ? <p className="mt-2 text-xl font-semibold">{post.subtitle}</p> : null}
      {post.body ? <p className="mt-6 whitespace-pre-line text-lg leading-8">{post.body}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {post.externalUrl ? (
          <a href={post.externalUrl} className="min-h-[44px] rounded-full bg-navyblue px-5 py-3 text-white"
            {...(post.externalUrl.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            Buka pautan
          </a>
        ) : null}
        <ShareButton path={`/hebahan/${post.slug}`} title={post.title} />
      </div>
    </main>
  );
}
