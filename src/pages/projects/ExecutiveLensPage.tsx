import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsThanks from '../../components/case-study/CsThanks'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'
import MeetingTimeline from '../../components/MeetingTimeline'

export default function ExecutiveLensPage() {
  return <>
    <Helmet>
      <title>ExecutiveLens · Parth Pawar</title>
      <meta name="description" content="ExecutiveLens design decisions: connect meeting context to inspectable summaries, decision owners, and controlled follow-up. Original website evidence and a prepared citation demo." />
      <meta property="og:type" content="article" />
      <meta property="og:title" content="ExecutiveLens · Parth Pawar" />
      <meta property="og:description" content="Original product presentation and a prepared, source-linked meeting review demonstration." />
      <meta property="og:image" content="https://designwhich.works/Assets/images/executivelens.webp" />
    </Helmet>
    <Nav />
    <main id="main-content" className="project-main project-main--executivelens" style={{ '--project-color': '#9C8E6E' } as React.CSSProperties}>
      <ProjectHeader backLink="/work" categorySlug="ai" backLabel="Back to Work"
        tags={['AI', 'Product Design', 'Meeting Intelligence']}
        title="ExecutiveLens" subtitle="Make a meeting decision traceable before someone acts on it."
        showHeaderSummary={false}
        info={[
          { label: 'Role', value: 'Design lead' },
          { label: 'Timeline', value: '2025–26' },
          { label: 'Team', value: 'Product, AI, engineering' },
          { label: 'Platform', value: 'Web + Mobile' },
        ]}
        heroImage="/Assets/mockups/projects/executivelens_16x9.webp"
        heroAlt="ExecutiveLens project cover for meeting intelligence and decision tracking"
      />
      <CsSection id="cs-context" label="Problem and approach" title="A summary needs a source and a next step">
        <span id="cs-vision" className="project-decision-alias" />
        <CsBody><p>Meeting notes can name an action without making its context or ownership clear. My design work connects the spoken moment, the decision, the person responsible, and the boundary before an external action.</p></CsBody>
      </CsSection>
      <CsSection id="cs-website" label="Original evidence" title="Two decisions in the product presentation">
        <span id="cs-challenges" className="project-decision-alias" />
        <span id="cs-meeting" className="project-decision-alias" />
        <CsScreenExplorer format="landscape" label="Inspect original ExecutiveLens site evidence" screens={[
          {
            title: 'Keep capture connected to context', label: 'Original workflow section',
            src: '/Assets/images/executivelens/site-crops/executivelens-site-workflow.png',
            alt: 'Original ExecutiveLens website workflow showing glasses audio capture beside a transcript and Capture, Understand, Ship stages',
            caption: 'Original website capture · March 25, 2026.',
            decision: {
              question: 'How does a spoken moment become something a person can review?',
              choice: 'Present capture, interpretation, and the resulting action as connected stages.',
              evidence: 'The glasses and timestamped transcript sit beside Capture → Understand → Ship.',
              limit: 'This is product-presentation evidence. It does not demonstrate operational transcription or AI accuracy.',
            },
          },
          {
            title: 'Separate notes from permission to act', label: 'Original capabilities and control',
            src: '/Assets/images/executivelens/site-crops/executivelens-site-capabilities.png',
            alt: 'Original ExecutiveLens capability cards for live capture, intelligence, notes, and agents with explicit approval for external sending or publishing',
            caption: 'Original website capture · March 25, 2026.',
            decision: {
              question: 'Does an automatically drafted note authorize an external action?',
              choice: 'Distinguish creating a draft from approving sending or publishing.',
              evidence: 'Compare Self-building Notes with Agents & Control, which explicitly requires approval for external actions.',
              limit: 'The source describes the intended permission boundary; a recorded task is needed to verify its implementation.',
            },
          },
        ]} />
        <p className="cs-caption"><a className="cs-text-link" href="/Assets/Projects/website-screenshot/screencapture-executivelens-ai-2026-03-25-13_34_30.webp" target="_blank" rel="noreferrer">Inspect the complete original website capture</a>. <a className="cs-text-link" href="https://www.executivelens.ai" target="_blank" rel="noreferrer">Product website</a> (current availability unverified).</p>
      </CsSection>
      <CsExpandPreview cta="Trace a decision to its source" note="A prepared meeting replay makes the citation and ownership decisions testable. It does not record meetings or run live AI.">
        <CsSection id="cs-demo" label="Prepared interaction" title="Check the source before following up">
          <span id="cs-dashboard" className="project-decision-alias" />
          <span id="cs-insights" className="project-decision-alias" />
          <CsBody><p>Show the complete meeting, then check the proposed date, approval and owner. The open question remains unresolved rather than being turned into an invented decision.</p></CsBody>
          <div className="project-content-block"><MeetingTimeline /></div>
        </CsSection>
        <CsSection id="cs-impact" label="Scope and evaluation" title="What the evidence establishes">
          <span id="cs-reflections" className="project-decision-alias" />
          <CsBody>
            <p>The original website documents the product direction. The prepared replay demonstrates citation navigation and ownership review with sample content. Neither establishes time saved, live inference, or adoption.</p>
            <p>A useful next evaluation would ask someone to verify an action’s source, identify its owner, and distinguish a draft from permission to send. Dated beta observations and a recorded product task are still needed.</p>
          </CsBody>
        </CsSection>
        <CsThanks contactCta />
      </CsExpandPreview>
      <BottomNav sections={[
        { id: 'cs-context', label: 'Problem' },
        { id: 'cs-website', label: 'Original screens' },
        { id: 'cs-demo', label: 'Citation demo' },
        { id: 'cs-impact', label: 'Evidence limits' },
      ]} />
    </main>
    <NextProject slug="ballah-code" title="Ballah Code" image="/Assets/mockups/projects/ballah-code_16x9.webp" />
    <Footer />
  </>
}
