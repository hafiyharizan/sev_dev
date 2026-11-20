'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import TimingFields from '@/app/components/admin/TimingFields';
import { rowToTiming, type ProgramType, type Speaker } from '@/lib/schedule';
import type { SessionEditRow } from '@/lib/data/schedule-admin';
import { saveSession, type SessionFormState } from '../actions';

const field = 'mt-1 w-full min-h-[44px] rounded-lg border border-linegrey bg-white px-3';

function Save({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-[44px] rounded-full bg-navyblue px-6 py-3 font-medium text-white disabled:opacity-60">
      {pending ? 'Menyimpan…' : editing ? 'Simpan' : 'Tambah'}
    </button>
  );
}

export default function SessionForm({
  session, types, speakers, defaultDate,
}: { session: SessionEditRow | null; types: ProgramType[]; speakers: Speaker[]; defaultDate: string }) {
  const [state, action] = useFormState<SessionFormState, FormData>(saveSession, {});
  const override = session ? rowToTiming(session) : null;
  const [custom, setCustom] = useState(override !== null);

  return (
    <form action={action} className="max-w-xl space-y-5">
      {session ? <input type="hidden" name="id" value={session.id} /> : null}
      <label className="block text-sm font-medium">Tarikh
        <input name="date" type="date" required defaultValue={session?.date ?? defaultDate} className={field} />
      </label>
      <label className="block text-sm font-medium">Jenis program
        <select name="program_type_id" required defaultValue={session?.program_type_id ?? types[0]?.id} className={field}>
          {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">Tajuk / topik (pilihan)
        <input name="topic" maxLength={200} defaultValue={session?.topic ?? ''} placeholder="cth. Akidah" className={field} />
      </label>
      <label className="block text-sm font-medium">Kitab (pilihan)
        <input name="kitab" maxLength={200} defaultValue={session?.kitab ?? ''} className={field} />
      </label>
      <label className="block text-sm font-medium">Ustaz (pilihan)
        <select name="speaker_id" defaultValue={session?.speaker_id ?? ''} className={field}>
          <option value="">— tiada —</option>
          {speakers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">Catatan (pilihan)
        <textarea name="notes" rows={3} defaultValue={session?.notes ?? ''} className={`${field} py-2`} />
      </label>
      <label className="block text-sm font-medium">Status
        <select name="status" defaultValue={session?.status ?? 'scheduled'} className={field}>
          <option value="scheduled">Berjalan</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </label>

      <label className="flex min-h-[44px] items-center gap-3 text-sm">
        <input name="custom_time" type="checkbox" checked={custom} onChange={(e) => setCustom(e.target.checked)} className="h-5 w-5" />
        Masa khas untuk sesi ini
      </label>
      {custom ? <TimingFields defaults={override} /> : null}

      {!session ? (
        <label className="flex min-h-[44px] items-center gap-3 text-sm">
          <input name="repeat_weekly" type="checkbox" className="h-5 w-5" /> Ulang setiap minggu (pada hari yang sama, bulan ini)
        </label>
      ) : null}

      <Save editing={!!session} />
      {state.error ? <p role="alert" className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-green-700">Disimpan ✓{state.created && state.created > 1 ? ` (${state.created} sesi)` : ''}</p> : null}
    </form>
  );
}
