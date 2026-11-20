'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { initialLoginState, type LoginState } from './state';

type Action = (prev: LoginState, fd: FormData) => Promise<LoginState>;

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full min-h-[44px] rounded-full bg-navyblue px-4 py-3 font-medium text-white disabled:opacity-60"
    >
      {pending ? 'Sila tunggu…' : children}
    </button>
  );
}

/** Two steps: e-mail -> 6-digit code. `sendAction` differs for the invite page. */
export default function LoginForm({
  sendAction,
  verifyAction,
  redirectTo,
}: {
  sendAction: Action;
  verifyAction: Action;
  redirectTo: string;
}) {
  const [sent, sendForm] = useFormState(sendAction, initialLoginState);
  const [verified, verifyForm] = useFormState(verifyAction, sent);
  const state = verified.error ? verified : sent;

  return (
    <div className="space-y-4">
      {state.step === 'email' ? (
        <form action={sendForm} className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="email">E-mel</label>
          <input id="email" name="email" type="email" required autoComplete="email" inputMode="email"
            defaultValue={state.email} className="w-full min-h-[44px] rounded-lg border border-linegrey px-3" />
          <Submit>Hantar kod</Submit>
        </form>
      ) : (
        <>
          <form action={verifyForm} className="space-y-4">
            <p className="text-sm">Masukkan kod 6 digit yang dihantar ke <strong>{state.email}</strong>.</p>
            <input type="hidden" name="email" value={state.email} />
            <input type="hidden" name="redirect" value={redirectTo} />
            <input name="code" required inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code"
              aria-label="Kod 6 digit" className="w-full min-h-[44px] rounded-lg border border-linegrey px-3 text-center text-2xl tracking-widest" />
            <Submit>Log masuk</Submit>
          </form>
          <form action={sendForm}>
            <input type="hidden" name="email" value={state.email} />
            <button type="submit" className="min-h-[44px] text-sm underline">Hantar semula kod</button>
          </form>
        </>
      )}
      {state.error ? <p role="alert" className="text-sm text-red-600">{state.error}</p> : null}
    </div>
  );
}
