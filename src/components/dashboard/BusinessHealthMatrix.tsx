import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { HealthMetric } from '../../types';

export const BusinessHealthMatrix: React.FC = () => {
  const { healthMetrics, setActiveTab, setFinanceSubTab, setCustomerSubTab, openAIActionModal } = useBusiness();
  const [expandedId, setExpandedId] = useState<string | null>('health-receivables');

  const handleMetricAction = (metric: HealthMetric) => {
    if (metric.targetTab) {
      setActiveTab(metric.targetTab);
      if (metric.id === 'health-receivables') {
        setFinanceSubTab('receivables');
      } else if (metric.id === 'health-pipeline') {
        setCustomerSubTab('deals');
      }
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Telemetry Evidence Engine</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              Deterministic Facts
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5">
            Business Health & Operational Evidence
          </h2>
          <p className="text-xs text-slate-400">
            Every health state is backed by concrete operational data, not ungrounded AI guesses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">
            System Status: <strong className="text-emerald-400">5 Healthy / 2 Attention</strong>
          </div>
        </div>
      </div>

      {/* Health Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {healthMetrics.map(metric => {
          const isExpanded = expandedId === metric.id;
          
          const statusBadgeColor = 
            metric.status === 'healthy' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
            metric.status === 'growing' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
            metric.status === 'stable' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' :
            metric.status === 'normal' ? 'bg-teal-500/15 text-teal-300 border-teal-500/30' :
            metric.status === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' :
            'bg-amber-500/15 text-amber-300 border-amber-500/30';

          return (
            <div
              key={metric.id}
              className={`rounded-xl border transition-all duration-200 cursor-pointer ${
                isExpanded 
                  ? 'bg-slate-950/90 border-blue-500/40 shadow-lg ring-1 ring-blue-500/20' 
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/60'
              }`}
              onClick={() => setExpandedId(isExpanded ? null : metric.id)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {metric.domain}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusBadgeColor}`}>
                    {metric.statusText}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-bold text-slate-100 text-sm">{metric.label}</h3>
                  <span className="font-mono font-bold text-xs text-slate-200">
                    {metric.evidence.primaryValue.split(' ')[0]}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                  {metric.evidence.subtext}
                </p>

                {/* Underlying Evidence Expandable Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs animate-in fade-in duration-150">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                        <span>Evidence Breakdown</span>
                      </div>
                      <div className="text-slate-300 text-[11px]">● {metric.evidence.detail1}</div>
                      <div className="text-slate-300 text-[11px]">● {metric.evidence.detail2}</div>
                    </div>

                    {metric.suggestedAction && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMetricAction(metric);
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-between transition-colors shadow-md shadow-blue-600/20"
                      >
                        <span>{metric.suggestedAction}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>{isExpanded ? 'Click to collapse' : 'Click for raw evidence'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
