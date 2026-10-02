import React from 'react';
import { LayoutDashboard, Zap, Users, IndianRupee, CheckSquare, BarChart3, Sparkles, Bell, Plug2, Settings } from 'lucide-react';
import { authClient } from '../../auth/neonAuthClient';
import { useBusiness } from '../../context/BusinessContext';
import { NavigationTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, todayItems, invoices } = useBusiness();
  const session = authClient
    ? (authClient.useSession() as { isPending: boolean; data?: { user?: { name?: string | null; email?: string | null } } | null })
    : { isPending: false, data: null };
  const user = session.data?.user;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Welcome';
  const nav = [
    { id: 'overview' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'today' as NavigationTab, label: 'Today', icon: Zap, count: todayItems.filter(i => !i.isDone).length },
    { id: 'customers' as NavigationTab, label: 'Customers', icon: Users, count: 248 },
    { id: 'finance' as NavigationTab, label: 'Finance', icon: IndianRupee, marker: invoices.some(i => i.status === 'overdue') ? '84k' : undefined },
    { id: 'work' as NavigationTab, label: 'Work', icon: CheckSquare, count: 4 },
    { id: 'analytics' as NavigationTab, label: 'Analytics', icon: BarChart3 },
    { id: 'ai' as NavigationTab, label: 'AI', icon: Sparkles },
    { id: 'alerts' as NavigationTab, label: 'Alerts', icon: Bell, count: alerts.filter(a => !a.isRead).length },
    { id: 'integrations' as NavigationTab, label: 'Integrations', icon: Plug2 },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];
  const groups = [{ label: 'Business', items: nav.slice(0, 5) }, { label: 'Intelligence', items: nav.slice(5, 8) }, { label: 'Workspace', items: nav.slice(8) }];
  return <aside className="ledger-sidebar flex w-[216px] shrink-0 flex-col border-r select-none">
    <div className="flex h-16 items-center gap-3 border-b border-inherit px-5"><img src="/favicon.svg" alt="Look Through logo" width="22" height="22" className="size-[22px] rounded-[3px]" /><strong className="text-[14px]">Look Through</strong></div>
    <nav className="flex-1 px-3 py-4">
      {groups.map(group => <div key={group.label} className="mb-5"><div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[.08em] ledger-faint">{group.label}</div>{group.items.map(item => { const Icon = item.icon; const active = activeTab === item.id; return <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex w-full items-center gap-2 rounded-[3px] px-2.5 py-2 text-left text-[14px] ${active ? 'ledger-active-nav' : 'ledger-muted hover:bg-[var(--hairline)]'}`}><Icon className="size-4" strokeWidth={1.5} /><span className="flex-1">{item.label}</span>{item.marker && <span className="ledger-mono ledger-marker text-[12px]">{item.marker}</span>}{item.count !== undefined && item.count > 0 && <span className="ledger-mono text-[12px]">{item.count}</span>}</button>; })}</div>)}
    </nav>
    <div className="border-t border-inherit px-5 py-4 text-[12px] ledger-muted">{user ? <><div>{displayName}</div><div className="mt-1">Signed in</div></> : <><div>Welcome</div><div className="mt-1">Explore Look Through</div></>}</div>
  </aside>;
};
