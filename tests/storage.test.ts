import { describe, it, expect, vi, beforeEach } from 'vitest';

const remove = vi.fn().mockResolvedValue({ error: null });
const from = vi.fn(() => ({ remove }));
vi.mock('@/lib/supabase/server', () => ({ createClient: () => ({ storage: { from } }) }));

import { publicUrl } from '@/lib/storage';
import { deleteFile } from '@/lib/storage-server';

describe('publicUrl', () => {
  it('points at the public media bucket', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
    expect(publicUrl('uploads/posts/x.webp')).toBe(
      'https://abc.supabase.co/storage/v1/object/public/media/uploads/posts/x.webp',
    );
  });
});

describe('deleteFile', () => {
  beforeEach(() => { remove.mockClear(); from.mockClear(); });

  it('removes the object from the media bucket', async () => {
    await deleteFile('uploads/posts/x.webp');
    expect(from).toHaveBeenCalledWith('media');
    expect(remove).toHaveBeenCalledWith(['uploads/posts/x.webp']);
  });

  it('does nothing for a null path', async () => {
    await deleteFile(null);
    expect(remove).not.toHaveBeenCalled();
  });
});
