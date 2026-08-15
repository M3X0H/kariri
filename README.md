# Mohammed Ismail Kariri — Portfolio

Personal portfolio for **Mohammed Ismail Kariri**, IT Specialist (IT Support / Hardware / CCTV) based in Riyadh, Saudi Arabia.

A static site with no build step and no dependencies — open `index.html` and it runs.

## Structure

```
index.html         Markup, metadata, JSON-LD, and the inline SVG icon sprite
assets/styles.css  Design tokens, layout, and components
assets/app.js      Theme, language, navigation, scroll spy, reveals
me.jpg             Portrait
CVMK.pdf           CV linked from the site
```

## Features

- **Bilingual Arabic / English** — switches `lang`, `dir`, page title, and meta description; the choice is remembered.
- **Light and dark themes** — follows the operating system by default, and remembers an explicit choice. Applied before first paint, so there is no flash.
- **Responsive** from 320 px upward, with a collapsible menu below 860 px.
- **Accessible** — skip link, visible focus rings, correct heading order, labelled controls, and a menu that leaves the tab order when closed. Both themes meet WCAG AA contrast.
- **Respects `prefers-reduced-motion`** and prints cleanly as a CV.

## Running it locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 4173
```

## Editing content

Text lives in two places that must stay in step:

1. The Arabic copy in `index.html`, marked with `data-i18n="key"`.
2. Both translations in the `translations` object in `assets/app.js`.

Adding a string means adding the same key to the `ar` and `en` dictionaries. Icons are `<symbol>` elements at the top of `index.html`, referenced with `<use href="#i-name">`.
