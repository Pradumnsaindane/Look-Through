import React from 'react';
import { LayoutDashboard, Zap, Users, IndianRupee, CheckSquare, BarChart3, Sparkles, Bell, Plug2, Settings } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { NavigationTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, todayItems, invoices } = useBusiness();
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
    <div className="flex h-16 items-center gap-3 border-b border-inherit px-5"><span className="size-[22px] rounded-[3px] bg-ink bg-[#0e0f11]" /><strong className="text-[14px]">Apex Global</strong></div>
    <nav className="flex-1 px-3 py-4">
      {groups.map(group => <div key={group.label} className="mb-5"><div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[.08em] ledger-faint">{group.label}</div>{group.items.map(item => { const Icon = item.icon; const active = activeTab === item.id; return <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex w-full items-center gap-2 rounded-[3px] px-2.5 py-2 text-left text-[14px] ${active ? 'bg-[#0e0f11] text-white' : 'ledger-muted hover:bg-black/[.05]'}`}><Icon className="size-4" strokeWidth={1.5} /><span className="flex-1">{item.label}</span>{item.marker && <span className="ledger-mono ledger-marker text-[12px]">{item.marker}</span>}{item.count !== undefined && item.count > 0 && <span className="ledger-mono text-[12px]">{item.count}</span>}</button>; })}</div>)}
    </nav>
    <div className="border-t border-inherit px-5 py-4 text-[12px] ledger-muted"><div>Pradumn Saindane</div><div className="mt-1">Owner · <button onClick={() => setActiveTab('ai')} className="hover:text-ink">AI asks first</button></div></div>
  </aside>;
};
