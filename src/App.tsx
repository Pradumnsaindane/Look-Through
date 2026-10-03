import React, { useEffect, useState } from 'react';
import { useBusiness } from './context/BusinessContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { CommandMenu } from './components/layout/CommandMenu';
import { UniversalCreateModal } from './components/layout/UniversalCreateModal';
import { AIActionModal } from './components/layout/AIActionModal';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { ToastContainer } from './components/layout/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { TodayView } from './components/today/TodayView';
import { CustomersView } from './components/customers/CustomersView';
import { FinanceView } from './components/finance/FinanceView';
import { WorkView } from './components/work/WorkView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AIIntelligenceView } from './components/ai/AIIntelligenceView';
import { AlertsView } from './components/alerts/AlertsView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { SettingsView } from './components/settings/SettingsView';
import { RequireAuthentication } from './components/auth/RequireAuthentication';
import { ProductStory } from './components/dashboard/ProductStory';
import { Moon, Sun } from 'lucide-react';
const MobileNavigation: React.FC = () => {
  const { setActiveTab } = useBusiness();
  const tabs = [{ id: 'overview' as const, label: 'Overview' }, { id: 'today' as const, label: 'Today' }, { id: 'customers' as const, label: 'Customers' }, { id: 'work' as const, label: 'Work' }, { id: 'settings' as const, label: 'More' }];
  return <nav className="fixed inset-x-0 bottom-0 z-30 hidden h-14 border-t border-[var(--hairline)] bg-[var(--surface)] px-2 sm:hidden">{tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex flex-1 items-center justify-center text-[11px] capitalize ledger-muted">{tab.label}</button>)}</nav>;
};

const MainContent: React.FC = () => {
  const { activeTab } = useBusiness();
  const protectedView = (view: React.ReactNode, capability: 'personal' | 'organization' | 'permission' = 'organization') => (
    <RequireAuthentication capability={capability}>{view}</RequireAuthentication>
  );

  return <main className="ledger-main flex-1 overflow-y-auto px-6 py-7 md:px-10 custom-scrollbar">
    <div className="mx-auto w-full max-w-[1180px]">
      {activeTab === 'overview' && <DashboardView />}
      {activeTab === 'today' && <TodayView />}
      {activeTab === 'customers' && protectedView(<CustomersView />)}
      {activeTab === 'finance' && protectedView(<FinanceView />)}
      {activeTab === 'work' && protectedView(<WorkView />)}
      {activeTab === 'analytics' && protectedView(<AnalyticsView />)}
      {activeTab === 'ai' && protectedView(<AIIntelligenceView />, 'permission')}
      {activeTab === 'alerts' && protectedView(<AlertsView />)}
      {activeTab === 'integrations' && protectedView(<IntegrationsView />, 'permission')}
      {activeTab === 'settings' && protectedView(<SettingsView />, 'personal')}
    </div>
  </main>;
};

const IntroPage: React.FC = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    setDark((value) => {
      const next = !value;
      document.documentElement.classList.toggle('dark', next);
      document.documentElement.style.colorScheme = next ? 'dark' : 'light';
      return next;
    });
  };

  return <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
    <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-[var(--hairline)] bg-[var(--surface)]/90 px-6 py-4 backdrop-blur md:px-10">
      <a href="/intro" className="ledger-mono text-xs tracking-[0.18em]">LOOK THROUGH</a>
      <button onClick={toggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} className="ledger-button px-2.5">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
    </header>
    <ProductStory />
  </div>;
};

export function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (path === '/intro') return <IntroPage />;

  return <div className="ledger-shell flex h-screen overflow-hidden antialiased">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Topbar />
      <MainContent />
      <MobileNavigation />
    </div>
    <CommandMenu /><UniversalCreateModal /><AIActionModal /><NotificationDrawer /><ToastContainer />
  </div>;
}
export default App;
