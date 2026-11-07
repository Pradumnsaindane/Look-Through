import React, { useEffect, useRef, useState } from 'react';

type Props = { paused?: boolean; light?: boolean };

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}
const isLowPower = () => window.innerWidth < 760 || (navigator.hardwareConcurrency ?? 8) <= 4;

/**
 * Single fixed WebGL context behind the whole dashboard. The CSS atmosphere is always rendered
 * underneath, so the page is fully usable while the scene loads, fails, or is unsupported.
 * Decorative only: hidden from assistive tech and never receives pointer events.
 */
export const PlanetBackground: React.FC<Props> = ({ paused = false, light = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<{ setPaused: (v: boolean) => void } | null>(null);
  const pausedRef = useRef(paused);
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading');
  const [reason, setReason] = useState<string | undefined>();
  const fail = (why: string, err?: unknown) => {
    // Useful diagnostic: say which stage failed; the CSS atmosphere keeps the page fully usable.
    console.warn(`[LookThrough] WebGL planet unavailable (${why}); showing CSS atmosphere.`, err ?? '');
    setReason(why); setStatus('fallback');
  };

  useEffect(() => { pausedRef.current = paused; handleRef.current?.setPaused(paused); }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasWebGL()) { fail('WebGL not supported by this browser/device'); return; }
    let cancelled = false;
    let dispose: (() => void) | null = null;
    const getProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    };
    import('./scene/planetScene')
      .then(({ createPlanetScene }) => createPlanetScene({
        canvas, reducedMotion: prefersReduced(), lowPower: isLowPower(), getProgress,
        onContextLost: () => fail('WebGL context lost'),
      }))
      .then((handle) => {
        if (cancelled) { handle.dispose(); return; }
        handleRef.current = handle; dispose = handle.dispose;
        handle.setPaused(pausedRef.current);
        setStatus('live');
      })
      .catch((err) => { if (!cancelled) fail(err instanceof Error ? `scene init failed: ${err.message}` : 'scene init failed (three.js CDN or assets unreachable)', err); });
    return () => { cancelled = true; handleRef.current = null; dispose?.(); };
  }, []);

  return (
    <div className="lt-planet" data-status={status} data-reason={reason} data-light={light ? 'true' : undefined} aria-hidden="true">
      <div className="lt-atmosphere" />
      <canvas ref={canvasRef} className="lt-planet-canvas" />
    </div>
  );
};
export default PlanetBackground;
