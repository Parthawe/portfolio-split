import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsFeatureGrid from '../../components/case-study/CsFeatureGrid'
import CsCredits from '../../components/case-study/CsCredits'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

const BALLAH_SITE = '/Assets/Projects/BallahCode/site'

const siteScreens = [
  {
    src: `${BALLAH_SITE}/ballah-home-hero.png`,
    alt: 'Ballah Code landing page hero with the headline about AI tools forgetting context.',
    caption: 'Launch page hero: lead with the pain, then show the product.',
  },
  {
    src: `${BALLAH_SITE}/ballah-product-window.png`,
    alt: 'Ballah Code product window showing an architect agent completing a validation task.',
    caption: 'Product window from the launch site: compare the agent status with the files and terminal output. These are the surfaces a developer needs to inspect before accepting work.',
  },
  {
    src: `${BALLAH_SITE}/ballah-problem.png`,
    alt: 'Ballah Code problem section explaining one branch, one chat, one thing at a time.',
    caption: 'Launch-site problem framing: keeping separate tasks and their context organized.',
  },
  {
    src: `${BALLAH_SITE}/ballah-delegation.png`,
    alt: 'Ballah Code section explaining delegation with a workspace card.',
    caption: 'The original launch page presents a separate workspace for delegated tasks.',
  },
  {
    src: `${BALLAH_SITE}/ballah-flow.png`,
    alt: 'Ballah Code three step parallel flow section: describe, delegate, ship.',
    caption: 'How it works: a short three-step model instead of a dense feature tour.',
  },
  {
    src: `${BALLAH_SITE}/ballah-pillars.png`,
    alt: 'Ballah Code core pillars section showing context memory and independent delegation.',
    caption: 'Pillars: remember context, delegate independently, stay in flow.',
  },
  {
    src: `${BALLAH_SITE}/ballah-comparison.png`,
    alt: 'Ballah Code comparison table against Cursor and Windsurf.',
    caption: 'Archived launch-site comparison. This records the positioning at the time; it is not a current independent comparison of competing products.',
  },
  {
    src: `${BALLAH_SITE}/ballah-tools.png`,
    alt: 'Ballah Code developer tools page with cards for token counter, model comparison, and formatters.',
    caption: 'Utility surface: free tools that support the developer audience.',
  },
]

const shotStyle: React.CSSProperties = {
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  width: '100%',
  height: 'auto',
  display: 'block',
}

