import { Children, cloneElement, isValidElement, useRef, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { cn } from './utils';

/* Lightswind — GlowingCards.
   A circle of light follows the pointer across a group of cards. Inside it
   the cards are drawn again in their accent colour, so the highlight cuts
   across card edges instead of stopping at them — the group lights up, not
   the card under the cursor.

   Adapted:
   - The overlay is driven by CSS variables written straight to the node.
     Upstream also holds the same coordinates in React state and calls
     `setMousePosition` on every `mousemove`, re-rendering the whole group
     and its duplicated children dozens of times a second for a value it
     never reads.
   - Pointer events, not mouse events, and only for a fine pointer under
     allowed motion. On touch the group renders as plain cards.
   - The lit duplicate is `aria-hidden` and `inert`. Upstream clones the
     children into the overlay unguarded, so every card's text and any links
     inside it are announced twice.
   - `transition-duration-[&lsqb;…&rsqb;]` in upstream's class list is HTML-escaped
     and never matched anything; the transition is a real style here.
   - Layout is the caller's: upstream hard-codes a centred flex row with its
     own gap, max-width and padding, which fought every grid it was put in. */

export interface SpotlightCardsProps {
  children: ReactNode;
  className?: string;
  /** Radius of the light, in px. */
  radius?: number;
  /** Class names for the layout wrapper. Must match on both layers. */
  layoutClassName?: string;
}

export function SpotlightCards({ children, className, radius = 260, layoutClassName }: SpotlightCardsProps) {
  const host = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const pos = useRef({ x: 0, y: 0 });

  const paint = () => {
    raf.current = 0;
    const el = overlay.current;
    if (!el) return;
    el.style.setProperty('--x', `${pos.current.x}px`);
    el.style.setProperty('--y', `${pos.current.y}px`);
  };

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = host.current?.getBoundingClientRect();
    if (!r) return;
    pos.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (overlay.current) overlay.current.style.opacity = '1';
    if (!raf.current) raf.current = requestAnimationFrame(paint);
  };

  const leave = () => {
    if (overlay.current) overlay.current.style.opacity = '0';
  };

  // The overlay repeats the children with their glow colour promoted from a
  // hint to a fill, and is revealed only inside the mask.
  const lit = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child as ReactElement<SpotlightCardProps>, { lit: true })
      : child
  );

  return (
    <div
      ref={host}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn('relative', className)}
    >
      <div className={layoutClassName}>{children}</div>

      <div
        ref={overlay}
        aria-hidden="true"
        inert
        className="pointer-events-none absolute inset-0 select-none opacity-0 transition-opacity duration-300 max-md:hidden motion-reduce:hidden"
        style={
          {
            WebkitMaskImage: `radial-gradient(${radius}px ${radius}px at var(--x, -1000px) var(--y, -1000px), #000 1%, transparent 62%)`,
            maskImage: `radial-gradient(${radius}px ${radius}px at var(--x, -1000px) var(--y, -1000px), #000 1%, transparent 62%)`
          } as CSSProperties
        }
      >
        <div className={layoutClassName}>{lit}</div>
      </div>
    </div>
  );
}

export interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Accent this card takes on inside the light. */
  glowColor?: string;
  /** Set by `SpotlightCards` on the duplicated layer. Do not pass by hand. */
  lit?: boolean;
}

export function SpotlightCard({ children, className, glowColor = 'var(--color-cyan)', lit = false }: SpotlightCardProps) {
  return (
    <div
      className={cn('relative h-full border border-[var(--line)] bg-void', className)}
      style={
        lit
          ? {
              borderColor: glowColor,
              backgroundColor: `color-mix(in oklab, ${glowColor} 12%, var(--color-graphite))`,
              boxShadow: `inset 0 0 0 1px ${glowColor}, 0 0 42px -12px ${glowColor}`
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

export default SpotlightCards;
