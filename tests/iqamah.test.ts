import { describe, it, expect } from 'vitest';
import { parseIqamahOffsets } from '@/lib/iqamah';

const form = (o: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(o)) fd.set(k, v);
  return fd;
};

describe('parseIqamahOffsets', () => {
  it('reads one whole-number offset per prayer', () => {
    const r = parseIqamahOffsets(form({ subuh: '15', zohor: '10', asar: '10', maghrib: '5', isyak: '10' }));
    expect(r).toEqual({ ok: true, value: { subuh: 15, zohor: 10, asar: 10, maghrib: 5, isyak: 10 } });
  });

  it('rejects values outside 0-60, blanks and decimals', () => {
    const base = { subuh: '15', zohor: '10', asar: '10', maghrib: '10', isyak: '10' };
    for (const bad of ['-1', '61', '', 'abc', '7.5']) {
      const r = parseIqamahOffsets(form({ ...base, asar: bad }));
      expect(r).toEqual({ ok: false, error: 'Iqamah mesti nombor bulat antara 0 dan 60 minit.' });
    }
  });
});
