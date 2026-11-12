import { projectExperience, experienceHref, experienceLabel } from '../../data/projectExperiences'
import ProjectRecord from './ProjectRecord'
import { useProjectReturn } from '../ProjectReturnContext'
import { useProjectMediaPause } from '../../hooks/useProjectMediaPause'
import { projectImageProps } from '../../utils/projectImage'
import { lazy, Suspense, useRef, type ReactNode, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import FigmaSelect from '../FigmaSelect'
import { useDeferredMount } from '../../hooks/useDeferredMount'
import { getProject } from '../../data/projects'
import { projectReadingPaths } from '../../data/projectReadingPaths'
import { isLowPowerDevice } from '../../utils/performance'
import {
  projectTimelineMilestones,
  projectTitleLengthClass,
  sentenceCaseProjectLabel,
} from '../../utils/projectPresentation'
import '../../styles/case-study.css'
import '../../styles/project-page-polish.css'
import '../../styles/project-reading.css'
import '../../styles/case-refinement.css'

const CategoryObject3D = lazy(() => import('../CategoryObject3D'))

interface ProjectHeaderProps {
  backLink: string
  backLabel: string
  tags: string[]
  title: string
  subtitle: string
  info: { label: string; value: string }[]
  heroImage?: string
  heroCaption?: string
  heroAlt?: string
  liveUrl?: string
  categorySlug?: string
  showHeaderSummary?: boolean
  heroFraming?: 'panel' | 'image'
  heroExperience?: 'visual'
  heroTone?: string
  visualHeadline?: string
  visualSummary?: string
  visualHeroImage?: string
  visualHeroAlt?: string
  visualHeroMedia?: ReactNode
  liveLabel?: string
  liveDownload?: boolean | string
  visualBriefMode?: 'combined' | 'split'
  visualTitleMode?: 'sentence' | 'stacked'
}

const TIMELINE_LABELS = ['timeline', 'year', 'duration']
const ROLE_LABELS = ['role', 'my role', 'my contribution', 'creator', 'artist', 'host', 'director']
const CONTEXT_LABELS = ['team / context', 'team', 'collaborator', 'company', 'client', 'organization', 'context', 'platform']

function findInfoValue(
  info: ProjectHeaderProps['info'],
  labels: string[],
) {
  const match = labels.map(label => info.find(item => item.label.trim().toLowerCase() === label)).find(Boolean)
  return match?.value
}

/** Open a public chapter and move focus after deferred content mounts. */
function followProjectSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  event.stopPropagation()
  const hash = `#${encodeURIComponent(id)}`
  if (window.location.hash !== hash) window.location.hash = hash
  else window.dispatchEvent(new HashChangeEvent('hashchange'))
  const target = document.getElementById(id)
  if (target) {
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
    target.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
}

function slugClass(value?: string) {
  return value ? value.replace(/[^a-z0-9-]/gi, '-').toLowerCase() : ''
}

export default function ProjectHeader({
  backLink: _backLink,
  backLabel: _backLabel,
  tags,
  title,
  subtitle,
  info,
  heroImage,
  heroAlt,
  heroCaption,
  liveUrl,
  categorySlug,
  showHeaderSummary = true,
  heroFraming = 'panel',
  heroExperience,
  heroTone,
  visualHeadline,
  visualSummary,
  visualHeroImage,
  visualHeroAlt,
  visualHeroMedia,
  liveLabel = 'Visit Live Site',
  liveDownload,
  visualBriefMode = 'combined',
}: ProjectHeaderProps) {
  const location = useLocation()
  const { href: backLink, label: backLabel } = useProjectReturn()
  const heroRef = useRef<HTMLDivElement>(null)
  const reduceMotion = Boolean(useReducedMotion()) || isLowPowerDevice()
  const canShowOrnament = Boolean(categorySlug)
  const showCategoryOrnament = useDeferredMount(canShowOrnament, { timeout: 1500, delayMs: 120 })
  const ornamentSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 96 : 140
  const currentSlug = location.pathname.split('/').filter(Boolean).pop() ?? ''
  useProjectMediaPause(currentSlug)
  const readingPath = projectReadingPaths[currentSlug]
  const project = getProject(currentSlug)
  const story = project?.storyline
  const resolvedHeroImage =
    heroImage ||
    project?.access?.publicPreviewImage ||
    project?.cover16x9 ||   // wide cover suits the 16:9 hero better than the 4:5 card
    project?.summaryImage ||
    project?.cardMockup ||
    project?.cardMockupSource ||
    project?.image
  const resolvedHeroAlt =
    heroAlt ||
    project?.access?.publicPreviewAlt ||
    project?.summaryImageAlt ||
    project?.cardMockupAlt ||
    `${title} project preview`
  const resolvedVisualHeroImage = visualHeroImage || resolvedHeroImage
  const resolvedVisualHeroAlt = visualHeroAlt || resolvedHeroAlt
  const derivedSummary = showHeaderSummary
    ? {
        problem: project?.summaryProblem ?? story?.challenge ?? null,
        role: project?.summaryRole ?? findInfoValue(info, ROLE_LABELS) ?? null,
        outcome: project?.summaryOutcome ?? story?.result ?? null,
        timeline: project?.summaryTimeline ?? findInfoValue(info, TIMELINE_LABELS) ?? null,
        context: project?.summaryTeam ?? findInfoValue(info, CONTEXT_LABELS) ?? null,
        stats: project?.summaryStats ?? [],
      }
    : null
  const headerSummary =
    derivedSummary?.problem && derivedSummary.role && derivedSummary.outcome
      ? derivedSummary
      : null
  const headerSummaryMeta = [headerSummary?.timeline, headerSummary?.context].filter(Boolean).join(' · ')
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start end', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], ['-3%', '3%'])
  const heroScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.04, 1, 1.02])
  const heroMotionStyle = reduceMotion ? undefined : { y: heroY, scale: heroScale }
  const proofStats = (headerSummary?.stats ?? []).slice(0, 4)
  // One editorial narrative instead of two boxed grids: the fast-read summary
  // wins when present; the storyline arc is the fallback. Never both — they
  // repeat each other.
  const narrativeRows = !showHeaderSummary
    ? []
    : headerSummary
      ? [
          { label: 'Problem', copy: headerSummary.problem },
          { label: 'Role & responsibilities', copy: headerSummary.role },
          { label: 'Outcome', copy: headerSummary.outcome },
        ]
      : story
        ? [
            { label: 'Challenge', copy: story.challenge },
            { label: 'Approach', copy: story.approach },
            { label: 'Result', copy: story.result },
          ]
        : []
  const renderStoryAndSummary = (baseAnimIndex: number) =>
    narrativeRows.length ? (
      <section className={`proj-fastread hero-anim hero-anim-${baseAnimIndex}`} aria-label="Fast read summary">
        <header className="proj-fastread-head">
          <div>
            <span className="proj-fastread-kicker">Fast read</span>
            <h2 className="proj-fastread-title">Why this project matters</h2>
          </div>
          {headerSummaryMeta ? <p className="proj-fastread-meta">{headerSummaryMeta}</p> : null}
        </header>

        <dl className="proj-fastread-list">
          {narrativeRows.map((row) => (
            <div className="proj-fastread-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.copy}</dd>
            </div>
          ))}
        </dl>

        {proofStats.length ? (
          <div className="proj-fastread-stats" aria-label="Project proof points">
            {proofStats.map((stat) => (
              <div key={stat.label} className="proj-fastread-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
                {stat.note && <p className="cs-caption">{stat.note}</p>}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    ) : null

  if (heroExperience !== undefined || resolvedVisualHeroImage) {
    const visualDeck = visualHeadline || visualSummary || subtitle
    const visualTitle = title
    const titleLength = projectTitleLengthClass(visualTitle)
    const visualProblem = project?.summaryProblem ?? story?.challenge ?? subtitle
    const visualOutcome = project?.summaryOutcome ?? story?.result ?? null
    const visualRole = findInfoValue(info, ROLE_LABELS) ?? project?.summaryRole ?? null
    const visualTimeline = findInfoValue(info, TIMELINE_LABELS) ?? project?.summaryTimeline ?? null
    const visualContext = findInfoValue(info, CONTEXT_LABELS) ?? project?.summaryTeam ?? null
    const primaryInfo = new Set(
      [ROLE_LABELS, CONTEXT_LABELS, TIMELINE_LABELS].map(labels =>
        labels.map(label => info.find(item => item.label.trim().toLowerCase() === label)).find(Boolean),
      ),
    )
    const additionalInfo = info.filter(item => !primaryInfo.has(item))
    const timelineMilestones = projectTimelineMilestones(project)
    const visualClasses = [
      'wrap',
      'project-header',
      'project-header--visual',
      heroFraming === 'image' ? 'project-header--image' : '',
      heroTone ? `project-header--${slugClass(heroTone)}` : '',
      project?.category ? `project-header--cat-${project.category}` : '',
      currentSlug ? `project-header--project-${slugClass(currentSlug)}` : '',
    ].filter(Boolean).join(' ')

    return (
      <div className={visualClasses}>
        <nav className="proj-reading-links" aria-label="Project navigation">
          <Link className="glass-action" to={backLink}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>{backLabel}</Link>
          <div className="proj-reading-destinations">
            {project && <a className="glass-action" href={`https://designwhich.works/process/${encodeURIComponent(currentSlug)}`}>References &amp; process ↗</a>}
            <a className="glass-action" href="#project-overview">{readingPath ? 'Overview' : 'Project overview'}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 14 7 7 7-7M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
            {readingPath && <a href={`#${readingPath.id}`} onClick={event => followProjectSection(event, readingPath.id)} className="proj-reading-evidence glass-action">{readingPath.label}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 14 7 7 7-7M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>}
          </div>
        </nav>
        <section className="proj-visual-hero hero-anim hero-anim-1" aria-label={`${title} project introduction`}>
          <div className="proj-visual-hero__copy">
            <h1 className={`proj-visual-title proj-visual-title--${titleLength}`}>{visualTitle}</h1>
            {visualDeck && <p className="proj-reading-deck">{visualDeck}</p>}
            <div className="proj-visual-actions">
              <div className="proj-visual-hero__tags" aria-label="Project disciplines">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="proj-visual-tag">{sentenceCaseProjectLabel(tag)}</span>
                ))}
              </div>
              {liveUrl && (
                <a
                  href={liveUrl}
                  target={liveDownload ? undefined : '_blank'}
                  rel={liveDownload ? undefined : 'noopener noreferrer'}
                  download={liveDownload || undefined}
                  className="proj-visual-live figma-hover"
                >
                  {sentenceCaseProjectLabel(liveLabel)}
                  {liveDownload ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5v7M4 6l3 3 3-3M2 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                  <FigmaSelect />
                </a>
              )}
            </div>
          </div>

          <div className="proj-visual-stage">
            {heroFraming === 'panel' && <div className="proj-visual-hero__chrome" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>}

            {(visualHeroMedia || resolvedVisualHeroImage) && (
              <div className={`proj-visual-hero__media${visualHeroMedia ? ' proj-visual-hero__media--interactive' : ''}`} ref={heroRef}>
                {visualHeroMedia || (
                  <motion.img
                    {...projectImageProps(resolvedVisualHeroImage)}
                    src={resolvedVisualHeroImage}
                    alt={resolvedVisualHeroAlt}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    style={heroFraming === 'image' ? undefined : heroMotionStyle}
                  />
                )}
              </div>
            )}
          </div>
          {heroCaption && <p className="proj-generated-caption">{heroCaption}</p>}
        </section>

        <section id="project-overview" tabIndex={-1} className={`proj-visual-brief proj-visual-brief--${visualBriefMode} hero-anim hero-anim-2`} aria-label={`${title} project overview`}>
          {showHeaderSummary && (visualBriefMode === 'combined' ? (
            <div className="proj-reading-summary">
              <p className="proj-visual-brief__copy"><strong>Context</strong>{visualProblem}</p>
              {visualOutcome && <p className="proj-visual-brief__copy"><strong>Outcome</strong>{visualOutcome}</p>}
            </div>
          ) : (
            <>
              <p className="proj-visual-brief__copy">{visualProblem}</p>
              {visualOutcome ? <p className="proj-visual-brief__copy">{visualOutcome}</p> : null}
            </>
          ))}
          <dl className="proj-visual-brief__facts">
            {visualRole ? <div><dt>Role</dt><dd>{visualRole}</dd></div> : null}
            {visualContext ? <div><dt>{info.find(item => CONTEXT_LABELS.includes(item.label.trim().toLowerCase()))?.label || 'Team / context'}</dt><dd>{visualContext}</dd></div> : null}
            {timelineMilestones.length ? (
              <div className="proj-visual-timeline">
                <dt>Timeline</dt>
                <dd>
                  {visualTimeline}
                  <details className="proj-timeline-details">
                    <summary>Project milestones</summary>
                  <ol>
                    {timelineMilestones.map((milestone) => (
                      <li key={`${milestone.period}-${milestone.label}`}>
                        <strong>{milestone.period}</strong>
                        <span>{sentenceCaseProjectLabel(milestone.label)}</span>
                      </li>
                    ))}
                  </ol>
                  </details>
                </dd>
              </div>
            ) : visualTimeline ? <div className="proj-visual-timeline"><dt>Timeline</dt><dd>{visualTimeline}</dd></div> : null}
            {additionalInfo.map(item => (
              <div key={item.label}><dt>{sentenceCaseProjectLabel(item.label)}</dt><dd>{item.value}</dd></div>
            ))}
          </dl>
          {projectExperience(currentSlug)?.status === 'approved' && <div className="project-room-link">{currentSlug === 'shuffle' ? <a className="glass-action" href="#cs-interactive" onClick={event => followProjectSection(event, 'cs-interactive')}>Redistribute your time</a> : <Link className="glass-action" to={experienceHref(currentSlug)}>{experienceLabel(currentSlug)}</Link>}</div>}
          <ProjectRecord slug={currentSlug} />
        </section>
      </div>
    )
  }

  return (
    <div className="wrap project-header">
      <div className="proj-back">
        {project && <a className="glass-action" href={`https://designwhich.works/process/${encodeURIComponent(currentSlug)}`}>References &amp; process ↗</a>}
        <Link to={backLink} className="back-link figma-hover">
          &larr; {backLabel}
          <FigmaSelect />
        </Link>
      </div>
      <section className={`proj-hero-system ${resolvedHeroImage ? 'proj-hero-system--media' : 'proj-hero-system--text'}`} aria-label={`${title} project introduction`}>
        <div className="proj-meta">
          {categorySlug && (
            <div className="proj-3d-ornament">
              {showCategoryOrnament ? (
                <Suspense fallback={null}>
                  <CategoryObject3D slug={categorySlug} size={ornamentSize} />
                </Suspense>
              ) : null}
            </div>
          )}
          <div className="proj-tags">
            {tags.map((tag) => (
              <span key={tag} className="proj-tag">
                {sentenceCaseProjectLabel(tag)}
              </span>
            ))}
          </div>
          <h1 className={`proj-title proj-title--${projectTitleLengthClass(title)} hero-anim hero-anim-1`}>{title}</h1>
          <p className="proj-subtitle hero-anim hero-anim-2">{subtitle}</p>
          {liveUrl && (
            <a
              href={liveUrl}
              target={liveDownload ? undefined : '_blank'}
              rel={liveDownload ? undefined : 'noopener noreferrer'}
              download={liveDownload || undefined}
              className="proj-live-link hero-anim hero-anim-4 figma-hover"
            >
              {sentenceCaseProjectLabel(liveLabel)}
              {liveDownload ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5v7M4 6l3 3 3-3M2 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              <FigmaSelect />
            </a>
          )}
        </div>

        {resolvedHeroImage && (
          <div className="proj-hero-panel hero-anim hero-anim-3">
            <div className="proj-hero-img" ref={heroRef}>
              <motion.img
                {...projectImageProps(resolvedHeroImage)}
                src={resolvedHeroImage}
                alt={resolvedHeroAlt}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={heroFraming === 'image' ? undefined : heroMotionStyle}
              />
            </div>
            <div className="proj-hero-caption">
              <span>{project?.access?.mode === 'request' ? 'Safe public preview' : 'Project visual'}</span>
              <strong>{title}</strong>
            </div>
            {proofStats.length ? (
              <div className="proj-hero-stats" aria-label={`${title} proof points`}>
                {proofStats.map((stat) => (
                  <div key={stat.label} className="proj-hero-stat">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                    {stat.note && <p className="cs-caption">{stat.note}</p>}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div className="proj-info-row hero-anim hero-anim-3">
          {info.map((item) => (
            <div key={item.label} className="proj-info-item">
              <span className="proj-info-label">{sentenceCaseProjectLabel(item.label)}</span>
              <span className="proj-info-val">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {renderStoryAndSummary(4)}
      {projectExperience(currentSlug)?.status === 'approved' && <div className="project-room-link">{currentSlug === 'shuffle' ? <a className="glass-action" href="#cs-interactive" onClick={event => followProjectSection(event, 'cs-interactive')}>Redistribute your time</a> : <Link className="glass-action" to={experienceHref(currentSlug)}>{experienceLabel(currentSlug)}</Link>}</div>}
      <ProjectRecord slug={currentSlug} />
    </div>
  )
}
