import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const DAY = 24 * 60 * 60;

// First matching rule wins, so the "never cache" rules come first.
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Admin pages and our API are never served from cache.
    { matcher: ({ url }) => url.pathname.startsWith('/admin') || url.pathname.startsWith('/api'), handler: new NetworkOnly() },
    // Public images from Supabase Storage: paths never change, so cache hard.
    {
      matcher: ({ url }) => url.pathname.includes('/storage/v1/object/public/'),
      handler: new CacheFirst({ cacheName: 'sev-images', plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * DAY })] }),
    },
    // Every other Supabase call (auth, REST, private storage) is never cached.
    {
      matcher: ({ url }) => /^\/(auth|rest|storage)\/v1\//.test(url.pathname),
      handler: new NetworkOnly(),
    },
    // Pages (incl. /waktu-solat): network first, fall back to the last visited copy offline.
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({ cacheName: 'sev-pages', networkTimeoutSeconds: 4, plugins: [new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 7 * DAY })] }),
    },
    ...defaultCache,
  ],
});

// Release 2: add a `push` event listener here for azan notifications.
serwist.addEventListeners();
