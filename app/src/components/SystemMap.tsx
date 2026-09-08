import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent
} from 'react';
import { useLang } from '../lib/lang';
import { CAPABILITIES, STACK } from '../content';
import { gsap, useScene, aura, EASE, prefersReduced } from '../lib/motion';

/* ═══════════════════════════════════════════════════════════════
   SYSTEM MAP — the signature interaction.

   A personal technical system map, not a badge grid: he is the core,
   the six capability areas are nodes on a ring, and the wires between
   them are the ones that actually exist — a fault at the surveillance
   node is reached through systems, networking and hardware, which is
   what `CAPABILITIES[].links` records.

   Choosing a node lights it, lights everything it touches, and runs a
   pulse down each live wire. The detail panel is the readable half; the
   diagram is the memorable one.

   Mobile is not this diagram shrunk: the labels come off the ring, the
   dots grow into real tap targets, and the panel moves underneath.
   ═══════════════════════════════════════════════════════════════ */

/* Geometry, in viewBox units. The box is square and the ring leaves room
   outside itself for labels on wide screens. */
const BOX = 400;
const C = BOX / 2;
const RING = 140;
const CORE_R = 54;
const NODE_R = 13;

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
          timer = window.setInterval(() => setActive((i) => (i + 1) % CAPABILITIES.length), CYCLE_MS);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      window.clearInterval(timer);
      io.disconnect();
    };
  }, [claimed, held]);

  const choose = useCallback((i: number) => {
    setActive(i);
    setClaimed(true);
  }, []);

  /* Arrow keys walk the ring, because a ring of six is a single widget
     rather than six unrelated controls. Left and right follow the
     reading direction; up and down are always previous and next. */
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      const n = CAPABILITIES.length;
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
    [active, choose, lang]
  );

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);

    gsap.from(q('[data-map]'), {
      opacity: 0,
      scale: 0.9,
      duration: 1.1,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 74%' }
    });

    gsap.from(q('[data-panel-row]'), {
      opacity: 0,
      y: 22,
      duration: 0.7,
      stagger: 0.09,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 70%' }
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
      className="chapter-edge relative scroll-mt-[var(--rail)] px-[max(1.25rem,5vw)] py-[clamp(4rem,9vh,7rem)]"
      style={aura(206)}
    >
      <div className="aura" />

      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 className="label mb-3">
          <span aria-hidden="true"><span className="text-cyan">01</span> — </span>{t.caps.tag}
        </h2>
        <p className="measure mb-10 text-lg text-ink-2 md:mb-14 md:text-xl">{t.caps.lead}</p>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          {/* ── the diagram ──────────────────────────────────── */}
          <div
            ref={wrap}
            data-map
            className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[26rem] lg:mx-0 lg:max-w-[34rem]"
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            onFocusCapture={() => setHeld(true)}
            onBlurCapture={() => setHeld(false)}
          >
            <svg
              viewBox={`0 0 ${BOX} ${BOX}`}
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
              focusable="false"
            >
              {/* The ring the nodes sit on. */}
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

              {/* Node discs. The buttons that drive them are real HTML on
                  top of this, so hit areas, focus rings and screen-reader
                  names are the platform's rather than re-invented in SVG. */}
              {/* Three states, and the numeral has to stay legible in all
                  of them: unlit is an outlined disc on the ground, linked
                  is the same disc washed cyan, and the active one is a
                  solid cyan disc with the numeral knocked out of it. A
                  cyan numeral on a cyan fill — which is what "linked" used
                  to be — is simply invisible. */}
              {NODES.map((n, i) => {
                const lit = linked(i);
                const on = i === active;
                return (
                  <g key={i}>
                    {lit && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={on ? 28 : 20}
                        className="fill-cyan"
                        opacity={on ? 0.16 : 0.08}
                        style={{ transition: 'r .4s, opacity .4s' }}
                      />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={on ? 13 : 11}
                      className={on ? 'fill-cyan' : 'fill-void'}
                      style={{ transition: 'r .35s' }}
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={on ? 13 : 11}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.2}
                      className={lit ? 'text-cyan' : 'text-ink-3'}
                      opacity={lit ? 1 : 0.7}
                      style={{ transition: 'r .35s, opacity .35s' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* ── the core ─────────────────────────────────────
                He is the centre of the diagram, set in real HTML so the
                Arabic types with the page's own display face. */}
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

            {/* ── the controls ─────────────────────────────────
                One button per node, positioned over its disc. The label
                is pushed outward along the node's own radius, so it
                never crosses the ring — and it comes off entirely below
                `lg`, where six labels around a 22rem circle collide. */}
            {NODES.map((n, i) => (
              <button
                key={i}
                ref={(el) => { btns.current[i] = el; }}
                type="button"
                onClick={() => choose(i)}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onKeyDown={onKey}
                aria-pressed={active === i}
                aria-controls="capability-detail"
                className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                style={{ left: `${(n.x / BOX) * 100}%`, top: `${(n.y / BOX) * 100}%` }}
              >
                <span className="sr-only">{t.caps.items[i].name}</span>
                <span
                  aria-hidden="true"
                  className={[
                    'font-mono text-[0.58rem] leading-none transition-colors duration-300',
                    active === i ? 'text-void' : linked(i) ? 'text-cyan' : 'text-ink-3'
                  ].join(' ')}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span
                  aria-hidden="true"
                  className={[
                    'pointer-events-none absolute hidden whitespace-nowrap text-xs transition-colors duration-300 lg:block',
                    active === i ? 'text-ink' : linked(i) ? 'text-ink-2' : 'text-ink-3'
                  ].join(' ')}
                  style={{ transform: `translate(${n.ux * 3.2}rem, ${n.uy * 2.6}rem)` }}
                >
                  {t.caps.items[i].name}
                </span>
              </button>
            ))}
          </div>

          {/* ── the readable half ────────────────────────────── */}
          <div
            id="capability-detail"
            aria-live="polite"
            className="lg:min-h-[19rem]"
          >
            <p data-panel-row className="label ltr">
              {String(active + 1).padStart(2, '0')} / {String(CAPABILITIES.length).padStart(2, '0')}
            </p>

            <h3
              data-panel-row
              key={`${cap.name}-h`}
              className="display-type mt-3 text-[clamp(1.7rem,5vw,3rem)]"
            >
              {cap.name}
            </h3>

            <p data-panel-row key={`${cap.name}-d`} className="measure mt-5 text-base text-ink-2 md:text-lg">
              {cap.desc}
            </p>

            <ul data-panel-row className="mt-7 flex flex-wrap gap-1.5">
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

            <p data-panel-row className="label mt-8 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              {t.caps.hint}
            </p>
          </div>
        </div>

        {/* The working stack, stated once and plainly. It used to run past
            on a marquee, which was the third scrolling strip on one page —
            the repetition was reading as a tic rather than a motif. */}
        <div data-stack className="rule mt-14 pt-7 md:mt-20">
          <p className="label mb-4">{t.stackTag}</p>
          <ul className="flex flex-wrap gap-x-2 gap-y-2">
            {STACK.map((s) => (
              <li
                key={s}
                data-chip
                lang="en"
                className="border border-[var(--line)] px-3 py-1.5 font-mono text-xs text-ink-3 transition-colors duration-300 hover:border-cyan/50 hover:text-ink"
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
