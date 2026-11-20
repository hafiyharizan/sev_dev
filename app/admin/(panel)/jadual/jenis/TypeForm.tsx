'use client';

import CreatedNotice from '@/app/components/admin/CreatedNotice';
import Rounds from '@/app/components/admin/Rounds';
import { useFormState, useFormStatus } from 'react-dom';
import TimingFields from '@/app/components/admin/TimingFields';
import type { ProgramType } from '@/lib/schedule';
import { saveProgramType, type TypeFormState } from './actions';

const field = 'mt-1 w-full min-h-[44px] rounded-lg border border-linegrey bg-white px-3';

function Save() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="min-h-[44px] rounded-full bg-navyblue px-6 py-3 text-white disabled:opacity-60">{pending ? 'Menyimpan…' : 'Simpan'}</button>;
}

function TypeFormInner({ type, again }: { type: ProgramType | null; again: () => void }) {
  const [state, action] = useFormState<TypeFormState, FormData>(saveProgramType, {});
  if (state.ok && !type) {
    return (
      <CreatedNotice message={'Disimpan ✓'} againLabel="Tambah jenis lain" onAgain={again}></CreatedNotice>
    );
  }

  return (
    <form action={action} key={type?.id ?? 'new'} className="max-w-xl space-y-4 rounded-2xl bg-white p-4">
      <h2 className="text-lg font-semibold">{type ? 'Sunting jenis program' : 'Jenis program baharu'}</h2>
      {type ? <input type="hidden" name="id" value={type.id} /> : null}
      <label className="block text-sm font-medium">Nama
        <input name="name" required maxLength={100} defaultValue={type?.name} className={field} />
      </label>
      <label className="block text-sm font-medium">Warna
        <input name="colour" type="color" required defaultValue={type?.colour ?? '#A87BF0'} className={`${field} p-1`} />
      </label>
      <TimingFields defaults={type?.timing ?? null} />
      <label className="block text-sm font-medium">Tempoh (minit, pilihan)
        <input name="duration" type="number" min={1} max={600} defaultValue={type?.durationMinutes ?? ''} className={field} />
      </label>
      <Save />
      {state.error ? <p role="alert" className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-green-700">Disimpan ✓</p> : null}
    </form>
  );
}

export default function TypeForm({ type }: { type: ProgramType | null }) {
  return <Rounds>{(again) => <TypeFormInner type={type} again={again} />}</Rounds>;
}
