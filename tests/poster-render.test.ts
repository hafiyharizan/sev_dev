import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { Poster, POSTER_SIZE } from '@/lib/poster/Poster';
import { buildPosterModel } from '@/lib/poster/model';
import type { ProgramType, SessionView } from '@/lib/schedule';

// next/og (used by the real route) wraps this same Satori engine. We drive Satori directly so the test
// also runs on Windows, where next/og's Node build cannot load.
const root = path.resolve(__dirname, '..');
const fontDir = path.join(root, 'app/(site)/jadual/[slug]/poster.png/fonts');
const dataUri = (rel: string, mime: string) => `data:${mime};base64,${fs.readFileSync(path.join(root, rel)).toString('base64')}`;

const type = (id: string, name: string, colour: string, sortOrder: number): ProgramType => ({
  id, name, colour, sortOrder, durationMinutes: null, timing: { mode: 'prayer', anchor: 'maghrib', offsetMinutes: 0 },
});
const types = [type('a', 'Kuliah Maghrib', '#A87BF0', 1), type('b', 'Kuliah Subuh', '#3DDC97', 2),
  type('c', 'Yassin / Tahlil / Doa Selamat', '#D9D9D9', 3), type('d', 'Si Cilik Mengaji', '#F2547D', 4)];

const s = (date: string, t: ProgramType, topic: string | null, speaker: string | null, kitab: string | null = null): SessionView => ({
  id: date + t.id, slug: date + t.id, date, status: 'scheduled', topic, kitab, notes: null,
  type: { id: t.id, name: t.name, colour: t.colour }, timing: t.timing,
  speaker: speaker ? { name: speaker, titleLine: null, photoUrl: null } : null,
});

describe('poster render', () => {
  it('lays out November 2026 as a Satori-valid 2160x1368 poster (set POSTER_OUT=<file> to keep the PNG)', async () => {
    const sessions = [
      s('2026-11-04', types[0], 'Mastika Hadith', 'Ustaz Prof Madya Dr Khader Ahmad'),
      s('2026-11-05', types[0], 'Tafsir/Tadabur', 'Ustaz Mohd Ayub Wari'),
      s('2026-11-06', types[3], null, 'Imam Farid'),
      s('2026-11-11', types[0], 'Akidah', 'Ustaz Dr Mohd Sobri Ellias', 'Sullamut Taufiq'),
      s('2026-11-12', types[2], null, null),
      s('2026-11-20', types[0], 'Al-Quran', 'Ustaz Nik Taufik'),
      s('2026-11-20', types[3], null, 'Imam Farid'),
    ];
    const model = buildPosterModel(2026, 11, sessions, types);
    const svg = await satori(
      React.createElement(Poster, { model, logoSrc: dataUri('public/images/sevlogo2.png', 'image/png'), qrSrc: dataUri('public/images/QR_SEV.jpg', 'image/jpeg') }),
      {
        ...POSTER_SIZE,
        fonts: [
          { name: 'Inter', data: fs.readFileSync(path.join(fontDir, 'inter-400.woff')), weight: 400, style: 'normal' },
          { name: 'Inter', data: fs.readFileSync(path.join(fontDir, 'inter-700.woff')), weight: 700, style: 'normal' },
        ],
      },
    );
    expect(svg).toContain('<svg');
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: POSTER_SIZE.width } }).render();
    expect(png.width).toBe(2160);
    expect(png.height).toBe(1368);
    if (process.env.POSTER_OUT) fs.writeFileSync(process.env.POSTER_OUT, png.asPng());
  }, 60000);
});
