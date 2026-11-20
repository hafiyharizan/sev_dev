'use client';

import { useState, useTransition } from 'react';
import { copyLastMonth, type CopyResult } from '@/app/admin/(panel)/jadual/actions';
import { formatDateMY } from '@/lib/format';

export default function CopyMonthButton({ year, month }: { year: number; month: number }) {
  const [result, setResult] = useState<CopyResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-2">
      <button type="button" disabled={pending}
        onClick={() => start(async () => setResult(await copyLastMonth(year, month)))}
        className="min-h-[44px] rounded-full border border-navyblue px-5 py-3 text-navyblue disabled:opacity-60">
        {pending ? 'Menyalin…' : 'Salin bulan lepas'}
      </button>
      {result?.error ? <p role="alert" className="text-sm text-red-600">{result.error}</p> : null}
      {result && !result.error ? (
        <div role="status" className="rounded-xl bg-green-50 p-3 text-sm">
          <p>{result.created} sesi disalin.</p>
          {result.skipped && result.skipped.length > 0 ? (
            <>
              <p className="mt-2 font-medium">Tidak dapat disalin (tiada minggu yang sepadan):</p>
              <ul className="list-disc pl-5">
                {result.skipped.map((s) => <li key={s.date}>{formatDateMY(s.date)}{s.topic ? ` — ${s.topic}` : ''}</li>)}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
