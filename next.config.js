const withSerwistInit = require('@serwist/next').default;

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development', // the service worker only runs in production builds
});

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = withSerwist(nextConfig)
