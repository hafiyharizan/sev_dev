import { describe, it, expect } from 'vitest';
import { validateLink } from '@/lib/links';
import { storagePathFromUrl } from '@/lib/storage';

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

describe('validateLink', () => {
  it('accepts a title, url and category', () => {
    expect(validateLink(fd({ title: ' Borang Khairat ', url: 'https://form.jotform.com/x', category: 'Borang' }))).toEqual({
      ok: true, value: { title: 'Borang Khairat', url: 'https://form.jotform.com/x', description: null, category: 'Borang' },
    });
  });

  it('defaults the category to Umum and keeps a description', () => {
    expect(validateLink(fd({ title: 'T', url: '/tabung', description: 'Info' }))).toMatchObject({
      ok: true, value: { category: 'Umum', description: 'Info', url: '/tabung' },
    });
  });

  it('rejects a missing title, an unknown category and unsafe urls', () => {
    expect(validateLink(fd({ title: '', url: '/x' }))).toEqual({ ok: false, error: 'Tajuk diperlukan.' });
    expect(validateLink(fd({ title: 'T', url: '/x', category: 'Lain' }))).toEqual({ ok: false, error: 'Kategori tidak sah.' });
    for (const bad of ['javascript:alert(1)', 'ftp://x', 'example.com', '']) {
      expect(validateLink(fd({ title: 'T', url: bad }))).toEqual({ ok: false, error: 'Pautan mesti bermula dengan http://, https:// atau /' });
    }
  });
});

describe('storagePathFromUrl', () => {
  it('extracts the media path from a public storage url', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
    expect(storagePathFromUrl('https://abc.supabase.co/storage/v1/object/public/media/uploads/links/x.pdf')).toBe('uploads/links/x.pdf');
  });

  it('is null for any other url', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
    expect(storagePathFromUrl('https://form.jotform.com/x')).toBeNull();
    expect(storagePathFromUrl('/tabung')).toBeNull();
    expect(storagePathFromUrl('https://evil.example/storage/v1/object/public/media/uploads/links/x.pdf')).toBeNull();
  });
});
