'use client';

import { useEffect } from 'react';

/** The printed QR code points to /?src=qr. Count the first visit per browser session. */
export default function TrackQr() {
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get('src') !== 'qr') return;
      if (sessionStorage.getItem('sev-qr-counted')) return;
      sessionStorage.setItem('sev-qr-counted', '1');
      fetch('/api/track', {
        method: 'POST', headers: { 'content-type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ type: 'qr_scan', path: window.location.pathname }),
      }).catch(() => {});
    } catch {
      // storage can be blocked (private mode); counting is best-effort
    }
  }, []);
  return null;
}
