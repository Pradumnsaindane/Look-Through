import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  ArrowRight, 
  Link as LinkIcon, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Users, 
  IndianRupee, 
  Briefcase, 
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBusiness } from '../../context/BusinessContext';
import { Task } from '../../types';

export const WorkView: React.FC = () => {
  const { 
    tasks, 
    completeTask, 
    setIsCreateModalOpen,
    workSubTab,
    setWorkSubTab
  } = useBusiness();

  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const filteredTasks = tasks.filter(t => {
    if (priorityFilter === 'all') return true;
    return t.priority === priorityFilter;
  });

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Work Domain Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Work & Business Outcomes
          </h1>
          <p className="text-xs text-slate-400">
            Connecting day-to-day operational execution directly to deals, customer health, invoices, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setWorkSubTab('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                workSubTab === 'today' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Today ({pendingCount})
            </button>
            <button
              onClick={() => setWorkSubTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                workSubTab === 'completed' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Outcome Linkage Philosophy Explainer Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">Outcome-Linked Work Model</h4>
            <p className="text-xs text-slate-300">
              Tasks in Business OS are tied to commercial results: 
              <span className="font-mono text-blue-300 ml-1">Task → Customer → Deal → Invoice → Revenue</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="text-emerald-400 font-bold">₹10.5L</span> linked to active tasks
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              priorityFilter === p
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Tasks List with Visual Outcome Chains */}
      <div className="space-y-3.5">
        {filteredTasks.map(task => {
          const isDone = task.status === 'completed';

          return (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/90 border-slate-800 shadow-lg hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => completeTask(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-700 hover:border-blue-500 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {task.title}
                      </h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        task.priority === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        task.priority === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Outcome Linkage Chain Badge Strip */}
                    {(task.customerName || task.dealTitle || task.invoiceNumber || task.potentialRevenue) && (
                      <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-blue-400" />
                          <span>Chain:</span>
                        </span>

                        {task.customerName && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/40 text-blue-300 border border-blue-500/30 text-[11px]">
                            <Users className="w-3 h-3 text-blue-400" />
                            <span>{task.customerName}</span>
                          </span>
                        )}

                        {task.dealTitle && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 border border-purple-500/30 text-[11px]">
                            <Briefcase className="w-3 h-3 text-purple-400" />
                            <span>{task.dealTitle}</span>
                          </span>
                        )}

                        {task.invoiceNumber && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-500/30 text-[11px]">
                            <FileText className="w-3 h-3 text-amber-400" />
                            <span>Inv {task.invoiceNumber}</span>
                          </span>
                        )}

                        {task.potentialRevenue && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
                            <IndianRupee className="w-3 h-3 text-emerald-400" />
                            <span>{task.potentialRevenue}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-slate-300">Due: {task.dueDate}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Assignee: {task.assignedTo}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
