import React from 'react';
import { Quote, Users } from 'lucide-react';
import { useReveal } from './useReveal';
import { DemoVideoPlayer } from './DemoVideoPlayer';

const testimonials = [
  { tag: 'Team story', body: 'Content coming soon', detail: 'Verified customer quotes are published here once approved by the customer.' },
  { tag: 'Rollout story', body: 'Content coming soon', detail: 'We do not publish anonymised numbers or logos that have not been confirmed.' },
  { tag: 'Learning program', body: 'Content coming soon', detail: 'Case studies for learning teams are being prepared with the teams involved.' },
];

const teamRoles = ['Founder', 'Product', 'Engineering', 'Customer success'];

export const ProofSection: React.FC = () => {
  const ref = useReveal<HTMLElement>();

  return (
    <>
      <section id="customers" ref={ref} className="story-section" aria-labelledby="lp-proof-title">
        <div className="lp-label">Evidence over invention</div>
        <div className="story-split-heading">
          <h2 id="lp-proof-title" className="lp-h2 lp-reveal">Proof when it is<br /><em>actually verified.</em></h2>
          <p className="lp-reveal">
            Customer logos, quotes, and metrics only appear here once they have been confirmed by the customer.
            Until then, the proof layer stays clearly labelled.
          </p>
        </div>

        <div className="lp-logo-wall" aria-label="Customer logos — placeholders">
          {['Logo placeholder', 'Logo placeholder', 'Logo placeholder', 'Logo placeholder', 'Logo placeholder', 'Logo placeholder'].map((label, index) => (
            <div className="lp-logo-box" key={index}>{label}</div>
          ))}
        </div>

        <div className="lp-proof-grid">
          {testimonials.map((item, index) => (
            <article className="lp-proof-card lp-reveal" key={item.tag} style={{ transitionDelay: `${index * 80}ms` }}>
              <Quote size={22} aria-hidden="true" />
              <h3>{item.body}</h3>
              <p>{item.detail}</p>
              <footer>{item.tag} — awaiting customer approval</footer>
            </article>
          ))}
        </div>

        <div className="lp-video" aria-label="Product Walkthrough Video" style={{ padding: 0, border: 'none', background: 'transparent', minHeight: 'unset' }}>
          <DemoVideoPlayer />
        </div>
      </section>

      <section id="about" className="story-section" aria-labelledby="lp-about-title">
        <div className="lp-label">About Look Through</div>
        <div className="story-split-heading">
          <h2 id="lp-about-title" className="lp-h2">Built for people who<br /><em>run the work.</em></h2>
          <p className="lp-lead">
            Look Through exists for corporate teams and learning professionals who manage meetings, projects,
            operations, and decisions at the same time — and lose time to the gaps between tools.
          </p>
        </div>

        <div className="lp-team">
          {teamRoles.map((role) => (
            <article className="lp-team-card" key={role}>
              <span className="lp-team-avatar" aria-hidden="true"><Users size={20} /></span>
              <strong>Content coming soon</strong>
              <small>{role}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};

export default ProofSection;
