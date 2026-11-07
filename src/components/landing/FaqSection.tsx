import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useReveal } from './useReveal';

const faqs: [string, string][] = [
  ['What does Look Through replace?', 'It gives a team one operating view for meetings, work, learning, and decisions instead of asking everyone to search across disconnected tools.'],
  ['Can I start with an empty workspace?', 'Yes. New workspaces begin empty. You add the records that matter to your team, and demo context stays separate from real data.'],
  ['How does the AI assistant work?', 'The assistant reads authorized records, explains verified signals, and prepares a recommendation for your review. It never silently executes consequential changes.'],
  ['Do I need an accounting integration?', 'No. You can start by recording supported income, expenses, invoices, and payments directly. Integrations are shown only when they are actually configured.'],
  ['Is our data isolated?', 'Records are scoped to the authenticated organization, and every protected operation is checked on the server before it runs.'],
  ['Where can I see pricing?', 'Pricing is shown in the section above as “Content coming soon” until the commercial model is connected — no plan prices or billing claims are invented in the meantime.'],
  ['How do I reach the team?', 'Use the contact form on this page. It validates your message and reports the real submission outcome from the server.'],
];

export const FaqSection: React.FC = () => {
  const ref = useReveal<HTMLElement>();
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" ref={ref} className="story-section story-faq" aria-labelledby="lp-faq-title">
      <div>
        <div className="lp-label">Questions, answered</div>
        <h2 id="lp-faq-title" className="lp-h2">Make the next<br /><em>decision easier.</em></h2>
        <p>Everything worth knowing before bringing your team’s context together.</p>
      </div>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => (
          <div className={`faq-item${open === index ? ' faq-open' : ''}`} key={question}>
            <button
              type="button"
              onClick={() => setOpen(open === index ? -1 : index)}
              aria-expanded={open === index}
              aria-controls={`lp-faq-panel-${index}`}
            >
              <strong>{question}</strong>
              <ChevronDown size={17} aria-hidden="true" />
            </button>
            {open === index && <p id={`lp-faq-panel-${index}`}>{answer}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
