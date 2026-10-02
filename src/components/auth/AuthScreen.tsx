import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { authClient } from '../../auth/neonAuthClient';

type Mode = 'login' | 'signup' | 'reset';

const modeCopy = {
  login: { eyebrow: 'Welcome back', title: 'Sign in to see clearly', description: 'Your business, your signal, one focused view.', action: 'Sign in', loading: 'Signing in…' },
  signup: { eyebrow: 'Get started', title: 'Create your account', description: 'Bring the important things into focus.', action: 'Create account', loading: 'Creating account…' },
  reset: { eyebrow: 'Account recovery', title: 'Reset your password', description: 'We’ll send a secure link to your email.', action: 'Send reset link', loading: 'Sending reset link…' },
} as const;

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setMessage('');
  };

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
      const details = typeof error === 'object' && error !== null ? error as { code?: unknown; status?: unknown } : {};
      const code = typeof details.code === 'string' ? details.code : '';
      const status = typeof details.status === 'number' ? details.status : 0;
      console.warn('[auth] request failed', { mode, status, code });
      setMessage(mode === 'reset'
        ? 'We couldn’t send the password reset email. Check the address and try again.'
        : mode === 'signup' && (code === 'USER_ALREADY_EXISTS' || status === 409)
          ? 'An account already exists for this email. Sign in instead.'
          : mode === 'login' && (code === 'INVALID_EMAIL_OR_PASSWORD' || status === 401)
            ? 'The email or password is incorrect.'
            : 'Authentication is temporarily unavailable. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!authClient) return <main className="flex min-h-screen items-center justify-center bg-[#090b10] p-6 text-white"><p>Authentication is not configured for this environment.</p></main>;

  const copy = modeCopy[mode];
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#090b10] text-white selection:bg-[#9cc7ff] selection:text-[#0a0d14]">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(84,142,255,.16), transparent 32%), radial-gradient(circle at 82% 84%, rgba(110,91,255,.13), transparent 32%)' }} />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <a href="/" aria-label="Look Through home" className="inline-flex items-center rounded-md focus-visible:outline-white">
            <img src="/look-through-logo.png" alt="Look Through" className="h-10 w-auto object-contain brightness-0 invert" />
          </a>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.22em] text-white/40 sm:block">Secure workspace access</span>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 lg:py-14">
          <div className="grid w-full max-w-[1120px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-xl lg:grid-cols-[minmax(380px,0.9fr)_1.1fr]">
            <section className="flex items-center justify-center border-b border-white/10 p-7 sm:p-12 lg:border-b-0 lg:border-r lg:p-14" aria-labelledby="auth-title">
              <div className="w-full max-w-[410px]">
                <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#91bfff]">{copy.eyebrow}</p>
                <h1 id="auth-title" className="text-3xl font-medium tracking-[-0.04em] text-white sm:text-[42px] sm:leading-[1.05]">{copy.title}</h1>
                <p className="mt-4 text-sm leading-6 text-white/50">{copy.description}</p>

                <form onSubmit={submit} className="mt-9 space-y-4">
                  {mode === 'signup' && <div><label htmlFor="auth-name" className="sr-only">Full name</label><input id="auth-name" required value={name} onChange={event => setName(event.target.value)} placeholder="Full name" autoComplete="name" className="auth-field" /></div>}
                  <div><label htmlFor="auth-email" className="sr-only">Email address</label><input id="auth-email" required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email address" autoComplete="email" className="auth-field" /></div>
                  {mode !== 'reset' && <div className="relative"><label htmlFor="auth-password" className="sr-only">Password</label><input id="auth-password" required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className="auth-field pr-12" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/40 transition hover:text-white focus-visible:outline-white">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>}
                  {mode === 'login' && <div className="flex justify-end"><button type="button" onClick={() => changeMode('reset')} className="text-xs text-white/50 transition hover:text-white">Forgot password?</button></div>}
                  <button type="submit" disabled={busy} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#0b0d12] transition hover:bg-[#cfe2ff] disabled:cursor-wait disabled:opacity-60">{busy && <LoaderCircle className="size-4 animate-spin" />}{busy ? copy.loading : copy.action}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></button>
                </form>

                {message && <p role="status" aria-live="polite" className="mt-4 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm leading-5 text-white/70">{message}</p>}
                <div className="mt-8 flex items-center justify-center gap-1.5 text-sm text-white/45">
                  {mode === 'signup' ? <><span>Already have an account?</span><button type="button" onClick={() => changeMode('login')} className="font-medium text-white transition hover:text-[#a9caff]">Sign in</button></> : mode === 'reset' ? <><span>Remember your password?</span><button type="button" onClick={() => changeMode('login')} className="font-medium text-white transition hover:text-[#a9caff]">Back to sign in</button></> : <><span>New to Look Through?</span><button type="button" onClick={() => changeMode('signup')} className="font-medium text-white transition hover:text-[#a9caff]">Create an account</button></>}
                </div>
              </div>
            </section>

            <aside className="relative isolate hidden min-h-[540px] overflow-hidden bg-[#0b111d] lg:block" aria-label="About Look Through">
              <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" /><div className="auth-orb auth-orb-three" />
              <div className="auth-noise" />
              <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60"><span className="size-2 rounded-full bg-[#9cc7ff] shadow-[0_0_18px_#9cc7ff]" />Look Through</div>
                <div className="max-w-[420px]"><p className="mb-5 text-sm font-medium text-[#b9d5ff]">Business intelligence, made human.</p><h2 className="text-5xl font-medium leading-[0.98] tracking-[-0.06em] text-white xl:text-6xl">See what matters.<br /><span className="text-white/45">Act with clarity.</span></h2><p className="mt-7 max-w-sm text-sm leading-6 text-white/55">Bring your business data, work and intelligence into one operating view.</p></div>
                <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/35"><span>Understand your business, then act.</span><span>01 / 01</span></div>
              </div>
            </aside>
          </div>
        </div>
        <footer className="flex justify-center pb-1 text-[11px] text-white/30">By continuing, you agree to use Look Through securely.</footer>
      </div>
    </main>
  );
};

