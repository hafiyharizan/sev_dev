import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';

export type EventType = 'qr_scan' | 'pwa_install' | 'share_click';

/** UTC range [from, to) covering a Malaysia calendar month (UTC+8). `month` is 1-12. */
export function monthBoundsMY(year: number, month: number): { from: string; to: string } {
  return {
    from: new Date(Date.UTC(year, month - 1, 1, -8)).toISOString(),
    to: new Date(Date.UTC(year, month, 1, -8)).toISOString(),
  };
}

export async function getMonthlyCounts(year: number, month: number): Promise<Record<EventType, number>> {
  const supabase = createServiceClient();
  const { from, to } = monthBoundsMY(year, month);
  const types: EventType[] = ['qr_scan', 'pwa_install', 'share_click'];
  const counts = await Promise.all(
    types.map(async (type) => {
      const { count } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('type', type)
        .gte('created_at', from)
        .lt('created_at', to);
      return count ?? 0;
    }),
  );
  return { qr_scan: counts[0], pwa_install: counts[1], share_click: counts[2] };
}
