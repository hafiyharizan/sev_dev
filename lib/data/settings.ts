import { createPublicClient } from '@/lib/supabase/public';
import { TAGS } from '@/lib/cache-tags';
import type { IqamahOffsets } from '@/lib/types';

export const DEFAULT_OFFSETS: IqamahOffsets = { subuh: 15, zohor: 10, asar: 10, maghrib: 10, isyak: 10 };

export async function getSettings(): Promise<{ prayerZone: string; iqamahOffsets: IqamahOffsets }> {
  const { data } = await createPublicClient([TAGS.settings]).from('settings').select('key, value');
  const byKey = new Map((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]));
  const zone = byKey.get('prayer_zone');
  const offsets = byKey.get('iqamah_offsets');
  return {
    prayerZone: typeof zone === 'string' ? zone : 'SGR01',
    iqamahOffsets: { ...DEFAULT_OFFSETS, ...(offsets && typeof offsets === 'object' ? (offsets as Partial<IqamahOffsets>) : {}) },
  };
}
