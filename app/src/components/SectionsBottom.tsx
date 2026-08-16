import { useRef, useState } from 'react';
import { ArrowUpRight, FileText, Github, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { useLang } from '../lib/lang';
import { CAPABILITIES, LINKS, STACK } from '../content';
import { gsap, ScrollTrigger, useScene, aura, EASE, prefersReduced, isCoarse } from '../lib/motion';

/* ═══════════════════════════════════════════════════════════════
   CAPABILITIES — an ecosystem, not a badge grid.
   Six nodes on a ring, wired to the ones they actually touch. Reading
   a row lights that node and everything it connects to.
   ═══════════════════════════════════════════════════════════════ */
export function Capabilities() {
  const { t } = useLang();
  const [active, setActive] = useState(0);

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    gsap.from(q('[data-cap]'), {
      opacity: 0,
      y: 34,
      duration: 0.75,
      stagger: 0.07,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 70%' }
    });
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
  });

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
      className="relative scroll-mt-24 px-[max(1.25rem,5vw)] py-[clamp(3rem,7vh,6rem)]"
      style={aura(235)}
    >
      <div className="aura" />
      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 className="label mb-3">
          <span className="text-cyan">02</span> — {t.caps.tag}
        </h2>
        <p className="mb-12 max-w-[46ch] text-lg text-ink-2">{t.caps.lead}</p>

        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-16">
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
                  <span className="display-type flex-1 text-[clamp(1.4rem,4vw,2.6rem)] text-ink">
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
            <svg viewBox="0 0 320 320" className="w-full overflow-visible">
              {CAPABILITIES.map((cap, i) =>
                (cap.links as readonly number[])
                  .filter((j) => j > i)
                  .map((j) => (
                    <line
                      data-edge
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
                <g data-node key={i} style={{ transition: 'opacity .4s' }}>
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

            <p className="label mt-6 text-center">{t.caps.items[active].name}</p>
          </div>
        </div>

        {/* Everything actually in use, as one quiet line. */}
        <ul className="rule mt-14 flex flex-wrap gap-x-5 gap-y-2 pt-6">
          {STACK.map((s) => (
            <li key={s} lang="en" className="font-mono text-xs text-ink-3">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAREER — the spine draws itself as you descend; entries arrive
   from alternating sides and hold a glow while they are current.
   ═══════════════════════════════════════════════════════════════ */
export function Career() {
  const { t, lang } = useLang();

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
          duration: 0.9,
          ease: EASE,
          scrollTrigger: { trigger: entry, start: 'top 82%' }
        });
      });
    };
    mm.add('(min-width: 1024px)', entrance(true));
    mm.add('(max-width: 1023px)', entrance(false));

    q('[data-entry]').forEach((entry) => {
      // Whichever entry currently owns the middle of the screen is "live",
      // which the marker picks up as a glow.
      ScrollTrigger.create({
        trigger: entry,
        start: 'top 62%',
        end: 'bottom 45%',
        toggleClass: { targets: entry, className: 'is-live' }
      });
    });

    return () => mm.revert();
  }, [lang]);

  return (
    <section
      ref={root}
      id="career"
      className="relative scroll-mt-24 px-[max(1.25rem,5vw)] py-[clamp(3rem,7vh,6rem)]"
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

          <ol className="space-y-14 md:space-y-24">
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
                    'absolute top-2 h-3.5 w-3.5 rounded-full border-2 border-cyan bg-void transition-shadow duration-500',
                    'start-0 md:start-auto',
                    i % 2 === 0 ? 'md:-start-[55px]' : 'md:-end-[55px]'
                  ].join(' ')}
                />

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
                  <p className="mt-5 border-s-2 border-cyan/40 ps-4 text-sm text-ink-3 md:max-w-[46ch] md:ms-auto">
                    {e.impact}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WORK — the visual pins while the write-up moves past it. One real
   project, presented at full scale rather than padded out with
   invented ones.
   ═══════════════════════════════════════════════════════════════ */
