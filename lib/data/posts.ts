import { createPublicClient } from '@/lib/supabase/public';
import { createClient } from '@/lib/supabase/server';
import { TAGS } from '@/lib/cache-tags';
import { rowToPost, type Post, type PostRow, type PostType } from '@/lib/posts';

const COLUMNS = 'id, type, slug, title, subtitle, body, image_path, external_url, published_at, pinned';

/** Public list: pinned first, then newest. */
export async function listPosts(opts: { type?: PostType; limit?: number } = {}): Promise<Post[]> {
  let q = createPublicClient([TAGS.posts]).from('posts').select(COLUMNS)
    .order('pinned', { ascending: false }).order('published_at', { ascending: false });
  if (opts.type) q = q.eq('type', opts.type);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as PostRow[]).map(rowToPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await createPublicClient([TAGS.posts]).from('posts').select(COLUMNS).eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? rowToPost(data as PostRow) : null;
}

/** Admin: uncached reads as the logged-in user. */
export async function listPostsForAdmin(): Promise<Post[]> {
  const { data, error } = await createClient().from('posts').select(COLUMNS).order('published_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as PostRow[]).map(rowToPost);
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data } = await createClient().from('posts').select(COLUMNS).eq('id', id).maybeSingle();
  return data ? rowToPost(data as PostRow) : null;
}
