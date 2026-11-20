'use server';

import { requireUser } from '@/lib/auth';
import { SESSION_EXPIRED } from '@/lib/auth-messages';
import { createClient } from '@/lib/supabase/server';
import {
  planCopy, planNewSessions, timingColumns, validateSessionInput,
  type PrevSessionRow,
} from '@/lib/schedule';
import { bustSchedule } from './bust';

export type SessionFormState = { ok?: boolean; created?: number; error?: string };
export type CopyResult = { error?: string; created?: number; skipped?: { date: string; topic: string | null }[] };

const SAVE_ERROR = 'Gagal menyimpan. Cuba lagi.';
const pad = (n: number) => String(n).padStart(2, '0');
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

export async function saveSession(_prev: SessionFormState, fd: FormData): Promise<SessionFormState> {
  try {
    await requireUser();
  } catch {
    return { error: SESSION_EXPIRED }; // keep the form and its values; the message tells them to log in again
  }
  const parsed = validateSessionInput(fd);
  if (!parsed.ok) return { error: parsed.error };
  const v = parsed.value;
  const supabase = createClient();

  const id = String(fd.get('id') ?? '').trim();
  if (id) {
    const { error } = await supabase.from('sessions').update({
      date: v.date, program_type_id: v.programTypeId, speaker_id: v.speakerId, topic: v.topic, kitab: v.kitab,
      notes: v.notes, status: v.status, ...timingColumns(v.timing), // slug is kept: shared links must keep working
    }).eq('id', id);
    if (error) return { error: SAVE_ERROR };
    bustSchedule();
    return { ok: true, created: 0 };
  }

  const { data: type } = await supabase.from('program_types').select('name').eq('id', v.programTypeId).maybeSingle();
  if (!type) return { error: 'Jenis program tidak dijumpai.' };
  const { data: taken } = await supabase.from('sessions').select('slug').like('slug', `${v.date.slice(0, 7)}-%`);
  const rows = planNewSessions(v, type.name, (taken ?? []).map((r: { slug: string }) => r.slug));
  const { error } = await supabase.from('sessions').insert(rows);
  if (error) return { error: SAVE_ERROR };
  bustSchedule();
  return { ok: true, created: rows.length };
}

export async function deleteSession(id: string): Promise<void> {
  await requireUser();
  const { error } = await createClient().from('sessions').delete().eq('id', id);
  if (error) throw new Error('DELETE_FAILED');
  bustSchedule();
}

/** "Salin bulan lepas": `month` is the TARGET month (1-12). */
export async function copyLastMonth(year: number, month: number): Promise<CopyResult> {
  await requireUser();
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    return { error: 'Bulan tidak sah.' };
  }
  const supabase = createClient();
  const range = (y: number, m: number) => [`${y}-${pad(m)}-01`, `${y}-${pad(m)}-${pad(lastDay(y, m))}`] as const;

  const [from, to] = range(year, month);
  const { count } = await supabase.from('sessions').select('*', { count: 'exact', head: true }).gte('date', from).lte('date', to);
  if ((count ?? 0) > 0) return { error: 'Bulan ini sudah ada sesi. Padam atau tambah secara manual.' };

  const py = month === 1 ? year - 1 : year;
  const pm = month === 1 ? 12 : month - 1;
  const [pFrom, pTo] = range(py, pm);
  const { data: prev } = await supabase.from('sessions')
    .select('date, program_type_id, speaker_id, topic, kitab, notes, time_mode, anchor_prayer, offset_minutes, fixed_time')
    .gte('date', pFrom).lte('date', pTo).eq('status', 'scheduled');
  const { data: taken } = await supabase.from('sessions').select('slug').like('slug', `${year}-${pad(month)}-%`);
  const { data: types } = await supabase.from('program_types').select('id, name');
  const typeNames = Object.fromEntries(((types ?? []) as { id: string; name: string }[]).map((t) => [t.id, t.name]));

  const { rows, skipped } = planCopy((prev ?? []) as PrevSessionRow[], year, month, (taken ?? []).map((r: { slug: string }) => r.slug), typeNames);
  if (rows.length > 0) {
    const { error } = await supabase.from('sessions').insert(rows);
    if (error) return { error: SAVE_ERROR };
    bustSchedule();
  }
  return { created: rows.length, skipped };
}
