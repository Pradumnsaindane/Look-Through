/* oxlint-disable react/only-export-components -- this module intentionally groups the component kit helpers. */
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '../../../lib/utils';

type BlockTone = 'default' | 'accent' | 'subtle';
type BlockToneProps = { tone?: BlockTone };

function blockFrame(className?: string) {
  return cn('lt-bento-card', className);
}

function useBlockReducedMotion() {
  return useReducedMotion() ?? false;
}

function Reveal({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('lt-bento-reveal', className)} {...props}>{children}</div>;
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description: ReactNode }) {
  return (
    <div className="lt-bento-heading">
      <div>
        <span className="lp-label">{eyebrow}</span>
        <h2 className="lp-h2">{title}</h2>
      </div>
      <p className="lp-lead">{description}</p>
    </div>
  );
}

function CtaLink({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className="lt-bento-cta" {...props}>{children}</a>;
}

function BlockLink({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props}>{children}</a>;
}

export { blockFrame, BlockLink, CtaLink, Reveal, SectionHeader, useBlockReducedMotion };
export type { BlockTone, BlockToneProps };
