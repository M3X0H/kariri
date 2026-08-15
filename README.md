# Mohammed Ismail Kariri — Portfolio

Personal portfolio for **Mohammed Ismail Kariri**, IT Specialist and Computer Science Specialist (recognized by the Saudi Council of Engineers), based in Riyadh, Saudi Arabia.

A static site with no build step and no dependencies — open `index.html` and it runs.

**Live:** https://m3x0h.github.io/kariri/

## Structure

```
index.html         Markup, metadata, JSON-LD, and the inline SVG icon sprite
assets/styles.css  Design tokens, layout, components, motion
assets/app.js      Theme, language, navigation, reveals, hero field, pointer polish
me.jpg             Portrait
og.jpg             1200x630 share card used by og:image / twitter:image
CVMK.pdf           CV linked from the site
```

Sections, in order: hero, about, skills, projects, experience, highlights, certifications, contact.

## Features

- **Bilingual Arabic / English** — switches `lang`, `dir`, title, and meta description, and remembers the choice. The layout is built on CSS logical properties, so RTL and LTR are both first-class.
- **Dark by default, light on request** — dark is the site's identity; light is a full, separately tuned palette rather than an inversion. The choice is applied before first paint, so there is no flash.
- **Hero node field** — a canvas constellation that reacts to the pointer. It is skipped entirely under `prefers-reduced-motion` and at 900 px and below, and pauses when scrolled out of view or when the tab is hidden.
- **Motion with a purpose** — a staggered entrance sequence, blur-to-focus scroll reveals, a sliding nav indicator, pointer-tracking card borders, and a magnetic primary call to action. All of it is compositor-only: `opacity`, `transform`, and `translate`. Entrance and reveal deliberately use the independent `translate` property so they compose with, rather than overwrite, each component's own `transform`.
- **Deterministic in-page navigation** — same-page links are handled in JavaScript so they clear the floating bar, move keyboard focus to the destination, and behave the same on first load, on refresh, through Back and Forward, and from a pasted deep link. Modified clicks (⌘/Ctrl/middle) are left alone so they still open a new tab.
- **Responsive** from 360 px up, with a collapsible menu below 860 px.
- **Accessible** — skip link, visible focus rings, correct heading order, labelled controls, native `<details>` for expandable detail, and a menu that leaves the tab order when closed. Both themes meet WCAG AA contrast on every text style.
- Prints cleanly as a CV.

## Running it locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 4173
```

## Editing content

Text lives in two places that must stay in step:

1. The Arabic copy in `index.html`, marked with `data-i18n="key"` (or `data-i18n-label` for `aria-label`).
2. Both translations in the `translations` object in `assets/app.js`.

Adding a string means adding the same key to the `ar` and `en` dictionaries. Icons are `<symbol>` elements at the top of `index.html`, referenced with `<use href="#i-name">`.
