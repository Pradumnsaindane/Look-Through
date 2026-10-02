import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  User, 
  CheckCircle2, 
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { Deal } from '../../types';

export const SalesPipelineKanban: React.FC = () => {
  const { deals, advanceDealStage, openAIActionModal } = useBusiness();

  const stages: { key: Deal['stage']; label: string; color: string }[] = [
    { key: 'lead', label: 'LEADS', color: 'border-blue-500/50' },
    { key: 'qualified', label: 'QUALIFIED', color: 'border-cyan-500/50' },
    { key: 'proposal', label: 'PROPOSAL', color: 'border-purple-500/50' },
    { key: 'negotiation', label: 'NEGOTIATION', color: 'border-amber-500/50' },
    { key: 'won', label: 'WON', color: 'border-emerald-500/50' },
  ];

  const getStageTotal = (stageKey: Deal['stage']) => {
    const stageDeals = deals.filter(d => d.stage === stageKey);
    const sum = stageDeals.reduce((acc, curr) => acc + curr.value, 0);
    return {
      count: stageDeals.length,
      amount: sum,
      formatted: `₹${(sum / 100000).toFixed(1)}L`
    };
  };

  const handleNudgeStaleDeal = (deal: Deal) => {
    openAIActionModal({
      title: `Nudge Stale Opportunity: ${deal.customerName}`,
      level: 3,
      source: 'Sales Velocity Copilot',
      description: `Opportunity (${deal.formattedValue}) has had no recorded team activity for ${deal.lastContactDaysAgo} days.`,
      actionDraft: {
        recipient: `${deal.customerName} Executive Team`,
        subject: `Follow-up: ${deal.title} — Next Steps`,
        content: `Hi Team,\n\nI wanted to check in regarding the proposal we shared for ${deal.title}.\n\nDo you have any questions on the delivery roadmap or budget breakdown? We have slots open this month.\n\nBest,\n${deal.assignedTo}`,
        payloadType: 'deal_nudge',
        targetId: deal.id,
        amount: deal.formattedValue
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Pipeline Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stages.slice(0, 4).map(s => {
          const stats = getStageTotal(s.key);
          return (
            <div key={s.key} className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {s.label}
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">{stats.formatted}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stats.count} opportunities</div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto custom-scrollbar pb-4 min-w-[900px]">
        {stages.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.key);
          const stageStats = getStageTotal(stage.key);

          return (
            <div key={stage.key} className="flex flex-col bg-slate-950/60 rounded-2xl border border-slate-800/80 p-3 min-h-[500px]">
              {/* Column Header */}
              <div className={`pb-3 mb-3 border-b ${stage.color} flex items-center justify-between`}>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                    {stage.label}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">{stageStats.formatted}</div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {stageDeals.length}
                </span>
              </div>

              {/* Deal Cards */}
              <div className="space-y-3 flex-1">
                {stageDeals.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-slate-800/80 flex items-center justify-center text-xs text-slate-400 text-center p-2">
                    No deals in {stage.label.toLowerCase()}
                  </div>
                ) : (
                  stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-tight">
                          {deal.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-semibold">{deal.customerName}</span>
                        <span className="font-mono font-bold text-xs text-emerald-400">{deal.formattedValue}</span>
                      </div>

                      {/* Stale Warning Pill */}
                      {deal.isStale && stage.key !== 'won' && (
                        <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>No activity for {deal.lastContactDaysAgo}d</span>
                          </div>
                          <button
                            onClick={() => handleNudgeStaleDeal(deal)}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
                          >
                            Nudge
                          </button>
                        </div>
                      )}

                      {/* Stage Progression Buttons */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-[10px] font-mono">{deal.probability}% win prob</span>
                        
                        {stage.key !== 'won' && (
                          <button
                            onClick={() => {
                              const nextStageMap: Record<Deal['stage'], Deal['stage']> = {
                                lead: 'qualified',
                                qualified: 'proposal',
                                proposal: 'negotiation',
                                negotiation: 'won',
                                won: 'won',
                                lost: 'lead'
                              };
                              advanceDealStage(deal.id, nextStageMap[deal.stage]);
                            }}
                            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
