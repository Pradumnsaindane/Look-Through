import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { goTo, jumpTo } from './navigation';
import { useReveal } from './useReveal';

type Audience = 'individuals' | 'teams';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    summary: 'For an individual exploring the workspace on their own work.',
    featured: false,
    bullets: ['Overview, today queue, and search', 'Personal meetings, tasks, and projects', 'Guided product walkthrough'],
    cta: 'Open workspace' as const,
  },
  {
    id: 'team',
    name: 'Team',
    summary: 'For a team running shared meetings, projects, and learning in one place.',
    featured: true,
    bullets: ['Shared workspace with roles and permissions', 'Connected meetings, projects, and learning paths', 'AI suggestions with approval steps'],
    cta: 'Open workspace' as const,
  },
  {
    id: 'organization',
    name: 'Organization',
    summary: 'For organizations that need review, rollout, and procurement conversations first.',
    featured: false,
    bullets: ['Everything in Team', 'Rollout and onboarding support', 'Security and review material — content coming soon'],
    cta: 'Contact us' as const,
  },
];

export const PricingSection: React.FC = () => {
  const ref = useReveal<HTMLElement>();
  const [audience, setAudience] = useState<Audience>('teams');

  const runCta = (cta: 'Open workspace' | 'Contact us') => {
    if (cta === 'Open workspace') goTo('/dashboard');
    else jumpTo('contact');
  };

  return (
    <section id="pricing" ref={ref} className="story-section" aria-labelledby="lp-pricing-title">
      <div className="lp-label">Pricing</div>
      <div className="story-split-heading">
        <h2 id="lp-pricing-title" className="lp-h2 lp-reveal">Plans without<br /><em>made-up numbers.</em></h2>
        <div className="lp-reveal">
          <p className="lp-lead">
            Choose who you are shopping for to see what each plan includes. Prices and billing details are
            published only when the commercial model is connected.
          </p>
          <div className="lp-price-switch" role="group" aria-label="Show plans for">
            <button type="button" aria-pressed={audience === 'individuals'} onClick={() => setAudience('individuals')}>
              Individuals
            </button>
            <button type="button" aria-pressed={audience === 'teams'} onClick={() => setAudience('teams')}>
              Teams
            </button>
          </div>
        </div>
      </div>

      <div className="lp-price-grid">
        {plans.map((plan, index) => (
          <article
            className={`lp-price-card${plan.featured ? ' is-featured' : ''}${audience === 'individuals' && plan.id !== 'starter' ? ' is-muted' : ''}`}
            key={plan.id}
            style={{ transitionDelay: `${index * 70}ms` }}
          >
            <h3>{plan.name}</h3>
            <p>{plan.summary}</p>
            <strong className="lp-price-amount">Content coming soon</strong>
            <small className="lp-price-note">No price is shown until it is verified and published.</small>
            <button type="button" className="lp-price-cta" onClick={() => runCta(plan.cta)}>
              {plan.cta} <ArrowRight size={14} style={{ verticalAlign: -2 }} />
            </button>
            <ul>
              {plan.bullets.map((bullet) => (
                <li key={bullet}><Check size={15} aria-hidden="true" /> {bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="lp-note" style={{ display: 'block', marginTop: 26 }}>
        No billing, trial, or discount claims are made until the commercial terms are confirmed.
      </p>
    </section>
  );
};

export default PricingSection;
