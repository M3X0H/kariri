import { useCallback, useState } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { LangProvider, useLang } from './lib/lang';
import { useSignals } from './lib/signals';
import { Loader, Nav } from './components/Chrome';
import { SmoothCursor } from './components/lightswind/smooth-cursor';
import { About, Fault, Hero } from './components/SectionsTop';
import { SystemMap } from './components/SystemMap';
import { Career, Contact, Credentials, Footer, Work } from './components/SectionsBottom';

/* The page is a route, not a résumé layout: a fault enters, it is
   traced through a system, and the person who does the tracing is
   introduced by his work rather than ahead of it.

     hero      — who, at the centre of his own network
     fault     — three faults from an ordinary day
     map       — the six connected areas each one runs through   01
     about     — the operator behind them                        02
     career    — where he has applied them                       03
     work      — what he has built                               04
     cred      — what validates it                               05
     contact   — how to reach him                                06 */
function Site() {
  const { t } = useLang();
  const [ready, setReady] = useState(false);
  const done = useCallback(() => setReady(true), []);

  // One pointer listener, one scroll listener and one rAF for the whole
  // site. Everything that reacts to you reads the properties this
  // publishes — see `lib/signals.ts`.
  useSignals();

  return (
    <>
      {!ready && <Loader onDone={done} />}

      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-[400] focus-visible:bg-cyan focus-visible:px-5 focus-visible:py-2.5 focus-visible:font-medium focus-visible:text-void"
      >
        {t.skip}
      </a>

      <div className="grid-field" aria-hidden="true" />
      <div className="pointer-light" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <SmoothCursor />
      <Nav />

      <main id="main" className="relative">
        <Hero ready={ready} />
        <Fault />
        <SystemMap />
        <About />
        <Career />
        <Work />
        <Credentials />
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
