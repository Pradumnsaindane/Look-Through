import React from 'react';
import { ArrowRight, FileText, Network, Sparkles, Users, Workflow } from 'lucide-react';
import { useReveal } from './useReveal';

const nodes = ['Meetings', 'Tasks', 'Projects', 'Learning', 'AI insight', 'Decisions'];

const steps = [
  {
    n: '01',
    title: 'Everything lands in one place',
    body: 'Meetings, tasks, projects, learning activity, and operational records arrive in the same workspace instead of scattered across tools.',
  },
  {
    n: '02',
    title: 'Context connects automatically',
    body: 'A task points to the project it moves forward, the meeting it came from, and the decision it depends on — so nobody rebuilds the story by hand.',
  },
  {
    n: '03',
    title: 'The next action is visible',
    body: 'Signals are ranked by what needs attention, and the assistant prepares a recommendation you can review, edit, or approve.',
  },
];

const nodeIcons = [Users, FileText, Workflow, Network, Sparkles, ArrowRight];

export const StorySection: React.FC = () => {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="how-it-works" ref={ref} className="story-section" aria-labelledby="lp-story-title">
      <div className="lp-label">How Look Through works</div>
      <div className="story-split-heading">
        <h2 id="lp-story-title" className="lp-h2 lp-reveal">Stop stitching the story<br /><em>together yourself.</em></h2>
        <p className="lp-reveal">
          Every signal already exists somewhere in your business. Look Through brings it forward at the moment
          someone has to decide — with the evidence attached.
        </p>
      </div>

      <div className="story-graph" aria-hidden="true">
        <div className="graph-line graph-line-one" />
        <div className="graph-line graph-line-two" />
        <div className="graph-core"><span>=</span><strong>LOOK<br />THROUGH</strong></div>
        {nodes.map((label, index) => {
          const Icon = nodeIcons[index];
          return (
            <div className={`graph-node graph-node-${index}`} key={label}>
              <span><Icon /></span>{label}
            </div>
          );
        })}
      </div>
      <p className="story-center-copy">One context. Fewer blind spots. Better next actions.</p>

      <div className="lp-story-grid">
        {steps.map((step, index) => (
          <article className="lp-story-card lp-reveal" key={step.n} style={{ transitionDelay: `${index * 90}ms` }}>
            <b>{step.n}</b>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default StorySection;
