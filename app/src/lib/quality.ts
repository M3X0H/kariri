import { useEffect, useState } from 'react';
import { prefersReduced } from './motion';

export type Quality = null | 'full' | 'lite';

/* ═══════════════════════════════════════════════════════════════
   Whether this browser gets WebGL at all, and how much of it.

   Three components asked this question and each had grown its own
   slightly different copy of the answer, which is how a page ends up
   running a heavy scene on a phone that opted out of motion. One
   decision, made once.

   `null` is not a failure state — it is a supported one. Every scene
   on this site has a composition that works without it, and reduced
   motion takes that path deliberately rather than as a degradation.
   ═══════════════════════════════════════════════════════════════ */
export function useWebglQuality(): Quality {
  const [quality, setQuality] = useState<Quality>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    try {
      const c = document.createElement('canvas');
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
      setQuality(window.innerWidth < 768 ? 'lite' : 'full');
    } catch {
      setQuality(null);
    }
  }, []);

  return quality;
}
