import React, { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { authClient } from '../../auth/neonAuthClient';
import { useBusiness } from '../../context/BusinessContext';
import { OperationalTodayItem } from '../../types';

export const TodayView: React.FC = () => {
  const session = authClient
    ? (authClient.useSession() as { isPending: boolean; data?: { user?: { name?: string | null; email?: string | null } } | null })
    : { isPending: false, data: null };
  const userName = session.data?.user?.name || session.data?.user?.email?.split('@')[0];

  const { 
    todayItems, 
    openAIActionModal, 
    setActiveTab, 
    addToast,
    invoices,
    expenses,
    approveExpense,
    rejectExpense
  } = useBusiness();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'High Priority' | 'Upcoming' | 'Decision'>('All');
  const [expandedExpenseItemId, setExpandedExpenseItemId] = useState<string | null>(null);

  const totalCount = todayItems.length;

  const filteredItems = todayItems.filter(item => {
    if (activeFilter === 'All') return true;
    return item.category === activeFilter;
  });

  const handleActionClick = (item: OperationalTodayItem) => {
    if (item.actionPayload.type === 'follow_up_customer') {
      const invoice = invoices.find(({ id }) => id === item.actionPayload.targetId);
      if (!invoice) {
        addToast({
          type: 'error',
          title: 'Invoice is no longer available',
          description: 'Refresh the workspace and try again.',
        });
        return;
      }
      openAIActionModal({
        title: `Review reminder draft for ${invoice.invoiceNumber}`,
        level: 4,
        source: 'Browser-local invoice record',
        description: `This reminder draft refers to ${invoice.customerName} and ${invoice.invoiceNumber} (${invoice.formattedAmount}). No email or payment link will be sent.`,
        actionDraft: {
          recipient: invoice.customerName,
          subject: `Reminder draft: ${invoice.invoiceNumber}`,
          content: `Reminder draft for ${invoice.invoiceNumber}, due ${invoice.dueDate}, for ${invoice.formattedAmount}. No email or payment link has been sent.`,
          payloadType: 'payment_reminder',
          targetId: invoice.id,
          amount: invoice.formattedAmount
        }
      });
    } else if (item.actionPayload.type === 'review_expenses') {
      setExpandedExpenseItemId(value => value === item.id ? null : item.id);
    } else if (item.actionPayload.type === 'custom') {
      setActiveTab('work');
    }
  };

  const pendingExpenses = expenses.filter(e => e.status === 'pending_approval');
  const pendingExpenseTotal = pendingExpenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Command Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="lt-accent-badge p-1.5 rounded-lg">
                <Zap className="w-4 h-4" />
              </div>
              <span className="lt-accent-text text-xs font-semibold uppercase tracking-wide">
                Operational Command Center
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {userName ? `Good morning, ${userName}` : 'Good morning, welcome to Look Through'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Review tasks, invoices, and expense records that need attention.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 shrink-0 w-full md:w-64" role="group" aria-label={`${totalCount} local records need review`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-semibold">Items to review</span>
              <span className="text-slate-200 font-mono font-bold">{totalCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {totalCount === 0 ? 'No local records need review.' : 'Status changes stay in this browser.'}
            </p>
          </div>
        </div>
      </div>
      <p className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400" role="note">
        Records here are stored in this browser. Status changes do not process payments, send reminders, or notify requesters.
      </p>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
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
        {filteredItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
            {totalCount === 0 ? 'No browser-local records need review.' : 'No items match this filter.'}
          </div>
        )}
        {filteredItems.map(item => {
          const badgeClass =
            item.category === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
            item.category === 'High Priority' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
            item.category === 'Decision' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
            'bg-blue-500/20 text-blue-300 border-blue-500/30';

          return (
            <div
              key={item.id}
              className="rounded-2xl border bg-slate-900/90 border-slate-800 shadow-lg hover:border-slate-700 transition-all"
            >
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
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

                    <h3 className="text-base font-bold text-slate-100">
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

              {/* Inlined Pending Expenses View */}
              {item.actionPayload.type === 'review_expenses' && expandedExpenseItemId === item.id && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Expenses awaiting review ({pendingExpenses.length})
                    </h4>
                    <span className="text-xs text-amber-400 font-mono font-bold">₹{pendingExpenseTotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-2">
                    {pendingExpenses.map(exp => (
                      <div key={exp.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{exp.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{exp.category} · Requested by {exp.requestedBy || 'Not specified'}</div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="font-mono font-bold text-sm text-slate-100 mr-2">{exp.formattedAmount}</span>
                          <button
                            onClick={() => rejectExpense(exp.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                          >
                            Mark rejected locally
                          </button>
                          <button
                            onClick={() => approveExpense(exp.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
                          >
                            Mark approved locally
                          </button>
                        </div>
                      </div>
                    ))}
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
