import React from 'react';
import { X, Bell, Check, ArrowRight, CheckCircle2, AlertTriangle, IndianRupee, Sparkles } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const NotificationDrawer: React.FC = () => {
  const { 
    isNotificationsOpen, 
    setIsNotificationsOpen, 
    alerts, 
    markAlertRead,
    setActiveTab,
    openAIActionModal
  } = useBusiness();

  if (!isNotificationsOpen) return null;

  const handleActionClick = (alert: typeof alerts[0]) => {
    markAlertRead(alert.id);
    setIsNotificationsOpen(false);

    if (alert.category === 'Financial') {
      setActiveTab('finance');
    } else if (alert.category === 'Customer') {
      setActiveTab('customers');
    } else {
      setActiveTab('alerts');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-100 text-base">Actionable Notifications</h3>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {alerts.map(alert => {
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.isRead
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    : alert.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-500/30 text-slate-200'
                    : alert.severity === 'attention'
                    ? 'bg-amber-950/20 border-amber-500/30 text-slate-200'
                    : 'bg-slate-850/80 border-slate-700/80 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-rose-500' :
                      alert.severity === 'attention' ? 'bg-amber-500' :
                      alert.severity === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {alert.category} · {alert.timestamp}
                    </span>
                  </div>
                  {!alert.isRead && (
                    <button
                      onClick={() => markAlertRead(alert.id)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                <h4 className="font-semibold text-slate-100 text-sm mb-1">{alert.title}</h4>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">{alert.whatHappened}</p>

                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 mb-3">
                  <strong className="text-slate-300">Why it matters: </strong>
                  {alert.whyItMatters}
                </div>

                <button
                  onClick={() => handleActionClick(alert)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs flex items-center justify-between transition-colors"
                >
                  <span>{alert.actionButtonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400">
          All notifications are synchronized with Business OS real-time stream
        </div>
      </div>
    </div>
  );
};
