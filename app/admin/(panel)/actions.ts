'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function logout() {
  await createClient().auth.signOut();
  redirect('/admin/login');
}
