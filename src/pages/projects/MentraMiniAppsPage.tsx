import { projectImageProps } from '../../utils/projectImage'
import CsScreenStrip from '../../components/case-study/CsScreenStrip'
import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import ProjectQuickSummary, { type CaseStudyViewMode } from '../../components/case-study/ProjectQuickSummary'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

const MINIAPP_ASSETS = {
  notes: '/Assets/Projects/mentra-miniapps/figma/notes.png?v=figma-miniapps-2',
  conversations: '/Assets/Projects/mentra-miniapps/figma/conversations.png?v=figma-miniapps-2',
  transcript: '/Assets/Projects/mentra-miniapps/figma/live-transcript.png?v=figma-miniapps-2',
  meet: '/Assets/Projects/mentra-miniapps/figma/meet-home.png?v=figma-miniapps-2',
  guidance: '/Assets/Projects/mentra-miniapps/figma/guidance.png?v=figma-miniapps-2',
}

const miniAppExamples = [
  {
    title: 'Notes',
    caption: 'Original Notes screen.',
    decision: { question: 'How can a saved note be traced back?', choice: 'Keep source conversation or date beside the note and separate note categories.', evidence: 'Inspect All, Favorites, Manual, and AI Generated filters and the source labels on entries.' },
    label: 'Mentra Notes · saved notes',
    src: MINIAPP_ASSETS.notes,
    width: 419,
    height: 909,
    alt: 'Mentra Notes saved notes with category filters, favorites, source conversations, and an add-note button',
  },
  {
    title: 'Conversations',
    caption: 'Original conversation list.',
    decision: { question: 'Which conversation is this?', choice: 'Use date, duration, and participants to identify a session.', evidence: 'Compare the live session with completed recordings before opening a transcript.' },
    label: 'Mentra Notes · conversations',
    src: MINIAPP_ASSETS.conversations,
    width: 419,
    height: 909,
    alt: 'Mentra Conversations MiniApp with transcript list',
  },
  {
    title: 'Live Transcript',
    caption: 'Original active transcript.',
    decision: { question: 'Is recording still active, and can it be stopped?', choice: 'Keep speaker context and recording controls in the reading view.', evidence: 'Locate the live badge, elapsed time, Pause, and Stop alongside the speaker markers.' },
    label: 'Mentra Notes · active recording',
    src: MINIAPP_ASSETS.transcript,
    width: 420,
    height: 911,
    alt: 'Mentra Live Transcript MiniApp showing speech converted to readable text',
  },
  {
    title: 'Mentra Call',
    caption: 'The original screen offers Join Call with a Microsoft Teams link and Start Call for a new meeting. Mentra Live connection status appears directly below those actions.',
    label: 'Calling + presence',
    src: MINIAPP_ASSETS.meet,
    width: 390,
    height: 844,
    alt: 'Mentra Call screen with Microsoft Teams join and start actions and Mentra Live connection status',
  },
  {
    title: 'Guidance',
    caption: 'The destination picker combines search, saved Home and Work locations, Add place, and recent destinations. The supplied screen shows destination selection before a route starts.',
    label: 'Guidance · choose a destination',
    src: MINIAPP_ASSETS.guidance,
    width: 363,
    height: 783,
    alt: 'Guidance destination picker with search, saved places, map controls, and recent destinations',
  },
]

