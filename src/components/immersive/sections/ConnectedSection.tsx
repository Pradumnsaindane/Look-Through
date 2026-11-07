import React from 'react';
import { ArrowRight, Bell, Plug2, Settings, UserRound } from 'lucide-react';
import { Reveal, SectionHead } from '../ui';
import type { SectionCtx } from '../types';

/**
 * Integration connection state is not verified by any backend endpoint (the in-memory toggle in
 * BusinessContext is not a real connection), so this section deliberately never says "connected".
 */
export const ConnectedSection: React.FC<{ ctx: SectionCtx; dark: boolean; onTheme: () => void }> = ({ ctx, dark, onTheme }) => {
  const authed = ctx.sessionState === 'authenticated';
  const alertCount = ctx.data?.alerts.length;
  return (
    <section id="connected" className="lt-section" aria-labelledby="lt-co-h">
      <SectionHead eyebrow="Connected workspace" title="Tools, alerts and preferences in one place" body="Manage how Look Through connects to the rest of your stack." />
      <h3 id="lt-co-h" className="lt-sr">Integrations, alerts and settings</h3>
      <div className="lt-grid lt-grid-2">
        <Reveal className="lt-glass lt-glass-hover lt-card"><span className="lt-card-icon" aria-hidden="true"><Plug2 /></span><h3>Integrations</h3>
          <p>Banking, accounting, CRM, email and payments. Connection status is verified inside the Integrations module, not guessed here.</p>
          <div className="lt-meta"><span className="lt-pill lt-pill-warn">Status not verified on this page</span></div>
          <button className="lt-btn lt-btn-outline lt-btn-sm" style={{ marginTop: 16 }} onClick={() => ctx.openModule('integrations')}>Open Integrations<ArrowRight /></button>
        </Reveal>
        <Reveal delay={90} className="lt-glass lt-glass-hover lt-card"><span className="lt-card-icon" aria-hidden="true"><Bell /></span><h3>Alerts</h3>
          <p>Overdue invoices, anomalies and anything that needs a decision.</p>
          <div className="lt-meta"><span className={`lt-pill ${authed && alertCount ? 'lt-pill-warn' : ''}`}>{!authed ? 'Requires sign in' : ctx.isLoading ? 'Loading…' : ctx.error ? 'Unavailable' : `${alertCount ?? 0} active`}</span></div>
          <button className="lt-btn lt-btn-outline lt-btn-sm" style={{ marginTop: 16 }} onClick={() => ctx.openModule('alerts')}>Open Alerts<ArrowRight /></button>
        </Reveal>
        <Reveal delay={180} className="lt-glass lt-glass-hover lt-card"><span className="lt-card-icon" aria-hidden="true"><UserRound /></span><h3>Account preferences</h3>
          <p>Your profile, sign-in and personal settings.</p>
          <div className="lt-meta"><span className="lt-pill">{authed ? (ctx.user?.email ?? 'Signed in') : 'Not signed in'}</span></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            <button className="lt-btn lt-btn-outline lt-btn-sm" onClick={() => authed ? ctx.openModule('settings') : ctx.openAuth()}>{authed ? 'Open Settings' : 'Sign in'}<ArrowRight /></button>
            <button className="lt-btn lt-btn-ghost lt-btn-sm" onClick={onTheme} aria-pressed={!dark}>{dark ? 'Switch to light' : 'Switch to dark'}</button>
          </div>
        </Reveal>
        <Reveal delay={270} className="lt-glass lt-glass-hover lt-card"><span className="lt-card-icon" aria-hidden="true"><Settings /></span><h3>Organization preferences</h3>
          <p>Workspace-wide configuration and permissions, available to authorized members.</p>
          <div className="lt-meta"><span className="lt-pill">{authed ? 'Permission-checked' : 'Requires sign in'}</span></div>
          <button className="lt-btn lt-btn-outline lt-btn-sm" style={{ marginTop: 16 }} onClick={() => ctx.openModule('settings')}>Open Settings<ArrowRight /></button>
        </Reveal>
      </div>
    </section>
  );
};
