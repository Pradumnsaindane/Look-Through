import React from 'react';
import { ArrowRight, BookOpen, CalendarDays, CheckSquare, FolderKanban, NotebookPen, UsersRound } from 'lucide-react';
import { Reveal, SectionHead } from '../ui';
import type { SectionCtx } from '../types';

/**
 * Only Tasks is backed by a working module today. Everything else is labelled unavailable
 * so no control pretends to work and no records are invented.
 */
export const WorkspaceSection: React.FC<{ ctx: SectionCtx }> = ({ ctx }) => {
  const items = [
    { icon: <FolderKanban />, title: 'Projects', body: 'Group work into projects with owners and timelines.', ready: false },
    { icon: <CheckSquare />, title: 'Tasks', body: 'Persisted tasks with priorities, due dates and status you can change right here.', ready: true },
    { icon: <CalendarDays />, title: 'Meetings', body: 'Agendas, notes and follow-ups tied to customers.', ready: false },
    { icon: <NotebookPen />, title: 'Notes', body: 'Shared notes that live next to the work they describe.', ready: false },
    { icon: <BookOpen />, title: 'Learning', body: 'Training and learning paths for your team.', ready: false },
    { icon: <UsersRound />, title: 'Team collaboration', body: 'Assignment, roles and shared visibility across the team.', ready: false },
  ];
  return (
    <section id="workspace" className="lt-section" aria-labelledby="lt-ws-h">
      <SectionHead eyebrow="Workspace" title="Where the work actually happens" body="Productivity tools that sit beside your business data instead of in another tab." />
      <h3 id="lt-ws-h" className="lt-sr">Workspace modules</h3>
      <div className="lt-grid lt-grid-3">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 90} className={`lt-glass lt-card ${it.ready ? 'lt-glass-hover' : ''}`}>
            <span className="lt-card-icon" aria-hidden="true" style={it.ready ? undefined : { opacity: .55 }}>{it.icon}</span>
            <h3>{it.title}</h3><p>{it.body}</p>
            <div className="lt-meta">{it.ready ? <span className="lt-pill lt-pill-live"><i className="lt-dot" />Available</span> : <span className="lt-pill lt-pill-warn">Coming soon</span>}</div>
            {it.ready
              ? <button className="lt-btn lt-btn-outline lt-btn-sm" style={{ marginTop: 16 }} onClick={() => ctx.openModule('work')}>Open Work<ArrowRight /></button>
              : <button className="lt-btn lt-btn-ghost lt-btn-sm" style={{ marginTop: 16 }} disabled aria-disabled="true">Not available yet</button>}
          </Reveal>
        ))}
      </div>
    </section>
  );
};
