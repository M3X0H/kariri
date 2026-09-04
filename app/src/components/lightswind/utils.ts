/* Lightswind's `cn`, minus clsx and tailwind-merge.

   Upstream imports both from `@/components/lib/utils`. Nothing vendored here
   passes conflicting Tailwind classes through `cn`, so the merge pass has
   nothing to do — this is the same filter-and-join fallback Lightswind
   inlines in its own `smooth-cursor.tsx` and `lens.tsx`. */
export type ClassValue = string | undefined | null | false;

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}

/* Modular wrap, from Lightswind's `3d-scroll-trigger.tsx`. Upstream's
   `text-scroll-marquee.tsx` imports the identical function from
   `@motionone/utils`; using the local copy drops that dependency. */
export const wrap = (min: number, max: number, v: number): number => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};
