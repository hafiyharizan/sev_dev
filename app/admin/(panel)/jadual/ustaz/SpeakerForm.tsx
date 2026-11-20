'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import ImageUpload from '@/app/components/admin/ImageUpload';
import type { Speaker } from '@/lib/schedule';
import { saveSpeaker, type SpeakerFormState } from './actions';

const field = 'mt-1 w-full min-h-[44px] rounded-lg border border-linegrey bg-white px-3';

function Save() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="min-h-[44px] rounded-full bg-navyblue px-6 py-3 text-white disabled:opacity-60">{pending ? 'Menyimpan…' : 'Simpan'}</button>;
}

export default function SpeakerForm({ speaker }: { speaker: Speaker | null }) {
  const [state, action] = useFormState<SpeakerFormState, FormData>(saveSpeaker, {});
  const [photo, setPhoto] = useState<string | null>(speaker?.photoPath ?? null);
  return (
    <form action={action} key={speaker?.id ?? 'new'} className="max-w-xl space-y-4 rounded-2xl bg-white p-4">
      <h2 className="text-lg font-semibold">{speaker ? 'Sunting ustaz' : 'Ustaz baharu'}</h2>
      {speaker ? <input type="hidden" name="id" value={speaker.id} /> : null}
      <input type="hidden" name="photo_path" value={photo ?? ''} />
      <ImageUpload table="speakers" value={photo} onChange={setPhoto} label="Gambar" />
      <label className="block text-sm font-medium">Nama
        <input name="name" required maxLength={200} defaultValue={speaker?.name} className={field} />
      </label>
      <label className="block text-sm font-medium">Gelaran / keterangan (pilihan)
        <input name="title_line" maxLength={200} defaultValue={speaker?.titleLine ?? ''} className={field} />
      </label>
      <label className="flex min-h-[44px] items-center gap-3 text-sm">
        <input name="active" type="checkbox" defaultChecked={speaker?.active ?? true} className="h-5 w-5" /> Aktif (boleh dipilih untuk sesi baharu)
      </label>
      <Save />
      {state.error ? <p role="alert" className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-green-700">Disimpan ✓</p> : null}
    </form>
  );
}
