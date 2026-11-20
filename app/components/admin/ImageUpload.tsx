'use client';

import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase/browser';
import { extForMime, resizeImage } from '@/lib/image/resize';
import { publicUrl } from '@/lib/storage';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

/**
 * Picks a photo (or PDF), shrinks images in the browser, uploads straight to Supabase Storage with the
 * admin's session, and reports the storage path. The form saves that path.
 */
export default function ImageUpload({
  table, value, onChange, accept = 'image', label = 'Gambar',
}: {
  table: string;
  value: string | null;
  onChange: (path: string | null) => void;
  accept?: 'image' | 'image+pdf';
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const isPdf = file.type === 'application/pdf';
      if (isPdf && accept !== 'image+pdf') throw new Error('type');
      if (isPdf && file.size > MAX_PDF_BYTES) throw new Error('size');
      if (!isPdf && !file.type.startsWith('image/')) throw new Error('type');
      const blob: Blob = isPdf ? file : await resizeImage(file);
      const ext = extForMime(blob.type);
      if (!ext) throw new Error('type');
      const path = `uploads/${table}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await createBrowserSupabase().storage
        .from('media').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
      if (upErr) throw upErr;
      onChange(path);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setError(msg === 'size' ? 'Fail terlalu besar (maksimum 10MB).' : msg === 'type' ? 'Jenis fail tidak dibenarkan.' : 'Muat naik gagal. Cuba lagi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium">{label}</span>
      {value && !value.endsWith('.pdf') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={publicUrl(value)} alt="" className="h-40 w-full rounded-xl object-cover" />
      ) : null}
      {value?.endsWith('.pdf') ? <p className="text-sm">Fail PDF dimuat naik.</p> : null}
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border border-linegrey bg-white px-4">
          {busy ? 'Memuat naik…' : value ? 'Tukar' : 'Pilih fail'}
          <input type="file" className="sr-only" disabled={busy}
            accept={accept === 'image+pdf' ? 'image/*,application/pdf' : 'image/*'}
            onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {value ? (
          <button type="button" onClick={() => onChange(null)} className="min-h-[44px] px-3 text-sm underline">Buang</button>
        ) : null}
      </div>
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
