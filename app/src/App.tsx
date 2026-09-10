import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { LangProvider, useLang } from './lib/lang';
import { useSignals } from './lib/signals';
import { gsap, prefersReduced } from './lib/motion';
import { recede } from './lib/scenes';
import { Loader, Nav } from './components/Chrome';
import { Hud } from './components/Hud';
import { SmoothCursor } from './components/lightswind/smooth-cursor';
import { About, Fault, Hero } from './components/SectionsTop';
import { SystemMap } from './components/SystemMap';
import { Career, Contact, Credentials, Direction, Footer, Work } from './components/SectionsBottom';
import { useWebglQuality } from './lib/quality';

const SystemScene = lazy(() => import('./components/SystemScene'));

/* The page is a route, not a résumé layout: a fault enters, it is
   traced through a system, and the route ends by saying where it is
   going next.

     hero      — who, what, and where it is heading
     fault     — three faults from an ordinary day
     about     — the operator behind them                        01
     map       — the six connected areas each fault runs through 02
     career    — where he has applied them                       03
     work      — what he has built                               04
     cred      — what validates it                               05
     direction — where it goes next, and what each starts from   06
     contact   — how to reach him                                07

   About now precedes the map. A recruiter needs *who* before *what*,
   and the map is a better second chapter than a first: it reads as
   his system once you know whose it is. */
function Site() {
  const { t } = useLang();
  const [ready, setReady] = useState(false);
  const done = useCallback(() => setReady(true), []);
  const scene = useWebglQuality();

  // One pointer listener, one scroll listener and one rAF for the whole
  // site. Everything that reacts to you reads the properties this
  // publishes — see `lib/signals.ts`.
  useSignals();

  /* Depth, applied once for the whole document. Every chapter that is
     not pinned recedes as it leaves — falls back in z, softens, dims —
     so the page reads as one camera moving through a set rather than a
     stack of panels cutting to each other. Sections opt in with
     `data-stage` on the wrapper the effect should own; the pinned ones
     (fault, career) deliberately do not, because their own timeline
     already governs what happens while they hold the screen.

     This runs after the children's own scenes, so their triggers are
     already registered when these are added. */
  useEffect(() => {
    if (!ready || prefersReduced()) return;
    const ctx = gsap.context(() => {
      document.querySelectorAll('[data-stage]').forEach(recede);
    });
    return () => ctx.revert();
  }, [ready]);

  return (
    <>
      {!ready && <Loader onDone={done} />}

      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-[400] focus-visible:bg-cyan focus-visible:px-5 focus-visible:py-2.5 focus-visible:font-medium focus-visible:text-void"
      >
        {t.skip}
      </a>

      {/* The space the whole page is cut into. It is mounted once, here,
          rather than per-section: that is the difference between eight
          chapters that each own a canvas and one corridor you travel
          down. Held until the loader is done so the intro has the frame
          budget to itself. */}
      {ready && scene && (
        <Suspense fallback={null}>
          <SystemScene lite={scene === 'lite'} />
        </Suspense>
      )}

      <div className="grid-field" aria-hidden="true" />
      <div className="crosshair" aria-hidden="true" />
      <Hud />
      <div className="grain" aria-hidden="true" />

      <SmoothCursor />
      <Nav />

      <main id="main" className="relative">
        <Hero ready={ready} />
        <Fault />
        <About />
        <SystemMap />
        <Career />
        <Work />
        <Credentials />
        <Direction />
        <Contact />
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  /* Every Lightswind component here uses `m` rather than `motion`, and this
     hands them just the animation feature set. The full `motion` component
     statically pulls in drag, pan and layout projection as well — none of
     which this site uses — and that was a third of the motion chunk.
     `strict` makes the mistake loud: a stray `motion.*` throws. */
  return (
    <LazyMotion features={domAnimation} strict>
      <LangProvider>
        <Site />
      </LangProvider>
    </LazyMotion>
  );
}
