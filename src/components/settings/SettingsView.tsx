import React, { useState, useEffect } from 'react';
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
  FileCheck,
  Plus,
  Trash2
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { authClient } from '../../auth/neonAuthClient';

interface WorkspaceSettings {
  companyName: string;
  taxId: string;
  aiAutonomyLevel: string;
  anomalySensitivity: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
}

function isTeamMember(value: unknown): value is TeamMember {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const member = value as Record<string, unknown>;
  return typeof member.id === 'string'
    && typeof member.name === 'string'
    && typeof member.role === 'string'
    && typeof member.email === 'string'
    && typeof member.status === 'string';
}

const SETTINGS_STORAGE_KEY = 'lookthrough_settings';
const TEAM_STORAGE_KEY = 'lookthrough_team_members';

export const SettingsView: React.FC = () => {
  const { addToast } = useBusiness();
  const [activeTab, setActiveTab] = useState<'org' | 'security' | 'ai' | 'billing'>('org');

  const session = authClient
    ? (authClient.useSession() as { isPending: boolean; data?: { user?: { name?: string | null; email?: string | null } } | null })
    : { isPending: false, data: null };

  const currentUserName = session.data?.user?.name || 'Workspace Administrator';
  const currentUserEmail = session.data?.user?.email || 'admin@workspace.local';

  const [companyName, setCompanyName] = useState('My Business OS');
  const [taxId, setTaxId] = useState('');
  const [aiAutonomyLevel, setAiAutonomyLevel] = useState('Level 4 (Ask Approval Before Execution)');
  const [anomalySensitivity, setAnomalySensitivity] = useState('High (Flag expenses >25% variance from 30d baseline)');

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Sales Director');
  const [showAddMember, setShowAddMember] = useState(false);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Stored preferences are not a valid object.');
        }
        const savedPreferences = parsed as Record<string, unknown>;
        if (typeof savedPreferences.companyName === 'string') setCompanyName(savedPreferences.companyName);
        if (typeof savedPreferences.taxId === 'string') setTaxId(savedPreferences.taxId);
        if (typeof savedPreferences.aiAutonomyLevel === 'string') setAiAutonomyLevel(savedPreferences.aiAutonomyLevel);
        if (typeof savedPreferences.anomalySensitivity === 'string') setAnomalySensitivity(savedPreferences.anomalySensitivity);
      }
    } catch {
      setStorageMessage('Saved preferences could not be read. Check this browser’s local storage.');
    }

    try {
      const savedTeam = localStorage.getItem(TEAM_STORAGE_KEY);
      if (savedTeam) {
        const parsed: unknown = JSON.parse(savedTeam);
        if (!Array.isArray(parsed) || !parsed.every(isTeamMember)) {
          throw new Error('Stored team list is not valid.');
        }
        setTeamMembers(parsed.map(member => ({
          ...member,
          status: member.id === 'owner' ? 'Signed in' : 'Local entry',
        })));
      } else {
        setTeamMembers([
          {
            id: 'owner',
            name: currentUserName,
            email: currentUserEmail,
            role: 'Owner / Superadmin',
            status: 'Signed in'
          }
        ]);
      }
    } catch {
      setStorageMessage('The local team list could not be read. Check this browser’s local storage.');
    }
  }, [currentUserName, currentUserEmail]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settings: WorkspaceSettings = {
      companyName,
      taxId,
      aiAutonomyLevel,
      anomalySensitivity
    };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setStorageMessage(null);
      addToast({
        type: 'info',
        title: 'Preferences saved locally',
        description: 'Stored in this browser only. These values do not update organization or automation policies.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Browser storage is unavailable.';
      setStorageMessage(`Preferences were not saved: ${message}`);
      addToast({ type: 'error', title: 'Preferences not saved', description: message });
      return;
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    const member: TeamMember = {
      id: `member_${Date.now()}`,
      name: newMemberName.trim() || newMemberEmail.split('@')[0],
      email: newMemberEmail.trim(),
      role: newMemberRole,
      status: 'Local entry'
    };
    const updated = [...teamMembers, member];
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Browser storage is unavailable.';
      setStorageMessage(`The team list was not saved: ${message}`);
      addToast({ type: 'error', title: 'List entry not saved', description: message });
      return;
    }
    setTeamMembers(updated);
    setStorageMessage(null);
    setNewMemberName('');
    setNewMemberEmail('');
    setShowAddMember(false);
    addToast({
      type: 'info',
      title: 'Added to local list',
      description: `${member.name} appears in this browser’s list only. No invitation was sent and no access was granted.`,
    });
  };

  const handleRemoveMember = (id: string) => {
    if (id === 'owner') {
      addToast({
        type: 'warning',
        title: 'Cannot Remove Owner',
        description: 'The primary workspace owner cannot be removed.',
      });
      return;
    }
    const updated = teamMembers.filter(m => m.id !== id);
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Browser storage is unavailable.';
      setStorageMessage(`The team list was not saved: ${message}`);
      addToast({ type: 'error', title: 'List entry not removed', description: message });
      return;
    }
    setTeamMembers(updated);
    setStorageMessage(null);
    addToast({
      type: 'info',
      title: 'Removed from local list',
      description: 'No organization access was changed.',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Workspace preferences
        </h1>
        <p className="text-xs text-slate-400">
          These values and the team list are stored in this browser. They do not change shared organization data, access, billing, or AI execution policies.
        </p>
      </div>
      {storageMessage && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200" role="alert">
          {storageMessage}
        </p>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 rounded-xl p-1 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('org')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'org' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Organization</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'ai' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Governance & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'security' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & RBAC</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
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
                  placeholder="e.g. Acme Tech Private Limited"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tax / GST Number</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={e => setTaxId(e.target.value)}
                  placeholder="e.g. GSTIN-27AABCA1234F1Z5"
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
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
                <p className="text-xs text-slate-400">Preference only; these choices are not applied to automated tasks.</p>
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
                value={anomalySensitivity}
                onChange={e => setAnomalySensitivity(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="High (Flag expenses >25% variance from 30d baseline)">High (Flag expenses &gt;25% variance from 30d baseline)</option>
                <option value="Medium (Flag expenses >35% variance)">Medium (Flag expenses &gt;35% variance)</option>
                <option value="Low (Flag expenses >50% variance)">Low (Flag expenses &gt;50% variance)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Save Local Preferences
            </button>
          </div>
        </form>
      )}

      {/* Tab: Security & RBAC */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Local team list</h3>
              <p className="text-xs text-slate-400">Entries are not invitations and do not grant or revoke access.</p>
            </div>
            <button
              onClick={() => setShowAddMember(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to list</span>
            </button>
          </div>

          {showAddMember && (
            <form onSubmit={handleAddMember} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200">Invite New Collaborator</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <select
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Sales Director">Sales Director</option>
                  <option value="Finance Lead">Finance Lead</option>
                  <option value="Operations Analyst">Operations Analyst</option>
                  <option value="Workspace Admin">Workspace Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Add to list
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-800">
            {teamMembers.map(m => (
              <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{m.name}</div>
                  <div className="text-slate-400">{m.email} · <span className="text-blue-400 font-semibold">{m.role}</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {m.status}
                  </span>
                  {m.id !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Plan & Billing */}
      {activeTab === 'billing' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Billing is not configured</h3>
              <p className="text-xs text-slate-400">No subscription or payment provider is connected to this workspace.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Not configured
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-200">No billing cycle</div>
              <div className="text-slate-400">Connect a billing service to manage a subscription.</div>
            </div>
            <span className="font-mono font-bold text-sm text-slate-100">No active plan</span>
          </div>
        </div>
      )}
    </div>
  );
};
