import { useEffect, useRef } from 'react';
import { animate, useInView, useMotionValue, useReducedMotion, useTransform, m } from 'framer-motion';
import { cn } from './utils';

/* Lightswind — CountUp.
   A number that runs up to its value the first time it is scrolled into
   view.

   Adapted:
   - `useInView` replaces upstream's hand-rolled `IntersectionObserver`,
     and the animation is started from one effect. Upstream runs two
     competing effects over the same motion value — one on the observer, one
     on `[value, animationConfig, hasAnimated, …]` where `animationConfig`
     is a fresh object literal every render, so it re-fires on every render
     and restarts the count.
   - The tween is cancelled on unmount. Upstream returns the observer's
     `disconnect` but never stops the animation itself.
   - Colour and size come from `className`; upstream's `colorSchemes` map
     and `text-black dark:textwhite` default (sic) are gone.
   - Under reduced motion the final value is rendered immediately. */

export interface CountUpProps {
  value: number;
  /** Seconds for the full run. */
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  /** Digits after the decimal point. */
  decimals?: number;
}

export function CountUp({ value, duration = 1.6, className, prefix, suffix, decimals = 0 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  // A ref, not state: setting state here would change this effect's own
  // deps, and the resulting cleanup stops the tween on the very next
  // render — the number sticks at zero.
  const started = useRef(false);

  const count = useMotionValue(0);
  const text = useTransform(count, (v) =>
    v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );

  useEffect(() => {
    if (!inView || started.current || reduced) return;
    started.current = true;
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduced, count, value, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {reduced ? value.toFixed(decimals) : <m.span>{text}</m.span>}
      {suffix}
    </span>
  );
}

export default CountUp;
