import { supabaseUrl } from '@/lib/env';

/** Client-safe. Public URL of a file in the `media` bucket. */
export function publicUrl(path: string): string {
  return `${supabaseUrl()}/storage/v1/object/public/media/${path}`;
}

/** True for `uploads/<table>/<uuid>.(webp|jpg|png)`. Used to keep stored paths inside the expected folder. */
export function isUploadPath(table: string, path: string): boolean {
  return new RegExp(`^uploads/${table}/[0-9a-f-]{36}\\.(webp|jpg|png)$`).test(path);
}

/** If `url` is a public URL of a file in our media bucket, its storage path; otherwise null. */
export function storagePathFromUrl(url: string): string | null {
  const prefix = `${supabaseUrl()}/storage/v1/object/public/media/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}
