'use server';

import { requireUser } from '@/lib/auth';
import { SESSION_EXPIRED } from '@/lib/auth-messages';
import { createClient } from '@/lib/supabase/server';
import { timingColumns, validateProgramType } from '@/lib/schedule';
import { bustSchedule } from '../bust';

export type TypeFormState = { ok?: boolean; error?: string };

export async function saveProgramType(_prev: TypeFormState, fd: FormData): Promise<TypeFormState> {
  try {
    await requireUser();
  } catch {
    return { error: SESSION_EXPIRED }; // keep the form and its values; the message tells them to log in again
  }
  const parsed = validateProgramType(fd);
  if (!parsed.ok) return { error: parsed.error };
  const v = parsed.value;
  const columns = {
    name: v.name, colour: v.colour, default_duration_minutes: v.durationMinutes,
    ...timingColumns(v.timing),
    offset_minutes: v.timing.mode === 'prayer' ? v.timing.offsetMinutes : 0, // program_types.offset_minutes is NOT NULL
  };
  const supabase = createClient();
  const id = String(fd.get('id') ?? '').trim();
  const { error } = id
    ? await supabase.from('program_types').update(columns).eq('id', id)
    : await supabase.from('program_types').insert({ ...columns, sort_order: Date.now() % 100000 });
  if (error) return { error: 'Gagal menyimpan. Cuba lagi.' };
  bustSchedule();
  return { ok: true };
}

/** Refuses (silently) while any session still uses the type; the admin list disables the button too. */
export async function deleteProgramType(id: string): Promise<void> {
  await requireUser();
  const supabase = createClient();
  const { count } = await supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('program_type_id', id);
  if ((count ?? 0) > 0) return;
  const { error } = await supabase.from('program_types').delete().eq('id', id);
  if (error) throw new Error('DELETE_FAILED');
  bustSchedule();
}
