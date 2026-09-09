import { useEffect, useRef, useState } from 'react';
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

/* Lightswind — SmoothCursor.
   A spring-followed pointer that leans into its own velocity: it rotates
   toward the direction of travel and stretches along it, so fast movement
   reads as momentum instead of teleporting.

   Adapted:
   - The default arrow SVG is gone, and so is the dot that replaced it.
     This augments the system cursor rather than standing in for it: the
     ring trails behind the real pointer and snaps to magnetic targets,
     while the arrow the visitor's OS draws stays exactly where it is.
     A replacement would mean `cursor: none`, and a spring-followed dot
     is worse than the system cursor for anyone tracking it with any
     difficulty — it lags by design. Upstream's black glyph was also
     invisible on a near-black page. The motion model is upstream's.
   - Velocity, angle and stretch are motion values, not React state.
     Upstream calls `setIsMoving` and `setTrail` from inside a `mousemove`
     handler, re-rendering the whole cursor on every pointer event, and
     keeps a `setTimeout` per move to clear the moving flag.
   - Magnetic targets are resolved from the event's own `target`, not by
     running `document.querySelectorAll(...)` and measuring every match on
     each move — upstream does that at up to 120 Hz.
   - Centring uses negative margins rather than a `translate` pair. Framer
     Motion aliases `x` to `translateX`, so upstream's `translateX: '-50%'`
     alongside an `x` motion value silently discards the position.
   - The ring follows a separate target value that the spring reads, so a
     magnetic snap holds. Writing to the spring directly, as upstream does,
     is undone by the source on the next pointer event.
   - Fine pointers only, and never under reduced motion. */

export interface SmoothCursorProps {
  /** Diameter of the trailing ring, in px. */
  size?: number;
  color?: string;
  /** Elements the ring snaps to and wraps. */
  magneticSelector?: string;
  /** Elements that merely enlarge the ring. */
  hotSelector?: string;
}

export function SmoothCursor({
  size = 34,
  color = 'var(--color-cyan)',
  magneticSelector = '[data-magnetic]',
  hotSelector = 'a,button,summary,[data-hot]'
}: SmoothCursorProps) {
  const reduced = useReducedMotion();
  const [armed, setArmed] = useState(false);
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);
  const [shown, setShown] = useState(false);
  const hotRef = useRef(false);

  // The ring reads a sprung copy of a separate target, so it arrives late —
  // and can be aimed somewhere other than the pointer when a magnet claims
  // it. The system cursor is the thing that lands exactly on the pointer.
  const aimX = useMotionValue(-100);
  const aimY = useMotionValue(-100);
  const ringX = useSpring(aimX, { stiffness: 380, damping: 34, mass: 0.7 });
  const ringY = useSpring(aimY, { stiffness: 380, damping: 34, mass: 0.7 });

  const angle = useMotionValue(0);
  const speed = useMotionValue(0);
  const smoothSpeed = useSpring(speed, { stiffness: 180, damping: 26 });
  const stretch = useTransform(smoothSpeed, [0, 2.4], [1, 1.5], { clamp: true });
  const squash = useTransform(smoothSpeed, [0, 2.4], [1, 0.72], { clamp: true });

  /* Arming is watched, not sampled once. A convertible switched out of
     tablet mode, or a mouse plugged into a tablet, changes the answer
     after mount — and the old code read the query a single time and
     never looked again, so the ring simply never appeared. */
  useEffect(() => {
    if (reduced) {
      setArmed(false);
      return;
    }
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setArmed(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [reduced]);

  useEffect(() => {
    if (!armed) return;

    let lastX = 0;
    let lastY = 0;
    let lastT = performance.now();

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;

      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;

      speed.set(Math.min(3, Math.hypot(dx, dy) / dt));
      // Below a couple of pixels the direction is noise and the ring spins.
      if (Math.hypot(dx, dy) > 2) angle.set((Math.atan2(dy, dx) * 180) / Math.PI);

      const target = e.target as HTMLElement | null;
      const magnet = target?.closest?.(magneticSelector) as HTMLElement | null;

      if (magnet) {
        const r = magnet.getBoundingClientRect();
        aimX.set(r.left + r.width / 2);
        aimY.set(r.top + r.height / 2);
      } else {
        aimX.set(e.clientX);
        aimY.set(e.clientY);
      }

      const isHot = !!magnet || !!target?.closest?.(hotSelector);
      if (isHot !== hotRef.current) {
        hotRef.current = isHot;
        setHot(isHot);
      }
      setShown(true);
    };

    const leave = () => setShown(false);
    const enter = () => setShown(true);
    const press = () => setDown(true);
    const release = () => setDown(false);

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('pointerenter', enter);
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });

    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointerenter', enter);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
    };
  }, [armed, magneticSelector, hotSelector, aimX, aimY, angle, speed]);

  if (!armed) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[300] hidden md:block" aria-hidden="true">
      <m.div
        className="absolute rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderColor: color,
          rotate: angle,
          scaleX: stretch,
          scaleY: squash,
          opacity: shown ? (hot ? 0.95 : 0.5) : 0,
          boxShadow: hot ? `0 0 24px -6px ${color}` : 'none'
        }}
        animate={{ scale: down ? 0.82 : hot ? 1.5 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      />
    </div>
  );
}

export default SmoothCursor;
