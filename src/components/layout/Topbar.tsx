import React, { useEffect, useState } from 'react';
import { Search, Plus, Command, Moon, Sun } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const Topbar: React.FC = () => {
  const { setIsCommandMenuOpen, setIsCreateModalOpen, openAIActionModal, setActiveTab } = useBusiness();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const toggleTheme = () => {
    setDark((value) => {
      const next = !value;
      document.documentElement.classList.toggle('dark', next);
      document.documentElement.style.colorScheme = next ? 'dark' : 'light';
      return next;
    });
  };

  return <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[var(--hairline)] px-6 md:px-10">
    <button onClick={() => setIsCommandMenuOpen(true)} className="ledger-input flex h-9 w-full max-w-[406px] items-center justify-between rounded-[3px] px-3 text-left text-[13px] ledger-muted"><span className="flex min-w-0 items-center gap-2 truncate"><Search className="size-4 shrink-0" /><span className="truncate">Search, or ask &quot;overdue invoices from Acme&quot;</span></span><span className="hidden items-center gap-1 text-[11px] ledger-mono md:flex"><Command className="size-3" />K</span></button>
    <div className="flex flex-1 justify-end gap-2"><button onClick={toggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} className="ledger-button px-2.5">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button><button onClick={() => { setActiveTab('ai'); openAIActionModal({ title: 'Morning briefing', level: 2, source: 'Business OS', description: 'A concise briefing of what needs your attention today.', actionDraft: { payloadType: 'briefing', subject: 'Morning briefing', content: 'Rs 84,000 is overdue. Acme has gone quiet for five days.' }, onExecute: () => setActiveTab('today') }); }} className="ledger-button hidden sm:block">AI briefing</button><button onClick={() => setIsCreateModalOpen(true)} className="ledger-button ledger-button-primary"><Plus className="mr-1 inline size-4" />Create</button></div>
  </header>;
};
