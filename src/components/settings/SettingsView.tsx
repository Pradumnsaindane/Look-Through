import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Bot, 
  Bell, 
  CreditCard, 
  Users, 
  Key, 
  Check, 
  Lock, 
  SlidersHorizontal,
  FileCheck
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const SettingsView: React.FC = () => {
  const { addToast } = useBusiness();
  const [activeTab, setActiveTab] = useState<'org' | 'security' | 'ai' | 'billing'>('org');

  const [companyName, setCompanyName] = useState('Apex Global Corp');
  const [taxId, setTaxId] = useState('GSTIN-27AABCA1234F1Z5');
  const [aiAutonomyLevel, setAiAutonomyLevel] = useState('Level 4 (Ask Approval Before Execution)');
  const [autoReminderThreshold, setAutoReminderThreshold] = useState('₹50,000');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Settings Saved',
      description: 'Organization parameters and AI guardrail policies updated successfully.',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          System Configuration & Governance
        </h1>
        <p className="text-xs text-slate-400">
          Manage organizational profile, role-based access control (RBAC), and AI autonomy guardrails.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('org')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'org' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Organization</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ai' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Governance & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'security' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & RBAC</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'billing' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Plan & Billing</span>
        </button>
      </div>

      {/* Tab: Organization Profile */}
      {activeTab === 'org' && (
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Company Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Legal Entity Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tax / GST Number</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={e => setTaxId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Base Currency</label>
                <input
                  type="text"
                  disabled
                  value="INR (₹) - Indian Rupee"
                  className="w-full p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Timezone</label>
                <input
                  type="text"
                  disabled
                  value="Asia/Kolkata (IST +05:30)"
                  className="w-full p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              Save Organization Changes
            </button>
          </div>
        </form>
      )}

      {/* Tab: AI Governance */}
      {activeTab === 'ai' && (
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">AI Policy & Automation Guardrails</h3>
                <p className="text-xs text-slate-400">Configure permission boundaries for automated tasks</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Safety First
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Execution Permission Level</label>
              <select
                value={aiAutonomyLevel}
                onChange={e => setAiAutonomyLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Level 4 (Ask Approval Before Execution)">Level 4: Ask Approval Before Execution (Recommended)</option>
                <option value="Level 3 (Prepare Artifacts Only)">Level 3: Prepare Draft Artifacts Only</option>
                <option value="Level 6 (Bounded Autonomous Execution)">Level 6: Autonomous for invoices &lt; ₹20,000</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Anomaly Detection Sensitivity</label>
              <select
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option>High (Flag expenses &gt;25% variance from 30d baseline)</option>
                <option>Medium (Flag expenses &gt;35% variance)</option>
                <option>Low (Flag expenses &gt;50% variance)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              Update AI Governance Rules
            </button>
          </div>
        </form>
      )}

      {/* Tab: Security & RBAC */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Team Roles & Permissions (RBAC)</h3>
            <div className="divide-y divide-slate-800">
              {[
                { name: 'Pradumn Saindane', role: 'Owner / Superadmin', email: 'pradumn@apex.corp', status: 'Active' },
                { name: 'Rohan Verma', role: 'Sales Director', email: 'rohan.v@apex.corp', status: 'Active' },
                { name: 'Kunal Deshmukh', role: 'Finance & Growth Lead', email: 'kunal.d@apex.corp', status: 'Active' },
              ].map((m, i) => (
                <div key={i} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{m.name}</div>
                    <div className="text-slate-400">{m.email} · <span className="text-blue-400 font-semibold">{m.role}</span></div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Plan & Billing */}
      {activeTab === 'billing' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Business OS Enterprise Tier</h3>
              <p className="text-xs text-slate-400">Unlimited connectors, autonomous intelligence engine, 10 team seats</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Subscription
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-200">Next billing date: November 1, 2026</div>
              <div className="text-slate-400">Card ending in •••• 4242 (Auto-renewal enabled via Stripe)</div>
            </div>
            <span className="font-mono font-bold text-sm text-slate-100">₹40,000 / Year</span>
          </div>
        </div>
      )}
    </div>
  );
};
