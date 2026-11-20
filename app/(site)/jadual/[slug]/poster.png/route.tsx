import { ImageResponse } from 'next/og';
import { Poster, POSTER_SIZE } from '@/lib/poster/Poster';
import { buildPosterModel } from '@/lib/poster/model';
import { listProgramTypes, listSessions } from '@/lib/data/schedule';

// Edge runtime: next/og's Node build cannot load on Windows (path.join on a file: URL), edge works everywhere.
export const runtime = 'edge';

const pad = (n: number) => String(n).padStart(2, '0');

/** GET /jadual/2026-11/poster.png: the month's schedule poster (also the WhatsApp preview image). */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(params.slug);
  if (!m) return new Response('Not found', { status: 404 });
  const year = Number(m[1]);
  const month = Number(m[2]);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const [bold, regular, sessions, types] = await Promise.all([
    fetch(new URL('./fonts/inter-700.woff', import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL('./fonts/inter-400.woff', import.meta.url)).then((r) => r.arrayBuffer()),
    listSessions(`${year}-${pad(month)}-01`, `${year}-${pad(month)}-${pad(last)}`),
    listProgramTypes(),
  ]);
  const origin = new URL(request.url).origin;

  return new ImageResponse(
    <Poster model={buildPosterModel(year, month, sessions, types)} logoSrc={`${origin}/images/sevlogo2.png`} qrSrc={`${origin}/images/QR_SEV.jpg`} />,
    {
      ...POSTER_SIZE,
      fonts: [
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' },
    },
  );
}
