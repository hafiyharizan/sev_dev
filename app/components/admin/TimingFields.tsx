'use client';

import { useState } from 'react';
import { PRAYERS, type Timing } from '@/lib/types';

const LABELS = { subuh: 'Subuh', zohor: 'Zohor', asar: 'Asar', maghrib: 'Maghrib', isyak: 'Isyak' } as const;
const field = 'mt-1 w-full min-h-[44px] rounded-lg border border-linegrey bg-white px-3';

/** time_mode / anchor / offset / time inputs, shared by program types and per-session overrides. */
export default function TimingFields({ defaults }: { defaults: Timing | null }) {
  const [mode, setMode] = useState<'prayer' | 'fixed'>(defaults?.mode ?? 'prayer');
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Masa
        <select name="time_mode" value={mode} onChange={(e) => setMode(e.target.value as 'prayer' | 'fixed')} className={field}>
          <option value="prayer">Selepas waktu solat</option>
          <option value="fixed">Masa tetap</option>
        </select>
      </label>
      {mode === 'prayer' ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">Solat
            <select name="anchor" defaultValue={defaults?.mode === 'prayer' ? defaults.anchor : 'maghrib'} className={field}>
              {PRAYERS.map((p) => <option key={p} value={p}>{LABELS[p]}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Anjakan (minit)
            <input name="offset" type="number" min={-180} max={180} step={1} defaultValue={defaults?.mode === 'prayer' ? defaults.offsetMinutes : 0} className={field} />
          </label>
        </div>
      ) : (
        <label className="block text-sm font-medium">Jam
          <input name="time" type="time" required defaultValue={defaults?.mode === 'fixed' ? defaults.time : '09:00'} className={field} />
        </label>
      )}
    </div>
  );
}
