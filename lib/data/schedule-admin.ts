import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type SessionEditRow = {
  id: string; date: string; program_type_id: string; speaker_id: string | null; topic: string | null; kitab: string | null;
  notes: string | null; status: string; time_mode: string | null; anchor_prayer: string | null;
  offset_minutes: number | null; fixed_time: string | null;
};

/** Raw columns for the edit form (the public view hides ids and the override fields). */
export async function getSessionForEdit(id: string): Promise<SessionEditRow | null> {
  const { data } = await createClient().from('sessions')
    .select('id, date, program_type_id, speaker_id, topic, kitab, notes, status, time_mode, anchor_prayer, offset_minutes, fixed_time')
    .eq('id', id).maybeSingle();
  return (data as SessionEditRow | null) ?? null;
}

/** How many sessions use each program type (to block deleting one that is in use). */
export async function countSessionsByType(): Promise<Record<string, number>> {
  const { data } = await createClient().from('sessions').select('program_type_id');
  const counts: Record<string, number> = {};
  for (const r of (data ?? []) as { program_type_id: string }[]) counts[r.program_type_id] = (counts[r.program_type_id] ?? 0) + 1;
  return counts;
}
