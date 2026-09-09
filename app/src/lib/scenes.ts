import { gsap, EASE, isCoarse } from './motion';

/* ═══════════════════════════════════════════════════════════════
   The motion vocabulary.

   Every section composes from these rather than inventing its own
   tweens, which is the difference between a page that moves and a page
   that has thirty animations on it. All but one are driven by scroll or
   by the pointer, so what happens is something the visitor caused;
   `drift` is the exception, and it exists precisely to give the page an
   idle — a composition where literally nothing moves until you touch it
   reads as broken rather than as calm.

   All of them are called from inside `useScene`, which already refuses
   to run under reduced motion and reverts everything on unmount.
   ═══════════════════════════════════════════════════════════════ */

/* The page as one continuous camera move.

   A section does not simply scroll away: it recedes — falls back in z,
   softens and dims — while the next one arrives over it at full weight.
   Applied to every unpinned chapter from one place, so the whole
   document shares a single sense of depth instead of each section
   cutting hard to the next. */
export function recede(stage: Element) {
  /* Blur is the expensive half of this, and it is running on a
     full-width wrapper on every frame of the scroll. Scale and opacity
     alone still read as distance, so phones get those and keep their
     frame rate. */
  const soft = isCoarse() ? {} : { filter: 'blur(7px)' };

  return gsap.to(stage, {
    scale: 0.93,
    opacity: 0.18,
    ...soft,
    yPercent: -4,
    transformOrigin: '50% 0%',
    ease: 'none',
    scrollTrigger: {
      trigger: stage,
      start: 'bottom 78%',
      end: 'bottom 2%',
      scrub: 0.8
    }
  });
}

/* Arrival. Content lifts into place out of blur as its section comes
   up — the counterpart of `recede`, and the reason a chapter reads as
   resolving rather than appearing. */
export function arrive(targets: gsap.TweenTarget, opts: { y?: number; x?: number; stagger?: number; start?: string } = {}) {
  const { y = 54, x = 0, stagger = 0.08, start = 'top 84%' } = opts;
  return gsap.from(targets, {
    y,
    x,
    opacity: 0,
    filter: 'blur(10px)',
    duration: 1,
    stagger,
    ease: EASE,
    scrollTrigger: { trigger: targets as Element, start }
  });
}

/* Scroll-linked vertical travel. Positive `distance` moves the element
   against the scroll, which is what reads as "further away". */
export function parallax(el: Element, distance = 12, scrub: number | boolean = 0.9) {
  return gsap.fromTo(
    el,
    { yPercent: distance / 2 },
    {
      yPercent: -distance / 2,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: 'top bottom',
        end: 'bottom top',
        scrub
      }
    }
  );
}

/* Cards that turn as they cross the screen. Each one enters leaning
   away from the reader, squares up as it reaches the middle, and leans
   off again — a real perspective, not a fade.

   Phones get a shallower angle and no blur: the effect is the same
   read at a fraction of the fill cost. */
export function depthPass(cards: Element[], opts: { rotate?: number; axis?: 'x' | 'y' } = {}) {
  const coarse = isCoarse();
  const { rotate = coarse ? 5 : 9, axis = 'x' } = opts;
  const prop = axis === 'x' ? 'rotationX' : 'rotationY';

  return cards.map((card) =>
    gsap.fromTo(
      card,
      { [prop]: rotate, scale: 0.94, opacity: 0.45, ...(coarse ? {} : { filter: 'blur(4px)' }) },
      {
        [prop]: -rotate * 0.5,
        scale: 1,
        opacity: 1,
        ...(coarse ? {} : { filter: 'blur(0px)' }),
        transformPerspective: 1100,
        transformOrigin: '50% 50%',
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top 92%', end: 'bottom 38%', scrub: 0.7 }
      }
    )
  );
}

/* A run of small marks that never quite settle. The phase is derived
   from the index, so a row of them breathes out of step instead of
   pulsing in unison — which is the difference between "alive" and
   "blinking". */
export function drift(els: Element[], amount = 10) {
  return els.map((el, i) =>
    gsap.to(el, {
      y: `random(${-amount}, ${amount})`,
      x: `random(${-amount / 2}, ${amount / 2})`,
      duration: 3.5 + (i % 5) * 0.7,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.18
    })
  );
}
