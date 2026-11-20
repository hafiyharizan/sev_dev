import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { serviceRoleKey, supabaseUrl } from '@/lib/env';

/** Service-role client: bypasses RLS. Only for cron, tracking and invite routes. Never import from client code. */
export function createServiceClient() {
  return createClient(supabaseUrl(), serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
