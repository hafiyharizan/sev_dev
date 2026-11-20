'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { readInvite } from '@/lib/data/invite';
import { checkInvite, INVALID_INVITE } from '@/lib/invite';
import type { LoginState } from '@/app/admin/login/state';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The only unauthenticated action that uses the service client: creates the user, then sends the login code. */
export async function acceptInvite(code: string, _prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  if (checkInvite(await readInvite(), code) !== 'ok') return { step: 'email', email, error: INVALID_INVITE };
  if (!EMAIL.test(email)) return { step: 'email', email, error: 'Sila masukkan e-mel yang sah.' };

  const { error } = await createServiceClient().auth.admin.createUser({ email, email_confirm: true });
  if (error && !/already|registered|exists/i.test(error.message)) {
    return { step: 'email', email, error: 'Tidak dapat mendaftar e-mel ini. Cuba lagi.' };
  }
  const { error: otpError } = await createClient().auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (otpError) return { step: 'email', email, error: 'Kod tidak dapat dihantar. Cuba lagi.' };
  return { step: 'code', email };
}
