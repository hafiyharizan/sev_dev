'use client';

import { useState } from 'react';

/** Generates (loads) the month's poster image, then lets the admin download or share it. */
export default function PosterPreview({ month }: { month: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const url = `/jadual/${month}/poster.png`;

  async function share() {
    try {
      const blob = await (await fetch(src ?? url)).blob();
      const file = new File([blob], `jadual-${month}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Jadual Kuliah & Program Imarah' });
      else window.open(src ?? url, '_blank');
    } catch {
      setError('Tidak dapat berkongsi. Cuba muat turun.');
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => { setError(null); setSrc(`${url}?v=${Date.now()}`); }}
        className="min-h-[44px] rounded-full bg-blue px-5 py-3 text-white">
        Jana poster
      </button>
      {src ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Poster jadual ${month}`} className="w-full rounded-xl border border-linegrey" onError={() => setError('Poster gagal dijana. Cuba lagi.')} />
          <div className="flex flex-wrap gap-3">
            <a href={src} download={`jadual-${month}.png`} className="inline-flex min-h-[44px] items-center rounded-full border border-navyblue px-5 text-navyblue">Muat turun</a>
            <button type="button" onClick={share} className="min-h-[44px] rounded-full bg-green-600 px-5 text-white">Kongsi</button>
          </div>
        </div>
      ) : null}
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
