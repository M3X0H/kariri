import { m, useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { cn } from './utils';

/* Lightswind — BorderBeam.
   A comet runs the border path of whatever it is dropped into. The parent
   needs `position: relative`; the beam inherits its radius.

   Adapted:
   - Default colours are the site's cyan → violet rather than upstream's
     purple pair, and `glowIntensity` defaults on — at 1px of travelling
     light with no bloom the effect is invisible against this ground.
   - Under reduced motion the beam is not rendered at all. Upstream animates
     regardless; a looping light is exactly what that setting is asking to
     stop, and there is nothing to show statically.
   - Upstream's unused `borderThickness` and `pauseOnHover` props are gone —
     the first was already commented out of the markup, the second referenced
     a `group-hover:animation-play-state-paused` class that Tailwind does not
     generate. `speedMultiplier` folded into `duration`. */

export interface BorderBeamProps {
  /** Length of the comet, in px. Sets `--beam-w`, so a breakpoint utility
      on `className` can resize it — a beam tuned for a wide panel is a
      loud blob on a phone-width card. */
  size?: number;
  /** Seconds for one lap. */
  duration?: number;
  /** Negative offset into the loop, so several beams can be phase-shifted. */
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  style?: CSSProperties;
  reverse?: boolean;
  /** Where on the path the beam starts, 0–100. */
  initialOffset?: number;
  opacity?: number;
  /** Bloom radius multiplier; 0 disables the glow. */
  glowIntensity?: number;
  /** Corner radius of the travel path. Match the parent's radius. */
  beamBorderRadius?: number;
}

export function BorderBeam({
  className,
  size = 120,
  delay = 0,
  duration = 7,
  colorFrom = 'var(--color-cyan)',
  colorTo = 'var(--color-violet)',
  style,
  reverse = false,
  initialOffset = 0,
  opacity = 0.9,
  glowIntensity = 2,
  beamBorderRadius = 0
}: BorderBeamProps) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <m.div
        className={cn(
          // Rounded and softened: a hard-edged square is unmistakably a
          // square as it turns a corner, which is where upstream's beam
          // stops reading as a travelling light.
          'absolute aspect-square rounded-full blur-[3px]',
          'bg-gradient-to-l from-[var(--beam-from)] via-[var(--beam-to)] to-transparent',
          className
        )}
        style={
          {
            '--beam-w': `${size}px`,
            width: 'var(--beam-w)',
            offsetPath: `rect(0 auto auto 0 round ${beamBorderRadius}px)`,
            '--beam-from': colorFrom,
            '--beam-to': colorTo,
            opacity,
            boxShadow: glowIntensity > 0 ? `0 0 ${glowIntensity * 8}px ${glowIntensity * 3}px var(--beam-from)` : undefined,
            ...style
          } as CSSProperties
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`]
        }}
        transition={{ repeat: Infinity, ease: 'linear', duration, delay: -delay }}
      />
    </div>
  );
}

export default BorderBeam;
