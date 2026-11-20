import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';

/** The current invite row. Server-only helper: must never live in a 'use server' file (that would expose the code). */
export async function readInvite(): Promise<{ code: string | null; expiresAt: string | null }> {
  const { data } = await createServiceClient().from('invites').select('code, expires_at').eq('id', 1).maybeSingle();
  return { code: data?.code ?? null, expiresAt: data?.expires_at ?? null };
}
