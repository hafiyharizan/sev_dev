import { describe, it, expect } from 'vitest';
import { fitWithin } from '@/lib/image/resize';

describe('fitWithin', () => {
  it('scales the longest side down to 1600', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  it('never upscales', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('honours a custom max and rounds to whole pixels', () => {
    expect(fitWithin(1000, 333, 500)).toEqual({ width: 500, height: 167 });
  });
});

import { extForMime } from '@/lib/image/resize';

describe('extForMime', () => {
  it('maps allowed upload types to file extensions', () => {
    expect(extForMime('image/webp')).toBe('webp');
    expect(extForMime('image/jpeg')).toBe('jpg');
    expect(extForMime('image/png')).toBe('png');
    expect(extForMime('application/pdf')).toBe('pdf');
  });

  it('returns null for anything else', () => {
    expect(extForMime('image/gif')).toBeNull();
    expect(extForMime('text/html')).toBeNull();
  });
});
