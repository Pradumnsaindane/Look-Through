import React from 'react';
import { useBusiness } from '../../context/BusinessContext';

export const AnalyticsView: React.FC = () => {
  const { analyticsSubTab, setAnalyticsSubTab } = useBusiness();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Business Performance & Deep Analytics</h1>
          <p className="text-xs text-slate-400">Authorized metrics will appear here as persisted business records accumulate.</p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
          {(['performance', 'sales', 'financial', 'customer'] as const).map(tab => (
            <button key={tab} onClick={() => setAnalyticsSubTab(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${analyticsSubTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>{tab}</button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-100">Analytics will appear when data exists</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">This workspace has no persisted analytics dataset yet. Metrics stay blank rather than showing estimates or sample trends.</p>
      </div>
    </div>
  );
};
