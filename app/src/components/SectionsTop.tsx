import { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { useLang } from '../lib/lang';
import { LINKS } from '../content';
import { gsap, useScene, splitWords, aura, EASE, prefersReduced } from '../lib/motion';

const HeroField = lazy(() => import('./HeroField'));

/* WebGL is worth it on a pointer device with a real viewport; anywhere
   else the CSS bloom behind it carries the composition on its own. */
function useFieldCapable() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (prefersReduced() || window.innerWidth < 768) return;
    try {
      const c = document.createElement('canvas');
      setOk(!!(c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/* ═══════════════════════════════════════════════════════════════
   HERO — cinematic entrance, then the whole composition lifts and
   softens as you leave it.
   ═══════════════════════════════════════════════════════════════ */
export function Hero({ ready }: { ready: boolean }) {
  const { t } = useLang();
  const field = useFieldCapable();

  const root = useScene<HTMLElement>((el) => {
    if (!ready) return;

    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({ defaults: { ease: EASE } });

    // The name arrives word by word out of its own clipping mask.
    const words = q('[data-name]').flatMap((n) => splitWords(n as HTMLElement));

    tl.from(q('[data-field]'), { opacity: 0, scale: 1.14, duration: 1.6, ease: 'power2.out' })
      .from(words, { yPercent: 118, duration: 1.15, stagger: 0.07 }, 0.15)
      .from(q('[data-meta]'), { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, 0.5)
      .from(q('[data-portrait]'), { opacity: 0, scale: 0.9, duration: 0.9 }, 0.6)
      .from(q('[data-cue]'), { opacity: 0, duration: 0.6 }, 0.9);

    // Leaving the hero: lift, fade, soften.
    gsap.to(q('[data-lift]'), {
      yPercent: -18,
      opacity: 0,
      filter: 'blur(6px)',
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
  }, [ready]);

  return (
    <section
      ref={root}
      id="start"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-[max(1.25rem,5vw)] pb-[10vh] pt-[calc(var(--rail,5rem)+6vh)]"
      style={aura(186)}
    >
      <div className="aura" />

      {/* The signal field, and the bloom that stands in for it. */}
      <div data-field className="absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-[min(78vw,44rem)] w-[min(78vw,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(92,225,230,0.14),rgba(79,124,255,0.07)_45%,transparent_70%)] blur-2xl" />
        {field && (
          <Suspense fallback={null}>
            <HeroField />
          </Suspense>
        )}
      </div>

      <div data-lift className="relative z-10 mx-auto w-full max-w-[88rem]">
        <div data-meta className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="label">{t.hero.role}</span>
          <span className="label ltr">24°42′N 46°43′E · {t.hero.place}</span>
          <span className="inline-flex items-center gap-2 label text-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            {t.hero.open}
          </span>
        </div>

        <h1 className="display-type text-[clamp(3rem,13vw,11rem)]">
          <span className="mask-line">
            <span data-name className="block">{t.hero.first}</span>
          </span>
          <span className="mask-line">
            <span data-name className="block text-ink-2">{t.hero.last}</span>
          </span>
        </h1>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <p data-meta className="max-w-[34ch] text-lg text-ink-2 md:text-xl">
            {t.hero.claim}
          </p>

          <figure data-portrait className="flex items-center gap-4">
            <img
              src={LINKS.portrait}
              alt={t.portraitAlt}
              width={1062}
              height={1280}
              fetchPriority="high"
              className="h-20 w-20 shrink-0 rounded-full object-cover object-[50%_18%] grayscale ring-1 ring-[var(--line-2)] md:h-24 md:w-24"
            />
            <figcaption className="label max-w-[18ch] leading-relaxed">{t.spec.sinceV}</figcaption>
          </figure>
        </div>

        <dl data-meta className="rule mt-10 grid grid-cols-2 gap-x-6 gap-y-5 pt-6 md:grid-cols-4">
          {[
            [t.spec.role, t.spec.roleV],
            [t.spec.base, t.spec.baseV],
            [t.spec.since, t.spec.sinceV],
            [t.spec.langs, t.spec.langsV]
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="label">{k}</dt>
              <dd className="mt-1.5 text-sm text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <a
        data-cue
        href="#about"
        className="absolute inset-x-0 bottom-6 z-10 mx-auto flex w-fit items-center gap-2 label hover:text-ink"
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
      className="relative overflow-hidden py-[clamp(4rem,10vh,7rem)]"
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
   ABOUT — content enters from the inline start, the rule draws down
   beside it, and the facts stagger in behind.
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
        .from(q('[data-para]'), { opacity: 0, x, y, duration: 0.9, stagger: 0.12, ease: EASE }, 0.1)
        .from(q('[data-fact]'), { opacity: 0, y: 26, duration: 0.7, stagger: 0.08, ease: EASE }, 0.35);
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
      className="relative scroll-mt-24 px-[max(1.25rem,5vw)] py-[clamp(3rem,7vh,6rem)]"
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
            <p data-para className="max-w-[52ch] text-xl leading-relaxed text-ink md:text-2xl">
              {t.about.p1}
            </p>
            <p data-para className="mt-6 max-w-[52ch] text-base leading-relaxed text-ink-2 md:text-lg">
              {t.about.p2}
            </p>

            <dl className="mt-12 grid gap-px overflow-hidden rounded-sm bg-[var(--line)] sm:grid-cols-2">
              {t.about.facts.map((f) => (
                <div data-fact key={f.k} className="bg-void p-5">
                  <dt className="label">{f.k}</dt>
                  <dd className="mt-2 text-sm text-ink">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
