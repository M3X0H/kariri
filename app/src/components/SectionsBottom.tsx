import { useState } from 'react';
import { ArrowUpRight, FileText, Github, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { useLang } from '../lib/lang';
import { CAPABILITIES, LINKS } from '../content';
import { gsap, ScrollTrigger, useScene, aura, EASE, isCoarse } from '../lib/motion';
import { AuroraBackground } from './lightswind/aurora-background';
import { BorderBeam } from './lightswind/border-beam';
import { MagneticButton } from './lightswind/magnetic-button';
import { ParticleField } from './lightswind/particle-field';
import { ShineButton } from './lightswind/shine-button';
import { TextScrollMarquee } from './lightswind/text-scroll-marquee';
import { TiltCard } from './lightswind/tilt-card';
import { VelocityRow, VelocityRows } from './lightswind/velocity-rows';

/* ═══════════════════════════════════════════════════════════════
   CAPABILITIES — an ecosystem, not a badge grid.
   Six nodes on a ring, wired to the ones they actually touch. Reading
   a row lights that node and everything it connects to.

   Lightswind: BorderBeam around the diagram panel.
   ═══════════════════════════════════════════════════════════════ */
export function Capabilities() {
  const { t, lang } = useLang();
  const [active, setActive] = useState(0);

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    /* Rows arrive from the inline start, one after another, and shed a
       blur as they land — the section's own signature, distinct from the
       vertical rise used elsewhere. Travel stays inside the container
       padding so nothing parks off-page before its trigger fires. */
    const rows = (x: number) => () => {
      gsap.from(q('[data-cap]'), {
        opacity: 0,
        x,
        filter: 'blur(8px)',
        duration: 0.8,
        stagger: 0.08,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 70%' }
      });
    };
    mm.add('(min-width: 768px)', rows(lang === 'ar' ? 46 : -46));
    mm.add('(max-width: 767px)', rows(0));

    /* The diagram animates as one piece, on its wrapper. Its nodes and
       edges re-render on every hover to re-colour themselves, and React
       rewriting their style attribute mid-tween left them pinned at
       opacity 0 while their transform finished — visible as an empty
       column. The wrapper carries no React style prop, so it is safe. */
    gsap.from(q('[data-graph]'), {
      opacity: 0,
      scale: 0.88,
      transformOrigin: 'center',
      duration: 1,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 70%' }
    });

    return () => mm.revert();
  }, [lang]);

  // Ring geometry, computed once — six nodes evenly placed.
  const R = 118;
  const nodes = CAPABILITIES.map((_, i) => {
    const a = (i / CAPABILITIES.length) * Math.PI * 2 - Math.PI / 2;
    return { x: 160 + Math.cos(a) * R, y: 160 + Math.sin(a) * R };
  });

  const lit = (i: number) => i === active || (CAPABILITIES[active].links as readonly number[]).includes(i);

  return (
    <section
      ref={root}
      id="capabilities"
      className="chapter-edge relative scroll-mt-24 px-[max(1.25rem,5vw)] py-[clamp(3.5rem,8vh,6.5rem)]"
      style={aura(235)}
    >
      <div className="aura" />
      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 className="label mb-3">
          <span className="text-cyan">02</span> — {t.caps.tag}
        </h2>
        <p className="mb-12 max-w-[46ch] text-lg text-ink-2">{t.caps.lead}</p>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-16">
          <ul className="rule">
            {t.caps.items.map((cap, i) => (
              <li
                data-cap
                key={cap.name}
                onMouseEnter={() => setActive(i)}
                onFocusCapture={() => setActive(i)}
                className={[
                  'group border-b border-[var(--line)] py-6 transition-colors duration-300',
                  active === i ? 'text-ink' : 'text-ink-3'
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className="flex w-full items-baseline gap-4 text-start md:gap-7"
                >
                  <span className={['font-mono text-xs', active === i ? 'text-cyan' : ''].join(' ')}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={[
                      'display-type flex-1 text-[clamp(1.4rem,4vw,2.6rem)] transition-[color,transform] duration-500',
                      active === i ? 'text-ink md:translate-x-1 rtl:md:-translate-x-1' : 'text-ink'
                    ].join(' ')}
                  >
                    {cap.name}
                  </span>
                  <ArrowUpRight
                    size={18}
                    aria-hidden
                    className={[
                      'shrink-0 transition-all duration-300',
                      active === i ? 'text-cyan opacity-100' : 'opacity-0'
                    ].join(' ')}
                  />
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-500"
                  style={{ gridTemplateRows: active === i ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[52ch] pt-3 text-sm text-ink-2 md:text-base">{cap.desc}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {CAPABILITIES[i].tech.map((tech) => (
                        <li
                          key={tech}
                          lang="en"
                          className="border border-[var(--line)] px-2 py-1 font-mono text-[0.65rem] text-ink-2"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* The wiring. Decorative — the list above carries the meaning. */}
          <div data-graph className="sticky top-28 hidden lg:block" aria-hidden="true">
            <div className="glass relative overflow-hidden p-6">
              <BorderBeam size={56} duration={9} glowIntensity={0.7} opacity={0.8} />
              <svg viewBox="0 0 320 320" className="w-full">
                {CAPABILITIES.map((cap, i) =>
                  (cap.links as readonly number[])
                    .filter((j) => j > i)
                    .map((j) => (
                      <line
                        key={`${i}-${j}`}
                        x1={nodes[i].x}
                        y1={nodes[i].y}
                        x2={nodes[j].x}
                        y2={nodes[j].y}
                        stroke={lit(i) && lit(j) ? 'var(--color-cyan)' : 'currentColor'}
                        strokeWidth={lit(i) && lit(j) ? 1.2 : 0.6}
                        className={lit(i) && lit(j) ? 'text-cyan' : 'text-ink-3'}
                        opacity={lit(i) && lit(j) ? 0.85 : 0.3}
                        style={{ transition: 'opacity .4s, stroke-width .4s' }}
                      />
                    ))
                )}

                {nodes.map((n, i) => (
                  <g key={i} style={{ transition: 'opacity .4s' }}>
                    {lit(i) && (
                      <circle cx={n.x} cy={n.y} r={i === active ? 17 : 11} className="fill-cyan" opacity={0.14} />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={i === active ? 7.5 : 5}
                      className={lit(i) ? 'fill-cyan' : 'fill-ink-3'}
                      opacity={lit(i) ? 1 : 0.7}
                      style={{ transition: 'r .35s, opacity .35s' }}
                    />
                    <text
                      x={n.x}
                      y={n.y - 16}
                      textAnchor="middle"
                      className={['font-mono', lit(i) ? 'fill-ink' : 'fill-ink-3'].join(' ')}
                      style={{ fontSize: 9, letterSpacing: '0.12em', transition: 'fill .35s' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </text>
                  </g>
                ))}
              </svg>

              <p className="label mt-4 text-center">{t.caps.items[active].name}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAREER — the spine draws itself as you descend, the year pins to
   the side and swaps as entries pass, and whichever entry owns the
   middle of the screen carries a running beam.

   Lightswind: BorderBeam on the live entry.
   ═══════════════════════════════════════════════════════════════ */
export function Career() {
  const { t, lang } = useLang();
  const [live, setLive] = useState(0);

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);

    gsap.from(q('[data-spine]'), {
      scaleY: 0,
      transformOrigin: 'top',
      ease: 'none',
      scrollTrigger: { trigger: q('[data-track]')[0], start: 'top 78%', end: 'bottom 80%', scrub: 0.6 }
    });

    /* The alternating side-entrance needs two things: two actual sides,
       and enough gutter to travel through. The travel has to stay inside
       the container padding (5vw), or an entry parks off-page until its
       trigger fires and reads as cropped on the way in. */
    const mm = gsap.matchMedia();
    const entrance = (sideways: boolean) => () => {
      q('[data-entry]').forEach((entry, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.from(entry, {
          opacity: 0,
          x: sideways ? (lang === 'ar' ? -dir : dir) * 40 : 0,
          y: sideways ? 0 : 32,
          scale: 0.96,
          duration: 0.9,
          ease: EASE,
          scrollTrigger: { trigger: entry, start: 'top 82%' }
        });
      });
    };
    mm.add('(min-width: 1024px)', entrance(true));
    mm.add('(max-width: 1023px)', entrance(false));

    // Whichever entry currently owns the middle of the screen is "live":
    // the marker glows, the pinned year swaps to it, and the beam moves.
    q('[data-entry]').forEach((entry, i) => {
      ScrollTrigger.create({
        trigger: entry,
        start: 'top 62%',
        end: 'bottom 45%',
        toggleClass: { targets: entry, className: 'is-live' },
        onToggle: ({ isActive }) => isActive && setLive(i)
      });
    });

    return () => mm.revert();
  }, [lang]);

  return (
    <section
      ref={root}
      id="career"
      className="chapter-edge relative scroll-mt-24 px-[max(1.25rem,5vw)] py-[clamp(3.5rem,8vh,6.5rem)]"
      style={aura(258)}
    >
      <div className="aura" />
      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 className="label mb-12">
          <span className="text-cyan">03</span> — {t.career.tag}
        </h2>

        <div data-track className="relative">
          <span
            data-spine
            className="absolute inset-y-0 start-[7px] w-px bg-gradient-to-b from-cyan via-violet to-transparent md:start-1/2"
          />

          {/* The year the page is currently standing in, pinned behind the
              track so the timeline keeps a fixed reference while entries
              move past it. Centred and clipped rather than parked in the
              gutter — a 7rem number in 5vw of padding overflows the page. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden justify-center overflow-hidden md:flex"
          >
            <span className="sticky top-1/2 h-fit -translate-y-1/2 display-type text-[clamp(6rem,16vw,15rem)] leading-none tabular-nums text-ink/[0.045]">
              {t.career.entries[live].year}
            </span>
          </div>

          <ol className="space-y-12 md:space-y-20">
            {t.career.entries.map((e, i) => (
              <li
                data-entry
                key={`${e.role}-${e.year}`}
                className={[
                  'relative ps-8 md:w-[calc(50%-3rem)] md:ps-0',
                  i % 2 === 0 ? 'md:ms-auto md:ps-14' : 'md:pe-14 md:text-end'
                ].join(' ')}
              >
                {/* Entries stop 3rem short of the spine, so the marker has
                    to clear that gap plus half its own width to actually
                    sit on the line rather than float beside it. */}
                <span
                  className={[
                    'absolute top-8 z-10 h-3.5 w-3.5 rounded-full border-2 border-cyan bg-void transition-shadow duration-500',
                    'start-0 md:start-auto',
                    i % 2 === 0 ? 'md:-start-[55px]' : 'md:-end-[55px]'
                  ].join(' ')}
                />

                <div
                  className={[
                    'relative overflow-hidden border p-6 transition-colors duration-500 md:p-8',
                    live === i ? 'border-[var(--line-2)] bg-panel/50' : 'border-[var(--line)] bg-graphite/30'
                  ].join(' ')}
                >
                  {live === i && (
                    <BorderBeam
                      size={52}
                      duration={6.5}
                      glowIntensity={0.6}
                      colorFrom="var(--color-cyan)"
                      colorTo="var(--color-violet)"
                    />
                  )}

                  <p className="font-mono text-xs text-cyan">{e.kind}</p>
                  <h3 className="display-type mt-2 text-[clamp(1.3rem,3.2vw,2.1rem)]">{e.role}</h3>
                  <p className="mt-2 text-base text-ink-2">{e.org}</p>
                  <p className="mt-1 font-mono text-xs text-ink-3">{e.span}</p>

                  <ul className={['mt-5 space-y-2', i % 2 === 0 ? '' : 'md:[&_li]:flex-row-reverse'].join(' ')}>
                    {e.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sm text-ink-2">
                        <span className="mt-2.5 h-px w-3 shrink-0 bg-cyan/60" />
                        <span className="max-w-[46ch]">{p}</span>
                      </li>
                    ))}
                  </ul>

                  {e.impact && (
                    <p className="mt-5 border-s-2 border-cyan/40 ps-4 text-sm text-ink-3 md:ms-auto md:max-w-[46ch]">
                      {e.impact}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WORK — the visual pins and turns to face the pointer while the
   write-up moves past it. One real project, presented at full scale
   rather than padded out with invented ones.

   Lightswind: TiltCard (3D perspective), BorderBeam, ShineButton.
   ═══════════════════════════════════════════════════════════════ */
export function Work() {
  const { t, lang } = useLang();
  const p = t.work.project;

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);

    gsap.from(q('[data-detail]'), {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: EASE,
      scrollTrigger: { trigger: q('[data-details]')[0], start: 'top 78%' }
    });

    // The visual arrives scaled down and out of focus, then resolves as it
    // reaches the middle of the screen — the section's own signature.
    gsap.fromTo(
      q('[data-visual]'),
      { scale: 0.9, filter: 'blur(14px)', opacity: 0.35 },
      {
        scale: 1,
        filter: 'blur(0px)',
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: q('[data-visual]')[0], start: 'top 88%', end: 'top 42%', scrub: 0.8 }
      }
    );

    if (!isCoarse()) {
      gsap.to(q('[data-visual-inner]'), {
        yPercent: -9,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
      });
    }
  }, [lang]);

  return (
    <section
      ref={root}
      id="work"
      className="chapter-edge relative scroll-mt-24 px-[max(1.25rem,5vw)] py-[clamp(3.5rem,8vh,6.5rem)]"
      style={aura(288)}
    >
      <div className="aura" />
      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 className="label mb-12">
          <span className="text-cyan">04</span> — {t.work.tag}
        </h2>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div data-visual className="lg:sticky lg:top-28 lg:self-start">
            <TiltCard maxTilt={8} float={9} shine={0.2} perspective={1300}>
              <div className="relative aspect-[4/3] overflow-hidden border border-[var(--line-2)] bg-graphite">
                <BorderBeam size={80} duration={8} glowIntensity={1} opacity={0.85} />

                <div
                  data-visual-inner
                  className="absolute inset-0 flex flex-col justify-center gap-4 p-[8%] [transform-style:preserve-3d]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_75%_15%,rgba(92,225,230,0.18),transparent_65%)]" />
                  <span className="lift-3 relative display-type text-[clamp(2rem,7vw,4.5rem)] leading-none">
                    KARIRI
                  </span>
                  <span className="lift-2 relative h-2.5 w-[62%] bg-gradient-to-r from-cyan to-blue" />
                  <span className="lift-1 relative h-2.5 w-[84%] bg-panel-2" />
                  <span className="lift-1 relative h-2.5 w-[45%] bg-panel-2" />
                  <span className="relative mt-2 h-14 w-full bg-[repeating-linear-gradient(90deg,var(--color-panel-2)_0_11%,transparent_11%_13%)]" />
                </div>
              </div>
            </TiltCard>
          </div>

          <div data-details>
            <p data-detail className="font-mono text-xs text-cyan">
              {p.no} — {p.kind}
            </p>
            <h3 data-detail className="display-type mt-4 text-[clamp(1.9rem,5.5vw,3.6rem)]">
              {p.title}
            </h3>
            <p data-detail className="mt-6 max-w-[50ch] text-base leading-relaxed text-ink-2 md:text-lg">
              {p.desc}
            </p>

            <div data-detail className="rule mt-10 pt-6">
              <p className="label">{p.stack}</p>
              <p lang="en" className="mt-2 font-mono text-sm text-ink">
                React · TypeScript · GSAP · Three.js · Lightswind
              </p>
            </div>
            <div data-detail className="rule mt-6 pt-6">
              <p className="label">{p.focus}</p>
              <p lang="en" className="mt-2 font-mono text-sm text-ink">
                RTL / i18n · Accessibility · Motion · Performance
              </p>
            </div>

            <div data-detail className="mt-10 flex flex-wrap items-center gap-3">
              <ShineButton href={LINKS.repo} external rtl={lang === 'ar'}>
                <Github size={16} aria-hidden />
                {p.code}
                <ArrowUpRight size={15} aria-hidden />
              </ShineButton>
              <span className="inline-flex items-center gap-2 px-3 py-3 text-sm text-ink-3">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                {p.live}
              </span>
            </div>

            <p data-detail className="mt-10 max-w-[46ch] text-sm text-ink-3">
              {t.work.soon}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CREDENTIALS — the one that matters, then the rest as two tracks
   that drift in opposite directions and surge with scroll velocity.

   Lightswind: BorderBeam on the lead card, VelocityRows for the index.
   ═══════════════════════════════════════════════════════════════ */
export function Credentials() {
  const { t } = useLang();

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    gsap.from(q('[data-lead]'), {
      opacity: 0,
      scale: 0.94,
      filter: 'blur(10px)',
      duration: 1,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 75%' }
    });
    gsap.from(q('[data-rows]'), {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: EASE,
      scrollTrigger: { trigger: q('[data-rows]')[0], start: 'top 86%' }
    });
  });

  // Split into two tracks so they can run against each other.
  const half = Math.ceil(t.cred.items.length / 2);
  const tracks = [t.cred.items.slice(0, half), t.cred.items.slice(half)];

  return (
    <section
      ref={root}
      className="chapter-edge relative overflow-hidden py-[clamp(3.5rem,8vh,6.5rem)]"
      style={aura(288)}
    >
      <div className="aura" />
      <div className="relative z-10">
        <div className="mx-auto w-full max-w-[88rem] px-[max(1.25rem,5vw)]">
          <h2 className="label mb-12">
            <span className="text-cyan">05</span> — {t.cred.tag}
          </h2>

          <div
            data-lead
            className="glass relative overflow-hidden p-8 md:p-12"
            style={{ background: 'linear-gradient(135deg, rgb(92 225 230 / 0.09), transparent 55%), rgb(16 19 25 / 0.6)' }}
          >
            <BorderBeam size={90} duration={9} glowIntensity={1.1} colorFrom="var(--color-cyan)" colorTo="var(--color-magenta)" />
            <p className="font-mono text-xs text-cyan">2025</p>
            <h3 lang="en" className="display-type mt-3 text-[clamp(1.6rem,5vw,3.2rem)]">
              {t.cred.lead}
            </h3>
            <p className="mt-3 text-ink-2">{t.cred.leadBy}</p>
          </div>

          <p className="label mt-12 mb-5">{t.cred.all}</p>
        </div>

        {/* Full bleed on purpose: the tracks have to run off both edges or
            they read as a list that happens to be sliding. */}
        <div data-rows>
          <VelocityRows className="space-y-3">
            {tracks.map((track, i) => (
              <VelocityRow key={i} baseVelocity={3.2} direction={i % 2 === 0 ? 1 : -1}>
                {track.map((c) => (
                  <span
                    key={c}
                    lang="en"
                    className="me-3 inline-flex items-center gap-3 whitespace-nowrap border border-[var(--line)] bg-graphite/50 px-5 py-3 text-sm text-ink-2"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-cyan/70" />
                    {c}
                  </span>
                ))}
              </VelocityRow>
            ))}
          </VelocityRows>

          {/* The tracks are decorative duplicates; this is the real list. */}
          <ol className="sr-only">
            {t.cred.items.map((c) => (
              <li key={c} lang="en">{c}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT — the close. Large type arriving line by line over drifting
   motes, a magnetic primary action, and every route to him as one list.

   Lightswind: ParticleField, AuroraBackground, MagneticButton.
   ═══════════════════════════════════════════════════════════════ */
export function Contact() {
  const { t, lang } = useLang();

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 68%' } })
      .from(q('[data-line]'), { yPercent: 115, duration: 1, stagger: 0.1, ease: EASE })
      .from(q('[data-say]'), { opacity: 0, y: 20, duration: 0.7, ease: EASE }, 0.35)
      .from(q('[data-cta]'), { opacity: 0, scale: 0.94, duration: 0.6, ease: 'back.out(1.6)' }, 0.5)
      .from(q('[data-way]'), { opacity: 0, y: 18, duration: 0.5, stagger: 0.06, ease: EASE }, 0.55);
  }, [lang]);

  const ways = [
    { icon: MessageCircle, href: LINKS.whatsapp, ext: true },
    { icon: Mail, href: LINKS.email, ext: false },
    { icon: Linkedin, href: LINKS.linkedin, ext: true },
    { icon: Github, href: LINKS.github, ext: true },
    { icon: FileText, href: LINKS.cv, ext: false, download: true }
  ];

  return (
    <section
      ref={root}
      id="contact"
      className="chapter-edge relative scroll-mt-24 overflow-hidden px-[max(1.25rem,5vw)] pb-[clamp(3rem,8vh,6rem)] pt-[clamp(3.5rem,8vh,6.5rem)]"
      style={aura(316)}
    >
      {/* Violet into magenta, and no further: the page's spectrum ends here. */}
      <AuroraBackground hue={276} spread={46} intensity={0.26} showRadialGradient={false} />
      <div className="aura" />
      <ParticleField count={64} speed={0.9} />

      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <p className="label mb-10" aria-hidden="true">
          <span className="text-cyan">06</span> — {t.contact.tag}
        </p>

        <h2 className="display-type text-[clamp(2.2rem,9vw,7rem)]">
          <span className="mask-line">
            <span data-line className="block">{t.contact.l1}</span>
          </span>
          <span className="mask-line">
            <span data-line className="block text-ink-3">{t.contact.l2}</span>
          </span>
        </h2>

        <p data-say className="mt-8 max-w-[48ch] text-lg text-ink-2">
          {t.contact.say}
        </p>

        <div data-cta className="mt-10">
          <MagneticButton href={LINKS.whatsapp} external size="lg" variant="solid" strength={0.34}>
            <MessageCircle size={18} aria-hidden />
            {t.contact.cta}
            <ArrowUpRight size={17} aria-hidden />
          </MagneticButton>
        </div>

        <ul className="rule mt-16">
          {t.contact.ways.map((w, i) => {
            const route = ways[i];
            const Icon = route.icon;
            return (
              <li data-way key={w.k}>
                <a
                  href={route.href}
                  {...(route.ext ? { target: '_blank', rel: 'noopener' } : {})}
                  {...(route.download ? { download: true } : {})}
                  className="group flex items-center gap-4 border-b border-[var(--line)] py-5 transition-colors hover:text-cyan md:gap-8"
                >
                  <Icon size={17} aria-hidden className="shrink-0 text-ink-3 transition-colors group-hover:text-cyan" />
                  <span className="label w-[7rem] shrink-0">{w.k}</span>
                  <span className="ltr flex-1 truncate text-sm md:text-base">{w.v}</span>
                  <ArrowUpRight
                    size={16}
                    aria-hidden
                    className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-cyan"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER — the page signs off on a drifting strip.

   Lightswind: TextScrollMarquee.
   ═══════════════════════════════════════════════════════════════ */
export function Footer() {
  const { t } = useLang();

  return (
    <footer className="relative z-10 border-t border-[var(--line)]">
      <div className="overflow-hidden py-5">
        <TextScrollMarquee baseVelocity={2.4} direction="right" copies={3}>
          {/* The track has to be LTR for the loop geometry to work, so each
              phrase carries `dir="auto"` — that isolates it and lets Arabic
              run right-to-left inside its own box instead of the neutral
              separators merging the phrases into one reordered run. */}
          {t.footer.strip.map((s, i) => (
            <span key={`${s}-${i}`} className="flex shrink-0 items-center">
              <span dir="auto" className="display-type text-[clamp(1.4rem,4vw,3rem)] text-ink/[0.13]">
                {s}
              </span>
              <span aria-hidden="true" className="mx-6 text-cyan/40 md:mx-10">✦</span>
            </span>
          ))}
        </TextScrollMarquee>
      </div>

      <div className="mx-auto flex w-full max-w-[88rem] flex-wrap items-center justify-between gap-3 px-[max(1.25rem,5vw)] pb-[calc(2rem+env(safe-area-inset-bottom))] pt-2">
        <p className="font-mono text-xs text-ink-3">
          © {new Date().getFullYear()} {t.footer.name}
        </p>
        <p lang="en" className="font-mono text-xs text-ink-3">
          {t.footer.built}
        </p>
      </div>
    </footer>
  );
}
