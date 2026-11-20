import { describe, it, expect, vi, beforeEach } from 'vitest';

const getUser = vi.fn();
vi.mock('@/lib/supabase/server', () => ({ createClient: () => ({ auth: { getUser } }) }));

import { requireUser } from '@/lib/auth';

describe('requireUser', () => {
  beforeEach(() => getUser.mockReset());

  it('rejects with UNAUTHORIZED when nobody is logged in', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    await expect(requireUser()).rejects.toThrow('UNAUTHORIZED');
  });

  it('rejects when supabase returns an error and no user', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error('jwt expired') });
    await expect(requireUser()).rejects.toThrow('UNAUTHORIZED');
  });

  it('returns the id and email of the logged-in user', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'ajk@example.com' } } });
    await expect(requireUser()).resolves.toEqual({ id: 'u1', email: 'ajk@example.com' });
  });
});
