import LoginForm from '@/app/admin/login/LoginForm';
import { verifyCode } from '@/app/admin/login/actions';
import { readInvite } from '@/lib/data/invite';
import { checkInvite, INVALID_INVITE } from '@/lib/invite';
import { acceptInvite } from './actions';

export const dynamic = 'force-dynamic';

export default async function JemputPage({ params }: { params: { code: string } }) {
  const ok = checkInvite(await readInvite(), params.code) === 'ok';
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold">Jemputan AJK</h1>
      {ok ? (
        <>
          <p className="mb-6 text-sm">Masukkan e-mel anda untuk menyertai pasukan admin Surau Elmina Valley.</p>
          <LoginForm sendAction={acceptInvite.bind(null, params.code)} verifyAction={verifyCode} redirectTo="/admin" />
        </>
      ) : (
        <p role="alert">{INVALID_INVITE}</p>
      )}
    </main>
  );
}
