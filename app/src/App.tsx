import { useCallback, useState } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { LangProvider, useLang } from './lib/lang';
import { Loader, Nav } from './components/Chrome';
import { SmoothCursor } from './components/lightswind/smooth-cursor';
import { About, Hero, StackBand, Statement } from './components/SectionsTop';
import { Capabilities, Career, Contact, Credentials, Footer, Work } from './components/SectionsBottom';

function Site() {
  const { t } = useLang();
  const [ready, setReady] = useState(false);
  const done = useCallback(() => setReady(true), []);

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
      <div className="grain" aria-hidden="true" />

      <SmoothCursor />
      <Nav />

      <main id="main" className="relative">
        <Hero ready={ready} />
        <Statement />
        <StackBand />
        <About />
        <Capabilities />
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
