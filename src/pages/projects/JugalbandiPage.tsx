import { experiencePreviewsEnabled } from '../../utils/experiencePreview'
import JugalbandiMechanismStudy from '../../components/case-study/JugalbandiMechanismStudy'
import CsScreenStrip from '../../components/case-study/CsScreenStrip'
import '../../components/case-study/service-decisions.css'
import ExternalVideo from '../../components/ExternalVideo'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import ProjectQuickSummary from '../../components/case-study/ProjectQuickSummary'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsMediaSpotlight from '../../components/case-study/CsMediaSpotlight'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function JugalbandiPage() {
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary')
  const sections = viewMode === 'summary'
    ? [
        { id: 'cs-summary', label: 'TL;DR' },
        { id: 'cs-film', label: 'Film' },
        { id: 'cs-overview', label: 'Overview' },
      ]
    : [
        { id: 'cs-summary', label: 'TL;DR' },
        { id: 'cs-film', label: 'Film' },
        { id: 'cs-overview', label: 'Overview' },
        { id: 'cs-background', label: 'Background' },
        { id: 'cs-instrument', label: 'The Instrument' },
        { id: 'cs-process', label: 'Process' },
        { id: 'cs-reflection', label: 'Reflection' },
      ]

  const handleViewModeChange = (nextMode: 'summary' | 'full') => {
    if (nextMode === viewMode) return
    setViewMode(nextMode)
  }

  return (
    <>
      <Helmet>
        <title>Jugalbandi &middot; Parth Pawar</title>
        <meta name="description" content="A physical computing installation where a neural network performs with a human musician through strings, air pipes, and percussion." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Jugalbandi · Parth Pawar" />
        <meta property="og:description" content="A MIDI controller and acoustic machines exchanging musical phrases." />
        <meta property="og:image" content="https://designwhich.works/Assets/mockups/projects/jugalbandi_16x9.webp" />
      </Helmet>

      <Nav />

      <main
        id="main-content"
        className="project-main project-main--jugalbandi"
        style={{
          '--project-color': '#2F6BFF',
          '--case-outer-glow-a': 'rgba(255, 63, 164, 0.36)',
          '--case-outer-glow-b': 'rgba(47, 107, 255, 0.46)',
          '--case-outer-1': '#161335',
          '--case-outer-2': '#211747',
          '--case-outer-3': '#171A3F',
          '--case-hero-blob-a': 'rgba(255, 68, 171, 0.34)',
          '--case-hero-blob-b': 'rgba(47, 107, 255, 0.3)',
          '--case-hero-blob-c': 'rgba(132, 87, 255, 0.24)',
          '--case-hero-blob-glow': 'rgba(255, 132, 208, 0.26)',
        } as React.CSSProperties}
      >

        <ProjectHeader
          backLink="/work"
          categorySlug="creative-tech"
          backLabel="Back to Work"
          tags={['Physical Computing', 'Music', 'Art Installation']}
          title="Jugalbandi"
          subtitle="A playable duet between human improvisation and a neural network expressed through acoustic machines"
          info={[
            { label: 'Timeline', value: '2024' },
            { label: 'Role', value: 'Interaction designer + fabricator' },
            { label: 'Context', value: 'NYU \u2013 ITP' },
            { label: 'Duration', value: '5 Months' },
          ]}
          showHeaderSummary={false}
        />

        <CsMediaSpotlight
          id="cs-film"
          label="Watch first"
          title="Hear the human and robotic duet"
          lede="Follow one exchange: Hexa-18 flute calls the robotic flute, tanpura calls the harp, and tabla calls the rainsticks. The film records the original sound and mechanisms."
          actionLabel="Play performance"
          layout="stacked"
        >
          <ExternalVideo
            src="https://player.vimeo.com/video/996020149?title=0&byline=0&portrait=0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="Jugalbandi Performance"
          />
        </CsMediaSpotlight>

        <CsSection title="Follow a call and its answer">
          <CsBody><p>The performer plays Hexa-18. The separate acoustic instruments answer through air, plucked strings, and falling grains. These pairings follow the original project; synchronized sensor and actuator logs are not included.</p></CsBody>
          <ol className="study-explorer__flow">
            <li><span>Flute · top</span><p>Touch input → robotic flute fingers and air supply.</p></li>
            <li><span>Tanpura · sides</span><p>Hand movement → servo-driven harp plucks.</p></li>
            <li><span>Tabla · inside</span><p>Percussive input → eight rotating rainsticks.</p></li>
          </ol>
        </CsSection>

        <ProjectQuickSummary
          slug="jugalbandi"
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          variant="open"
        />

        <CsSection id="cs-overview" title="Two performers, three kinds of response">
          <CsBody><p>The Hindustani duet gives the project its name. Hexa-18 is the human-played MIDI instrument; the separate acoustic mechanisms answer the performer. The original performance is the evidence for how those voices sound together.</p></CsBody>
          {experiencePreviewsEnabled&&<p><a className="glass-action" href="/experience-preview/jugalbandi">Play the browser call and response ↗</a></p>}
        </CsSection>
        <CsExpandPreview expanded={viewMode === 'full'} onExpand={() => setViewMode('full')} sectionIds={['cs-background','cs-instrument','cs-harp-story','cs-process','cs-reflection']} cta="Inspect the instruments and decisions" note="Compare the controller, acoustic mechanisms and their original construction photographs.">
        <CsSection id="cs-instrument" title="Follow the gesture into its mechanism">
          <div id="cs-harp-story"><JugalbandiMechanismStudy /></div>
        </CsSection>
        <CsSection id="cs-background" title="The constraints are physical">
          <CsBody><p>A string responds when a pick releases it. A flute needs both an open air path and a stable blowing angle. A rainstick continues sounding as its contents fall. Those differences give each machine its own attack and decay; the same response timing cannot describe all three.</p></CsBody>
          <details className="service-source-details"><summary>Inspect the enclosure and construction details</summary><CsScreenStrip label="Original Jugalbandi detail photographs" screens={[
            ['538A3938_nsquare_23.webp','Hexa-18 top and sensor faces'],['538A3968_nsquare_39.png','Controller sensor detail'],['538A3968_nsquare_39-1.png','Harp controller and wiring'],['538A4023_nsquare_64.png','Wind pipes from above'],['538A4005_nsquare_57.webp','Harp rear assembly'],
          ].map(([file,label])=>({src:`/Assets/Projects/Jugalbandi/Photos/${file}`,label,alt:`Original construction photograph: ${label}`}))} /></details>
        </CsSection>
        <CsSection id="cs-process" title="What the browser reconstructs">
          <CsBody><p>The project documentation describes an ml5.js model connected to Arduino-controlled acoustic instruments. The browser study preserves the instrument pairings and makes their mechanisms operable with pointer, touch and keyboard input. Its response is an illustrative note echo, with synthesized sound and demo tunes. The original model, raga rules and synchronized sensor/actuator logs are unavailable.</p></CsBody>
        </CsSection>
        <CsSection id="cs-reflection" title="What to compare next">
          <CsBody><p>Use the film to compare the onset and decay of each acoustic answer with its physical movement. A faithful timing reconstruction would need recorded controller events and actuator logs; an audience study would be needed to establish whether the installation makes the computation easier to understand.</p></CsBody>
        </CsSection>
        <CsThanks />
        </CsExpandPreview>

        <BottomNav
          sections={sections}
          modeAction={{
            label: viewMode === 'summary' ? 'Full case study' : '2 min summary',
            onClick: () => handleViewModeChange(viewMode === 'summary' ? 'full' : 'summary'),
          }}
        />

      </main>

      <NextProject slug="enigma" title="Enigma" image="/Assets/mockups/projects/enigma_16x9.webp" />
      <Footer />
    </>
  )
}
