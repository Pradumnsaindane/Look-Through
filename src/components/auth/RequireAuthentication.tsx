import React, { useState } from 'react';
import { authClient } from '../../auth/neonAuthClient';
import { AuthScreen } from './AuthScreen';

type Capability = 'personal' | 'organization' | 'permission';

interface RequireAuthenticationProps {
  children: React.ReactNode;
  capability?: Capability;
  description?: string;
}

const copy: Record<Capability, { title: string; body: string }> = {
  personal: {
    title: 'Create your profile',
    body: 'Log in or create an account to save your profile and preferences.',
  },
  organization: {
    title: 'Your business workspace requires an account',
    body: 'Log in or create an account to access organization-backed business data.',
  },
  permission: {
    title: 'This action requires authorization',
    body: 'Log in with an authorized workspace account to continue.',
  },
};

export const RequireAuthentication: React.FC<RequireAuthenticationProps> = ({
  children,
  capability = 'organization',
  description,
}) => {
  const [showAuth, setShowAuth] = useState(false);
  const session = authClient
    ? (authClient.useSession() as { isPending: boolean; data?: { user?: unknown } | null })
    : { isPending: false, data: null };

  if (session.isPending) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm ledger-muted">Checking your workspace session…</div>;
  }

  if (session.data?.user) return <>{children}</>;

  if (showAuth) return <AuthScreen />;

  const content = copy[capability];
  return (
    <section className="mx-auto flex min-h-[52vh] max-w-xl items-center justify-center px-6 py-12">
      <div className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] ledger-faint">Account required</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{content.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 ledger-muted">{description ?? content.body}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => setShowAuth(true)} className="rounded-md bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-[var(--surface)]">Log in</button>
          <button onClick={() => setShowAuth(true)} className="rounded-md border border-[var(--hairline)] px-4 py-2.5 text-sm font-semibold">Create account</button>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="rounded-md px-4 py-2.5 text-sm ledger-muted hover:text-ink">Continue exploring</button>
        </div>
      </div>
    </section>
  );
};

export default RequireAuthentication;
