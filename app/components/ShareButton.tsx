'use client';

/** Shares a page path via the phone's share sheet, else WhatsApp. Counts the tap (fire and forget). */
export default function ShareButton({ path, title, className }: { path: string; title: string; className?: string }) {
  async function share() {
    const url = `${window.location.origin}${path}`;
    fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'share_click', path }),
      keepalive: true,
    }).catch(() => {});
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return; // user dismissed the sheet
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank', 'noopener');
  }

  return (
    <button type="button" onClick={share}
      className={className ?? 'min-h-[44px] rounded-full bg-green-600 px-5 py-3 font-medium text-white'}>
      Kongsi ke WhatsApp
    </button>
  );
}
