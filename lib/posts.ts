import { publicUrl } from '@/lib/storage';

export type PostType = 'pengumuman' | 'buletin';

export type Post = {
  id: string;
  type: PostType;
  slug: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  externalUrl: string | null;
  publishedAt: string;
  pinned: boolean;
};

export type PostRow = {
  id: string; type: string; slug: string; title: string; subtitle: string | null; body: string | null;
  image_path: string | null; external_url: string | null; published_at: string; pinned: boolean;
};

export type PostInput = {
  type: PostType; title: string; subtitle: string | null; body: string | null;
  imagePath: string | null; externalUrl: string | null; pinned: boolean;
};

export const URL_ERROR = 'Pautan mesti bermula dengan http://, https:// atau /';
const IMAGE_PATH = /^uploads\/posts\/[0-9a-f-]{36}\.(webp|jpg|png)$/;

const text = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim();
const orNull = (s: string) => (s === '' ? null : s);

export function validatePostInput(fd: FormData): { ok: true; value: PostInput } | { ok: false; error: string } {
  const title = text(fd, 'title');
  if (!title) return { ok: false, error: 'Tajuk diperlukan.' };
  if (title.length > 200) return { ok: false, error: 'Tajuk terlalu panjang (maksimum 200 aksara).' };

  const type = text(fd, 'type');
  if (type !== 'pengumuman' && type !== 'buletin') return { ok: false, error: 'Jenis tidak sah.' };

  const subtitle = orNull(text(fd, 'subtitle'));
  if (subtitle && subtitle.length > 200) return { ok: false, error: 'Tajuk kecil terlalu panjang (maksimum 200 aksara).' };

  const externalUrl = orNull(text(fd, 'external_url'));
  if (externalUrl && (!/^(https?:\/\/|\/)/.test(externalUrl) || externalUrl.length > 500)) {
    return { ok: false, error: URL_ERROR };
  }

  const imagePath = orNull(text(fd, 'image_path'));
  if (imagePath && !IMAGE_PATH.test(imagePath)) return { ok: false, error: 'Gambar tidak sah.' };

  return {
    ok: true,
    value: { type, title, subtitle, body: orNull(text(fd, 'body')), imagePath, externalUrl, pinned: fd.get('pinned') === 'on' },
  };
}

/** `existing` = slugs already in use that start with `base`. */
export function uniqueSlug(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export function rowToPost(r: PostRow): Post {
  return {
    id: r.id,
    type: r.type as PostType,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    body: r.body,
    imagePath: r.image_path,
    imageUrl: r.image_path ? publicUrl(r.image_path) : null,
    externalUrl: r.external_url,
    publishedAt: r.published_at,
    pinned: r.pinned,
  };
}

/** Plain-text summary for share previews: body, else subtitle, whitespace collapsed, max 160 chars. */
export function postDescription(p: { subtitle: string | null; body: string | null }): string {
  const s = (p.body || p.subtitle || '').replace(/\s+/g, ' ').trim();
  return s.length > 160 ? `${s.slice(0, 159)}…` : s;
}
