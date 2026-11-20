import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from '@/lib/env';

/** Browser client (uses the admin's logged-in session) for direct-to-Storage uploads. */
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
