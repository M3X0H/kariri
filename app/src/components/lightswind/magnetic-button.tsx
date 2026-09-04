import { useEffect, useRef, useState, type ReactNode } from 'react';
import { m, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { cn } from './utils';

/* Lightswind — MagneticButton.
   The control leans toward the pointer inside a radius, and its label leans
   less than the shell does, which is what sells the depth.

   Adapted:
   - Renders an `<a>` when `href` is set. Upstream is always a `<button>`;
     the primary action here is a real link to WhatsApp and has to behave
     like one — middle click, copy link, keyboard.
   - Variants use this project's tokens instead of `bg-primary` /
     `text-primary-foreground`, which do not exist here, and the radius is
     square by default: upstream's pill is not this site's shape language.
   - Magnetism arms only for a fine pointer and only outside reduced motion.
     Upstream binds `onMouseMove` unconditionally, which on a touch device
     leaves a control that jumps on first tap.
   - The listener is on `window`, not the element. Upstream's element-scoped
     `onMouseMove` cannot fire until the pointer is already on the button,
     so the pull only ever starts after arrival — the approach, which is the
     whole effect, is missed. The hit area is a rectangle around the button
     rather than a circle, so the pull is even along a wide control. */

type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface MagneticButtonProps {
  children: ReactNode;
  /** 0–1. Fraction of the pointer offset the shell travels. */
  strength?: number;
  /** Multiples of the button's own size that count as "near". */
  reach?: number;
  variant?: Variant;
  size?: Size;
  href?: string;
  external?: boolean;
  download?: boolean;
  onClick?: () => void;
  className?: string;
  /** Classes for the magnetism host. The control cannot stretch past it,
      so a full-width button on a phone needs this too. */
  wrapperClassName?: string;
  'aria-label'?: string;
}

const variants: Record<Variant, string> = {
  solid: 'bg-ink text-void hover:bg-cyan',
  outline: 'border border-[var(--line-2)] text-ink hover:border-cyan hover:text-cyan',
  ghost: 'text-ink-2 hover:text-ink'
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-14 px-8 text-base',
  lg: 'h-16 px-10 text-lg'
};

export function MagneticButton({
  children,
  strength = 0.32,
  reach = 1.5,
  variant = 'solid',
  size = 'md',
  href,
  external = false,
  download = false,
  onClick,
  className,
  wrapperClassName,
  'aria-label': ariaLabel
}: MagneticButtonProps) {
  const host = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const reduced = useReducedMotion();

  const spring = { stiffness: 190, damping: 17, mass: 0.55 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  // The label trails the shell, so the two surfaces separate in depth.
  const labelX = useTransform(x, (v) => v * 0.38);
  const labelY = useTransform(y, (v) => v * 0.38);

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = host.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      if (!r.width) return;

      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const inside = Math.abs(dx) < (r.width / 2) * reach && Math.abs(dy) < (r.height / 2) * reach * 2;

      x.set(inside ? dx * strength : 0);
      y.set(inside ? dy * strength : 0);
      setNear(inside);
    };

    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [reduced, reach, strength, x, y]);

  const shell = cn(
    'group relative inline-flex items-center justify-center gap-3 overflow-hidden font-medium',
    'transition-colors duration-300 will-change-transform',
    variants[variant],
    sizes[size],
    className
  );

  const inner = (
    <>
      <m.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(255_255_255/0.22),transparent_70%)]"
        animate={{ opacity: near ? 1 : 0 }}
        transition={{ duration: 0.28 }}
      />
      <m.span style={{ x: labelX, y: labelY }} className="relative z-10 inline-flex items-center gap-3">
        {children}
      </m.span>
    </>
  );

  const motionProps = {
    style: { x, y },
    animate: { scale: near ? 1.035 : 1 },
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
  };

  return (
    <div ref={host} className={cn('inline-flex', wrapperClassName)} data-magnetic>
      {href ? (
        <m.a
          href={href}
          aria-label={ariaLabel}
          {...(external ? { target: '_blank', rel: 'noopener' } : {})}
          {...(download ? { download: true } : {})}
          className={shell}
          {...motionProps}
        >
          {inner}
        </m.a>
      ) : (
        <m.button type="button" onClick={onClick} aria-label={ariaLabel} className={shell} {...motionProps}>
          {inner}
        </m.button>
      )}
    </div>
  );
}

export default MagneticButton;
