import React from 'react';
import { ArrowDown, ArrowRight, BrainCircuit, Check, CircleDollarSign, PlugZap, ShieldCheck, Sparkles, Users, Workflow } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

type Module = {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tone: string;
  metrics: string[];
  detail: string;
};

const modules: Module[] = [
  { eyebrow: '01 / Finance', title: 'Understand your money.', description: 'See revenue, expenses, cash, receivables and financial movement in one place.', icon: CircleDollarSign, tone: 'story-coral', metrics: ['Revenue', 'Liquid cash', 'Receivables', 'Net income'], detail: 'Financial Domain & Treasury' },
  { eyebrow: '02 / Work', title: 'Connect work to outcomes.', description: "Tasks shouldn't exist in isolation. Connect execution to the business results behind it.", icon: Workflow, tone: 'story-lime', metrics: ['Task', 'Customer', 'Deal', 'Invoice → Revenue'], detail: 'Work & Business Outcomes' },
  { eyebrow: '03 / Alerts', title: 'Know what needs attention.', description: 'Turn business events into understandable, actionable alerts.', icon: Sparkles, tone: 'story-gold', metrics: ['What happened?', 'Why it matters', 'What can I do?'], detail: 'Centralized Business Alert Hub' },
  { eyebrow: '04 / Analytics', title: 'Understand the business behind the numbers.', description: 'Go beyond reporting with connected performance, sales, financial and customer intelligence.', icon: BrainCircuit, tone: 'story-blue', metrics: ['Customer LTV', 'Gross margin', 'Net retention', 'Sales cycle'], detail: 'Business Performance & Deep Analytics' },
  { eyebrow: '05 / Integrations', title: 'Bring your business together.', description: 'Connect the tools you already use and create one consistent business context.', icon: PlugZap, tone: 'story-violet', metrics: ['External system', 'Canonical model', 'Business OS'], detail: 'Integration Hub & Canonical Data Architecture' },
  { eyebrow: '06 / Governance', title: 'Control your business environment.', description: 'Manage organization settings, permissions, security and AI governance from one place.', icon: ShieldCheck, tone: 'story-slate', metrics: ['Organization', 'Security & RBAC', 'AI governance', 'Plan & billing'], detail: 'System Configuration & Governance' },
];

const signalLabels = ['Customer', 'Invoice', 'Task', 'Transaction', 'Alert', 'Calendar', 'Analytics'];

export const ProductStory: React.FC = () => {
  const { setActiveTab } = useBusiness();
  return <section className="product-story" aria-label="Discover Look Through">
    <div className="story-hero">
      <div className="story-kicker"><span className="story-pulse" /> Look Through / Overview</div>
      <h1>See what matters.<br /><em>Act with clarity.</em></h1>
      <p>Look Through brings your business data, work and intelligence into one operating view.</p>
      <button className="story-primary" onClick={() => document.getElementById('story-modules')?.scrollIntoView({ behavior: 'smooth' })}>Explore your business <ArrowDown aria-hidden="true" /></button>
      <div className="story-scroll-cue"><ArrowDown aria-hidden="true" /> Scroll to explore</div>
    </div>

    <div className="story-convergence">
      <div className="story-section-label">Look Through</div>
      <h2>Your business.<br /><span>One operating view.</span></h2>
      <div className="signal-field" aria-label="Connected business signals">
        {signalLabels.map((signal, index) => <span key={signal} className={`signal signal-${index + 1}`}>{signal}</span>)}
        <div className="signal-core"><span className="story-pulse" />LOOK<br />THROUGH</div>
      </div>
      <p className="story-center-copy">Everything connected.</p>
    </div>

    <div className="story-audience">
      <div className="story-section-label">Built for the way you work</div>
      <div className="audience-row"><span>Founders</span><strong>Know what deserves your attention.</strong></div>
      <div className="audience-row"><span>Small businesses</span><strong>Understand what is happening across your business.</strong></div>
      <div className="audience-row"><span>Teams</span><strong>Keep customers, work and operations connected.</strong></div>
      <div className="audience-row"><span>Growing MSMEs</span><strong>Turn scattered information into clear decisions.</strong></div>
    </div>

    <div id="story-modules" className="story-module-intro"><div className="story-section-label">The product, in context</div><h2>Every signal has<br /><span>a next step.</span></h2></div>
    <div className="story-modules">
      {modules.map((module) => { const Icon = module.icon; return <article key={module.eyebrow} className={`story-module ${module.tone}`}>
        <div className="story-module-copy"><div className="story-section-label">{module.eyebrow}</div><h3>{module.title}</h3><p>{module.description}</p></div>
        <div className="story-product-surface" aria-label={module.detail}>
          <div className="surface-top"><span className="surface-brand"><span className="story-pulse" /> LOOK THROUGH</span><span className="surface-status">LIVE / DEMO CONTEXT</span></div>
          <div className="surface-heading"><Icon aria-hidden="true" /><div><span className="surface-label">{module.detail}</span><strong>{module.eyebrow.split(' / ')[1]}</strong></div></div>
          <div className="surface-metrics">{module.metrics.map((metric, index) => <div className="surface-metric" key={metric}><span>0{index + 1}</span><strong>{metric}</strong><i /></div>)}</div>
          <div className="surface-footer"><span>CONNECTED CONTEXT</span><ArrowRight aria-hidden="true" /><span>BUSINESS OS</span></div>
        </div>
      </article> })}
    </div>

    <div className="story-connected"><div className="story-section-label">The connected system</div><h2>One business.<br /><span>One context.</span></h2><div className="connected-flow">{['Customers', 'Deals', 'Invoices', 'Finance', 'Work', 'Analytics', 'AI', 'Actions'].map((item, index) => <React.Fragment key={item}><div className="flow-node">{item}</div>{index < 7 && <ArrowRight aria-hidden="true" />}</React.Fragment>)}</div><p>See what is happening. Understand why it matters. Know what to do next.</p></div>

    <div className="story-advantage"><div className="advantage-column"><div className="story-section-label">Without Look Through</div>{['Scattered information', 'Multiple tools', 'Manual searching', 'Disconnected context', 'Reactive decisions'].map(item => <div className="advantage-item muted" key={item}>{item}</div>)}</div><div className="advantage-column"><div className="story-section-label">With Look Through</div>{['Connected information', 'One operating view', 'Business context', 'Prioritized attention', 'Clear next actions'].map(item => <div className="advantage-item" key={item}><Check aria-hidden="true" />{item}</div>)}</div></div>

    <div className="story-ai"><div className="story-section-label">Intelligence on top of context</div><h2>From business data<br /><span>to next action.</span></h2><div className="ai-flow">{['Business data', 'Context', 'AI intelligence', 'Insight', 'Recommended action'].map((item, index) => <div className="ai-step" key={item}><span>0{index + 1}</span><strong>{item}</strong>{index < 4 && <ArrowRight aria-hidden="true" />}</div>)}</div><p className="ai-example">“3 invoices need attention.”<br /><span>AI reads, understands, suggests and prepares.</span></p></div>

    <div className="story-final"><div className="story-final-mark"><Users aria-hidden="true" /></div><div className="story-section-label">Your operating view</div><h2>Now, look through<br /><em>your business.</em></h2><p>Everything connected. Nothing hidden.</p><div className="story-final-actions"><button className="story-primary" onClick={() => setActiveTab('customers')}>Explore Look Through <ArrowRight aria-hidden="true" /></button><button className="story-secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Go to Dashboard</button></div></div>
  </section>;
};

export default ProductStory;

