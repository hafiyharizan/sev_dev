'use server';

import { requireUser } from '@/lib/auth';
import { SESSION_EXPIRED } from '@/lib/auth-messages';
import { createClient } from '@/lib/supabase/server';
import { deleteFile } from '@/lib/storage-server';
import { validateSpeaker } from '@/lib/schedule';
import { bustSchedule } from '../bust';

export type SpeakerFormState = { ok?: boolean; error?: string };

export async function saveSpeaker(_prev: SpeakerFormState, fd: FormData): Promise<SpeakerFormState> {
  try {
    await requireUser();
  } catch {
    return { error: SESSION_EXPIRED }; // keep the form and its values; the message tells them to log in again
  }
  const parsed = validateSpeaker(fd);
  if (!parsed.ok) return { error: parsed.error };
  const v = parsed.value;
  const columns = { name: v.name, title_line: v.titleLine, photo_path: v.photoPath, active: v.active };
  const supabase = createClient();
  const id = String(fd.get('id') ?? '').trim();
  if (id) {
    const { data: existing } = await supabase.from('speakers').select('photo_path').eq('id', id).maybeSingle();
    const { error } = await supabase.from('speakers').update(columns).eq('id', id);
    if (error) return { error: 'Gagal menyimpan. Cuba lagi.' };
    if (existing?.photo_path && existing.photo_path !== v.photoPath) await deleteFile(existing.photo_path);
  } else {
    const { error } = await supabase.from('speakers').insert(columns);
    if (error) return { error: 'Gagal menyimpan. Cuba lagi.' };
  }
  bustSchedule();
  return { ok: true };
}

export async function deleteSpeaker(id: string): Promise<void> {
  await requireUser();
  const supabase = createClient();
  const { data: existing } = await supabase.from('speakers').select('photo_path').eq('id', id).maybeSingle();
  const { error } = await supabase.from('speakers').delete().eq('id', id); // sessions keep running: speaker_id is set null
  if (error) throw new Error('DELETE_FAILED');
  await deleteFile(existing?.photo_path ?? null);
  bustSchedule();
}
