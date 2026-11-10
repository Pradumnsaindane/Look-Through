import React from 'react';
import { useReveal } from './useReveal';
import { KeyboardDemo } from '../ui/keyboard-demo';

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

      <KeyboardDemo />
    </section>
  );
};

export default WalkthroughSection;
