import React from 'react';
import { Search, Plus, Command } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const Topbar: React.FC = () => {
  const { setIsCommandMenuOpen, setIsCreateModalOpen, openAIActionModal, setActiveTab } = useBusiness();
  return <header className="flex min-h-16 shrink-0 items-center gap-3 border-b border-[var(--hairline)] px-4 sm:gap-4 sm:px-6 md:px-10">
    <button type="button" aria-label="Open search and command menu" onClick={() => setIsCommandMenuOpen(true)} className="ledger-input flex h-9 min-w-0 flex-1 items-center justify-between rounded-[3px] px-3 text-left text-[13px] ledger-muted"><span className="flex min-w-0 items-center gap-2 truncate"><Search className="size-4 shrink-0" aria-hidden="true" /><span className="truncate">Search, or explore Look Through</span></span><span className="hidden items-center gap-1 text-[11px] ledger-mono md:flex"><Command className="size-3" aria-hidden="true" />K</span></button>
    <div className="flex shrink-0 justify-end gap-2"><button onClick={() => { setActiveTab('ai'); openAIActionModal({ title: 'Morning briefing', level: 2, source: 'Business OS', description: 'A concise briefing of what needs your attention today.', actionDraft: { payloadType: 'briefing', subject: 'Morning briefing', content: 'Rs 84,000 is overdue. Acme has gone quiet for five days.' }, onExecute: () => setActiveTab('today') }); }} className="ledger-button hidden sm:block">AI briefing</button><button onClick={() => setIsCreateModalOpen(true)} className="ledger-button ledger-button-primary"><Plus className="mr-1 inline size-4" />Create</button></div>
  </header>;
};
