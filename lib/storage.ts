import { supabaseUrl } from '@/lib/env';

/** Client-safe. Public URL of a file in the `media` bucket. */
export function publicUrl(path: string): string {
  return `${supabaseUrl()}/storage/v1/object/public/media/${path}`;
}
