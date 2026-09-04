import { useEffect, useRef } from 'react';
import { cn } from './utils';

/* Lightswind — CosmicDust.
   Motes drift up through the section, bending toward the pointer and
   leaving a short trail.

   Adapted:
   - Upstream's `sparkle-particles` sibling needs `@tsparticles/react`,
     `@tsparticles/slim` and `@tsparticles/engine` — three packages and a
     runtime engine for an ambient layer. `cosmic-dust` gets the same effect
     from a canvas and nothing else, so that is the one taken.
   - The palette is the site's cyan / blue / violet / magenta rather than
     upstream's cyan / purple / pink / gold, and the light/dark class
     observer is gone: this page has one theme.
   - The loop parks when the section is off-screen or the tab is hidden, and
     it is never started on a coarse pointer, a narrow viewport, or under
     reduced motion. Upstream runs unconditionally for the life of the page.
   - Sized to the device pixel ratio, capped at 2, and re-sized from a
     `ResizeObserver`. Upstream sets `canvas.width = canvas.offsetWidth`,
     which is a CSS-pixel buffer — blurry on any retina display — and
     listens to `window.resize`, missing every layout-driven change.
   - Everything allocated is released on unmount. */

const PALETTE = ['92,225,230', '79,124,255', '139,92,246', '217,70,239'];

export interface ParticleFieldProps {
  /** Motes at 1440px wide. Scaled down on narrower viewports. */
  count?: number;
  /** Multiplier on drift speed. */
  speed?: number;
  /** Radius in px within which the pointer pulls motes toward it. */
  pull?: number;
  className?: string;
}

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  px: number;
  py: number;
};

export function ParticleField({ count = 70, speed = 1, pull = 170, className }: ParticleFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(hover: none), (max-width: 767px)').matches;
    if (still || coarse) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let motes: Mote[] = [];
    const pointer = { x: -9999, y: -9999 };

    const spawn = (seeded: boolean): Mote => ({
      x: Math.random() * w,
      y: seeded ? Math.random() * h : h + 12,
      vx: (Math.random() - 0.5) * 0.32 * speed,
      vy: -(Math.random() * 0.34 + 0.1) * speed,
      size: Math.random() * 1.1 + 0.5,
      color: PALETTE[(Math.random() * PALETTE.length) | 0],
      alpha: Math.random() * 0.4 + 0.25,
      px: 0,
      py: 0
    });

    const measure = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.max(18, Math.round((count * w) / 1440));
      if (motes.length > target) motes.length = target;
      while (motes.length < target) motes.push(spawn(true));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(canvas);

    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || !w) return;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.px = m.x;
        m.py = m.y;

        const dx = pointer.x - m.x;
        const dy = pointer.y - m.y;
        const d = Math.hypot(dx, dy);
        if (d < pull && d > 0.5) {
          const force = (1 - d / pull) * 0.05;
          m.vx += (dx / d) * force;
          m.vy += (dy / d) * force;
        }

        // Bleed the borrowed momentum back off, or the motes end up orbiting.
        m.vx *= 0.985;
        m.vy = m.vy * 0.985 - 0.0022 * speed;

        m.x += m.vx;
        m.y += m.vy;

        if (m.y < -14 || m.x < -14 || m.x > w + 14) {
          motes[i] = spawn(false);
          continue;
        }

        ctx.strokeStyle = `rgba(${m.color},${m.alpha * 0.4})`;
        ctx.lineWidth = m.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(m.px, m.py);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.fillStyle = `rgba(${m.color},${m.alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      motes = [];
    };
  }, [count, speed, pull]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
}

export default ParticleField;
