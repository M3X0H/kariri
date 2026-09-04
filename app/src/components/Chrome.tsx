import { useCallback, useEffect, useRef, useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { m, useScroll, useSpring } from 'framer-motion';
import { useLang } from '../lib/lang';
import { gsap, prefersReduced } from '../lib/motion';

export const SECTIONS = ['start', 'about', 'capabilities', 'career', 'work', 'contact'] as const;

/* ═══════════════════════════════════════════════════════════════
   Loading sequence
   Counts to 100 and wipes away. Capped hard: the point is a composed
   entrance, not a toll gate.
   ═══════════════════════════════════════════════════════════════ */
export function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const shell = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (prefersReduced()) {
      onDone();
      return;
    }

    const START = performance.now();
    const RUN = 1000;
    let raf = 0;

    const finish = () => {
      if (done.current) return;
      done.current = true;
      const el = shell.current;
      if (!el) return onDone();

      gsap
        .timeline({ onComplete: onDone })
        .to(el.querySelectorAll('[data-fade]'), { opacity: 0, duration: 0.25, ease: 'power1.out' })
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'power4.inOut' }, '-=0.05');
    };

    const step = (now: number) => {
      const p = Math.min(1, (now - START) / RUN);
      // Ease the count so it decelerates into 100 rather than ticking flat.
      setPct(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(step);
      else finish();
    };
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  if (prefersReduced()) return null;

  return (
    <div
      ref={shell}
      className="fixed inset-0 z-[200] flex flex-col justify-end bg-void px-[6vw] pb-[8vh]"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div data-fade className="flex items-end justify-between gap-6">
        <span className="font-mono text-ink-3 text-xs tracking-[0.3em] uppercase">Mohammed Kariri</span>
        <span className="font-display text-ink text-[clamp(3rem,12vw,9rem)] leading-none tabular-nums">
          {String(pct).padStart(3, '0')}
        </span>
      </div>
      <div data-fade className="mt-6 h-px w-full bg-[var(--line)]">
        <div
          className="h-full bg-cyan transition-[width] duration-100 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Navigation
   Wide and transparent at rest; a compact glass pill once you leave
   the hero. In-page links are driven here rather than left to the
   browser's fragment jump, so they clear the fixed bar, move focus to
   the destination, and behave the same through Back and Forward.
   ═══════════════════════════════════════════════════════════════ */
export function Nav() {
  const { t, lang, toggle } = useLang();
  const { scrollYProgress } = useScroll();
  // Sprung, so the rail eases into place instead of tracking the wheel
  // one-to-one and reading as a scrollbar.
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('start');
  const lastHash = useRef({ hash: '', at: 0 });

  const labels: Record<string, string> = {
    start: t.nav.home,
    about: t.nav.about,
    capabilities: t.nav.caps,
    career: t.nav.career,
    work: t.nav.work,
    contact: t.nav.contact
  };

  const goTo = useCallback((id: string, smooth: boolean) => {
    const el = document.getElementById(id);
    if (!el) return;
    lastHash.current = { hash: '#' + id, at: Date.now() };

    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const top = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - margin));
    window.scrollTo({ top, behavior: smooth && !prefersReduced() ? 'smooth' : 'auto' });

    if (el.tabIndex < 0) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }, []);

  // Scroll state: compact bar plus the active section.
  useEffect(() => {
    let ticking = false;
    const read = () => {
      ticking = false;
      setCompact(window.scrollY > window.innerHeight * 0.6);

      let current: (typeof SECTIONS)[number] = SECTIONS[0];
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) current = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = SECTIONS[SECTIONS.length - 1];
      }
      setActive(current);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Intercept same-page links anywhere in the document.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.hasAttribute('download') || link.target === '_blank') return;

      const href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#' || href.length < 2) return;
      const el = document.getElementById(href.slice(1));
      if (!el) return;

      e.preventDefault();
      setOpen(false);
      goTo(href.slice(1), true);
      if (location.hash !== href) history.pushState(null, '', href);
    };

    // popstate and hashchange can both fire for one change; collapse them
    // or the page jumps to the same place twice.
    const sync = (smooth: boolean) => () => {
      const hash = location.hash;
      if (hash === lastHash.current.hash && Date.now() - lastHash.current.at < 500) return;
      if (hash.length > 1) goTo(hash.slice(1), smooth);
    };
    const onPop = sync(false);
    const onHash = sync(true);

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onHash);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onHash);
    };
  }, [goTo]);

  // Escape closes the overlay; the page behind it must not scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* How far through the page you are, as one hairline. */}
      <m.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[130] h-px origin-left bg-gradient-to-r from-cyan via-violet to-magenta motion-reduce:hidden"
        style={{ scaleX: progress, transformOrigin: lang === 'ar' ? 'right' : 'left' }}
      />

      <header
        className={[
          'fixed inset-x-0 top-0 z-[120] transition-all duration-500',
          compact ? 'py-3' : 'py-5 md:py-7'
        ].join(' ')}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div
          className={[
            'mx-auto flex items-center gap-4 transition-all duration-500',
            compact
              ? 'glass w-[min(94vw,44rem)] rounded-full px-4 py-2'
              : 'w-[min(96vw,88rem)] px-[max(1.25rem,env(safe-area-inset-left))]'
          ].join(' ')}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
        >
          <a href="#start" className="flex items-center gap-2.5 shrink-0">
            <span className="grid h-7 w-7 place-items-center bg-ink font-mono text-[0.6rem] font-medium text-void">
              MK
            </span>
            <span className={['font-display text-sm', compact ? 'hidden sm:inline' : ''].join(' ')}>
              {t.brand}
            </span>
          </a>

          <nav aria-label={t.nav.menu} className="ms-auto hidden items-center gap-1 md:flex">
            {SECTIONS.map((id, i) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? 'true' : undefined}
                className={[
                  'group relative px-3 py-2 text-sm transition-colors duration-300',
                  active === id ? 'text-ink' : 'text-ink-3 hover:text-ink'
                ].join(' ')}
              >
                <span className="me-1.5 font-mono text-[0.6rem] opacity-50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {labels[id]}
                <span
                  className={[
                    'absolute inset-x-2 bottom-1 h-px bg-cyan transition-transform duration-500',
                    active === id ? 'scale-x-100' : 'scale-x-0'
                  ].join(' ')}
                  style={{ transformOrigin: lang === 'ar' ? 'right' : 'left' }}
                />
              </a>
            ))}
          </nav>

          <div className={['flex items-center gap-1', compact ? 'ms-auto md:ms-0' : 'ms-auto md:ms-0'].join(' ')}>
            <button
              onClick={toggle}
              aria-label={t.nav.lang}
              className="flex h-10 items-center gap-1.5 px-2 text-ink-2 transition-colors hover:text-ink"
            >
              <Globe size={15} aria-hidden />
              <span className="font-mono text-[0.65rem]">{lang === 'ar' ? 'EN' : 'ع'}</span>
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-sheet"
              aria-label={t.nav.menu}
              className="grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-ink md:hidden"
            >
              {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet: full bleed, large type, one item per line. */}
      <div
        id="menu-sheet"
        hidden={!open}
        className="fixed inset-0 z-[110] flex flex-col justify-center gap-1 bg-void/95 px-[6vw] backdrop-blur-xl md:hidden"
      >
        {SECTIONS.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-baseline gap-4 border-b border-[var(--line)] py-4 font-display text-[clamp(1.7rem,8vw,2.6rem)] leading-none"
          >
            <span className="font-mono text-[0.7rem] text-cyan">{String(i + 1).padStart(2, '0')}</span>
            <span className={active === id ? 'text-cyan' : 'text-ink'}>{labels[id]}</span>
          </a>
        ))}
      </div>
    </>
  );
}

/* The pointer companion that used to live here is now Lightswind's
   SmoothCursor — see `./lightswind/smooth-cursor.tsx`. It keeps the dot and
   ring, and adds velocity: the ring rotates into the direction of travel,
   stretches along it, and snaps to `[data-magnetic]` targets. */
