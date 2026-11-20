import { createPublicClient } from '@/lib/supabase/public';
import { TAGS } from '@/lib/cache-tags';
import {
  rowToProgramType, rowToSession, rowToSpeaker,
  type ProgramType, type ProgramTypeRow, type SessionJoinRow, type SessionView, type Speaker, type SpeakerRow,
} from '@/lib/schedule';

const SCHEDULE_TAGS = [TAGS.sessions, TAGS.programTypes, TAGS.speakers];
const TYPE_COLS = 'id, name, colour, sort_order, time_mode, anchor_prayer, offset_minutes, fixed_time, default_duration_minutes';
const SESSION_COLS =
  `id, slug, date, status, topic, kitab, notes, time_mode, anchor_prayer, offset_minutes, fixed_time, ` +
  `program_types(${TYPE_COLS}), speakers(name, title_line, photo_path)`;

/** Sessions between two YYYY-MM-DD dates inclusive, oldest first. */
export async function listSessions(from: string, to: string): Promise<SessionView[]> {
  const { data, error } = await createPublicClient(SCHEDULE_TAGS)
    .from('sessions').select(SESSION_COLS).gte('date', from).lte('date', to)
    .order('date').order('created_at');
  if (error) throw error;
  return ((data ?? []) as unknown as SessionJoinRow[]).map(rowToSession);
}

export async function getSessionBySlug(slug: string): Promise<SessionView | null> {
  const { data, error } = await createPublicClient(SCHEDULE_TAGS).from('sessions').select(SESSION_COLS).eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? rowToSession(data as unknown as SessionJoinRow) : null;
}

export async function listProgramTypes(): Promise<ProgramType[]> {
  const { data, error } = await createPublicClient(SCHEDULE_TAGS).from('program_types').select(TYPE_COLS).order('sort_order');
  if (error) throw error;
  return ((data ?? []) as ProgramTypeRow[]).map(rowToProgramType);
}

export async function listSpeakers(opts: { activeOnly?: boolean } = {}): Promise<Speaker[]> {
  let q = createPublicClient(SCHEDULE_TAGS).from('speakers').select('id, name, title_line, photo_path, active').order('name');
  if (opts.activeOnly) q = q.eq('active', true);
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as SpeakerRow[]).map(rowToSpeaker);
}
