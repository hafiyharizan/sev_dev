import { describe, it, expect, beforeAll } from 'vitest';
import { validatePostInput, uniqueSlug, rowToPost } from '@/lib/posts';

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const IMG = 'uploads/posts/0b8f9d3e-1c2a-4f5b-9a77-123456789abc.webp';

describe('validatePostInput', () => {
  it('accepts a minimal post and trims text', () => {
    const r = validatePostInput(fd({ title: '  Kuliah Baharu ', type: 'pengumuman' }));
    expect(r).toEqual({
      ok: true,
      value: { type: 'pengumuman', title: 'Kuliah Baharu', subtitle: null, body: null, imagePath: null, externalUrl: null, pinned: false },
    });
  });

  it('keeps optional fields, the pinned flag and a valid image path', () => {
    const r = validatePostInput(fd({ title: 'T', type: 'buletin', subtitle: 'S', body: 'B', image_path: IMG, external_url: 'https://example.com/x', pinned: 'on' }));
    expect(r).toMatchObject({ ok: true, value: { subtitle: 'S', body: 'B', imagePath: IMG, externalUrl: 'https://example.com/x', pinned: true } });
  });

  it('requires a title and caps it at 200 characters', () => {
    expect(validatePostInput(fd({ title: '  ', type: 'pengumuman' }))).toEqual({ ok: false, error: 'Tajuk diperlukan.' });
    expect(validatePostInput(fd({ title: 'a'.repeat(201), type: 'pengumuman' }))).toEqual({
      ok: false, error: 'Tajuk terlalu panjang (maksimum 200 aksara).',
    });
  });

  it('rejects an unknown type', () => {
    expect(validatePostInput(fd({ title: 'T', type: 'iklan' }))).toEqual({ ok: false, error: 'Jenis tidak sah.' });
  });

  it('only allows http(s):// or / links', () => {
    const msg = 'Pautan mesti bermula dengan http://, https:// atau /';
    for (const bad of ['javascript:alert(1)', 'ftp://x', 'example.com', 'data:text/html,x']) {
      expect(validatePostInput(fd({ title: 'T', type: 'pengumuman', external_url: bad }))).toEqual({ ok: false, error: msg });
    }
    expect(validatePostInput(fd({ title: 'T', type: 'pengumuman', external_url: '/tabung' })).ok).toBe(true);
  });

  it('only allows images from the posts upload folder', () => {
    for (const bad of ['uploads/speakers/x.webp', '../secret.webp', 'uploads/posts/../../x.webp', 'https://evil/x.webp']) {
      expect(validatePostInput(fd({ title: 'T', type: 'pengumuman', image_path: bad }))).toEqual({ ok: false, error: 'Gambar tidak sah.' });
    }
  });
});

describe('uniqueSlug', () => {
  it('uses the base when free, otherwise the first free -N suffix', () => {
    expect(uniqueSlug('kuliah', [])).toBe('kuliah');
    expect(uniqueSlug('kuliah', ['kuliah'])).toBe('kuliah-2');
    expect(uniqueSlug('kuliah', ['kuliah', 'kuliah-2', 'kuliah-3'])).toBe('kuliah-4');
    expect(uniqueSlug('kuliah', ['kuliah-2'])).toBe('kuliah');
  });
});

describe('rowToPost', () => {
  beforeAll(() => { process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co'; });

  it('maps a database row and builds the public image url', () => {
    const p = rowToPost({ id: '1', type: 'buletin', slug: 's', title: 'T', subtitle: null, body: null, image_path: IMG,
      external_url: null, published_at: '2026-11-20T00:00:00Z', pinned: true });
    expect(p).toMatchObject({ id: '1', imagePath: IMG, pinned: true, publishedAt: '2026-11-20T00:00:00Z' });
    expect(p.imageUrl).toBe(`https://abc.supabase.co/storage/v1/object/public/media/${IMG}`);
  });

  it('has no image url when there is no image', () => {
    const p = rowToPost({ id: '1', type: 'buletin', slug: 's', title: 'T', subtitle: null, body: null, image_path: null,
      external_url: null, published_at: '2026-11-20T00:00:00Z', pinned: false });
    expect(p.imageUrl).toBeNull();
  });
});

import { postDescription } from '@/lib/posts';

describe('postDescription', () => {
  const base = { subtitle: null, body: null } as { subtitle: string | null; body: string | null };

  it('prefers the body, then the subtitle, else empty', () => {
    expect(postDescription({ subtitle: 'Sub', body: 'Isi hebahan' })).toBe('Isi hebahan');
    expect(postDescription({ ...base, subtitle: 'Sub' })).toBe('Sub');
    expect(postDescription(base)).toBe('');
  });

  it('collapses whitespace and cuts at 160 characters with an ellipsis', () => {
    expect(postDescription({ ...base, body: 'a\n\n  b' })).toBe('a b');
    const long = postDescription({ ...base, body: 'x'.repeat(300) });
    expect(long).toHaveLength(160);
    expect(long.endsWith('…')).toBe(true);
  });
});
