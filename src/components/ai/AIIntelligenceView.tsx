import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { AIInsight } from '../../types';

export const AIIntelligenceView: React.FC = () => {
  const { aiInsights, openAIActionModal } = useBusiness();

  const levels = [
    {
      level: 1,
      name: 'READ',
      desc: 'Observation & Telemetry Ingestion',
      example: '“An invoice is past its due date.”',
      autonomy: 'Passive monitoring',
      badge: 'Zero Risk'
    },
    {
      level: 2,
      name: 'SUGGEST',
      desc: 'Pattern Synthesis & Recommendation',
      example: '“Consider following up on an account.”',
      autonomy: 'Advisory only',
      badge: 'Informational'
    },
    {
      level: 3,
      name: 'PREPARE',
      desc: 'Payload & Artifact Generation',
      example: '“A follow-up draft is ready for review.”',
      autonomy: 'Draft staging',
      badge: 'Staged'
    },
    {
      level: 4,
      name: 'ASK APPROVAL',
      desc: 'Illustrative review stage; no approval workflow is wired',
      example: '“Review this draft. Nothing will be sent.”',
      autonomy: 'Preview only',
      badge: 'Safe Gate'
    },
    {
      level: 5,
      name: 'EXECUTE',
      desc: 'Unavailable — no action connector is configured',
      example: 'No external action is executed.',
      autonomy: 'Not enabled',
      badge: 'Unavailable'
    },
    {
      level: 6,
      name: 'AUTONOMOUS',
      desc: 'Bounded Policy Automation',
      example: 'No automation policy is configured.',
      autonomy: 'Not enabled',
      badge: 'Unavailable'
    },
  ];

  const handleReviewInsight = (insight: AIInsight) => {
    openAIActionModal({
      title: insight.title,
      level: 4,
      source: `AI Intelligence Engine (${insight.type.toUpperCase()})`,
      description: `${insight.whyItMatters} This draft is preview-only; no external action will be sent.`,
      actionDraft: {
        recipient: insight.actionPayload.targetName ? `${insight.actionPayload.targetName} Team` : undefined,
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
            AI insights and action previews
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Read-only questions use organization data. Action drafts are previews only; no external execution is configured.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
          <a href="#ai-insights" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white">
            Insights & Anomalies
          </a>
          <a href="#ai-framework" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white">
            Reference framework
          </a>
        </div>
      </div>

      {/* 6-Level Permission Model Interactive Visualizer */}
      <div id="ai-framework" className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Reference permission framework</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Illustrative only. The current workspace does not enforce these levels or execute actions.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Not enforced
          </span>
        </div>

        {/* Level Cards Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {levels.map(lvl => {
            const isReference = lvl.level === 4;
            return (
              <div
                key={lvl.level}
                className={`p-4 rounded-xl border transition-colors ${
                  isReference
                    ? 'bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500/40'
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
                  {isReference && <span className="font-bold text-indigo-300">Reference</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proactive Insights Section */}
      <div id="ai-insights" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Available AI insights</h2>
            <p className="text-xs text-slate-400">Insight generation is not connected yet.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{aiInsights.length} available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-400">
              No insights are available yet. Read-only business questions are available in the workspace overview.
            </p>
          )}
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
                  onClick={() => handleReviewInsight(insight)}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <span>Review draft</span>
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
