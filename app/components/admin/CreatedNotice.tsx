'use client';

import { m } from 'motion/react';

/**
 * Shown instead of a create form after it saved. Next 14 does not clear forms by itself, and a form left
 * filled invites a second tap that creates a duplicate. "Tambah lagi" starts a fresh empty form.
 */
export default function CreatedNotice({
  message, againLabel, onAgain, children,
}: { message: string; againLabel: string; onAgain: () => void; children?: React.ReactNode }) {
  return (
    <m.div role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="max-w-xl space-y-3 rounded-2xl bg-green-50 p-4">
      <p className="font-medium">{message}</p>
      {children}
      <button type="button" onClick={onAgain} className="min-h-[44px] rounded-full border border-navyblue px-5 text-navyblue">{againLabel}</button>
    </m.div>
  );
}
