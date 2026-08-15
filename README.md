# Mohammed Ismail Kariri — Portfolio

Personal portfolio for **Mohammed Ismail Kariri**, IT Specialist and Computer Science Specialist (recognized by the Saudi Council of Engineers), based in Riyadh, Saudi Arabia.

A static site with no build step and no dependencies — open `index.html` and it runs.

**Live:** https://m3x0h.github.io/kariri/

## Files

```
index.html         Markup, metadata, JSON-LD, inline SVG icon sprite
assets/styles.css  Design tokens, layout, components, motion
assets/app.js      Theme, language, navigation, reveals, 3D lattice, pointer
me.jpg             Portrait
CVMK.pdf           CV linked from the contact section
```

Sections in order: hero, about, capabilities, career, selected work, credentials, contact.

## Design

Treated as a **type specimen**: content sits directly on the ground, separated by
hairlines, whitespace, and scale rather than cards. A twelve-column grid stays
faintly visible behind the page. Type is Alexandria (display and body, Arabic and
Latin) with IBM Plex Mono for metadata, on a scale spanning roughly 16× from
metadata to the hero.

Dark by default, with the light paper palette kept as a designed alternate rather
than an inversion. The accent is a spectrum rather than a single hue — cyan leads
and carries every state that has to be *read*, with indigo and magenta as
accents for gradients and depth, never a third equal voice. Each ink tier is
measured on its own ground: ink-2 clears 8.4:1 dark and 7.8:1 light, ink-3 5.2:1
and 4.7:1.

Each section declares an ambient hue in `data-aura`, and the engine eases the
page's background lighting toward it as you read — cyan through the hero, violet
across about and career, magenta over the work, back to a strong cyan at the
contact close. The shift happens in a blurred layer behind the column rules, so
the sections never become separate coloured blocks.

## The 3D lattice

The hero renders a rotating point-shell on canvas, written from scratch — no
Three.js, no dependency:

- points distributed by the Fibonacci sphere method, so coverage is even and
  does not cluster at the poles
- neighbours linked at `4.8/√N`, just above the expected point spacing, which
  yields roughly five or six edges per node — open enough to read as a lattice
- rotation by yaw/pitch matrices, then a perspective divide; depth drives both
  line alpha and node radius, which is what conveys volume
- the pointer steers rotation, scroll adds pitch, and it drifts on its own

It is skipped entirely under `prefers-reduced-motion`, drops to 90 points below
900 px, and stops contributing once the hero is off-screen or the tab is hidden.
CSS owns the canvas's display size while JS owns only the bitmap, so it re-sizes
correctly through a `ResizeObserver` rather than freezing a bad first
measurement. Edges are batched into six depth buckets rather than stroked one at
a time, and the backing store is capped at 1.5× — together those keep it inside
the frame budget on hairlines this thin.

## Motion

Two systems drive everything, and nothing else on the page listens to scroll:

- **`reveal`** — one `IntersectionObserver`. `.reveal` is a plain rise;
  `data-in="up|down|start|end|scale"` adds a direction, and `data-in-stagger="ms"`
  hands the animation to the children so a list arrives as a list. `start` and
  `end` follow the writing direction, so reveals mirror correctly in Arabic.
- **`engine`** — one `requestAnimationFrame` loop and one scroll listener. It
  reads layout once per frame, then writes custom properties the stylesheet turns
  into movement: `--t` (hero exit), `--f` (career rail), `--py` (parallax), `--cy`
  (the project wireframe's drift), `--bandx` (marquee), `--p` (reading position),
  and the ambient hue. The lattice is stepped from here too.

`transform` is reserved for scroll-linked movement and `translate` for entrance
and reveal — separate CSS properties, so an element can be both parallaxed and
revealed without either erasing the other.

Section by section: the hero leaves in layers, each reading `--t` at its own rate;
the career rail fills as the section passes and lights the entry nearest the
reading line while the others step back; the project frame holds still while the
wireframe inside it drifts; and the technology strip answers to scroll velocity,
reversing when you do.

## Behaviour

- **Bilingual Arabic / English** — switches `lang`, `dir`, title, and description,
  and remembers the choice. Built on CSS logical properties, so both directions
  are first-class.
- **Dark and light** — applied before first paint, so there is no flash.
- **Count-in** — a short progress sequence that clears itself on a hard timer, so
  a stalled asset can never leave the page covered.
- **Accessible** — skip link, visible focus, correct heading order, labelled
  controls, native `<details>`, and a menu that leaves the tab order when closed.
  Both themes clear WCAG AA on every text style, including the muted career
  entries. Under `prefers-reduced-motion` every transform and continuous
  animation stops and all content stays visible.
- **Navigation** — internal links are handled in script so they clear the fixed
  rail and move focus, and direct hash URLs, refresh, back, and forward all
  behave. Nothing internal opens a new tab.

## Running it locally

Open `index.html` directly, or serve the folder:

```bash
npx --yes serve . -l 4173
```

## Editing content

Text lives in two places that must stay in step:

1. The Arabic copy in `index.html`, marked `data-i18n="key"` (or `data-i18n-label`
   for `aria-label`).
2. Both translations in the `copy` object in `assets/app.js`.

Adding a string means adding the same key to the `ar` and `en` dictionaries.
Icons are `<symbol>` elements at the top of `index.html`, used via
`<use href="#i-name">`.

Giving a new element motion means adding `data-in` (optionally with
`data-in-stagger`, `data-in-delay`, or `data-par`) in the markup — the engine
picks it up, and there is no JavaScript to write.
