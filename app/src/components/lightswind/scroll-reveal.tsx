import { useMemo, useRef } from 'react';
import { m, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { cn } from './utils';

/* Lightswind — ScrollReveal.
   Words arrive out of blur, staggered, while the block counter-rotates
   against the scroll. The blur → sharp transition is the point.

   Adapted:
   - Upstream's size/align/variant class maps assumed shadcn typography
     tokens (`text-foreground`, `text-muted-foreground`). Typography is the
     caller's business here, so those maps are gone and `className` carries it.
   - `once` is a prop and defaults on. Upstream hard-codes `once: false`,
     which re-blurs a paragraph every time it leaves the viewport — fine for
     a demo, irritating in a page you scroll back through.
   - Splitting is on whitespace only. Arabic joins *within* a word, so word
     splitting is safe where character splitting would shatter the script.
     Each word gets `inline-block`; the spaces stay plain text nodes so the
     line still wraps and the bidi algorithm still sees a normal run.
   - Under reduced motion the text renders as-is, unwrapped and unanimated.
   - The scroll-linked rotation is skipped in RTL: on a right-anchored
     Arabic block the same tilt reads as a layout fault rather than depth. */

export interface ScrollRevealProps {
  children: string;
  className?: string;
  as?: 'p' | 'h2' | 'h3';
  /** Opacity of a word before it enters. */
  baseOpacity?: number;
  /** Blur applied to a word before it enters, in px. */
  blurStrength?: number;
  /** Degrees the block is rotated at the start of its scroll range. */
  baseRotation?: number;
  /** Seconds between consecutive words. */
  staggerDelay?: number;
  /** Fraction of the block that must be in view to trigger. */
  threshold?: number;
  /** Vertical travel per word, in px. */
  travel?: number;
  once?: boolean;
  rtl?: boolean;
}

export function ScrollReveal({
  children,
  className,
  as = 'p',
  baseOpacity = 0.12,
  blurStrength = 6,
  baseRotation = 2.5,
  staggerDelay = 0.035,
  threshold = 0.35,
  travel = 18,
  once = true,
  rtl = false
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { amount: threshold, once });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const rotate = useTransform(scrollYProgress, [0, 0.45, 1], [baseRotation, 0, 0]);

  const words = useMemo(() => children.split(/(\s+)/).filter(Boolean), [children]);

  // Indexing `motion` with a union yields a union of component types, which
  // JSX will not accept; the map keeps each one concrete.
  const Tag = { p: m.p, h2: m.h2, h3: m.h3 }[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <m.div
      ref={ref}
      style={rtl ? undefined : { rotate }}
      className="origin-[50%_0%] transform-gpu"
    >
      <Tag
        className={cn(className)}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: staggerDelay, delayChildren: 0.08 } }
        }}
      >
        {words.map((word, i) =>
          /^\s+$/.test(word) ? (
            <span key={i}> </span>
          ) : (
            <m.span
              key={i}
              className="inline-block will-change-[filter,opacity,transform]"
              variants={{
                hidden: { opacity: baseOpacity, filter: `blur(${blurStrength}px)`, y: travel },
                visible: {
                  opacity: 1,
                  filter: 'blur(0px)',
                  y: 0,
                  transition: { type: 'spring', damping: 26, stiffness: 110, mass: 0.9 }
                }
              }}
            >
              {word}
            </m.span>
          )
        )}
      </Tag>
    </m.div>
  );
}

export default ScrollReveal;
