import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  Briefcase, 
  Clock, 
  MessageSquare, 
  Plus, 
  Sparkles,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Customer, Deal, Invoice } from '../../types';
import { useCustomerProfile } from './customerApi';

export const CustomerDetailDrawer: React.FC = () => {
  const { 
    selectedCustomer, 
    setSelectedCustomer, 
    openAIActionModal,
    markInvoicePaid,
    sendInvoiceReminder
  } = useBusiness();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'invoices' | 'deals' | 'activity' | 'notes'>('overview');
  const { data: profile, error: profileError } = useCustomerProfile(selectedCustomer?.id);

  if (!selectedCustomer) return null;

  const c = selectedCustomer;
  const customerInvoices = profile?.invoices || [];
  const customerDeals = profile?.deals || [];
  const customerContacts = profile?.contacts || [];
  const customerEvents = profile?.activity || [];

  const handleDraftAIFollowup = () => {
    openAIActionModal({
      title: `Draft Follow-Up for ${c.name}`,
      level: 3,
      source: 'CRM Relationship Copilot',
      description: `Customer has health score of ${c.healthScore}%. Last interaction was ${c.lastActivity}. Suggested next touchpoint prepared.`,
      actionDraft: {
        recipient: `${c.name} <${c.email}>`,
        subject: `Update from Apex Global Corp — Strategic Review`,
        content: `Hi ${c.name.split(' ')[0]},\n\nHope your week is going great. I wanted to follow up on our ongoing initiatives and ensure your team has everything required for the upcoming deliverables.\n\nLet me know if there's any area where our team can accelerate your timeline.\n\nBest regards,\nPradumn Saindane · Apex Global`,
        payloadType: 'customer_followup',
        targetId: c.id
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Profile Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${c.avatarBg} flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/10`}>
                {c.name.substring(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-100">{c.name}</h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    c.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    c.status === 'Attention' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{c.company} · {c.industry}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> {c.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {c.phone}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Health Gauge Card */}
          <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-4 gap-3">
            <div>
              <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">Health Score</div>
              <div className="flex items-center gap-2">
                <div className={`text-xl font-bold font-mono ${
                  c.healthScore >= 80 ? 'text-emerald-400' :
                  c.healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {c.healthScore}%
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {c.healthScore >= 80 ? 'Optimal' : c.healthScore >= 60 ? 'Moderate' : 'At Risk'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    c.healthScore >= 80 ? 'bg-emerald-500' :
                    c.healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${c.healthScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">Total Revenue</div>
              <div className="text-xl font-bold font-mono text-slate-100">{c.formattedRevenue}</div>
              <div className="text-[10px] text-emerald-400 font-medium">Lifetime value</div>
            </div>

            <div>
              <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">Open Invoices</div>
              <div className={`text-xl font-bold font-mono ${c.openInvoicesAmount > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
                {c.openInvoicesAmount > 0 ? `₹${(c.openInvoicesAmount / 1000).toFixed(0)}k` : '₹0'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">{c.openInvoicesCount} pending invoices</div>
            </div>

            <div>
              <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">Last Touch</div>
              <div className="text-xl font-bold text-slate-100">{c.lastActivity}</div>
              <div className="text-[10px] text-slate-400 font-medium">Auto-logged</div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-6">
          {(['overview', 'invoices', 'deals', 'activity', 'notes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`py-3 text-xs font-semibold capitalize border-b-2 transition-colors ${
                activeSubTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {profileError && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">Some live customer details could not be loaded.</div>}
          {/* Quick AI Action Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-100">AI Relationship Copilot</h4>
                <p className="text-xs text-slate-300">Prepare follow-up message with customized account context.</p>
              </div>
            </div>
            <button
              onClick={handleDraftAIFollowup}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
            >
              Draft Email
            </button>
          </div>

          {/* SubTab: Overview */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Account tags */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connected Contacts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contacts</h4>
                  <span className="text-xs text-slate-400 font-mono">{customerContacts.length} records</span>
                </div>
                {customerContacts.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">No contacts yet.</div>
                ) : customerContacts.map(contact => (
                  <div key={contact.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{contact.name}{contact.is_primary ? ' · Primary' : ''}</span>
                    <span className="text-slate-400">{contact.email || contact.phone || 'No contact details'}</span>
                  </div>
                ))}
              </div>

              {/* Connected Invoices */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoices & Receivables</h4>
                  <span className="text-xs text-slate-400 font-mono">{customerInvoices.length} records</span>
                </div>
                {customerInvoices.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                    No open invoices for this customer.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerInvoices.map(inv => (
                      <div key={inv.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-200 text-xs">{inv.invoiceNumber}</div>
                          <div className="text-[11px] text-slate-400">Due: {inv.dueDate} {inv.daysOverdue ? `(${inv.daysOverdue}d overdue)` : ''}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-slate-100">{inv.formattedAmount}</span>
                          {inv.status === 'overdue' && (
                            <button
                              onClick={() => sendInvoiceReminder(inv.id)}
                              className="text-[11px] px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                            >
                              Remind
                            </button>
                          )}
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => markInvoicePaid(inv.id)}
                              className="text-[11px] px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Connected Deals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Opportunities</h4>
                  <span className="text-xs text-slate-400 font-mono">{customerDeals.length} active</span>
                </div>
                <div className="space-y-2">
              {customerDeals.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">No deals yet.</div>
              ) : customerDeals.map(deal => (
                <div key={deal.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200 text-xs">{deal.title}</div>
                        <div className="text-[11px] text-slate-400">Stage: <strong className="text-blue-400 uppercase">{deal.stage}</strong> · {deal.probability}% win probability</div>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-100">{deal.formattedValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SubTab: Notes */}
          {activeSubTab === 'notes' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Notes & Intelligence</h4>
              {c.notes.map((note, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {note}
                </div>
              ))}
            </div>
          )}

          {/* SubTab: Invoices list */}
          {activeSubTab === 'invoices' && (
            <div className="space-y-3">
              {customerInvoices.map(inv => (
                <div key={inv.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-100 text-sm">Invoice {inv.invoiceNumber}</h5>
                      <p className="text-xs text-slate-400">Issued: {inv.issueDate} · Due: {inv.dueDate}</p>
                    </div>
                    <span className="font-mono font-bold text-base text-slate-100">{inv.formattedAmount}</span>
                  </div>

                  <div className="border-t border-slate-850 pt-2 space-y-1">
                    {inv.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-400">
                        <span>{item.description} (x{item.quantity})</span>
                        <span className="font-mono text-slate-300">₹{item.total.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SubTab: Deals */}
          {activeSubTab === 'deals' && (
            <div className="space-y-3">
              {customerDeals.map(deal => (
                <div key={deal.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-100 text-sm">{deal.title}</h5>
                    <span className="font-mono font-bold text-base text-slate-100">{deal.formattedValue}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Stage: <strong className="text-blue-400 uppercase">{deal.stage}</strong></span>
                    <span>Close Date: {deal.expectedCloseDate}</span>
                    <span>Owner: {deal.assignedTo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SubTab: Activity */}
          {activeSubTab === 'activity' && (
            <div className="space-y-3">
              {customerEvents.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">No activity yet.</div>
              ) : customerEvents.map((event) => {
                const activity = event as Record<string, unknown>;
                return (
                  <div key={String(activity.id)} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{String(activity.action || 'Activity')}</div>
                      <div className="text-slate-400">{String(activity.created_at || '')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
