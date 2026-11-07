import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Receipt, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

type CreateTab = 'ai' | 'invoice' | 'customer' | 'deal' | 'expense' | 'task';

export const UniversalCreateModal: React.FC = () => {
  const { 
    isCreateModalOpen, 
    setIsCreateModalOpen, 
    customers,
    createInvoice,
    createCustomer,
    createDeal,
    createExpense,
    createTask,
    executeNaturalLanguageAction
  } = useBusiness();

  const [activeTab, setActiveTab] = useState<CreateTab>('ai');

  // AI Prompt state
  const [aiPrompt, setAiPrompt] = useState('');

  // Invoice Form State
  const [invoiceCustomerId, setInvoiceCustomerId] = useState(customers[0]?.id || 'cust-1');
  const [invoiceAmount, setInvoiceAmount] = useState('50000');
  const [invoiceDueDate, setInvoiceDueDate] = useState('2026-10-31');
  const [invoiceDescription, setInvoiceDescription] = useState('Enterprise Consulting & System Integration');

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerIndustry, setCustomerIndustry] = useState('Technology & Software');

  // Deal Form State
  const [dealTitle, setDealTitle] = useState('');
  const [dealCustomerId, setDealCustomerId] = useState(customers[0]?.id || 'cust-1');
  const [dealValue, setDealValue] = useState('250000');
  const [dealStage, setDealStage] = useState<'lead' | 'qualified' | 'proposal' | 'negotiation'>('lead');

  // Expense Form State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('18500');
  const [expenseCategory, setExpenseCategory] = useState<'Marketing' | 'Software & Subscriptions' | 'Operations' | 'Payroll' | 'Travel' | 'Infrastructure'>('Operations');
  const [expenseVendor, setExpenseVendor] = useState('');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [taskDueDate, setTaskDueDate] = useState('Today');

  if (!isCreateModalOpen) return null;

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const matched = executeNaturalLanguageAction(aiPrompt);
    if (!matched) {
      // Fallback: create task with the prompt
      createTask({
        title: aiPrompt,
        priority: 'high',
        dueDate: 'Today'
      });
    }
    setAiPrompt('');
    setIsCreateModalOpen(false);
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === invoiceCustomerId);
    const amountNum = parseFloat(invoiceAmount) || 50000;

    createInvoice({
      customerId: invoiceCustomerId,
      customerName: cust?.company || 'Client Co',
      amount: amountNum,
      dueDate: invoiceDueDate,
      items: [{ description: invoiceDescription, quantity: 1, rate: amountNum, total: amountNum }]
    });
    setIsCreateModalOpen(false);
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    createCustomer({
      name: customerName,
      company: customerCompany || customerName,
      email: customerEmail || 'contact@client.com',
      phone: customerPhone || '+91 98000 00000',
      industry: customerIndustry
    });
    setCustomerName('');
    setIsCreateModalOpen(false);
  };

  const handleDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle.trim()) return;
    const cust = customers.find(c => c.id === dealCustomerId);
    const val = parseFloat(dealValue) || 200000;

    createDeal({
      title: dealTitle,
      customerId: dealCustomerId,
      customerName: cust?.company || 'Client Co',
      value: val,
      stage: dealStage
    });
    setDealTitle('');
    setIsCreateModalOpen(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim()) return;
    const amt = parseFloat(expenseAmount) || 10000;

    createExpense({
      title: expenseTitle,
      category: expenseCategory,
      amount: amt,
      vendor: expenseVendor || 'Approved Vendor'
    });
    setExpenseTitle('');
    setIsCreateModalOpen(false);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    createTask({
      title: taskTitle,
      priority: taskPriority,
      dueDate: taskDueDate
    });
    setTaskTitle('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Universal Create</h3>
              <p className="text-xs text-slate-400">Add any business entity with deterministic validation</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-3 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>AI Fast Create</span>
          </button>

          <button
            onClick={() => setActiveTab('invoice')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'invoice'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Invoice</span>
          </button>

          <button
            onClick={() => setActiveTab('customer')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'customer'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => setActiveTab('deal')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'deal'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Deal</span>
          </button>

          <button
            onClick={() => setActiveTab('expense')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'expense'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>

          <button
            onClick={() => setActiveTab('task')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'task'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* AI Fast Create */}
          {activeTab === 'ai' && (
            <form onSubmit={handleAISubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/20 space-y-2">
                <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Natural Language Quick Execution</span>
                </div>
                <p className="text-xs text-slate-300">
                  Type what you want to create in plain English. The system validates the parameters before saving.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Natural Language Command
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="e.g. 'Create an invoice for Acme for ₹50,000' or 'Follow up with Acme' or 'Add expense ₹18,500 for marketing dinner'..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Sample Prompts */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Examples:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Create an invoice for Acme for ₹50,000',
                    'Follow up with Acme on Q4 renewal',
                    'Add expense ₹18,500 marketing dinner',
                    'Task: Prepare executive slides for ABC',
                  ].map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAiPrompt(example)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-colors text-left"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!aiPrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Execute</span>
                </button>
              </div>
            </form>
          )}

          {/* Invoice Form */}
          {activeTab === 'invoice' && (
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Customer Account</label>
                <select
                  value={invoiceCustomerId}
                  onChange={e => setInvoiceCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount (₹ INR)</label>
                  <input
                    type="number"
                    value={invoiceAmount}
                    onChange={e => setInvoiceAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={invoiceDueDate}
                    onChange={e => setInvoiceDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Line Item Description</label>
                <input
                  type="text"
                  value={invoiceDescription}
                  onChange={e => setInvoiceDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          )}

          {/* Customer Form */}
          {activeTab === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Customer / Company Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Acme Innovations"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Brand / Short Name</label>
                  <input
                    type="text"
                    value={customerCompany}
                    onChange={e => setCustomerCompany(e.target.value)}
                    placeholder="e.g. Acme"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Billing Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="finance@company.com"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Industry Vertical</label>
                <input
                  type="text"
                  value={customerIndustry}
                  onChange={e => setCustomerIndustry(e.target.value)}
                  placeholder="e.g. SaaS, FinTech, Manufacturing"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
                >
                  Create Customer Record
                </button>
              </div>
            </form>
          )}

          {/* Deal Form */}
          {activeTab === 'deal' && (
            <form onSubmit={handleDealSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deal Opportunity Title</label>
                <input
                  type="text"
                  value={dealTitle}
                  onChange={e => setDealTitle(e.target.value)}
                  placeholder="e.g. Q4 Cloud Migration & Architecture Retainer"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Customer</label>
                  <select
                    value={dealCustomerId}
                    onChange={e => setDealCustomerId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estimated Value (₹ INR)</label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={e => setDealValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pipeline Stage</label>
                <select
                  value={dealStage}
                  onChange={e => setDealStage(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="lead">Lead (Discovery)</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal Submitted</option>
                  <option value="negotiation">Negotiation & Review</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
                >
                  Add Deal to Pipeline
                </button>
              </div>
            </form>
          )}

          {/* Expense Form */}
          {activeTab === 'expense' && (
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expense Description</label>
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  placeholder="e.g. AWS Production Cluster Hosting"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Software & Subscriptions">Software & Subscriptions</option>
                    <option value="Operations">Operations</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Travel">Travel</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount (₹ INR)</label>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vendor / Payee</label>
                <input
                  type="text"
                  value={expenseVendor}
                  onChange={e => setExpenseVendor(e.target.value)}
                  placeholder="e.g. Google India, AWS, Hotel Gateway"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          )}

          {/* Task Form */}
          {activeTab === 'task' && (
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Description</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Send revised SLA document to Acme Ltd"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="text"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    placeholder="e.g. Today, Tomorrow, Oct 15"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
                >
                  Create Work Task
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
