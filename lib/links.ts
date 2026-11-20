export const LINK_CATEGORIES = ['Borang', 'Dokumen', 'Program', 'Sumbangan', 'Media', 'Umum'] as const;
export type LinkCategory = (typeof LINK_CATEGORIES)[number];
export type SiteLink = { id: string; title: string; url: string; description: string | null; category: LinkCategory; sortOrder: number };
export type LinkInput = { title: string; url: string; description: string | null; category: LinkCategory };

const text = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

export function validateLink(fd: FormData): { ok: true; value: LinkInput } | { ok: false; error: string } {
  const title = text(fd, 'title');
  if (!title) return { ok: false, error: 'Tajuk diperlukan.' };
  if (title.length > 200) return { ok: false, error: 'Tajuk terlalu panjang (maksimum 200 aksara).' };
  const url = text(fd, 'url');
  if (!/^(https?:\/\/|\/)/.test(url) || url.length > 500) return { ok: false, error: 'Pautan mesti bermula dengan http://, https:// atau /' };
  const category = (text(fd, 'category') || 'Umum') as LinkCategory;
  if (!LINK_CATEGORIES.includes(category)) return { ok: false, error: 'Kategori tidak sah.' };
  const description = text(fd, 'description') || null;
  if (description && description.length > 500) return { ok: false, error: 'Keterangan terlalu panjang (maksimum 500 aksara).' };
  return { ok: true, value: { title, url, description, category } };
}
