import { isExperimental } from '../config/portfolio'
import { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ProjectCardComponent from '../components/ProjectCard'
import CoverArtwork from '../components/CoverArtwork'
import FigmaSelect from '../components/FigmaSelect'
import {
  featuredProjects,
  selectedWorkProjects,
  archiveWorkProjects,
  filterProjectsByCategory,
  CATEGORIES,
  visibleProjects,
  CATEGORY_LABELS,
  getProjectAccessLabel,
  type Project,
  type ProjectCategory,
} from '../data/projects'
import '../styles/work-page.css'

const filters = CATEGORIES
  .filter(filter => filter.key === 'all' || filterProjectsByCategory(visibleProjects, filter.key as ProjectCategory).length)
  .map(filter => isExperimental && filter.key === 'creative' ? { ...filter, label: 'Creative Technology' } : filter)
const WORK_FILTER_EVENT = 'folio:set-work-filter'

interface WorkFilterEventDetail {
  filterKey: 'all' | ProjectCategory
}

const LIBRARY_SECTION_COPY: Record<ProjectCategory, string> = {
  ux: 'Product systems, flows, and interfaces built to ship clearly at scale.',
  research: 'Interviews, field evidence, synthesis, and journey models that clarify what teams should build next.',
  ai: 'Voice, wearables, and interface layers where software changes how hardware feels.',
  creative: 'Shipped interfaces and working prototypes carried from product intent into production code.',
  install: 'Spatial work, responsive environments, and physical storytelling in public space.',
  brand: 'Identity, campaigns, and visual systems shaped for recall, not just decoration.',
  good: 'Civic, educational, and community work where design has to earn trust quickly.',
}

const TIMELINE_PRESENT_KEY = 'present'
const TIMELINE_EARLIER_KEY = 'earlier'
const TIER_RANK: Record<NonNullable<Project['tier']>, number> = {
  s: 5,
  a: 4,
  b: 3,
  c: 2,
  d: 1,
}

type WorkViewMode = 'editorial' | 'library' | 'timeline'

function countLabel(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

function getTimelineGroup(project: Project) {
  const source = `${project.summaryTimeline || ''} ${project.year}`.trim()
  if (/present/i.test(source)) {
    return { key: TIMELINE_PRESENT_KEY, label: 'Present', sortValue: Number.MAX_SAFE_INTEGER }
  }

  const years = Array.from(source.matchAll(/\d{4}/g)).map(match => Number(match[0]))
  if (years.length) {
    const latest = Math.max(...years)
    return { key: String(latest), label: String(latest), sortValue: latest }
  }

  return { key: TIMELINE_EARLIER_KEY, label: 'Earlier', sortValue: 0 }
}

function getTimelineLeadScore(project: Project) {
  return (
    (project.featured ? 100 : 0) +
    (project.selected ? 50 : 0) +
    (project.summaryImage ? 10 : 0) +
    (project.summaryStats?.length || 0) +
    (project.tier ? TIER_RANK[project.tier] : 0)
  )
}

function getAccessLabel(project: Project) {
  return getProjectAccessLabel(project)
}

function getTimelineSectionSummary(projects: Project[], leadProject: Project) {
  const categoryCounts = new Map<ProjectCategory, number>()
  projects.forEach(project => {
    categoryCounts.set(project.category, (categoryCounts.get(project.category) || 0) + 1)
  })

  const topCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([category]) => CATEGORY_LABELS[category])

  if (!topCategories.length) return `Anchored by ${leadProject.name}.`
  if (topCategories.length === 1) return `Anchored by ${leadProject.name}, ${topCategories[0]} in focus.`
  return `Anchored by ${leadProject.name}, ${topCategories.join(' + ')} in focus.`
}

export default function WorkPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedFilter = searchParams.get('filter')
  const activeFilter = filters.some(filter => filter.key === requestedFilter) ? requestedFilter! : 'all'
  const setActiveFilter = useCallback((filter: string) => {
    setSearchParams(current => {
      const next = new URLSearchParams(current)
      if (filter === 'all') next.delete('filter')
      else next.set('filter', filter)
      return next
    })
  }, [setSearchParams])
  const [libraryPreviewSlug, setLibraryPreviewSlug] = useState<string | null>(null)
  const currentViewParam = searchParams.get('view')
  const viewMode: WorkViewMode =
    currentViewParam === 'library' || currentViewParam === 'index' || currentViewParam === 'playlist'
      ? 'library'
      : currentViewParam === 'timeline'
        ? 'timeline'
        : 'editorial'
  const viewHref = (view: string) => {
    const params = new URLSearchParams(searchParams)
    if (view === 'editorial') params.delete('view'); else params.set('view', view)
    return `/work${params.toString() ? `?${params}` : ''}`
  }
  const [activeLibraryShelf, setActiveLibraryShelf] = useState('start-here')
  const [activeTimelineYear, setActiveTimelineYear] = useState(TIMELINE_PRESENT_KEY)

  // These classes own the page's frame and navigation geometry, so they must
  // be present before paint rather than resizing an already-visible route.
  useLayoutEffect(() => {
    document.body.classList.add('page-work')
    return () => document.body.classList.remove('page-work')
  }, [])

  useLayoutEffect(() => {
    document.body.classList.toggle('page-work-library', viewMode === 'library')
    return () => document.body.classList.remove('page-work-library')
  }, [viewMode])

  useLayoutEffect(() => {
    document.body.classList.toggle('page-work-timeline', viewMode === 'timeline')
    return () => document.body.classList.remove('page-work-timeline')
  }, [viewMode])

  useEffect(() => {
    if (viewMode !== 'editorial') return

    const cards = Array.from(document.querySelectorAll<HTMLElement>('.page-work .pcard'))
    if (!cards.length) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('is-in-viewport', entry.isIntersecting)
        })
      },
      { rootMargin: '180px 0px', threshold: 0 }
    )

    cards.forEach(card => observer.observe(card))
    return () => observer.disconnect()
  }, [activeFilter, viewMode])

  useEffect(() => {
    const handleFilter = (event: Event) => {
      const customEvent = event as CustomEvent<WorkFilterEventDetail>
      const filterKey = customEvent.detail?.filterKey
      if (!filterKey) return

      setActiveFilter(filterKey)
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }

    window.addEventListener(WORK_FILTER_EVENT, handleFilter as EventListener)
    return () => window.removeEventListener(WORK_FILTER_EVENT, handleFilter as EventListener)
  }, [setActiveFilter])

  const isAll = activeFilter === 'all'
  const editorialSelectedProjects = isAll
    ? selectedWorkProjects
    : filterProjectsByCategory(selectedWorkProjects, activeFilter as ProjectCategory)
  const archiveProjects = isAll
    ? archiveWorkProjects
    : filterProjectsByCategory(archiveWorkProjects, activeFilter as ProjectCategory)
  const allWorkProjects = visibleProjects
  const timelineSections = allWorkProjects
    .map((project, index) => ({
      project,
      index,
      timeline: getTimelineGroup(project),
    }))
    .sort((a, b) => b.timeline.sortValue - a.timeline.sortValue || a.index - b.index)
    .reduce<Array<{ key: string; label: string; projects: Project[] }>>((groups, entry) => {
      const existing = groups.find(group => group.key === entry.timeline.key)
      if (existing) {
        existing.projects.push(entry.project)
        return groups
      }

      groups.push({
        key: entry.timeline.key,
        label: entry.timeline.label,
        projects: [entry.project],
      })
      return groups
    }, [])
    .map(section => {
      const orderedProjects = [...section.projects].sort((a, b) => getTimelineLeadScore(b) - getTimelineLeadScore(a))
      return {
        ...section,
        leadProject: orderedProjects[0],
        projects: orderedProjects,
        supportingProjects: orderedProjects.slice(1),
        summary: getTimelineSectionSummary(orderedProjects, orderedProjects[0]),
      }
    })
  const librarySections = [
    {
      key: 'start-here',
      label: 'Start Here',
      description: 'The four featured projects.',
      projects: featuredProjects,
    },
    ...CATEGORIES
      .filter(filter => filter.key !== 'all')
      .map(filter => {
        const category = filter.key as ProjectCategory
        return {
          key: category,
          label: isExperimental && category === 'creative' ? 'Creative Technology' : filter.label,
          description: isExperimental && category === 'creative' ? 'Experiments with code, physical interfaces, and responsive objects.' : LIBRARY_SECTION_COPY[category],
          projects: archiveWorkProjects.filter(project => project.category === category),
        }
      })
      .filter(section => section.projects.length),
  ]
  const activeLibrarySection =
    librarySections.find(section => section.key === activeLibraryShelf) ?? librarySections[0] ?? null
  const libraryPreviewProjectInActiveShelf =
    activeLibrarySection?.projects.find(project => project.slug === libraryPreviewSlug) ?? null
  const libraryPreviewProject =
    libraryPreviewProjectInActiveShelf
    ?? activeLibrarySection?.projects[0]
    ?? librarySections[0]?.projects[0]
    ?? null
  const libraryPreviewMedia = libraryPreviewProject?.previewMedia?.library
  const libraryPreviewImage = libraryPreviewMedia?.src || libraryPreviewProject?.cover16x9 || libraryPreviewProject?.summaryImage || libraryPreviewProject?.image || ''
  const libraryPreviewAlt = libraryPreviewMedia?.alt || libraryPreviewProject?.summaryImageAlt || libraryPreviewProject?.name || ''
  // Loading priority belongs to this layout, not the registry's homepage order.
  // Only the first featured card competes for initial bandwidth.
  const renderCard = useCallback((project: Project, index: number) => (
    <ProjectCardComponent key={project.slug} slug={project.slug} name={project.name} image={project.image} tag={project.tag} year={project.year} desc={project.desc} loading={index === 0 ? 'eager' : 'lazy'} nda={project.nda} tilt={false} coverShape="wide" showCaption />
  ), [])

  const handleFilterChange = useCallback((filterKey: 'all' | ProjectCategory) => {
    setActiveFilter(filterKey)
  }, [setActiveFilter])

  const renderFilterButtons = () => filters.map(f => (
    <button
      key={f.key}
      type="button"
      data-work-filter={f.key}
      aria-pressed={activeFilter === f.key}
      aria-controls="work-project-results"
      className={`pill-link work-bnav-link figma-hover${activeFilter === f.key ? ' active' : ''}`}
      onClick={() => handleFilterChange(f.key as 'all' | ProjectCategory)}
    >
      {f.label}
      <FigmaSelect />
    </button>
  ))

  const handleLibraryJump = useCallback((shelfKey: string) => {
    setActiveLibraryShelf(shelfKey)
    const shelf = librarySections.find(section => section.key === shelfKey)
    setLibraryPreviewSlug(shelf?.projects[0]?.slug ?? null)
    const target = document.getElementById(`work-library-${shelfKey}`)
    if (!target) return
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }, [librarySections])

  const handleLibraryPreview = useCallback((shelfKey: string, projectSlug: string) => {
    setActiveLibraryShelf(shelfKey)
    setLibraryPreviewSlug(projectSlug)
  }, [])

  useEffect(() => {
    if (viewMode !== 'library') return

    if (!activeLibrarySection?.projects.length) {
      setLibraryPreviewSlug(null)
      return
    }

    const hasCurrentPreview = activeLibrarySection.projects.some(project => project.slug === libraryPreviewSlug)
    if (!libraryPreviewSlug || !hasCurrentPreview) {
      setLibraryPreviewSlug(activeLibrarySection.projects[0].slug)
    }
  }, [activeLibrarySection, libraryPreviewSlug, viewMode])

  useEffect(() => {
    if (viewMode !== 'library') return

    let frameId = 0
    const syncPreviewToVisibleRow = () => {
      frameId = 0
      // A pending scroll/resize frame must not overwrite an explicit row
      // selection or swap artwork while someone is inspecting its preview.
      const focusedRow = document.activeElement?.closest('.work-library-row')
      const hoveredPreview = window.matchMedia('(hover: hover)').matches &&
        document.querySelector('.work-library-row:hover, .work-library-preview:hover')
      if (focusedRow || hoveredPreview) return
      const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-library-project-slug]'))
      if (!rows.length) return

      const viewportTop = Math.max(96, window.innerHeight * 0.16)
      const viewportBottom = window.innerHeight * 0.88
      const focusLine = window.innerHeight * 0.5
      const visibleRows = rows
        .map(row => {
          const rect = row.getBoundingClientRect()
          const visible = rect.bottom > viewportTop && rect.top < viewportBottom
          return {
            row,
            visible,
            distance: Math.abs((rect.top + rect.height / 2) - focusLine),
          }
        })
        .filter(entry => entry.visible)
        .sort((a, b) => a.distance - b.distance)

      const closest = visibleRows[0]?.row
      const projectSlug = closest?.dataset.libraryProjectSlug
      const shelfKey = closest?.dataset.libraryShelfKey
      if (!projectSlug || !shelfKey) return

      setActiveLibraryShelf(current => current === shelfKey ? current : shelfKey)
      setLibraryPreviewSlug(current => current === projectSlug ? current : projectSlug)
    }

    const requestSync = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(syncPreviewToVisibleRow)
    }

    requestSync()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
    }
  }, [viewMode, librarySections.length])

  const handleTimelineJump = useCallback((yearKey: string) => {
    setActiveTimelineYear(yearKey)
    const target = document.getElementById(`work-timeline-${yearKey}`)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    if (viewMode !== 'timeline') return

    if (!timelineSections.length) {
      setActiveTimelineYear(TIMELINE_PRESENT_KEY)
      return
    }

    if (!timelineSections.some(section => section.key === activeTimelineYear)) {
      setActiveTimelineYear(timelineSections[0].key)
    }
  }, [activeTimelineYear, timelineSections, viewMode])

  useEffect(() => {
    if (viewMode !== 'timeline') return

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-timeline-year]'))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        const yearKey = visible?.target.getAttribute('data-timeline-year')
        if (yearKey) {
          setActiveTimelineYear(yearKey)
        }
      },
      {
        rootMargin: '-20% 0px -58% 0px',
        threshold: [0.15, 0.3, 0.5],
      }
    )

    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [timelineSections.length, viewMode])

  return (
    <>
      <Helmet>
        <title>Work · Parth Pawar</title>
        <meta name="description" content="Selected work by Parth Pawar across product design, design engineering, AI wearables, fintech, and installations." />
      </Helmet>

      <Nav />

      <main id="main-content">
        <div className="abt-paper">

          <div className="wrap">
            <header className="work-page-header">
              <div className="work-page-intro">
                <h1 className="work-page-title">Work</h1>
                <p className="work-page-intro-copy">
                  {isExperimental ? "Instruments, installations, and experiments in physical interaction." : "Product design across wearables, payments, AI tools, and public services."}
                </p>
              </div>
              <div className="work-page-summary">
                <nav className="work-mobile-views glass-segments" aria-label="Work page views">
                  {([['editorial', 'Editorial'], ['library', 'Index'], ['timeline', 'Arc']] as const).map(([view, label]) => <Link key={view} to={viewHref(view)} aria-current={viewMode === view ? 'page' : undefined}>{label}</Link>)}
                </nav>
                <a className="glass-action" href="https://designwhich.works/process">References &amp; process ↗</a>
                {isExperimental && <Link className="work-room-link glass-action" to="/project-experiences">Explore project experiences</Link>}
              </div>
              {viewMode === 'editorial' ? (
                <nav className="work-filter-inline surface-glass" aria-label="Filter projects" role="toolbar">
                  {renderFilterButtons()}
                </nav>
              ) : null}
            </header>

            {viewMode === 'editorial' ? (
              <div id="work-project-results">
                {editorialSelectedProjects.length > 0 && (
                  <section className="work-group work-group--selected" aria-labelledby="work-selected-title">
                    <h2 className="mono-label work-group-label" id="work-selected-title">Selected work</h2>
                    <div className="work-project-grid">{editorialSelectedProjects.map(renderCard)}</div>
                  </section>
                )}
                {archiveProjects.length > 0 && (
                  <section className="work-group work-group--archive" aria-labelledby="work-more-title">
                    <h2 className="mono-label work-group-label" id="work-more-title">More projects</h2>
                    <div className="work-project-grid">{archiveProjects.map(project => (
                      <ProjectCardComponent key={project.slug} slug={project.slug} name={project.name} image={project.image}
                        tag={project.tag} year={project.year} desc={project.desc} loading="lazy" nda={project.nda} coverShape="wide" showCaption />
                    ))}</div>
                  </section>
                )}
              </div>
            ) : viewMode === 'library' ? (
              <section className="work-library-shell" id="work-project-results" aria-label="Work library">
                <div className="work-library-shell__head">
                  <div className="work-library-nav surface-glass surface-glass--subtle" role="toolbar" aria-label="Jump to library shelf">
                    {librarySections.map(section => (
                      <button
                        key={section.key}
                        type="button"
                        aria-pressed={activeLibraryShelf === section.key}
                        className={`work-library-nav__item figma-hover${activeLibraryShelf === section.key ? ' is-active surface-glass--active' : ''}`}
                        onClick={() => handleLibraryJump(section.key)}
                      >
                        <span>{section.label}</span>
                        <small>{section.projects.length}</small>
                        <FigmaSelect />
                      </button>
                    ))}
                  </div>
                </div>

                {libraryPreviewProject ? (
                  <aside className="work-library-preview" aria-live="polite">
                    <div className="work-library-preview__frame">
                      <CoverArtwork key={libraryPreviewImage} slug={libraryPreviewProject.slug} src={libraryPreviewImage} alt={libraryPreviewAlt} loading="eager" />
                    </div>
                    <div className="work-library-preview__caption">
                      <span className="work-library-preview__eyebrow">Preview</span>
                      <strong>{libraryPreviewProject.name}</strong>
                      <span>{libraryPreviewProject.tag}</span>
                    </div>
                  </aside>
                ) : null}

                <div className="work-library-shelves">
                  {librarySections.map((section, sectionIndex) => {
                    return (
                      <section
                        key={section.key}
                        id={`work-library-${section.key}`}
                        className="work-library-shelf"
                        data-library-shelf={section.key}
                        aria-labelledby={`work-library-title-${section.key}`}
                      >
                        <header className="work-library-shelf__head">
                          <div>
                            <span className="mono-label work-group-label">Shelf {String(sectionIndex + 1).padStart(2, '0')}</span>
                            <h2 id={`work-library-title-${section.key}`} className="work-library-shelf__title">{section.label}</h2>
                            <p className="work-library-shelf__body-copy">{section.description}</p>
                          </div>
                          <span className="work-library-shelf__count">{countLabel(section.projects.length, 'project')}</span>
                        </header>

                        <div className="work-library-list">
                          {section.projects.map((project, projectIndex) => (
                            <Link
                              key={project.slug}
                              to={`/${project.slug}`}
                              className="work-library-row figma-hover"
                              data-library-shelf-key={section.key}
                              data-library-project-slug={project.slug}
                              onPointerEnter={() => handleLibraryPreview(section.key, project.slug)}
                              onPointerDown={() => handleLibraryPreview(section.key, project.slug)}
                              onMouseDown={() => handleLibraryPreview(section.key, project.slug)}
                              onTouchStart={() => handleLibraryPreview(section.key, project.slug)}
                              onClick={() => handleLibraryPreview(section.key, project.slug)}
                              onFocus={() => handleLibraryPreview(section.key, project.slug)}
                            >
                              <span className="work-library-row__index">{String(projectIndex + 1).padStart(2, '0')}</span>
                              <div className="work-library-row__thumb">
                                <img src={project.cover16x9 ? project.cardMockup : project.image} alt={project.name} loading={section.key === 'start-here' && projectIndex < 2 ? 'eager' : 'lazy'} decoding="async" />
                              </div>
                              <div className="work-library-row__project">
                                <span className="work-library-row__name">{project.name}</span>
                                <span className="work-library-row__meta">
                                  {project.tag}
                                  {getAccessLabel(project) ? ` / ${getAccessLabel(project)}` : ''}
                                </span>
                              </div>
                              <span className="work-library-row__detail">
                                {project.summaryOutcome || project.summaryRole || project.desc}
                              </span>
                              <span className="work-library-row__year">{project.summaryTimeline || project.year}</span>
                              <FigmaSelect />
                            </Link>
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              </section>
            ) : (
              <section className="work-timeline-shell" id="work-project-results" aria-label="Work arc">
                <aside className="work-timeline-rail surface-glass surface-glass--subtle">
                  <div className="work-timeline-rail__head">
                    <span className="mono-label work-group-label">Arc</span>
                  </div>
                  <div className="work-timeline-rail__list" role="toolbar" aria-label="Jump to period">
                    {timelineSections.map(section => (
                      <button
                        key={section.key}
                        type="button"
                        aria-pressed={activeTimelineYear === section.key}
                        className={`work-timeline-rail__item figma-hover${activeTimelineYear === section.key ? ' is-active surface-glass--active' : ''}`}
                        onClick={() => handleTimelineJump(section.key)}
                      >
                        <span>{section.label}</span>
                        <small>{section.projects.length}</small>
                        <FigmaSelect />
                      </button>
                    ))}
                  </div>
                </aside>

                <div className="work-timeline-main">
                  {timelineSections.map(section => (
                    <section
                      key={section.key}
                      id={`work-timeline-${section.key}`}
                      className="work-timeline-year"
                      data-timeline-year={section.key}
                      aria-labelledby={`work-timeline-label-${section.key}`}
                    >
                      <header className="work-timeline-year__head">
                        <div>
                          <span className="mono-label work-group-label">Period</span>
                          <h2 id={`work-timeline-label-${section.key}`} className="work-timeline-year__label">
                            {section.label}
                          </h2>
                          <p className="work-timeline-year__summary">{section.summary}</p>
                        </div>
                        <span className="work-timeline-year__count">{countLabel(section.projects.length, 'project')}</span>
                      </header>

                      <div className="work-timeline-year__list">
                        <Link
                          to={`/${section.leadProject.slug}`}
                          className="work-timeline-feature figma-hover"
                        >
                          <div className="work-timeline-feature__media">
                            <CoverArtwork
                              slug={section.leadProject.slug}
                              src={section.leadProject.cover16x9 || section.leadProject.summaryImage || section.leadProject.image}
                              alt={section.leadProject.summaryImageAlt || section.leadProject.name}
                              loading={section.key === timelineSections[0]?.key ? 'eager' : 'lazy'}
                            />
                          </div>
                          <div className="work-timeline-feature__body">
                            <div className="work-timeline-feature__eyebrow">
                              <span>Anchor project</span>
                              <span>{section.leadProject.tag}</span>
                              {getAccessLabel(section.leadProject) ? <span>{getAccessLabel(section.leadProject)}</span> : null}
                            </div>
                            <h3 className="work-timeline-feature__title">{section.leadProject.name}</h3>
                            <p className="work-timeline-feature__detail">
                              {section.leadProject.summaryProblem || section.leadProject.summaryOutcome || section.leadProject.desc}
                            </p>
                            <div className="work-timeline-feature__meta">
                              <span>{section.leadProject.summaryTimeline || section.leadProject.year}</span>
                              <span>{section.leadProject.featured ? 'Flagship work' : section.leadProject.selected ? 'Selected work' : 'Archive work'}</span>
                              {section.leadProject.summaryStats?.[0] ? (
                                <span>
                                  {section.leadProject.summaryStats[0].value} {section.leadProject.summaryStats[0].label}
                                </span>
                              ) : null}
                            </div>
                            <span className="work-timeline-feature__cta">Open case study ↗</span>
                          </div>
                          <FigmaSelect />
                        </Link>

                        {section.supportingProjects.length ? (
                          <div className="work-timeline-support">
                            <div className="work-timeline-support__head">
                              <span className="mono-label">Also in {section.label}</span>
                              <span className="work-timeline-support__count">{countLabel(section.supportingProjects.length, 'more project')}</span>
                            </div>
                            <div className="work-timeline-support__list">
                              {section.supportingProjects.map((project, projectIndex) => (
                                <Link
                                  key={project.slug}
                                  to={`/${project.slug}`}
                                  className="work-timeline-support-row figma-hover"
                                >
                                  <span className="work-timeline-support-row__index">{String(projectIndex + 2).padStart(2, '0')}</span>
                                  <div className="work-timeline-support-row__thumb">
                                    <img
                                      src={project.cover16x9 ? project.cardMockup : (project.summaryImage || project.image)}
                                      alt={project.summaryImageAlt || project.name}
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  </div>
                                  <div className="work-timeline-support-row__body">
                                    <div className="work-timeline-support-row__eyebrow">
                                      <span>{project.tag}</span>
                                      {getAccessLabel(project) ? <span>{getAccessLabel(project)}</span> : null}
                                    </div>
                                    <h3 className="work-timeline-support-row__name">{project.name}</h3>
                                  </div>
                                  <p className="work-timeline-support-row__detail">
                                    {project.summaryOutcome || project.summaryRole || project.desc}
                                  </p>
                                  <span className="work-timeline-support-row__when">{project.summaryTimeline || project.year}</span>
                                  <FigmaSelect />
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {viewMode === 'library'
          ? `Showing the ${librarySections.find(section => section.key === activeLibraryShelf)?.label || 'current'} library shelf`
          : viewMode === 'timeline'
            ? `Showing the ${timelineSections.find(section => section.key === activeTimelineYear)?.label || 'current'} arc section`
          : `Showing ${countLabel(editorialSelectedProjects.length + archiveProjects.length, 'project')}`}
      </div>

      <Footer />
    </>
  )
}
