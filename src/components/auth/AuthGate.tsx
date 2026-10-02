import React from 'react';
import { authClient } from '../../auth/neonAuthClient';
import { AuthScreen } from './AuthScreen';

export const AuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  if (!authClient) return <AuthScreen />;
  const session = authClient.useSession() as { isPending: boolean; data?: { user?: unknown } | null };
  if (session.isPending) return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">Checking your session…</main>;
  if (!session.data?.user) return <AuthScreen />;
  return <>{children}</>;
};
