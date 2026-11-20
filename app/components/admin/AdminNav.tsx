'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin', label: 'Utama' },
  { href: '/admin/hebahan', label: 'Hebahan' },
  { href: '/admin/jadual', label: 'Jadual' },
  { href: '/admin/borang', label: 'Borang' },
  { href: '/admin/tetapan', label: 'Tetapan' },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));
}

/** Sidebar on >=768px. */
export function SideNav() {
  const active = useActive();
  return (
    <nav aria-label="Menu admin" className="hidden w-52 shrink-0 flex-col gap-1 p-4 md:flex">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={active(i.href) ? 'page' : undefined}
          className={`min-h-[44px] rounded-lg px-3 py-3 ${active(i.href) ? 'bg-navyblue text-white' : 'hover:bg-white'}`}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

/** Bottom tab bar on phones. */
export function BottomTabs() {
  const active = useActive();
  return (
    <nav aria-label="Menu admin" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-linegrey bg-white md:hidden">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={active(i.href) ? 'page' : undefined}
          className={`flex min-h-[56px] flex-1 items-center justify-center text-xs font-medium ${active(i.href) ? 'text-blue' : 'text-darkgrey'}`}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
