import React, { useState } from 'react';
import { Activity, CalendarClock, Check, Flag, ListChecks, Target } from 'lucide-react';
import { useBusiness } from '../../../context/BusinessContext';
import { createPersistedTask, updatePersistedTask, usePersistedTasks } from '../../work/tasksApi';
import { Reveal, SectionHead, StateBox } from '../ui';
import type { SectionCtx } from '../types';

const RANK: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const when = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No due date';

export const TodaySection: React.FC<{ ctx: SectionCtx }> = ({ ctx }) => {
  const authed = ctx.sessionState === 'authenticated';
  const { addToast } = useBusiness();
  const tasksRes = usePersistedTasks(authed);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const tasks = tasksRes.data ?? [];

  const guard = async (key: string, fn: () => Promise<unknown>, okTitle: string) => {
    setBusy(key);
    try {
      await fn();
      await tasksRes.mutate();
      await ctx.mutate();
      addToast({ type: 'success', title: okTitle, description: 'Saved to your workspace.' });
      return true;
    } catch (e) {
      addToast({ type: 'error', title: 'Could not save', description: e instanceof Error ? e.message : 'Try again.' });
      return false;
    }
    finally { setBusy(null); }
  };
  const toggle = (id: string, status: string) => guard(id, () => updatePersistedTask(id, { status: status === 'done' ? 'todo' : 'done' }), status === 'done' ? 'Task reopened' : 'Task completed');
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    void guard('new', () => createPersistedTask({ title: t, priority: 'medium' }), 'Task created').then(saved => {
      if (saved) setTitle('');
    });
  };

  const open = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
  const priorities = [...open].sort((a, b) => (RANK[a.priority] - RANK[b.priority]) || String(a.due_at ?? '9').localeCompare(String(b.due_at ?? '9'))).slice(0, 4);
  const deadlines = open.filter(t => t.due_at).sort((a, b) => String(a.due_at).localeCompare(String(b.due_at))).slice(0, 4);
  const done = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const counts = { todo: tasks.filter(t => t.status === 'todo').length, doing: tasks.filter(t => t.status === 'in_progress').length, done };

  const gate = (node: React.ReactNode) => {
    if (ctx.sessionState === 'initializing') return <StateBox kind="loading" />;
    if (!authed) return <StateBox kind="guest" body="Your priorities and tasks are stored per organization." action={<button className="lt-btn lt-btn-primary lt-btn-sm" onClick={ctx.openAuth}>Sign in</button>} />;
    if (tasksRes.isLoading) return <StateBox kind="loading" />;
    if (tasksRes.error) return <StateBox kind="error" title="Tasks could not be loaded" body={tasksRes.error.message} onRetry={() => tasksRes.mutate()} />;
    return node;
  };

  const taskRow = (t: (typeof tasks)[number], sub: string) => (
    <li key={t.id} className="lt-row">
      <button className="lt-check" aria-pressed={t.status === 'done'} aria-label={`${t.status === 'done' ? 'Reopen' : 'Complete'} ${t.title}`} disabled={busy === t.id} onClick={() => toggle(t.id, t.status)}><Check /></button>
      <div className="lt-row-main"><div className="lt-row-title">{t.title}</div><div className="lt-row-sub">{sub}</div></div>
      <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => ctx.openModule('work')} aria-label={`Open ${t.title} in Work`}>Open</button>
    </li>
  );

  return (
    <section id="today" className="lt-section" aria-labelledby="lt-today-h">
      <SectionHead eyebrow="Today" title="Your daily command center" body="What needs you now — priorities, tasks, deadlines and progress, read straight from your workspace." />
      <div className="lt-today">
        <Reveal className="lt-glass lt-card lt-span-3"><h3 id="lt-today-h"><span><Flag style={{ width: 14, verticalAlign: -2 }} /> Priorities</span><span className="lt-pill">{authed ? `${open.length} open` : '—'}</span></h3>
          {gate(priorities.length ? <ul className="lt-list">{priorities.map(t => taskRow(t, `${t.priority} · ${t.status.replace('_', ' ')} · ${when(t.due_at)}`))}</ul> : <StateBox kind="empty" title="No open tasks" body="You're clear. Add one below." />)}
        </Reveal>
        <Reveal delay={90} className="lt-glass lt-card lt-span-3"><h3><span><ListChecks style={{ width: 14, verticalAlign: -2 }} /> Tasks</span><span className="lt-pill">{authed ? `${counts.todo} to do · ${counts.doing} active` : '—'}</span></h3>
          {gate(<>
            <form className="lt-add" onSubmit={add}><input className="lt-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Add a task…" aria-label="New task title" maxLength={200} /><button className="lt-btn lt-btn-primary lt-btn-sm" disabled={!title.trim() || busy === 'new'}>{busy === 'new' ? 'Saving…' : 'Add'}</button></form>
            {open.length ? <ul className="lt-list">{open.slice(0, 4).map(t => taskRow(t, `${t.priority} priority`))}</ul> : <StateBox kind="empty" title="Nothing to do" />}
          </>)}
        </Reveal>
        <Reveal delay={180} className="lt-glass lt-card"><h3><span><CalendarClock style={{ width: 14, verticalAlign: -2 }} /> Meetings</span><span className="lt-pill lt-pill-warn">Unavailable</span></h3>
          <StateBox kind="unavailable" title="No calendar connected" body="Meetings need a calendar integration, which this workspace doesn't have yet. Nothing is shown rather than made up." />
        </Reveal>
        <Reveal delay={240} className="lt-glass lt-card"><h3><span><Target style={{ width: 14, verticalAlign: -2 }} /> Deadlines</span></h3>
          {gate(deadlines.length || ctx.data?.counts.overdue_invoices ? <ul className="lt-list">
            {ctx.data && ctx.data.counts.overdue_invoices > 0 && <li className="lt-row"><span className="lt-pill lt-pill-bad">Overdue</span><div className="lt-row-main"><div className="lt-row-title">{ctx.data.counts.overdue_invoices} invoice{ctx.data.counts.overdue_invoices > 1 ? 's' : ''} past due</div></div><button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={() => ctx.openModule('finance')}>Review</button></li>}
            {deadlines.map(t => <li key={t.id} className="lt-row"><div className="lt-row-main"><div className="lt-row-title">{t.title}</div><div className="lt-row-sub">Due {when(t.due_at)}{new Date(t.due_at as string) < new Date() ? ' · overdue' : ''}</div></div></li>)}
          </ul> : <StateBox kind="empty" title="No deadlines" body="Tasks with a due date appear here." />)}
        </Reveal>
        <Reveal delay={300} className="lt-glass lt-card"><h3><span>Progress</span></h3>
          {gate(tasks.length ? <div style={{ textAlign: 'center' }}><div className="lt-ring" style={{ '--v': pct } as React.CSSProperties} role="img" aria-label={`${pct}% of tasks complete`}><b>{pct}%</b></div><p style={{ fontSize: 13.5, color: 'var(--muted)' }}>{done} of {tasks.length} tasks complete</p></div> : <StateBox kind="empty" title="No tasks yet" body="Progress appears once you have tasks." />)}
        </Reveal>
        <Reveal delay={360} className="lt-glass lt-card lt-span-all"><h3><span><Activity style={{ width: 14, verticalAlign: -2 }} /> Recent activity</span></h3>
          {ctx.sessionState !== 'authenticated' ? <StateBox kind="guest" body="Activity is part of your organization's audit trail." /> :
            ctx.isLoading ? <StateBox kind="loading" /> : ctx.error ? <StateBox kind="error" body={ctx.error.message} onRetry={() => ctx.mutate()} /> :
            ctx.data?.activity.length ? <ul className="lt-list">{ctx.data.activity.slice(0, 4).map(a => <li key={a.id} className="lt-row"><div className="lt-row-main"><div className="lt-row-title">{a.action} {a.entity_type}</div><div className="lt-row-sub">{new Date(a.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div></div></li>)}</ul> : <StateBox kind="empty" title="No recent activity" />}
        </Reveal>
      </div>
    </section>
  );
};
