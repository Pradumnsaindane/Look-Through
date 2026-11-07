import React from 'react';
import { ArrowRight, BarChart3, Handshake, IndianRupee, Users } from 'lucide-react';
import { formatMoney, Reveal, SectionHead, StateBox } from '../ui';
import type { SectionCtx } from '../types';
import type { NavigationTab } from '../../../types';

export const OperationsSection: React.FC<{ ctx: SectionCtx }> = ({ ctx }) => {
  const { data, sessionState } = ctx;
  const authed = sessionState === 'authenticated';
  const meta = (live: string | null) => authed ? (ctx.isLoading ? 'Loading…' : ctx.error ? 'Data unavailable' : live ?? 'No data yet') : 'Requires sign in';
  const deals = data?.pipeline.reduce((s, p) => s + p.count, 0);
  const cards: Array<{ tab: NavigationTab; icon: React.ReactNode; title: string; body: string; meta: string }> = [
    { tab: 'customers', icon: <Users />, title: 'Customers', body: 'Profiles, search and filtering, customer creation and detail views.', meta: meta(data ? `${data.counts.customers} customer${data.counts.customers === 1 ? '' : 's'}` : null) },
    { tab: 'customers', icon: <Handshake />, title: 'Deals', body: 'Pipeline stages and opportunity management, from first touch to close.', meta: meta(data ? `${deals} open deal${deals === 1 ? '' : 's'} across ${data.pipeline.length} stage${data.pipeline.length === 1 ? '' : 's'}` : null) },
    { tab: 'finance', icon: <IndianRupee />, title: 'Finance', body: 'Invoices, receivables and financial summaries derived from persisted records.', meta: meta(data ? `${formatMoney(data.financial.revenue_minor)} revenue this month` : null) },
    { tab: 'analytics', icon: <BarChart3 />, title: 'Analytics', body: 'Business metrics from your real records, with honest empty states.', meta: meta(data ? 'Open for live metrics' : null) },
  ];
  const maxCount = Math.max(1, ...(data?.pipeline.map(p => p.count) ?? [1]));
  const stats: Array<[string, string]> = data ? [
    [formatMoney(data.financial.revenue_minor), 'Revenue this month'],
    [String(data.counts.customers), 'Customers on record'],
    [String(data.counts.open_tasks), 'Open tasks'],
    [formatMoney(data.counts.overdue_minor), `Overdue across ${data.counts.overdue_invoices} invoice${data.counts.overdue_invoices === 1 ? '' : 's'}`],
  ] : [];

  return (
    <section id="operations" className="lt-section" aria-labelledby="lt-ops-h">
      <SectionHead eyebrow="Business operations" title="The modules that run the business" body="Customers, deals, finance and analytics — one surface, one source of truth." />
      <div className="lt-grid lt-grid-4" style={{ marginBottom: 'clamp(48px,7vw,88px)' }}>
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 90} className="lt-glass lt-glass-hover lt-card">
            <span className="lt-card-icon" aria-hidden="true">{c.icon}</span>
            <h3>{c.title}</h3><p>{c.body}</p>
            <div className="lt-meta"><span className={`lt-pill ${authed && data ? 'lt-pill-live' : ''}`}>{c.meta}</span></div>
            <button className="lt-btn lt-btn-outline lt-btn-sm" style={{ marginTop: 16 }} onClick={() => ctx.openModule(c.tab)}>Open {c.title}<ArrowRight /></button>
          </Reveal>
        ))}
      </div>

      <div className="lt-split">
        <div>
          <Reveal><span className="lt-eyebrow">Built for momentum</span></Reveal>
          <Reveal delay={90}><h2 id="lt-ops-h" className="lt-h2">See the whole funnel move in real time</h2></Reveal>
          <Reveal delay={180}><p style={{ marginTop: 18, color: 'var(--muted)', fontSize: 18, lineHeight: 1.65 }}>Every stage and every rupee, rendered from your own records — never placeholder figures.</p></Reveal>
          <Reveal delay={270}><div className="lt-actions" style={{ justifyContent: 'inherit' }}><button className="lt-btn lt-btn-primary" onClick={() => ctx.openModule('customers')}>Explore the pipeline <ArrowRight /></button></div></Reveal>
        </div>
        <Reveal delay={160} className="lt-glass lt-glass-strong" >
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <strong>Pipeline by stage</strong>{authed && data && <span className="lt-pill lt-pill-live"><i className="lt-dot" />Live</span>}
            </div>
            {!authed ? <StateBox kind="guest" body="Pipeline data is organization-scoped." action={sessionState === 'guest' ? <button className="lt-btn lt-btn-primary lt-btn-sm" onClick={ctx.openAuth}>Sign in</button> : undefined} />
              : ctx.isLoading ? <StateBox kind="loading" />
              : ctx.error ? <StateBox kind="error" title="Pipeline unavailable" body={ctx.error.message} onRetry={() => ctx.mutate()} />
              : !data?.pipeline.length ? <StateBox kind="empty" title="No deals yet" body="Stages appear once deals exist." />
              : <>
                <div className="lt-bars" role="img" aria-label={`Deals per stage: ${data.pipeline.map(p => `${p.stage} ${p.count}`).join(', ')}`}>
                  {data.pipeline.map((p, i) => <div key={p.stage} className="lt-bar" style={{ height: `${Math.max(6, (p.count / maxCount) * 100)}%`, '--i': i } as React.CSSProperties} />)}
                </div>
                {data.pipeline.map(p => (
                  <div key={p.stage} className="lt-pipe-row">
                    <span style={{ textTransform: 'capitalize' }}>{p.stage.replace(/_/g, ' ')}</span>
                    <div className="lt-track"><div className="lt-fill" style={{ '--w': `${(p.count / maxCount) * 100}%` } as React.CSSProperties} /></div>
                    <b>{p.count}</b>
                  </div>
                ))}
              </>}
          </div>
        </Reveal>
      </div>

      {authed && data && (
        <div className="lt-grid lt-grid-4" style={{ marginTop: 'clamp(48px,7vw,88px)' }}>
          {stats.map(([v, l], i) => <Reveal key={l} delay={i * 80} className="lt-glass lt-stat"><div className="lt-stat-value">{v}</div><div className="lt-stat-label">{l}</div></Reveal>)}
        </div>
      )}
    </section>
  );
};
