import React from 'react';
import { ArrowRight, Command, Plus, Search, Sparkles } from 'lucide-react';
import { useBusiness } from '../../../context/BusinessContext';
import { Reveal } from '../ui';
import type { SectionCtx } from '../types';

const greeting = () => { const h = new Date().getHours(); return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

export const HeroSection: React.FC<{ ctx: SectionCtx }> = ({ ctx }) => {
  const { setIsCommandMenuOpen, setIsCreateModalOpen } = useBusiness();
  const { sessionState, user, data } = ctx;
  const name = user?.name || user?.email?.split('@')[0];
  return (
    <header id="hero" className="lt-hero" aria-labelledby="lt-hero-title">
      <div className="lt-hero-inner">
        <Reveal delay={0}>
          <p className="lt-hero-greet">
            <span className="lt-dot" style={{ color: 'var(--accent)' }} aria-hidden="true" />
            {sessionState === 'authenticated'
              ? <span>{greeting()}, <b>{name}</b>{data ? ' · workspace data loaded' : ''}</span>
              : sessionState === 'initializing' ? <span>Restoring your session…</span>
              : <span>Welcome to <b>Look Through</b> · guest preview</span>}
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h1 id="lt-hero-title" className="lt-hero-title">Your entire business.<br />One intelligent <em>workspace.</em></h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="lt-hero-sub">Everything you need to understand your business, manage your work, and move forward — connected in one place.</p>
        </Reveal>
        <Reveal delay={300}>
          <div className="lt-actions">
            <button className="lt-btn lt-btn-primary" onClick={() => ctx.goSection('today')}>Enter the workspace <ArrowRight /></button>
            <button className="lt-btn lt-btn-outline" onClick={() => setIsCommandMenuOpen(true)} aria-label="Open global search and command palette"><Search />Search or run a command <Command style={{ width: 13, height: 13 }} />K</button>
          </div>
          <div className="lt-actions" style={{ marginTop: 14 }}>
            <button className="lt-btn lt-btn-ghost" onClick={() => ctx.goSection('ai')}><Sparkles />Ask the AI layer</button>
            <button className="lt-btn lt-btn-ghost" onClick={() => setIsCreateModalOpen(true)}><Plus />Quick create</button>
            {sessionState === 'guest' && <button className="lt-btn lt-btn-ghost" onClick={ctx.openAuth}>Sign in</button>}
          </div>
        </Reveal>
        {sessionState === 'guest' && (
          <Reveal delay={420}>
            <p className="lt-hero-note">You can explore freely. Business data, saved changes and AI actions are tied to an organization, so they unlock after you sign in. No organization data is shown to guests.</p>
          </Reveal>
        )}
      </div>
      <div className="lt-scroll-cue" aria-hidden="true"><span>Scroll<i /></span></div>
    </header>
  );
};
