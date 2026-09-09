import { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, FileText, MessageCircle } from 'lucide-react';
import { useLang } from '../lib/lang';
import { Chapter } from './Chapter';
import { LINKS } from '../content';
import { gsap, useScene, splitUnits, aura, EASE, prefersReduced, isCoarse } from '../lib/motion';
import { arrive, depthPass, drift, parallax } from '../lib/scenes';
import { CountUp } from './lightswind/count-up';
import { MagneticButton } from './lightswind/magnetic-button';
import { ScrollReveal } from './lightswind/scroll-reveal';
import { ShineButton } from './lightswind/shine-button';
import { ShinyText } from './lightswind/shiny-text';
import { SpotlightCard, SpotlightCards } from './lightswind/spotlight-cards';

const HeroField = lazy(() => import('./HeroField'));

/* The field is the hero's signature, so phones get it too — at half the
   nodes, a capped pixel ratio and no antialiasing, blooming out of the
   portrait rather than competing with it. Only reduced motion opts out
   entirely, and then the CSS bloom carries the composition on its own. */
function useFieldQuality() {
  const [quality, setQuality] = useState<null | 'full' | 'lite'>(null);
  useEffect(() => {
    if (prefersReduced()) return;
    try {
      const c = document.createElement('canvas');
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
      setQuality(window.innerWidth < 768 ? 'lite' : 'full');
    } catch {
      setQuality(null);
    }
  }, []);
  return quality;
}

/* ═══════════════════════════════════════════════════════════════
   HERO — a plate, a name, and a rule.

   The portrait is no longer a card beside the type. It is a hard-edged
   plate that runs off the edge of the screen and off the top and
   bottom of the viewport, printed cold, with the network burning
   through it and a scan register over it. The name crosses its inner
   column, set in solid and hollow against each other.

   The two languages do not share a composition, because the two names
   are not the same shape. "محمد كريري" stacks into a compact block, so
   it holds the height beside a full-height plate. "MOHAMMED KARIRI" is
   two wide words, so it runs as a band along the bottom and crosses
   further in. Mirroring one arrangement would have given the wrong
   answer in whichever language lost. See `.hero-*` in `index.css`.

   Phones get a third arrangement, not a narrowed one: the plate takes
   the top of the screen edge to edge, the name climbs over its lower
   edge, and the data rail closes the fold.

   Lightswind: ShinyText (availability), MagneticButton + ShineButton.
   ═══════════════════════════════════════════════════════════════ */
