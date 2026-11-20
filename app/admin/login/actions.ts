'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { safeAdminRedirect } from '@/lib/admin-paths';
import type { LoginState } from './state';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendCode(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  if (!EMAIL.test(email)) return { step: 'email', email, error: 'Sila masukkan e-mel yang sah.' };
  const { error } = await createClient().auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) {
    return { step: 'email', email, error: 'Kod tidak dapat dihantar. Pastikan e-mel anda didaftarkan oleh AJK.' };
  }
  return { step: 'code', email };
}

export async function verifyCode(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const token = String(fd.get('code') ?? '').trim();
  const { error } = await createClient().auth.verifyOtp({ email, token, type: 'email' });
  if (error) return { step: 'code', email, error: 'Kod salah atau telah tamat tempoh.' };
  redirect(safeAdminRedirect(String(fd.get('redirect') ?? '')));
}
