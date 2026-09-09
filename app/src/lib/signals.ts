import { useEffect } from 'react';
import { prefersReduced } from './motion';

/* ═══════════════════════════════════════════════════════════════
   The page's two nerves.

   Everything on this site that "responds to you" responds to one of
   two signals — where the pointer is, and how fast you are reading —
   and both are published here as custom properties on the root. A
   consumer is then a line of CSS rather than a component with its own
   listener, which is the whole reason the page reads as one organism
   instead of thirty widgets that each happen to move.

   It also costs one rAF loop and two passive listeners for the entire
   site, and the loop parks itself the moment nothing is changing.

     --px  --py    pointer, 0…1 across the viewport, smoothed
     --pxc --pyc   the same, centred to -1…1
     --vel         scroll velocity, -1…1, decays to rest
     --scroll      progress through the document, 0…1

   Under reduced motion the loop never starts and every consumer falls
   back to the neutral values declared in `index.css`. `--scroll` is the
   exception: it is a position, not a motion, and the navigation's
   progress ring would otherwise sit frozen at zero.
   ═══════════════════════════════════════════════════════════════ */

/* How hard the smoothing pulls. Low enough that a flicked pointer
   glides rather than snaps, high enough not to feel like lag. */
const EASE_POINTER = 0.085;
const EASE_VEL = 0.12;

/* One wheel notch is roughly 100px, so this puts an ordinary scroll
   near ±1 and leaves a fast flick to clamp. */
const VEL_SCALE = 90;
const VEL_DECAY = 0.86;

/* Frames to keep spinning after everything has settled, so a value
   that is drifting in the last thousandth still lands before we park. */
const IDLE_FRAMES = 8;

export function useSignals() {
  useEffect(() => {
    const root = document.documentElement;
    const set = (k: string, v: number) => root.style.setProperty(k, v.toFixed(4));

    /* `--scroll` is state, not motion: it says how far down the document
       you are, and the navigation draws a progress ring from it. Reduced
       motion should not leave that ring stuck at zero, so it is published
       either way — it is one property write per scroll event, and nothing
       animates because of it. */
    const progress = () => {
      const span = root.scrollHeight - window.innerHeight;
      set('--scroll', span > 0 ? window.scrollY / span : 0);
    };

    if (prefersReduced()) {
      progress();
      window.addEventListener('scroll', progress, { passive: true });
      window.addEventListener('resize', progress, { passive: true });
      return () => {
        window.removeEventListener('scroll', progress);
        window.removeEventListener('resize', progress);
      };
    }

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let tx = 0.5;
    let ty = 0.5;
    let x = 0.5;
    let y = 0.5;
    let vel = 0;
    let velTarget = 0;
    let lastY = window.scrollY;

    let raf = 0;
    let idle = 0;

    const tick = () => {
      x += (tx - x) * EASE_POINTER;
      y += (ty - y) * EASE_POINTER;
      vel += (velTarget - vel) * EASE_VEL;
      // The target bleeds away on its own, so the lean returns to rest
      // when the wheel stops rather than sticking at its last value.
      velTarget *= VEL_DECAY;

      set('--px', x);
      set('--py', y);
      set('--pxc', x * 2 - 1);
      set('--pyc', y * 2 - 1);
      set('--vel', vel);

      const live =
        Math.abs(tx - x) > 0.0015 || Math.abs(ty - y) > 0.0015 || Math.abs(vel) > 0.002;

      if (live) idle = 0;
      raf = live || idle++ < IDLE_FRAMES ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      idle = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      wake();
    };

    const onScroll = () => {
      const now = window.scrollY;
      velTarget = Math.max(-1, Math.min(1, (now - lastY) / VEL_SCALE));
      lastY = now;
      progress();
      wake();
    };

    if (fine) window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}
