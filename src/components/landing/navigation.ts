/** Client-side navigation helpers for the public landing page. */

let animationFrame: number | null = null;

export function goTo(path: string): void {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Scrolls to a section with an eased rAF animation. Some embedded browsers ignore
 * `behavior: 'smooth'`, so the movement is driven manually and reduced-motion users
 * jump straight to the destination.
 */
export function jumpTo(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  const stickyOffset = 84;
  const startY = window.scrollY;
  const bounds = target.getBoundingClientRect();
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const destination = Math.min(Math.max(bounds.top + startY - stickyOffset, 0), maxScroll);
  const distance = destination - startY;

  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  if (prefersReducedMotion() || Math.abs(distance) < 2) {
    window.scrollTo(0, destination);
    return;
  }

  const duration = Math.min(900, Math.max(380, Math.abs(distance) * 0.3));
  let startedAt: number | null = null;

  const step = (now: number) => {
    if (startedAt === null) startedAt = now;
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, startY + distance * eased);
    animationFrame = progress < 1 ? requestAnimationFrame(step) : null;
  };

  animationFrame = requestAnimationFrame(step);

  // Some embedded or frame-less renderers never fire animation frames, which would
  // leave the page exactly where it was. Fall back to the destination if that happens.
  window.setTimeout(() => {
    if (startedAt === null) {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      window.scrollTo(0, destination);
    }
  }, 250);
}
