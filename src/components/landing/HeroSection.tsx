import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CalendarDays, Command, FolderKanban, Layers3, Network, Play, Sparkles, Users } from 'lucide-react';

import { goTo, jumpTo } from './navigation';

type PreviewTab = 'overview' | 'today' | 'meetings' | 'projects' | 'learning';

const tabs: { id: PreviewTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'today', label: 'Today' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'projects', label: 'Projects' },
  { id: 'learning', label: 'Learning' },
];

const railIcons: Record<PreviewTab, typeof Layers3> = {
  overview: Network,
  today: Layers3,
  meetings: CalendarDays,
  projects: FolderKanban,
  learning: Users,
};

const bars = [38, 54, 44, 70, 58, 80, 66, 92, 74, 86];

const OverviewPanel: React.FC = () => (
  <>
    <div className="lp-stat-row">
      <div className="lp-stat">
        <small>Focus today</small>
        <strong>08</strong>
        <em className="is-warn">3 need attention</em>
      </div>
      <div className="lp-stat">
        <small>Open work</small>
        <strong>24</strong>
        <em className="is-up">6 shipping this week</em>
      </div>
      <div className="lp-stat">
        <small>Decisions pending</small>
        <strong>03</strong>
        <em>Awaiting your approval</em>
      </div>
    </div>
    <div className="lp-preview-lower">
      <div className="lp-mini-card lp-chart">
        <small>Activity this month</small>
        <div className="lp-bars" aria-hidden="true">
          {bars.map((height, index) => (
            <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 60}ms` }} />
          ))}
        </div>
      </div>
      <div className="lp-mini-card lp-next">
        <small>Next best action</small>
        <strong>Review the two overdue invoices</strong>
        <p>Both accounts have context attached. Open the record before sending a reminder.</p>
        <button type="button" onClick={() => goTo('/dashboard')}>
          Review action <ArrowRight size={13} />
        </button>
      </div>
    </div>
  </>
);

const TodayPanel: React.FC = () => (
  <div className="lp-list">
    <div className="lp-list-item"><span className="lp-dot crit" /><b>Invoice approval is blocking payroll</b><span>CRITICAL</span></div>
    <div className="lp-list-item"><span className="lp-dot crit" /><b>Client has not replied in 5 days</b><span>HIGH</span></div>
    <div className="lp-list-item"><span className="lp-dot info" /><b>Client strategy meeting at 2:30 PM</b><span>UPCOMING</span></div>
    <div className="lp-list-item"><span className="lp-dot info" /><b>Two expenses need your decision</b><span>DECISION</span></div>
    <div className="lp-list-item"><span className="lp-dot ok" /><b>Sprint retro notes are ready to share</b><span>DONE</span></div>
  </div>
);

const MeetingsPanel: React.FC = () => (
  <>
    <div className="lp-list">
      <div className="lp-list-item"><span className="lp-dot info" /><b>Weekly planning — 09:30</b><span>6 ATTENDEES</span></div>
      <div className="lp-list-item"><span className="lp-dot info" /><b>Client strategy review — 14:30</b><span>AGENDA READY</span></div>
      <div className="lp-list-item"><span className="lp-dot ok" /><b>Design critique — 16:00</b><span>NOTES DRAFTED</span></div>
    </div>
    <div className="lp-preview-lower">
      <div className="lp-mini-card">
        <small>Before the meeting</small>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: 'var(--story-muted)' }}>
          Open items, last decisions, and related projects are collected into a short briefing.
        </p>
      </div>
      <div className="lp-mini-card">
        <small>After the meeting</small>
        <div className="lp-chip-row" style={{ marginTop: 4 }}>
          <span className="lp-chip is-live">Action items</span>
          <span className="lp-chip">Owners</span>
          <span className="lp-chip">Due dates</span>
        </div>
      </div>
    </div>
  </>
);

const ProjectsPanel: React.FC = () => (
  <>
    <div className="lp-kanban">
      <div>
        <h4>Planned</h4>
        <p>Onboarding refresh</p>
        <p>Docs restructure</p>
      </div>
      <div>
        <h4>In progress</h4>
        <p>Billing migration</p>
        <p>Q4 launch plan</p>
      </div>
      <div>
        <h4>Review</h4>
        <p>Pricing page copy</p>
      </div>
    </div>
    <div className="lp-stat-row" style={{ marginTop: 12 }}>
      <div className="lp-stat"><small>Active projects</small><strong>05</strong><em>2 at risk</em></div>
      <div className="lp-stat"><small>Tasks this week</small><strong>17</strong><em className="is-up">11 completed</em></div>
      <div className="lp-stat"><small>Blocked</small><strong>02</strong><em className="is-warn">Needs a decision</em></div>
    </div>
    <div className="lp-mini-card" style={{ marginTop: 10 }}>
      <small>Q4 launch plan — 68%</small>
      <div className="lp-progress"><i style={{ width: '68%' }} /></div>
    </div>
  </>
);

const LearningPanel: React.FC = () => (
  <>
    <div className="lp-ring-row">
      {[
        { label: 'Security basics', dash: 44 },
        { label: 'Product onboarding', dash: 96 },
        { label: 'Manager toolkit', dash: 132 },
      ].map((course) => (
        <div className="lp-ring" key={course.label}>
          <svg width="96" height="96" viewBox="0 0 64 64" aria-hidden="true">
            <circle className="lp-ring-track" cx="32" cy="32" r="28" />
            <circle className="lp-ring-fill" cx="32" cy="32" r="28" style={{ ['--dash' as string]: course.dash }} />
          </svg>
          <b>{Math.round(((176 - course.dash) / 176) * 100)}%</b>
          <span>{course.label}</span>
        </div>
      ))}
    </div>
    <div className="lp-mini-card" style={{ marginTop: 18 }}>
      <small>Team learning path</small>
      <div className="lp-chip-row" style={{ marginTop: 4 }}>
        <span className="lp-chip is-live">Continue: Data handling</span>
        <span className="lp-chip">3 modules left</span>
        <span className="lp-chip">Due Friday</span>
      </div>
    </div>
  </>
);

const panels: Record<PreviewTab, React.ReactNode> = {
  overview: <OverviewPanel />,
  today: <TodayPanel />,
  meetings: <MeetingsPanel />,
  projects: <ProjectsPanel />,
  learning: <LearningPanel />,
};

const headings: Record<PreviewTab, { eyebrow: string; title: string }> = {
  overview: { eyebrow: 'Monday · Workspace overview', title: 'What matters right now.' },
  today: { eyebrow: 'Today · Operational triage', title: 'Your attention queue.' },
  meetings: { eyebrow: 'Meetings · Context attached', title: 'Walk in prepared.' },
  projects: { eyebrow: 'Projects · Work in motion', title: 'See what is moving.' },
  learning: { eyebrow: 'Learning · Team growth', title: 'Keep skills progressing.' },
};

const HeroPreview: React.FC = () => {
  const [active, setActive] = useState<PreviewTab>('overview');
  const heading = headings[active];

  return (
    <div className="lp-preview">
      <div className="lp-preview-bar">
        <span /><span /><span />
        <b>Look Through / Workspace preview</b>
        <i>ILLUSTRATIVE</i>
      </div>
      <div className="lp-preview-body">
        <aside className="lp-preview-rail" aria-label="Preview sections">
          <strong><span className="lp-rail-logo">=</span> Look Through</strong>
          <small>WORKSPACE</small>
          {tabs.map(({ id, label }) => {
            const RailIcon = railIcons[id];
            return (
              <button key={id} type="button" className="lp-rail-btn" aria-pressed={active === id} onClick={() => setActive(id)}>
                <RailIcon size={14} /> {label}
              </button>
            );
          })}
        </aside>

        <div className="lp-preview-main">
          <div className="lp-preview-tabs" role="tablist" aria-label="Workspace preview">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`lp-tab-${id}`}
                aria-selected={active === id}
                aria-controls="lp-preview-panel"
                tabIndex={active === id ? 0 : -1}
                onClick={() => setActive(id)}
                onKeyDown={(event) => {
                  const index = tabs.findIndex((tab) => tab.id === active);
                  if (event.key === 'ArrowRight') setActive(tabs[(index + 1) % tabs.length].id);
                  if (event.key === 'ArrowLeft') setActive(tabs[(index - 1 + tabs.length) % tabs.length].id);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="lp-preview-head">
            <div>
              <small>{heading.eyebrow}</small>
              <h2>{heading.title}</h2>
            </div>
            <span className="lp-preview-avatar" aria-hidden="true">LT</span>
          </div>

          <div id="lp-preview-panel" role="tabpanel" aria-labelledby={`lp-tab-${active}`} style={{ marginTop: 18 }}>
            {panels[active]}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeroSection: React.FC = () => {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26, filter: 'blur(14px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="lp-hero" id="preview" aria-labelledby="lp-hero-title">
      <div className="lp-hero-bg" aria-hidden="true">
        <span className="lp-beam lp-beam-one" />
        <span className="lp-beam lp-beam-two" />
        <span className="lp-beam lp-beam-three" />
      </div>

      <div className="lp-hero-inner">
        <motion.p className="lp-kicker" {...fade(0.05)}>
          <i aria-hidden="true" /> LOOK THROUGH / TEAM WORKSPACE
        </motion.p>

        <motion.h1 id="lp-hero-title" {...fade(0.16)}>
          Work, meetings, learning,<br /><em>in one clear view.</em>
        </motion.h1>

        <motion.p className="lp-hero-sub" {...fade(0.28)}>
          Look Through gives corporate teams and learning professionals one connected workspace for projects,
          decisions, and day-to-day operations — with AI assistance that prepares the next step instead of
          taking over.
        </motion.p>

        <motion.div className="lp-hero-actions" {...fade(0.38)}>
          <button type="button" className="lp-pill-btn" onClick={() => goTo('/dashboard')}>
            Open the workspace <ArrowRight size={16} />
          </button>
          <button type="button" className="lp-pill-btn is-ghost" onClick={() => jumpTo('walkthrough')}>
            <Play size={15} /> See the walkthrough
          </button>
        </motion.div>

        <motion.p className="lp-hero-meta" {...fade(0.48)}>
          <span>Illustrative preview — live data appears after sign in</span>
          <span>Meetings · Tasks · Projects · Learning · AI · Operations</span>
        </motion.p>

        <motion.div {...(reduce ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const } })}>
          <HeroPreview />
        </motion.div>

        <div className="lp-hero-meta" style={{ marginTop: 26 }}>
          <span><Command size={12} style={{ verticalAlign: -2 }} /> Command palette on every screen</span>
          <span><Sparkles size={12} style={{ verticalAlign: -2 }} /> AI suggestions with approval steps</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
