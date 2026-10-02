import React from 'react';
import { Search, Plus, Command } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const Topbar: React.FC = () => {
  const { setIsCommandMenuOpen, setIsCreateModalOpen, openAIActionModal, setActiveTab } = useBusiness();
  return <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[#d3d6da] px-6 md:px-10">
    <button onClick={() => setIsCommandMenuOpen(true)} className="flex h-9 w-full max-w-[406px] items-center justify-between rounded-[3px] border border-[#b9bdc3] bg-white px-3 text-left text-[13px] ledger-muted"><span className="flex min-w-0 items-center gap-2 truncate"><Search className="size-4 shrink-0" /><span className="truncate">Search, or ask &quot;overdue invoices from Acme&quot;</span></span><span className="hidden items-center gap-1 text-[11px] ledger-mono md:flex"><Command className="size-3" />K</span></button>
    <div className="flex flex-1 justify-end gap-3"><button onClick={() => { setActiveTab('ai'); openAIActionModal({ title: 'Morning briefing', level: 2, source: 'Business OS', description: 'A concise briefing of what needs your attention today.', actionDraft: { payloadType: 'briefing', subject: 'Morning briefing', content: 'Rs 84,000 is overdue. Acme has gone quiet for five days.' }, onExecute: () => setActiveTab('today') }); }} className="ledger-button hidden sm:block">AI briefing</button><button onClick={() => setIsCreateModalOpen(true)} className="ledger-button ledger-button-primary"><Plus className="mr-1 inline size-4" />Create</button></div>
  </header>;
};
