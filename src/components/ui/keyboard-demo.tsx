import React from 'react';
import { Keyboard } from './keyboard';

export const KeyboardDemo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full py-4 sm:py-6 ${className}`}>
      <Keyboard />
    </div>
  );
};

export default KeyboardDemo;

