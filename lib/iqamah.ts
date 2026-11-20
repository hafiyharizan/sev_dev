import { PRAYERS, type IqamahOffsets } from '@/lib/types';

export function parseIqamahOffsets(fd: FormData): { ok: true; value: IqamahOffsets } | { ok: false; error: string } {
  const value = {} as IqamahOffsets;
  for (const p of PRAYERS) {
    const raw = String(fd.get(p) ?? '').trim();
    const n = Number(raw);
    if (raw === '' || !Number.isInteger(n) || n < 0 || n > 60) {
      return { ok: false, error: 'Iqamah mesti nombor bulat antara 0 dan 60 minit.' };
    }
    value[p] = n;
  }
  return { ok: true, value };
}
