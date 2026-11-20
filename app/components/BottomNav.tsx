'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { m } from 'motion/react';
import { CalendarDaysIcon, ClockIcon, EllipsisHorizontalIcon, HomeIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

const TABS = [
  { href: '/', label: 'Utama', Icon: HomeIcon },
  { href: '/waktu-solat', label: 'Waktu Solat', Icon: ClockIcon },
  { href: '/jadual', label: 'Jadual', Icon: CalendarDaysIcon },
  { href: '/hebahan', label: 'Hebahan', Icon: MegaphoneIcon },
] as const;

const MORE = [
  { href: '/borang', label: 'Borang & Pautan' },
  { href: '/khairat', label: 'Pendaftaran Tabung Khairat' },
  { href: '/tabung', label: 'Kutipan Tabung Surau' },
  { href: '/#faq-section', label: 'Soalan Lazim' },
];

/** Phone-only tab bar (hidden from 768px up, where the top navbar is used). */
export default function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const base = 'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium';

  return (
    <>
      <nav aria-label="Menu utama" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-linegrey bg-white md:hidden">
        {TABS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={`${base} ${active(href) ? 'text-blue' : 'text-darkgrey'}`}>
            <Icon className="h-6 w-6" aria-hidden="true" />
            {label}
          </Link>
        ))}
        <button type="button" onClick={() => setOpen(true)} className={`${base} text-darkgrey`}>
          <EllipsisHorizontalIcon className="h-6 w-6" aria-hidden="true" />
          Lagi
        </button>
      </nav>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-40 md:hidden">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-x-0 bottom-0">
          <Dialog.Panel as={m.div} initial={{ y: 60 }} animate={{ y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="rounded-t-3xl bg-white p-6 pb-10">
            <Dialog.Title className="mb-3 text-lg font-semibold">Lagi</Dialog.Title>
            <ul>
              {MORE.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} onClick={() => setOpen(false)} className="flex min-h-[48px] items-center border-b border-linegrey">{m.label}</Link>
                </li>
              ))}
            </ul>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
