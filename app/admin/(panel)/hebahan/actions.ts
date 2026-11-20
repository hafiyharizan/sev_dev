'use server';

import { revalidateTag } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { deleteFile } from '@/lib/storage-server';
import { slugify } from '@/lib/slug';
import { TAGS } from '@/lib/cache-tags';
import { uniqueSlug, validatePostInput } from '@/lib/posts';

export type PostFormState = { ok?: boolean; slug?: string; error?: string };

export async function savePost(_prev: PostFormState, fd: FormData): Promise<PostFormState> {
  await requireUser();
  const parsed = validatePostInput(fd);
  if (!parsed.ok) return { error: parsed.error };
  const v = parsed.value;
  const supabase = createClient();
  const columns = {
    type: v.type, title: v.title, subtitle: v.subtitle, body: v.body,
    image_path: v.imagePath, external_url: v.externalUrl, pinned: v.pinned,
  };

  const id = String(fd.get('id') ?? '').trim();
  if (id) {
    const { data: existing } = await supabase.from('posts').select('image_path, slug').eq('id', id).maybeSingle();
    if (!existing) return { error: 'Hebahan tidak dijumpai.' };
    const { error } = await supabase.from('posts').update(columns).eq('id', id);
    if (error) return { error: 'Gagal menyimpan. Cuba lagi.' };
    if (existing.image_path && existing.image_path !== v.imagePath) await deleteFile(existing.image_path);
    revalidateTag(TAGS.posts);
    return { ok: true, slug: existing.slug }; // slug never changes: shared WhatsApp links must keep working
  }

  const base = slugify(v.title) || 'hebahan';
  const { data: taken } = await supabase.from('posts').select('slug').like('slug', `${base}%`);
  const slug = uniqueSlug(base, (taken ?? []).map((r: { slug: string }) => r.slug));
  const { error } = await supabase.from('posts').insert({ ...columns, slug });
  if (error) return { error: 'Gagal menyimpan. Cuba lagi.' };
  revalidateTag(TAGS.posts);
  return { ok: true, slug };
}

export async function deletePost(id: string): Promise<void> {
  await requireUser();
  const supabase = createClient();
  const { data: existing } = await supabase.from('posts').select('image_path, slug').eq('id', id).maybeSingle();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw new Error('DELETE_FAILED');
  await deleteFile(existing?.image_path ?? null);
  revalidateTag(TAGS.posts);
}
