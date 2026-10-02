import React, { useState } from 'react';
import { authClient } from '../../auth/neonAuthClient';

type Mode = 'login' | 'signup' | 'reset';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authClient) return;
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'reset') {
        const result = await authClient.requestPasswordReset({ email: email.trim().toLowerCase() });
        if (result.error) throw result.error;
        setMessage('If an account exists for that email, reset instructions are on the way.');
      } else if (mode === 'signup') {
        const result = await authClient.signUp.email({ name: name.trim(), email: email.trim().toLowerCase(), password });
        if (result.error) throw result.error;
        window.location.assign(window.location.origin);
        return;
      } else {
        const result = await authClient.signIn.email({ email: email.trim().toLowerCase(), password });
        if (result.error) throw result.error;
        window.location.assign(window.location.origin);
        return;
      }
    } catch (error) {
      const details = typeof error === 'object' && error !== null ? error as { code?: unknown; status?: unknown; message?: unknown } : {};
      const code = typeof details.code === 'string' ? details.code : '';
      const status = typeof details.status === 'number' ? details.status : 0;
      console.warn('[auth] request failed', { mode, status, code });
      const message = mode === 'reset'
        ? 'We couldn’t send the password reset email. Check the email address and try again.'
        : mode === 'signup' && (code === 'USER_ALREADY_EXISTS' || status === 409)
          ? 'An account already exists for this email. Sign in instead.'
          : mode === 'login' && (code === 'INVALID_EMAIL_OR_PASSWORD' || status === 401)
            ? 'The email or password is incorrect.'
            : 'Authentication is temporarily unavailable. Please try again.';
      setMessage(message);
    } finally {
      setBusy(false);
    }
  };

  if (!authClient) return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100"><p>Authentication is not configured for this environment.</p></main>;

  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100"><section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"><p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-400">Look-Through</p><h1 className="text-2xl font-bold">{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Sign in to your workspace'}</h1><p className="mt-2 text-sm text-slate-400">Secure access powered by Neon Auth.</p><form onSubmit={submit} className="mt-7 space-y-4">{mode === 'signup' && <input required value={name} onChange={event => setName(event.target.value)} placeholder="Full name" autoComplete="name" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-blue-500" />}<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Work email" autoComplete="email" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-blue-500" />{mode !== 'reset' && <input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-blue-500" />}<button disabled={busy} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Working…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset email' : 'Sign in'}</button></form>{message && <p role="status" className="mt-4 text-sm text-slate-300">{message}</p>}<div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400"><button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="hover:text-white">{mode === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}</button>{mode !== 'signup' && <button onClick={() => setMode(mode === 'reset' ? 'login' : 'reset')} className="hover:text-white">{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</button>}</div></section></main>;
};