export function Work() {
  const { t } = useLang();
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
    gsap.to(q('[data-visual-inner]'), {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
    });
  });

  return (
    <section
      ref={root}
      id="work"
      className="relative scroll-mt-24 px-[max(1.25rem,5vw)] py-[clamp(3rem,7vh,6rem)]"
      style={aura(288)}
    >
      <div className="aura" />
      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 className="label mb-12">
          <span className="text-cyan">04</span> — {t.work.tag}
        </h2>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/3] overflow-hidden border border-[var(--line)] bg-graphite">
              <div
                data-visual-inner
                className="absolute inset-0 flex flex-col justify-center gap-4 p-[8%]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_75%_15%,rgba(92,225,230,0.16),transparent_65%)]" />
                <span className="relative display-type text-[clamp(2rem,7vw,4.5rem)] leading-none">
                  KARIRI
                </span>
                <span className="relative h-2.5 w-[62%] bg-gradient-to-r from-cyan to-blue" />
                <span className="relative h-2.5 w-[84%] bg-panel-2" />
                <span className="relative h-2.5 w-[45%] bg-panel-2" />
                <span className="relative mt-2 h-14 w-full bg-[repeating-linear-gradient(90deg,var(--color-panel-2)_0_11%,transparent_11%_13%)]" />
              </div>
            </div>
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
                React · TypeScript · GSAP · Three.js
              </p>
            </div>
            <div data-detail className="rule mt-6 pt-6">
              <p className="label">{p.focus}</p>
              <p lang="en" className="mt-2 font-mono text-sm text-ink">
                RTL / i18n · Accessibility · Motion · Performance
              </p>
            </div>

            <div data-detail className="mt-10 flex flex-wrap gap-3">
              <a
                href={LINKS.repo}
                target="_blank"
                rel="noopener"
                className="group inline-flex items-center gap-2 border border-[var(--line-2)] px-5 py-3 text-sm transition-colors hover:border-cyan hover:text-cyan"
              >
                <Github size={16} aria-hidden />
                {p.code}
                <ArrowUpRight size={15} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
              </a>
              <span className="inline-flex items-center gap-2 px-5 py-3 text-sm text-ink-3">
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
   CREDENTIALS — one that matters, then the rest as a dense index.
   ═══════════════════════════════════════════════════════════════ */
export function Credentials() {
  const { t } = useLang();

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    gsap.from(q('[data-lead]'), {
      opacity: 0,
      scale: 0.96,
      duration: 0.9,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 75%' }
    });
    gsap.from(q('[data-cert]'), {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.04,
      ease: EASE,
      scrollTrigger: { trigger: q('[data-list]')[0], start: 'top 82%' }
    });
  });

  return (
    <section
      ref={root}
      className="relative px-[max(1.25rem,5vw)] py-[clamp(3rem,7vh,6rem)]"
      style={aura(288)}
    >
      <div className="aura" />
      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 className="label mb-12">
          <span className="text-cyan">05</span> — {t.cred.tag}
        </h2>

        <div
          data-lead
          className="glass relative overflow-hidden p-8 md:p-12"
          style={{ background: 'linear-gradient(135deg, rgb(92 225 230 / 0.09), transparent 55%), rgb(16 19 25 / 0.6)' }}
        >
          <p className="font-mono text-xs text-cyan">2025</p>
          <h3 lang="en" className="display-type mt-3 text-[clamp(1.6rem,5vw,3.2rem)]">
            {t.cred.lead}
          </h3>
          <p className="mt-3 text-ink-2">{t.cred.leadBy}</p>
        </div>

        <p className="label mt-12 mb-4">{t.cred.all}</p>
        <ul data-list className="grid gap-x-10 sm:grid-cols-2">
          {t.cred.items.map((c, i) => (
            <li
              data-cert
              key={c}
              className="flex items-baseline gap-4 border-t border-[var(--line)] py-3.5"
            >
              <span className="font-mono text-[0.65rem] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              <span lang="en" className="text-sm text-ink-2">
                {c}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT — the close. Large type arriving line by line, a magnetic
   primary action, and every route to him as one list.
   ═══════════════════════════════════════════════════════════════ */
export function Contact() {
  const { t } = useLang();
  const cta = useRef<HTMLAnchorElement>(null);

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 68%' } })
      .from(q('[data-line]'), { yPercent: 115, duration: 1, stagger: 0.1, ease: EASE })
      .from(q('[data-say]'), { opacity: 0, y: 20, duration: 0.7, ease: EASE }, 0.35)
      .from(q('[data-cta]'), { opacity: 0, scale: 0.94, duration: 0.6, ease: 'back.out(1.6)' }, 0.5)
      .from(q('[data-way]'), { opacity: 0, y: 18, duration: 0.5, stagger: 0.06, ease: EASE }, 0.55);

    // Magnetic pull on the primary action — desktop pointers only.
    const btn = cta.current;
    if (!btn || prefersReduced() || isCoarse()) return;

    const move = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.abs(dx) < r.width * 1.1 && Math.abs(dy) < r.height * 2.4;
      gsap.to(btn, {
        x: near ? dx * 0.22 : 0,
        y: near ? dy * 0.32 : 0,
        duration: 0.5,
        ease: 'power3.out'
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  });

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
      className="relative scroll-mt-24 px-[max(1.25rem,5vw)] pb-[clamp(3rem,8vh,6rem)] pt-[clamp(3rem,7vh,6rem)]"
      style={aura(316)}
    >
      <div className="aura" />
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
          <a
            ref={cta}
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-3 bg-ink px-8 py-4 text-base font-medium text-void transition-colors hover:bg-cyan"
          >
            <MessageCircle size={18} aria-hidden />
            {t.contact.cta}
            <ArrowUpRight size={17} aria-hidden className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
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

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative z-10 mx-auto flex w-full max-w-[88rem] flex-wrap items-center justify-between gap-3 px-[max(1.25rem,5vw)] pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8">
      <p className="font-mono text-xs text-ink-3">
        © {new Date().getFullYear()} {t.footer.name}
      </p>
      <p lang="en" className="font-mono text-xs text-ink-3">
        {t.footer.built}
      </p>
    </footer>
  );
}
