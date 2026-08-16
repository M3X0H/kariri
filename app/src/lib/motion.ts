import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';

gsap.registerPlugin(ScrollTrigger);

/* Ambient hue for a section. The page walks the spectrum from cyan at
   the hero to magenta at the close, so colour tracks the story. */
export const aura = (hue: number) => ({ ['--aura']: hue }) as CSSProperties;

/* One motion language, three speeds and a single easing family. Every
   section below composes from these rather than inventing its own. */
export const EASE = 'power3.out';
export const EASE_IO = 'power2.inOut';
export const DUR = { fast: 0.35, mid: 0.7, slow: 1.1 } as const;

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isCoarse = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none), (max-width: 900px)').matches;

/* Scopes a GSAP context to an element and reverts it on unmount, which
   kills every tween and ScrollTrigger the scene created. Animations are
   written as `from`/`fromTo`, never by pre-hiding elements in CSS — so
   if this never runs, or motion is reduced, the content is simply
   already in its final, visible state. */
export function useScene<T extends HTMLElement = HTMLDivElement>(
  // A returned function is GSAP's own per-context cleanup hook, run on revert.
  setup: (el: T) => void | (() => void),
  deps: unknown[] = []
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    const ctx = gsap.context(() => setup(el), el);
    // Layout settles after fonts swap; stale start/end values otherwise
    // leave triggers firing at the wrong scroll position.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

/* Splits a string into per-word spans, each wrapped in a clipping mask,
   so words can rise out of the line rather than fading in place.
   Returns the inner elements for staggering. */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? '';
  el.textContent = '';
  const inners: HTMLElement[] = [];

  text.split(/\s+/).filter(Boolean).forEach((word, i, arr) => {
    const mask = document.createElement('span');
    mask.style.display = 'inline-block';
    mask.style.overflow = 'hidden';
    mask.style.verticalAlign = 'top';
    mask.style.paddingBottom = '0.12em';

    const inner = document.createElement('span');
    inner.style.display = 'inline-block';
    inner.textContent = word + (i < arr.length - 1 ? ' ' : '');

    mask.appendChild(inner);
    el.appendChild(mask);
    inners.push(inner);
  });

  return inners;
}

export { gsap, ScrollTrigger };
