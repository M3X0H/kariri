# Lightswind components, vendored

Source: [Lightswind UI](https://github.com/codewithMUHILAN/Lightswind-UI-Library) — MIT.

Lightswind is a source-first library: components live in the project and are
owned by it. These are its components, adapted rather than copied verbatim.
Every file below states what changed and why. The recurring adaptations:

- **Tokens.** Upstream targets shadcn variables (`bg-primary`,
  `text-foreground`, `hsl(var(--background))`). This project has its own
  scale — `void / graphite / panel / ink / cyan / blue / violet / magenta`.
  Colour is passed in or read from those.
- **`cn`.** Upstream pulls `clsx` + `tailwind-merge`. Nothing here needs
  class-conflict resolution, so `cn` is a filter-and-join (the same fallback
  Lightswind itself inlines in `smooth-cursor.tsx` and `lens.tsx`). Two
  dependencies saved.
- **`"use client"`.** A Next.js directive. This is Vite; it is dropped.
- **Reduced motion and coarse pointers.** Upstream animates unconditionally.
  Everything here goes still under `prefers-reduced-motion`, and
  pointer-driven effects do not arm on touch.
- **RTL.** The site flips to `dir="rtl"` in Arabic. Anything that assumes a
  left-to-right axis is either direction-aware or explicitly isolated.
- **Strict TypeScript.** The build runs `tsc --noEmit` with `noUnusedLocals`
  and `noUnusedParameters`, so dead props and unused imports are removed.

`framer-motion` is the only dependency added for these. `@tsparticles/*`,
`@motionone/utils`, `@gsap/react`, `clsx` and `tailwind-merge` were all
avoidable and are not installed.
