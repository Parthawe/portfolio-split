import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import DecisionNote from '../../components/case-study/DecisionNote'
import '../../components/case-study/service-decisions.css'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import ProjectQuickSummary from '../../components/case-study/ProjectQuickSummary'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsCredits from '../../components/case-study/CsCredits'
import CsFlowDiagram from '../../components/case-study/CsFlowDiagram'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function ClawedChatPage() {
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary')
  const storySections = [
    {id:'cs-webhub',label:'Original screens'},
    {id:'cs-safety',label:'Approval proposal'},
    {id:'cs-glasses',label:'Glasses proposal'},
    {id:'cs-impact',label:'Evidence limits'},
  ]
  const sections = [{id:'cs-summary',label:'Overview'},...(viewMode === 'full' ? storySections : [])]

  const handleViewModeChange = (nextMode: 'summary' | 'full') => {
    if (nextMode === viewMode) return
    setViewMode(nextMode)
  }

  return (
    <>
      <Helmet>
        <title>Clawed &middot; Parth Pawar</title>
        <meta name="description" content="Clawed.chat, Original Clawed deployment and documentation screens, with separately labelled approval and smart-glasses design proposals." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Clawed · Parth Pawar" />
        <meta property="og:description" content="Clawed product presentation, deployment choices and approval proposals." />
        <meta property="og:image" content="https://designwhich.works/Assets/mockups/projects/clawed-chat_1x1.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--clawed" style={{
        // Clawed logo reds (sampled from claw-3d.png): accent, outer
        // gradient family, and hero blob all follow the brand.
        '--project-color': '#CE303A',
        '--case-outer-1': '#1a0708',
        '--case-outer-2': '#3a0d12',
        '--case-outer-3': '#38141a',
        '--case-outer-glow-a': 'rgba(206, 48, 58, 0.30)',
        '--case-outer-glow-b': 'rgba(157, 4, 13, 0.34)',
        '--case-hero-orb-b': 'rgba(226, 140, 146, 0.24)',
        '--case-hero-blob-a': 'rgba(226, 96, 104, 0.30)',
        '--case-hero-blob-b': 'rgba(122, 8, 16, 0.34)',
        '--case-hero-blob-c': 'rgba(236, 168, 171, 0.22)',
        '--case-hero-blob-glow': 'rgba(244, 214, 216, 0.28)',
      } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="ai"
          backLabel="Back to Work"
          tags={['AI Assistant', 'Smart Glasses', 'Product Design', 'Full-stack Design']}
          title="Clawed"
          subtitle="Help someone choose where an assistant runs, then make proposed actions reviewable."
          info={[
            { label: 'Role', value: 'Product Designer (sole designer + 3 engineers)' },
            { label: 'Timeline', value: 'Jan \u2013 Mar 2026 (~10 weeks)' },
            { label: 'Evidence', value: 'Original website and documentation captures' },
            { label: 'Platform', value: 'Web + Smart Glasses (via Mentra integration)' },
          ]}
          liveUrl="https://clawed.chat" liveLabel="Product website"
          heroImage="/Assets/Projects/Clawed.chat/landing-hero.webp"
          heroAlt="Clawed.chat landing page: Your AI agent, live in 30 seconds"
          showHeaderSummary={false}
        />

        <ProjectQuickSummary
          slug="clawed-chat"
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        <CsExpandPreview expanded={viewMode === 'full'} onExpand={() => setViewMode('full')} sectionIds={['cs-context','cs-research','cs-challenges','cs-website','cs-learnings','cs-whats-next']}>
          <CsSection id="cs-webhub" label="01 · Original screens" title="Start with the deployment decision">
            <span id="cs-context" className="project-decision-alias" />
            <span id="cs-research" className="project-decision-alias" />
            <span id="cs-challenges" className="project-decision-alias" />
            <CsBody><p>The original website and documentation show hosting and setup choices. The approval and glasses handoff described below remain proposals.</p></CsBody>
            <CsScreenExplorer format="landscape" label="Inspect original Clawed screens" screens={[
              {title:'Choose where it runs',label:'Original deployment comparison',src:'/Assets/Projects/Clawed.chat/deploy-options.webp',alt:'Original Clawed deployment screen comparing Cloud Deploy with Mac Companion',caption:'Original website · Cloud Deploy and Mac Companion are alternatives.',decision:{question:'Does the person want hosted setup or control of their own hardware?',choice:'Place cloud and local options beside each other before setup.',evidence:'Cloud Deploy and Mac Companion each have a separate entry point.',limit:'Security and launch-time claims in the capture are source marketing claims, not verified results.'}},
              {title:'Follow the relevant setup guide',label:'Original documentation',src:'/Assets/Projects/Clawed.chat/docs-page.webp',alt:'Original Clawed documentation listing Cloud VM Deploy, Mac Companion, Self Hosted and smart-glasses setup',caption:'Original documentation hub.',decision:{question:'How can someone find the next step after choosing a host?',choice:'Group deployment guides separately from glasses setup.',evidence:'The sidebar lists Cloud VM Deploy, Mac Companion and Self Hosted as distinct guides. Search is explicitly marked coming soon.',limit:'The capture documents information architecture, not successful installation or live glasses pairing.'}},
              {title:'Make the entry point explicit',label:'Original launch page',src:'/Assets/Projects/Clawed.chat/landing-hero.webp',alt:'Original Clawed launch page with product positioning and a deployment entry point',caption:'Original marketing introduction.',decision:{question:'What should a first-time visitor do next?',choice:'Lead with the assistant proposition and deployment entry point.',evidence:'The headline and primary action direct a visitor toward setup.',limit:'The advertised launch time is not a measured benchmark.'}},
            ]} />
            <span id="cs-website" className="project-decision-alias" />
            <p className="cs-caption"><a className="cs-text-link" href="/Assets/Projects/website-screenshot/screencapture-clawed-chat-2026-03-25-13_35_05.webp" target="_blank" rel="noreferrer">Inspect the complete March 25, 2026 website capture</a>. <a className="cs-text-link" href="https://clawed.chat" target="_blank" rel="noreferrer">Product website</a> (current availability unverified).</p>
          </CsSection>
          <CsSection id="cs-safety" label="02 · Interaction proposal" title="Review the change before it leaves the assistant">
            <CsBody><p>The proposed approval model separates reading information, preparing a draft and authorizing an external action. This flow is a design proposal; the recovered screens do not demonstrate implemented permissions or action receipts.</p></CsBody>
            <CsFlowDiagram title="Proposed review flow" nodes={[
              {label:'Request',desc:'A person asks for help'},
              {label:'Draft',desc:'Assistant prepares a proposed action'},
              {label:'Review',desc:'Inspect destination, content and effect',accent:true},
              {label:'Confirm or cancel',desc:'The person decides whether to proceed'},
              {label:'Result record',desc:'Show success or failure and what changed'},
            ]} />
            <DecisionNote decision={{question:'What does someone need before authorizing a change?',choice:'Make the proposed effect and destination visible, with an edit or cancel path.',evidence:'The proposed sequence keeps preparation, authorization and the result separate.',limit:'Permission enforcement, recovery and receipt storage require a recorded product task and implementation evidence.'}} />
          </CsSection>
          <CsSection id="cs-glasses" label="03 · Glasses proposal" title="Keep the glance brief; keep review available">
            <CsBody><p>The glasses concept uses a short summary and one next action. Longer content and approval details belong in the web hub. A timed dismissal would need testing before adoption: a person should not lose an unfinished decision while moving between devices.</p></CsBody>
            <DecisionNote decision={{question:'Which part of an assistant task belongs in a small peripheral display?',choice:'Show a compact response and offer a handoff for detailed review.',evidence:'The documentation includes glasses setup. The glanceable cards and cross-device approval behavior remain proposals.',limit:'No recovered recording establishes legibility, handoff reliability or completion time on glasses.'}} />
          </CsSection>
          <CsSection id="cs-impact" label="04 · Scope and evaluation" title="What can be checked next">
            <span id="cs-learnings" className="project-decision-alias" />
            <span id="cs-whats-next" className="project-decision-alias" />
            <CsBody><p>The source captures establish the launch story and setup organization. To evaluate the approval proposal, record a task where someone spots a wrong destination, edits a draft, cancels an action and recovers from failure. Test the glasses-to-web handoff separately.</p><p>No participant-level observations, measured latency, completion rates or adoption records are available in this archive.</p></CsBody>
            <CsCredits credits={[{role:'Product designer',name:'Parth Pawar'},{role:'Team',name:'One designer and three engineers'},{role:'Scope',name:'Launch site, web hub and glasses interaction proposals'}]} />
          </CsSection>
          <CsThanks contactCta />
        </CsExpandPreview>

        <BottomNav
          sections={sections}
          modeAction={{
            label: viewMode === 'summary' ? 'Full case study' : '2 min summary',
            onClick: () => handleViewModeChange(viewMode === 'summary' ? 'full' : 'summary'),
          }}
        />

      </main>

      <NextProject slug="raahi-project" title="Raahi" image="/Assets/images/raahi.jpg" />
      <Footer />
    </>
  )
}
