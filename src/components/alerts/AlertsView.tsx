import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { AlertItem } from '../../types';

export const AlertsView: React.FC = () => {
  const { alerts, markAlertRead, setActiveTab, setFinanceSubTab, setCustomerSubTab, openAIActionModal } = useBusiness();
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Financial' | 'Customer' | 'Operations' | 'System'>('All');

  const filteredAlerts = alerts.filter(a => {
    if (selectedCategory === 'All') return true;
    return a.category === selectedCategory;
  });

  const handleExecuteAlert = (alert: AlertItem) => {
    markAlertRead(alert.id);
    if (alert.category === 'Financial') {
      setActiveTab('finance');
      setFinanceSubTab('receivables');
    } else if (alert.category === 'Customer') {
      setActiveTab('customers');
    } else {
      setActiveTab('today');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Centralized Business Alert Hub
          </h1>
          <p className="text-xs text-slate-400">
            Triage system answering: <strong>What happened?</strong> · <strong>Why does it matter?</strong> · <strong>What can I do?</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {(['All', 'Financial', 'Customer', 'Operations', 'System'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Structured Feed */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => {
          const badgeClass =
            alert.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
            alert.severity === 'attention' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
            alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
            'bg-blue-500/20 text-blue-300 border-blue-500/30';

          return (
            <div
              key={alert.id}
              className={`p-6 rounded-2xl border shadow-xl transition-all ${
                alert.isRead
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                    {alert.severity} · {alert.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {alert.timestamp}
                  </span>
                </div>

                {!alert.isRead && (
                  <button
                    onClick={() => markAlertRead(alert.id)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-4">
                {alert.title}
              </h3>

              {/* The 3 Core Diagnostic Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                    1. What happened?
                  </span>
                  <p className="text-slate-300 leading-snug">{alert.whatHappened}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block">
                    2. Why does it matter?
                  </span>
                  <p className="text-slate-300 leading-snug">{alert.whyItMatters}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">
                    3. What can I do?
                  </span>
                  <p className="text-slate-300 leading-snug">{alert.whatCanIDo}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleExecuteAlert(alert)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  <span>{alert.actionButtonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
