import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './navigation';

/**
 * Reveals `.lp-reveal` / `.lp-beam-path` descendants once they enter the viewport.
 * Cleanup disconnects the observer, and reduced-motion users get the final state immediately.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>('.lp-reveal, .lp-beam-path'));
    if (targets.length === 0) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      targets.forEach((node) => node.classList.add('lp-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('lp-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return ref;
}
