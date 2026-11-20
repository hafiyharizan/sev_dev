'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';

/** Delete button that asks first. `action` is a server action already bound to the record id. */
export default function ConfirmDelete({ action, label = 'Padam' }: { action: () => Promise<void>; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="min-h-[44px] rounded-lg border border-red-300 px-3 text-sm text-red-700">
        {label}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6">
            <Dialog.Title className="text-lg font-semibold">Padam?</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm">Tindakan ini tidak boleh dibatalkan.</Dialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="min-h-[44px] px-4">Batal</button>
              <form action={action}>
                <button type="submit" className="min-h-[44px] rounded-lg bg-red-600 px-4 text-white">Padam</button>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
