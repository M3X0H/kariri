import { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, FileText, MessageCircle } from 'lucide-react';
import { useLang } from '../lib/lang';
import { LINKS, STACK } from '../content';
import { gsap, useScene, splitWords, aura, EASE, prefersReduced, isCoarse } from '../lib/motion';
import { AuroraBackground } from './lightswind/aurora-background';
import { CountUp } from './lightswind/count-up';
import { MagneticButton } from './lightswind/magnetic-button';
import { ScrollReveal } from './lightswind/scroll-reveal';
import { ShineButton } from './lightswind/shine-button';
import { ShinyText } from './lightswind/shiny-text';
import { SpotlightCard, SpotlightCards } from './lightswind/spotlight-cards';
import { TextScrollMarquee } from './lightswind/text-scroll-marquee';
import { TiltCard } from './lightswind/tilt-card';

const HeroField = lazy(() => import('./HeroField'));

/* The field is the hero's signature, so phones get it too — at half the
   nodes, a capped pixel ratio and lower opacity, sitting behind the type
   rather than competing with it. Only reduced motion opts out entirely,
   and then the CSS bloom carries the composition on its own. */
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
   HERO — cinematic entrance over the signal field, then the whole
   composition lifts, softens and parallaxes apart as you leave it.

   Lightswind: AuroraBackground (ambience), ShinyText (availability),
   TiltCard (portrait), MagneticButton + ShineButton (the two actions).
   ═══════════════════════════════════════════════════════════════ */
