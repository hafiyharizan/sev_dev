import { describe, it, expect, vi } from 'vitest';
import { safe } from '@/lib/safe';

describe('safe', () => {
  it('returns the value when the promise resolves', async () => {
    expect(await safe(Promise.resolve([1, 2]), [])).toEqual([1, 2]);
  });

  it('returns the fallback and logs when the promise rejects', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await safe(Promise.reject(new Error('db down')), ['fallback'])).toEqual(['fallback']);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
