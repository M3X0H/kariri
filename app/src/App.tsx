import { useCallback, useState } from 'react';
import { LangProvider, useLang } from './lib/lang';
import { Cursor, Loader, Nav } from './components/Chrome';
import { About, Hero, Statement } from './components/SectionsTop';
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

      <Cursor />
      <Nav />

      <main id="main" className="relative">
        <Hero ready={ready} />
        <Statement />
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
  return (
    <LangProvider>
      <Site />
    </LangProvider>
  );
}
