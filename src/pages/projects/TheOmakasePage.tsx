import { projectImageProps } from '../../utils/projectImage'
import ExternalVideo from '../../components/ExternalVideo'
import { useState } from 'react'
import OmakaseArcade from '../../components/omakase/OmakaseArcade'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import ProjectQuickSummary from '../../components/case-study/ProjectQuickSummary'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

function GameEmbed() {
  return <CsSection id="cs-play" label="Play" title="Try The Omakase"><OmakaseArcade /></CsSection>
}

export default function TheOmakasePage() {
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary')
  const sections = viewMode === 'summary'
    ? [
        { id: 'cs-summary', label: 'TL;DR' },
      ]
    : [
        { id: 'cs-summary', label: 'TL;DR' },
        { id: 'cs-film', label: 'Film' },
        { id: 'cs-play', label: 'Play' },
        { id: 'cs-gameplay', label: 'Gameplay' },
        { id: 'cs-fabrication', label: 'Fabrication' },
        { id: 'cs-exhibition', label: 'Exhibition' },
        { id: 'cs-reflections', label: 'Reflections' },
      ]

  const handleViewModeChange = (nextMode: 'summary' | 'full') => {
    if (nextMode === viewMode) return
    setViewMode(nextMode)
  }

  return (
    <>
      <Helmet>
        <title>The Omakase &middot; Parth Pawar</title>
        <meta name="description" content="A two-player sushi arcade cabinet where custom hardware, RGB controls, and social pacing make the game." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="The Omakase · Parth Pawar" />
        <meta property="og:description" content="A playable arcade cabinet built around fast onboarding, competition, and custom RGB controls." />
        <meta property="og:image" content="https://designwhich.works/Assets/mockups/projects/the-omakase_16x9.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--omakase" style={{ '--project-color': '#8B5E3C' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="installations"
          backLabel="Back to Work"
          tags={['Creative Technology', 'Game Design']}
          title="The Omakase"
          subtitle="A two-player sushi arcade cabinet where the hardware, pacing, and social pressure are the game"
          info={[
            { label: 'Year', value: '2024' },
            { label: 'Role', value: 'Game designer + fabricator' },
          ]}
          showHeaderSummary={false}
        />

        <ProjectQuickSummary
          slug="the-omakase"
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        <CsExpandPreview
          expanded={viewMode === 'full'}
          onExpand={() => handleViewModeChange('full')}
          cta="Open the build and exhibition proof"
          note="Cabinet photos, gameplay details, fabrication notes, exhibition proof, and reflections."
        >
        {/* Video */}
        <section className="cs-slide reveal" id="cs-film">
          <div className="omakase-film">
            <ExternalVideo
              src="https://player.vimeo.com/video/996020990?h=&badge=0&autopause=0&player_id=0&app_id=58479"
              frameBorder="0" loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="omakase-film__iframe"
              title="The Omakase"
            />
          </div>
        </section>

        {/* Play the game */}
        <GameEmbed />

        {/* Gameplay */}
        <section className="cs-section reveal" id="cs-gameplay">
          <div className="wrap">
            <p className="cs-section-label">01 &mdash; Gameplay</p>
            <h3 className="cs-section-title">Gameplay</h3>
            <CsBody>
              <p>Each player gets eight color-changing arcade buttons. Matching the controls to the colors on screen was intended to make the first action discoverable through looking and pressing. The published game instructions map colors to customers. The photographs below show the physical controls; they are not a timed onboarding test.</p>
              <p>Two players stand shoulder to shoulder and race through 90-second sushi orders. That puts the shared screen, both sets of hands, and the score in the same view for players and spectators.</p>
            </CsBody>
          </div>
          <div className="wrap omakase-evidence-pair">
            <figure className="cs-img reveal omakase-figure">
              <img {...projectImageProps("/Assets/Projects/the-omakase/photos/chef-select-screen.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/chef-select-screen.webp" alt="Chef select screen — Chef Shiro versus Chef Kuro, each player's sushi likes, and a color-coded button legend for dropping sushi and changing belt direction" loading="lazy" decoding="async" />
              <figcaption className="cs-img-caption">The whole rulebook fits on one screen: pick your chef, match button colors to customers, go.</figcaption>
            </figure>

            <figure className="cs-img reveal omakase-figure">
              <img {...projectImageProps("/Assets/Projects/the-omakase/photos/play-dark-buttons-screen.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/play-dark-buttons-screen.webp" alt="Over a player's shoulder in the dark: the sushi conveyor belt on screen above two clusters of glowing RGB buttons under their hands" loading="lazy" decoding="async" />
              <figcaption className="cs-img-caption">Screen and controls together: the customer colors are repeated by the physical RGB buttons.</figcaption>
            </figure>
          </div>
        </section>

        {/* Hero photos */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid omakase-grid omakase-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/the-omakase/photos/cabinet-front.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/cabinet-front.webp" alt="The Omakase arcade cabinet: plywood body, monitor, RGB button controllers" loading="lazy" decoding="async" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/the-omakase/photos/cabinet-workshop.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/cabinet-workshop.webp" alt="The Omakase cabinet in the ITP workshop during build" loading="lazy" decoding="async" /></div>
            </div>
          </div>
        </section>

        {/* Gameplay photos */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid omakase-grid omakase-grid--feature">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/the-omakase/photos/rgb-buttons-hands.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/rgb-buttons-hands.webp" alt="Close-up: two players' hands on glowing RGB arcade buttons" loading="lazy" decoding="async" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/the-omakase/photos/game-screen-sushi.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/game-screen-sushi.webp" alt="Game screen showing sushi conveyor belt and color-coded customers" loading="lazy" decoding="async" /></div>
              <div className="cs-img reveal omakase-grid__wide"><img {...projectImageProps("/Assets/Projects/the-omakase/photos/rgb-buttons-dark.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/rgb-buttons-dark.webp" alt="RGB buttons glowing in the dark, colorful arcade atmosphere" loading="lazy" decoding="async" /></div>
            </div>
          </div>
        </section>

        {/* Players and exhibition */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid omakase-grid omakase-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/the-omakase/photos/two-players.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/two-players.webp" alt="Two players competing at the arcade cabinet at exhibition" loading="lazy" decoding="async" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/the-omakase/photos/team-photo.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/team-photo.webp" alt="Team photo in front of The Omakase cabinet at exhibition" loading="lazy" decoding="async" /></div>
            </div>
          </div>
        </section>

        {/* Fabrication */}
        <section className="cs-section reveal" id="cs-fabrication">
          <div className="wrap">
            <p className="cs-section-label">02 &mdash; Fabrication</p>
            <h3 className="cs-section-title">Fabrication</h3>
            <CsBody>
              <p>Built from laser-cut birch plywood, the cabinet breaks down into flat panels for transport. The sloped control deck borrows from Japanese candy cab layouts, but is tuned for two people playing side by side.</p>
              <p>An Arduino Mega drives 16 RGB arcade buttons. The button light is the interface: the game sends lighting updates to the controls during play.</p>
            </CsBody>
          </div>
          <div className="wrap">
            <div className="cs-img-grid omakase-grid omakase-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/the-omakase/photos/plywood-shell-drilled.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/plywood-shell-drilled.webp" alt="Bare varnished plywood shell of the cabinet with two clusters of eight drilled button holes, before any hardware went in" loading="lazy" decoding="async" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/the-omakase/photos/marquee-sign-detail.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/marquee-sign-detail.webp" alt="Close-up of the marquee: THE OMAKASE. in a pixel typeface on birch plywood" loading="lazy" decoding="async" /></div>
            </div>
            <p className="cs-img-caption omakase-grid-caption">Left: the shell after drilling — 8 button holes per player, no hardware yet. Right: the pixel-type marquee that ties the cabinet to the game&rsquo;s art.</p>
          </div>
        </section>

        {/* Exhibition */}
        <section className="cs-section reveal" id="cs-exhibition">
          <div className="wrap">
            <p className="cs-section-label">03 &mdash; Exhibition</p>
            <h3 className="cs-section-title">Exhibition</h3>
            <CsBody>
              <p>At the ITP Spring Show 2024, visitors played while others waited around the cabinet. The available documentation does not include a verified participant count. The format worked because every match was also a performance for the people waiting.</p>
              <p>The cabinet was also shown at Wonderville in Brooklyn, Coney Island, and a Manhattan sushi restaurant. Moving between a student show, an arcade bar and a restaurant changed the setting around the same two-player game.</p>
            </CsBody>
          </div>
          <div className="wrap">
            <figure className="cs-img reveal omakase-figure">
              <img {...projectImageProps("/Assets/Projects/the-omakase/photos/head-to-head-match.webp")} data-project-preview src="/Assets/Projects/the-omakase/photos/head-to-head-match.webp" alt="Two players seen from behind, mid-match at the cabinet — scores of $115 and $50 on the shared screen, buttons glowing under their hands" loading="lazy" decoding="async" />
              <figcaption className="cs-img-caption">A shared screen keeps both scores visible to the players and the people watching.</figcaption>
            </figure>
          </div>
        </section>

        {/* Reflections */}
        <section className="cs-section reveal" id="cs-reflections">
          <div className="wrap">
            <p className="cs-section-label">04 &mdash; Reflections</p>
            <h3 className="cs-section-title">Reflections</h3>
            <CsBody>
              <p><strong>Physical feedback changes everything.</strong> The RGB buttons connect the physical controls to the colors on screen. The exhibition photographs show people playing, but do not measure how quickly someone learned the mapping without help.</p>
              <p><strong>Design for spectators too.</strong> The cabinet made waiting part of the experience: people watched hands, scores, mistakes, and celebrations before stepping up.</p>
              <p><strong>Constraints made it sharper.</strong> 90-second rounds, eight buttons per player, and a transportable cabinet kept the build focused. A future playtest should separate first-round mistakes from later performance to check how well that simplicity translates into learning.</p>
            </CsBody>
          </div>
        </section>

        <CsThanks />

        </CsExpandPreview>

        <BottomNav
          sections={sections}
          modeAction={{
            label: 'Full story',
            onClick: () => handleViewModeChange('full'),
          }}
        />

      </main>

      <NextProject slug="ibm" title="IBM Cancer Prognosis" image="/Assets/Projects/ibm/1.webp" />
      <Footer />
    </>
  )
}
