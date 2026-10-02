import React from 'react';
import { 
  Plug2, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Database, 
  Server,
  Zap
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const IntegrationsView: React.FC = () => {
  const { integrations, toggleIntegration } = useBusiness();

  const pipelineSteps = [
    { step: 1, title: 'External System', desc: 'SaaS / Bank / CRM' },
    { step: 2, title: 'Connector & Auth', desc: 'OAuth 2.0 / API Key' },
    { step: 3, title: 'Raw Ingestion', desc: 'Webhooks & Pollers' },
    { step: 4, title: 'Validation & Dedupe', desc: 'Schema checks' },
    { step: 5, title: 'Canonical Model', desc: 'Unified Entity Graph' },
    { step: 6, title: 'Business OS', desc: 'Intelligence Layer' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Integration Hub & Canonical Data Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Connect your financial accounts, CRM, calendar, and payment gateways into one normalized operational graph.
        </p>
      </div>

      {/* Canonical Data Architecture Pipeline Visualization */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Canonical Ingestion & Normalization Pipeline
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync Active
          </span>
        </div>

        <p className="text-xs text-slate-300">
          This canonical model ensures every external system (Stripe, Razorpay, Zoho, QuickBooks) maps into unified business entities (Customer, Deal, Invoice, Expense) without schema fragmentation.
        </p>

        {/* Pipeline Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          {pipelineSteps.map((s, idx) => (
            <div key={s.step} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center relative group">
              <div className="text-[10px] font-mono font-bold text-blue-400 mb-1">Step 0{s.step}</div>
              <div className="font-bold text-xs text-slate-100">{s.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Integrations Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Managed Connectors ({integrations.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(int => {
            const isConnected = int.status === 'connected';

            return (
              <div
                key={int.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isConnected
                    ? 'bg-slate-900/90 border-slate-700/80 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 opacity-100'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {int.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">{int.name}</h4>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isConnected
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {isConnected ? 'Connected' : 'Available'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {int.description}
                  </p>

                  <div className="space-y-1">
                    {int.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isConnected && int.lastSynced ? `Synced: ${int.lastSynced}` : 'Standby'}
                  </span>

                  <button
                    onClick={() => toggleIntegration(int.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isConnected
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect Service'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
