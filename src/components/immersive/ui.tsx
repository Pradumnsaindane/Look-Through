import React from 'react';
import { RefreshCw } from 'lucide-react';

export const formatMoney = (minor: string | number | null | undefined) =>
  minor === null || minor === undefined ? 'Unavailable' : `Rs ${(Number(minor) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

type RevealProps = { delay?: number; as?: 'div' | 'section' | 'li' | 'p'; className?: string; children: React.ReactNode; id?: string };
/** Element that fades up with a per-element stagger (`--rd`), activated by useRevealScan. */
export const Reveal: React.FC<RevealProps> = ({ delay = 0, as: Tag = 'div', className, children, id }) => (
  <Tag id={id} data-reveal className={className} style={{ '--rd': `${delay}ms` } as React.CSSProperties}>{children}</Tag>
);

export const SectionHead: React.FC<{ eyebrow: string; title: string; body?: string }> = ({ eyebrow, title, body }) => (
  <div className="lt-head">
    <Reveal><span className="lt-eyebrow">{eyebrow}</span></Reveal>
    <Reveal delay={80}><h2>{title}</h2></Reveal>
    {body && <Reveal delay={160}><p>{body}</p></Reveal>}
  </div>
);

type StateKind = 'loading' | 'error' | 'empty' | 'unavailable' | 'guest';
/** One honest state box: loading, API error, no data, unavailable functionality, or guest. */
export const StateBox: React.FC<{ kind: StateKind; title?: string; body?: string; onRetry?: () => void; action?: React.ReactNode }> = ({ kind, title, body, onRetry, action }) => {
  if (kind === 'loading') return <div className="lt-state" role="status" aria-live="polite"><div className="lt-skeleton" /><div className="lt-skeleton" style={{ width: '70%' }} /><span className="lt-sr">Loading</span></div>;
  const fallback: Record<Exclude<StateKind, 'loading'>, string> = {
    error: 'This could not be loaded', empty: 'Nothing here yet', unavailable: 'Not available yet', guest: 'Sign in to see this',
  };
  return (
    <div className="lt-state" role={kind === 'error' ? 'alert' : undefined}>
      <strong>{title ?? fallback[kind]}</strong>
      {body}
      {(onRetry || action) && <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onRetry && <button className="lt-btn lt-btn-outline lt-btn-sm" onClick={onRetry}><RefreshCw />Retry</button>}
        {action}
      </div>}
    </div>
  );
};
