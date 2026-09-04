import type { CSSProperties } from 'react';
import { cn } from './utils';

/* Lightswind — AuroraBackground.
   Two repeating gradients slide across each other under a blur; a
   `mix-blend-difference` layer with a fixed attachment breaks the banding
   into something that reads as light rather than as stripes.

   Adapted:
   - Dark only. Upstream ships a light theme built from `invert` plus a
     `dark:invert-0` override, which on this ground produced a grey wash.
     The inverted branch is gone and the stripe gradient is black-based,
     which is upstream's own dark path taken directly.
   - The palette is driven by `--aurora-hue` rather than the hard-coded
     blue/indigo/violet set, so a section can tune the ambience and the page
     can walk the spectrum from cyan at the hero to magenta at the close.
   - It is a layer, not a page. Upstream wraps its children in `<main>` at
     `h-[100vh]`; this is `position: absolute`, `inset: 0`, decorative and
     non-interactive, so it can sit behind a section of any height. A second
     `<main>` in the document would also have been a landmark error.
   - No `background-attachment: fixed` on the second layer, and it blends
     with `plus-lighter` rather than `difference`. Upstream's pairing pins
     the stripes to the viewport while the element scrolls, and `difference`
     turns the seam where the two disagree into a hard vertical edge —
     clearly visible down the left of the hero. `plus-lighter` only ever
     adds light, so the layers can only soften each other.
   - The stripes are wider and the blur heavier, and the radial mask fades
     out well inside the element, so nothing reaches an edge to break on.
   - Kept to `background-position` on a composited layer, at low opacity.
     The `animate-aurora` keyframes live in `index.css`, and stop under
     `prefers-reduced-motion` with the rest of the page's animation. */

export interface AuroraBackgroundProps {
  /** Base hue in degrees. */
  hue?: number;
  /** Degrees the gradient fans across from `hue`. Keep it inside the
      section's own arc of the spectrum — a wide fan runs past the accent
      range and wraps into reds, which on this palette reads as a fault. */
  spread?: number;
  /** 0–1. Kept low; this is ambience, not a subject. */
  intensity?: number;
  /** Fades the layer out toward one corner so it never reads as a panel. */
  showRadialGradient?: boolean;
  className?: string;
}

export function AuroraBackground({
  hue = 186,
  spread = 70,
  intensity = 0.3,
  showRadialGradient = true,
  className
}: AuroraBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={
        {
          '--aurora-hue': hue,
          '--aurora-spread': spread,
          '--aurora':
            'repeating-linear-gradient(100deg,' +
            'hsl(var(--aurora-hue) 78% 58%) 10%,' +
            'hsl(calc(var(--aurora-hue) + var(--aurora-spread) * 0.34) 74% 62%) 15%,' +
            'hsl(calc(var(--aurora-hue) + var(--aurora-spread) * 0.67) 70% 60%) 20%,' +
            'hsl(calc(var(--aurora-hue) + var(--aurora-spread)) 72% 62%) 25%,' +
            'hsl(var(--aurora-hue) 78% 58%) 30%)',
          '--stripe':
            'repeating-linear-gradient(100deg,#000 0%,#000 11%,transparent 17%,transparent 24%,#000 31%)'
        } as CSSProperties
      }
    >
      <div
        className={cn(
          'absolute -inset-[18%] will-change-[background-position]',
          '[background-image:var(--stripe),var(--aurora)] [background-size:340%,_240%] [background-position:50%_50%,50%_50%]',
          '[filter:blur(62px)_saturate(135%)]',
          'after:absolute after:inset-0 after:content-[""]',
          'after:[background-image:var(--stripe),var(--aurora)] after:[background-size:260%,_180%]',
          'after:mix-blend-plus-lighter after:opacity-60 after:animate-aurora',
          showRadialGradient &&
            '[mask-image:radial-gradient(60%_60%_at_74%_16%,#000_0%,transparent_72%)] [-webkit-mask-image:radial-gradient(60%_60%_at_74%_16%,#000_0%,transparent_72%)]'
        )}
        style={{ opacity: intensity }}
      />
    </div>
  );
}

export default AuroraBackground;
