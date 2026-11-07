import React from 'react';
import './landing.css';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { StorySection } from './StorySection';
import { FeatureLab } from './FeatureLab';
import { BentoGrid } from './BentoGrid';
import { WalkthroughSection } from './WalkthroughSection';
import { ProofSection } from './ProofSection';
import { PricingSection } from './PricingSection';
import { FaqSection } from './FaqSection';
import { ContactSection } from './ContactSection';
import { CtaSection, LandingFooter } from './LandingFooter';

type LandingPageProps = { dark?: boolean; onThemeToggle?: () => void };

export const LandingPage: React.FC<LandingPageProps> = ({ dark, onThemeToggle }) => (
  <div className="story-site">
    <LandingNav dark={dark} onThemeToggle={onThemeToggle} />
    <main>
      <HeroSection />
      <StorySection />
      <FeatureLab />
      <BentoGrid />
      <WalkthroughSection />
      <ProofSection />
      <PricingSection />
      <FaqSection />
      <ContactSection />
      <CtaSection />
    </main>
    <div className="lp-footer-wrap">
      <LandingFooter />
    </div>
  </div>
);

export default LandingPage;
