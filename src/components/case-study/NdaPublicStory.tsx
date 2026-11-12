import { getProject } from '../../data/projects'

interface NdaPublicStoryProps {
  slug: string
  headline: string
  showSummary?: boolean
  showVisuals?: boolean
  lede?: string
  visuals?: Array<{
    src: string
    alt: string
    label: string
  }>
}

export default function NdaPublicStory({ slug, headline, lede, visuals = [], showSummary = true, showVisuals = true }: NdaPublicStoryProps) {
  const project = getProject(slug)

  if (!project) return null

  const challenge = project.storyline?.challenge || project.summaryProblem || project.desc
  const approach = project.storyline?.approach || project.summaryRole || 'I shaped the product story, flow, and interface direction around the core user risk.'
  const result = project.storyline?.result || project.summaryOutcome || project.desc
  const stats = project.summaryStats?.slice(0, 4) || []
  const publicVisuals = visuals.length ? visuals : (
    project.access?.publicPreviewImage ? [{
      src: project.access.publicPreviewImage,
      alt: project.access.publicPreviewAlt || `${project.name} public preview`,
      label: 'Public project preview',
    }] : []
  )
  const storyRows = [
    { label: 'Problem', copy: challenge },
    { label: 'Method', copy: approach },
    { label: 'Result', copy: result },
  ]

  return (
    <section className="cs-section cs-nda-story reveal" id="cs-public-story">
      <div className="wrap cs-nda-story-grid">
        <header className="cs-nda-story-head">
          <div>
            <h2 className="cs-nda-story-title">{headline}</h2>
            {lede ? <p className="cs-nda-story-lede">{lede}</p> : null}
          </div>
        </header>

        <div className="cs-nda-story-body">
          {showVisuals && publicVisuals.length > 0 && (
            <div className="cs-nda-image-gallery" data-project-preview aria-label={`${project.name} public visual preview`}>
              {publicVisuals.map((visual, index) => (
                <figure key={visual.src} className={`cs-nda-image-card${index === 0 ? ' cs-nda-image-card--hero' : ''}`}>
                  <img src={visual.src} alt={visual.alt} loading="lazy" decoding="async" />
                  <figcaption>{visual.label}</figcaption>
                </figure>
              ))}
            </div>
          )}

          {showSummary && <div className="cs-nda-story-proof" aria-label={`${project.name} safe public summary`}>
            {storyRows.map((row) => (
              <div className="cs-nda-story-row" key={row.label}>
                <span className="cs-nda-story-row-label">{row.label}</span>
                <span className="cs-nda-story-row-copy">{row.copy}</span>
              </div>
            ))}
          </div>}

          {showSummary && stats.length ? (
            <div className="cs-nda-proof-strip" aria-label={`${project.name} public project facts`}>
              {stats.map((stat) => (
                <div className="cs-nda-proof-pill" key={`${stat.label}-${stat.value}`}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  {stat.note && <p className="cs-caption">{stat.note}</p>}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
