import { PRAYERS, type Prayer, type Timing } from '@/lib/types';
import { isUploadPath, publicUrl } from '@/lib/storage';
import { sessionSlug } from '@/lib/slug';
import { uniqueSlug } from '@/lib/posts';
import { copyMonthDates, weekdaysInMonth } from '@/lib/time/month';

// ---------- view types ----------

export type ProgramType = {
  id: string; name: string; colour: string; sortOrder: number; timing: Timing; durationMinutes: number | null;
};
export type Speaker = { id: string; name: string; titleLine: string | null; photoPath: string | null; photoUrl: string | null; active: boolean };
export type SessionView = {
  id: string; slug: string; date: string; status: 'scheduled' | 'cancelled';
  topic: string | null; kitab: string | null; notes: string | null;
  type: { id: string; name: string; colour: string };
  speaker: { name: string; titleLine: string | null; photoUrl: string | null } | null;
  timing: Timing; // the override if set, otherwise the program type's default
};

// ---------- rows -> views ----------

type TimingCols = { time_mode: string | null; anchor_prayer: string | null; offset_minutes: number | null; fixed_time: string | null };

export function rowToTiming(r: TimingCols): Timing | null {
  if (r.time_mode === 'prayer' && r.anchor_prayer) {
    return { mode: 'prayer', anchor: r.anchor_prayer as Prayer, offsetMinutes: r.offset_minutes ?? 0 };
  }
  if (r.time_mode === 'fixed' && r.fixed_time) return { mode: 'fixed', time: r.fixed_time };
  return null;
}

export type ProgramTypeRow = TimingCols & {
  id: string; name: string; colour: string; sort_order: number; default_duration_minutes: number | null;
};
export function rowToProgramType(r: ProgramTypeRow): ProgramType {
  return {
    id: r.id, name: r.name, colour: r.colour, sortOrder: r.sort_order,
    timing: rowToTiming(r) ?? { mode: 'prayer', anchor: 'maghrib', offsetMinutes: 0 },
    durationMinutes: r.default_duration_minutes,
  };
}

export type SpeakerRow = { id: string; name: string; title_line: string | null; photo_path: string | null; active: boolean };
export function rowToSpeaker(r: SpeakerRow): Speaker {
  return { id: r.id, name: r.name, titleLine: r.title_line, photoPath: r.photo_path,
    photoUrl: r.photo_path ? publicUrl(r.photo_path) : null, active: r.active };
}

export type SessionJoinRow = TimingCols & {
  id: string; slug: string; date: string; status: string; topic: string | null; kitab: string | null; notes: string | null;
  program_types: ProgramTypeRow; speakers: { name: string; title_line: string | null; photo_path: string | null } | null;
};
export function rowToSession(r: SessionJoinRow): SessionView {
  const type = rowToProgramType(r.program_types);
  return {
    id: r.id, slug: r.slug, date: r.date, status: r.status === 'cancelled' ? 'cancelled' : 'scheduled',
    topic: r.topic, kitab: r.kitab, notes: r.notes,
    type: { id: type.id, name: type.name, colour: type.colour },
    speaker: r.speakers
      ? { name: r.speakers.name, titleLine: r.speakers.title_line, photoUrl: r.speakers.photo_path ? publicUrl(r.speakers.photo_path) : null }
      : null,
    timing: rowToTiming(r) ?? type.timing,
  };
}

// ---------- form validation ----------

type Result<T> = { ok: true; value: T } | { ok: false; error: string };
const text = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const orNull = (s: string) => (s === '' ? null : s);
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const UUID = /^[0-9a-f-]{36}$/;

function validDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function parseTiming(fd: FormData): Result<Timing> {
  if (text(fd, 'time_mode') === 'fixed') {
    const time = text(fd, 'time');
    return HHMM.test(time) ? { ok: true, value: { mode: 'fixed', time } } : { ok: false, error: 'Masa tidak sah.' };
  }
  const anchor = text(fd, 'anchor') as Prayer;
  const offset = Number(text(fd, 'offset') || '0');
  if (!PRAYERS.includes(anchor) || !Number.isInteger(offset) || offset < -180 || offset > 180) {
    return { ok: false, error: 'Anjakan masa tidak sah.' };
  }
  return { ok: true, value: { mode: 'prayer', anchor, offsetMinutes: offset } };
}

export type SessionInput = {
  date: string; programTypeId: string; speakerId: string | null; topic: string | null; kitab: string | null;
  notes: string | null; status: 'scheduled' | 'cancelled'; timing: Timing | null; repeatWeekly: boolean;
};

export function validateSessionInput(fd: FormData): Result<SessionInput> {
  const date = text(fd, 'date');
  if (!validDate(date)) return { ok: false, error: 'Tarikh diperlukan.' };
  const programTypeId = text(fd, 'program_type_id');
  if (!UUID.test(programTypeId)) return { ok: false, error: 'Jenis program diperlukan.' };
  const speakerId = orNull(text(fd, 'speaker_id'));
  if (speakerId && !UUID.test(speakerId)) return { ok: false, error: 'Ustaz tidak sah.' };
  const topic = orNull(text(fd, 'topic'));
  const kitab = orNull(text(fd, 'kitab'));
  if ((topic && topic.length > 200) || (kitab && kitab.length > 200)) return { ok: false, error: 'Teks terlalu panjang (maksimum 200 aksara).' };

  let timing: Timing | null = null;
  if (fd.get('custom_time') === 'on') {
    const t = parseTiming(fd);
    if (!t.ok) return t;
    timing = t.value;
  }
  return {
    ok: true,
    value: {
      date, programTypeId, speakerId, topic, kitab, notes: orNull(text(fd, 'notes')),
      status: text(fd, 'status') === 'cancelled' ? 'cancelled' : 'scheduled',
      timing, repeatWeekly: fd.get('repeat_weekly') === 'on',
    },
  };
}

