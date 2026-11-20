import { redirect } from 'next/navigation';
import { getPostBySlug } from '@/lib/data/posts';
import SiakStatic from './SiakStatic';

export const dynamic = 'force-dynamic';

const SIAK_POST = 'kekosongan-jawatan-siak';

/** Old WhatsApp-shared link. Redirects to the post once it exists; otherwise keeps showing the original page. */
export default async function SiakPage() {
  let exists = false;
  try {
    exists = (await getPostBySlug(SIAK_POST)) !== null;
  } catch {
    exists = false; // database unreachable or not configured: never break the old link
  }
  if (exists) redirect(`/hebahan/${SIAK_POST}`);
  return <SiakStatic />;
}
