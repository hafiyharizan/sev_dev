import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({
  requireUser: vi.fn(),
  deleteFile: vi.fn(),
  revalidateTag: vi.fn(),
  db: { existingSlugs: [] as string[], existingRow: null as null | { image_path: string | null; slug: string },
        inserted: null as unknown, updated: null as unknown, deletedId: null as unknown, deleteError: null as unknown },
}));

vi.mock('@/lib/auth', () => ({ requireUser: h.requireUser }));
vi.mock('@/lib/storage-server', () => ({ deleteFile: h.deleteFile }));
vi.mock('next/cache', () => ({ revalidateTag: h.revalidateTag }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        like: async () => ({ data: h.db.existingSlugs.map((slug) => ({ slug })) }),
        eq: () => ({ maybeSingle: async () => ({ data: h.db.existingRow }) }),
      }),
      insert: async (row: unknown) => { h.db.inserted = row; return { error: null }; },
      update: (row: unknown) => ({ eq: async () => { h.db.updated = row; return { error: null }; } }),
      delete: () => ({ eq: async (_c: string, id: string) => { h.db.deletedId = id; return { error: h.db.deleteError }; } }),
    }),
  }),
}));

import { savePost, deletePost } from '@/app/admin/(panel)/hebahan/actions';

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const OLD = 'uploads/posts/11111111-1111-4111-8111-111111111111.webp';
const NEW = 'uploads/posts/22222222-2222-4222-8222-222222222222.webp';

beforeEach(() => {
  h.requireUser.mockReset().mockResolvedValue({ id: 'u', email: 'a@b.c' });
  h.deleteFile.mockReset();
  h.revalidateTag.mockReset();
  Object.assign(h.db, { existingSlugs: [], existingRow: null, inserted: null, updated: null, deletedId: null, deleteError: null });
});

describe('savePost', () => {
  it('returns a session-expired message (keeping the form) and writes nothing when nobody is logged in', async () => {
    h.requireUser.mockRejectedValue(new Error('UNAUTHORIZED'));
    expect(await savePost({}, fd({ title: 'T', type: 'pengumuman' }))).toEqual({ error: 'Sesi tamat. Sila log masuk semula.' });
    expect(h.db.inserted).toBeNull();
  });

  it('returns the validation error and writes nothing for a javascript: link', async () => {
    const r = await savePost({}, fd({ title: 'T', type: 'pengumuman', external_url: 'javascript:alert(1)' }));
    expect(r).toEqual({ error: 'Pautan mesti bermula dengan http://, https:// atau /' });
    expect(h.db.inserted).toBeNull();
  });

  it('creates a post, slugged from the title, and busts the posts cache', async () => {
    const r = await savePost({}, fd({ title: 'Kuliah Baharu', type: 'pengumuman' }));
    expect(r).toEqual({ ok: true, slug: 'kuliah-baharu' });
    expect(h.db.inserted).toMatchObject({ slug: 'kuliah-baharu', title: 'Kuliah Baharu', type: 'pengumuman' });
    expect(h.revalidateTag).toHaveBeenCalledWith('posts');
  });

  it('appends -2 when the slug is taken', async () => {
    h.db.existingSlugs = ['kuliah-baharu'];
    const r = await savePost({}, fd({ title: 'Kuliah Baharu', type: 'pengumuman' }));
    expect(r).toEqual({ ok: true, slug: 'kuliah-baharu-2' });
  });

  it('on edit keeps the slug and deletes the old image when it is replaced', async () => {
    h.db.existingRow = { image_path: OLD, slug: 'asal' };
    const r = await savePost({}, fd({ id: 'p1', title: 'Tajuk Baru', type: 'buletin', image_path: NEW }));
    expect(r).toEqual({ ok: true, slug: 'asal' });
    expect(h.db.updated).toMatchObject({ title: 'Tajuk Baru', image_path: NEW });
    expect(h.db.updated).not.toHaveProperty('slug');
    expect(h.deleteFile).toHaveBeenCalledWith(OLD);
  });

  it('on edit does not delete the image when it is unchanged', async () => {
    h.db.existingRow = { image_path: OLD, slug: 'asal' };
    await savePost({}, fd({ id: 'p1', title: 'T', type: 'buletin', image_path: OLD }));
    expect(h.deleteFile).not.toHaveBeenCalled();
  });
});

describe('deletePost', () => {
  it('deletes the row and then its image file', async () => {
    h.db.existingRow = { image_path: OLD, slug: 's' };
    await deletePost('p1');
    expect(h.db.deletedId).toBe('p1');
    expect(h.deleteFile).toHaveBeenCalledWith(OLD);
    expect(h.revalidateTag).toHaveBeenCalledWith('posts');
  });

  it('keeps the file when the row could not be deleted', async () => {
    h.db.existingRow = { image_path: OLD, slug: 's' };
    h.db.deleteError = new Error('rls');
    await expect(deletePost('p1')).rejects.toThrow();
    expect(h.deleteFile).not.toHaveBeenCalled();
  });

  it('throws UNAUTHORIZED without touching the database', async () => {
    h.requireUser.mockRejectedValue(new Error('UNAUTHORIZED'));
    await expect(deletePost('p1')).rejects.toThrow('UNAUTHORIZED');
    expect(h.db.deletedId).toBeNull();
  });
});
