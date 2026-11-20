import { safeAdminRedirect } from '@/lib/admin-paths';
import LoginForm from './LoginForm';
import { sendCode, verifyCode } from './actions';

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string } }) {
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">Log Masuk AJK</h1>
      <LoginForm sendAction={sendCode} verifyAction={verifyCode} redirectTo={safeAdminRedirect(searchParams.redirect)} />
    </main>
  );
}
