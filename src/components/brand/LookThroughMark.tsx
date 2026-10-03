import React from 'react';

type LookThroughMarkProps = {
  className?: string;
  showWordmark?: boolean;
};

export const LookThroughMark: React.FC<LookThroughMarkProps> = ({ className = '', showWordmark = false }) => (
  <span className={`look-through-mark ${className}`} aria-label="Look Through">
    <svg viewBox="0 0 120 58" role="img" aria-hidden="true" focusable="false">
      <path
        d="M54 29a25 25 0 1 1-50 0a25 25 0 1 1 50 0M116 29a25 25 0 1 1-50 0a25 25 0 1 1 50 0M51.5 18c5-8 12-8 17 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    {showWordmark && <span className="look-through-wordmark">LOOK THROUGH</span>}
  </span>
);

export default LookThroughMark;
