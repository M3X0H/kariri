# Mohammed Ismail Kariri — Portfolio

Personal site for **Mohammed Ismail Kariri**, IT Specialist and Computer Science Specialist (recognized by the Saudi Council of Engineers), based in Riyadh, Saudi Arabia.

**Live:** https://m3x0h.github.io/kariri/

## Structure

```
app/                 Source. Vite + React + TypeScript + Tailwind + GSAP + Three.js
  src/content.ts     Every string, in Arabic and English — one source of truth
  src/lib/motion.ts  GSAP context hook, easing scale, reduced-motion gate
  src/components/    Chrome (loader, nav, cursor) and the sections
  scripts/publish.mjs  Copies the build to the repository root

index.html           BUILT — do not edit by hand
assets/              BUILT — hashed bundles
me.jpg  og.jpg  CVMK.pdf   Static assets, referenced relatively
```

GitHub Pages serves this repository from the branch root, so the compiled
site is committed alongside its source. `index.html` and `assets/` are
build output: edit `app/src` and rebuild.

## Working on it

```bash
cd app && npm install && npm run dev
```

`npm run build` type-checks, bundles, and publishes to the repository
root in one step. Commit the result together with the source.

## Design notes

- **One spectrum, used as light.** Cyan → blue → violet → magenta, drifting per
  section via a single `--aura` hue token, over a near-black ground. Accents
  are measured to clear WCAG AA on that ground rather than picked by eye.
- **The signal field** is a Fibonacci-lattice point sphere stitched to nearest
  neighbours, in a custom shader. It answers to the pointer and disperses on
  scroll. It is lazy-loaded, skipped below 768px and under reduced motion, and
  idles when off-screen or when the tab is hidden.
- **A motion language, not one fade.** The hero lifts and softens, the statement
  slides in opposing directions on scrub, About enters from the inline start,
  the career spine draws itself, Work pins its visual while the write-up moves.
  Horizontal travel is gated to widths with gutter to spare — below that the
  same reveals run vertically, so nothing parks off-page waiting for a trigger.
- **Animations are written as `from`, never as pre-hidden CSS.** If scripting
  fails or motion is reduced, every element is already in its final visible
  state. Scenes are scoped with `gsap.context` and reverted on unmount, which
  kills their ScrollTriggers with them.
- **Bilingual and RTL-first.** Arabic is the default; the page flips direction
  wholesale. Arabic display type gets its own leading and tracking, since the
  Latin settings clip its descenders.

## The chapters

```
00  fault       three faults from an ordinary day — the hook
01  about       who he is, professionally
02  capabilities  the six connected areas, as a system map
03  experience  what he has actually done
04  work        what he has built
05  credentials what validates it
06  direction   where it goes next, and what each direction starts from
07  contact     how to reach him
```

About precedes the map: a recruiter needs *who* before *what*, and the
map reads as his system once you know whose it is.

## Editing content

All copy lives in `app/src/content.ts`, keyed by language. The facts —
roles, dates, employers, credentials, the single real project — are real.
Keep them that way. Two rules the file is held to:

1. **The IT Specialist post ran Jun–Dec 2025 and is written in the past
   tense.** Nothing on the page claims it is current.
2. **AI, automation and the business side are direction, never
   experience.** Chapter 06 states that in plain words, and every vector
   in it carries the real thing it starts from — a degree, a desk, a
   certificate — in `direction.items[].fromV`. No professional AI work,
   employer, client, certification or deployment is claimed anywhere,
   because none is evidenced.