export function Hero({ ready }: { ready: boolean }) {
  const { t, lang } = useLang();
  const field = useFieldQuality();

  const root = useScene<HTMLElement>((el) => {
    if (!ready) return;

    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({ defaults: { ease: EASE } });

    /* The name arrives one unit at a time out of its own clipping mask —
       letters in English, words in Arabic, because the script cannot be
       cut finer than a word without breaking its joins. */
    const units = q('[data-name]').flatMap((n) => splitUnits(n as HTMLElement));

    tl
      /* The plate is exposed rather than faded in: a wipe down its own
         height, which is what a printed panel does and what a card
         never does. */
      .fromTo(
        q('[data-plate]'),
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 1.25, ease: 'power3.inOut' }
      )
      .from(q('[data-field]'), { opacity: 0, scale: 1.2, duration: 1.7, ease: 'power2.out' }, 0.1)
      .from(units, { yPercent: 120, duration: 1.05, stagger: 0.045 }, 0.45)
      .from(q('[data-meta]'), { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, 0.75)
      .from(q('[data-act]'), { opacity: 0, y: 22, duration: 0.7, stagger: 0.09 }, 0.95)
      .from(q('[data-float]'), { opacity: 0, scale: 0.4, duration: 0.9, stagger: 0.06 }, 0.7)
      .from(q('[data-cue]'), { opacity: 0, duration: 0.6 }, 1.2);

    // Leaving the hero: lift, fade, soften.
    gsap.to(q('[data-lift]'), {
      yPercent: -12,
      opacity: 0,
      filter: 'blur(6px)',
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    /* The plate holds while the type leaves over it — the two planes
       separate on the way out instead of sliding as one sheet. */
    gsap.to(q('[data-plate]'), {
      scale: 1.12,
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.9 }
    });

    gsap.to(units, {
      // Direction-agnostic: the run spreads from its own centre either way.
      xPercent: (i: number) => (i - (units.length - 1) / 2) * 8,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 }
    });

    /* Three planes, three speeds: the marks sit furthest back and travel
       most, the plate between, the type barely at all. */
    q('[data-float]').forEach((mark) => parallax(mark, 26, 1.1));
    drift(q('[data-float]'), isCoarse() ? 5 : 11);
  }, [ready, lang]);

  const spec: [string, string][] = [
    [t.spec.role, t.spec.roleV],
    [t.spec.base, t.spec.baseV],
    [t.spec.since, t.spec.sinceV],
    [t.spec.langs, t.spec.langsV]
  ];

  return (
    <section
      ref={root}
      id="start"
      className="relative overflow-hidden px-[var(--pad)]"
      style={aura(186)}
    >
      <div className="aura" />

      {/* The furthest plane. Marks that drift on their own and travel
          most under scroll, so the composition has something to have
          depth against. Scroll-driven, so phones get them too. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]">
        {[
          { t: '16%', l: '6%', k: 'tick' },
          { t: '30%', l: '52%', k: 'dot' },
          { t: '78%', l: '9%', k: 'dot' },
          { t: '88%', l: '46%', k: 'tick' },
          { t: '58%', l: '3%', k: 'cross' },
          { t: '40%', l: '60%', k: 'cross' }
        ].map((m, i) => (
          <span key={i} data-float className="absolute" style={{ top: m.t, left: m.l }}>
            {m.k === 'tick' && <span className="block h-px w-8 bg-cyan/40" />}
            {m.k === 'dot' && <span className="block h-1 w-1 rounded-full bg-cyan/60" />}
            {m.k === 'cross' && (
              <span className="relative block h-3 w-3">
                <span className="absolute inset-x-0 top-1/2 h-px bg-ink-3/50" />
                <span className="absolute inset-y-0 left-1/2 w-px bg-ink-3/50" />
              </span>
            )}
          </span>
        ))}
      </div>

      <div data-lift className="hero-grid relative z-10">
        {/* ── the plate ─────────────────────────────────────────── */}
        <figure data-plate className="hero-plate plate">
          <img
            src={LINKS.portrait}
            alt={t.portraitAlt}
            width={1062}
            height={1280}
            fetchPriority="high"
            className="object-[50%_18%]"
          />

          {/* The network burns through the plate rather than floating
              behind the page — the 3D is part of the picture now. */}
          <div
            data-field
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] opacity-80 mix-blend-screen"
          >
            {field && (
              <Suspense fallback={null}>
                <HeroField lite={field === 'lite'} />
              </Suspense>
            )}
          </div>

          <span aria-hidden="true" className="plate-scan z-[2]" />

          <figcaption
            lang="en"
            className="label ltr measure-mark absolute bottom-4 z-[3]"
            style={{ insetInlineStart: '1.1rem' }}
          >
            MK · 001
          </figcaption>
        </figure>

        {/* ── the name ──────────────────────────────────────────── */}
        <div className="hero-type name-box relative">
          <div data-meta className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="label">{t.hero.role}</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan shadow-[0_0_10px_2px_rgb(92_225_230/0.7)]" />
              <ShinyText
                className="label"
                baseColor="var(--color-ink-2)"
                shineColor="var(--color-cyan)"
                rtl={lang === 'ar'}
              >
                {t.hero.open}
              </ShinyText>
            </span>
          </div>

          {/* The name is split across two clipping masks so each line can
              rise on its own. Without this the accessible name is the two
              spans run together — "MOHAMMEDKARIRI". */}
          <h1
            aria-label={`${t.hero.first} ${t.hero.last}`}
            className="mask-stack display-type display-xl display-hero text-[length:var(--hero-name)]"
          >
            <span className="mask-line">
              <span data-name className="block">{t.hero.first}</span>
            </span>
            <span className="mask-line">
              {/* Hollow against solid. It is a paint change, so Arabic
                  shaping is untouched. */}
              <span data-name className="type-outline block">{t.hero.last}</span>
            </span>
          </h1>

          <p data-meta className="measure-sm mt-6 text-lg text-ink-2 md:text-xl">
            {t.hero.claim}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div data-act className="w-full sm:w-auto">
              <MagneticButton
                href={LINKS.whatsapp}
                external
                size="md"
                variant="solid"
                wrapperClassName="w-full sm:w-auto"
                className="w-full justify-center sm:w-auto"
              >
                <MessageCircle size={17} aria-hidden />
                {t.hero.cta}
                <ArrowUpRight size={16} aria-hidden className="go-icon" />
              </MagneticButton>
            </div>
            <div data-act className="w-full sm:w-auto">
              <ShineButton
                href={LINKS.cv}
                download
                rtl={lang === 'ar'}
                className="h-14 w-full justify-center px-6 sm:w-auto"
              >
                <FileText size={16} aria-hidden />
                {t.hero.cv}
              </ShineButton>
            </div>
          </div>
        </div>

        {/* ── the rail ──────────────────────────────────────────── */}
        <div data-meta className="hero-rail relative z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-8 lg:pt-0">
          <div aria-hidden="true" className="wire h-px w-full" />
          <dl className="grid12 mt-5 gap-y-5">
            {spec.map(([k, v]) => (
              <div key={k} className="col-span-6 md:col-span-3">
                <dt className="label">{k}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* The cue only earns its place where the fold actually cuts the
          composition. On a phone the rail already closes it. */}
      <a
        data-cue
        href="#fault"
        className="label absolute bottom-5 z-20 hidden w-fit items-center gap-2 hover:text-ink lg:flex"
        style={{ insetInlineEnd: 'var(--pad)' }}
      >
        {t.hero.cue}
        <ArrowDown size={13} aria-hidden className="animate-bounce" />
      </a>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAULT — the chapter that makes the page about the work.

   Three faults from an ordinary day, named in his own words, strung on
   one wire and arriving one at a time. They resolve into the statement
   that explains where the ability to fix them comes from.

   Wide screens pin the stage and scrub through it, so each fault owns
   the screen for a moment. Phones do not pin: a pinned stage on a
   handset fights the browser's own collapsing toolbar, and the same
   sequence reads perfectly well as a stack that reveals on approach.
   ═══════════════════════════════════════════════════════════════ */
export function Fault() {
  const { t, lang } = useLang();

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=220%',
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6
        }
      });

      q('[data-fault]').forEach((row, i) => {
        tl.from(row, { opacity: 0, yPercent: 55, filter: 'blur(9px)', duration: 1 }, i * 0.85);
      });

      // The faults recede, and what is left standing is the answer to them.
      tl.to(q('[data-fault]'), { opacity: 0.3, filter: 'blur(2px)', duration: 0.7 }, 2.9)
        .from(q('[data-close]'), { yPercent: 118, duration: 1, stagger: 0.12 }, 3.1)
        .fromTo(q('[data-spine]'), { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 3.2 }, 0);
    });

    mm.add('(max-width: 1023px)', () => {
      gsap.from(q('[data-fault]'), {
        opacity: 0,
        y: 26,
        duration: 0.6,
        stagger: 0.12,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 72%' }
      });
      gsap.from(q('[data-close]'), {
        yPercent: 118,
        duration: 0.9,
        stagger: 0.1,
        ease: EASE,
        scrollTrigger: { trigger: q('[data-closing]')[0], start: 'top 85%' }
      });
      gsap.fromTo(
        q('[data-spine]'),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 70%', scrub: 0.5 }
        }
      );
    });

    return () => mm.revert();
  }, [lang]);

  return (
    <section
      ref={root}
      id="fault"
      className="chapter-edge relative flex scroll-mt-[var(--rail)] flex-col justify-center overflow-hidden px-[var(--pad)] py-[clamp(4rem,10vh,7rem)] lg:min-h-[100svh] lg:py-0"
      style={aura(194)}
    >
      <div className="aura" />

      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <Chapter index="00" name={t.fault.tag} count="06" ghost={false} className="mb-8" />
        <p className="measure mb-10 text-lg text-ink-2 md:mb-14 md:text-xl">{t.fault.lead}</p>

        <div className="relative ps-6 md:ps-10">
          {/* One wire threading all three, drawn as you descend. */}
          <span
            aria-hidden="true"
            data-spine
            className="absolute inset-y-0 start-0 w-px origin-top bg-gradient-to-b from-cyan via-blue to-transparent"
          />

          <ul>
            {t.fault.items.map((f) => (
              <li
                data-fault
                key={f.code}
                className="relative border-b border-[var(--line)] py-6 md:py-8"
              >
                <span
                  aria-hidden="true"
                  className="absolute -start-6 top-9 h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_2px_rgb(92_225_230/0.5)] md:-start-10 md:top-11"
                />
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span lang="en" className="label label-accent ltr">{f.code}</span>
                  <span className="label">{f.state}</span>
                </div>
                <p className="display-soft mt-2 text-[clamp(1.35rem,3.6vw,2.6rem)] text-ink">
                  {f.line}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* The close. Two lines that say where the fix comes from. */}
        <div data-closing className="vel-lean mask-stack mt-12 md:mt-16">
          <p className="mask-line">
            <span data-close className="block display-type display-xl text-[clamp(1.6rem,5.6vw,4.4rem)]">
              {t.statement.l1}
            </span>
          </p>
          <p className="mask-line">
            <span
              data-close
              className="block display-type display-xl text-[clamp(1.6rem,5.6vw,4.4rem)] text-ink-3"
            >
              {t.statement.l2}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT — the lead paragraph resolves out of blur word by word, the
   wire draws down beside it, and the facts light up under a moving
   spotlight.

   Lightswind: ScrollReveal (blur → sharp), CountUp, SpotlightCards.
   ═══════════════════════════════════════════════════════════════ */
export function About() {
  const { t, lang } = useLang();

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    /* Wide screens get the horizontal entrance the section was designed
       around. Narrow ones move vertically instead: a 40px sideways
       offset on a 375px viewport parks content outside the page until
       its trigger fires, which `overflow-x: clip` then hides. */
    const build = (x: number, y: number) => () => {
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 72%' } })
        .from(q('[data-tag]'), { opacity: 0, x, y, duration: 0.7, ease: EASE })
        .from(q('[data-para]'), { opacity: 0, x, y, filter: 'blur(8px)', duration: 0.9, ease: EASE }, 0.1);
    };

    mm.add('(min-width: 1024px)', build(lang === 'ar' ? 40 : -40, 0));
    mm.add('(max-width: 1023px)', build(0, 30));

    /* The figures do not fade in together. Each one rises out of its own
       rule with the count already running, so the row reads left to
       right like something being tallied. */
    arrive(q('[data-stat]'), { y: 44, stagger: 0.14, start: 'top 86%' });

    /* The fact cards turn as they cross — the section's one moment of
       real perspective, and the reason the grid stops reading as a
       grid. */
    depthPass(q('[data-fact]'), { rotate: 11 });

    // The rule beside the copy draws itself as you descend.
    gsap.from(q('[data-draw]'), {
      scaleY: 0,
      transformOrigin: 'top',
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 70%', scrub: 0.5 }
    });

    // The tally sits on a nearer plane than the copy above it.
    if (!isCoarse()) parallax(q('[data-stats-row]')[0], 7, 1);

    return () => mm.revert();
  }, [lang]);

  return (
    <section
      ref={root}
      id="about"
      className="chapter-edge relative scroll-mt-[var(--rail)] px-[var(--pad)] py-[clamp(4rem,9vh,7rem)]"
      style={aura(218)}
    >
      <div className="aura" />
      <div data-stage className="relative z-10 mx-auto w-full max-w-[88rem]">
        <div data-tag>
          <Chapter index="02" name={t.about.tag} className="mb-10 md:mb-14" />
        </div>

        <div className="grid gap-10 md:grid-cols-[auto_1fr] md:gap-14">
          <span data-draw className="hidden w-px bg-gradient-to-b from-cyan via-violet to-transparent md:block" />

          <div>
            <ScrollReveal
              className="measure text-xl text-ink md:text-2xl"
              rtl={lang === 'ar'}
              blurStrength={7}
              staggerDelay={0.028}
              threshold={0.25}
            >
              {t.about.p1}
            </ScrollReveal>

            <p data-para className="measure mt-6 text-base text-ink-2 md:text-lg">
              {t.about.p2}
            </p>

            {/* Three items in a two-column grid leaves one stranded on its
                own row, and a third column at 375px shreds the longest
                label across three lines. On phones they become a list —
                figure on the inline start, label beside it, ruled — and
                only stack into columns once there is width for them. */}
            <dl data-stats-row className="mt-11 grid gap-y-4 sm:mt-12 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-8">
              {t.about.stats.map((s) => (
                /* `order-first` puts the figure ahead of its label along
                   whichever axis is current, so it leads in both
                   directions without duplicating the markup. */
                <div
                  data-stat
                  key={s.k}
                  className="flex items-baseline gap-4 border-t border-[var(--line)] pt-4 sm:flex-col-reverse sm:items-start sm:gap-0 sm:border-0 sm:pt-0"
                >
                  <dt className="label flex-1 leading-relaxed sm:mt-2 sm:max-w-[19ch] sm:flex-none">
                    {s.k}
                  </dt>
                  <dd className="display-type order-first shrink-0 text-[clamp(2.4rem,7vw,4.5rem)] leading-none text-ink sm:order-none">
                    <CountUp value={s.n} duration={1.5} />
                  </dd>
                </div>
              ))}
            </dl>

            <SpotlightCards
              className="mt-12"
              radius={280}
              layoutClassName="grid gap-px bg-[var(--line)] sm:grid-cols-2"
            >
              {t.about.facts.map((f, i) => (
                <SpotlightCard
                  key={f.k}
                  data-fact
                  glowColor={['var(--color-cyan)', 'var(--color-blue)', 'var(--color-violet)', 'var(--color-cyan)'][i % 4]}
                  className="edge-run border-0 p-5"
                >
                  <p className="label">{f.k}</p>
                  <p className="mt-2 text-sm text-ink">{f.v}</p>
                </SpotlightCard>
              ))}
            </SpotlightCards>
          </div>
        </div>
      </div>
    </section>
  );
}
