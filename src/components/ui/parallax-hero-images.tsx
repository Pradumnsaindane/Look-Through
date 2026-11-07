import React, { memo, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';

type ImagePosition = {
  src: string;
  position: 'top-left' | 'top-right' | 'mid-left' | 'mid-right' | 'bottom-left' | 'bottom-right' | 'far-left' | 'far-right';
  depth: number;
  delay: number;
};

type DepthVariant = 'default' | 'edge-focus';

const positionStyles: Record<ImagePosition['position'], { top: string; left?: string; right?: string }> = {
  'top-left': { top: '8%', left: '4%' },
  'top-right': { top: '8%', right: '4%' },
  'mid-left': { top: '38%', left: '6%' },
  'mid-right': { top: '38%', right: '6%' },
  'bottom-left': { top: '68%', left: '4%' },
  'bottom-right': { top: '68%', right: '4%' },
  'far-left': { top: '52%', left: '2%' },
  'far-right': { top: '52%', right: '2%' },
};

const positionOrder: ImagePosition['position'][] = ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right', 'far-left', 'far-right'];
const depthValues: Record<DepthVariant, number[]> = {
  default: [0.3, 0.35, 0.9, 0.85, 0.4, 0.45, 0.25, 0.2],
  'edge-focus': [0.85, 0.9, 0.3, 0.35, 0.8, 0.85, 0.4, 0.45],
};

export interface ParallaxHeroImagesProps {
  images: string[];
  className?: string;
  imageClassName?: string;
  variant?: DepthVariant;
}

export function ParallaxHeroImages({ images, className = '', imageClassName = '', variant = 'default' }: ParallaxHeroImagesProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 25, stiffness: 120 });
  const smoothMouseY = useSpring(mouseY, { damping: 25, stiffness: 120 });
  const positions = useMemo(() => images.slice(0, 8).map((src, index) => ({ src, position: positionOrder[index], depth: depthValues[variant][index], delay: index * 0.12 })), [images, variant]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set((event.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
    {positions.map((position, index) => <ParallaxImage key={`${position.src}-${index}`} {...position} imageClassName={imageClassName} smoothMouseX={smoothMouseX} smoothMouseY={smoothMouseY} />)}
  </div>;
}

interface ParallaxImageProps extends ImagePosition {
  imageClassName: string;
  smoothMouseX: MotionValue<number>;
  smoothMouseY: MotionValue<number>;
}

const ParallaxImage = memo(function ParallaxImage({ src, position, depth, delay, imageClassName, smoothMouseX, smoothMouseY }: ParallaxImageProps) {
  const translateX = useTransform(smoothMouseX, [-1, 1], [-40 * depth, 40 * depth]);
  const translateY = useTransform(smoothMouseY, [-1, 1], [-40 * depth, 40 * depth]);
  const style = positionStyles[position];

  return <motion.div className="absolute" style={{ ...style, x: translateX, y: translateY, zIndex: Math.round(depth * 10) }} initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.9 }} animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}>
    <img src={src} alt="" loading="lazy" decoding="async" className={`aspect-[4/3] h-20 w-32 rounded-lg object-cover shadow-sm ring-1 ring-black/10 sm:h-40 sm:w-56 md:h-52 md:w-80 ${imageClassName}`} />
  </motion.div>;
});
