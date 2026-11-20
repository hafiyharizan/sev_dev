import { revalidateTag } from 'next/cache';
import { TAGS } from '@/lib/cache-tags';

/** Sessions embed program types and speakers, so any schedule change busts all three caches. */
export function bustSchedule() {
  revalidateTag(TAGS.sessions);
  revalidateTag(TAGS.programTypes);
  revalidateTag(TAGS.speakers);
}
