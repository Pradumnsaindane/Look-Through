import { useState } from 'react';
import { ArrowDownRight, ArrowRight, Check, Command, Database, Eye, EyeOff, GitBranch, LockKeyhole, Search, ShieldCheck, Sparkles, WalletCards, Workflow } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { blockFrame, CtaLink, Reveal, SectionHeader, useBlockReducedMotion, type BlockToneProps } from './marketing-feature-bento-utils/marketing-kit';

const itemLabels = ['Meeting notes', 'Open task', 'Launch project', 'Decision record'];
const timeline = ['Review notes', 'Link tasks', 'Assign owner', 'Ready to move'];
const bars = [34, 61, 46, 78, 54, 91, 67, 83, 49, 72, 58, 96];

function Tile({ title, description, icon: Icon, children, className, tone = 'default' }: BlockToneProps & {
  title: string;
  description: string;
  icon: typeof GitBranch;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn(blockFrame(className), `lt-bento-${tone}`)}>
      <div className="lt-bento-card-head">
        <span className="lt-bento-icon"><Icon size={17} aria-hidden="true" /></span>
        <span className="lt-bento-note">Illustrative preview</span>
      </div>
      <h3>{title}</h3>
      <p className="lt-bento-description">{description}</p>
      {children}
    </Reveal>
  );
}

export function MarketingFeatureBento() {
  const [step, setStep] = useState(1);
  const [redacted, setRedacted] = useState(true);
  const reduceMotion = useBlockReducedMotion();
  const revealMotion = reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 }, transition: { duration: 0.42 } };

  return (
    <section id="capabilities" className="story-section lt-marketing-bento" aria-labelledby="lt-bento-title">
      <SectionHeader
        eyebrow="Everything in one workspace"
        title={<>Fewer tools.<br /><em>More shared context.</em></>}
        description="Meetings, tasks, projects, and operational records stay connected. These product-tour panels are illustrative—not live workspace data."
      />
      <motion.div className="lt-bento-grid" {...revealMotion}>
        <Tile title="Connected context" description="Follow a piece of work across the records around it, without rebuilding the story." icon={GitBranch} className="lt-bento-featured" tone="accent">
          <div className="lt-context-map" aria-label="Illustration of related workspace records">
            <div className="lt-context-center"><span className="lt-context-pulse" />Client strategy review<small>MEETING</small></div>
            <div className="lt-context-links" aria-hidden="true"><i /><i /><i /></div>
            {itemLabels.slice(1).map((label, index) => <div className={`lt-context-node lt-context-node-${index}`} key={label}><span>{index === 0 ? <Check size={12} /> : index === 1 ? <Workflow size={12} /> : <Sparkles size={12} />}</span>{label}</div>)}
            <span className="lt-demo-caption">Connected-record illustration</span>
          </div>
        </Tile>

        <Tile title="Work, step by step" description="Keep the next decision and its supporting context in view." icon={ArrowRight}>
          <div className="lt-replay">
            <div className="lt-replay-track" aria-label={`Step ${step + 1} of ${timeline.length}`}>
              {timeline.map((label, index) => <button key={label} type="button" className={cn('lt-replay-step', index <= step && 'is-active')} onClick={() => setStep(index)} aria-label={`Show ${label}`} aria-pressed={step === index}><span>{index < step ? <Check size={11} /> : index + 1}</span><small>{label}</small></button>)}
            </div>
            <input aria-label="Select a context step" type="range" min="0" max={timeline.length - 1} value={step} onChange={(event) => setStep(Number(event.target.value))} />
            <p className="lt-replay-state"><span>NOW VIEWING</span>{timeline[step]}</p>
          </div>
        </Tile>

        <Tile title="Signals with a reason" description="Bring attention to what needs action and show the record behind it." icon={Sparkles}>
          <div className="lt-alert-stack">
            <div><span className="lt-alert-mark"><ArrowDownRight size={13} /></span><p><b>Project milestone needs a decision</b><small>2 linked tasks are waiting on review</small></p><span className="lt-alert-count">2</span></div>
            <div><span className="lt-alert-mark is-muted"><WalletCards size={13} /></span><p><b>Invoice follow-up is due</b><small>Source: finance workspace</small></p></div>
            <span className="lt-demo-caption">Sample alerts · not live status</span>
          </div>
        </Tile>

        <Tile title="A clearer view of operations" description="Compare activity over time and spot where attention may be needed." icon={Database}>
          <div className="lt-histogram" role="img" aria-label="Illustrative activity histogram, not live metrics">
            <div className="lt-histogram-bars">{bars.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
            <div className="lt-histogram-axis"><span>EARLIER</span><span>ACTIVITY · ILLUSTRATIVE</span><span>RECENT</span></div>
          </div>
        </Tile>

        <Tile title="AI, with approval built in" description="Suggestions stay reviewable; consequential steps remain yours to approve." icon={ShieldCheck}>
          <div className="lt-code-preview">
            <div className="lt-code-bar"><i /><i /><i /><span>suggestion.ts</span></div>
            <pre><code><span className="lt-code-muted">// Prepared suggestion</span>{'\n'}<span className="lt-code-key">const</span> nextStep = {'{'}{'\n'}  <span className="lt-code-key">action</span>: <span className="lt-code-string">&quot;review&quot;</span>,{'\n'}  <span className="lt-code-key">approval</span>: <span className="lt-code-string">&quot;required&quot;</span>{'\n'}{'}'};</code></pre>
            <span className="lt-approval"><LockKeyhole size={12} /> Nothing happens without approval</span>
          </div>
        </Tile>

        <Tile title="Find it, or start it" description="Use the command palette to search records and begin common actions." icon={Command}>
          <div className="lt-shortcut-demo"><kbd>⌘</kbd><kbd>K</kbd><span>Search or create from anywhere</span></div>
          <div className="lt-search-demo"><Search size={14} /><span>Search your workspace…</span><kbd>↵</kbd></div>
        </Tile>

        <Tile title="Privacy is part of the workflow" description="Sensitive details can be kept out of shared views. This preview demonstrates redaction only." icon={LockKeyhole}>
          <div className="lt-redaction-demo">
            <div className="lt-redaction-head"><span>Customer record</span><button type="button" onClick={() => setRedacted((value) => !value)} aria-pressed={!redacted} aria-label={redacted ? 'Show illustrative private detail' : 'Hide illustrative private detail'}>{redacted ? <Eye size={14} /> : <EyeOff size={14} />}{redacted ? 'Show' : 'Hide'}</button></div>
            <p>Contact: <strong className={cn(redacted && 'is-redacted')}>{redacted ? '••••••••••••' : 'alex@example.test'}</strong></p>
            <span className="lt-demo-caption">Local demo only · no personal data</span>
          </div>
        </Tile>
      </motion.div>
      <div className="lt-bento-footer"><p><span className="lt-footer-check"><Check size={12} /></span>Examples are product-tour illustrations, not live metrics or customer records.</p><CtaLink href="#features">Explore the workspace <ArrowRight size={14} /></CtaLink></div>
    </section>
  );
}

export default MarketingFeatureBento;
