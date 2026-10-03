import React from 'react';

type LookThroughMarkProps = {
  className?: string;
  showWordmark?: boolean;
};

export const LookThroughMark: React.FC<LookThroughMarkProps> = ({ className = '', showWordmark = false }) => (
  <span className={`look-through-mark ${className}`} aria-label="Look Through">
    <svg viewBox="0 0 120 58" role="img" aria-hidden="true" focusable="false">
      <circle cx="29" cy="29" r="25" />
      <circle cx="91" cy="29" r="25" />
      <path d="M54 29c4-10 8-14 12-14s8 4 12 14" />
    </svg>
    {showWordmark && <span className="look-through-wordmark">LOOK THROUGH</span>}
  </span>
);

export default LookThroughMark;
