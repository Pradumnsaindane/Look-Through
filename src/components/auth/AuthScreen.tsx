import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LoaderCircle, Moon, Sun } from 'lucide-react';
import { authClient } from '../../auth/neonAuthClient';
import { LookThroughMark } from '../brand/LookThroughMark';

type Mode = 'login' | 'signup' | 'reset';

const modeCopy = {
  login: { eyebrow: 'Welcome back', title: 'Sign in to see clearly', description: 'Your business, your signal, one focused view.', action: 'Sign in', loading: 'Signing in…' },
  signup: { eyebrow: 'Get started', title: 'Build a clearer view of your business.', description: 'Bring your business data, work and intelligence into one focused view.', action: 'Create account', loading: 'Creating account…' },
  reset: { eyebrow: 'Account recovery', title: 'Reset your password', description: "Enter your email and we'll send you a secure password reset link.", action: 'Send reset link', loading: 'Sending reset link…' },
} as const;

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    setDark(current => {
      const next = !current;
      document.documentElement.classList.toggle('dark', next);
      document.documentElement.style.colorScheme = next ? 'dark' : 'light';
      return next;
    });
  };

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
        window.location.assign('/dashboard');
        return;
      } else {
        const result = await authClient.signIn.email({ email: email.trim().toLowerCase(), password });
        if (result.error) throw result.error;
        window.location.assign('/dashboard');
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

  const copy = modeCopy[mode];
  return (
    <main className="auth-page relative flex min-h-screen overflow-hidden selection:bg-[var(--auth-marker)] selection:text-[var(--auth-ink)]">
      <div className="auth-glow pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <a href="/" aria-label="Look Through home" className="inline-flex items-center rounded-md focus-visible:outline-[var(--auth-ink)]">
            <LookThroughMark showWordmark className="auth-brand" />
          </a>
          <div className="flex items-center gap-4">
            <span className="auth-caption hidden text-[11px] font-medium uppercase tracking-[0.22em] sm:block">Secure workspace access</span>
            <button type="button" onClick={toggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} className="auth-theme-toggle">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 lg:py-14">
          <div className="auth-card grid w-full max-w-[1120px] overflow-hidden rounded-[8px] border shadow-[0_30px_100px_rgba(0,0,0,.12)] lg:grid-cols-[minmax(380px,0.9fr)_1.1fr]">
            <section className="flex items-center justify-center border-b p-7 sm:p-12 lg:border-b-0 lg:border-r lg:p-14" aria-labelledby="auth-title">
              <div className="w-full max-w-[410px]">
                <p className="auth-accent mb-5 text-[11px] font-semibold uppercase tracking-[0.28em]">{copy.eyebrow}</p>
                <h1 id="auth-title" className="text-3xl font-medium tracking-[-0.04em] sm:text-[42px] sm:leading-[1.05]">{copy.title}</h1>
                <p className="auth-muted mt-4 text-sm leading-6">{copy.description}</p>

                {!authClient ? <p role="status" className="auth-status mt-8">Sign in is unavailable because this deployment is missing <code>VITE_NEON_AUTH_URL</code>. Add the Neon Auth URL to the deployment environment and rebuild the app.</p> : <form onSubmit={submit} className="mt-9 space-y-4">
                  {mode === 'signup' && <div><label htmlFor="auth-name" className="sr-only">Full name</label><input id="auth-name" required value={name} onChange={event => setName(event.target.value)} placeholder="Full name" autoComplete="name" className="auth-field" /></div>}
                  <div><label htmlFor="auth-email" className="sr-only">Email address</label><input id="auth-email" required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email address" autoComplete="email" className="auth-field" /></div>
                  {mode !== 'reset' && <div className="relative"><label htmlFor="auth-password" className="sr-only">Password</label><input id="auth-password" required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className="auth-field pr-12" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="auth-password-toggle absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 transition">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>}
                  {mode === 'login' && <div className="flex justify-end"><button type="button" onClick={() => changeMode('reset')} className="auth-muted text-xs transition">Forgot password?</button></div>}
                  <button type="submit" disabled={busy} className="auth-submit group flex h-12 w-full items-center justify-center gap-2 rounded-[3px] px-5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60">{busy && <LoaderCircle className="size-4 animate-spin" />}{busy ? copy.loading : copy.action}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></button>
                </form>}

                {message && <p role="status" aria-live="polite" className="auth-status mt-4">{message}</p>}
                {authClient && <div className="auth-muted mt-8 flex items-center justify-center gap-1.5 text-sm">
                  {mode === 'signup' ? <><span>Already have an account?</span><button type="button" onClick={() => changeMode('login')} className="auth-accent font-medium transition">Sign in</button></> : mode === 'reset' ? <><span>Remember your password?</span><button type="button" onClick={() => changeMode('login')} className="auth-accent font-medium transition">Back to sign in</button></> : <><span>New to Look Through?</span><button type="button" onClick={() => changeMode('signup')} className="auth-accent font-medium transition">Create an account</button></>}
                </div>
                }
              </div>
            </section>

            <aside className="auth-visual relative isolate hidden min-h-[540px] overflow-hidden lg:block" aria-label="About Look Through">
              <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" /><div className="auth-orb auth-orb-three" />
              <div className="auth-noise" />
              <div className="auth-visual-content relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
                <div className="auth-visual-muted flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em]"><span className="auth-dot size-2 rounded-full" />Look Through</div>
                <div className="max-w-[420px]"><p className="auth-accent mb-5 text-sm font-medium">One focused operating view.</p><h2 className="text-5xl font-medium leading-[0.98] tracking-[-0.06em] xl:text-6xl">See what matters.<br /><span className="auth-visual-muted">Act with clarity.</span></h2><p className="auth-visual-muted mt-7 max-w-sm text-sm leading-6">Bring your business data, work and intelligence into one focused operating view.</p></div>
                <div className="auth-visual-footer flex items-center justify-between border-t pt-5 text-xs"><span>Understand your business. Then act.</span><span>LOOK / 01</span></div>
              </div>
            </aside>
          </div>
        </div>
        <footer className="auth-caption flex justify-center pb-1 text-[11px]">By continuing, you agree to use Look Through securely.</footer>
      </div>
    </main>
  );
};

export default AuthScreen;
