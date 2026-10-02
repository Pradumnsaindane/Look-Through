import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Users, 
  FileText, 
  Briefcase, 
  CheckSquare, 
  IndianRupee, 
  ArrowRight, 
  Sparkles,
  Command
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const CommandMenu: React.FC = () => {
  const { 
    isCommandMenuOpen, 
    setIsCommandMenuOpen, 
    customers, 
    invoices, 
    deals, 
    tasks, 
    expenses,
    setSelectedCustomer,
    setActiveTab,
    setFinanceSubTab,
    setCustomerSubTab,
    executeNaturalLanguageAction
  } = useBusiness();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(!isCommandMenuOpen);
      }
      if (e.key === 'Escape' && isCommandMenuOpen) {
        setIsCommandMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandMenuOpen, setIsCommandMenuOpen]);

  useEffect(() => {
    if (isCommandMenuOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandMenuOpen]);

  if (!isCommandMenuOpen) return null;

  const q = query.trim().toLowerCase();

  // Natural language query interpretations
  const isOverdueQuery = q.includes('overdue') || q.includes('unpaid');
  const isAcmeQuery = q.includes('acme');
  const isExpenseQuery = q.includes('expense');
  const isDealQuery = q.includes('deal') || q.includes('pipeline');

  // Filtered lists
  const filteredCustomers = customers.filter(c => 
    !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)
  );

  const filteredInvoices = invoices.filter(inv => {
    if (!q) return true;
    if (isOverdueQuery && inv.status === 'overdue') return true;
    return inv.invoiceNumber.toLowerCase().includes(q) || 
           inv.customerName.toLowerCase().includes(q) ||
           inv.status.toLowerCase().includes(q);
  });

  const filteredDeals = deals.filter(d => 
    !q || d.title.toLowerCase().includes(q) || d.customerName.toLowerCase().includes(q) || (isDealQuery)
  );

  const filteredTasks = tasks.filter(t => 
    !q || t.title.toLowerCase().includes(q) || (t.customerName && t.customerName.toLowerCase().includes(q))
  );

  const handleSelectCustomer = (customer: typeof customers[0]) => {
    setSelectedCustomer(customer);
    setActiveTab('customers');
    setCustomerSubTab('customers');
    setIsCommandMenuOpen(false);
  };

  const handleSelectInvoice = () => {
    setActiveTab('finance');
    setFinanceSubTab('invoices');
    setIsCommandMenuOpen(false);
  };

  const handleRunAICommand = () => {
    if (!query) return;
    executeNaturalLanguageAction(query);
    setIsCommandMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && query.length > 3) {
                handleRunAICommand();
              }
            }}
            placeholder="Search customers, invoices, tasks, or type natural requests..."
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-base focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="text-[10px] text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            ESC
          </div>
        </div>

        {/* AI Intent Suggestion Banner */}
        {query.length > 3 && (
          <div 
            onClick={handleRunAICommand}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border-b border-blue-500/20 flex items-center justify-between cursor-pointer hover:bg-blue-900/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-blue-200">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>
                Interpret with AI: <strong className="text-white">"{query}"</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-blue-400 font-medium">
              <span>Execute Action</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-sm">
          {/* Quick Filter Shortcuts when empty */}
          {!query && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setQuery('overdue'); }}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center gap-3 transition-colors"
                >
                  <IndianRupee className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">Show Overdue Invoices</div>
                    <div className="text-[11px] text-slate-400">4 invoices · ₹84,000 pending</div>
                  </div>
                </button>
                <button
                  onClick={() => { setQuery('Acme'); }}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center gap-3 transition-colors"
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">Acme Corporation</div>
                    <div className="text-[11px] text-slate-400">₹4.2L revenue · 2 open deals</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Customers ({filteredCustomers.length})</span>
              </div>
              <div className="space-y-1">
                {filteredCustomers.slice(0, 3).map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${c.avatarBg} flex items-center justify-center text-white font-bold text-xs`}>
                        {c.name.substring(0, 1)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-400">{c.industry}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium text-slate-200">{c.formattedRevenue}</div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        c.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' :
                        c.status === 'Attention' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {filteredInvoices.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Invoices ({filteredInvoices.length})</span>
              </div>
              <div className="space-y-1">
                {filteredInvoices.slice(0, 3).map(inv => (
                  <div
                    key={inv.id}
                    onClick={handleSelectInvoice}
                    className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                        Invoice {inv.invoiceNumber} — {inv.customerName}
                      </div>
                      <div className="text-xs text-slate-400">Due: {inv.dueDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-slate-100">{inv.formattedAmount}</div>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' :
                        inv.status === 'overdue' ? 'bg-rose-500/20 text-rose-300 animate-pulse' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deals */}
          {filteredDeals.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>Deals & Opportunities ({filteredDeals.length})</span>
              </div>
              <div className="space-y-1">
                {filteredDeals.slice(0, 3).map(deal => (
                  <div
                    key={deal.id}
                    onClick={() => {
                      setActiveTab('customers');
                      setCustomerSubTab('deals');
                      setIsCommandMenuOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                        {deal.title}
                      </div>
                      <div className="text-xs text-slate-400">{deal.customerName} · Stage: {deal.stage}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-slate-100">{deal.formattedValue}</div>
                      <div className="text-[10px] text-slate-400">{deal.probability}% win prob</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Tasks ({filteredTasks.length})</span>
              </div>
              <div className="space-y-1">
                {filteredTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setActiveTab('work');
                      setIsCommandMenuOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        Due: {task.dueDate} · Assignee: {task.assignedTo}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">↑↓</span>
            <span>Navigate</span>
            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 ml-2">↵</span>
            <span>Select / Execute</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Business OS Global Search & AI Intent Parser
          </div>
        </div>
      </div>
    </div>
  );
};
