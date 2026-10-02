import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  Bot,
  UserCheck,
  Check,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBusiness } from '../../context/BusinessContext';

export const AIActionModal: React.FC = () => {
  const { aiActionModal, closeAIActionModal } = useBusiness();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [editedContent, setEditedContent] = useState(aiActionModal.actionDraft.content || '');

  if (!aiActionModal.isOpen) return null;

  const currentLevel = aiActionModal.level || 4;

  const handleApproveAndExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsDone(true);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#6366f1']
      });

      if (aiActionModal.onExecute) {
        aiActionModal.onExecute();
      }

      setTimeout(() => {
        closeAIActionModal();
        setIsDone(false);
      }, 1400);
    }, 900);
  };

  const steps = [
    { num: 1, label: 'Read & Ingest', desc: 'Continuous telemetry scan' },
    { num: 2, label: 'Synthesize & Suggest', desc: 'Identify root cause & risk' },
    { num: 3, label: 'Prepare Draft', desc: 'Generate complete payload' },
    { num: 4, label: 'Request Approval', desc: 'Owner authorization gate' },
    { num: 5, label: 'Execute & Log', desc: 'Deterministic API execution' },
    { num: 6, label: 'Autonomous Policy', desc: 'Rules & Guardrails' },
  ];

  return (
    <div className="fixed inset-0 bg-black/55 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">{aiActionModal.title}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Level {currentLevel} Gate
                </span>
              </div>
              <p className="text-xs text-slate-400">Source: {aiActionModal.source || 'Business Intelligence Pipeline'}</p>
            </div>
          </div>
          <button
            onClick={closeAIActionModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Level Permission Progression Visualizer */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Autonomous Governance Chain
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Human-in-the-Loop Safe
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {steps.map(s => {
              const isPast = s.num < currentLevel;
              const isCurrent = s.num === currentLevel;
              return (
                <div 
                  key={s.num}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                      : isPast
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-600'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold">L{s.num}</div>
                  <div className="text-[11px] font-semibold truncate">{s.label.split(' ')[0]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content & Action Payload */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Explanation Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100 font-semibold">Why this matters: </strong>
            {aiActionModal.description}
          </div>

          {/* Drafted Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Prepared Action Payload (Editable Draft)
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
              rows={7}
              defaultValue={aiActionModal.actionDraft.content || ''}
              onChange={e => setEditedContent(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Execution Guardrail Notice */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300">
            <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              By clicking Approve, you authorize Business OS to execute this transaction via the canonical integration connector.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={closeAIActionModal}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
          >
            Cancel / Dismiss
          </button>

          <button
            onClick={handleApproveAndExecute}
            disabled={isExecuting || isDone}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              isDone
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Action (L5)...</span>
              </>
            ) : isDone ? (
              <>
                <Check className="w-4 h-4" />
                <span>Executed & Synced!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Authorize & Execute Action</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
