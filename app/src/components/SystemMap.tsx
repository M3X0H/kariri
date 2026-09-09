import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from 'react';
import { useLang } from '../lib/lang';
import { Chapter } from './Chapter';
import { CAPABILITIES, STACK } from '../content';
import { gsap, useScene, aura, EASE, prefersReduced } from '../lib/motion';

const CapabilityField = lazy(() => import('./CapabilityField'));

/* ═══════════════════════════════════════════════════════════════
   SYSTEM MAP — the signature interaction.

   A personal technical system map, not a badge grid: he is the core,
   the six capability areas are nodes on a ring, and the wires between
   them are the ones that actually exist — a fault at the surveillance
   node is reached through systems, networking and hardware, which is
   what `CAPABILITIES[].links` records.

   The diagram is never quite still. Its instrument rings turn, live
   wires carry a pulse, and on a fine pointer the nodes lean toward the
   cursor and brighten as it approaches — so the map reads as something
   running rather than something drawn. Choosing a node lights what it
   touches and the panel beside it resolves out of blur.

   The discs are HTML, not SVG. That is deliberate: one element then
   carries the hit area, the focus ring, the accessible name, the
   numeral and the lean, instead of a `<circle>` and a button that have
   to be kept in step every frame.

   Mobile is not this diagram shrunk: the ring grows into real tap
   targets, the labels come off it, the panel moves underneath, and a
   swipe across the map walks the ring.
   ═══════════════════════════════════════════════════════════════ */

/* Where the controls sit when there is no WebGL — the same ring, laid
   out in percentages. When the field is running it takes these over and
   writes each button's transform from the projected 3D position
   instead; this is what the page falls back to, not what it aims for. */
const FALLBACK = CAPABILITIES.map((_, i) => {
  const a = (i / CAPABILITIES.length) * Math.PI * 2 - Math.PI / 2;
  return { left: 50 + Math.cos(a) * 35, top: 50 + Math.sin(a) * 35 };
});

const CYCLE_MS = 3600;

const SWIPE = 44;

/* Counted off the same data the scene wires, so a readout cannot claim
   a link the structure does not draw. */
const LINK_COUNT = CAPABILITIES.reduce(
  (sum, cap, i) => sum + (cap.links as readonly number[]).filter((j) => j > i).length,
  0
);

