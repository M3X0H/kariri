import { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, FileText, MessageCircle } from 'lucide-react';
import { useLang } from '../lib/lang';
import { LINKS } from '../content';
import { gsap, useScene, splitUnits, aura, EASE, prefersReduced, isCoarse } from '../lib/motion';
import { arrive, depthPass, drift, parallax } from '../lib/scenes';
import { AuroraBackground } from './lightswind/aurora-background';
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
   HERO — one lockup, not three objects.

   The portrait is not a card beside the name: it is the core of the
   network. The WebGL field is anchored to the aperture and blooms out
   of it, its spokes running under the type, so the person, the diagram
   and his name read as a single composition. Phones lead with the
   aperture and stack the name beneath it; wide screens set the name
   against it across the fold.

   Lightswind: AuroraBackground (ambience), ShinyText (availability),
   MagneticButton + ShineButton (the two actions).
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
       cut finer than a word without breaking its joins. See `splitUnits`. */
    const units = q('[data-name]').flatMap((n) => splitUnits(n as HTMLElement));

    tl.from(q('[data-field]'), { opacity: 0, scale: 1.18, duration: 1.8, ease: 'power2.out' })
      /* The portrait does not fade in; the aperture opens on it. The
         element is already a circle, so the clip is invisible at rest
         and the whole effect costs one animated property. */
      .fromTo(
        q('[data-iris]'),
        { clipPath: 'circle(0% at 50% 50%)' },
        { clipPath: 'circle(75% at 50% 50%)', duration: 1.25, ease: 'power3.inOut' },
        0.15
      )
      .from(q('[data-ring]'), { scale: 0.6, opacity: 0, duration: 1.1, stagger: 0.09 }, 0.25)
      .from(units, { yPercent: 120, duration: 1.05, stagger: 0.045 }, 0.4)
      .from(q('[data-meta]'), { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, 0.72)
      .from(q('[data-act]'), { opacity: 0, y: 22, duration: 0.7, stagger: 0.09 }, 0.95)
      .from(q('[data-cue]'), { opacity: 0, duration: 0.6 }, 1.2);

    // Leaving the hero: lift, fade, soften.
    gsap.to(q('[data-lift]'), {
      yPercent: -14,
      opacity: 0,
      filter: 'blur(6px)',
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    /* The exit is the aperture, not a fade: it swells past the edge of
       the screen as the page leaves, so you read the next chapter as
       having come through it rather than after it. The letters spread
       apart underneath, which separates the planes on the way out. */
    gsap.to(q('[data-aperture]'), {
      scale: 2.6,
      ease: 'power2.in',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.8 }
    });

    gsap.to(units, {
      // Direction-agnostic: the run spreads from its own centre either way.
      xPercent: (i: number) => (i - (units.length - 1) / 2) * 9,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 }
    });

    // Phones get the depth too, just shallower — there is no pointer to
    // carry it, so scroll has to.
    gsap.to(q('[data-field]'), {
      yPercent: isCoarse() ? 8 : 18,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.9 }
    });

    /* Three planes, three speeds. The instrument marks sit furthest
       back and travel most, the status rail sits between, the type
       barely moves — which is what separates the composition into
       depths rather than sliding it as one sheet. */
    q('[data-float]').forEach((mark) => parallax(mark, 26, 1.1));
    drift(q('[data-float]'), isCoarse() ? 5 : 11);

    tl.from(q('[data-float]'), { opacity: 0, scale: 0.4, duration: 0.9, stagger: 0.06 }, 0.7);
  }, [ready, lang]);

  return (
    <section
      ref={root}
      id="start"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-[max(1.25rem,5vw)] pb-[6vh] pt-[calc(var(--rail)+4vh)]"
      style={aura(186)}
    >
      {/* Cyan through blue into indigo — the page opens at the cool end. */}
      <AuroraBackground hue={186} spread={62} intensity={0.24} />
      <div className="aura" />

      {/* The furthest plane. Small marks that drift on their own, travel
          most under scroll, and give the composition something to have
          depth *against* — without them the hero is two planes and a
          background. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]">
        {[
          { t: '12%', l: '8%', k: 'tick' },
          { t: '22%', l: '92%', k: 'dot' },
          { t: '74%', l: '6%', k: 'dot' },
          { t: '86%', l: '88%', k: 'tick' },
          { t: '44%', l: '96%', k: 'cross' },
          { t: '64%', l: '13%', k: 'cross' }
        ].map((m, i) => (
          <span
            key={i}
            data-float
            className="absolute"
            style={{ top: m.t, left: m.l }}
          >
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

      <div data-lift className="relative z-10 mx-auto w-full max-w-[88rem]">
        {/* Status rail. Everything here is a fact about right now: what he
            does, where he is, whether he is available. */}
        <div data-meta className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 md:mb-8">
          <span className="label">{t.hero.role}</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-[var(--line-2)] sm:block" />
          <span className="label ltr hidden sm:inline">24°42′N 46°43′E · {t.hero.place}</span>
          <span className="inline-flex items-center gap-2 sm:ms-auto">
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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:items-center lg:gap-10">
          {/* ── the aperture ─────────────────────────────────────
              Leads on a phone, where it is the first thing on screen and
              introduces the face before the name. Moves to the far side
              of the row from `lg`, where the name has somewhere to go. */}
          <div
            data-aperture
            className="relative order-1 mx-auto w-[min(64vw,15.5rem)] sm:w-[min(42vw,17rem)] lg:order-2 lg:w-[min(31vw,23.5rem)]"
          >
            {/* GSAP owns the transform on `[data-aperture]` for the scroll
                exit, so the pointer camera lives one level in. Only the
                object turns with the pointer — the type stays put, which
                is what makes it read as depth rather than as drift, and
                keeps the largest text on the site off a composited
                layer where it would lose subpixel antialiasing. */}
            <div className="tilt-global relative aspect-square" style={{ ['--tilt' as string]: '8deg', ['--shift' as string]: '12px' }}>
              {/* The network, centred on the face. It is far larger than
                  the aperture and deliberately runs off the section, so
                  the spokes pass under the name rather than stopping at a
                  card edge. The section clips it. */}
              <div
                data-field
                aria-hidden="true"
                className="field-mask pointer-events-none absolute -inset-[105%] z-0 lg:-inset-[95%]"
              >
                <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(92,225,230,0.16),rgba(79,124,255,0.08)_46%,transparent_70%)] blur-2xl" />
                {field && (
                  <Suspense fallback={null}>
                    <HeroField lite={field === 'lite'} />
                  </Suspense>
                )}
              </div>

              {/* Concentric rings put the face inside the instrument. */}
              <div data-ring aria-hidden="true" className="aperture-ring z-10" style={{ inset: '-8%' }} />
              <div data-ring aria-hidden="true" className="aperture-ring z-10" style={{ inset: '-19%', opacity: 0.6 }} />

              <div data-iris className="tilt-lift relative z-10 h-full w-full overflow-hidden rounded-full border border-[var(--line-2)]" style={{ ['--lift' as string]: '34px' }}>
                <img
                  src={LINKS.portrait}
                  alt={t.portraitAlt}
                  width={1062}
                  height={1280}
                  fetchPriority="high"
                  className="h-full w-full object-cover object-[50%_16%] grayscale contrast-[1.06]"
                />
                {/* A cool wash, so the portrait belongs to the palette
                    instead of sitting in it as a grey cut-out. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(200deg,rgba(92,225,230,0.16),transparent_45%,rgba(79,124,255,0.18))] mix-blend-screen"
                />
              </div>

              <div aria-hidden="true" className="aperture-sweep z-10" />
            </div>

          </div>

          {/* ── the name ─────────────────────────────────────── */}
          <div className="name-box relative z-10 order-2 lg:order-1">
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
                <span data-name className="block text-ink-2">{t.hero.last}</span>
              </span>
            </h1>

            <p data-meta className="measure-sm mt-6 text-lg text-ink-2 md:text-xl">
              {t.hero.claim}
            </p>

            {/* Full-bleed and equal on a phone: two controls of different
                widths stacked left-ragged read as an accident. They only
                shrink to their content once there is a row to sit in. */}
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
                  <ArrowUpRight size={16} aria-hidden />
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
        </div>

        {/* The spec rail, hung off a live wire rather than a dead rule —
            the same motif the capability map and the career spine use. */}
        <div data-meta className="mt-9 md:mt-12">
          <div aria-hidden="true" className="wire h-px w-full" />
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
            {[
              [t.spec.role, t.spec.roleV],
              [t.spec.base, t.spec.baseV],
              [t.spec.since, t.spec.sinceV],
              [t.spec.langs, t.spec.langsV]
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* The cue only earns its place where the fold actually cuts the
          composition. On a phone the spec grid already runs past it. */}
      <a
        data-cue
        href="#fault"
        className="absolute inset-x-0 bottom-5 z-10 mx-auto hidden w-fit items-center gap-2 label hover:text-ink lg:flex"
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
      className="chapter-edge relative flex scroll-mt-[var(--rail)] flex-col justify-center overflow-hidden px-[max(1.25rem,5vw)] py-[clamp(4rem,10vh,7rem)] lg:min-h-[100svh] lg:py-0"
      style={aura(194)}
    >
      <div className="aura" />

      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 className="label mb-3">{t.fault.tag}</h2>
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
      className="chapter-edge relative scroll-mt-[var(--rail)] px-[max(1.25rem,5vw)] py-[clamp(4rem,9vh,7rem)]"
      style={aura(218)}
    >
      <div className="aura" />
      <div data-stage className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 data-tag className="label mb-10">
          <span aria-hidden="true"><span className="text-cyan">02</span> — </span>{t.about.tag}
        </h2>

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
