import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from 'react';
import { useLang } from '../lib/lang';
import { Chapter } from './Chapter';
import { CAPABILITIES, STACK } from '../content';
import { gsap, useScene, aura, EASE, prefersReduced, isCoarse } from '../lib/motion';

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

/* Geometry, in viewBox units. The box is square and the ring leaves
   room outside itself for labels on wide screens. */
const BOX = 400;
const C = BOX / 2;
const RING = 140;
const CORE_R = 54;
const NODE_R = 15;

type Pt = { x: number; y: number; ux: number; uy: number };

const NODES: Pt[] = CAPABILITIES.map((_, i) => {
  const a = (i / CAPABILITIES.length) * Math.PI * 2 - Math.PI / 2;
  return { x: C + Math.cos(a) * RING, y: C + Math.sin(a) * RING, ux: Math.cos(a), uy: Math.sin(a) };
});

type Edge = { key: string; a: number; b: number; x1: number; y1: number; x2: number; y2: number; len: number };

/* Core → node, then node → node for every relationship, de-duplicated.
   Every segment is trimmed back to the edge of the discs it joins, so a
   wire meets a node rather than running under it. */
const EDGES: Edge[] = (() => {
  const out: Edge[] = [];

  NODES.forEach((n, i) => {
    const x1 = C + n.ux * CORE_R;
    const y1 = C + n.uy * CORE_R;
    const x2 = C + n.ux * (RING - NODE_R);
    const y2 = C + n.uy * (RING - NODE_R);
    out.push({ key: `c-${i}`, a: -1, b: i, x1, y1, x2, y2, len: Math.hypot(x2 - x1, y2 - y1) });
  });

  CAPABILITIES.forEach((cap, i) => {
    (cap.links as readonly number[]).forEach((j) => {
      if (j <= i) return;
      const dx = NODES[j].x - NODES[i].x;
      const dy = NODES[j].y - NODES[i].y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      out.push({
        key: `${i}-${j}`,
        a: i,
        b: j,
        x1: NODES[i].x + ux * NODE_R,
        y1: NODES[i].y + uy * NODE_R,
        x2: NODES[j].x - ux * NODE_R,
        y2: NODES[j].y - uy * NODE_R,
        len: d - NODE_R * 2
      });
    });
  });

  return out;
})();

/* Tick marks around the core — the instrument register, and the one
   piece of pure decoration in the diagram. */
const TICKS = Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2;
  const r1 = CORE_R + 10;
  const r2 = r1 + (i % 4 === 0 ? 7 : 3.5);
  return {
    x1: C + Math.cos(a) * r1,
    y1: C + Math.sin(a) * r1,
    x2: C + Math.cos(a) * r2,
    y2: C + Math.sin(a) * r2,
    major: i % 4 === 0
  };
});

const CYCLE_MS = 3600;

/* How far a node leans toward the pointer, and how close the pointer
   has to get before it does. Both as fractions of the map's own width,
   so the effect is identical at every breakpoint. */
