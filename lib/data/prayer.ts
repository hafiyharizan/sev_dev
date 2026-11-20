import { createPublicClient } from '@/lib/supabase/public';
import { TAGS } from '@/lib/cache-tags';
import type { DayTimes } from '@/lib/types';

/** Prayer days between two YYYY-MM-DD dates, inclusive. */
export async function getPrayerDays(from: string, to: string): Promise<DayTimes[]> {
  const { data, error } = await createPublicClient([TAGS.prayer])
    .from('prayer_times')
    .select('date, imsak, subuh, syuruk, zohor, asar, maghrib, isyak')
    .gte('date', from)
    .lte('date', to)
    .order('date');
  if (error) throw error;
  return (data ?? []) as DayTimes[];
}

/** When the daily sync last wrote prayer times (admin dashboard health line). */
export async function getLatestFetchedAt(): Promise<string | null> {
  const { data } = await createPublicClient([TAGS.prayer])
    .from('prayer_times')
    .select('fetched_at')
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.fetched_at ?? null;
}
