'use server';

import { revalidateTag } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { deleteFile } from '@/lib/storage-server';
import { storagePathFromUrl } from '@/lib/storage';
import { validateLink } from '@/lib/links';
import { TAGS } from '@/lib/cache-tags';

export type LinkFormState = { ok?: boolean; error?: string };

export async function saveLink(_prev: LinkFormState, fd: FormData): Promise<LinkFormState> {
  await requireUser();
  const parsed = validateLink(fd);
  if (!parsed.ok) return { error: parsed.error };
  const v = parsed.value;
  const columns = { title: v.title, url: v.url, description: v.description, category: v.category };
  const supabase = createClient();
  const id = String(fd.get('id') ?? '').trim();
  let oldUrl: string | null = null;
  if (id) {
    const { data } = await supabase.from('links').select('url').eq('id', id).maybeSingle();
    oldUrl = data?.url ?? null;
  }
  const { error } = id
    ? await supabase.from('links').update(columns).eq('id', id)
    : await supabase.from('links').insert({ ...columns, sort_order: 0 });
  if (error) return { error: 'Gagal menyimpan. Cuba lagi.' };
  const oldPath = oldUrl && oldUrl !== v.url ? storagePathFromUrl(oldUrl) : null;
  if (oldPath) await deleteFile(oldPath); // replaced an uploaded PDF
  revalidateTag(TAGS.links);
  return { ok: true };
}

export async function deleteLink(id: string): Promise<void> {
  await requireUser();
  const supabase = createClient();
  const { data } = await supabase.from('links').select('url').eq('id', id).maybeSingle();
  const { error } = await supabase.from('links').delete().eq('id', id);
  if (error) throw new Error('DELETE_FAILED');
  const path = data?.url ? storagePathFromUrl(data.url) : null;
  if (path) await deleteFile(path);
  revalidateTag(TAGS.links);
}
