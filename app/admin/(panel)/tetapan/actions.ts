'use server';

import { revalidateTag } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { parseIqamahOffsets } from '@/lib/iqamah';
import { TAGS } from '@/lib/cache-tags';

export type SettingsState = { ok?: boolean; error?: string };

export async function saveSettings(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requireUser();
  const offsets = parseIqamahOffsets(fd);
  if (!offsets.ok) return { error: offsets.error };
  const zone = String(fd.get('prayer_zone') ?? '').trim().toUpperCase();
  if (!/^[A-Z]{3}\d{2}$/.test(zone)) return { error: 'Zon mesti seperti SGR01.' };

  const { error } = await createClient().from('settings').upsert([
    { key: 'iqamah_offsets', value: offsets.value },
    { key: 'prayer_zone', value: zone },
  ]);
  if (error) return { error: 'Gagal menyimpan. Cuba lagi.' };
  revalidateTag(TAGS.settings);
  return { ok: true };
}
