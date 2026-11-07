import React from 'react';
import { useReveal } from './useReveal';

const steps = [
  { n: '01', title: 'Open the workspace', body: 'Start from a single overview that ranks what changed overnight and what needs a decision today.' },
  { n: '02', title: 'Review the queue', body: 'Triage cards group urgent work, upcoming meetings, and pending approvals so attention is spent on purpose.' },
  { n: '03', title: 'Meet with context', body: 'Each meeting carries its agenda, related projects, and open items — before and after the call.' },
  { n: '04', title: 'Act with approval', body: 'The assistant prepares drafts, reminders, and changes. Consequential actions wait for an explicit approval step.' },
  { n: '05', title: 'Measure what moved', body: 'Progress, blockers, and outcomes stay attached to the work that produced them, ready for the next review.' },
];

export const WalkthroughSection: React.FC = () => {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="walkthrough" ref={ref} className="story-section" aria-labelledby="lp-walkthrough-title">
      <div className="lp-label">Product walkthrough</div>
      <div className="story-split-heading">
        <h2 id="lp-walkthrough-title" className="lp-h2 lp-reveal">A day in the<br /><em>workspace.</em></h2>
        <p className="lp-reveal">
          The same workflow runs on a phone between meetings and on a desk at the start of the week — five
          steps, no context switching.
        </p>
      </div>

      <div className="lp-steps">
        {steps.map((step, index) => (
          <article className="lp-step lp-reveal" key={step.n} style={{ transitionDelay: `${index * 70}ms` }}>
            <b>{step.n}</b>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>

      <svg className="lp-beam-path" viewBox="0 0 1200 64" preserveAspectRatio="none" role="presentation" aria-hidden="true">
        <path d="M0,48 C220,4 380,60 600,32 S980,4 1200,40" />
        <circle cx="0" cy="0" r="4" style={{ offsetPath: 'path("M0,48 C220,4 380,60 600,32 S980,4 1200,40")' }} />
      </svg>
    </section>
  );
};

export default WalkthroughSection;
