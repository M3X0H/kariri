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

Treated as a **type specimen**: content sits directly on paper, separated by
hairlines, whitespace, and scale rather than cards. A twelve-column grid stays
faintly visible behind the page. Light by default with a designed dark
counterpart; one ultramarine accent used sparingly against a near-monochrome ink
ramp. Type is Alexandria (display and body, Arabic and Latin) with IBM Plex Mono
for metadata, on a scale spanning roughly 16× from metadata to the hero.

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
900 px, and pauses when off-screen or when the tab is hidden. CSS owns the
canvas's display size while JS owns only the bitmap, so it re-sizes correctly
through a `ResizeObserver` rather than freezing a bad first measurement.

## Behaviour

- **Bilingual Arabic / English** — switches `lang`, `dir`, title, and description,
  and remembers the choice. Built on CSS logical properties, so both directions
  are first-class.
- **Light and dark** — applied before first paint, so there is no flash.
- **Motion** — one idea, reused: type rises from behind a clip mask. Entrance is
  staggered; scroll reveals use the same language. Transform and opacity only.
- **Accessible** — skip link, visible focus, correct heading order, labelled
  controls, native `<details>`, and a menu that leaves the tab order when closed.
  Both themes clear WCAG AA on every text style.
- **Navigation** — internal links are plain anchors, so direct hash URLs,
  refresh, back, and forward all behave. Nothing internal opens a new tab.

## Running it locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 4173
```

## Editing content

Text lives in two places that must stay in step:

1. The Arabic copy in `index.html`, marked `data-i18n="key"` (or `data-i18n-label`
   for `aria-label`).
2. Both translations in the `copy` object in `assets/app.js`.

Adding a string means adding the same key to the `ar` and `en` dictionaries.
Icons are `<symbol>` elements at the top of `index.html`, used via
`<use href="#i-name">`.
