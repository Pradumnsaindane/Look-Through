import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Users, 
  IndianRupee, 
  CheckSquare, 
  BarChart3, 
  Sparkles, 
  Bell, 
  Plug2, 
  Settings, 
  ChevronRight,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { NavigationTab } from '../../types';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'rose' | 'amber' | 'blue' | 'emerald';
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, todayItems, invoices, expenses } = useBusiness();

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;
  const criticalOverdueCount = invoices.filter(i => i.status === 'overdue').length;
  const pendingExpensesCount = expenses.filter(e => e.status === 'pending_approval').length;
  const todayActionCount = todayItems.filter(i => !i.isDone).length;

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { 
      id: 'today', 
      label: 'Today', 
      icon: Zap, 
      badge: todayActionCount > 0 ? todayActionCount : undefined, 
      badgeVariant: 'rose' 
    },
    { id: 'customers', label: 'Customers & Sales', icon: Users, badge: '248', badgeVariant: 'blue' },
    { 
      id: 'finance', 
      label: 'Finance', 
      icon: IndianRupee, 
      badge: criticalOverdueCount > 0 ? `₹84k overdue` : undefined,
      badgeVariant: 'amber'
    },
    { id: 'work', label: 'Work Management', icon: CheckSquare, badge: '4 high', badgeVariant: 'blue' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai', label: 'AI Intelligence', icon: Sparkles, badge: 'Proactive', badgeVariant: 'emerald' },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: Bell, 
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeVariant: 'rose'
    },
    { id: 'integrations', label: 'Integrations', icon: Plug2, badge: '5 active', badgeVariant: 'blue' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0 z-30">
      {/* Workspace Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 px-1 py-1 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg ring-1 ring-white/20">
            ⚡
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 text-sm tracking-tight truncate">Apex Global</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                OS
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">Pradumn Saindane · Admin</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Operational Views
        </div>

        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
              <span className="flex-1 truncate">{item.label}</span>
              
              {item.badge && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeVariant === 'rose'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.badgeVariant === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : item.badgeVariant === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-4 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Intelligence & Governance
        </div>

        {navItems.slice(5).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
              <span className="flex-1 truncate">{item.label}</span>
              
              {item.badge && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeVariant === 'rose'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.badgeVariant === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Autonomous AI Engine Guardrail status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div 
          onClick={() => setActiveTab('ai')}
          className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/50 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">AI Guardrails</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono font-medium">Level 4: Ask</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Autonomous execution requires human authorization.
          </p>
        </div>
      </div>
    </aside>
  );
};
