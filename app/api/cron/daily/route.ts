import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { fetchJakimMonth } from '@/lib/prayer-source/jakim';
import { monthsToSync } from '@/lib/prayer-source/sync';
import { createServiceClient } from '@/lib/supabase/service';
import { TAGS } from '@/lib/cache-tags';
import { todayMY } from '@/lib/time/clock';

export const dynamic = 'force-dynamic';

/** Vercel Cron (once a day): sync prayer times. Also keeps the free Supabase project active. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: setting } = await supabase.from('settings').select('value').eq('key', 'prayer_zone').maybeSingle();
  const zone = typeof setting?.value === 'string' ? setting.value : 'SGR01';

  try {
    const fetchedAt = new Date().toISOString();
    const rows = [];
    for (const { year, month } of monthsToSync(todayMY())) {
      for (const d of await fetchJakimMonth(zone, year, month)) rows.push({ ...d, zone, fetched_at: fetchedAt });
    }
    const { error } = await supabase.from('prayer_times').upsert(rows, { onConflict: 'date' });
    if (error) throw error;
    revalidateTag(TAGS.prayer);
    return NextResponse.json({ ok: true, days: rows.length });
  } catch (e) {
    // keep the existing rows; the app shows the last good data
    console.error(JSON.stringify({ event: 'prayer_sync_failed', error: String(e) }));
    return NextResponse.json({ ok: false, error: String(e) });
  }
}