const LEAN = 0.035;
const REACH = 0.42;
const SWIPE = 44;

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

  /* An edge is live when both of its ends are lit. The core counts as
     always lit, so its wire to the active node is live too. */
  const liveEdge = useCallback(
    (e: Edge) => (e.a === -1 ? e.b === active : linked(e.a) && linked(e.b)),
    [active, linked]
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

  /* Proximity. The nodes lean toward the pointer and brighten as it
     nears them — the diagram acknowledges the cursor before anything is
     clicked, which is most of what makes it read as an instrument
     rather than a picture.

     Local coordinates, because the global pointer signal is
     viewport-relative and this needs to know where the cursor is
     inside the map. One rAF, and only where there is a pointer. */
  useEffect(() => {
    if (prefersReduced()) return;
    const el = wrap.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;
    let px = 0;
    let py = 0;
    let inside = false;

    const rest = (b: HTMLButtonElement) => {
      b.style.transform = 'translate(-50%, -50%)';
      b.style.setProperty('--near', '0');
    };

    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (!r.width) return;

      NODES.forEach((node, i) => {
        const b = btns.current[i];
        if (!b) return;
        if (!inside) return rest(b);

        const nx = r.left + (node.x / BOX) * r.width;
        const ny = r.top + (node.y / BOX) * r.height;
        const dist = Math.hypot(px - nx, py - ny);
        const near = Math.max(0, 1 - dist / (REACH * r.width));

        // Squared, so the lean stays subtle until the pointer is close.
        const pull = near * near * LEAN * r.width;
        const ax = dist > 0 ? ((px - nx) / dist) * pull : 0;
        const ay = dist > 0 ? ((py - ny) / dist) * pull : 0;

        b.style.transform = `translate(-50%, -50%) translate3d(${ax.toFixed(2)}px, ${ay.toFixed(2)}px, 0)`;
        b.style.setProperty('--near', near.toFixed(3));
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX;
      py = e.clientY;
      inside = true;
      schedule();
    };
    const onLeave = () => {
      inside = false;
      schedule();
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      btns.current.forEach((b) => b && rest(b));
    };
  }, []);

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

    /* A slow camera across the section, so the diagram is never sitting
       at exactly the same angle twice. */
    const swing = isCoarse() ? 7 : 3.5;
    gsap.fromTo(
      q('[data-camera]'),
      { rotate: -swing, scale: 0.94 },
      {
        rotate: swing,
        scale: 1.03,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.1 }
      }
    );

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
            <div data-camera className="absolute inset-0">
              <svg
                viewBox={`0 0 ${BOX} ${BOX}`}
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden="true"
                focusable="false"
              >
                {/* Two rings, opposite directions, slow enough to read as
                    drift rather than as spin. */}
                <g className="map-spin-slow" style={{ transformOrigin: `${C}px ${C}px` }}>
                  <circle
                    cx={C}
                    cy={C}
                    r={RING}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={0.6}
                    strokeDasharray="2 7"
                    className="text-ink-3/55"
                  />
                </g>

                <g className="map-spin" style={{ transformOrigin: `${C}px ${C}px` }}>
                  {TICKS.map((tk, i) => (
                    <line
                      key={i}
                      x1={tk.x1}
                      y1={tk.y1}
                      x2={tk.x2}
                      y2={tk.y2}
                      stroke="currentColor"
                      strokeWidth={tk.major ? 1 : 0.6}
                      className={tk.major ? 'text-cyan/55' : 'text-ink-3/40'}
                    />
                  ))}
                </g>

                {EDGES.map((e) => {
                  const live = liveEdge(e);
                  return (
                    <g key={e.key}>
                      <line
                        x1={e.x1}
                        y1={e.y1}
                        x2={e.x2}
                        y2={e.y2}
                        stroke="currentColor"
                        strokeWidth={live ? 1.2 : 0.8}
                        className={live ? 'text-cyan' : 'text-ink-3'}
                        opacity={live ? 0.8 : 0.32}
                        style={{ transition: 'opacity .45s, stroke-width .45s' }}
                      />
                      {/* The core feeds the whole ring, always — dim and
                          slow on the spokes that are not selected, so the
                          diagram is never actually still. */}
                      {e.a === -1 && !live && (
                        <line
                          x1={e.x1}
                          y1={e.y1}
                          x2={e.x2}
                          y2={e.y2}
                          stroke="var(--color-cyan)"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          className="edge-pulse"
                          opacity={0.28}
                          style={
                            {
                              '--edge-len': e.len,
                              '--edge-dur': `${(e.len / 26).toFixed(2)}s`,
                              '--edge-delay': `${e.b * 0.9}s`
                            } as CSSProperties
                          }
                        />
                      )}

                      {/* The travelling signal, on live wires only. */}
                      {live && (
                        <line
                          x1={e.x1}
                          y1={e.y1}
                          x2={e.x2}
                          y2={e.y2}
                          stroke="var(--color-cyan)"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          className="edge-pulse"
                          style={
                            {
                              '--edge-len': e.len,
                              '--edge-dur': `${(e.len / 120).toFixed(2)}s`,
                              '--edge-delay': `${(e.b % 3) * 0.22}s`
                            } as CSSProperties
                          }
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* ── the core ───────────────────────────────────── */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[var(--line-2)] bg-void/80 text-center backdrop-blur-sm"
                style={{ width: `${(CORE_R * 2 * 100) / BOX}%`, height: `${(CORE_R * 2 * 100) / BOX}%` }}
              >
                <div className="aperture-sweep" />
                <div className="px-2">
                  <p className="font-display text-[clamp(0.62rem,1.9vw,0.9rem)] font-bold leading-tight text-ink">
                    {t.caps.core}
                  </p>
                  <p className="mt-1 text-[clamp(0.5rem,1.35vw,0.62rem)] leading-tight text-cyan">
                    {t.caps.coreRole}
                  </p>
                </div>
              </div>

              {/* ── the nodes ──────────────────────────────────
                  Disc, numeral, hit area, focus ring and lean all on one
                  element. `--near` is written by the proximity loop and
                  drives the glow from CSS. */}
              {NODES.map((node, i) => (
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
                  className="map-node absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                  style={{ left: `${(node.x / BOX) * 100}%`, top: `${(node.y / BOX) * 100}%` }}
                >
                  <span className="sr-only">{t.caps.items[i].name}</span>
                  <span
                    aria-hidden="true"
                    className="map-node-halo"
                    style={{ ['--i' as string]: i }}
                  />
                  <span aria-hidden="true" className="map-node-disc">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span
                    aria-hidden="true"
                    className="map-node-label"
                    style={{ transform: `translate(${node.ux * 3.2}rem, ${node.uy * 2.6}rem)` }}
                  >
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
                ['LINKS', String(EDGES.filter((e) => e.a !== -1).length).padStart(2, '0')],
                ['ACTIVE', String(active + 1).padStart(2, '0')],
                ['LIT', String(NODES.filter((_, i) => linked(i)).length).padStart(2, '0')]
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
