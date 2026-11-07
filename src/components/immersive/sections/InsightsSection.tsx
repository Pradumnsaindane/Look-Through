import React from 'react';
import { Reveal, SectionHead, StateBox } from '../ui';
import type { SectionCtx } from '../types';

const sevClass = (s: string) => /crit|high|danger|error/i.test(s) ? 'lt-pill-bad' : /warn|attention|medium/i.test(s) ? 'lt-pill-warn' : '';

export const InsightsSection: React.FC<{ ctx: SectionCtx }> = ({ ctx }) => {
  const { data, sessionState } = ctx;
  const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const wrap = (render: () => React.ReactNode) =>
    sessionState === 'initializing' || (sessionState === 'authenticated' && ctx.isLoading) ? <StateBox kind="loading" />
    : sessionState !== 'authenticated' ? <StateBox kind="guest" body="Insights come from your organization's records." />
    : ctx.error ? <StateBox kind="error" title="Could not load" body={ctx.error.message} onRetry={() => ctx.mutate()} />
    : render();
  const pending = data?.counts.pending_expenses;
  return (
    <section id="insights" className="lt-section" aria-labelledby="lt-in-h">
      <SectionHead eyebrow="Insights & activity" title="What happened, and what needs a decision" body="Only what your persisted records support: no placeholders." />
      <h3 id="lt-in-h" className="lt-sr">Insights, alerts and activity</h3>
      <div className="lt-grid lt-grid-3">
        <Reveal className="lt-glass lt-card"><h3>Insights</h3>
          {wrap(() => data?.insights.length ? <ul className="lt-list">{data.insights.slice(0, 4).map(i => <li key={i.id} className="lt-row"><div className="lt-row-main"><div className="lt-row-title" style={{ whiteSpace: 'normal' }}>{i.title}</div><div className="lt-row-sub">{i.summary}</div></div><span className={`lt-pill ${sevClass(i.severity)}`}>{i.severity}</span></li>)}</ul> : <StateBox kind="empty" title="No insights yet" body="Insights are generated from your data as it grows." />)}
        </Reveal>
        <Reveal delay={90} className="lt-glass lt-card"><h3>Alerts &amp; decisions</h3>
          {wrap(() => <>
            {data?.alerts.length ? <ul className="lt-list">{data.alerts.slice(0, 4).map(a => <li key={a.id} className="lt-row"><div className="lt-row-main"><div className="lt-row-title" style={{ whiteSpace: 'normal' }}>{a.title}</div><div className="lt-row-sub">{a.status} · {fmt(a.created_at)}</div></div><span className={`lt-pill ${sevClass(a.severity)}`}>{a.severity}</span></li>)}</ul> : <StateBox kind="empty" title="No active alerts" />}
            <div className="lt-meta">{pending === null || pending === undefined ? <span className="lt-pill lt-pill-warn">Expense approvals unavailable</span> : <span className="lt-pill">{pending} expense{pending === 1 ? '' : 's'} awaiting approval</span>}</div>
          </>)}
        </Reveal>
        <Reveal delay={180} className="lt-glass lt-card"><h3>Recent activity</h3>
          {wrap(() => data?.activity.length ? <ul className="lt-list">{data.activity.slice(0, 5).map(a => <li key={a.id} className="lt-row"><div className="lt-row-main"><div className="lt-row-title">{a.action} {a.entity_type}</div><div className="lt-row-sub">{fmt(a.created_at)}</div></div></li>)}</ul> : <StateBox kind="empty" title="No recent activity" />)}
        </Reveal>
      </div>
    </section>
  );
};
