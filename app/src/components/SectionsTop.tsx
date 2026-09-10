import { Suspense, lazy } from 'react';
import { ArrowDown, ArrowUpRight, FileText, MessageCircle } from 'lucide-react';
import { useLang } from '../lib/lang';
import { Chapter } from './Chapter';
import { LINKS } from '../content';
import { gsap, useScene, splitUnits, aura, EASE, isCoarse } from '../lib/motion';
import { useWebglQuality } from '../lib/quality';
import { arrive, drift, parallax } from '../lib/scenes';
import { CountUp } from './lightswind/count-up';
import { MagneticButton } from './lightswind/magnetic-button';
import { ScrollReveal } from './lightswind/scroll-reveal';
import { ShineButton } from './lightswind/shine-button';
import { ShinyText } from './lightswind/shiny-text';

const HeroField = lazy(() => import('./HeroField'));

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
  /* The field is the hero's signature, so phones get it too — at half
     the nodes and a capped pixel ratio, blooming out of the portrait
     rather than competing with it. Only reduced motion opts out, and
     then the composition carries on its own. */
  const field = useWebglQuality();

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

  /* The rail's last cell used to repeat the languages, which the About
     specification already states. It carries the direction instead —
     the one thing a recruiter should see above the fold that the role
     line cannot say on its own. */
  const spec: [string, string][] = [
    [t.spec.role, t.spec.roleV],
    [t.spec.base, t.spec.baseV],
    [t.spec.since, t.spec.sinceV],
    [t.spec.focus, t.spec.focusV]
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
          <div data-meta className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="label">{t.hero.role}</span>
            {/* The degree, stated beside the role rather than three
                chapters below it. Both halves of the positioning are
                now above the fold. */}
            <span aria-hidden="true" className="h-3 w-px bg-[var(--line-2)]" />
            <span className="label">{t.hero.field}</span>
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

          <p data-meta className="measure-sm mt-5 text-lg text-ink-2 md:mt-6 md:text-xl">
            {t.hero.claim}
          </p>

          {/* Where it goes next, set quieter than what it is now. The
              hierarchy is the honesty: the claim is what he has done,
              this is what he is moving toward. */}
          <p data-meta className="measure-sm mt-2.5 text-sm leading-snug text-ink-3 md:text-base md:leading-relaxed">
            {t.hero.next}
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
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

            {/* The third recruiter action. Deliberately not a third
                button: three stacked 56px controls is most of a phone
                screen, and this one is a jump down the same page rather
                than a commitment. */}
            <a
              data-act
              href="#career"
              className="group inline-flex w-fit items-center gap-2 py-1.5 text-sm text-ink-2 transition-colors hover:text-ink sm:py-0 sm:ps-1"
            >
              <span className="u-line">{t.hero.see}</span>
              <ArrowDown size={14} aria-hidden className="shrink-0" />
            </a>
          </div>
        </div>

        {/* ── the rail ──────────────────────────────────────────── */}
        <div data-meta className="hero-rail relative z-10 pb-[calc(1.1rem+env(safe-area-inset-bottom))] pt-5 lg:pb-0 lg:pt-0">
          <div aria-hidden="true" className="wire h-px w-full" />
          <dl className="grid12 mt-3 gap-y-3.5 md:mt-5 md:gap-y-5">
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
      style={aura(36)}
    >
      <div className="aura" />

      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <Chapter index="00" name={t.fault.tag} count="07" ghost={false} className="mb-8" />
        <p className="measure mb-10 text-lg text-ink-2 md:mb-14 md:text-xl">{t.fault.lead}</p>

        <div className="relative ps-6 md:ps-10">
          {/* One wire threading all three, drawn as you descend. */}
          <span
            aria-hidden="true"
            data-spine
            className="signal-spine absolute inset-y-0 start-0 w-px origin-top"
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
                  className="signal-dot absolute -start-6 top-9 h-1.5 w-1.5 rounded-full md:-start-10 md:top-11"
                />
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span lang="en" className="label label-signal ltr">{f.code}</span>
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
   ABOUT — the editorial scene.

   No cards. The type is the composition: a lead set at display scale
   holding the first eight columns, a second paragraph stepped inward
   and travelling at a different speed so the two never read as one
   block, then the three figures set enormous in mono and hung off a
   rule — they are the section's watermark, which is why this chapter
   carries no ghost numeral. The facts close it as a specification,
   ruled and keyed, rather than as a grid of glowing panels.

   The figures are mono in both languages on purpose. They are numerals,
   and the register belongs to the instrument rather than to the script.
   ═══════════════════════════════════════════════════════════════ */
export function About() {
  const { t, lang } = useLang();

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    /* Wide screens get the horizontal entrance the section is composed
       around. Narrow ones move vertically instead: a sideways offset on
       a 375px viewport parks content outside the page until its trigger
       fires, which `overflow-x: clip` then hides. */
    const build = (x: number) => () => {
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 74%' } })
        .from(q('[data-tag]'), { opacity: 0, x, duration: 0.7, ease: EASE })
        .from(q('[data-lead-copy]'), { opacity: 0, x, filter: 'blur(9px)', duration: 0.9, ease: EASE }, 0.1);
    };

    mm.add('(min-width: 1024px)', build(lang === 'ar' ? 44 : -44));
    mm.add('(max-width: 1023px)', build(0));

    /* The two paragraphs travel at different speeds. That difference is
       the whole reason the block reads as edited rather than typed. */
    if (!isCoarse()) {
      parallax(q('[data-lead-copy]')[0], 5, 1.2);
      parallax(q('[data-second]')[0], 14, 0.9);
    }

    // Each figure rises out of its own rule with the count already running.
    arrive(q('[data-stat]'), { y: 52, stagger: 0.13, start: 'top 88%' });

    // The rule under the figures draws itself as the row lands.
    gsap.from(q('[data-rule]'), {
      scaleX: 0,
      transformOrigin: lang === 'ar' ? 'right' : 'left',
      duration: 1.1,
      ease: EASE,
      scrollTrigger: { trigger: q('[data-figures]')[0], start: 'top 90%' }
    });

    // The specification rows deal out one at a time.
    arrive(q('[data-fact]'), { y: 26, stagger: 0.07, start: 'top 90%' });
  }, [lang]);

  return (
    <section
      ref={root}
      id="about"
      className="chapter-edge relative scroll-mt-[var(--rail)] px-[var(--pad)] py-[clamp(4.5rem,11vh,9rem)]"
      style={aura(218)}
    >
      <div className="aura" />

      <div data-stage className="relative z-10 mx-auto w-full max-w-[88rem]">
        <div data-tag>
          {/* No watermark here: the figures below are this scene's. */}
          <Chapter index="01" name={t.about.tag} ghost={false} className="mb-12 md:mb-20" />
        </div>

        {/* ── the lead ──────────────────────────────────────────── */}
        <div className="grid12">
          <div data-lead-copy className="col-span-12 lg:col-span-8">
            <ScrollReveal
              className="text-[clamp(1.35rem,3.1vw,2.5rem)] leading-[1.35] text-ink"
              rtl={lang === 'ar'}
              blurStrength={8}
              staggerDelay={0.024}
              threshold={0.2}
            >
              {t.about.p1}
            </ScrollReveal>
          </div>

          {/* Stepped inward, and set smaller. An indent this deliberate
              is what stops two paragraphs reading as one column. */}
          <p
            data-second
            className="col-span-12 mt-8 text-base leading-relaxed text-ink-2 md:text-lg lg:col-span-7 lg:col-start-5 lg:mt-14"
          >
            {t.about.p2}
          </p>
        </div>

        {/* ── the figures ───────────────────────────────────────── */}
        <div data-figures className="mt-16 md:mt-24">
          <span
            data-rule
            aria-hidden="true"
            className="block h-px w-full bg-[var(--line-2)]"
          />

          <dl className="grid12 gap-y-10 pt-8 md:pt-12">
            {t.about.stats.map((s) => (
              <div key={s.k} data-stat className="col-span-12 sm:col-span-4">
                <dd className="stat-mega" lang="en">
                  <CountUp value={s.n} duration={1.6} />
                </dd>
                <dt className="label mt-4 max-w-[20ch] leading-relaxed">{s.k}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* ── the specification ─────────────────────────────────── */}
        <div className="grid12 mt-16 gap-x-12 md:mt-24">
          <div className="col-span-12 lg:col-span-6">
            {t.about.facts.slice(0, 2).map((f) => (
              <div key={f.k} data-fact className="fact-row">
                <dt className="label">{f.k}</dt>
                <dd className="text-sm leading-relaxed text-ink md:text-base">{f.v}</dd>
              </div>
            ))}
          </div>
          <div className="col-span-12 lg:col-span-6">
            {t.about.facts.slice(2).map((f) => (
              <div key={f.k} data-fact className="fact-row">
                <dt className="label">{f.k}</dt>
                <dd className="text-sm leading-relaxed text-ink md:text-base">{f.v}</dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
