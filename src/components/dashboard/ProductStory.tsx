import React from 'react';
import { LandingPage } from '../landing/LandingPage';

type StoryProps = { onThemeToggle?: () => void; dark?: boolean };

/** Public landing route (`/` and `/intro`) — composed from the landing sections. */
export const ProductStory: React.FC<StoryProps> = ({ dark, onThemeToggle }) => (
  <LandingPage dark={dark} onThemeToggle={onThemeToggle} />
);

export default ProductStory;
