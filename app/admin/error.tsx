'use client';

import Link from 'next/link';

/** Catches errors thrown by admin pages and bound actions (for example a delete after the session expired). */
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-xl font-bold">Ada masalah</h1>
      <p className="mt-2">Sesi anda mungkin telah tamat, atau tindakan tidak berjaya. Log masuk semula, kemudian cuba lagi.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/admin/login" className="inline-flex min-h-[44px] items-center rounded-full bg-navyblue px-5 text-white">Log masuk semula</Link>
        <button type="button" onClick={reset} className="min-h-[44px] rounded-full border border-navyblue px-5 text-navyblue">Cuba lagi</button>
      </div>
    </div>
  );
}
