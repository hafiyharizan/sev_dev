import { describe, it, expect, vi } from 'vitest';
import { taggedFetch } from '@/lib/supabase/public';
import { TAGS } from '@/lib/cache-tags';

describe('taggedFetch', () => {
  it('adds next.tags and a 1-hour revalidate to every request', async () => {
    const base = vi.fn().mockResolvedValue(new Response('{}'));
    await taggedFetch([TAGS.posts], base)('https://x.supabase.co/rest/v1/posts', { headers: { a: 'b' } });
    expect(base).toHaveBeenCalledWith('https://x.supabase.co/rest/v1/posts', {
      headers: { a: 'b' },
      next: { tags: ['posts'], revalidate: 3600 },
    });
  });
});
