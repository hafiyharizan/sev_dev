'use client';

import { useFormState } from 'react-dom';
import { saveSettings, type SettingsState } from './actions';
import { PRAYERS, type IqamahOffsets } from '@/lib/types';

const LABELS = { subuh: 'Subuh', zohor: 'Zohor', asar: 'Asar', maghrib: 'Maghrib', isyak: 'Isyak' } as const;

export default function SettingsForm({ zone, offsets }: { zone: string; offsets: IqamahOffsets }) {
  const [state, action] = useFormState<SettingsState, FormData>(saveSettings, {});
  return (
    <form action={action} className="max-w-md space-y-4 rounded-2xl bg-white p-4">
      <h2 className="text-lg font-semibold">Iqamah (minit selepas azan)</h2>
      {PRAYERS.map((p) => (
        <label key={p} className="flex items-center justify-between gap-4">
          <span>{LABELS[p]}</span>
          <input name={p} type="number" min={0} max={60} step={1} required defaultValue={offsets[p]}
            className="min-h-[44px] w-24 rounded-lg border border-linegrey px-3" />
        </label>
      ))}
      <label className="flex items-center justify-between gap-4">
        <span>Zon JAKIM</span>
        <input name="prayer_zone" required defaultValue={zone} className="min-h-[44px] w-24 rounded-lg border border-linegrey px-3 uppercase" />
      </label>
      <button type="submit" className="min-h-[44px] rounded-full bg-navyblue px-5 py-3 text-white">Simpan</button>
      {state.error ? <p role="alert" className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-green-700">Disimpan.</p> : null}
    </form>
  );
}
