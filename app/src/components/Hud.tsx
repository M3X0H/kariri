import { useLang } from '../lib/lang';

/* ═══════════════════════════════════════════════════════════════
   The frame.

   A hairline on the page's own margin, registration marks at its
   corners, and figures printed on the rule itself — the page is
   presented as a readout rather than as a document. It is the one
   element every chapter shares, so it is what makes the site read as
   a single instrument instead of six well-made screens.

   The scroll figure is live and costs nothing per frame: the signal
   loop writes `--scroll-pct` as a whole number and CSS prints it
   through a counter, so no text node is ever touched and React is
   never involved.

   Entirely decorative and entirely inert — `aria-hidden`, no pointer
   events, and every value here is already stated in the content for
   anyone reading the page rather than looking at it.
   ═══════════════════════════════════════════════════════════════ */
export function Hud() {
  const { t, lang } = useLang();

  return (
    <div className="hud" aria-hidden="true">
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <span key={c} data-c={c} className="hud-corner" />
      ))}

      <span lang="en" className="hud-tag ltr" style={{ top: '-0.42rem', insetInlineStart: '1.5rem' }}>
        MK · IT SPECIALIST
      </span>

      <span
        lang="en"
        className="hud-tag hud-readout ltr"
        style={{ bottom: '-0.42rem', insetInlineStart: '1.5rem' }}
      >
        SCROLL&nbsp;
      </span>

      <span
        lang="en"
        className="hud-tag ltr"
        style={{ bottom: '-0.42rem', insetInlineEnd: '1.5rem' }}
      >
        {lang === 'ar' ? 'AR / RTL' : 'EN / LTR'}
      </span>

      {/* Runs up the frame's edge, the way a dimension is labelled on a
          drawing. Hidden on a phone, where the frame itself steps back. */}
      <span lang="en" className="hud-tag hud-side ltr">
        24°42′N 46°43′E · {lang === 'ar' ? 'RIYADH' : t.hero.place}
      </span>
    </div>
  );
}

export default Hud;
