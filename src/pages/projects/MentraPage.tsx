import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import ProjectQuickSummary from '../../components/case-study/ProjectQuickSummary'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'
import CaseStudySlides from '../../components/case-study/CaseStudySlides'
import { mentraSlideChapters } from '../../data/caseStudySlides'
import { mentraDecisionChapters, mentraDecisions } from '../../data/productDecisionStories'
import { settleAnchor } from '../../utils/settleAnchor'

const openingComparisonId = 'cs-design-proof'

export default function MentraPage() {
  const location = useLocation()
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary')
  const [sourceOpen, setSourceOpen] = useState(false)
  const openingSections = [
    { id: openingComparisonId, label: 'Before and after' },
    { id: 'cs-summary', label: 'Quick read' },
  ]
  const sections = viewMode === 'summary'
    ? openingSections
    : [...openingSections, ...mentraDecisionChapters.map(chapter => ({ id: chapter.id, label: ({ 'decision-first-use': 'First use', 'decision-runtime': 'Runtime', 'decision-recovery': 'Recovery', 'decision-results': 'Results' } as Record<string,string>)[chapter.id] })), { id: 'source-presentation', label: 'Original deck' }]

  const handleViewModeChange = (nextMode: 'summary' | 'full') => {
    if (nextMode === viewMode) return
    setViewMode(nextMode)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const targetId = location.hash.replace('#', '')
    if (!targetId) return

    if (mentraSlideChapters.some(chapter => chapter.id === targetId) || targetId === 'source-presentation') setSourceOpen(true)

    if (targetId !== openingComparisonId && targetId !== 'cs-summary' && targetId !== 'project-overview') {
      setViewMode('full')
    }

    return settleAnchor(targetId)
  }, [location.hash])

  return (
    <>
      <Helmet>
        <title>Mentra · Parth Pawar</title>
        <meta name="description" content="Mentra Glass, designing the OS, companion app, MiniApp Store, and launch website for AI smart glasses. Case study by Parth Pawar, Head of Design." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Mentra · Parth Pawar" />
        <meta property="og:description" content="Designing the OS, companion app, MiniApp Store, developer platform, and launch website for Mentra smart glasses." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/mentra.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--mentra-visual" style={{
        // Mentra brand green (#00B869) drives the whole page: accent, outer
        // gradient family, and hero orbs.
        '--project-color': '#00B869',
        '--case-outer-1': '#071710',
        '--case-outer-2': '#0b3021',
        '--case-outer-3': '#123828',
        '--case-outer-glow-a': 'rgba(0, 184, 105, 0.30)',
        '--case-outer-glow-b': 'rgba(52, 211, 153, 0.20)',
        '--case-hero-orb-b': 'rgba(127, 219, 190, 0.24)',
        '--case-hero-blob-a': 'rgba(74, 213, 160, 0.30)',
        '--case-hero-blob-b': 'rgba(9, 108, 70, 0.34)',
        '--case-hero-blob-c': 'rgba(160, 224, 196, 0.22)',
        '--case-hero-blob-glow': 'rgba(198, 240, 220, 0.28)',
      } as React.CSSProperties}>

      <ProjectHeader
        backLink="/work"
        categorySlug="ai"
        backLabel="Back to work"
        tags={['AI wearables', 'Head of Design']}
        title="Mentra"
        subtitle="Designing the OS, companion app, MiniApp Store, and launch site for AI smart glasses"
        info={[
          { label: 'Role', value: 'Head of Design' },
          { label: 'Timeline', value: 'Q3 2025 \u2013 Present (ongoing)' },
          { label: 'Team', value: '2 founders, 8 engineers, 3 operators and 2 marketers' },
          { label: 'Platform', value: 'Wearable OS, mobile, web' },
        ]}
        liveUrl="https://mentraglass.com"
        heroExperience="visual"
        heroFraming="image"
        heroTone="mentra"
        visualSummary="I led design for the smart-glasses OS and companion app. We redesigned the home screen around launching MiniApps."
        openingMediaId={openingComparisonId}
        visualHeroMedia={
          <div className="mentra-opening-comparison" role="group" aria-label="Mentra home screen before and after">
            <figure>
              <figcaption><span>Before</span>Device controls first</figcaption>
              <img data-project-preview src="/Assets/images/mentra/deck/home-before.png" width="313" height="712"
                alt="The original home screen has a large glasses control panel above separate lists of active and inactive apps." decoding="async" />
            </figure>
            <figure>
              <figcaption><span>After</span>MiniApps first</figcaption>
              <img data-project-preview src="/Assets/images/mentra/deck/home-after.png" width="342" height="725"
                alt="The redesigned home screen keeps glasses status at the top, with a grid of MiniApps and a runtime control at the bottom." decoding="async" />
            </figure>
          </div>
        }
        heroCaption="Device status stays visible. The app grid takes the main area, and running apps have a dedicated control at the bottom."
        liveLabel="Open Mentra"
        showHeaderSummary={false}
      />

        <ProjectQuickSummary
          slug="mentra"
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          variant="open"
          label=""
          title="Project overview"
          proofLimit={0}
        />

        <CsExpandPreview
          sectionIds={[...mentraDecisionChapters.map(chapter => chapter.id), ...mentraSlideChapters.map(chapter => chapter.id), 'source-presentation']}
          expanded={viewMode === 'full'}
          onExpand={() => setViewMode('full')}
          cta="Read the decisions and original screens"
          previewImage="/Assets/mockups/projects/mentra_16x9.webp"
        >
        <CaseStudySlides chapters={mentraDecisionChapters} decisions={mentraDecisions} />
        <div className="wrap">
          <p className="cs-caption">These decisions focus on first use and runtime. <a className="cs-text-link" href="/mentra-miniapps">See MiniApps for the app-specific screen flows</a> or <a className="cs-text-link" href="/mentra-brand">explore the packaging and identity</a>.</p>
          <details id="source-presentation" className="mentra-source-archive" open={sourceOpen} onToggle={event => { if (event.target === event.currentTarget) setSourceOpen(event.currentTarget.open) }}>
            <summary>Inspect all 44 original presentation slides</summary>
            <p>The complete source retains research, explorations, enterprise, website, results, and reflection. Reported results belong to separate first-use and runtime phases; dates and cohort sizes are not available publicly.</p>
            {sourceOpen && <CaseStudySlides chapters={mentraSlideChapters} />}
          </details>
        </div>

        <CsThanks contactCta className="cs-thanks--separated" />
        </CsExpandPreview>

        <BottomNav
          sections={sections}
          liveUrl="https://mentraglass.com"
          modeAction={{
            label: viewMode === 'summary' ? 'Full case study' : '2 min summary',
            onClick: () => handleViewModeChange(viewMode === 'summary' ? 'full' : 'summary'),
          }}
        />

      </main>

      <NextProject slug="transfi-project" title="TransFi" image="/Assets/mockups/projects/transfi-project_16x9.webp" />
      <Footer />
    </>
  )
}
