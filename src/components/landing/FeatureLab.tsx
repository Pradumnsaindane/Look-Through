import React, { useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Check, CheckSquare, FolderKanban, Sparkles, Workflow } from 'lucide-react';

type FeatureId = 'meetings' | 'tasks' | 'projects' | 'learning' | 'ai' | 'operations';

const features: { id: FeatureId; label: string; hint: string; icon: typeof CalendarDays }[] = [
  { id: 'meetings', label: 'Meetings', hint: 'Agendas, notes, actions', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', hint: 'Priorities tied to outcomes', icon: CheckSquare },
  { id: 'projects', label: 'Projects', hint: 'Progress and blockers', icon: FolderKanban },
  { id: 'learning', label: 'Learning', hint: 'Paths, progress, deadlines', icon: BookOpen },
  { id: 'ai', label: 'AI assistant', hint: 'Suggestions with approval', icon: Sparkles },
  { id: 'operations', label: 'Business operations', hint: 'Connected systems', icon: Workflow },
];

const taskItems = [
  { id: 't1', title: 'Send the revised statement of work', meta: 'Linked · Client project' },
  { id: 't2', title: 'Confirm speakers for the November session', meta: 'Linked · Learning program' },
  { id: 't3', title: 'Approve the tooling renewal', meta: 'Linked · Operations' },
];

const projectRows = [
  { name: 'Onboarding refresh', value: 82, note: 'On track' },
  { name: 'Q4 launch plan', value: 64, note: '2 tasks blocked' },
  { name: 'Compliance training rollout', value: 41, note: 'Awaiting review' },
];

const operationKpis = [
  { label: 'Connected systems', value: 'Configured per workspace' },
  { label: 'Records synced', value: 'Shown when connected' },
  { label: 'Open approvals', value: '3 waiting today' },
];

const MeetingsArt: React.FC = () => (
  <div className="lp-art">
    <div className="lp-art-row">
      <span className="lp-art-time">09:30</span>
      <div><strong>Weekly planning</strong><p>Agenda built from last week’s open items</p></div>
      <button type="button" className="lp-act">Open briefing</button>
    </div>
    <div className="lp-art-row">
      <span className="lp-art-time">14:30</span>
      <div><strong>Client strategy review</strong><p>Related projects, decisions, and risks attached</p></div>
      <button type="button" className="lp-act">Open briefing</button>
    </div>
    <div className="lp-transcript" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="lp-chip-row" style={{ marginTop: 14 }}>
      <span className="lp-chip is-live">Action items extracted</span>
      <span className="lp-chip">Owners assigned</span>
      <span className="lp-chip">Notes stay searchable</span>
    </div>
  </div>
);

const ProjectsArt: React.FC = () => (
  <div className="lp-art">
    {projectRows.map((row) => (
      <div className="lp-art-row" key={row.name} style={{ display: 'block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <strong>{row.name}</strong>
          <span className="lp-note">{row.value}%</span>
        </div>
        <div className="lp-progress" style={{ marginTop: 10 }}><i style={{ width: `${row.value}%` }} /></div>
        <p>{row.note}</p>
      </div>
    ))}
  </div>
);

const LearningArt: React.FC = () => (
  <div className="lp-art">
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
    <div className="lp-chip-row" style={{ marginTop: 16 }}>
      <span className="lp-chip is-live">Continue: Data handling</span>
      <span className="lp-chip">3 modules left</span>
      <span className="lp-chip">Team path · November</span>
    </div>
  </div>
);

const OperationsArt: React.FC = () => (
  <div className="lp-art">
    <div className="lp-flow">
      <span className="lp-flow-node">External system</span>
      <ArrowRight size={15} aria-hidden="true" />
      <span className="lp-flow-node">Connector</span>
      <ArrowRight size={15} aria-hidden="true" />
      <span className="lp-flow-node">Validation</span>
      <ArrowRight size={15} aria-hidden="true" />
      <span className="lp-flow-node">Look Through</span>
    </div>
    <div className="lp-mini-rows" style={{ marginTop: 16 }}>
      {operationKpis.map((kpi) => (
        <div key={kpi.label}><b style={{ fontWeight: 600 }}>{kpi.label}</b><span>{kpi.value}</span></div>
      ))}
    </div>
    <p className="lp-note" style={{ marginTop: 14, display: 'block' }}>
      Integrations appear only when they are actually configured
    </p>
  </div>
);

const TasksArt: React.FC<{ done: Set<string>; onToggle: (id: string) => void }> = ({ done, onToggle }) => (
  <div className="lp-art">
    {taskItems.map((task) => {
      const checked = done.has(task.id);
      return (
        <div className="lp-art-row" key={task.id}>
          <button
            type="button"
            className="lp-check"
            aria-pressed={checked}
            aria-label={`${checked ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`}
            onClick={() => onToggle(task.id)}
          >
            <Check size={13} strokeWidth={3} />
          </button>
          <div>
            <strong style={{ textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.6 : 1 }}>{task.title}</strong>
            <p>{task.meta}</p>
          </div>
        </div>
      );
    })}
    <div className="lp-chip-row" style={{ marginTop: 14 }}>
      <span className="lp-chip is-live">{done.size} of {taskItems.length} cleared</span>
      <span className="lp-chip">Ordered by impact</span>
      <span className="lp-chip">Nothing loses its context</span>
    </div>
  </div>
);

const AiArt: React.FC<{ status: 'idle' | 'approved' | 'edited'; onAction: (status: 'approved' | 'edited') => void }> = ({ status, onAction }) => (
  <div className="lp-art">
    <div className="lp-ai-ladder">
      {['READ', 'SUGGEST', 'PREPARE', 'APPROVE', 'EXECUTE'].map((level, index) => (
        <div key={level} className={index === 1 ? 'is-active' : undefined}>{level}</div>
      ))}
    </div>
    <div className="lp-suggest">
      <span className="lp-label">Suggestion · receivables</span>
      <p>Two invoices are past their due date. A reminder draft is prepared for each account, with the last conversation attached.</p>
      <div className="lp-suggest-actions">
        <button type="button" className="is-primary" disabled={status !== 'idle'} onClick={() => onAction('approved')}>
          {status === 'approved' ? 'Approved' : 'Approve reminder'}
        </button>
        <button type="button" disabled={status !== 'idle'} onClick={() => onAction('edited')}>
          {status === 'edited' ? 'Sent to editor' : 'Edit before sending'}
        </button>
      </div>
      {status !== 'idle' && (
        <p className="lp-status-line">
          <Check size={14} aria-hidden="true" />
          {status === 'approved'
            ? 'Queued for your review before anything leaves the workspace.'
            : 'Draft opened for editing — nothing is sent automatically.'}
        </p>
      )}
    </div>
  </div>
);

export const FeatureLab: React.FC = () => {
  const [active, setActive] = useState<FeatureId>('meetings');
  const [done, setDone] = useState<Set<string>>(new Set());
  const [aiStatus, setAiStatus] = useState<'idle' | 'approved' | 'edited'>('idle');

  const select = (id: FeatureId) => {
    setActive(id);
    if (id !== 'ai') setAiStatus('idle');
  };

  const toggleTask = (id: string) =>
    setDone((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const activeFeature = features.find((item) => item.id === active)!;

  const copy: Record<FeatureId, string> = {
    meetings: 'Every meeting opens with its agenda, the projects it touches, and the items still open from last time. Afterwards, notes and action items go straight back into the workspace.',
    tasks: 'Tasks are ordered by impact and keep their link to the project, meeting, or decision they came from, so clearing the list actually moves something.',
    projects: 'Progress is read from the work itself: what shipped, what is blocked, and which decisions are holding the next milestone.',
    learning: 'Learning paths sit beside the work they support, with progress and deadlines visible to the people responsible for them.',
    ai: 'The assistant reads authorized context and prepares a recommendation. Consequential actions stop at an approval step you control.',
    operations: 'Operational records flow through connectors, validation, and a shared model — so the numbers in the workspace can be traced back to their source.',
  };

  const art: Record<FeatureId, React.ReactNode> = {
    meetings: <MeetingsArt />,
    tasks: <TasksArt done={done} onToggle={toggleTask} />,
    projects: <ProjectsArt />,
    learning: <LearningArt />,
    ai: <AiArt status={aiStatus} onAction={setAiStatus} />,
    operations: <OperationsArt />,
  };

  return (
    <section id="features" className="story-section" aria-labelledby="lp-features-title">
      <div className="lp-label">Inside the workspace</div>
      <div className="story-split-heading">
        <div>
          <h2 id="lp-features-title" className="lp-h2">Built for the moments<br /><em>that need clarity.</em></h2>
        </div>
        <p className="lp-lead">
          Six working surfaces, one context. Choose an area to see how it behaves — the panels below are
          interactive illustrations of the product, not screenshots.
        </p>
      </div>

      <div className="lp-lab">
        <div className="lp-lab-tabs" role="tablist" aria-label="Workspace areas" aria-orientation="vertical">
          {features.map(({ id, label, hint, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`lp-lab-tab-${id}`}
              aria-selected={active === id}
              aria-controls="lp-lab-panel"
              tabIndex={active === id ? 0 : -1}
              className="lp-lab-tab"
              onClick={() => select(id)}
              onKeyDown={(event) => {
                const index = features.findIndex((item) => item.id === active);
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') select(features[(index + 1) % features.length].id);
                if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') select(features[(index - 1 + features.length) % features.length].id);
              }}
            >
              <Icon size={18} />
              <span>
                {label}
                <small>{hint}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="lp-lab-panel" id="lp-lab-panel" role="tabpanel" aria-labelledby={`lp-lab-tab-${active}`} tabIndex={0}>
          <div className="lp-lab-panel-head">
            <span className="lp-label">{activeFeature.label}</span>
            <span className="lp-placeholder-tag">Interactive preview</span>
          </div>
          <h3>{activeFeature.label} with the context attached.</h3>
          <p>{copy[active]}</p>
          {art[active]}
        </div>
      </div>
    </section>
  );
};

export default FeatureLab;
