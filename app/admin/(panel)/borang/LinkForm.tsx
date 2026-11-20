'use client';

import CreatedNotice from '@/app/components/admin/CreatedNotice';
import Rounds from '@/app/components/admin/Rounds';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import ImageUpload from '@/app/components/admin/ImageUpload';
import { LINK_CATEGORIES, type SiteLink } from '@/lib/links';
import { publicUrl } from '@/lib/storage';
import { saveLink, type LinkFormState } from './actions';

const field = 'mt-1 w-full min-h-[44px] rounded-lg border border-linegrey bg-white px-3';

function Save() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="min-h-[44px] rounded-full bg-navyblue px-6 py-3 text-white disabled:opacity-60">{pending ? 'Menyimpan…' : 'Simpan'}</button>;
}

function LinkFormInner({ link, again }: { link: SiteLink | null; again: () => void }) {
  const [state, action] = useFormState<LinkFormState, FormData>(saveLink, {});
  const [url, setUrl] = useState(link?.url ?? '');
  if (state.ok && !link) {
    return (
      <CreatedNotice message={'Disimpan ✓'} againLabel="Tambah pautan lain" onAgain={again}></CreatedNotice>
    );
  }

  return (
    <form action={action} key={link?.id ?? 'new'} className="max-w-xl space-y-4 rounded-2xl bg-white p-4">
      <h2 className="text-lg font-semibold">{link ? 'Sunting pautan' : 'Pautan baharu'}</h2>
      {link ? <input type="hidden" name="id" value={link.id} /> : null}
      <label className="block text-sm font-medium">Tajuk
        <input name="title" required maxLength={200} defaultValue={link?.title} className={field} />
      </label>
      <label className="block text-sm font-medium">Pautan (URL)
        <input name="url" required maxLength={500} inputMode="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} className={field} />
      </label>
      <ImageUpload table="links" accept="image+pdf" label="Atau muat naik dokumen / gambar" value={null}
        onChange={(path) => { if (path) setUrl(publicUrl(path)); }} />
      <label className="block text-sm font-medium">Kategori
        <select name="category" defaultValue={link?.category ?? 'Umum'} className={field}>
          {LINK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">Keterangan (pilihan)
        <input name="description" maxLength={500} defaultValue={link?.description ?? ''} className={field} />
      </label>
      <Save />
      {state.error ? <p role="alert" className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-green-700">Disimpan ✓</p> : null}
    </form>
  );
}

export default function LinkForm({ link }: { link: SiteLink | null }) {
  return <Rounds>{(again) => <LinkFormInner link={link} again={again} />}</Rounds>;
}
