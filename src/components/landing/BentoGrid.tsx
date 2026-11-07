import React from 'react';
import { ArrowRight, Command, Layers3, Lock, Network, Shield, Sparkles, Target, Zap } from 'lucide-react';
import { goTo } from './navigation';
import { useReveal } from './useReveal';

const spark = [42, 58, 46, 72, 60, 84, 68, 92, 76, 88];

export const BentoGrid: React.FC = () => {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="capabilities" ref={ref} className="story-section" aria-labelledby="lp-bento-title">
      <div className="lp-label">Everything in one workspace</div>
      <div className="story-split-heading">
        <h2 id="lp-bento-title" className="lp-h2 lp-reveal">Fewer tools.<br /><em>More shared context.</em></h2>
        <p className="lp-reveal">
          The capabilities teams ask for first — search, structure, permissions, and assistance — without
          another silo to maintain.
        </p>
      </div>

      <div className="lp-bento">
        <article className="lp-tile is-wide is-tall lp-reveal">
          <span className="lp-tile-icon"><Network size={18} /></span>
          <h3>Connected context</h3>
          <p>Meetings, tasks, projects, learning, and operational records reference each other, so opening one item reveals the rest of the story.</p>
          <div className="lp-tile-visual lp-mini-rows">
            <div><b style={{ fontWeight: 600 }}>Client strategy review</b><span>MEETING</span></div>
            <div><b style={{ fontWeight: 600 }}>Revise statement of work</b><span>LINKED TASK</span></div>
            <div><b style={{ fontWeight: 600 }}>Q4 launch plan</b><span>PROJECT</span></div>
          </div>
        </article>

        <article className="lp-tile lp-reveal" style={{ transitionDelay: '60ms' }}>
          <span className="lp-tile-icon"><Command size={18} /></span>
          <h3>Search and create anywhere</h3>
          <p>Open a command palette from any screen to find a record or start a new one.</p>
          <div className="lp-tile-visual lp-keycap-row"><span className="lp-keycap">⌘</span><span className="lp-keycap">K</span> opens search</div>
        </article>

        <article className="lp-tile lp-reveal" style={{ transitionDelay: '120ms' }}>
          <span className="lp-tile-icon"><Sparkles size={18} /></span>
          <h3>AI with guardrails</h3>
          <p>Suggestions are separated from actions. Anything consequential waits for approval.</p>
          <div className="lp-tile-visual lp-keycap-row">
            <span className="lp-keycap">READ</span>→<span className="lp-keycap">SUGGEST</span>→<span className="lp-keycap">APPROVE</span>
          </div>
        </article>

        <article className="lp-tile lp-reveal" style={{ transitionDelay: '180ms' }}>
          <span className="lp-tile-icon"><Shield size={18} /></span>
          <h3>Roles and permissions</h3>
          <p>Access is checked on the server for every protected operation, scoped to the organization.</p>
        </article>

        <article className="lp-tile lp-reveal" style={{ transitionDelay: '240ms' }}>
          <span className="lp-tile-icon"><Target size={18} /></span>
          <h3>Evidence-backed signals</h3>
          <p>Every status carries the record it came from instead of a decorative score.</p>
        </article>

        <article className="lp-tile is-wide lp-reveal" style={{ transitionDelay: '120ms' }}>
          <span className="lp-tile-icon"><Zap size={18} /></span>
          <h3>Operational activity at a glance</h3>
          <p>Track the shape of the week — what is moving, what stalled, and what is waiting on a decision.</p>
          <div className="lp-tile-visual lp-spark" aria-hidden="true">
            {spark.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
          </div>
        </article>

        <article className="lp-tile lp-reveal" style={{ transitionDelay: '180ms' }}>
          <span className="lp-tile-icon"><Lock size={18} /></span>
          <h3>Private by default</h3>
          <p>Records are scoped to the authenticated organization, with personal responses kept non-cacheable.</p>
        </article>

        <article className="lp-tile lp-reveal" style={{ transitionDelay: '240ms' }}>
          <span className="lp-tile-icon"><Layers3 size={18} /></span>
          <h3>Integrations when you need them</h3>
          <p>Connected tools are listed only when they are actually configured for your workspace.</p>
          <div className="lp-tile-visual"><span className="lp-placeholder-tag">Connection status — content coming soon</span></div>
        </article>
      </div>

      <p style={{ marginTop: 34 }}>
        <button type="button" className="lp-linkish" onClick={() => goTo('/dashboard')}>
          Open the workspace to see it with your own context <ArrowRight size={14} />
        </button>
      </p>
    </section>
  );
};

export default BentoGrid;
