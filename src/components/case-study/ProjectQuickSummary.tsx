import { getProject, isRequestAccessProject } from '../../data/projects'

export type CaseStudyViewMode = 'summary' | 'full'

interface ProjectQuickSummaryProps {
  slug: string
  viewMode: CaseStudyViewMode
  onViewModeChange: (mode: CaseStudyViewMode) => void
  fullCaseStudyEnabled?: boolean
  variant?: 'card' | 'open'
  label?: string
  title?: string
  proofLimit?: number
  proofHeading?: string
  proofPlacement?: 'top' | 'bottom'
}

export default function ProjectQuickSummary({
  slug,
  viewMode,
  onViewModeChange,
  fullCaseStudyEnabled = true,
  variant = 'card',
  label = 'Quick read',
  title = 'Project overview',
  proofLimit = 3,
  proofHeading,
  proofPlacement = 'bottom',
}: ProjectQuickSummaryProps) {
  const project = getProject(slug)

  if (
    !project ||
    !project.summaryProblem ||
    !project.summaryRole ||
    !project.summaryOutcome
  ) {
    return null
  }

  const isAccessLimited = isRequestAccessProject(project)
  const isEditorialSynthesis = /synthesis/i.test(project.testimonial?.cite || '')
  const QuoteContainer = isEditorialSynthesis ? 'aside' : 'blockquote'
  const proofStats = project.summaryStats?.slice(0, proofLimit) ?? []
  const proofBlock = proofStats.length ? (
    <>
      {proofHeading ? <h3 className="cs-quick-summary-proof-title">{proofHeading}</h3> : null}
      <div className="cs-quick-summary-stats" aria-label="Project facts and outcomes">
        {proofStats.map((stat) => (
          <div key={stat.label} className="cs-quick-summary-stat">
            <span className="cs-quick-summary-stat-value">{stat.value}</span>
            <span className="cs-quick-summary-stat-label">{stat.label}</span>
            {stat.note ? <span className="cs-quick-summary-stat-note">{stat.note}</span> : null}
          </div>
        ))}
      </div>
    </>
  ) : null

  return (
    <section className="cs-quick-summary wrap reveal" id="cs-summary">
      <div className={`cs-quick-summary-shell cs-quick-summary-shell--${variant}${variant === 'card' ? ' surface-glass' : ''}`}>
        <div className="cs-quick-summary-top">
          <div>
            {label ? <span className="cs-section-label">{label}</span> : null}
            <h2 className="cs-quick-summary-title">{title}</h2>
          </div>

          <div className="cs-quick-summary-toggle" role="group" aria-label="Case study view mode">
            <button
              type="button"
              className={`cs-quick-summary-toggle-btn${viewMode === 'summary' ? ' is-active' : ''}`}
              aria-pressed={viewMode === 'summary'}
              onClick={() => onViewModeChange('summary')}
            >
              Quick read
            </button>
            {fullCaseStudyEnabled ? (
              <button
                type="button"
                className={`cs-quick-summary-toggle-btn${viewMode === 'full' ? ' is-active' : ''}`}
                aria-pressed={viewMode === 'full'}
                onClick={() => onViewModeChange('full')}
              >
                {isAccessLimited ? 'Public story' : 'Full story'}
              </button>
            ) : (
              <span className="cs-quick-summary-toggle-note">Detailed internals available on request</span>
            )}
          </div>
        </div>

        {proofPlacement === 'top' ? proofBlock : null}

        <div className="cs-quick-summary-grid">
          <div className="cs-quick-summary-details">
            <article className="cs-quick-summary-card cs-quick-summary-card--problem">
              <span className="cs-quick-summary-label">Problem</span>
              <p>{project.summaryProblem}</p>
            </article>
            <article className="cs-quick-summary-card cs-quick-summary-card--move">
              <span className="cs-quick-summary-label">My role</span>
              <p>{project.summaryRole}</p>
            </article>
            <article className="cs-quick-summary-card cs-quick-summary-card--wide cs-quick-summary-card--outcome">
              <span className="cs-quick-summary-label">Outcome</span>
              <p>{project.summaryOutcome}</p>
            </article>
          </div>

        </div>

        {proofPlacement === 'bottom' ? proofBlock : null}

        {project.testimonial ? (
          <QuoteContainer className="cs-quick-summary-quote" aria-label={isEditorialSynthesis ? 'Editorial synthesis' : undefined}>
            <p>{isEditorialSynthesis ? project.testimonial.quote : `“${project.testimonial.quote}”`}</p>
            <cite>{isEditorialSynthesis ? 'Editorial synthesis' : project.testimonial.cite}</cite>
          </QuoteContainer>
        ) : null}

      </div>
    </section>
  )
}
