import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Users, 
  Activity, 
  Sparkles, 
  ArrowUpRight, 
  ArrowRight, 
  Plus, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw,
  Clock,
  Briefcase,
  FileText,
  Receipt,
  CheckSquare,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessHealthMatrix } from './BusinessHealthMatrix';
import { MONTHLY_FINANCIAL_CHART_DATA } from '../../data/mockData';

export const DashboardView: React.FC = () => {
  const { 
    setActiveTab, 
    setCustomerSubTab, 
    setFinanceSubTab, 
    todayItems, 
    dashboardWidgets,
    toggleWidgetVisibility,
    moveWidget,
    resetDashboardWidgets,
    setIsCreateModalOpen,
    activityEvents,
    aiInsights,
    openAIActionModal,
    setSelectedCustomer,
    customers,
    toggleTodayItemDone
  } = useBusiness();

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<'All' | 'finance' | 'customers' | 'sales' | 'work' | 'system'>('All');

  const pendingAttentionCount = todayItems.filter(i => !i.isDone).length;

  const sortedWidgets = [...dashboardWidgets].sort((a, b) => a.order - b.order);

  const filteredActivity = activityEvents.filter(evt => {
    if (activityCategoryFilter === 'All') return true;
    return evt.category === activityCategoryFilter;
  });

  const handleTriggerQuickAction = (item: typeof todayItems[0]) => {
    setActiveTab('today');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Main Greeting & Attention Section */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Operating System Live Feed
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Good morning, Pradumn
            </h1>

            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Here's what needs your attention today. The system identified{' '}
              <strong className="text-rose-400 font-bold">{pendingAttentionCount} critical items</strong>{' '}
              requiring operational execution.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{isCustomizing ? 'Done Editing' : 'Customize Widgets'}</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Create</span>
            </button>
          </div>
        </div>

        {/* Attention Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
              {pendingAttentionCount} items need attention
            </div>
            <p className="text-xs text-slate-300">
              ₹84k overdue invoices · Acme stagnant deal (₹3.2L) · 3 pending expense claims
            </p>
          </div>

          <button
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            <span>Open Operational Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget Customization Toolbar Drawer */}
      {isCustomizing && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/40 shadow-2xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Dashboard Widget Layout Manager
              </h3>
            </div>
            <button
              onClick={resetDashboardWidgets}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Reorder cards, toggle visibility, and customize your personal operational viewport.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {sortedWidgets.map((w, idx) => (
              <div key={w.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 truncate mr-2">{w.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveWidget(w.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveWidget(w.id, 'down')}
                    disabled={idx === sortedWidgets.length - 1}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleWidgetVisibility(w.id)}
                    className={`p-1 rounded ${w.visible ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}
                  >
                    {w.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Render Widgets in Defined Order */}
      {sortedWidgets.filter(w => w.visible).map(widget => {
        // Widget 1: KPIs
        if (widget.id === 'kpis') {
          return (
            <div key={widget.id} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue Widget */}
              <div
                onClick={() => setActiveTab('finance')}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850/80 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-slate-100">₹4.82L</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>↑ 12.4% vs last month</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Click to inspect finance domain →</p>
              </div>

              {/* Cash Flow Widget */}
              <div
                onClick={() => setActiveTab('finance')}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850/80 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Flow</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-blue-400">₹1.34L</div>
                <div className="flex items-center gap-1.5 text-xs text-blue-300 font-semibold mt-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Healthy · ₹8.7L Reserve (7.4 mo)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Click to view runway model →</p>
              </div>

              {/* Customers Widget */}
              <div
                onClick={() => setActiveTab('customers')}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850/80 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customers</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-slate-100">248</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>↑ 8.2% account growth</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Click to view accounts & CRM →</p>
              </div>
            </div>
          );
        }

        // Widget 2: Today Operational Strip
        if (widget.id === 'today') {
          return (
            <div key={widget.id} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                    Today's Priority Levers
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('today')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  View Command Center →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {todayItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleTriggerQuickAction(item)}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                        item.category === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        item.category === 'High Priority' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        item.category === 'Decision' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 mt-2 leading-snug">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.subtitle}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-blue-400 font-semibold">
                      <span>{item.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Widget 3: Business Health Evidence Matrix
        if (widget.id === 'health') {
          return <BusinessHealthMatrix key={widget.id} />;
        }

        // Widget 4: AI Proactive Insights
        if (widget.id === 'ai_insights') {
          return (
            <div key={widget.id} className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Autonomous Intelligence & Anomaly Detectors
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="text-xs text-indigo-300 hover:text-white font-semibold"
                >
                  View All Intelligence →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.slice(0, 3).map(insight => (
                  <div
                    key={insight.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {insight.type}
                        </span>
                        {insight.metricsHighlight && (
                          <span className="text-[10px] font-mono text-slate-400">{insight.metricsHighlight}</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 mt-2">{insight.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{insight.summary}</p>
                    </div>

                    <button
                      onClick={() => {
                        openAIActionModal({
                          title: insight.title,
                          level: 4,
                          source: 'AI Intelligence Engine',
                          description: insight.whyItMatters,
                          actionDraft: {
                            payloadType: insight.actionPayload.type,
                            content: insight.actionPayload.suggestedContent || insight.suggestedAction,
                            amount: insight.actionPayload.amount
                          }
                        });
                      }}
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <span>{insight.actionButtonText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Widget 5: Live Activity Stream
        if (widget.id === 'activity_stream') {
          return (
            <div key={widget.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Live Business Event Stream</h3>
                  <p className="text-xs text-slate-400">Chronological telemetry across all connected systems</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {(['All', 'finance', 'customers', 'sales', 'work', 'system'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActivityCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        activityCategoryFilter === cat
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-850">
                {filteredActivity.map(evt => (
                  <div key={evt.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-850/40 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400 font-mono text-[11px] w-24 shrink-0">
                        {evt.timeLabel}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100">{evt.title}</div>
                        <div className="text-[11px] text-slate-400">{evt.entityName}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {evt.amount && (
                        <span className="font-mono font-bold text-slate-200">{evt.amount}</span>
                      )}
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {evt.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