export type ProgramTypeInput = { name: string; colour: string; timing: Timing; durationMinutes: number | null };

export function validateProgramType(fd: FormData): Result<ProgramTypeInput> {
  const name = text(fd, 'name');
  if (!name) return { ok: false, error: 'Nama diperlukan.' };
  if (name.length > 100) return { ok: false, error: 'Nama terlalu panjang (maksimum 100 aksara).' };
  const colour = text(fd, 'colour');
  if (!/^#[0-9A-Fa-f]{6}$/.test(colour)) return { ok: false, error: 'Warna tidak sah.' };
  const timing = parseTiming(fd);
  if (!timing.ok) return timing;
  const dur = orNull(text(fd, 'duration'));
  const durationMinutes = dur === null ? null : Number(dur);
  if (durationMinutes !== null && (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 600)) {
    return { ok: false, error: 'Tempoh tidak sah.' };
  }
  return { ok: true, value: { name, colour, timing: timing.value, durationMinutes } };
}

export type SpeakerInput = { name: string; titleLine: string | null; photoPath: string | null; active: boolean };

export function validateSpeaker(fd: FormData): Result<SpeakerInput> {
  const name = text(fd, 'name');
  if (!name) return { ok: false, error: 'Nama diperlukan.' };
  if (name.length > 200) return { ok: false, error: 'Nama terlalu panjang (maksimum 200 aksara).' };
  const titleLine = orNull(text(fd, 'title_line'));
  if (titleLine && titleLine.length > 200) return { ok: false, error: 'Teks terlalu panjang (maksimum 200 aksara).' };
  const photoPath = orNull(text(fd, 'photo_path'));
  if (photoPath && !isUploadPath('speakers', photoPath)) return { ok: false, error: 'Gambar tidak sah.' };
  return { ok: true, value: { name, titleLine, photoPath, active: fd.get('active') === 'on' } };
}

// ---------- row planning (pure) ----------

export type SessionInsert = TimingCols & {
  date: string; program_type_id: string; speaker_id: string | null; topic: string | null; kitab: string | null;
  notes: string | null; slug: string; status: 'scheduled' | 'cancelled';
};

export function timingColumns(t: Timing | null): TimingCols {
  if (!t) return { time_mode: null, anchor_prayer: null, offset_minutes: null, fixed_time: null };
  return t.mode === 'fixed'
    ? { time_mode: 'fixed', anchor_prayer: null, offset_minutes: null, fixed_time: t.time }
    : { time_mode: 'prayer', anchor_prayer: t.anchor, offset_minutes: t.offsetMinutes, fixed_time: null };
}

/** Rows to insert for a new session; "repeat weekly" expands to every same weekday in that month. `existingSlugs`: slugs already used. */
export function planNewSessions(input: SessionInput, typeName: string, existingSlugs: string[]): SessionInsert[] {
  const [y, m] = input.date.split('-').map(Number);
  const weekday = new Date(`${input.date}T00:00:00Z`).getUTCDay();
  const dates = input.repeatWeekly ? weekdaysInMonth(y, m, weekday) : [input.date];
  const taken = [...existingSlugs];
  return dates.map((date) => {
    const slug = uniqueSlug(sessionSlug(date, input.topic || typeName), taken);
    taken.push(slug);
    return {
      date, program_type_id: input.programTypeId, speaker_id: input.speakerId, topic: input.topic, kitab: input.kitab,
      notes: input.notes, slug, status: input.status, ...timingColumns(input.timing),
    };
  });
}

export type PrevSessionRow = TimingCols & {
  date: string; program_type_id: string; speaker_id: string | null; topic: string | null; kitab: string | null; notes: string | null;
};

/** "Salin bulan lepas": copy by weekday position into `year`/`month` (1-12). Sessions with no matching week are skipped and listed. */
export function planCopy(
  prev: PrevSessionRow[], year: number, month: number, existingSlugs: string[], typeNames: Record<string, string>,
): { rows: SessionInsert[]; skipped: { date: string; topic: string | null }[] } {
  const { mapped, skipped } = copyMonthDates(prev, year, month);
  const taken = [...existingSlugs];
  const rows = mapped.map((r) => {
    const slug = uniqueSlug(sessionSlug(r.newDate, r.topic || typeNames[r.program_type_id] || 'sesi'), taken);
    taken.push(slug);
    return {
      date: r.newDate, program_type_id: r.program_type_id, speaker_id: r.speaker_id, topic: r.topic, kitab: r.kitab,
      notes: r.notes, slug, status: 'scheduled' as const,
      time_mode: r.time_mode, anchor_prayer: r.anchor_prayer, offset_minutes: r.offset_minutes, fixed_time: r.fixed_time,
    };
  });
  return { rows, skipped: skipped.map((s) => ({ date: s.date, topic: s.topic })) };
}

/** Speakers offered in the session form: active ones, plus the session's current speaker even if now inactive (so editing never drops him). */
export function selectableSpeakers(all: Speaker[], currentId: string | null): Speaker[] {
  return all.filter((sp) => sp.active || sp.id === currentId);
}
