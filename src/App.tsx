import React from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
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
const MobileNavigation: React.FC = () => {
  const { setActiveTab } = useBusiness();
  const tabs = [{ id: 'overview' as const, label: 'Overview' }, { id: 'today' as const, label: 'Today' }, { id: 'customers' as const, label: 'Customers' }, { id: 'work' as const, label: 'Work' }, { id: 'settings' as const, label: 'More' }];
  return <nav className="fixed inset-x-0 bottom-0 z-30 hidden h-14 border-t border-[var(--hairline)] bg-[var(--surface)] px-2 sm:hidden">{tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex flex-1 items-center justify-center text-[11px] capitalize ledger-muted">{tab.label}</button>)}</nav>;
};

const MainContent: React.FC = () => {
  const { activeTab } = useBusiness();
  return <main className="ledger-main flex-1 overflow-y-auto px-6 py-7 md:px-10 custom-scrollbar">
    <div className="mx-auto w-full max-w-[1180px]">
      {activeTab === 'overview' && <DashboardView />}
      {activeTab === 'today' && <TodayView />}
      {activeTab === 'customers' && <CustomersView />}
      {activeTab === 'finance' && <FinanceView />}
      {activeTab === 'work' && <WorkView />}
      {activeTab === 'analytics' && <AnalyticsView />}
      {activeTab === 'ai' && <AIIntelligenceView />}
      {activeTab === 'alerts' && <AlertsView />}
      {activeTab === 'integrations' && <IntegrationsView />}
      {activeTab === 'settings' && <SettingsView />}
    </div>
  </main>;
};

export function App() {
  return <BusinessProvider>
    <div className="ledger-shell flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <MainContent />
        <MobileNavigation />
      </div>
      <CommandMenu /><UniversalCreateModal /><AIActionModal /><NotificationDrawer /><ToastContainer />
    </div>
  </BusinessProvider>;
}
export default App;