export default function MentraMiniAppsPage() {
  const location = useLocation()
  const [viewMode, setViewMode] = useState<CaseStudyViewMode>('summary')
  const sections = viewMode === 'summary'
    ? [
        { id: 'cs-summary', label: 'Quick read' },
        { id: 'cs-vision', label: 'Overview' },
      ]
    : [
        { id: 'cs-summary', label: 'Quick read' },
        { id: 'cs-vision', label: 'Overview' },
                { id: 'cs-discovery', label: 'Notes' },
        { id: 'cs-app-mix', label: 'Call & Guidance' },
        { id: 'cs-developer', label: 'Proposed platform flows' },
        { id: 'cs-reflection', label: 'Reflection' },
      ]

  const handleViewModeChange = (nextMode: CaseStudyViewMode) => {
    if (nextMode === viewMode) return
    setViewMode(nextMode)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const targetId = location.hash.replace('#', '')
    if (!targetId) return

    if (!['cs-summary', 'cs-vision', 'cs-store-flow'].includes(targetId)) {
      setViewMode('full')
    }

    return settleAnchor(targetId)
  }, [location.hash])

  return (
    <>
      <Helmet>
        <title>Mentra MiniApp Store &middot; Parth Pawar</title>
        <meta name="description" content="Designing an app ecosystem for smart glasses. Voice-first discovery, captions, translation, notes, Mentra AI, and the platform surfaces that turn hardware into a real product." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Mentra MiniApp Store &middot; Parth Pawar" />
        <meta property="og:description" content="An app ecosystem for smart glasses. Voice-first discovery, developer SDK, and the product patterns behind captions, translation, notes, and Mentra AI." />
        <meta property="og:image" content="https://designwhich.works/Assets/mockups/projects/mentra-miniapps_16x9.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--mentra-miniapps" style={{ '--project-color': '#A78BFA' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="ai"
          backLabel="Back to Work"
          tags={['Product Design', 'AI Wearables', 'Platform Design', 'Developer Experience']}
          title="Mentra MiniApp Store"
          subtitle="App discovery, installation, and permissions for a voice-first smart-glasses platform."
          info={[
            { label: 'Role', value: 'Head of UI/UX (sole designer)' },
            { label: 'Timeline', value: 'Q4 2025 - Q1 2026' },
            { label: 'Platform', value: 'MentraOS + Companion App + Web Portal' },
            { label: 'Focus', value: 'Store, permissions, developer handoff' },
          ]}
          showHeaderSummary={false}
          heroImage="/Assets/mockups/projects/mentra-miniapps_16x9.webp"
          heroAlt="Mentra MiniApp Store 16:9 project cover showing the smart glasses app ecosystem"
        />

        <ProjectQuickSummary
          slug="mentra-miniapps"
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          variant="open"
          label=""
          title="Project overview"
          proofLimit={0}
        />

        <section id="cs-store-flow" className="cs-section reveal" aria-label="Original MiniApp Store flow">
          <div className="wrap">
            <CsScreenStrip format="portrait" label="Discover, configure, run" screens={[
              { src: '/Assets/Projects/mentra-miniapps/figma/store-discovery.png', label: 'Discover apps', decision: { question: 'How does someone choose an app?', choice: 'Put search and app collections on the phone.', evidence: 'Inspect search, featured content, and editor choices before the app detail.' }, alt: 'Original Figma Mentra Store screen with search, featured app, must-have apps and editor choices' },
              { src: '/Assets/Projects/mentra-miniapps/figma/store-detail.png', label: 'Inspect Live Captions', decision: { question: 'Where can reading preferences be set?', choice: 'Keep language, line width, line count, and speed beside the app description.', evidence: 'Locate the settings below Get; these are phone controls, not a glasses screenshot.' }, alt: 'Original Figma Live Captions detail screen with Get action, language, line width and speed settings' },
              { src: '/Assets/Projects/mentra-miniapps/figma/store-installed.png', label: 'Manage a running app', decision: { question: 'How does running differ from installed?', choice: 'Expose Stop separately from Uninstall.', evidence: 'Compare the two actions here with Get in the preceding screen.' }, alt: 'Original Figma Live Captions running state with Stop and Uninstall actions' },
            ]} />
            <p className="cs-caption">Original companion-app designs from Figma: Store → Live Captions → running state. These are source screens, not a live installation.</p>
          </div>
        </section>

        <CsSection id="cs-vision" label="Two surfaces" title="A quick choice on glasses; detail on the phone">
          <CsBody><p>The companion phone handles discovery, configuration, and longer reading. The original Store screens above make those tasks inspectable; the glasses surfaces below show a different scale of output. Sensor permissions and developer submission remain proposals, described separately.</p></CsBody>
        </CsSection>

        {/* The Constraint */}
        <CsExpandPreview
          expanded={viewMode === 'full'}
          onExpand={() => setViewMode('full')}
          cta="Reveal the MiniApp platform story"
          note="Original Notes, Call, Guidance, and glasses screens; proposed platform flows remain separate."
        >
        {/* Discovery */}
        <span id="cs-constraint" className="project-decision-alias" />
        <CsSection id="cs-discovery" label="02 · Mentra Notes" title="From a conversation to a saved note">
          <CsBody><p>Keep a session identifiable as it moves from live transcript to saved notes. Select a source screen to inspect the decision; conversation content is supplied design data.</p></CsBody>
        </CsSection>
        <section className="cs-section mentra-miniapps-system reveal" aria-label="Original Mentra Notes screens">
          <div className="wrap"><CsScreenExplorer screens={[miniAppExamples[1], miniAppExamples[2], miniAppExamples[0]]} label="Choose a Mentra Notes view" /></div>
        </section>

        <CsSection id="cs-app-mix" label="03 · Other MiniApps" title="Different tasks need different starting points">
          <CsBody><p>Mentra Call starts with joining or creating a Teams meeting and checking the connected glasses. Guidance starts with selecting a destination. Each screen gives its primary task more space than shared platform controls.</p></CsBody>
        </CsSection>
        <section className="cs-section mentra-miniapps-system reveal" aria-label="Original Call and Guidance screens">
          <div className="wrap"><CsScreenExplorer screens={miniAppExamples.slice(3)} label="Choose Call or Guidance" /></div>
        </section>

        <CsSection id="cs-developer" label="Proposals" title="What still needs an end-to-end demonstration">
          <span id="cs-permissions" className="project-decision-alias" />
          <CsBody><p>Developer submission and sensor permissions are platform proposals. They are not demonstrated by the user-facing screens above.</p></CsBody>
          <details className="mentra-source-archive">
            <summary>Read the proposed submission and permission rules</summary>
            <p>Submission would collect compatibility, app metadata, and a plain-language sensor declaration before review. Permissions would be declared individually, indicated during use, and revocable from companion controls.</p>
            <p>Camera, microphone, location, and display access need defined denied and revoked states. A developer-portal recording and a complete permission/recovery task are needed to demonstrate that behavior.</p>
          </details>
        </CsSection>

        {/* OS screens */}
        <section className="cs-section mentra-miniapps-os reveal">
          <div className="wrap">
            <div className="mentra-miniapps-os__grid">
              <figure className="mentra-miniapps-os__shot">
                <img {...projectImageProps("/Assets/images/mentra/os-running-apps.png")} data-project-preview src="/Assets/images/mentra/os-running-apps.png" alt="MentraOS currently running MiniApps" loading="lazy" decoding="async" />
                <figcaption>Running apps made the platform legible without forcing a phone-style app switcher.</figcaption>
              </figure>
              <figure className="mentra-miniapps-os__shot">
                <img {...projectImageProps("/Assets/images/mentra/os-home.png")} data-project-preview src="/Assets/images/mentra/os-home.png" alt="MentraOS home screen with active app" loading="lazy" decoding="async" />
                <figcaption>The home surface had to show breadth while still feeling glanceable.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <span id="cs-impact" className="project-decision-alias" />
        <CsSection id="cs-reflection" label="Next questions" title="Test the transitions between apps">
          <CsBody><p>Test a complete installation through active use and revocation: can someone identify the listening app, recover from denied access, and return to the task? The source screens alone do not establish task-completion, adoption, or retention results.</p></CsBody>
        </CsSection>

        <CsThanks />

        </CsExpandPreview>

        <BottomNav sections={sections} />

      </main>

      <NextProject slug="zentipay" title="ZentiPay" image="/Assets/mockups/projects/zentipay_16x9.webp" />
      <Footer />
    </>
  )
}
import { settleAnchor } from '../../utils/settleAnchor'
