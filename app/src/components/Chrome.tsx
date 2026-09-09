import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { m, useScroll, useSpring } from 'framer-motion';
import { useLang } from '../lib/lang';
import { gsap, prefersReduced, EASE } from '../lib/motion';

/* The chapters that carry a number on the page, in page order. The hero
   is not one of them: it is reached through the wordmark, which every
   visitor already reads as "home", and dropping it from the bar buys the
   width that the credentials chapter needs. */
export const NAV = ['capabilities', 'about', 'career', 'work', 'credentials', 'contact'] as const;

/* What the scroll spy watches. `start` and `fault` have no entry in the
   bar, but they still have to be here or the spy reports the chapter
   below them as current while the hero is still on screen. */
const TRACKED = ['start', 'fault', ...NAV] as const;

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
        <span lang="en" className="font-mono text-xs uppercase tracking-[0.3em] text-ink-3">
          Mohammed Kariri
        </span>
        <span className="font-display text-[clamp(3rem,12vw,9rem)] leading-none tabular-nums text-ink">
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

   The full bar appears at `lg`, not `md`: six Arabic chapter names plus
   the wordmark and the two controls need more than 768px, and at that
   width they were colliding rather than wrapping.
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

  /* One underline that travels between the chapters rather than six
     that scale in and out on the spot. The bar is measured from the
     link the spy has marked current, so it stays correct through a
     language flip, a resize and the bar's own collapse into a pill. */
  const bar = useRef<HTMLElement>(null);
  const [ind, setInd] = useState({ x: 0, w: 0, on: false });

  /* The sheet outlives `open` by the length of its own exit, or it
     would vanish mid-animation the moment the state flips back. */
  const sheet = useRef<HTMLDivElement>(null);
  const toggleBtn = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const isMounted = useRef(false);
  isMounted.current = mounted;

  const labels: Record<string, string> = {
    capabilities: t.nav.caps,
    about: t.nav.about,
    career: t.nav.career,
    work: t.nav.work,
    credentials: t.cred.tag,
    contact: t.nav.contact
  };

  useLayoutEffect(() => {
    const nav = bar.current;
    if (!nav) return;

    /* Returns the *same* state object when nothing has moved. This
       effect is allowed to run after any render, and handing back a
       fresh object every time would schedule another render from
       inside a layout effect — which is an infinite loop, not a
       re-measure. */
    const measure = () => {
      const el = nav.querySelector<HTMLElement>('[aria-current="page"]');
      setInd((v) => {
        if (!el) return v.on ? { ...v, on: false } : v;
        const x = el.offsetLeft;
        const w = el.offsetWidth;
        return v.on && v.x === x && v.w === w ? v : { x, w, on: true };
      });
    };

    measure();
    // The pill animates its own width for half a second after `compact`
    // flips, so one late reading catches up with where the links landed.
    const t = window.setTimeout(measure, 520);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [active, lang, compact]);

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

      let current: string = TRACKED[0];
      for (const id of TRACKED) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) current = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = TRACKED[TRACKED.length - 1];
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

  /* Opening wipes the sheet down and deals the chapters out under it.
     Closing runs the same thing backwards and only then unmounts, which
     is the whole reason `mounted` exists as separate state. */
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!isMounted.current) return;

    const el = sheet.current;
    if (!el || prefersReduced()) {
      setMounted(false);
      return;
    }

    const tl = gsap
      .timeline({ onComplete: () => setMounted(false) })
      .to(el.querySelectorAll('[data-sheet-link]'), {
        opacity: 0,
        y: -16,
        duration: 0.2,
        stagger: 0.03,
        ease: 'power2.in'
      })
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.4, ease: 'power4.inOut' }, 0.08);

    return () => {
      tl.kill();
    };
  }, [open]);

  useEffect(() => {
    const el = sheet.current;
    if (!open || !mounted || !el) return;

    // Focus moves into the sheet, and back to the control that opened it.
    const first = el.querySelector<HTMLAnchorElement>('a');
    if (prefersReduced()) {
      first?.focus();
      return () => toggleBtn.current?.focus();
    }

    const tl = gsap
      .timeline({ onComplete: () => first?.focus() })
      .fromTo(
        el,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.5, ease: 'power4.inOut' }
      )
      .fromTo(
        el.querySelectorAll('[data-sheet-link]'),
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.055, ease: EASE },
        0.18
      );

    return () => {
      tl.kill();
      toggleBtn.current?.focus();
    };
  }, [open, mounted]);

  return (
    <>
      {/* How far through the page you are, as one hairline. */}
      <m.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[130] h-px origin-left bg-gradient-to-r from-cyan via-blue to-violet motion-reduce:hidden"
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
              ? 'glass w-[min(94vw,30rem)] rounded-full px-4 py-2 lg:w-[min(94vw,66rem)]'
              : 'w-[min(96vw,88rem)] px-[max(1.25rem,env(safe-area-inset-left))]'
          ].join(' ')}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
        >
          <a href="#start" className="flex h-10 shrink-0 items-center gap-2.5">
            <span
              lang="en"
              className="grid h-7 w-7 place-items-center bg-ink font-mono text-[0.6rem] font-medium text-void"
            >
              MK
            </span>
            <span className={['font-display text-sm', compact ? 'hidden sm:inline' : ''].join(' ')}>
              {t.brand}
            </span>
          </a>

          <nav
            ref={bar}
            aria-label={t.nav.menu}
            className="relative ms-auto hidden items-center gap-0.5 lg:flex"
          >
            {NAV.map((id, i) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? 'page' : undefined}
                className={[
                  'u-line relative px-3 py-2 text-sm transition-colors duration-300',
                  active === id ? 'text-ink' : 'text-ink-3 hover:text-ink'
                ].join(' ')}
              >
                <span aria-hidden="true" className="me-1.5 hidden font-mono text-[0.6rem] opacity-50 xl:inline">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {labels[id]}
              </a>
            ))}

            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1 h-px bg-cyan"
              style={{
                left: ind.x + 12,
                width: Math.max(0, ind.w - 24),
                opacity: ind.on ? 1 : 0,
                transition: 'left .5s var(--ease-signal), width .5s var(--ease-signal), opacity .3s'
              }}
            />
          </nav>

          <div className="ms-auto flex items-center gap-1 lg:ms-0">
            <button
              onClick={toggle}
              aria-label={t.nav.lang}
              className="flex h-10 items-center gap-1.5 px-2 text-ink-2 transition-colors hover:text-ink"
            >
              <Globe size={15} aria-hidden />
              <span className="font-mono text-[0.65rem]">{lang === 'ar' ? 'EN' : 'ع'}</span>
            </button>
            <button
              ref={toggleBtn}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-sheet"
              aria-label={t.nav.menu}
              className="relative grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-ink lg:hidden"
            >
              {/* How far down the page you are, drawn around the control
                  that opens the page's index. There is no room for a
                  progress bar on a phone, and this needs none. */}
              <span aria-hidden="true" className="menu-ring" />
              {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {/* Sheet: full bleed, large type, one chapter per line. */}
      <div
        id="menu-sheet"
        ref={sheet}
        hidden={!mounted}
        className="fixed inset-0 z-[110] flex flex-col justify-center gap-1 bg-void/95 px-[6vw] backdrop-blur-xl lg:hidden"
      >
        {NAV.map((id, i) => (
          <a
            key={id}
            data-sheet-link
            href={`#${id}`}
            aria-current={active === id ? 'page' : undefined}
            className="row-step relative flex items-baseline gap-4 border-b border-[var(--line)] py-4 font-display text-[clamp(1.6rem,7.5vw,2.6rem)] leading-none"
          >
            <span aria-hidden="true" className="font-mono text-[0.7rem] text-cyan">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={active === id ? 'text-cyan' : 'text-ink'}>{labels[id]}</span>
            {active === id && (
              <span
                aria-hidden="true"
                className="ms-auto h-1.5 w-1.5 self-center rounded-full bg-cyan shadow-[0_0_10px_2px_rgb(92_225_230/0.6)]"
              />
            )}
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
