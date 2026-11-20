import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Surau Elmina Valley',
    short_name: 'SEV',
    description: 'Waktu solat, jadual kuliah dan hebahan Surau Elmina Valley.',
    start_url: '/?src=pwa',
    scope: '/',
    display: 'standalone',
    lang: 'ms',
    background_color: '#ffffff',
    theme_color: '#00224A',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
