import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { cn } from './utils';

/* Lightswind — ThreeDPerspectiveCard.
   A surface that turns to face the pointer, with a specular sweep whose
   angle tracks the approach and a shadow that lags behind the tilt.

   Adapted:
   - Local pointer, not `document`. Upstream binds `mousemove` on the
     document and derives the tilt from the pointer's position in the
     *window*, so every such card on a page tilts in unison no matter where
     it is — and each one re-runs the maths on every move, anywhere. Here the
     card reads its own bounding box and reacts only near itself.
   - Writes are batched into one `requestAnimationFrame`. Upstream restyles
     three elements synchronously inside the event, which on a move-heavy
     pointer is a layout read/write per event.
   - `children` and `preserve-3d`, not a background image. The project card
     is composed of real elements, and children can lift off the surface
     with `translateZ`. Upstream only accepts an image URL.
   - The `<style jsx>` block is gone — that is Next.js's styled-jsx, which
     this Vite project does not have and which would have rendered as
     literal text. Styles are inline and Tailwind.
   - Idle unless a fine pointer is present and motion is allowed; the card
     is a normal flat panel otherwise, not a broken one. */

export interface TiltCardProps {
  children: ReactNode;
  /** Maximum rotation on either axis, in degrees. */
  maxTilt?: number;
  /** Pixels the card floats toward the pointer. */
  float?: number;
  /** Peak opacity of the specular sweep, 0–1. */
  shine?: number;
  /** Distance of the vanishing point. Lower is a stronger perspective. */
  perspective?: number;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
}

export function TiltCard({
  children,
  maxTilt = 9,
  float = 10,
  shine = 0.16,
  perspective = 1100,
  className,
  innerClassName,
  style
}: TiltCardProps) {
  const host = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const gloss = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hostEl = host.current;
    const cardEl = card.current;
    const glossEl = gloss.current;
    const shadowEl = shadow.current;
    if (!hostEl || !cardEl || !glossEl || !shadowEl) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || still.matches) return;

    let raf = 0;
    let px = 0;
    let py = 0;
    let live = false;

    const paint = () => {
      raf = 0;
      const rx = -py * maxTilt;
      const ry = px * maxTilt;

      cardEl.style.transform = live
        ? `translate3d(${px * float}px, ${py * float}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`
        : 'translate3d(0,0,0) rotateX(0deg) rotateY(0deg)';

      const angle = (Math.atan2(py, px) * 180) / Math.PI - 90;
      glossEl.style.background = live
        ? `linear-gradient(${angle}deg, rgb(255 255 255 / ${shine * (0.45 + Math.abs(py) * 0.55)}) 0%, rgb(255 255 255 / 0) 62%)`
        : 'none';

      shadowEl.style.transform = live
        ? `scale(0.94) translate3d(${px * -float * 1.6}px, ${py * -float * 1.2 + 14}px, 0)`
        : 'scale(0.94) translate3d(0, 14px, 0)';
      shadowEl.style.opacity = live ? '0.85' : '0.45';
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = hostEl.getBoundingClientRect();
      if (!r.width) return;

      // Normalised to -1..1 across a box 1.6× the card, so the tilt starts
      // as the pointer approaches rather than snapping on at the edge.
      const nx = (e.clientX - (r.left + r.width / 2)) / ((r.width / 2) * 1.6);
      const ny = (e.clientY - (r.top + r.height / 2)) / ((r.height / 2) * 1.6);

      live = Math.abs(nx) <= 1 && Math.abs(ny) <= 1;
      px = Math.max(-1, Math.min(1, nx));
      py = Math.max(-1, Math.min(1, ny));
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const leave = () => {
      live = false;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, [maxTilt, float, shine]);

  return (
    <div ref={host} className={cn('relative', className)} style={{ perspective, ...style }}>
      <div
        ref={shadow}
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 -z-10 rounded-lg bg-[radial-gradient(60%_60%_at_50%_50%,rgb(79_124_255/0.5),transparent_72%)] opacity-45 blur-2xl transition-[transform,opacity] duration-300 ease-out"
      />
      <div
        ref={card}
        className={cn(
          'relative h-full w-full [transform-style:preserve-3d] transition-transform duration-300 ease-out will-change-transform',
          innerClassName
        )}
      >
        {children}
        <div
          ref={gloss}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-overlay"
        />
      </div>
    </div>
  );
}

export default TiltCard;
