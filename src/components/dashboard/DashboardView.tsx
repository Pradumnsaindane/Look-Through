import React from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useDashboardData } from '../../dashboard/dashboardApi';

const money = (minor: string | number) => `Rs ${(Number(minor) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const DashboardView: React.FC = () => {
  const { setActiveTab } = useBusiness();
  const { data, error, isLoading, mutate } = useDashboardData();

  if (isLoading) return <div className="ledger-entrance pb-12"><div className="ledger-surface flex min-h-72 items-center justify-center ledger-muted">Loading live business data…</div></div>;
  if (error) return <div className="ledger-entrance pb-12"><div className="ledger-surface flex min-h-72 flex-col items-center justify-center gap-4 text-center"><p className="font-semibold">Dashboard data is unavailable</p><p className="max-w-md text-sm ledger-muted">{error.message}</p><button className="ledger-button" onClick={() => mutate()}><RefreshCw className="mr-2 inline size-3" />Retry</button></div></div>;
  if (!data) return <div className="ledger-entrance pb-12"><div className="ledger-surface flex min-h-72 flex-col items-center justify-center gap-3 px-6 text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] ledger-faint">Guest mode</p><h1 className="text-2xl font-semibold tracking-tight">Explore your business workspace</h1><p className="max-w-lg text-sm leading-6 ledger-muted">You can explore the dashboard and Today without an account. Business data, saved changes, and organization tools become available after you log in.</p></div></div>;

  const revenue = money(data.financial.revenue_minor);
  const overdue = money(data.counts.overdue_minor);
  const cash = money(Number(data.financial.cash_in_minor) + Number(data.financial.cash_out_minor));
  const openTasks = data.tasks.length;
  const health = [
    ['Revenue', `${revenue} this month`, 'Live'],
    ['Cash flow', `${cash} net movement`, 'Live'],
    ['Pipeline', `${data.pipeline.reduce((sum, item) => sum + item.count, 0)} open deals`, 'Live'],
    ['Receivables', `${data.counts.overdue_invoices} overdue`, data.counts.overdue_invoices ? 'Act now' : 'Healthy'],
    ['Expenses', `${money(data.financial.expenses_minor)} this month`, 'Live'],
  ];
  return <div className="ledger-entrance pb-12">
    <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between"><div><div className="ledger-mono mb-2 text-[12px] ledger-muted">LIVE · POSTGRESQL</div><h1 className="text-[42px] font-semibold leading-[.98] tracking-[-.045em]">Business overview.</h1><p className="mt-1 text-[40px] leading-[1] tracking-[-.045em] ledger-muted">{openTasks} priorities need attention.</p></div><p className="max-w-[330px] pb-1 text-[14px] ledger-muted"><span className="ledger-marker">{overdue} is overdue</span> across {data.counts.overdue_invoices} invoices.</p></div>
    <div className="ledger-surface mb-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr]">
      <button onClick={() => setActiveTab('finance')} className="border-b border-[var(--hairline)] p-5 text-left md:border-b-0 md:border-r"><div className="ledger-muted">Revenue · current month</div><div className="ledger-mono mt-2 text-[54px] leading-none tracking-[-.06em]">{revenue}</div><div className="mt-3 text-[13px]">From paid invoices</div></button>
      <button onClick={() => setActiveTab('finance')} className="border-b border-[var(--hairline)] p-5 text-left md:border-b-0 md:border-r"><div className="ledger-muted">Cash movement</div><div className="ledger-mono mt-3 text-[34px] leading-none">{cash}</div><div className="mt-4 ledger-muted">Transactions aggregate</div></button>
      <button onClick={() => setActiveTab('customers')} className="border-b border-[var(--hairline)] p-5 text-left md:border-b-0 md:border-r"><div className="ledger-muted">Customers</div><div className="ledger-mono mt-3 text-[34px] leading-none">{data.counts.customers}</div><div className="mt-4 ledger-muted">Active records</div></button>
      <button onClick={() => setActiveTab('finance')} className="bg-[var(--marker-tint)] p-5 text-left text-[var(--ink)]"><div>Overdue</div><div className="ledger-mono mt-3 text-[34px] leading-none">{overdue}</div><div className="mt-4">{data.counts.overdue_invoices} invoices</div></button>
    </div>
    <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr]">
      <section className="ledger-rule"><div className="flex items-center justify-between py-3"><h2 className="text-[13px] font-semibold">Needs you</h2><span className="ledger-mono ledger-muted">{openTasks} open</span></div>{data.tasks.slice(0, 4).map((task, index) => <div key={task.id} className="flex items-center gap-4 border-b border-[var(--hairline)] py-4"><span className="ledger-mono ledger-muted">0{index + 1}</span><div className="min-w-0 flex-1"><div className="font-semibold">{task.title}</div><div className="mt-1 text-[13px] ledger-muted">{task.priority} priority · {task.status.replace('_', ' ')}</div></div><button onClick={() => setActiveTab('work')} className="ledger-button shrink-0">Open</button></div>)}{!data.tasks.length && <div className="py-8 text-sm ledger-muted">No open tasks.</div>}</section>
      <div className="flex flex-col gap-7"><section className="ledger-rule"><div className="flex items-center justify-between py-3"><h2 className="text-[13px] font-semibold">Business health</h2><span className="ledger-mono ledger-muted">{health.length} checks</span></div>{health.map(([label, evidence, status]) => <div key={label} className="grid grid-cols-[1fr_1.5fr_1fr] border-b border-[var(--hairline)] py-3"><span className="font-semibold">{label}</span><span className="ledger-muted">{evidence}</span><span>{status === 'Act now' ? <span className="ledger-marker">{status}</span> : status}</span></div>)}</section><section className="ledger-rule"><h2 className="py-3 text-[13px] font-semibold">Recent activity</h2>{data.activity.slice(0, 3).map(event => <div key={event.id} className="grid grid-cols-[80px_1fr] border-b border-[var(--hairline)] py-3"><span className="ledger-mono ledger-muted">{new Date(event.created_at).toLocaleDateString('en-IN')}</span><span>{event.action} {event.entity_type}<ArrowUpRight className="ml-2 inline size-3 ledger-muted" /></span></div>)}{!data.activity.length && <div className="py-4 text-sm ledger-muted">No recent activity.</div>}</section></div>
    </div>
  </div>;
};
