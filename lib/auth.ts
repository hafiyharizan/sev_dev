import { createClient } from '@/lib/supabase/server';

/**
 * Every admin Server Action and route handler must start with `await requireUser()`.
 * Middleware alone is not enough: Server Actions can be invoked directly.
 */
export async function requireUser(): Promise<{ id: string; email: string }> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser(); // verifies the JWT with Supabase, never trusts the cookie alone
  if (!data.user) throw new Error('UNAUTHORIZED');
  return { id: data.user.id, email: data.user.email ?? '' };
}
