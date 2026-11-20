import { describe, it, expect } from 'vitest';
import { slugify, sessionSlug } from '@/lib/slug';

describe('slugify', () => {
  it('lowercases, strips punctuation and joins with dashes', () => {
    expect(slugify('Kuliah Maghrib: Akidah!')).toBe('kuliah-maghrib-akidah');
    expect(slugify('  Qurban   SEV 2024 ')).toBe('qurban-sev-2024');
  });

  it('drops accents and caps the length at 80', () => {
    expect(slugify('Café Ūstaz')).toBe('cafe-ustaz');
    expect(slugify('a'.repeat(200))).toHaveLength(80);
  });
});

describe('sessionSlug', () => {
  it('prefixes the date', () => {
    expect(sessionSlug('2026-11-11', 'Akidah')).toBe('2026-11-11-akidah');
  });

  it('is just the date when the topic slugifies to nothing', () => {
    expect(sessionSlug('2026-11-12', '!!!')).toBe('2026-11-12');
  });
});
