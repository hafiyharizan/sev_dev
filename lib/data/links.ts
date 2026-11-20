import { createPublicClient } from '@/lib/supabase/public';
import { TAGS } from '@/lib/cache-tags';
import type { SiteLink } from '@/lib/links';

export async function listLinks(): Promise<SiteLink[]> {
  const { data, error } = await createPublicClient([TAGS.links])
    .from('links').select('id, title, url, description, category, sort_order').order('sort_order').order('title');
  if (error) throw error;
  return (data ?? []).map((r: { id: string; title: string; url: string; description: string | null; category: string; sort_order: number }) => ({
    id: r.id, title: r.title, url: r.url, description: r.description, category: r.category as SiteLink['category'], sortOrder: r.sort_order,
  }));
}
