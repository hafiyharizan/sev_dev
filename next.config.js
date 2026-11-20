const withSerwistInit = require('@serwist/next').default;

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Default is every file in public/ (about 33 MB of photos, a video and a PDF) which every first-time visitor would download.
  // Pre-cache only the install icons; images are cached as they are seen (see app/sw.ts).
  globPublicPatterns: ['icons/**/*'],
  disable: process.env.NODE_ENV === 'development', // the service worker only runs in production builds
});

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = withSerwist(nextConfig)
