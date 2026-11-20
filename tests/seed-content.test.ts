import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PROGRAM_TYPE_NAMES, SEED_LINKS, SEED_POSTS, SEED_SPEAKERS, novemberSessions, uploadExt } from '@/lib/seed/content';

const root = path.resolve(__dirname, '..');
const weekday = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

describe('seed content', () => {
  const sessions = novemberSessions();

  it('uses exactly the program types that supabase/seed.sql creates', () => {
    const sql = fs.readFileSync(path.join(root, 'supabase/seed.sql'), 'utf8');
    for (const name of PROGRAM_TYPE_NAMES) expect(sql).toContain(`'${name}'`);
    for (const s of sessions) expect(PROGRAM_TYPE_NAMES).toContain(s.typeName);
  });

  it('only names speakers that are in the speaker list', () => {
    for (const s of sessions) if (s.speaker) expect(SEED_SPEAKERS).toContain(s.speaker);
  });

  it('has the poster\'s 18 sessions, all in November 2026', () => {
    expect(sessions).toHaveLength(18);
    for (const s of sessions) expect(s.date).toMatch(/^2026-11-(0[1-9]|[12]\d|30)$/);
    expect(sessions.filter((s) => s.typeName === 'Kuliah Maghrib')).toHaveLength(11);
  });

  it('puts Yassin/Tahlil on Thursdays and Si Cilik Mengaji on Fridays, as the poster does', () => {
    for (const s of sessions.filter((x) => x.typeName === 'Yassin / Tahlil / Doa Selamat')) expect(weekday(s.date)).toBe(4);
    for (const s of sessions.filter((x) => x.typeName === 'Si Cilik Mengaji')) expect(weekday(s.date)).toBe(5);
  });

  it('has unique post slugs, and no post links to /siak (that would be a redirect loop)', () => {
    const slugs = SEED_POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain('kekosongan-jawatan-siak');
    for (const p of SEED_POSTS) expect(p.externalUrl).not.toBe('/siak');
  });

  it('every post image exists in public/ and every link starts with a safe prefix', () => {
    for (const p of SEED_POSTS) if (p.imageFile) expect(fs.existsSync(path.join(root, 'public', p.imageFile))).toBe(true);
    for (const l of SEED_LINKS) expect(l.url).toMatch(/^(https?:\/\/|\/)/);
    for (const p of SEED_POSTS) if (p.externalUrl) expect(p.externalUrl).toMatch(/^(https?:\/\/|\/)/);
  });
});

describe('uploadExt', () => {
  it('normalises .jpeg to .jpg so later admin edits pass the upload-path check', () => {
    expect(uploadExt('images/articles/feat3.jpeg')).toBe('jpg');
    expect(uploadExt('a.JPG')).toBe('jpg');
    expect(uploadExt('a.png')).toBe('png');
    expect(uploadExt('a.webp')).toBe('webp');
  });

  it('refuses unsupported types', () => {
    expect(() => uploadExt('a.gif')).toThrow();
  });
});
