import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LookThroughMark } from '../brand/LookThroughMark';
import { goTo, jumpTo } from './navigation';

type FooterLink = { label: string; kind: 'section'; id: string } | { label: string; kind: 'route'; path: string };

const currentYear = new Date().getFullYear();

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', kind: 'section', id: 'features' },
      { label: 'How it works', kind: 'section', id: 'how-it-works' },
      { label: 'Walkthrough', kind: 'section', id: 'walkthrough' },
      { label: 'Pricing', kind: 'section', id: 'pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', kind: 'section', id: 'about' },
      { label: 'Customers', kind: 'section', id: 'customers' },
      { label: 'Contact', kind: 'section', id: 'contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'FAQ', kind: 'section', id: 'faq' },
      { label: 'Product story', kind: 'route', path: '/intro' },
      { label: 'Open workspace', kind: 'route', path: '/dashboard' },
    ],
  },
  {
    title: 'Legal',
    links: [],
  },
];

export const CtaSection: React.FC = () => {
  return (
    <section className="story-section" aria-labelledby="lp-cta-title">
        <div className="lp-cta lp-reveal">
          <span className="lp-label">Your operating view</span>
          <h2 id="lp-cta-title">See what matters.<br />Act with clarity.</h2>
          <p>
            Start from an empty workspace or explore the product before anyone signs in. Everything on this
            page links to a real destination.
          </p>
          <div className="lp-hero-actions" style={{ marginTop: 4 }}>
            <button type="button" className="lp-pill-btn" onClick={() => goTo('/dashboard')}>
              Open Look Through <ArrowRight size={16} />
            </button>
            <button type="button" className="lp-pill-btn is-ghost" onClick={() => jumpTo('contact')}>
              Talk to the team
            </button>
          </div>
        </div>
      </section>
  );
};

export const LandingFooter: React.FC = () => {
  const handle = (link: FooterLink) => {
    if (link.kind === 'section') jumpTo(link.id);
    else goTo(link.path);
  };

  return (
    <footer className="lp-footer">
        <div className="lp-footer-brand">
          <LookThroughMark showWordmark />
          <p>The connected workspace for teams who run meetings, projects, learning, and operations together.</p>
        </div>

        {columns.map((column) => (
          <div className="lp-footer-col" key={column.title}>
            <b>{column.title}</b>
            {column.links.map((link) => (
              <button type="button" key={link.label} onClick={() => handle(link)}>
                {link.label}
              </button>
            ))}
            {column.title === 'Legal' && <span className="lp-footer-pending">Privacy, terms, and security pages — content coming soon</span>}
          </div>
        ))}

        <div className="lp-footer-base">
          <span>© {currentYear} Look Through. Built for clearer decisions.</span>
          <span>Testimonials, logos, and pricing shown only when verified.</span>
        </div>
      </footer>
  );
};

export default LandingFooter;
