import React, { useState, useMemo } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  FileText, 
  Receipt, 
  Plus, 
  ArrowUpRight, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useBusiness } from '../../context/BusinessContext';

const formatINR = (val: number) => {
  if (Math.abs(val) >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)}Cr`;
  }
  if (Math.abs(val) >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

export const FinanceView: React.FC = () => {
  const { 
    financeSubTab, 
    setFinanceSubTab, 
    invoices, 
    expenses, 
    markInvoicePaid, 
    sendInvoiceReminder,
    approveExpense,
    rejectExpense,
    setIsCreateModalOpen,
    openAIActionModal
  } = useBusiness();

  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');

  const filteredInvoices = invoices.filter(inv => {
    if (invoiceFilter === 'all') return true;
    return inv.status === invoiceFilter;
  });

  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const pendingExpenses = expenses.filter(e => e.status === 'pending_approval');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');

  const totalRevenue = paidInvoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalExpenses = approvedExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netIncome = totalRevenue - totalExpenses;
  const netMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0.0';

  const totalReceivables = invoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((acc, i) => acc + (i.amount || 0), 0);
  const overdueReceivables = overdueInvoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalPayables = pendingExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Group by month for real timeline chart
  const monthlyChartData = useMemo(() => {
    const monthMap = new Map<string, { month: string; revenue: number; expenses: number; netProfit: number }>();
    
    paidInvoices.forEach(inv => {
      const d = new Date(inv.issueDate);
      const m = isNaN(d.getTime()) ? 'Current' : d.toLocaleString('en-US', { month: 'short' });
      const cur = monthMap.get(m) || { month: m, revenue: 0, expenses: 0, netProfit: 0 };
      cur.revenue += (inv.amount || 0) / 100000;
      monthMap.set(m, cur);
    });

    approvedExpenses.forEach(exp => {
      const d = new Date(exp.date);
      const m = isNaN(d.getTime()) ? 'Current' : d.toLocaleString('en-US', { month: 'short' });
      const cur = monthMap.get(m) || { month: m, revenue: 0, expenses: 0, netProfit: 0 };
      cur.expenses += (exp.amount || 0) / 100000;
      monthMap.set(m, cur);
    });

    monthMap.forEach(item => {
      item.revenue = Number(item.revenue.toFixed(2));
      item.expenses = Number(item.expenses.toFixed(2));
      item.netProfit = Number((item.revenue - item.expenses).toFixed(2));
    });

    return Array.from(monthMap.values());
  }, [paidInvoices, approvedExpenses]);

  // Dynamic receivables aging
  const receivablesAgingData = useMemo(() => {
    const currentPending = invoices.filter(i => i.status === 'pending' && (!i.daysOverdue || i.daysOverdue <= 30));
    const aging31to60 = invoices.filter(i => i.status === 'overdue' && (i.daysOverdue ?? 0) <= 60);
    const aging60Plus = invoices.filter(i => i.status === 'overdue' && (i.daysOverdue ?? 0) > 60);

    return [
      {
        bucket: '0–30 Days (Current)',
        amount: currentPending.reduce((sum, i) => sum + i.amount, 0),
        count: currentPending.length,
        color: '#3b82f6'
      },
      {
        bucket: '31–60 Days Overdue',
        amount: aging31to60.reduce((sum, i) => sum + i.amount, 0),
        count: aging31to60.length,
        color: '#f59e0b'
      },
      {
        bucket: '60+ Days (Critical)',
        amount: aging60Plus.reduce((sum, i) => sum + i.amount, 0),
        count: aging60Plus.length,
        color: '#f43f5e'
      }
    ];
  }, [invoices]);

  if (invoices.length === 0 && expenses.length === 0) {
    return <div className="mx-auto max-w-4xl rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center">
      <h1 className="text-2xl font-extrabold text-slate-100">Financial Domain & Treasury</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">No persisted invoices or expenses are connected to this organization yet. Financial metrics, charts, receivables aging, and approvals remain blank instead of showing sample numbers.</p>
      <button onClick={() => setIsCreateModalOpen(true)} className="mt-6 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">Add financial record</button>
    </div>;
  }

  const handleLaunchAIPaymentSequence = () => {
    if (overdueInvoices.length === 0) return;
    const overdueTotalFormatted = formatINR(overdueReceivables);
    const clientNames = Array.from(new Set(overdueInvoices.map(i => i.customerName))).slice(0, 3).join(', ');
    openAIActionModal({
      title: 'Dispatch Batch Receivables Recovery Sequence',
      level: 4,
      source: 'Working Capital Optimizer',
      description: `${overdueTotalFormatted} is currently overdue across ${overdueInvoices.length} client invoice${overdueInvoices.length > 1 ? 's' : ''}. AI will generate individual personalized settlement links with UPI & Card payment options.`,
      actionDraft: {
        recipient: `${overdueInvoices.length} Client Accounts (${clientNames})`,
        subject: 'Statement of Overdue Accounts — Workspace Notice',
        content: 'Automated multi-channel dispatch: Email + WhatsApp invoice links sent with 3-day resolution schedule.',
        payloadType: 'batch_payment_chaser',
        amount: overdueTotalFormatted
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Finance Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Financial Domain & Treasury
          </h1>
          <p className="text-xs text-slate-400">
            Real-time cash positioning, revenue recognition, invoice aging, and autonomous expense control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtabs */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto">
            {(['overview', 'invoices', 'expenses', 'receivables'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFinanceSubTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
                  financeSubTab === tab
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* 6 Key Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Revenue</div>
          <div className="text-xl font-bold font-mono text-slate-100">{formatINR(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>{paidInvoices.length} paid invoices</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expenses</div>
          <div className="text-xl font-bold font-mono text-slate-100">{formatINR(totalExpenses)}</div>
          <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>{approvedExpenses.length} approved claims</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Net Income</div>
          <div className={`text-xl font-bold font-mono ${netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatINR(netIncome)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{netMargin}% Net Margin</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Liquid Cash</div>
          <div className="text-xl font-bold font-mono text-blue-400">{formatINR(Math.max(0, netIncome))}</div>
          <div className="text-[11px] text-blue-300 font-medium mt-0.5">
            {totalExpenses > 0 ? `${(Math.max(0, netIncome) / totalExpenses).toFixed(1)}x monthly cover` : 'Stable baseline'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Receivables</div>
          <div className="text-xl font-bold font-mono text-rose-400">{formatINR(totalReceivables)}</div>
          <div className="text-[11px] text-rose-300 font-medium mt-0.5">
            {overdueReceivables > 0 ? `${formatINR(overdueReceivables)} overdue` : '0 overdue'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payables</div>
          <div className="text-xl font-bold font-mono text-slate-200">{formatINR(totalPayables)}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{pendingExpenses.length} pending approval</div>
        </div>
      </div>

      {/* Subtab: Overview Charts & Dynamic Graphs */}
      {financeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Expenses Area Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Revenue vs. Operating Expenses</h3>
                <p className="text-xs text-slate-400">Monthly progression in ₹ Lakhs</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expenses
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              {monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${v}L`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      formatter={(val: any) => [`₹${val} Lakhs`, '']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <FileText className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No Monthly Financial Records Yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Record paid invoices and approved expenses to visualize month-over-month cash flow and margin trends.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Aging Receivables Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">Receivables Aging</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-bold border ${
                  overdueReceivables > 0 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {overdueReceivables > 0 ? `${formatINR(overdueReceivables)} Overdue` : 'Zero Overdue'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">DSO aging distribution across invoices</p>

              {totalReceivables > 0 ? (
                <div className="space-y-3 mt-4">
                  {receivablesAgingData.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.bucket}</span>
                        <span className="font-mono text-slate-100">{formatINR(item.amount)} ({item.count})</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all" 
                          style={{ backgroundColor: item.color, width: totalReceivables > 0 ? `${Math.min(100, (item.amount / totalReceivables) * 100)}%` : '0%' }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 mt-4">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs font-semibold text-slate-300">All Receivables Settled</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">No outstanding client receivables currently pending.</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLaunchAIPaymentSequence}
              disabled={overdueInvoices.length === 0}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all mt-4 ${
                overdueInvoices.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{overdueInvoices.length > 0 ? 'Launch AI Payment Sequence' : 'No Overdue Invoices'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Subtab: Invoices */}
      {financeSubTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              {(['all', 'pending', 'overdue', 'paid'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setInvoiceFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    invoiceFilter === tab
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredInvoices.length} invoices
            </span>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            {filteredInvoices.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">No invoices found</p>
                <p className="text-xs text-slate-500 mt-1">Use "New Transaction" to create your first client invoice.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Issue Date</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{inv.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{inv.issueDate}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {inv.dueDate} {inv.daysOverdue ? <span className="text-rose-400 font-semibold">({inv.daysOverdue}d overdue)</span> : ''}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{inv.formattedAmount}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          inv.status === 'paid' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                          inv.status === 'overdue' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' :
                          'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status === 'overdue' && (
                            <button
                              onClick={() => sendInvoiceReminder(inv.id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold cursor-pointer"
                            >
                              Send AI Reminder
                            </button>
                          )}
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => markInvoicePaid(inv.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Subtab: Expenses & Approvals */}
      {financeSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-xs font-bold text-amber-200">Expense Governance Queue</h4>
                <p className="text-xs text-amber-300/80">
                  {pendingExpenses.length} claim{pendingExpenses.length === 1 ? '' : 's'} require authorization. {pendingExpenses.filter(e => e.isAnomaly).length} identified as statistical anomaly.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-amber-300">{formatINR(totalPayables)} Pending</span>
          </div>

          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
                <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">No expense records logged</p>
                <p className="text-xs text-slate-500 mt-1">Use "New Transaction" to submit and govern company expenses.</p>
              </div>
            ) : (
              expenses.map(exp => (
                <div
                  key={exp.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    exp.status === 'pending_approval'
                      ? 'bg-slate-900 border-slate-700 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-100">{exp.title}</span>
                        {exp.isAnomaly && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            Anomaly Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Category: <strong className="text-slate-300">{exp.category}</strong> · Vendor: {exp.vendor} · Requested by {exp.requestedBy}
                      </p>
                      {exp.anomalyNote && (
                        <p className="text-xs text-amber-400 mt-1 font-medium">
                          ⚠ {exp.anomalyNote}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="font-mono font-bold text-base text-slate-100 mr-2">{exp.formattedAmount}</span>
                      {exp.status === 'pending_approval' ? (
                        <>
                          <button
                            onClick={() => rejectExpense(exp.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => approveExpense(exp.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                          >
                            Approve Claim
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                          {exp.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Subtab: Receivables Deep Dive */}
      {financeSubTab === 'receivables' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">Receivables & Liquidity Optimizer</h3>
              <p className="text-xs text-slate-400">
                Current Overdue: {formatINR(overdueReceivables)} across {overdueInvoices.length} client invoice{overdueInvoices.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              onClick={handleLaunchAIPaymentSequence}
              disabled={overdueInvoices.length === 0}
              className={`px-4 py-2 rounded-xl font-semibold text-xs shadow-md transition-all ${
                overdueInvoices.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              Dispatch Automated Reminders
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {overdueInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-500 rounded-xl bg-slate-950 border border-slate-800">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-300">Zero Overdue Receivables</p>
                <p className="text-xs text-slate-500 mt-1">All issued client invoices are paid or currently within terms.</p>
              </div>
            ) : (
              overdueInvoices.map(inv => (
                <div key={inv.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-xs">{inv.invoiceNumber} — {inv.customerName}</h4>
                    <p className="text-[11px] text-rose-400 font-semibold">{inv.daysOverdue} days overdue · Due {inv.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-100">{inv.formattedAmount}</span>
                    <button
                      onClick={() => sendInvoiceReminder(inv.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold cursor-pointer"
                    >
                      Remind Client
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

