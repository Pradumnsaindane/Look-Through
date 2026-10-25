import { ParallaxHeroImages } from './ui/parallax-hero-images';

const images = [
  'https://assets.aceternity.com/components/hero-section-with-mesh-gradient.webp',
  'https://assets.aceternity.com/components/3d-globe.webp',
  'https://assets.aceternity.com/components/keyboard-2.webp',
  'https://assets.aceternity.com/components/hero-1.webp',
  'https://assets.aceternity.com/components/hero-2.webp',
  'https://assets.aceternity.com/components/hero-3.webp',
];

export default function ParallaxHeroImagesDemo() {
  return <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--surface)]">
    <ParallaxHeroImages images={images} />
    <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--ink)] md:text-6xl">A clearer view of the work behind every decision.</h1>
      <p className="max-w-md text-[var(--muted)]">Move your mouse across the page to explore the layered context around your business.</p>
    </div>
  </section>;
}
