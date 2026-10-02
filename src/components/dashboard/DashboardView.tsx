import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const DashboardView: React.FC = () => {
  const { setActiveTab, todayItems, invoices, activityEvents } = useBusiness();
  const openItems = todayItems.filter(item => !item.isDone);
  const overdue = invoices.filter(invoice => invoice.status === 'overdue');
  const overdueTotal = overdue.reduce((sum, invoice) => sum + invoice.amount, 0);
  const format = (value: number) => `Rs ${value.toLocaleString('en-IN')}`;
  const actions = [
    { title: `${format(overdueTotal)} in invoices are overdue`, evidence: 'XYZ Technologies #1011, #1015 · Acme #1019', action: 'Review invoices', tab: 'finance' as const, critical: true },
    { title: "Acme hasn't been contacted for 5 days", evidence: 'Rs 3.2L deal in negotiation', action: 'Follow up', tab: 'customers' as const },
    { title: 'ABC Enterprise meeting at 2:30 PM', evidence: 'Vikram Shah, CTO · Rs 2.4L proposal', action: 'Prepare', tab: 'today' as const },
    { title: '3 expenses await your approval', evidence: 'Rs 1.87L total · marketing is 31% above average', action: 'Review', tab: 'finance' as const },
  ];
  return <div className="ledger-entrance pb-12">
    <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between"><div><div className="ledger-mono mb-2 text-[12px] ledger-muted">FRI 02 OCT · 09:12 IST</div><h1 className="text-[42px] font-semibold leading-[.98] tracking-[-.045em]">Good morning, Pradumn.</h1><p className="mt-1 text-[40px] leading-[1] tracking-[-.045em] ledger-muted">Four things need you today.</p></div><p className="max-w-[330px] pb-1 text-[14px] ledger-muted"><span className="ledger-marker">Rs 84,000 is overdue</span> and Acme has gone quiet for five days. Start with the invoices.</p></div>
    <div className="ledger-surface mb-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr]">
      <button onClick={() => setActiveTab('finance')} className="border-b border-[#d3d6da] p-5 text-left md:border-b-0 md:border-r"><div className="ledger-muted">Revenue · Sep</div><div className="ledger-mono mt-2 text-[54px] leading-none tracking-[-.06em]">4.82L</div><div className="mt-3 text-[13px]">↑ 12.4% vs Aug <span className="ml-3 inline-block w-28 align-middle border-t border-ink rotate-[-8deg]" /></div></button>
      <button onClick={() => setActiveTab('finance')} className="border-b border-[#d3d6da] p-5 text-left md:border-b-0 md:border-r"><div className="ledger-muted">Cash</div><div className="ledger-mono mt-3 text-[34px] leading-none">1.34L</div><div className="mt-4 ledger-muted">Stable · 7.4 months runway</div></button>
      <button onClick={() => setActiveTab('customers')} className="border-b border-[#d3d6da] p-5 text-left md:border-b-0 md:border-r"><div className="ledger-muted">Customers</div><div className="ledger-mono mt-3 text-[34px] leading-none">248</div><div className="mt-4 ledger-muted">↑ 8.2% · 2 need attention</div></button>
      <button onClick={() => setActiveTab('finance')} className="bg-[#fff6d6] p-5 text-left"><div>Overdue</div><div className="ledger-mono mt-3 text-[34px] leading-none">0.84L</div><div className="mt-4">3 invoices · oldest 23 days</div></button>
    </div>
    <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr]">
      <section className="ledger-rule"><div className="flex items-center justify-between py-3"><h2 className="text-[13px] font-semibold">Needs you</h2><span className="ledger-mono ledger-muted">{openItems.length} open</span></div>{actions.map((item, index) => <div key={item.title} className="flex items-center gap-4 border-b border-[#d3d6da] py-4"><span className="ledger-mono ledger-muted">0{index + 1}</span><div className="min-w-0 flex-1"><div className="font-semibold">{item.title}</div><div className="mt-1 text-[13px] ledger-muted">{item.evidence}</div></div><button onClick={() => setActiveTab(item.tab)} className={`ledger-button shrink-0 ${item.critical ? 'bg-[#ffc933] border-[#0e0f11]' : ''}`}>{item.action}</button></div>)}</section>
      <div className="flex flex-col gap-7"><section className="ledger-rule"><div className="flex items-center justify-between py-3"><h2 className="text-[13px] font-semibold">Business health</h2><span className="ledger-mono ledger-muted">5 checks</span></div>{[['Revenue','Up 12.4%','Healthy'],['Cash','Rs 8.7L reserve','Stable'],['Pipeline','Acme quiet 5 days','Watch'],['Receivables','3 overdue, oldest 23d','Act now'],['Expenses','Marketing +31%','Watch']].map(([label, evidence, status]) => <div key={label} className="grid grid-cols-[1fr_1.5fr_1fr] border-b border-[#d3d6da] py-3"><span className="font-semibold">{label}</span><span className="ledger-muted">{evidence}</span><span className={status === 'Act now' ? 'font-semibold' : ''}>{status === 'Act now' ? <span className="ledger-marker">{status}</span> : status}</span></div>)}</section><section className="ledger-rule"><h2 className="py-3 text-[13px] font-semibold">Recent</h2>{activityEvents.slice(0, 2).map(event => <div key={event.id} className="grid grid-cols-[55px_1fr] border-b border-[#d3d6da] py-3"><span className="ledger-mono ledger-muted">{event.timestamp}</span><span>{event.title}<ArrowUpRight className="ml-2 inline size-3 ledger-muted" /></span></div>)}</section></div>
    </div>
  </div>;
};
