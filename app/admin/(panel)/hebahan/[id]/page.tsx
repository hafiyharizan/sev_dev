import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/data/posts';
import PostForm from '../PostForm';

export const dynamic = 'force-dynamic';

export default async function EditPost({ params }: { params: { id: string } }) {
  const post = params.id === 'baru' ? null : await getPostById(params.id);
  if (params.id !== 'baru' && !post) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{post ? 'Sunting hebahan' : 'Hebahan baharu'}</h1>
      <PostForm post={post} />
    </div>
  );
}
