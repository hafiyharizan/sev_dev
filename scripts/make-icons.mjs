// Regenerates the PWA icons from the mosque emblem. Run: node scripts/make-icons.mjs
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';

const logo = fs.readFileSync('public/images/sevlogo3.png').toString('base64');

function icon(size, scale) {
  const s = size * scale;
  const o = (size - s) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#ffffff"/>
    <image href="data:image/png;base64,${logo}" x="${o}" y="${o}" width="${s}" height="${s}"/>
  </svg>`;
  return new Resvg(svg).render().asPng();
}

fs.mkdirSync('public/icons', { recursive: true });
fs.writeFileSync('public/icons/icon-192.png', icon(192, 0.82));
fs.writeFileSync('public/icons/icon-512.png', icon(512, 0.82));
fs.writeFileSync('public/icons/maskable-512.png', icon(512, 0.6)); // keep inside the maskable safe zone
fs.writeFileSync('public/icons/apple-touch-icon.png', icon(180, 0.82));
console.log('icons written to public/icons');