export default function BallahCodePage() {
  return (
    <>
      <Helmet>
        <title>Ballah Code &middot; Parth Pawar</title>
        <meta name="description" content="Ballah Code, AI-native desktop IDE where the AI works as a senior engineer, not a chatbot. Product design case study by Parth Pawar." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Ballah Code &middot; Parth Pawar" />
        <meta property="og:description" content="AI-native desktop IDE where the AI works as a senior engineer, not a chatbot." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/ballah-code.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--ballah-code" style={{ '--project-color': '#6A4FC0' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="ai"
          backLabel="Back to Work"
          tags={['Dev Tools', 'AI']}
          title="Ballah Code"
          subtitle="A desktop coding environment that keeps AI assistance, project context, and developer controls together."
          info={[
            { label: 'Role', value: 'Product Designer' },
            { label: 'Creator', value: 'Isaiah Ballah' },
            { label: 'Timeline', value: '2026' },
            { label: 'Type', value: 'Dev Tools \u00b7 AI' },
          ]}
          heroImage="/Assets/mockups/projects/ballah-code_16x9.webp"
          heroAlt="Ballah Code cover showing the AI-native desktop IDE launch hero"
        />

        {/* 01, Overview */}
        <CsSection id="cs-overview" label="01 &mdash; Overview" title="AI assistance inside the coding workflow">
          <CsBody>
            <p>Ballah Code is a native desktop development environment that treats AI as a senior engineering partner, not a disposable chatbot. The product centers context, explicit tools, reviewable actions, and decision records so developers stay in control.</p>
          </CsBody>

          <div className="cs-slide ballah-wide-shot reveal">
            <img data-project-preview src={siteScreens[0].src} alt={siteScreens[0].alt} loading="lazy" decoding="async" style={shotStyle} />
          </div>
          <p className="cs-caption">{siteScreens[0].caption}</p>
        </CsSection>

        <CsExpandPreview
          ctaLabel="Open the full product breakdown"
          note="Problem framing, product screenshots, architecture, feature tour, status, and credits."
        >

        {/* 02, The Problem */}
        <CsSection id="cs-problem" label="02 &mdash; The Problem" title="Keeping context across a task">
          <CsBody>
            <p>The brief focuses on continuity across a coding task: keeping workspace history, inspecting tool activity, and returning to the reason behind a change. Persistent documents and structured delegation form the next product layer.</p>
          </CsBody>
          <div className="cs-img-grid ballah-wide-grid reveal">
            {[siteScreens[2], siteScreens[6]].map((screen) => (
              <figure className="cs-img-tile" key={screen.src}>
                <img data-project-preview src={screen.src} alt={screen.alt} loading="lazy" decoding="async" style={shotStyle} />
                <figcaption>{screen.caption}</figcaption>
              </figure>
            ))}
          </div>
        </CsSection>

        {/* 03, Design Decisions */}
        <CsSection id="cs-decisions" label="03 &mdash; Design Decisions" title="Editor, assistant, and terminal together">
          <CsBody>
            <p>The UI centers on a multi-workspace, multi-chat layout &mdash; file explorer with git awareness on the left, chat tabs in the center, and an integrated terminal at the bottom. The arrangement keeps files and command output within reach of the conversation, so a developer can inspect the work without leaving the workspace.</p>
          </CsBody>
          <div className="cs-slide ballah-wide-shot reveal">
            <img data-project-preview src={siteScreens[1].src} alt={siteScreens[1].alt} loading="lazy" decoding="async" style={shotStyle} />
          </div>
          <p className="cs-caption">{siteScreens[1].caption}</p>
        </CsSection>

        {/* 04, Technical Architecture */}
        <CsSection id="cs-architecture" label="04 &mdash; Technical Architecture" title="Desktop architecture">
          <CsBody>
            <p>Under the hood is a Bun backend for AI calls, file operations, and tools, connected to a React frontend in a native WebKit webview via typed RPC.</p>
            <p>The product model supports tool-based AI actions, streaming responses, long-context workflows, workspace switching, and an inspectable handoff between human and agent work.</p>
          </CsBody>
        </CsSection>

        {/* 05, Key Features */}
        <CsSection id="cs-features" label="05 &mdash; Key Features" title="The implemented workflow">
          <CsFeatureGrid features={[
            { title: 'Multi-Workspace, Multi-Chat', desc: 'Persistent history across workspaces and chat sessions. Switch between projects without losing context or conversation state.' },
            { title: 'Integrated Terminal', desc: 'PTY session management with full terminal emulation. The AI can execute commands, and you can see everything it does in real time.' },
            { title: 'Cost Tracking & Model Flexibility', desc: 'Real-time progress indicators and cost tracking per conversation. Switch between Claude, Gemini, and OpenAI on a per-chat basis.' },
          ]} />
          <div className="cs-img-grid ballah-wide-grid ballah-wide-grid--features reveal">
            {[siteScreens[3], siteScreens[4], siteScreens[5]].map((screen) => (
              <figure className="cs-img-tile" key={screen.src}>
                <img data-project-preview src={screen.src} alt={screen.alt} loading="lazy" decoding="async" style={shotStyle} />
                <figcaption>{screen.caption}</figcaption>
              </figure>
            ))}
          </div>
        </CsSection>

        {/* 06, Results & Status */}
        <CsSection id="cs-results" label="06 &mdash; Results &amp; Status" title="Current build and remaining work">
          <CsBody>
            <p>The core desktop experience is functional: multi-workspace UI, terminal integration, streaming agent loop, tool execution, settings persistence, and an evaluation harness. Living documents, architect/worker delegation, and a decision ledger remain the next product layer.</p>
          </CsBody>

          <CsFeatureGrid features={[
            { title: 'Working core', desc: 'Multi-workspace UI, terminal integration, streaming agent loop, settings persistence, and evaluation harness.' },
            { title: 'On the Roadmap', desc: 'Living documents, architect/worker delegation, decision ledger, and expanded benchmark coverage.' },
          ]} />
          <div className="cs-slide ballah-wide-shot reveal">
            <img data-project-preview src={siteScreens[7].src} alt={siteScreens[7].alt} loading="lazy" decoding="async" style={shotStyle} />
          </div>
          <p className="cs-caption">{siteScreens[7].caption}</p>
        </CsSection>

        {/* Credits */}
        <section className="cs-section reveal">
          <div className="wrap">
            <span className="cs-section-label">Credits</span>
            <h2 className="cs-section-title">Team</h2>
            <CsCredits credits={[
              { role: 'Creator & Founder', name: 'Isaiah Ballah' },
              { role: 'Product Designer', name: 'Parth Pawar' },
              { role: 'Tools', name: 'Electrobun, Bun, React, TypeScript, Anthropic Claude, Tailwind CSS' },
              { role: 'Platform', name: 'Desktop (macOS)' },
            ]} />
          </div>
        </section>

        {/* Thanks */}
        <CsThanks />
        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-overview', label: 'Overview' },
          { id: 'cs-problem', label: 'The Problem' },
          { id: 'cs-decisions', label: 'Design Decisions' },
          { id: 'cs-architecture', label: 'Architecture' },
          { id: 'cs-features', label: 'Key Features' },
          { id: 'cs-results', label: 'Results & Status' },
        ]} />

      </main>

      <NextProject slug="vj-software" title="VJ Parivar" image="/Assets/mockups/projects/vj-software_16x9.webp" />
      <Footer />
    </>
  )
}