export function SystemMap() {
  const { t, lang } = useLang();
  const [active, setActive] = useState(0);
  /* Once someone has actually chosen a node, the map stops choosing for
     them — an auto-cycle that keeps overriding a deliberate choice is a
     carousel, and everybody hates carousels. */
  const [claimed, setClaimed] = useState(false);
  const [held, setHeld] = useState(false);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const n = CAPABILITIES.length;

  const linked = useCallback(
    (i: number) => i === active || (CAPABILITIES[active].links as readonly number[]).includes(i),
    [active]
  );

  /* The map breathes on its own until it is in someone's hands: it only
     cycles while it is on screen, nobody is hovering or focused inside
     it, and motion is allowed. */
  useEffect(() => {
    if (claimed || held || prefersReduced()) return;
    const el = wrap.current;
    if (!el) return;

    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (entry.isIntersecting) {
          timer = window.setInterval(() => setActive((i) => (i + 1) % n), CYCLE_MS);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      window.clearInterval(timer);
      io.disconnect();
    };
  }, [claimed, held, n]);

  /* The scene needs to know how heavy the WebGL may be — and whether it
     may run at all. Reduced motion keeps the fallback ring, which is
     static, legible and does everything the diagram has to do. */
  const [field, setField] = useState<null | 'full' | 'lite'>(null);
  useEffect(() => {
    if (prefersReduced()) return;
    try {
      const c = document.createElement('canvas');
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
      /* Phones keep the flat ring. The scene needs room to be read as
         a structure — seven bodies and their wires inside a 23rem
         square is a smudge, and it costs a WebGL context and a
         per-frame projection to draw it. The 2D ring says the same
         thing at that size, legibly and for nothing. */
      setField(window.innerWidth < 768 ? null : 'full');
    } catch {
      setField(null);
    }
  }, []);

  const core = useRef<HTMLDivElement>(null);

  const choose = useCallback((i: number) => {
    setActive(i);
    setClaimed(true);
  }, []);

  /* Arrow keys walk the ring, because a ring of six is a single widget
     rather than six unrelated controls. Left and right follow the
     reading direction; up and down are always previous and next. */
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      const rtl = lang === 'ar';
      let next: number | null = null;

      if (e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) next = (active + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) next = (active - 1 + n) % n;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = n - 1;
      if (next === null) return;

      e.preventDefault();
      choose(next);
      btns.current[next]?.focus();
    },
    [active, choose, lang, n]
  );

  /* Touch: a swipe across the diagram walks the ring. There is no hover
     on a phone, so without this the map's only affordance is six small
     taps — and a ring is a thing you expect to be able to spin. */
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const onDown = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse') return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };

  const onUp = (e: ReactPointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || e.pointerType === 'mouse') return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    // Vertical wins ties, so a scroll that drifts sideways is still a scroll.
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy)) return;
    const forward = lang === 'ar' ? dx > 0 : dx < 0;
    setActive((i) => (i + (forward ? 1 : -1) + n) % n);
    setClaimed(true);
  };

  /* The panel does not swap, it resolves. React has already replaced the
     copy by the time this runs, so the new text arrives out of blur
     instead of appearing between two frames. */
  useEffect(() => {
    if (prefersReduced()) return;
    const el = panel.current;
    if (!el) return;
    const rows = el.querySelectorAll('[data-morph]');
    const tw = gsap.fromTo(
      rows,
      { opacity: 0, y: 14, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.05, ease: EASE, overwrite: true }
    );
    return () => {
      tw.kill();
      gsap.set(rows, { clearProps: 'opacity,transform,filter' });
    };
  }, [active]);

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);

    gsap.from(q('[data-map]'), {
      opacity: 0,
      scale: 0.9,
      duration: 1.1,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 74%' }
    });

    gsap.from(q('[data-lead]'), {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 78%' }
    });

    gsap.from(q('[data-chip]'), {
      opacity: 0,
      y: 12,
      duration: 0.4,
      stagger: 0.02,
      ease: EASE,
      scrollTrigger: { trigger: q('[data-stack]')[0], start: 'top 90%' }
    });
  }, [lang]);

  const cap = t.caps.items[active];
  const tech = useMemo(() => CAPABILITIES[active].tech as readonly string[], [active]);

  return (
    <section
      ref={root}
      id="capabilities"
      className="chapter-edge scene-full relative scroll-mt-[var(--rail)] px-[var(--pad)] py-[clamp(3rem,7vh,5rem)]"
      style={aura(206)}
    >
      <div className="aura" />

      <div data-stage className="relative z-10 mx-auto w-full max-w-[88rem]">
        <div data-lead>
          <Chapter index="01" name={t.caps.tag} className="mb-8" />
          <p className="measure mb-10 text-lg text-ink-2 md:mb-14 md:text-xl">{t.caps.lead}</p>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          {/* ── the diagram ──────────────────────────────────── */}
          <div
            ref={wrap}
            data-map
            className="relative mx-auto aspect-square w-full max-w-[23rem] touch-pan-y sm:max-w-[27rem] lg:mx-0 lg:max-w-[34rem]"
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            onFocusCapture={() => setHeld(true)}
            onBlurCapture={() => setHeld(false)}
            onPointerDown={onDown}
            onPointerUp={onUp}
          >
            <div data-camera className="map-stage absolute inset-0">
              {/* The structure. Seven bodies in real space, wired by
                  curves that bow through the volume, with charge running
                  the live ones — see `CapabilityField`. */}
              {field && (
                <Suspense fallback={null}>
                  <CapabilityField
                    active={active}
                    isLit={linked}
                    nodeEls={btns}
                    coreEl={core}
                    lite={field === 'lite'}
                  />
                </Suspense>
              )}

              {/* Without WebGL the ring is drawn flat and the controls
                  keep their percentage positions. */}
              {!field && (
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    strokeDasharray="1 2"
                    className="text-ink-3/50"
                  />
                </svg>
              )}

              {/* ── the core ───────────────────────────────────── */}
              <div
                ref={core}
                className="pointer-events-none absolute grid place-items-center text-center"
                style={
                  field
                    ? { left: 0, top: 0, width: '13rem' }
                    : { left: '50%', top: '50%', width: '13rem', transform: 'translate(-50%, -50%)' }
                }
              >
                <p
                  className="font-display text-[clamp(0.68rem,2vw,1rem)] font-bold leading-tight text-ink"
                  style={{ textShadow: '0 0 10px rgb(7 8 10 / 0.95), 0 0 22px rgb(7 8 10 / 0.8)' }}
                >
                  {t.caps.core}
                </p>
                <p
                  className="mt-1 text-[clamp(0.52rem,1.4vw,0.66rem)] leading-tight text-cyan"
                  style={{ textShadow: '0 0 10px rgb(7 8 10 / 0.95)' }}
                >
                  {t.caps.coreRole}
                </p>
              </div>

              {/* ── the controls ───────────────────────────────
                  Real buttons, carried by the scene. It writes each
                  one's transform from the projected position of its body
                  every frame, so the hit area, the focus ring and the
                  accessible name stay the platform's while the thing you
                  look at is WebGL. */}
              {CAPABILITIES.map((_, i) => (
                <button
                  key={i}
                  ref={(el) => {
                    btns.current[i] = el;
                  }}
                  type="button"
                  onClick={() => choose(i)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                  onFocus={() => setActive(i)}
                  onKeyDown={onKey}
                  aria-pressed={active === i}
                  aria-controls="capability-detail"
                  data-state={active === i ? 'on' : linked(i) ? 'lit' : 'off'}
                  className="map-node absolute grid h-12 w-12 place-items-center rounded-full"
                  style={
                    field
                      ? { left: 0, top: 0 }
                      : {
                          left: `${FALLBACK[i].left}%`,
                          top: `${FALLBACK[i].top}%`,
                          transform: 'translate(-50%, -50%)'
                        }
                  }
                >
                  <span className="sr-only">{t.caps.items[i].name}</span>
                  <span aria-hidden="true" className="map-node-ring" />
                  <span aria-hidden="true" className="map-node-num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true" className="map-node-label">
                    {t.caps.items[i].name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── the readable half ────────────────────────────── */}
          <div ref={panel} id="capability-detail" aria-live="polite" className="lg:min-h-[19rem]">
            <p data-morph className="label ltr">
              {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </p>

            <h3 data-morph className="display-type mt-3 text-[clamp(1.7rem,5vw,3rem)]">
              {cap.name}
            </h3>

            <p data-morph className="measure mt-5 text-base text-ink-2 md:text-lg">
              {cap.desc}
            </p>

            <ul data-morph className="mt-7 flex flex-wrap gap-1.5">
              {tech.map((x) => (
                <li
                  key={x}
                  lang="en"
                  className="border border-[var(--line)] bg-graphite/40 px-2.5 py-1 font-mono text-[0.65rem] text-ink-2"
                >
                  {x}
                </li>
              ))}
            </ul>

            <p className="label mt-8 flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cyan" />
              {t.caps.hint}
            </p>

            {/* The diagram, instrumented. Every figure is read off the
                graph itself, so a readout cannot drift out of step with
                what is actually drawn above it. */}
            <div className="readout-grid mt-8" aria-hidden="true">
              {[
                ['NODES', String(n).padStart(2, '0')],
                ['LINKS', String(LINK_COUNT).padStart(2, '0')],
                ['ACTIVE', String(active + 1).padStart(2, '0')],
                ['LIT', String(CAPABILITIES.filter((_, i) => linked(i)).length).padStart(2, '0')]
              ].map(([k, v]) => (
                <div key={k} className="readout-cell">
                  <p lang="en" className="readout-value">{v}</p>
                  <p lang="en" className="label ltr mt-1 text-[0.55rem]">{k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The working stack, stated once and plainly. */}
        <div data-stack className="rule mt-14 pt-7 md:mt-20">
          <p className="label mb-4">{t.stackTag}</p>
          <ul className="flex flex-wrap gap-x-2 gap-y-2">
            {STACK.map((s) => (
              <li
                key={s}
                data-chip
                lang="en"
                className="row-step border border-[var(--line)] px-3 py-1.5 font-mono text-xs text-ink-3 hover:border-cyan/50 hover:text-ink" style={{ ['--step' as string]: '4px' }}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default SystemMap;
