import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Bot, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  Send,
  Eye,
  FileCheck
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { AIInsight } from '../../types';

export const AIIntelligenceView: React.FC = () => {
  const { aiInsights, openAIActionModal, aiSubTab, setAISubTab } = useBusiness();
  const [selectedLevel, setSelectedLevel] = useState<number>(4);

  const levels = [
    {
      level: 1,
      name: 'READ',
      desc: 'Observation & Telemetry Ingestion',
      example: '“Your invoice #1019 is 12 days overdue.”',
      autonomy: 'Passive monitoring',
      badge: 'Zero Risk'
    },
    {
      level: 2,
      name: 'SUGGEST',
      desc: 'Pattern Synthesis & Recommendation',
      example: '“You should follow up with Acme Ltd to recover working capital.”',
      autonomy: 'Advisory only',
      badge: 'Informational'
    },
    {
      level: 3,
      name: 'PREPARE',
      desc: 'Payload & Artifact Generation',
      example: '“I have prepared a follow-up email with the payment link ready for review.”',
      autonomy: 'Draft staging',
      badge: 'Staged'
    },
    {
      level: 4,
      name: 'ASK APPROVAL',
      desc: 'Human Authorization Gate (Current Default)',
      example: '“Authorize sending this follow-up email to Acme?”',
      autonomy: 'Explicit confirmation required',
      badge: 'Safe Gate'
    },
    {
      level: 5,
      name: 'EXECUTE',
      desc: 'Deterministic API Dispatch',
      example: '“User clicked Approve → Email dispatched via Gmail connector & logged in CRM.”',
      autonomy: 'Executed upon sign-off',
      badge: 'Deterministic'
    },
    {
      level: 6,
      name: 'AUTONOMOUS',
      desc: 'Bounded Policy Automation',
      example: '“For invoices overdue < ₹20,000, send reminder automatically after 7 days.”',
      autonomy: 'Pre-approved parameters',
      badge: 'High Autonomy'
    },
  ];

  const handleExecuteInsight = (insight: AIInsight) => {
    openAIActionModal({
      title: insight.title,
      level: 4,
      source: `AI Intelligence Engine (${insight.type.toUpperCase()})`,
      description: insight.whyItMatters,
      actionDraft: {
        recipient: insight.actionPayload.targetName ? `${insight.actionPayload.targetName} Team` : 'Designated Stakeholder',
        subject: `Strategic Action: ${insight.title}`,
        content: insight.actionPayload.suggestedContent || insight.suggestedAction,
        payloadType: insight.actionPayload.type,
        amount: insight.actionPayload.amount,
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* AI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Embedded Intelligence Layer
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            AI Intelligence & Permission Governance
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Not a generic sidebar chatbot. Business OS continuously reads telemetry, identifies operational risks, stages executable actions, and respects owner authority gates.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setAISubTab('insights')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              aiSubTab === 'insights' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Insights & Anomalies
          </button>
          <button
            onClick={() => setAISubTab('permissions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              aiSubTab === 'permissions' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            6-Level Governance
          </button>
        </div>
      </div>

      {/* 6-Level Permission Model Interactive Visualizer */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>The 6-Level AI Permission Framework</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict progressive boundaries preventing unverified hallucinations from modifying business state.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Active Guardrail: Level 4 (Ask Approval)
          </span>
        </div>

        {/* Level Cards Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {levels.map(lvl => {
            const isCurrent = selectedLevel === lvl.level;
            return (
              <div
                key={lvl.level}
                onClick={() => setSelectedLevel(lvl.level)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-300 border border-slate-700">
                      L{lvl.level}
                    </span>
                    <span className="font-bold text-xs text-slate-200 tracking-wider">
                      {lvl.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {lvl.badge}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-300 mb-1">{lvl.desc}</div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 italic mb-2 font-mono">
                  {lvl.example}
                </div>

                <div className="text-[10px] text-indigo-300 font-medium flex items-center justify-between">
                  <span>Mode: {lvl.autonomy}</span>
                  {isCurrent && <span className="font-bold text-emerald-400">Selected</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proactive Insights Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Live Proactive AI Insights</h2>
            <p className="text-xs text-slate-400">Contextual anomaly detection and operational triggers</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{aiInsights.length} active insights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map(insight => {
            const severityClass =
              insight.severity === 'warning' ? 'border-amber-500/30 bg-amber-950/10' :
              insight.severity === 'opportunity' ? 'border-emerald-500/30 bg-emerald-950/10' :
              insight.severity === 'anomaly' ? 'border-rose-500/30 bg-rose-950/10' :
              'border-blue-500/30 bg-blue-950/10';

            return (
              <div
                key={insight.id}
                className={`p-5 rounded-2xl border ${severityClass} shadow-lg space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                      {insight.type.toUpperCase()}
                    </span>
                    {insight.metricsHighlight && (
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {insight.metricsHighlight}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-100">
                    {insight.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {insight.summary}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-200">Why this matters: </strong>
                    {insight.whyItMatters}
                  </div>

                  <div className="text-xs text-slate-300">
                    <strong className="text-indigo-300">Suggested Action: </strong>
                    {insight.suggestedAction}
                  </div>
                </div>

                <button
                  onClick={() => handleExecuteInsight(insight)}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <span>{insight.actionButtonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
