'use client';

import CreatedNotice from '@/app/components/admin/CreatedNotice';
import Rounds from '@/app/components/admin/Rounds';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { m } from 'motion/react';
import ImageUpload from '@/app/components/admin/ImageUpload';
import ShareButton from '@/app/components/ShareButton';
import type { Post } from '@/lib/posts';
import { savePost, type PostFormState } from './actions';

function Publish({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="min-h-[44px] w-full rounded-full bg-navyblue px-5 py-3 font-medium text-white disabled:opacity-60 sm:w-auto">
      {pending ? 'Menyimpan…' : editing ? 'Simpan' : 'Siarkan'}
    </button>
  );
}

const field = 'mt-1 w-full min-h-[44px] rounded-lg border border-linegrey bg-white px-3';

function PostFormInner({ post, again }: { post: Post | null; again: () => void }) {
  const [state, action] = useFormState<PostFormState, FormData>(savePost, {});
  const [imagePath, setImagePath] = useState<string | null>(post?.imagePath ?? null);
  const [title, setTitle] = useState(post?.title ?? '');

  if (state.ok && state.slug && !post) {
    return (
      <CreatedNotice message={'Disiarkan ✓'} againLabel="Tambah hebahan lain" onAgain={again}>
        <p className="break-all text-sm">/hebahan/{state.slug}</p>
        <ShareButton path={`/hebahan/${state.slug}`} title={title || 'Hebahan SEV'} />
      </CreatedNotice>
    );
  }

  return (
    <form action={action} className="max-w-xl space-y-5">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <input type="hidden" name="image_path" value={imagePath ?? ''} />

      <ImageUpload table="posts" value={imagePath} onChange={setImagePath} label="Gambar" />

      <label className="block text-sm font-medium">Tajuk
        <input name="title" required maxLength={200} defaultValue={post?.title} onChange={(e) => setTitle(e.target.value)} className={field} />
      </label>
      <label className="block text-sm font-medium">Jenis
        <select name="type" defaultValue={post?.type ?? 'pengumuman'} className={field}>
          <option value="pengumuman">Pengumuman</option>
          <option value="buletin">Buletin</option>
        </select>
      </label>
      <label className="block text-sm font-medium">Tajuk kecil (pilihan)
        <input name="subtitle" maxLength={200} defaultValue={post?.subtitle ?? ''} className={field} />
      </label>
      <label className="block text-sm font-medium">Keterangan (pilihan)
        <textarea name="body" rows={5} defaultValue={post?.body ?? ''} className={`${field} py-2`} />
      </label>
      <label className="block text-sm font-medium">Pautan (pilihan)
        <input name="external_url" maxLength={500} inputMode="url" placeholder="https://…" defaultValue={post?.externalUrl ?? ''} className={field} />
      </label>
      <label className="flex min-h-[44px] items-center gap-3 text-sm">
        <input name="pinned" type="checkbox" defaultChecked={post?.pinned} className="h-5 w-5" /> Sematkan di atas
      </label>

      <Publish editing={!!post} />
      {state.error ? <p role="alert" className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok && state.slug ? (
        <m.div role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-3 rounded-2xl bg-green-50 p-4">
          <p className="font-medium">Disimpan ✓</p>
          <p className="break-all text-sm">/hebahan/{state.slug}</p>
          <ShareButton path={`/hebahan/${state.slug}`} title={title || 'Hebahan SEV'} />
        </m.div>
      ) : null}
    </form>
  );
}

export default function PostForm({ post }: { post: Post | null }) {
  return <Rounds>{(again) => <PostFormInner post={post} again={again} />}</Rounds>;
}
