'use client';

import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { isIosSafari } from '@/lib/pwa';

type InstallEvent = Event & { prompt: () => Promise<void> };
const KEY = 'sev-install-dismissed';

const read = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const write = () => { try { localStorage.setItem(KEY, '1'); } catch { /* best effort */ } };

/** Android/desktop Chrome: a "Pasang aplikasi" button. iPhone Safari: a one-time Add to Home Screen guide. Counts installs. */
export default function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    if (!read() && isIosSafari(navigator.userAgent)) setIos(true);
    const onPrompt = (e: Event) => { e.preventDefault(); if (!read()) setEvent(e as InstallEvent); };
    const onInstalled = () => {
      setEvent(null);
      fetch('/api/track', { method: 'POST', headers: { 'content-type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ type: 'pwa_install', path: window.location.pathname }) }).catch(() => {});
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  if (!event && !ios) return null;
  const dismiss = () => { write(); setEvent(null); setIos(false); };

  return (
    <m.div initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}
      role="dialog" aria-label="Pasang aplikasi"
      className="fixed inset-x-3 bottom-20 z-40 rounded-2xl bg-white p-4 shadow-xl md:bottom-4 md:left-auto md:max-w-sm">
      {event ? (
        <>
          <p className="font-semibold">Pasang aplikasi SEV</p>
          <p className="mt-1 text-sm">Akses waktu solat dan jadual terus dari skrin utama.</p>
          <div className="mt-3 flex gap-3">
            <button type="button" className="min-h-[44px] rounded-full bg-navyblue px-5 text-white"
              onClick={async () => { await event.prompt(); setEvent(null); }}>Pasang aplikasi</button>
            <button type="button" className="min-h-[44px] px-3 text-sm" onClick={dismiss}>Nanti</button>
          </div>
        </>
      ) : (
        <>
          <p className="font-semibold">Pasang di iPhone</p>
          <p className="mt-1 text-sm">Ketik butang <strong>Kongsi</strong> (kotak dengan anak panah) di Safari, kemudian pilih <strong>Tambah ke Skrin Utama</strong>.</p>
          <button type="button" className="mt-3 min-h-[44px] rounded-full bg-navyblue px-5 text-white" onClick={dismiss}>Faham</button>
        </>
      )}
    </m.div>
  );
}
