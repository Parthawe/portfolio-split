import { Component, lazy, Suspense, type ReactNode } from 'react'
import { useWebGLAvailable } from '../hooks/useWebGLAvailable'
import { usePerformanceDegraded } from '../hooks/usePerformanceDegraded'
import { useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { categories } from '../data/categories'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ProjectCard from '../components/ProjectCard'
import { Reveal } from '../components/Reveal'
import ClientsMarquee from '../components/ClientsMarquee'
import FigmaFrameLabel from '../components/FigmaFrameLabel'
import FigmaSelect from '../components/FigmaSelect'
import ParthDoesSection from '../components/ParthDoesSection'
import ResearchImpactSection from '../components/ResearchImpactSection'
import '../styles/landing.css'
import '../styles/ai-hero.css'
import '../styles/crypto.css'
import '../styles/fintech.css'
import {
  getProject,
  isHiddenProject,
  projectsByCategory,
  type Project,
  type ProjectCategory,
} from '../data/projects'

const CategoryHero = lazy(() => import('../components/CategoryHero'))
const CategoryObject3D = lazy(() => import('../components/CategoryObject3D'))

const CATEGORIES_WITH_3D = new Set(['installations', 'design-for-good', 'ux-design', 'ux-research', 'brand-visual', 'ai', 'design-engineering', 'fintech', 'crypto', 'ai-wearables'])

const CATEGORY_ALIASES: Record<string, string> = {
  brand: 'brand-visual',
  'design-engineer': 'design-engineering',
  healthcare: 'design-for-good',
  ui: 'ux-design',
  ux: 'ux-design',
}

// Keep category chrome aligned with the Figma panel selection color.
const CATEGORY_PAGE_ACCENT = 'var(--select-blue)'

const CATEGORY_REGISTRY_KEY: Partial<Record<string, ProjectCategory>> = {
  ai: 'ai',
  'ai-wearables': 'ai',
  'ux-design': 'ux',
  'ux-research': 'research',
  installations: 'install',
  'brand-visual': 'brand',
  'design-for-good': 'good',
}

/* Curated cross-listing so no landing page runs thin — projects can live in
   several categories when the work genuinely fits (hidden ones are filtered
   out downstream either way). */
const EXTRA_CATEGORY_PROJECTS: Partial<Record<string, string[]>> = {
  'ux-design': ['mentra', 'mentra-miniapps', 'executivelens', 'raahi-project'],
  'design-engineering': ['mentra', 'clawed-chat', 'executivelens', 'oncall-lens', 'ballah-code', 'zentipay', 'transfi-project', 'healthapp'],
  installations: ['jugalbandi', 'enigma', 'sea-of-salt'],
  'brand-visual': ['mentra-brand', 'office-of-diversity', 'sea-of-salt'],
  fintech: ['moniac-machine', 'executivelens'],
  crypto: ['moniac-machine'],
  'design-for-good': ['healthapp', 'raahi-project', 'code-for-build'],
}

const CATEGORY_ANNOTATION_LINKS = [
  { label: 'UX Design', slug: 'ux-design', link: '/ux-design' },
  { label: 'UX Research', slug: 'ux-research', link: '/ux-research' },
  { label: 'AI & Wearables', slug: 'ai-wearables', link: '/ai-wearables' },
  { label: 'Design Engineering', slug: 'design-engineering', link: '/design-engineering' },
  { label: 'Installations', slug: 'installations', link: '/installations' },
  { label: 'Brand & Visual', slug: 'brand-visual', link: '/brand-visual' },
  { label: 'Design for Good', slug: 'design-for-good', link: '/design-for-good' },
] as const

function addVisibleProject(
  list: Project[],
  seen: Set<string>,
  project?: Project,
  includedHiddenProjects: ReadonlySet<string> = new Set(),
) {
  if (
    !project
    || (isHiddenProject(project) && !includedHiddenProjects.has(project.slug))
    || seen.has(project.slug)
  ) return
  seen.add(project.slug)
  list.push(project)
}

// This navigation is optional: a failed icon must not leave an empty strip
// or take down the project page. Keep failure recovery local to this section.
class DisciplineObjectsBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

export default function CategoryPage() {
  const webglAvailable = useWebGLAvailable()
  const performanceDegraded = usePerformanceDegraded()
  const { pathname } = useLocation()
  const rawSlug = pathname.split('/').filter(Boolean).pop() ?? ''
  const slug = CATEGORY_ALIASES[rawSlug] ?? rawSlug
  const has3D = CATEGORIES_WITH_3D.has(slug)
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    return (
      <>
        <Nav />
        <div className="wrap" style={{ paddingTop: '8rem', minHeight: '60vh' }}>
          <h1>Category not found</h1>
          <p>
            <Link to="/work">Back to Work</Link>
          </p>
        </div>
        <Footer />
      </>
    )
  }

  const seenProjectSlugs = new Set<string>()
  const visibleCategoryProjects: Project[] = []
  const includedHiddenProjects = new Set(category.includedHiddenProjects ?? [])

  addVisibleProject(visibleCategoryProjects, seenProjectSlugs, getProject(category.featured.slug), includedHiddenProjects)
  category.moreProjects.flat().forEach((project) => {
    addVisibleProject(visibleCategoryProjects, seenProjectSlugs, getProject(project.slug), includedHiddenProjects)
  })
  const registryCategory = CATEGORY_REGISTRY_KEY[slug]
  if (registryCategory) {
    projectsByCategory(registryCategory).forEach((project) => {
      addVisibleProject(visibleCategoryProjects, seenProjectSlugs, project, includedHiddenProjects)
    })
  }
  EXTRA_CATEGORY_PROJECTS[slug]?.forEach((projectSlug) => {
    addVisibleProject(visibleCategoryProjects, seenProjectSlugs, getProject(projectSlug), includedHiddenProjects)
  })

  const excludedProjectSlugs = new Set(category.excludedProjects ?? [])
  const archiveProjectSlugs = new Set(category.archiveSection?.projects ?? [])
  const featuredProject = visibleCategoryProjects.find(
    (project) => !excludedProjectSlugs.has(project.slug) && !archiveProjectSlugs.has(project.slug),
  ) ?? null
  const visibleMoreProjects = visibleCategoryProjects.filter(
    (project) => project.slug !== featuredProject?.slug
      && !excludedProjectSlugs.has(project.slug)
      && !archiveProjectSlugs.has(project.slug),
  )
  const archiveProjects = (category.archiveSection?.projects ?? []).reduce<Project[]>((projects, projectSlug) => {
    const project = getProject(projectSlug)
    if (project && !isHiddenProject(project) && !projects.some((item) => item.slug === project.slug)) {
      projects.push(project)
    }
    return projects
  }, [])
  const projectCount = (featuredProject ? 1 : 0) + visibleMoreProjects.length + archiveProjects.length
  return (
    <div className="category-page" style={{ '--lp-accent': CATEGORY_PAGE_ACCENT } as React.CSSProperties}>
      <Helmet>
        <title>{category.metaTitle}</title>
        <meta name="description" content={category.metaDescription} />
        <meta property="og:title" content={category.metaTitle} />
        <meta property="og:description" content={category.metaDescription} />
      </Helmet>
      <Nav />

      <main id="main-content">
        <div className="wrap">
          {/* Editorial hero — all categories */}
          <Suspense fallback={null}>
            <CategoryHero
              slug={slug}
              routeSlug={rawSlug}
              accentColor={CATEGORY_PAGE_ACCENT}
              title={category.title}
              titleAccent={category.titleAccent}
              description={category.description}
              stats={category.stats}
              tools={category.tools}
              has3D={has3D}
              projectCount={projectCount}
            />
          </Suspense>

          {/* All projects, flagship first (full-width), then rest in masonry */}
          <div id="lp-work" tabIndex={-1} role="region" aria-label="Project collection">
            {featuredProject ? (
              <>
                <p className="lp-section-label">Flagship</p>
                <Reveal>
                  <ProjectCard
                    slug={featuredProject.slug}
                    name={featuredProject.name}
                    image={featuredProject.image}
                    tag={featuredProject.tag}
                    year={featuredProject.year}
                    desc={featuredProject.desc}
                    loading="eager"
                    featured
                    useProvidedImage={slug === 'ux-research' && featuredProject.slug === 'medimorpho'}
                    nda={featuredProject.nda}
                  />
                </Reveal>
              </>
            ) : null}

            {visibleMoreProjects.length > 0 && (
              <>
                <p className="lp-section-label">More projects</p>
                <div className="pcard-masonry">
                  {visibleMoreProjects.map((project) => (
                    <Reveal key={project.slug}>
                      <ProjectCard
                        slug={project.slug}
                        name={project.name}
                        image={project.image}
                        tag={project.tag}
                        year={project.year}
                        desc={project.desc}
                        tilt={false}
                        nda={project.nda}
                      />
                    </Reveal>
                  ))}
                </div>
              </>
            )}

            {category.archiveSection && archiveProjects.length > 0 && (
              <section className="lp-project-archive" aria-labelledby="lp-project-archive-title">
                <p className="lp-section-label" id="lp-project-archive-title">
                  {category.archiveSection.label}
                </p>
                <div className="lp-project-archive-grid">
                  {archiveProjects.map((project) => (
                    <Reveal key={project.slug}>
                      <ProjectCard
                        slug={project.slug}
                        name={project.name}
                        image={project.image}
                        tag={project.tag}
                        year={project.year}
                        desc={project.desc}
                        tilt={false}
                        nda={project.nda}
                      />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Impact proof: later in the page, after the work has context. */}
          <Reveal>
            <section className="lp-impact-strip" aria-label="Where my work made a difference">
              <ClientsMarquee />
            </section>
          </Reveal>

          <Reveal>
            {slug === 'ux-research' ? <ResearchImpactSection /> : <ParthDoesSection />}
          </Reveal>

          {slug !== 'ux-research' && webglAvailable && !performanceDegraded && (
            <DisciplineObjectsBoundary key={slug}>
              <Suspense fallback={null}>
                <Reveal>
                  <section className="lp-category-disciplines" style={{ position: 'relative' }}>
                    <FigmaFrameLabel name="Disciplines" />
                    <div className="lp-category-disciplines-grid">
                      {CATEGORY_ANNOTATION_LINKS.map((item, index) => (
                        <Link
                          key={item.slug}
                          to={item.link}
                          className={`lp-category-discipline figma-hover${item.slug === slug || (slug === 'ai' && item.slug === 'ai-wearables') ? ' is-active' : ''}`}
                          style={{ transitionDelay: `${index * 0.04}s` }}
                        >
                          <span className="lp-category-discipline-object" aria-hidden="true">
                            <CategoryObject3D slug={item.slug} size={76} />
                          </span>
                          <span className="lp-category-discipline-label">{item.label}</span>
                          <FigmaSelect />
                        </Link>
                      ))}
                    </div>
                  </section>
                </Reveal>
              </Suspense>
            </DisciplineObjectsBoundary>
          )}
        </div>

      </main>

      <Footer />
    </div>
  )
}
