import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  IndianRupee, 
  PieChart as PieIcon, 
  Target,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useBusiness } from '../../context/BusinessContext';
import { MONTHLY_FINANCIAL_CHART_DATA } from '../../data/mockData';

export const AnalyticsView: React.FC = () => {
  const { analyticsSubTab, setAnalyticsSubTab } = useBusiness();

  const salesByTier = [
    { name: 'Enterprise', value: 45, color: '#3b82f6' },
    { name: 'Mid-Market', value: 35, color: '#6366f1' },
    { name: 'Growth SMB', value: 20, color: '#10b981' },
  ];

  const cohortRetention = [
    { month: 'M0', active: 100 },
    { month: 'M1', active: 94 },
    { month: 'M2', active: 91 },
    { month: 'M3', active: 89 },
    { month: 'M4', active: 88 },
    { month: 'M5', active: 87 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Business Performance & Deep Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Cohort retention, revenue velocity, LTV-to-CAC, and operational profitability metrics.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
          {(['performance', 'sales', 'financial', 'customer'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setAnalyticsSubTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                analyticsSubTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer LTV</div>
          <div className="text-xl font-bold font-mono text-slate-100">₹3.85L</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">3.8x CAC Payback</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gross Margin</div>
          <div className="text-xl font-bold font-mono text-emerald-400">68.4%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">+4.2% YoY</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Net Retention (NRR)</div>
          <div className="text-xl font-bold font-mono text-blue-400">114%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Enterprise seat expansions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sales Cycle</div>
          <div className="text-xl font-bold font-mono text-purple-400">18.4 Days</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">-3.2 days vs Q2</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Profit & Margin Progression */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Net Margin & Profitability Trends
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_FINANCIAL_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₹${v}L`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Bar dataKey="netProfit" fill="#10b981" radius={[4, 4, 0, 0]} name="Net Profit (Lakhs)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Cohort Retention */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            6-Month Client Account Cohort Retention (%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cohortRetention}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} name="Active %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
