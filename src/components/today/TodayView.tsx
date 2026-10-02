import React, { useState } from 'react';
import { 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText, 
  Users, 
  Calendar, 
  Receipt, 
  Sparkles,
  Check,
  RotateCcw,
  ShieldCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBusiness } from '../../context/BusinessContext';
import { OperationalTodayItem } from '../../types';

export const TodayView: React.FC = () => {
  const { 
    todayItems, 
    toggleTodayItemDone, 
    openAIActionModal, 
    setActiveTab, 
    setFinanceSubTab, 
    setCustomerSubTab,
    invoices,
    expenses,
    markInvoicePaid,
    sendInvoiceReminder,
    approveExpense,
    rejectExpense
  } = useBusiness();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'High Priority' | 'Upcoming' | 'Decision'>('All');
  const [selectedQuickView, setSelectedQuickView] = useState<'invoices' | 'expenses' | 'meeting' | null>(null);

  const completedCount = todayItems.filter(i => i.isDone).length;
  const totalCount = todayItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const filteredItems = todayItems.filter(item => {
    if (activeFilter === 'All') return true;
    return item.category === activeFilter;
  });

  const handleActionClick = (item: OperationalTodayItem) => {
    if (item.actionPayload.type === 'review_invoices') {
      setSelectedQuickView(selectedQuickView === 'invoices' ? null : 'invoices');
    } else if (item.actionPayload.type === 'follow_up_customer') {
      openAIActionModal({
        title: 'Follow Up with Acme Ltd on Stagnant Deal',
        level: 4,
        source: 'CRM Automated Chaser',
        description: 'Acme deal (₹3.2L) has had no activity for 5 days. AI has drafted a strategic milestone email.',
        actionDraft: {
          recipient: 'Rohan Verma <r.verma@acmecorp.in>',
          subject: 'Enterprise System Architecture — Finalizing Q4 deployment window',
          content: `Hi Rohan,\n\nFollowing up on our discussions last week. We have reserved implementation capacity for Acme in our October roadmap.\n\nCould we jump on a brief 10-minute sync tomorrow to finalize the terms?\n\nBest,\nPradumn Saindane · Apex Global`,
          payloadType: 'follow_up_email',
          targetId: 'cust-1',
          amount: '₹3.2L'
        },
        onExecute: () => {
          toggleTodayItemDone(item.id);
        }
      });
    } else if (item.actionPayload.type === 'meeting_prep') {
      setSelectedQuickView(selectedQuickView === 'meeting' ? null : 'meeting');
    } else if (item.actionPayload.type === 'review_expenses') {
      setSelectedQuickView(selectedQuickView === 'expenses' ? null : 'expenses');
    }
  };

  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const pendingExpenses = expenses.filter(e => e.status === 'pending_approval');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Command Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Zap className="w-4 h-4 fill-rose-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Operational Command Center
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Good morning, Pradumn
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Here is what matters right now. Resolve operational bottlenecks, unblock team decisions, and capture pipeline opportunities.
            </p>
          </div>

          {/* Daily Progress Gauge */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 shrink-0 w-full md:w-64">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-semibold">Today's Resolution</span>
              <span className="text-slate-200 font-mono font-bold">{completedCount} of {totalCount} Done</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {completedCount === totalCount ? '🎉 All today items completed!' : `${totalCount - completedCount} critical items remain`}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {(['All', 'Critical', 'High Priority', 'Upcoming', 'Decision'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeFilter === filter
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Action Items List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map(item => {
          const badgeClass =
            item.category === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
            item.category === 'High Priority' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
            item.category === 'Decision' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
            'bg-blue-500/20 text-blue-300 border-blue-500/30';

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                item.isDone
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/90 border-slate-800 shadow-lg hover:border-slate-700'
              }`}
            >
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTodayItemDone(item.id)}
                    className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                      item.isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-700 bg-slate-950 hover:border-blue-500 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                        {item.category}
                      </span>
                      {item.badgeText && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          · {item.badgeText}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-bold transition-all ${item.isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Action Trigger Button */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleActionClick(item)}
                    className="px-4 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inlined Overdue Invoices View */}
              {item.actionPayload.type === 'review_invoices' && selectedQuickView === 'invoices' && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Overdue Invoices Requiring Resolution ({overdueInvoices.length})
                    </h4>
                    <span className="text-xs text-rose-400 font-mono font-bold">Total Overdue: ₹84,000</span>
                  </div>

                  <div className="space-y-2">
                    {overdueInvoices.map(inv => (
                      <div key={inv.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{inv.invoiceNumber} — {inv.customerName}</div>
                          <div className="text-[11px] text-slate-400">Due: {inv.dueDate} · <span className="text-rose-400 font-semibold">{inv.daysOverdue} days overdue</span></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-100 mr-2">{inv.formattedAmount}</span>
                          <button
                            onClick={() => sendInvoiceReminder(inv.id)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-medium"
                          >
                            Send AI Reminder
                          </button>
                          <button
                            onClick={() => markInvoicePaid(inv.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-medium"
                          >
                            Mark Paid
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inlined Pending Expenses View */}
              {item.actionPayload.type === 'review_expenses' && selectedQuickView === 'expenses' && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Pending Expense Authorizations ({pendingExpenses.length})
                    </h4>
                    <span className="text-xs text-amber-400 font-mono font-bold">Pending: ₹1.87L</span>
                  </div>

                  <div className="space-y-2">
                    {pendingExpenses.map(exp => (
                      <div key={exp.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{exp.title}</span>
                            {exp.isAnomaly && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                31% Anomaly
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{exp.category} · Requested by {exp.requestedBy}</div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="font-mono font-bold text-sm text-slate-100 mr-2">{exp.formattedAmount}</span>
                          <button
                            onClick={() => rejectExpense(exp.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => approveExpense(exp.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inlined Meeting Prep View */}
              {item.actionPayload.type === 'meeting_prep' && selectedQuickView === 'meeting' && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Meeting Executive Briefing · 2:30 PM Today</span>
                    </h4>
                    <span className="text-xs text-slate-400">Vikram Shah (CTO, ABC Enterprise)</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
                    <p>● <strong>Opportunity:</strong> Enterprise Ops Migration Retainer (₹2.4L ARR, 70% win probability).</p>
                    <p>● <strong>Key Stakeholder Goal:</strong> Ensure zero downtime during data synchronization phase.</p>
                    <p>● <strong>Suggested Talking Point:</strong> Highlight our 99.98% SLA and live rollback architecture.</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
