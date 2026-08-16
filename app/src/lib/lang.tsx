import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { COPY, type Lang } from '../content';

type Ctx = { lang: Lang; t: (typeof COPY)['ar']; toggle: () => void };

const LangContext = createContext<Ctx | null>(null);

function stored(): Lang {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(stored);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
    document.title = COPY[lang].meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', COPY[lang].meta.desc);
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* storage blocked — the choice just will not persist */
    }
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === 'ar' ? 'en' : 'ar')), []);
  const value = useMemo(() => ({ lang, t: COPY[lang], toggle }), [lang, toggle]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
