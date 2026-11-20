import { requireUser } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { siteUrl } from '@/lib/env';
import { formatDateMY } from '@/lib/format';
import { checkInvite } from '@/lib/invite';
import { cancelInvite, generateInvite } from './actions';

export const dynamic = 'force-dynamic';

export default async function Jemputan() {
  await requireUser();
  const service = createServiceClient();
  const [{ data: invite }, { data: users }] = await Promise.all([
    service.from('invites').select('code, expires_at').eq('id', 1).maybeSingle(),
    service.auth.admin.listUsers({ perPage: 200 }),
  ]);
  const stored = { code: invite?.code ?? null, expiresAt: invite?.expires_at ?? null };
  const live = checkInvite(stored, stored.code ?? '') === 'ok';
  const link = live ? `${siteUrl()}/admin/jemput/${stored.code}` : null;
  const wa = link ? `https://wa.me/?text=${encodeURIComponent(`Jemputan admin Surau Elmina Valley (sah 7 hari): ${link}`)}` : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Jemputan</h1>
      <section className="space-y-3 rounded-2xl bg-white p-4">
        <p className="text-sm">Hantar pautan ini <strong>hanya dalam kumpulan WhatsApp AJK</strong>. Sesiapa yang memilikinya boleh menjadi admin selagi ia sah.</p>
        {link ? (
          <>
            <input readOnly value={link} aria-label="Pautan jemputan" className="w-full rounded-lg border border-linegrey px-3 py-2 text-sm" />
            <p className="text-sm">Sah sehingga {formatDateMY(stored.expiresAt!)}.</p>
            <div className="flex flex-wrap gap-3">
              <a href={wa!} target="_blank" rel="noopener noreferrer" className="min-h-[44px] rounded-full bg-green-600 px-5 py-3 text-white">Kongsi ke WhatsApp</a>
              <form action={cancelInvite}><button className="min-h-[44px] rounded-full border border-red-300 px-5 py-3 text-red-700">Batalkan pautan</button></form>
            </div>
          </>
        ) : null}
        <form action={generateInvite}>
          <button className="min-h-[44px] rounded-full bg-navyblue px-5 py-3 text-white">
            {link ? 'Jana pautan baharu (batalkan yang lama)' : 'Jana pautan jemputan'}
          </button>
        </form>
      </section>
      <section className="rounded-2xl bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Senarai admin</h2>
        <ul className="divide-y divide-linegrey text-sm">
          {(users?.users ?? []).map((u) => (
            <li key={u.id} className="py-2">
              <div className="font-medium">{u.email}</div>
              <div className="text-darkgrey">
                Sertai {formatDateMY(u.created_at)} · Log masuk terakhir {u.last_sign_in_at ? formatDateMY(u.last_sign_in_at) : '—'}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-darkgrey">Untuk membuang admin: Supabase → Authentication → Users → padam.</p>
      </section>
    </div>
  );
}