export default AuthScreen;

/* Auth-only visual primitives. */
const authStyles = `
.auth-field { width: 100%; height: 3.25rem; border: 1px solid rgba(255,255,255,.13); border-radius: .75rem; background: rgba(255,255,255,.055); padding: 0 .95rem; color: white; font-size: .875rem; outline: none; transition: border-color .2s, background .2s, box-shadow .2s; }
.auth-field::placeholder { color: rgba(255,255,255,.38); }
.auth-field:focus { border-color: rgba(156,199,255,.8); background: rgba(255,255,255,.08); box-shadow: 0 0 0 3px rgba(156,199,255,.12); }
.auth-orb { position: absolute; border-radius: 999px; filter: blur(1px); mix-blend-mode: screen; animation: auth-float 12s ease-in-out infinite alternate; }
.auth-orb-one { width: 72%; height: 52%; top: 4%; right: -8%; background: radial-gradient(ellipse, rgba(74,143,255,.95) 0%, rgba(74,143,255,.32) 38%, transparent 72%); transform: rotate(-22deg); }
.auth-orb-two { width: 86%; height: 48%; bottom: 8%; left: -22%; background: radial-gradient(ellipse, rgba(105,83,255,.72) 0%, rgba(42,105,238,.25) 42%, transparent 75%); transform: rotate(22deg); animation-delay: -4s; }
.auth-orb-three { width: 46%; height: 80%; top: 13%; left: 25%; background: radial-gradient(ellipse, rgba(155,207,255,.26), transparent 67%); filter: blur(30px); animation-delay: -8s; }
.auth-noise { position: absolute; inset: 0; opacity: .13; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E"); mix-blend-mode: soft-light; pointer-events: none; }
@keyframes auth-float { from { transform: translate3d(-2%, -2%, 0) rotate(-22deg) scale(1); } to { transform: translate3d(3%, 3%, 0) rotate(-16deg) scale(1.08); } }
@media (prefers-reduced-motion: reduce) { .auth-orb { animation: none; } }
`;

if (typeof document !== 'undefined' && !document.getElementById('look-through-auth-styles')) {
  const style = document.createElement('style');
  style.id = 'look-through-auth-styles';
  style.textContent = authStyles;
  document.head.appendChild(style);
}
