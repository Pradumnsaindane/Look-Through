import React from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { CommandMenu } from './components/layout/CommandMenu';
import { UniversalCreateModal } from './components/layout/UniversalCreateModal';
import { AIActionModal } from './components/layout/AIActionModal';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { ToastContainer } from './components/layout/ToastContainer';

// Domain views
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

const MainContent: React.FC = () => {
  const { activeTab } = useBusiness();

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
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
    </main>
  );
};

export function App() {
  return (
    <BusinessProvider>
      <div className="flex h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden font-sans">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Right Application Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 bg-grid-pattern">
          {/* Top Control Bar */}
          <Topbar />

          {/* Primary Viewport Area */}
          <MainContent />
        </div>

        {/* Global Modals & System Drawers */}
        <CommandMenu />
        <UniversalCreateModal />
        <AIActionModal />
        <NotificationDrawer />
        <ToastContainer />
      </div>
    </BusinessProvider>
  );
}

export default App;
