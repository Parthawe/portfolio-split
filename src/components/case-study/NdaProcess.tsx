interface Decision {
  /** The design move, stated concretely but without confidential specifics. */
  move: string
  /** Short reason for the move. Keep this scan-friendly. */
  why: string
}

interface NdaProcessProps {
  title?: string
  intro?: string
  decisions: Decision[]
  /** Optional described before/after — no real screens, just the shift in words. */
  shift?: { before: string; after: string }
  visuals?: Array<{
    src: string
    alt: string
    label: string
  }>
}

export default function NdaProcess({
  title = 'How I approached it',
  intro,
  decisions,
  shift,
  visuals = [],
}: NdaProcessProps) {
  return (
    <section className="cs-section cs-nda-process reveal" id="cs-process">
      <div className="wrap">
        <div className="cs-nda-process-head">
          <h2 className="cs-nda-process-title">{title}</h2>
          <p className="cs-nda-process-intro">
            {intro ||
              'The short version: what I changed, why it mattered, and what the work became.'}
          </p>
        </div>

        <div className={visuals.length ? 'cs-nda-process-layout' : 'cs-nda-process-layout cs-nda-process-layout--text-only'}>
          <ol className="cs-nda-process-list">
            {decisions.map((d, i) => (
              <li className="cs-nda-process-card" key={d.move}>
                <span className="cs-nda-process-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="cs-nda-process-body">
                  <h3 className="cs-nda-process-move">{d.move}</h3>
                  <p className="cs-nda-process-why">{d.why}</p>
                </div>
              </li>
            ))}
          </ol>

          {visuals.length ? (
            <div className="cs-nda-process-visuals" data-project-preview aria-label="Process visuals">
              {visuals.map((visual) => (
                <figure className="cs-nda-process-visual" key={visual.src}>
                  <img src={visual.src} alt={visual.alt} loading="lazy" decoding="async" />
                  <figcaption>{visual.label}</figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </div>

        {shift ? (
          <section className="cs-nda-impact" aria-labelledby="cs-nda-impact-title">
            <div className="cs-nda-impact-head">
              <h3 id="cs-nda-impact-title">Design change</h3>
            </div>
            <div className="cs-nda-process-shift" aria-label="What changed, described">
              <div className="cs-nda-process-shift-col">
                <span>Before</span>
                <p>{shift.before}</p>
              </div>
              <div className="cs-nda-process-shift-arrow" aria-hidden="true">
                →
              </div>
              <div className="cs-nda-process-shift-col cs-nda-process-shift-col--after">
                <span>Designed direction</span>
                <p>{shift.after}</p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  )
}
