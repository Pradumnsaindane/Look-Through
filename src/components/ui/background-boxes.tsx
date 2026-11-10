"use client";
import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Aceternity UI `background-boxes` — Look Through adaptation.
 *
 * Registry source: https://ui.aceternity.com/registry/background-boxes.json
 * The upstream implementation renders a 150 × 100 grid (15,000 animated nodes) with a
 * random multi-colour hover palette. That is not viable for a production hero, so this
 * keeps the registry's defining geometry — a skewed, rotated plane of square cells
 * with a plus mark rhythm — while drawing the cell lattice with two CSS gradients and
 * animating a small, deterministic set of illuminated cells. The pointer only feeds a
 * single CSS custom property pair, so there is no per-cell React state.
 *
 * Motion is disabled and the lattice is rendered statically when the user prefers
 * reduced motion.
 */

export interface BackgroundBoxesProps {
  className?: string;
  /** Number of slowly illuminating cells. Kept small on purpose. */
  intensity?: "default" | "reduced";
}

type IlluminatedCell = {
  col: number;
  row: number;
  delay: number;
  duration: number;
  peak: number;
};

// Cell offsets from the plane centre. Spread wide so the lattice reads as a field
// while the hero copy sits inside the calmer middle.
const ILLUMINATED_CELLS: IlluminatedCell[] = [
  { col: -11, row: -5, delay: 0, duration: 11, peak: 0.55 },
  { col: -7, row: 3, delay: 2.4, duration: 13, peak: 0.4 },
  { col: -4, row: -7, delay: 5.1, duration: 12, peak: 0.32 },
  { col: -15, row: 2, delay: 1.2, duration: 14, peak: 0.45 },
  { col: -1, row: 8, delay: 6.8, duration: 12.5, peak: 0.28 },
  { col: 3, row: -8, delay: 3.6, duration: 11.5, peak: 0.36 },
  { col: 6, row: -2, delay: 7.4, duration: 13.5, peak: 0.42 },
  { col: 9, row: 5, delay: 0.8, duration: 12, peak: 0.5 },
  { col: 13, row: -6, delay: 4.4, duration: 14, peak: 0.34 },
  { col: 16, row: 1, delay: 9.2, duration: 12.5, peak: 0.44 },
  { col: 11, row: 9, delay: 2, duration: 13, peak: 0.3 },
  { col: -9, row: 10, delay: 8.4, duration: 15, peak: 0.26 },
];

export const BoxesCore: React.FC<BackgroundBoxesProps> = ({ className = "", intensity = "default" }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const cells = intensity === "reduced" ? ILLUMINATED_CELLS.slice(0, 6) : ILLUMINATED_CELLS;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return;
    if (typeof window === "undefined") return;
    // Pointer illumination only makes sense for a precise, hover-capable device.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let pendingX = 50;
    let pendingY = 34;

    const apply = () => {
      frame = 0;
      root.style.setProperty("--lt-box-x", `${pendingX.toFixed(2)}%`);
      root.style.setProperty("--lt-box-y", `${pendingY.toFixed(2)}%`);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pendingX = ((event.clientX - rect.left) / rect.width) * 100;
      pendingY = ((event.clientY - rect.top) / rect.height) * 100;
      if (frame === 0) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [reduce]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`lt-boxes ${reduce ? "is-static" : ""} ${className}`.trim()}
    >
      <div className="lt-boxes-plane-wrap">
        <div className="lt-boxes-plane">
          {cells.map((cell) => (
            <motion.div
              key={`${cell.col}:${cell.row}`}
              className="lt-boxes-cell"
              style={{
                left: `calc(50% + (var(--lt-cell) * ${cell.col}))`,
                top: `calc(50% + (var(--lt-cell) * ${cell.row}))`,
              }}
              initial={reduce ? { opacity: 0.12 } : { opacity: 0 }}
              animate={reduce ? { opacity: 0.12 } : { opacity: [0, cell.peak, 0] }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      duration: cell.duration,
                      delay: cell.delay,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: "easeInOut",
                      times: [0, 0.45, 1],
                    }
              }
            />
          ))}
        </div>
      </div>
      <div className="lt-boxes-aura" />
      <div className="lt-boxes-vignette" />
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);

export default Boxes;
