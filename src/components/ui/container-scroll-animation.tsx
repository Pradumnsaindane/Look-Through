"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion, type MotionValue, useReducedMotion } from 'motion/react';

export interface ContainerScrollProps {
  titleComponent?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ContainerScroll: React.FC<ContainerScrollProps> = ({
  titleComponent,
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const prefersReduced = useReducedMotion();

  // Start in elevated perspective when entering viewport, smoothly flatten to front-facing as user scrolls into view
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.52, 1],
    prefersReduced ? [0, 0, 0] : isMobile ? [10, 0, 0] : [16, 0, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.52, 1],
    prefersReduced ? [1, 1, 1] : isMobile ? [0.9, 1, 1] : [0.94, 1, 1]
  );
  const translate = useTransform(
    scrollYProgress,
    [0, 0.52, 1],
    prefersReduced ? [0, 0, 0] : isMobile ? [12, 0, 0] : [20, 0, 0]
  );

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center py-6 sm:py-10 md:py-12 ${className}`}
    >
      <div
        className="w-full relative flex flex-col items-center justify-center"
        style={{
          perspective: isMobile ? '800px' : '1100px',
        }}
      >
        {titleComponent && (
          <Header translate={translate} titleComponent={titleComponent} />
        )}
        <Card rotate={rotate} scale={scale} translate={translate}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        y: translate,
      }}
      className="max-w-5xl mx-auto text-center mb-6 sm:mb-8"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  translate,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate?: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        y: translate,
        boxShadow:
          '0 0 0 1px rgba(240, 241, 243, 0.95), 0 1px 0 1px #2B2F38, 0 2px 0 2px #1A1D24, 0 3px 0 3px #121419, 0 25px 60px -10px rgba(0, 0, 0, 0.85), 0 35px 90px -20px rgba(0, 0, 0, 0.95), 0 0 30px -5px rgba(76, 111, 255, 0.08)',
      }}
      className="relative w-full max-w-5xl mx-auto rounded-[24px] sm:rounded-[30px] md:rounded-[36px] bg-gradient-to-b from-[#FAFBFD] via-[#F0F1F3] to-[#E2E4E8] p-2 sm:p-2.5 md:p-3 border border-[#D5D9E0]"
    >
      {/* Front camera sensor indicator on the white bezel */}
      <div className="flex items-center justify-center pb-1 sm:pb-1.5" aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-[#181A20] ring-1 ring-[#888E99]/50" />
      </div>

      {/* Screen container with a light hardware gasket separating bezel from display */}
      <div className="h-full w-full rounded-[15px] sm:rounded-[20px] md:rounded-[25px] overflow-hidden bg-[#FFFFFF] border border-[#C9CFD8] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]">
        {children}
      </div>
    </motion.div>
  );
};

export default ContainerScroll;