export function Hero({ ready }: { ready: boolean }) {
  const { t, lang } = useLang();
  const field = useFieldQuality();

  const root = useScene<HTMLElement>((el) => {
    if (!ready) return;

    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({ defaults: { ease: EASE } });

    // The name arrives word by word out of its own clipping mask.
    const words = q('[data-name]').flatMap((n) => splitWords(n as HTMLElement));

    tl.from(q('[data-field]'), { opacity: 0, scale: 1.14, duration: 1.6, ease: 'power2.out' })
      .from(words, { yPercent: 118, duration: 1.15, stagger: 0.07 }, 0.15)
      .from(q('[data-meta]'), { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, 0.5)
      .from(q('[data-portrait]'), { opacity: 0, scale: 0.9, filter: 'blur(10px)', duration: 1 }, 0.55)
      .from(q('[data-act]'), { opacity: 0, y: 22, duration: 0.7, stagger: 0.09 }, 0.75)
      .from(q('[data-cue]'), { opacity: 0, duration: 0.6 }, 1);

    // Leaving the hero: lift, fade, soften.
    gsap.to(q('[data-lift]'), {
      yPercent: -18,
      opacity: 0,
      filter: 'blur(6px)',
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    // The portrait rides out slower than the copy beside it, so the two
    // planes separate on the way up rather than leaving as one block.
    if (!isCoarse()) {
      gsap.to(q('[data-portrait]'), {
        yPercent: 26,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.9 }
      });
    }
  }, [ready, lang]);

  return (
    <section
      ref={root}
      id="start"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-[max(1.25rem,5vw)] pb-[8vh] pt-[calc(var(--rail,5rem)+5vh)]"
      style={aura(186)}
    >
      {/* Cyan through blue into indigo — the page opens at the cool end. */}
      <AuroraBackground hue={186} spread={62} intensity={0.26} />
      <div className="aura" />

      {/* The signal field, and the bloom that stands in for it. On a phone
          the name runs the full width and sits over the field, so the
          field drops back in opacity and rides above the type rather than
          through it. */}
      <div
        data-field
        className="absolute inset-x-0 bottom-0 top-0 z-0 opacity-55 max-sm:bottom-auto max-sm:h-[62vh] sm:opacity-100"
      >
        <div className="absolute left-1/2 top-1/2 h-[min(78vw,44rem)] w-[min(78vw,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(92,225,230,0.14),rgba(79,124,255,0.07)_45%,transparent_70%)] blur-2xl" />
        {field && (
          <Suspense fallback={null}>
            <HeroField lite={field === 'lite'} />
          </Suspense>
        )}
      </div>

      <div data-lift className="relative z-10 mx-auto w-full max-w-[88rem]">
        {/* Phones open on an identity row — face, role, availability — so
            the portrait introduces the name instead of trailing it as a
            stray card. From `sm` up the portrait leaves this row and takes
            its place beside the claim, where the desktop composition
            wants it. */}
        <div data-meta className="mb-7 flex items-center gap-3.5 sm:mb-6 sm:gap-x-5 sm:gap-y-2 sm:flex-wrap">
          <img
            src={LINKS.portrait}
            alt=""
            width={1062}
            height={1280}
            fetchPriority="high"
            aria-hidden="true"
            className="h-11 w-11 shrink-0 rounded-full object-cover object-[50%_18%] grayscale ring-1 ring-[var(--line-2)] sm:hidden"
          />
          <span className="min-w-0 flex-1 sm:flex-none">
            <span className="label block truncate">{t.hero.role}</span>
            <span className="mt-1 inline-flex items-center gap-2 sm:hidden">
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
          </span>

          {/* The coordinates are a decorative flourish. On a phone they
              cost a whole wrapped line and push the name down the page. */}
          <span className="label ltr hidden sm:inline">24°42′N 46°43′E · {t.hero.place}</span>
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_10px_2px_rgb(92_225_230/0.7)]" />
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

        <h1 className="mask-stack display-type display-xl display-hero text-[length:var(--hero-name)]">
          <span className="mask-line">
            <span data-name className="block">{t.hero.first}</span>
          </span>
          <span className="mask-line">
            <span data-name className="block text-ink-2">{t.hero.last}</span>
          </span>
        </h1>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-x-10 gap-y-8 sm:mt-8">
          {/* The measure belongs to the sentence, not to the row of
              actions under it — capping both at one measure wrapped the
              two buttons onto separate lines for no reason. */}
          <div className="w-full sm:w-auto">
            <p data-meta className="measure-sm text-lg text-ink-2 md:text-xl">
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

          {/* The portrait sits on a card that turns to face the pointer;
              the caption is lifted off its surface so the two planes
              separate as it tilts. On phones the face has already been
              introduced up top, so this card stands down. */}
          <figure data-portrait className="relative hidden sm:block">
            <TiltCard maxTilt={11} float={7} shine={0.22} className="w-fit">
              <div className="glass flex items-center gap-4 p-3 pe-6">
                <img
                  src={LINKS.portrait}
                  alt={t.portraitAlt}
                  width={1062}
                  height={1280}
                  className="lift-1 h-20 w-20 shrink-0 rounded-full object-cover object-[50%_18%] grayscale ring-1 ring-[var(--line-2)] md:h-24 md:w-24"
                />
                <figcaption className="lift-2 label max-w-[18ch] leading-relaxed">
                  {t.spec.sinceV}
                </figcaption>
              </div>
            </TiltCard>
          </figure>
        </div>

        <dl data-meta className="rule mt-9 grid grid-cols-2 gap-x-6 gap-y-5 pt-6 sm:mt-10 md:grid-cols-4">
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

      {/* The cue only earns its place where the fold actually cuts the
          composition. On a phone the spec grid already runs past it. */}
      <a
        data-cue
        href="#about"
        className="absolute inset-x-0 bottom-5 z-10 mx-auto hidden w-fit items-center gap-2 label hover:text-ink sm:flex"
      >
        {t.hero.cue}
        <ArrowDown size={13} aria-hidden className="animate-bounce" />
      </a>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATEMENT — the two halves slide past each other on scrub, in
   opposite directions, and settle as they meet.
   ═══════════════════════════════════════════════════════════════ */
export function Statement() {
  const { t } = useLang();

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 } })
      .fromTo(q('[data-l1]'), { xPercent: -14 }, { xPercent: 8, ease: 'none' }, 0)
      .fromTo(q('[data-l2]'), { xPercent: 14 }, { xPercent: -8, ease: 'none' }, 0);
  });

  return (
    <section
      ref={root}
      className="relative overflow-hidden py-[clamp(3.5rem,9vh,6rem)]"
      style={aura(210)}
    >
      <div className="aura" />
      <div className="relative z-10">
        <p data-l1 className="display-type whitespace-nowrap text-[clamp(1.75rem,7vw,6rem)]">
          {t.statement.l1}
        </p>
        <p data-l2 className="display-type whitespace-nowrap text-end text-[clamp(1.75rem,7vw,6rem)] text-ink-3">
          {t.statement.l2}
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STACK BAND — the chapter break between the statement and the work.
   A full-bleed strip that drifts on its own and is shoved along by
   scroll velocity, so the page reacts to how fast it is being read.

   Lightswind: TextScrollMarquee.
   ═══════════════════════════════════════════════════════════════ */
export function StackBand() {
  const { t } = useLang();

  return (
    <section
      className="chapter-edge relative overflow-hidden border-y border-[var(--line)] bg-graphite/60 py-6"
      style={aura(200)}
      aria-label={t.stackTag}
    >
      <TextScrollMarquee baseVelocity={4.5} copies={3}>
        {STACK.map((s) => (
          <span key={s} className="flex shrink-0 items-center">
            <span className="font-display text-[clamp(1.1rem,2.6vw,2rem)] tracking-tight text-ink-2">
              {s}
            </span>
            <span
              aria-hidden="true"
              className="mx-6 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan/70 md:mx-9"
            />
          </span>
        ))}
      </TextScrollMarquee>

      {/* The strip is decorative; the stack itself still has to be readable. */}
      <ul className="sr-only">
        {STACK.map((s) => (
          <li key={s} lang="en">{s}</li>
        ))}
      </ul>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT — the lead paragraph resolves out of blur word by word, the
   rule draws down beside it, and the facts light up under a moving
   spotlight.

   Lightswind: ScrollReveal (blur → sharp), CountUp, SpotlightCards.
   ═══════════════════════════════════════════════════════════════ */
export function About() {
  const { t, lang } = useLang();

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    /* Wide screens get the horizontal entrance the section was designed
       around. Narrow ones move vertically instead: a 60px sideways
       offset on a 375px viewport parks content outside the page until
       its trigger fires, which `overflow-x: clip` then hides. */
    const build = (x: number, y: number) => () => {
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 72%' } })
        .from(q('[data-tag]'), { opacity: 0, x, y, duration: 0.7, ease: EASE })
        .from(q('[data-para]'), { opacity: 0, x, y, duration: 0.9, ease: EASE }, 0.1)
        .from(q('[data-stat]'), { opacity: 0, y: 26, duration: 0.7, stagger: 0.1, ease: EASE }, 0.3);
    };

    mm.add('(min-width: 1024px)', build(lang === 'ar' ? 40 : -40, 0));
    mm.add('(max-width: 1023px)', build(0, 30));

    gsap.from(q('[data-draw]'), {
      scaleY: 0,
      transformOrigin: 'top',
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 70%', scrub: 0.5 }
    });

    return () => mm.revert();
  }, [lang]);

  return (
    <section
      ref={root}
      id="about"
      className="relative scroll-mt-24 px-[max(1.25rem,5vw)] py-[clamp(3.5rem,8vh,6.5rem)]"
      style={aura(210)}
    >
      <div className="aura" />
      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <h2 data-tag className="label mb-10">
          <span className="text-cyan">01</span> — {t.about.tag}
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
            <dl className="mt-11 grid gap-y-4 sm:mt-12 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-8">
              {t.about.stats.map((s) => (
                /* `order-first` puts the figure ahead of its label along
                   whichever axis is current, so it leads in both
                   directions without duplicating the markup. */
                <div
                  data-stat
                  key={s.k}
                  className="flex items-baseline gap-4 border-t border-[var(--line)] pt-4 sm:flex-col-reverse sm:items-start sm:gap-0 sm:border-0 sm:pt-0"
                >
                  <dt className="label flex-1 leading-relaxed sm:mt-2 sm:max-w-[16ch] sm:flex-none">
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
                  glowColor={['var(--color-cyan)', 'var(--color-blue)', 'var(--color-violet)', 'var(--color-magenta)'][i % 4]}
                  className="border-0 p-5"
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
