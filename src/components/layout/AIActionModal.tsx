import React, { useEffect } from 'react';
import { Bot, X } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const AIActionModal: React.FC = () => {
  const { aiActionModal, closeAIActionModal } = useBusiness();

  useEffect(() => {
    if (!aiActionModal.isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAIActionModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiActionModal.isOpen, closeAIActionModal]);

  if (!aiActionModal.isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/55 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeAIActionModal}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-action-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 id="ai-action-title" className="font-bold text-slate-100 text-base">{aiActionModal.title}</h3>
              <p className="text-xs text-slate-400">Draft source: {aiActionModal.source || 'Workspace'}</p>
            </div>
          </div>
          <button
            onClick={closeAIActionModal}
            aria-label="Close preview"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100 font-semibold">Context: </strong>
            {aiActionModal.description}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="ai-action-draft" className="text-xs font-semibold text-slate-300">
                Draft text
              </label>
              {aiActionModal.actionDraft.recipient && (
                <span className="text-xs text-slate-400 font-mono">
                  To: {aiActionModal.actionDraft.recipient}
                </span>
              )}
            </div>

            {aiActionModal.actionDraft.subject && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium">
                <span className="text-slate-500">Subject: </span>
                {aiActionModal.actionDraft.subject}
              </div>
            )}

            <textarea
              id="ai-action-draft"
              rows={7}
              defaultValue={aiActionModal.actionDraft.content || ''}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-xs text-slate-400">Edits are not saved. This preview will not send or execute an action.</p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200" role="note">
            Preview only. No action connector is configured, so nothing can be approved, sent, or changed here.
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={closeAIActionModal}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
          >
            Close preview
          </button>
        </div>
      </div>
    </div>
  );
};
