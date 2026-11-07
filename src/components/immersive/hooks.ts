import { useEffect, useRef, useState, type RefObject } from 'react';
import { authClient } from '../../auth/neonAuthClient';

export type SessionUser = { name?: string | null; email?: string | null };
export type SessionState = 'initializing' | 'guest' | 'authenticated';

/** Thin wrapper over the existing auth client; never fabricates a user. */
export function useSessionUser(): { state: SessionState; user: SessionUser | null } {
  const session = authClient
    ? (authClient.useSession() as { isPending: boolean; data?: { user?: SessionUser } | null })
    : { isPending: false, data: null };
  if (session.isPending) return { state: 'initializing', user: null };
  const user = session.data?.user ?? null;
  return { state: user ? 'authenticated' : 'guest', user };
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Staggered scroll-reveal: adds `.in` once to each `[data-reveal]` in view (per-element delay via `--rd`).
 * Re-scans when `dep` changes so late-arriving (data-driven) content is picked up.
 */
export function useRevealScan(rootRef: RefObject<HTMLElement | null>, dep: unknown) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)'));
    if (!nodes.length) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [rootRef, dep]);
}

/** Publishes scroll progress (0..1) as `--lt-p` for the CSS atmosphere fallback. rAF-throttled, passive. */
export function useScrollProgressVar(rootRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    let raf = 0;
    const write = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty('--lt-p', String(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(write); };
    write();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [rootRef, enabled]);
}

/** Tracks which section is nearest the upper third of the viewport. */
export function useSectionSpy(ids: string[], enabled: boolean) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');
  const idsRef = useRef(ids);
  idsRef.current = ids;
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
      let best = ''; let bestRatio = 0;
      for (const id of idsRef.current) { const r = visible.get(id) ?? 0; if (r > bestRatio) { best = id; bestRatio = r; } }
      if (best) setActive(best);
    }, { rootMargin: '-30% 0px -45% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    idsRef.current.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [key, enabled]);
  return active;
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}
