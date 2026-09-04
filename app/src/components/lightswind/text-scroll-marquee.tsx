import { useRef, type ReactNode } from 'react';
import {
  m,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from 'framer-motion';
import { cn, wrap } from './utils';

/* Lightswind — TextScrollMarquee.
   A strip that drifts on its own and is shoved along by scroll velocity;
   scrolling up drags it backwards. Reading speed becomes an input.

   Adapted:
   - `wrap` comes from `./utils` instead of `@motionone/utils`, dropping a
     dependency for one six-line function.
   - The wrap window is `-100 / copies` percent, not upstream's `-100`.
     Upstream translates the whole track — every copy — by a full 100% of
     its own width, so the loop jumps by N copies at once and visibly snaps.
     One copy width is `100 / copies` percent of the track, which is the
     distance that actually seams.
   - Children are `ReactNode`, not `string`, so the strip can carry marked-up
     items. The separator is a real element rather than a `gap`, since the
     gap has to repeat with the content to survive the wrap.
   - `dir="ltr"` is forced on the track. The content here is Latin
     technology names; inside an RTL document they would otherwise be
     reordered by the bidi algorithm and the loop would not seam.
   - Under reduced motion the track is rendered once, static, and does not
     subscribe to scroll. */

export interface TextScrollMarqueeProps {
  children: ReactNode;
  /** Percent of one copy width per second, before scroll boost. */
  baseVelocity?: number;
  className?: string;
  trackClassName?: string;
  direction?: 'left' | 'right';
  /** Number of copies laid end to end. Needs to overfill the viewport. */
  copies?: number;
  separator?: ReactNode;
}

export function TextScrollMarquee({
  children,
  baseVelocity = 3,
  className,
  trackClassName,
  direction = 'left',
  copies = 4,
  separator
}: TextScrollMarqueeProps) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const dir = useRef(direction === 'left' ? -1 : 1);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smooth, [-1200, 0, 1200], [-3, 0, 3], { clamp: false });

  const span = 100 / copies;
  const x = useTransform(baseX, (v) => `${wrap(-span, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const seconds = Math.min(delta, 60) / 1000;
    let move = dir.current * baseVelocity * (span / 100) * seconds;
    move += move * Math.abs(boost.get());
    // Scrolling backwards drags the strip backwards with it.
    if (boost.get() < 0) move *= -1;
    baseX.set(baseX.get() + move);
  });

  const copy = (key: number) => (
    <div key={key} className={cn('flex shrink-0 items-center', trackClassName)}>
      {children}
      {separator}
    </div>
  );

  if (reduced) {
    return (
      <div dir="ltr" className={cn('overflow-hidden', className)}>
        <div className={cn('flex items-center', trackClassName)}>{children}</div>
      </div>
    );
  }

  return (
    <div dir="ltr" className={cn('overflow-hidden', className)} aria-hidden="true">
      <m.div className="flex w-max flex-nowrap will-change-transform" style={{ x }}>
        {Array.from({ length: copies }, (_, i) => copy(i))}
      </m.div>
    </div>
  );
}

export default TextScrollMarquee;
