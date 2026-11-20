import 'server-only';
import { createClient } from '@/lib/supabase/server';

/** Deletes a file from the `media` bucket as the logged-in admin. No-op for null. */
export async function deleteFile(path: string | null): Promise<void> {
  if (!path) return;
  await createClient().storage.from('media').remove([path]);
}
