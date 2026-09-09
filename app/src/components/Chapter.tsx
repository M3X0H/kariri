/* ═══════════════════════════════════════════════════════════════
   The chapter masthead.

   Every chapter opened on its own small label before this — six
   differently weighted lines doing the same job. One band does it
   instead: a rule across the whole measure, the index in mono at the
   reading edge, the name in display type, the count at the far end.
   Repetition is the point; it is what tells you the page is one
   document with numbered parts.

   The ghost numeral is the same index set enormous and hollow,
   bleeding off the far edge — the chapter's watermark, and the reason
   a section is identifiable before you have read a word of it.
   ═══════════════════════════════════════════════════════════════ */
export function Chapter({
  index,
  name,
  count = '06',
  ghost = true,
  as: Tag = 'h2',
  className = ''
}: {
  index: string;
  name: string;
  count?: string;
  /** The interstitial chapters carry no number, so they carry no watermark. */
  ghost?: boolean;
  /** Contact's heading is its closing line, so its band is not an h2. */
  as?: 'h2' | 'p';
  className?: string;
}) {
  return (
    <>
      {ghost && (
        <span lang="en" aria-hidden="true" className="chapter-ghost">
          {index}
        </span>
      )}

      <header className={`chapter-band ${className}`}>
        <span lang="en" aria-hidden="true" className="chapter-index">
          {index}
        </span>
        <Tag className="chapter-name">{name}</Tag>
        <span lang="en" aria-hidden="true" className="chapter-count">
          / {count}
        </span>
      </header>
    </>
  );
}

export default Chapter;
