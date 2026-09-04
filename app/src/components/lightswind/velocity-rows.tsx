import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  m,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue
} from 'framer-motion';
import { cn } from './utils';

/* Lightswind — ThreeDScrollTrigger (container + rows).
   Several tracks share one scroll-velocity signal, so stacked rows surge
   together and drift apart by direction. Unlike the percent marquee this
   one measures a copy in pixels, which is what keeps rows of unequal
   content in step.

   Adapted:
   - The container owns the velocity; rows without one render static instead
     of each opening their own `useScroll`. Upstream falls back to a
     per-row subscription, so a page of rows ends up with a scroll listener
     and a spring apiece.
   - Copy count is measured from the row's own width, and the row parks
     itself when out of view — upstream's `useInView` margin was `"20%"`,
     which Framer Motion 12 rejects as a root margin (it needs units).
   - Static and silent under reduced motion.
   - Rows are `aria-hidden`; the caller is expected to render the same
     content once, accessibly. Repeating a list four times for a screen
     reader is not a decoration, it is noise. */

const VelocityContext = createContext<MotionValue<number> | null>(null);

export function VelocityRows({ children, className }: { children: ReactNode; className?: string }) {
  const { scrollY } = useScroll();
  const raw = useVelocity(scrollY);
  const smooth = useSpring(raw, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, (v) => {
    const sign = v < 0 ? -1 : 1;
    return sign * Math.min(4, (Math.abs(v) / 1000) * 4);
  });

  return (
    <VelocityContext.Provider value={factor}>
      <div className={cn('relative w-full', className)}>{children}</div>
    </VelocityContext.Provider>
  );
}

export interface VelocityRowProps {
  children: ReactNode;
  /** Percent of a copy width per second at rest. */
  baseVelocity?: number;
  direction?: 1 | -1;
  className?: string;
}

export function VelocityRow({ children, baseVelocity = 4, direction = 1, className }: VelocityRowProps) {
  const factor = useContext(VelocityContext);
  const reduced = useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);

  const x = useMotionValue(0);
  const offset = useRef(0);
  const unit = useRef(0);
  const inView = useInView(host, { margin: '200px' });

  useLayoutEffect(() => {
    const el = host.current;
    const block = measure.current;
    if (!el || !block) return;

    const read = () => {
      const w = block.scrollWidth;
      if (!w) return;
      unit.current = w;
      /* The track slides by up to one whole copy, so it has to be at least
         a viewport *plus* a copy wide, then one more for the rounding. */
      setCopies(Math.max(3, Math.ceil(el.offsetWidth / w) + 2));
    };
    read();

    const ro = new ResizeObserver(read);
    ro.observe(el);
    ro.observe(block);
    return () => ro.disconnect();
  }, [children]);

  useEffect(() => {
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        const block = measure.current;
        if (block?.scrollWidth) unit.current = block.scrollWidth;
      });
    }
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduced || !inView || !unit.current) return;

    const seconds = Math.min(delta, 60) / 1000;
    const v = factor?.get() ?? 0;
    const heading = direction * (v < 0 ? -1 : 1);
    const speed = (unit.current * baseVelocity) / 100;

    offset.current += heading * speed * (1 + Math.abs(v)) * seconds;
    // Keep the offset inside one copy so the translate never grows unbounded.
    offset.current = ((offset.current % unit.current) + unit.current) % unit.current;
    x.set(-offset.current);
  });

  return (
    <div
      ref={host}
      dir="ltr"
      aria-hidden="true"
      /* Direction-isolated. In an RTL document the flex track is laid out
         from the right edge, so translating it negatively walks it off to
         the left and leaves a growing hole on the right. */
      className={cn('w-full overflow-hidden whitespace-nowrap', className)}
    >
      <m.div className="inline-flex will-change-transform" style={reduced ? undefined : { x }}>
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} ref={i === 0 ? measure : undefined} className="inline-flex shrink-0">
            {children}
          </div>
        ))}
      </m.div>
    </div>
  );
}

export default VelocityRow;
