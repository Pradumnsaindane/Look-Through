import React, { useState } from 'react';
import { useCustomers } from './customerApi';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  ArrowUpRight, 
  Building2, 
  AlertCircle, 
  Activity, 
  Kanban,
  FileSpreadsheet,
  Briefcase
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Customer } from '../../types';
import { SalesPipelineKanban } from './SalesPipelineKanban';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';

export const CustomersView: React.FC = () => {
  const { 
    customerSubTab, 
    setCustomerSubTab, 
    setSelectedCustomer, 
    setIsCreateModalOpen,
    deals,
    activityEvents
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Attention' | 'At Risk' | 'New'>('All');

  const [page, setPage] = useState(1);
  const { customers, total, isLoading, error, mutate } = useCustomers(searchQuery, statusFilter, page);
  const filteredCustomers = customers;
  const pageCount = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Customer & Pipeline Intelligence
          </h1>
          <p className="text-xs text-slate-400">
            Unified operational CRM connecting customer relationship health, open opportunities, and billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subtabs */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setCustomerSubTab('customers')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                customerSubTab === 'customers'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Accounts ({customers.length})</span>
            </button>

            <button
              onClick={() => setCustomerSubTab('deals')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                customerSubTab === 'deals'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline & Deals</span>
            </button>

            <button
              onClick={() => setCustomerSubTab('activity')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                customerSubTab === 'activity'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Activity Stream</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Subtab: Customers Table View */}
      {customerSubTab === 'customers' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search customers, company, industry..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {(['All', 'Active', 'Attention', 'At Risk', 'New'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === tab
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Customer Account</th>
                    <th className="py-3.5 px-4">Health Score</th>
                    <th className="py-3.5 px-4">Revenue (LTV)</th>
                    <th className="py-3.5 px-4">Open Invoices</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {isLoading && <tr><td colSpan={7} className="p-8 text-center text-xs text-slate-400">Loading customers…</td></tr>}
                  {error && <tr><td colSpan={7} className="p-8 text-center text-xs text-rose-300">{error.message} <button onClick={() => mutate()} className="ml-2 underline">Retry</button></td></tr>}
                  {!isLoading && !error && filteredCustomers.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-xs text-slate-400">No customers match these filters.</td></tr>}
                  {!isLoading && !error && filteredCustomers.map(c => {
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCustomer(c)}
                        className="hover:bg-slate-850/60 cursor-pointer transition-colors group"
                      >
                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${c.avatarBg} flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10 shadow-sm`}>
                              {c.name.substring(0, 1)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                                {c.name}
                              </div>
                              <div className="text-[11px] text-slate-400">{c.industry}</div>
                            </div>
                          </div>
                        </td>

                        {/* Health Score */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${
                              c.healthScore >= 80 ? 'text-emerald-400' :
                              c.healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {c.healthScore}%
                            </span>
                            <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  c.healthScore >= 80 ? 'bg-emerald-500' :
                                  c.healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${c.healthScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Revenue */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                          {c.formattedRevenue}
                        </td>

                        {/* Open Invoices */}
                        <td className="py-3.5 px-4">
                          {c.openInvoicesAmount > 0 ? (
                            <span className="font-mono text-amber-400 font-semibold">
                              ₹{(c.openInvoicesAmount / 1000).toFixed(0)}k ({c.openInvoicesCount})
                            </span>
                          ) : (
                            <span className="text-slate-400">All settled</span>
                          )}
                        </td>

                        {/* Last Activity */}
                        <td className="py-3.5 px-4 text-slate-300">
                          {c.lastActivity}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            c.status === 'Active' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                            c.status === 'Attention' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                            c.status === 'New' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' :
                            'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}>
                            {c.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomer(c);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-colors"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{total} customer records</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="px-3 py-1.5 rounded-lg border border-slate-800 disabled:opacity-40">Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button disabled={page >= pageCount} onClick={() => setPage(current => Math.min(pageCount, current + 1))} className="px-3 py-1.5 rounded-lg border border-slate-800 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Sales Pipeline Kanban */}
      {customerSubTab === 'deals' && (
        <SalesPipelineKanban />
      )}

      {/* Subtab: Activity Stream */}
      {customerSubTab === 'activity' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Customer Touchpoint Logs & Audit Events
          </h3>
          <div className="space-y-2">
            {activityEvents.map(evt => (
              <div key={evt.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-100">{evt.title}</div>
                  <div className="text-slate-400">{evt.entityName} · {evt.timeLabel}</div>
                </div>
                {evt.amount && (
                  <span className="font-mono font-bold text-slate-200">{evt.amount}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer />
    </div>
  );
};
