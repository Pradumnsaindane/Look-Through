import React from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Sparkles, 
  Command, 
  ChevronDown,
  Building2,
  Calendar,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const Topbar: React.FC = () => {
  const { 
    setIsCommandMenuOpen, 
    setIsCreateModalOpen, 
    setIsNotificationsOpen, 
    alerts,
    openAIActionModal,
    setActiveTab
  } = useBusiness();

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  const handleTriggerQuickBriefing = () => {
    openAIActionModal({
      title: 'Generate Instant Executive Morning Briefing',
      level: 2,
      source: 'Business OS Executive Intelligence',
      description: 'Synthesizing live telemetry across Cash Flow (₹8.7L), Overdue Invoices (₹84k), and Acme Deal Status (₹3.2L).',
      actionDraft: {
        payloadType: 'executive_briefing',
        subject: 'Executive Action Plan — October 2, 2026',
        content: `Good morning Pradumn.\n\nHere are the 3 critical levers for today:\n1. Overdue Receivables: 2 overdue invoices from XYZ Ltd & Acme Ltd total ₹84,000.\n2. Acme Pipeline: Deal #deal-1 (₹3.2L) has 80% win probability; team last engaged 5 days ago.\n3. Cash Buffer: Healthy at ₹8.7L (7.4 months runway) with ₹1.34L net inflow this month.\n\nRecommended: Trigger automated payment reminders and lock Acme contract terms by 4 PM.`,
      },
      onExecute: () => {
        setActiveTab('today');
      }
    });
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Organization & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Business Selector */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-700/80 transition-colors cursor-pointer">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Apex Global Corp (HQ)</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Global Search Bar (Cmd + K) */}
        <button
          onClick={() => setIsCommandMenuOpen(true)}
          className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all text-sm group shadow-inner"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors shrink-0" />
            <span className="truncate text-xs sm:text-sm">Search anything or type "show overdue invoices"...</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded border border-slate-700 shrink-0">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Actions, AI Copilot, Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Proactive AI Briefing Button */}
        <button
          onClick={handleTriggerQuickBriefing}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-200 hover:text-white transition-all text-xs font-semibold shadow-sm hover:shadow-indigo-500/10 group"
          title="Synthesize live business briefing"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 animate-pulse" />
          <span>AI Briefing</span>
        </button>

        {/* Universal + Create Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-slate-900 animate-bounce">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500/30 cursor-pointer">
            PS
          </div>
        </div>
      </div>
    </header>
  );
};
