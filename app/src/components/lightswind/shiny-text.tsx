import type { ReactNode } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { cn } from './utils';

/* Lightswind — ShinyText.
   A highlight travels through the glyphs themselves via `background-clip`,
   so the type is the light source rather than sitting under a sheen.

   Adapted:
   - The size and weight class maps are gone; typography comes from
     `className`. Upstream bakes in `text-xs` … `text-4xl`, which would have
     overridden this project's own display scale at every call site.
   - Colours are props with the site's tokens as defaults, instead of the
     hard-coded `#b5b5b5` / `#ffffff` pair.
   - Direction is direction-aware: in RTL the sweep runs the other way, so
     it travels with the reading order rather than against it.
   - Under reduced motion the gradient is dropped entirely and the text
     renders in `baseColor`. Upstream keeps animating; a repeating highlight
     over body text is precisely what that setting exists to stop. */

export interface ShinyTextProps {
  children: ReactNode;
  className?: string;
  /** Seconds per sweep. */
  speed?: number;
  baseColor?: string;
  shineColor?: string;
  /** Width of the highlight as a percentage of the run. */
  shineWidth?: number;
  rtl?: boolean;
  disabled?: boolean;
}

export function ShinyText({
  children,
  className,
  speed = 4.5,
  baseColor = 'var(--color-ink-3)',
  shineColor = 'var(--color-cyan)',
  shineWidth = 22,
  rtl = false,
  disabled = false
}: ShinyTextProps) {
  const reduced = useReducedMotion();

  if (reduced || disabled) {
    return <span className={cn(className)} style={{ color: baseColor }}>{children}</span>;
  }

  const edge = Math.max(0, 50 - shineWidth / 2);

  return (
    <m.span
      className={cn('inline-block bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: `linear-gradient(110deg, ${baseColor} ${edge}%, ${shineColor} 50%, ${baseColor} ${100 - edge}%)`,
        backgroundSize: '260% 100%'
      }}
      initial={{ backgroundPosition: rtl ? '0% 0%' : '260% 0%' }}
      animate={{ backgroundPosition: rtl ? '260% 0%' : '0% 0%' }}
      transition={{ duration: speed, ease: 'linear', repeat: Infinity, repeatDelay: 1.1 }}
    >
      {children}
    </m.span>
  );
}

export default ShinyText;
