import React, { useEffect, useState } from 'react';
import { CommandMenu } from './components/layout/CommandMenu';
import { UniversalCreateModal } from './components/layout/UniversalCreateModal';
import { AIActionModal } from './components/layout/AIActionModal';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { ToastContainer } from './components/layout/ToastContainer';
import { ImmersiveDashboard } from './components/immersive/ImmersiveDashboard';
import { ProductStory } from './components/dashboard/ProductStory';
const IntroPage: React.FC = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }, [dark]);

  const toggleTheme = () => setDark((value) => !value);

  return <ProductStory dark={dark} onThemeToggle={toggleTheme} />;
};

const NotFoundPage: React.FC = () => (
  <main className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6 text-[var(--ink)]">
    <section className="max-w-md text-center">
      <p className="ledger-mono text-xs ledger-muted">404 / NOT FOUND</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This view does not exist.</h1>
      <p className="mt-3 text-sm leading-6 ledger-muted">Return to the product story or open the dashboard from a known route.</p>
      <div className="mt-6 flex justify-center gap-3">
        <a className="ledger-button" href="/intro">Product story</a>
        <a className="ledger-button" href="/dashboard">Dashboard</a>
      </div>
    </section>
  </main>
);

export function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (path === '/' || path === '/intro') return <IntroPage />;
  if (path !== '/dashboard') return <NotFoundPage />;

  return <>
    <ImmersiveDashboard />
    <CommandMenu /><UniversalCreateModal /><AIActionModal /><NotificationDrawer /><ToastContainer />
  </>;
}
export default App;
