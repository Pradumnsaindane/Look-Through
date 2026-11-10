import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Bell,
  Plus,
  Layers,
  Users,
  IndianRupee,
} from 'lucide-react';
import { LookThroughMark } from '../brand/LookThroughMark';

/**
 * Illustrative tablet display.
 *
 * This is an intentionally independent light theme: the surrounding website and the
 * dashboard theme provider stay on their own tokens, while this mockup always renders
 * as a white/light business OS (see `.lt-tablet` in landing.css).
 */
export const StoryTabletMockup: React.FC = () => {
  return (
    <div className="lt-tablet relative w-full font-sans select-none antialiased">
      {/* Very subtle screen sheen — kept low so the white display stays clean */}
      <div className="lt-tablet-glare pointer-events-none absolute inset-0 z-10" aria-hidden="true" />

      {/* ---------- 1. Dashboard Header ---------- */}
      <header className="lt-t-header relative z-0 flex items-center justify-between border-b px-3 sm:px-5 py-2.5 sm:py-3">
        {/* Left: Brand Identity, Workspace & Live Indicator */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="flex items-center gap-2">
            <LookThroughMark className="w-5 sm:w-6 lt-t-accent" />
            <span className="lt-t-ink font-mono text-[11px] sm:text-xs font-semibold tracking-wider hidden xs:inline">
              LOOK THROUGH
            </span>
          </div>

          <span className="lt-t-sep h-3.5 w-px hidden sm:block" aria-hidden="true" />

          <div className="hidden sm:flex items-center gap-1.5 min-w-0">
            <span className="lt-t-muted text-[11px] truncate font-medium">Acme Studio</span>
            <span className="lt-t-faint text-[10px]">/</span>
            <span className="lt-t-ink text-[11px] truncate">Operations</span>
          </div>

          <span className="lt-t-live inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium">
            <span className="lt-t-live-dot w-1.5 h-1.5 rounded-full" />
            <span className="hidden md:inline">LIVE SYNC</span>
          </span>
        </div>

        {/* Center: Compact Navigation Tabs */}
        <nav className="lt-t-nav hidden md:flex items-center gap-1 p-1 rounded-lg" aria-label="Tablet navigation">
          <span className="lt-t-nav-active px-2.5 py-1 rounded-[5px] text-[11px] font-medium">Overview</span>
          <span className="lt-t-nav-item px-2.5 py-1 rounded-[5px] text-[11px]">
            Today <b className="lt-t-count text-[10px] font-mono px-1 rounded ml-0.5">3</b>
          </span>
          <span className="lt-t-nav-item px-2.5 py-1 rounded-[5px] text-[11px]">Pipeline</span>
          <span className="lt-t-nav-item px-2.5 py-1 rounded-[5px] text-[11px]">Finance</span>
          <span className="lt-t-nav-item px-2.5 py-1 rounded-[5px] text-[11px]">Intelligence</span>
        </nav>

        {/* Right: Quick Controls, Search, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="lt-t-field hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-[10.5px]">
            <Search className="lt-t-faint w-3 h-3" />
            <span className="lt-t-muted font-mono text-[9.5px]">⌘K Search</span>
          </div>

          <button type="button" className="lt-t-btn hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium">
            <Plus className="lt-t-accent w-3 h-3" />
            <span>Action</span>
          </button>

          <div className="lt-t-icon relative p-1">
            <Bell className="w-3.5 h-3.5" />
            <span className="lt-t-accent-dot absolute top-1 right-1 w-1.5 h-1.5 rounded-full" />
          </div>

          <div className="lt-t-avatar flex items-center justify-center w-6 sm:w-7 h-6 sm:h-7 rounded-full text-[10px] font-mono font-semibold">
            LT
          </div>
        </div>
      </header>

      {/* ---------- Main Tablet Workspace Body ---------- */}
      <div className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        {/* ---------- 2. Business Overview KPI Cards ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {/* Revenue Overview */}
          <div className="lt-t-card p-2.5 sm:p-3">
            <div className="flex items-center justify-between">
              <span className="lt-t-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-wider">Revenue (MTD)</span>
              <TrendingUp className="lt-t-positive w-3 h-3" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="lt-t-ink text-base sm:text-lg md:text-xl font-bold font-mono">₹4.82L</span>
              <span className="lt-t-positive text-[10px] font-mono font-medium">↑ 12.4%</span>
            </div>
            <div className="lt-t-faint mt-1 text-[9.5px] sm:text-[10.5px] truncate">96.4% target · 8 days left</div>
          </div>

          {/* Active Customers */}
          <div className="lt-t-card p-2.5 sm:p-3">
            <div className="flex items-center justify-between">
              <span className="lt-t-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-wider">Active Customers</span>
              <Users className="lt-t-accent w-3 h-3" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="lt-t-ink text-base sm:text-lg md:text-xl font-bold font-mono">248</span>
              <span className="lt-t-positive text-[10px] font-mono font-medium">+18 MTD</span>
            </div>
            <div className="lt-t-faint mt-1 text-[9.5px] sm:text-[10.5px] truncate">82% health score · 0.8% churn</div>
          </div>

          {/* Open Deals / Pipeline */}
          <div className="lt-t-card p-2.5 sm:p-3">
            <div className="flex items-center justify-between">
              <span className="lt-t-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-wider">Sales Pipeline</span>
              <IndianRupee className="lt-t-caution w-3 h-3" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="lt-t-ink text-base sm:text-lg md:text-xl font-bold font-mono">₹16.5L</span>
              <span className="lt-t-muted text-[10px] font-mono">14 deals</span>
            </div>
            <div className="lt-t-faint mt-1 text-[9.5px] sm:text-[10.5px] truncate">3 high-value need contact</div>
          </div>

          {/* Pending Tasks & Focus */}
          <div className="lt-t-card p-2.5 sm:p-3">
            <div className="flex items-center justify-between">
              <span className="lt-t-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-wider">Focus Today</span>
              <Clock className="lt-t-warn w-3 h-3" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="lt-t-ink text-base sm:text-lg md:text-xl font-bold font-mono">08</span>
              <span className="lt-t-warn text-[10px] font-mono font-medium">3 critical</span>
            </div>
            <div className="lt-t-faint mt-1 text-[9.5px] sm:text-[10.5px] truncate">Awaiting your approval</div>
          </div>
        </div>

        {/* ---------- 3. Split Grid: Operational Activity & AI Intelligence ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          {/* Operational Activity (Left - 7 cols on lg) */}
          <div className="lt-t-card lg:col-span-7 flex flex-col justify-between p-3 sm:p-4">
            <div>
              <div className="lt-t-rule-b flex items-center justify-between pb-2.5 border-b">
                <div className="flex items-center gap-2">
                  <Layers className="lt-t-accent w-3.5 h-3.5" />
                  <span className="lt-t-ink font-mono text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                    Operational Priority Queue
                  </span>
                </div>
                <span className="lt-t-faint text-[9.5px] sm:text-[10.5px] font-mono">3 context-attached</span>
              </div>

              {/* Priority Items List */}
              <div className="mt-2.5 space-y-2">
                {/* Item 1: Critical Receivable */}
                <div className="lt-t-row flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-2.5 min-w-0">
                    <span className="lt-t-badge-critical mt-0.5 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold shrink-0">
                      CRITICAL
                    </span>
                    <div className="min-w-0">
                      <p className="lt-t-ink text-[11.5px] sm:text-[12.5px] font-medium truncate">
                        TechCorp Solutions · Invoice #INV-2024-089
                      </p>
                      <p className="lt-t-muted text-[10px] sm:text-[11px] truncate">
                        ₹1,80,000 overdue by 8 days · Payment reminder drafted
                      </p>
                    </div>
                  </div>
                  <button type="button" className="lt-t-btn shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-[11px] font-medium">
                    <span>Review</span>
                    <ArrowRight className="lt-t-faint w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Item 2: Stagnant Deal */}
                <div className="lt-t-row flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-2.5 min-w-0">
                    <span className="lt-t-badge-high mt-0.5 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold shrink-0">
                      HIGH
                    </span>
                    <div className="min-w-0">
                      <p className="lt-t-ink text-[11.5px] sm:text-[12.5px] font-medium truncate">
                        Apex Global · Annual Contract Renewal
                      </p>
                      <p className="lt-t-muted text-[10px] sm:text-[11px] truncate">
                        ₹4,20,000 ARR · Expires in 14 days · No touchpoint in 5d
                      </p>
                    </div>
                  </div>
                  <button type="button" className="lt-t-btn shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-[11px] font-medium">
                    <span>Nudge</span>
                    <ArrowRight className="lt-t-faint w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Item 3: Upcoming Decision */}
                <div className="lt-t-row flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-2.5 min-w-0">
                    <span className="lt-t-badge-decision mt-0.5 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold shrink-0">
                      DECISION
                    </span>
                    <div className="min-w-0">
                      <p className="lt-t-ink text-[11.5px] sm:text-[12.5px] font-medium truncate">
                        Sprint Delivery &amp; Marketing Budget Baseline
                      </p>
                      <p className="lt-t-muted text-[10px] sm:text-[11px] truncate">
                        Today at 3:30 PM · 6 attendees · Context &amp; briefing attached
                      </p>
                    </div>
                  </div>
                  <button type="button" className="lt-t-btn shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-[11px] font-medium">
                    <span>Briefing</span>
                    <ArrowRight className="lt-t-faint w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Micro Project Status bar */}
            <div className="lt-t-rule mt-3 pt-2.5 border-t flex items-center justify-between text-[10px]">
              <span className="lt-t-muted font-mono">Q4 Product Release — 68% complete</span>
              <div className="lt-t-progress w-28 sm:w-36 h-1.5 rounded-full overflow-hidden">
                <div className="lt-t-progress-fill h-full rounded-full w-[68%]" />
              </div>
            </div>
          </div>

          {/* AI Intelligence Panel (Right - 5 cols on lg) — neutral grey/white surfaces */}
          <div className="lt-t-ai lg:col-span-5 flex flex-col justify-between p-3 sm:p-4 rounded-xl relative overflow-hidden">
            <div>
              {/* Header */}
              <div className="lt-t-rule-b flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="lt-t-accent w-3.5 h-3.5" />
                  <span className="lt-t-ink font-mono text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                    AI Intelligence
                  </span>
                </div>
                <span className="lt-t-badge mt-0 text-[8.5px] font-mono px-2 py-0.5 rounded-full">RECOMMENDATION</span>
              </div>

              {/* Business Insight */}
              <div className="mt-2.5">
                <span className="lt-t-faint text-[10px] font-mono uppercase tracking-wider">Working Capital Anomaly</span>
                <p className="lt-t-muted mt-1 text-[11px] sm:text-[12px] leading-relaxed">
                  TechCorp delayed invoice (₹1.80L) and marketing budget acceleration will contract cash runway from{' '}
                  <strong className="lt-t-ink font-semibold">7.4 to 6.2 months</strong> if unresolved by Friday.
                </p>
              </div>

              {/* Suggested Action Box */}
              <div className="lt-t-ai-box mt-2.5 p-2.5 sm:p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="lt-t-positive w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div>
                    <span className="lt-t-ink text-[10.5px] sm:text-[11.5px] font-medium block">
                      Approve contextual payment reminder
                    </span>
                    <span className="lt-t-faint text-[9.5px] sm:text-[10px] block mt-0.5 leading-snug">
                      Tailored draft referencing past 2 deliverable sign-offs ready for review.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="lt-t-btn w-full mt-2.5 py-1.5 px-3 rounded-md text-[10.5px] sm:text-[11px] font-medium flex items-center justify-center gap-1.5"
                >
                  <span>Review &amp; Approve Action</span>
                  <ArrowRight className="lt-t-accent w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Clear Distinction: AI Recommendations vs Verified Business Data */}
            <div className="lt-t-rule mt-3 pt-2 border-t flex items-center justify-between text-[9px] sm:text-[9.5px] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="lt-t-accent-dot w-1.5 h-1.5 rounded-full" />
                <span className="lt-t-muted">AI Synthesized</span>
              </span>
              <span className="lt-t-positive flex items-center gap-1.5 font-medium">
                <span className="lt-t-positive-dot w-1.5 h-1.5 rounded-full" />
                <span>100% Verified Ledger Data</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- 4. Tablet Screen Bottom Status Bar ---------- */}
      <footer className="lt-t-footer flex items-center justify-between border-t px-3 sm:px-5 py-1.5 text-[9px] sm:text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span>Look Through Engine v2.4</span>
          <span className="lt-t-faint hidden sm:inline">•</span>
          <span className="lt-t-muted hidden sm:inline">Bank feeds, Stripe &amp; CRM connected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="lt-t-positive-dot w-1.5 h-1.5 rounded-full" />
          <span className="lt-t-muted">All services operational</span>
        </div>
      </footer>
    </div>
  );
};

export default StoryTabletMockup;
