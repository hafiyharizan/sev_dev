import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '@/lib/env';

type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/** supabase-js does not tag its fetches, so we wrap fetch to opt in to Next.js tag caching (1h fallback). */
export function taggedFetch(tags: string[], base: FetchFn = fetch): FetchFn {
  return (input, init) => base(input, { ...init, next: { tags, revalidate: 3600 } } as RequestInit);
}

/** Anonymous read client for public pages. Reads are cached under `tags`; admin saves call revalidateTag. */
export function createPublicClient(tags: string[]) {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: taggedFetch(tags) },
  });
}
