import { createServiceClient } from '@/lib/supabase/service';

const TYPES = ['qr_scan', 'pwa_install', 'share_click'];

/**
 * Public, fire-and-forget counter. Accepts only known event types and short paths; stores no personal data.
 * Request flooding is limited by a Cloudflare rate-limiting rule on this path (see README), not in memory.
 */
export async function POST(request: Request) {
  let body: { type?: unknown; path?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const { type, path } = body;
  if (typeof type !== 'string' || !TYPES.includes(type) || typeof path !== 'string' || path.length > 300) {
    return new Response(null, { status: 400 });
  }
  const { error } = await createServiceClient().from('analytics_events').insert({ type, path });
  if (error) console.error(JSON.stringify({ event: 'track_failed', error: String(error) }));
  return new Response(null, { status: 204 }); // never let tracking break a page
}
