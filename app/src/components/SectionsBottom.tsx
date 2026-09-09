import { useEffect, useState } from 'react';
import { ArrowUpRight, FileText, Github, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { useLang } from '../lib/lang';
import { Chapter } from './Chapter';
import { LINKS } from '../content';
import { gsap, ScrollTrigger, useScene, splitUnits, aura, EASE, isCoarse, prefersReduced } from '../lib/motion';
import { arrive, depthPass, parallax } from '../lib/scenes';
import { AuroraBackground } from './lightswind/aurora-background';
import { BorderBeam } from './lightswind/border-beam';
import { MagneticButton } from './lightswind/magnetic-button';
import { ParticleField } from './lightswind/particle-field';
import { ShineButton } from './lightswind/shine-button';
import { TextScrollMarquee } from './lightswind/text-scroll-marquee';
import { TiltCard } from './lightswind/tilt-card';
import { VelocityRow, VelocityRows } from './lightswind/velocity-rows';

/* ═══════════════════════════════════════════════════════════════
   CAREER — the page turns sideways.

   Three entries is too few for a vertical timeline to earn its
   scrollbar and too many to sit in a row, so on a wide screen the
   section pins and the track travels horizontally under it: each post
   arrives, holds the middle of the screen at full weight, and recedes
   as the next takes it. The year behind the track changes with it.

   The horizontal layout is opt-in, added by the scene itself. Without
   script — or under reduced motion, where the scene never runs — the
   track stays a plain vertical list, because a `width: max-content`
   row inside a clipped viewport with nothing to move it would simply
   hide two thirds of his career.

   Phones keep the vertical list and get the same idea through depth
   instead: cards arrive small and soft and resolve as they reach the
   middle of the screen.

   Lightswind: BorderBeam on whichever entry currently owns the screen.
   ═══════════════════════════════════════════════════════════════ */
export function Career() {
  const { t, lang } = useLang();
  const [live, setLive] = useState(0);
  const n = t.career.entries.length;

  /* Which layout the track is in, held in React rather than toggled from
     inside the GSAP scene. The failure this avoids is not hypothetical in
     kind: if the class that makes the row `width: max-content` ever
     outlives the breakpoint that justified it, a clipped viewport hides
     two of the three posts with nothing to scroll them into view. Owning
     it in render means it can only disagree with the viewport for a
     single frame, and it cannot survive a scene teardown at all.

     Reduced motion never gets the horizontal layout: nothing would be
     moving the track, so it would be a clipped row with no way through. */
  const [horizontal, setHorizontal] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setHorizontal(mq.matches && !prefersReduced());
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);

    if (horizontal) {
      const view = q('[data-viewport]')[0] as HTMLElement;
      const track = q('[data-track]')[0] as HTMLElement;
      const cards = q('[data-entry]');

      // The class is already on from the render that set `horizontal`,
      // so this measures the row it is actually going to move.
      const distance = () => Math.max(0, track.scrollWidth - view.clientWidth);

      /* In RTL the row is laid from the right edge and overflows to the
         left, so the track travels the other way to reveal it. */
      const dir = lang === 'ar' ? 1 : -1;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => '+=' + Math.max(distance(), 1),
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            el.style.setProperty('--track', String(self.progress));
            setLive(Math.min(n - 1, Math.round(self.progress * (n - 1))));
          }
        }
      });

      // One timeline unit per card, so a card's own beats can be placed
      // at its index without arithmetic against pixel distances.
      tl.to(track, { x: () => dir * distance(), ease: 'none', duration: n - 1 }, 0);

      /* Each post turns as it crosses: it arrives edge-on, squares up
         to the reader in the middle of the screen, and turns away
         again. The sign follows the travel direction, so the cards
         always rotate *into* the movement rather than against it. */
      const lean = dir * -13;

      cards.forEach((card, i) => {
        tl.fromTo(
          card,
          { scale: 0.88, opacity: 0.3, filter: 'blur(6px)', rotationY: -lean, transformPerspective: 1400 },
          { scale: 1, opacity: 1, filter: 'blur(0px)', rotationY: 0, ease: 'none', duration: 0.55 },
          Math.max(0, i - 0.55)
        );
        if (i < n - 1) {
          tl.to(
            card,
            { scale: 0.88, opacity: 0.3, filter: 'blur(6px)', rotationY: lean, ease: 'none', duration: 0.55 },
            i + 0.45
          );
        }
      });

      return;
    }

    gsap.fromTo(
      q('[data-spine]'),
      { scaleY: 0 },
      {
        scaleY: 1,
        transformOrigin: 'top',
        ease: 'none',
        scrollTrigger: { trigger: q('[data-track]')[0], start: 'top 82%', end: 'bottom 80%', scrub: 0.6 }
      }
    );

    /* Phones get the same turn the horizontal track gives, driven by
       scroll instead of by travel: each post arrives leaning away and
       squares up as it reaches the middle of the screen. */
    depthPass(q('[data-entry]'), { rotate: 8 });

    q('[data-entry]').forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 62%',
        end: 'bottom 45%',
        onToggle: ({ isActive }) => isActive && setLive(i)
      });
    });
  }, [lang, n, horizontal]);

  return (
    <section
      ref={root}
      id="career"
      className="chapter-edge relative flex scroll-mt-[var(--rail)] flex-col justify-center px-[var(--pad)] py-[clamp(4rem,9vh,7rem)] lg:min-h-[100svh] lg:py-0"
      style={aura(234)}
    >
      <div className="aura" />

      {/* The year the page is standing in, behind everything, changing as
          the track moves. On a phone it would eat the card, so it stays
          on the screens with room for it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden items-center justify-center overflow-hidden lg:flex"
      >
        <span className="vel-lean display-type text-[clamp(9rem,26vw,26rem)] leading-none tabular-nums text-ink/[0.05]">
          {t.career.entries[live].year}
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[88rem]">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 lg:mb-12">
          <Chapter index="03" name={t.career.tag} className="min-w-[min(100%,22rem)] flex-1" />

          {/* Where you are in the track. It is the only affordance that
              says "this moves sideways", so it is not decoration. */}
          <div className="hidden items-center gap-3 lg:flex" aria-hidden="true">
            <span className="label ltr tabular-nums">
              {String(live + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
            <span className="relative h-px w-32 bg-[var(--line-2)]">
              <span
                className="absolute inset-y-0 start-0 bg-cyan"
                style={{ width: 'calc(var(--track, 0) * 100%)' }}
              />
            </span>
          </div>
        </div>

        <div
          data-viewport
          className={['career-viewport relative', horizontal ? 'is-horizontal' : ''].join(' ')}
        >
          {/* The vertical spine only exists in the stacked layout. */}
          <span
            data-spine
            aria-hidden="true"
            className="absolute inset-y-0 start-[7px] w-px origin-top bg-gradient-to-b from-cyan via-violet to-transparent lg:hidden"
          />

          <ol data-track className="career-track ps-8 lg:ps-0">
            {t.career.entries.map((e, i) => (
              <li data-entry key={`${e.role}-${e.year}`} className="career-card relative">
                <span
                  aria-hidden="true"
                  className="live-marker absolute -start-8 top-8 z-10 h-3.5 w-3.5 rounded-full border-2 border-cyan bg-void transition-shadow duration-500 lg:hidden"
                />

                <div
                  className={[
                    'relative h-full overflow-hidden border p-6 transition-colors duration-500 md:p-8 lg:p-10',
                    live === i ? 'border-[var(--line-2)] bg-panel/50' : 'border-[var(--line)] bg-graphite/30'
                  ].join(' ')}
                >
                  {live === i && (
                    <BorderBeam
                      size={64}
                      className="[--beam-w:30px] md:[--beam-w:64px]"
                      duration={7}
                      glowIntensity={0.55}
                      colorFrom="var(--color-cyan)"
                      colorTo="var(--color-violet)"
                    />
                  )}

                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-mono text-xs text-cyan">{e.kind}</p>
                    <p aria-hidden="true" className="font-mono text-xs tabular-nums text-ink-3 lg:text-sm">
                      {e.year}
                    </p>
                  </div>

                  <h3 className="display-soft mt-3 text-[clamp(1.4rem,3.4vw,2.4rem)]">{e.role}</h3>
                  <p className="mt-2 text-base text-ink-2">{e.org}</p>
                  <p className="mt-1 font-mono text-xs text-ink-3">{e.span}</p>

                  <ul className="mt-6 space-y-2.5">
                    {e.points.map((pt) => (
                      <li key={pt} className="flex gap-3 text-sm text-ink-2">
                        <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-cyan/60" />
                        <span className="measure-sm">{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {e.impact && (
                    <p className="measure-sm mt-6 border-s-2 border-cyan/40 ps-4 text-sm text-ink-3">
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

   The visual is the site's own identity lockup rather than a grey
   wireframe: the project *is* this page, so a stand-in mock-up of some
   other page would have been a small lie in the middle of the section
   that is meant to prove the work.

   Lightswind: TiltCard (3D perspective), BorderBeam, ShineButton.
   ═══════════════════════════════════════════════════════════════ */
export function Work() {
  const { t, lang } = useLang();
  const p = t.work.project;

  /* The project is this page, so the card shows what the page actually
     is — its six chapters on a wire, in the site's own node language —
     rather than a wireframe of some other website or, worse, the
     portrait a second time twenty centimetres below the first. */
  const chapters: [string, string][] = [
    ['01', t.nav.caps],
    ['02', t.nav.about],
    ['03', t.nav.career],
    ['04', t.nav.work],
    ['05', t.cred.tag],
    ['06', t.nav.contact]
  ];

  const root = useScene<HTMLElement>((el) => {
    const q = gsap.utils.selector(el);

    arrive(q('[data-detail]'), { y: 44, stagger: 0.1, start: 'top 80%' });

    /* The write-up rides a little against the card beside it, so the two
       halves of the section separate in depth as they pass. */
    if (!isCoarse()) parallax(q('[data-details]')[0], 9, 1);

    /* The visual arrives scaled down and out of focus, then resolves as it
       reaches the middle of the screen — the section's own signature.
       Scrubbed, so the blur repaints on every frame of the scroll: phones
       get a third of the radius and a shallower scale for the same read
       at a fraction of the fill cost. */
    const mm = gsap.matchMedia();
    const resolve = (blur: number, scale: number) => () => {
      gsap.fromTo(
        q('[data-visual]'),
        { scale, filter: `blur(${blur}px)`, opacity: 0.35 },
        {
          scale: 1,
          filter: 'blur(0px)',
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: q('[data-visual]')[0], start: 'top 88%', end: 'top 42%', scrub: 0.8 }
        }
      );
    };
    mm.add('(min-width: 768px)', resolve(14, 0.9));
    mm.add('(max-width: 767px)', resolve(5, 0.96));

    if (!isCoarse()) {
      gsap.to(q('[data-visual-inner]'), {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
      });
    }

    return () => mm.revert();
  }, [lang]);

  return (
    <section
      ref={root}
      id="work"
      className="chapter-edge relative scroll-mt-[var(--rail)] px-[var(--pad)] py-[clamp(4rem,9vh,7rem)]"
      style={aura(246)}
    >
      <div className="aura" />
      <div data-stage className="relative z-10 mx-auto w-full max-w-[88rem]">
        <Chapter index="04" name={t.work.tag} ghost={false} className="mb-12" />

        {/* The project's number as the scene's ground. This chapter
            carries no ghost numeral — it has this instead. */}
        <span lang="en" aria-hidden="true" className="work-numeral">
          {p.no}
        </span>

        <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div data-visual className="lg:sticky lg:top-28 lg:self-start">
            <TiltCard maxTilt={8} float={9} shine={0.2} perspective={1300}>
              <div className="edge-run relative overflow-hidden border border-[var(--line-2)] bg-graphite">
                {/* The work is a web interface, so it is presented as
                    one — chrome, address, and all. */}
                <div className="frame-chrome relative z-10">
                  <span aria-hidden="true" className="frame-dot" />
                  <span aria-hidden="true" className="frame-dot" />
                  <span aria-hidden="true" className="frame-dot" />
                  <span
                    lang="en"
                    className="label ltr ms-2 truncate text-[0.55rem] text-ink-3"
                  >
                    m3x0h.github.io/kariri
                  </span>
                </div>

                <div className="relative aspect-[16/11]">
                <BorderBeam
                  size={44}
                  className="[--beam-w:26px] md:[--beam-w:44px]"
                  duration={8}
                  glowIntensity={0.4}
                  opacity={0.75}
                  colorFrom="var(--color-cyan)"
                  colorTo="var(--color-blue)"
                />

                <div
                  data-visual-inner
                  className="absolute inset-0 flex flex-col justify-center p-[8%] [transform-style:preserve-3d]"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(72%_62%_at_72%_16%,rgba(92,225,230,0.15),transparent_66%)]"
                  />

                  <div className="lift-3 relative mb-5 flex items-center gap-3">
                    <span
                      lang="en"
                      className="grid h-7 w-7 shrink-0 place-items-center bg-ink font-mono text-[0.55rem] font-medium text-void"
                    >
                      MK
                    </span>
                    <span lang="en" className="display-type text-[clamp(1.15rem,3.6vw,2rem)] leading-none">
                      KARIRI
                    </span>
                    <span
                      lang="en"
                      className="ms-auto truncate font-mono text-[0.55rem] tracking-[0.12em] text-ink-3"
                    >
                      m3x0h.github.io
                    </span>
                  </div>

                  <ol className="lift-1 relative ps-5">
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 start-[2.5px] w-px bg-gradient-to-b from-cyan via-blue to-transparent"
                    />
                    {chapters.map(([no, label]) => (
                      <li key={no} className="relative flex items-baseline gap-2.5 py-[0.3rem]">
                        <span
                          aria-hidden="true"
                          className="absolute -start-5 top-[0.62rem] h-1.5 w-1.5 rounded-full bg-cyan/85"
                        />
                        <span lang="en" className="font-mono text-[0.55rem] text-cyan">{no}</span>
                        <span className="truncate text-[0.9rem] leading-tight text-ink">{label}</span>
                      </li>
                    ))}
                  </ol>
                </div>
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
            <p data-detail className="measure mt-6 text-base text-ink-2 md:text-lg">
              {p.desc}
            </p>

            <div data-detail className="mt-10">
              <div aria-hidden="true" className="wire h-px w-full" />
              <p className="label mt-6">{p.stack}</p>
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
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cyan" />
                {p.live}
              </span>
            </div>

            <p data-detail className="measure-sm mt-10 text-sm text-ink-3">
              {t.work.soon}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CREDENTIALS — the archive.

   One credential dominates, set as a record between two rules with its
   year hollow beside it, and the rest travel behind it as two tracks
   drifting in opposite directions and surging with scroll velocity.
   The hierarchy is the composition: a chapter where everything is a
   card is a chapter with nothing to look at.

   Lightswind: VelocityRows for the index.
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

    /* The two tracks lean in opposite directions as they pass, so the
       index reads as two planes crossing rather than two lists
       sliding. */
    q('[data-rows] > * > *').forEach((row, i) => {
      gsap.fromTo(
        row,
        { rotationX: i % 2 === 0 ? 16 : -16, transformPerspective: 900, opacity: 0.4 },
        {
          rotationX: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: q('[data-rows]')[0], start: 'top 92%', end: 'bottom 55%', scrub: 0.7 }
        }
      );
    });
  });

  // Split into two tracks so they can run against each other.
  const half = Math.ceil(t.cred.items.length / 2);
  const tracks = [t.cred.items.slice(0, half), t.cred.items.slice(half)];

  return (
    <section
      ref={root}
      id="credentials"
      className="chapter-edge relative scroll-mt-[var(--rail)] overflow-hidden py-[clamp(4rem,9vh,7rem)]"
      style={aura(256)}
    >
      <div className="aura" />
      <div data-stage className="relative z-10">
        <div className="mx-auto w-full max-w-[88rem] px-[var(--pad)]">
          <Chapter index="05" name={t.cred.tag} className="mb-12" />

          {/* One credential dominates the chapter and the rest travel
              behind it. It is set as a record, not as a card: hung
              between two rules with the year hollow beside it, so the
              scene reads as an archive rather than as another panel. */}
          <div data-lead className="archive-lead grid12 items-baseline gap-y-5">
            <p lang="en" className="archive-year col-span-12 sm:col-span-3">
              2025
            </p>
            <div className="col-span-12 sm:col-span-9">
              <h3 lang="en" className="display-type text-[clamp(1.7rem,5.5vw,3.6rem)]">
                {t.cred.lead}
              </h3>
              <p className="mt-3 text-ink-2">{t.cred.leadBy}</p>
            </div>
          </div>

          <p className="label mb-5 mt-12">{t.cred.all}</p>
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
                    className="row-step me-3 inline-flex items-center gap-3 whitespace-nowrap border border-[var(--line)] bg-graphite/50 px-5 py-3 text-sm text-ink-2 hover:text-ink" style={{ ['--step' as string]: '0px' }}
                  >
                    <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-cyan/70" />
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

    /* The last thing the page says, said one unit at a time — letters in
       English, words in Arabic. It is the same cascade the name opens
       on, which is what makes the close read as an answer to it. */
    const units = q('[data-line]').flatMap((n) => splitUnits(n as HTMLElement));

    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 68%' } })
      .from(units, { yPercent: 118, duration: 0.85, stagger: 0.026, ease: EASE })
      .from(q('[data-say]'), { opacity: 0, y: 20, duration: 0.7, ease: EASE }, 0.45)
      .from(q('[data-cta]'), { opacity: 0, scale: 0.94, duration: 0.6, ease: 'back.out(1.6)' }, 0.6)
      .from(q('[data-way]'), { opacity: 0, y: 18, duration: 0.5, stagger: 0.06, ease: EASE }, 0.65);

    /* The closing type sits nearer than the motes behind it. Scroll
       drives it, so a phone gets it too — this is exactly the kind of
       depth that has to survive the absence of a cursor. */
    parallax(q('[data-say]')[0], 8, 1);
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
      className="chapter-edge scene-full relative scroll-mt-[var(--rail)] overflow-hidden px-[var(--pad)] pb-[clamp(3rem,8vh,6rem)] pt-[clamp(4rem,9vh,7rem)]"
      style={aura(264)}
    >
      {/* Indigo into violet, and no further: the page's spectrum ends here. */}
      <AuroraBackground hue={258} spread={38} intensity={0.11} showRadialGradient={false} />
      <div className="aura" />
      <ParticleField count={64} speed={0.9} />

      <div data-stage className="relative z-10 mx-auto w-full max-w-[88rem]">
        <Chapter index="06" name={t.contact.tag} as="p" ghost={false} className="mb-12" />

        <h2
          aria-label={`${t.contact.l1} ${t.contact.l2}`}
          className="vel-lean mask-stack display-type display-xl text-[clamp(2.2rem,8.4vw,6.6rem)]"
        >
          <span className="mask-line">
            <span data-line className="block">{t.contact.l1}</span>
          </span>
          <span className="mask-line">
            <span data-line className="block text-ink-3">{t.contact.l2}</span>
          </span>
        </h2>

        <p data-say className="measure-sm mt-10 text-lg text-ink-2 md:mt-14">
          {t.contact.say}
        </p>

        <div data-cta className="mt-10">
          <MagneticButton
            href={LINKS.whatsapp}
            external
            size="lg"
            variant="solid"
            strength={0.34}
            wrapperClassName="w-full sm:w-auto"
            className="w-full justify-center sm:w-auto"
          >
            <MessageCircle size={18} aria-hidden />
            {t.contact.cta}
            <ArrowUpRight size={17} aria-hidden />
          </MagneticButton>
        </div>

        <div className="mt-20 flex items-center gap-3 md:mt-28">
          <span aria-hidden="true" className="signal-bars">
            <span /><span /><span /><span />
          </span>
          <span lang="en" className="label ltr">06 / 06</span>
          <span aria-hidden="true" className="wire h-px flex-1" />
        </div>
        <ul className="mt-0">
          {t.contact.ways.map((w, i) => {
            const route = ways[i];
            const Icon = route.icon;
            return (
              <li data-way key={w.k}>
                <a
                  href={route.href}
                  {...(route.ext ? { target: '_blank', rel: 'noopener' } : {})}
                  {...(route.download ? { download: true } : {})}
                  className="row-step group flex items-center gap-4 border-b border-[var(--line)] py-5 hover:text-cyan md:gap-8"
                >
                  <Icon size={17} aria-hidden className="shrink-0 text-ink-3 transition-colors group-hover:text-cyan" />
                  {/* A fixed 7rem label leaves ~140px for the value at 375px, which
                      truncates the email mid-address. The Arabic labels are
                      short, so on a phone they take their own width. */}
                  <span className="label shrink-0 sm:w-[7rem]">{w.k}</span>
                  <span className="ltr flex-1 truncate text-sm md:text-base">{w.v}</span>
                  <ArrowUpRight
                    size={16}
                    aria-hidden
                    className="go-icon shrink-0 text-ink-3 transition-colors group-hover:text-cyan"
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

      <div className="mx-auto flex w-full max-w-[88rem] flex-wrap items-center justify-between gap-3 px-[var(--pad)] pb-[calc(2rem+env(safe-area-inset-bottom))] pt-2">
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
