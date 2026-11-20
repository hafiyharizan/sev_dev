'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { newInvite } from '@/lib/invite';

export async function generateInvite() {
  await requireUser();
  const { code, expiresAt } = newInvite(); // replaces any earlier link
  await createServiceClient().from('invites').upsert({ id: 1, code, expires_at: expiresAt });
  revalidatePath('/admin/tetapan/jemputan');
}

export async function cancelInvite() {
  await requireUser();
  await createServiceClient().from('invites').upsert({ id: 1, code: null, expires_at: null });
  revalidatePath('/admin/tetapan/jemputan');
}
