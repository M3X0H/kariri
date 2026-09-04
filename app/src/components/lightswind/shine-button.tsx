import type { ReactNode } from 'react';
import { cn } from './utils';

/* Lightswind — ShineButton.
   A highlight sweeps across the control on hover, and the gradient beneath
   it shifts at the same time.

   Adapted:
   - Restrained to an outline on the site's ground. Upstream is a filled
     blue pill carrying four stacked box-shadows — a button from a different
     design system, and the only one it can be.
   - The sweep runs on hover and focus, not permanently. Upstream's shine
     div is `opacity-0 group-hover:opacity-100` on a button that never has
     the `group` class, so the reveal can never fire — while `animate-shine`
     runs regardless. The keyframes live in `index.css`; here they are
     driven by a CSS transition instead, so nothing animates at rest.
   - Renders an `<a>` when `href` is set, and the sweep is masked by the
     control's own bounds rather than a `w-[200%]` element hanging outside it.
   - `skew` is direction-aware so the sweep leans with the reading order. */

export interface ShineButtonProps {
  children: ReactNode;
  href?: string;
  external?: boolean;
  download?: boolean;
  onClick?: () => void;
  className?: string;
  rtl?: boolean;
}

export function ShineButton({
  children,
  href,
  external = false,
  download = false,
  onClick,
  className,
  rtl = false
}: ShineButtonProps) {
  const shell = cn(
    'group relative inline-flex items-center gap-2.5 overflow-hidden',
    'border border-[var(--line-2)] px-5 py-3 text-sm',
    'transition-colors duration-300 hover:border-cyan hover:text-cyan focus-visible:border-cyan',
    className
  );

  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan/25 to-transparent',
          'transition-[translate] duration-700 ease-out',
          rtl
            ? 'right-0 translate-x-[350%] group-hover:-translate-x-[350%] group-focus-visible:-translate-x-[350%] skew-x-12'
            : 'left-0 -translate-x-[350%] group-hover:translate-x-[350%] group-focus-visible:translate-x-[350%] -skew-x-12',
          'motion-reduce:hidden'
        )}
      />
      <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
    </>
  );

  return href ? (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      {...(download ? { download: true } : {})}
      className={shell}
    >
      {body}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={shell}>
      {body}
    </button>
  );
}

export default ShineButton;
