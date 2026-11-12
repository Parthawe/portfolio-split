import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from "../../components/case-study/CsExpandPreview"
import ProjectOverview from '../../components/case-study/ProjectOverview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsFeatureGrid from '../../components/case-study/CsFeatureGrid'
import CsSteps from '../../components/case-study/CsSteps'
import CsImage from '../../components/case-study/CsImage'
import CsInfoGrid from '../../components/case-study/CsInfoGrid'
import CsCredits from '../../components/case-study/CsCredits'
import CsNumList from '../../components/case-study/CsNumList'
import CsProcessFlow from '../../components/case-study/CsProcessFlow'
import CsArchDiagram from '../../components/case-study/CsArchDiagram'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function OnCallLensPage() {
  return (
    <>
      <Helmet>
        <title>OnCall Lens &middot; Parth Pawar</title>
        <meta name="description" content="OnCall Lens routes Sentry alerts to an AI fix pipeline and lets engineers approve the resulting PR from smart glasses. Built at Daytona HackSprint SF in January 2026." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="OnCall Lens · Parth Pawar" />
        <meta property="og:description" content="Sentry alerts routed to an AI fix pipeline, with PR approval from smart glasses." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/oncall-lens.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#4477CE' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="ai"
          backLabel="Back to Work"
          tags={['AI', 'Developer Tools', 'Hackathon', 'Smart Glasses']}
          title="OnCall Lens"
          subtitle="Routing Sentry alerts to automated PR patches via smart glasses, so on-call engineers can approve production fixes without opening a laptop"
          info={[
            { label: 'Role', value: 'Product Designer + Developer' },
            { label: 'Timeline', value: 'Jan 24, 2026 (24hrs)' },
            { label: 'Team', value: 'Team SOGA' },
            { label: 'Platform', value: 'MentraOS Glasses + Web' },
          ]}
          heroImage="/Assets/images/oncall-lens/hero.webp"
          heroAlt="Pager Lens, Stay present. Handle incidents anywhere."
        />

        <ProjectOverview
          id="cs-vision"
          sections={[
            {
              label: 'The Vision',
              content: 'On-call engineering is a brutal reality of modern software. An alert fires at 3am, you fumble for your laptop, spend twenty minutes finding the right repo, and another forty minutes understanding a stack trace someone else wrote. OnCall Lens eliminates that entire sequence. Sentry detects the error, your smart glasses show the alert, you tap \u201cFix,\u201d and a Claude-powered agent spins up a Daytona workspace, writes a patch, gets it reviewed by CodeRabbit, and opens a PR \u2014 all before you finish your coffee.',
            },
            {
              label: 'My Role',
              content: 'As Product Designer and Developer, I designed the glasses notification UX, the incident response flow, and the Mentra mini-app interface that runs on the glasses. I also helped build the frontend that ties the smart glasses server to the backend orchestrator. In a 24-hour hackathon, the line between designer and developer does not exist \u2014 you design in code and ship in real time.',
            },
          ]}
        />

        <CsExpandPreview>
        <CsSection id="cs-context" label="Context" title="On-Call Is Broken">
          <CsBody>
                <p>Every on-call engineer knows the feeling: an alert arrives at the worst possible time, and the first minutes are spent rebuilding context. OnCall Lens asks what happens if triage, AI patching, and approval can start from a glance.</p>
            <p>The tools have improved. Sentry surfaces rich stack traces, PagerDuty routes alerts intelligently, Slack threads keep context. But the fundamental loop has not changed: a human gets woken up, opens a computer, reads a wall of text, and manually writes a patch. The human is the bottleneck at every step.</p>
          </CsBody>
          <CsImage src="/Assets/images/oncall-lens/glasses-detail.png" alt="Close-up of smart glasses lens used for OnCall Lens" />
        </CsSection>

        <CsSection id="cs-bet" label="The Bet" title="What If the First Responder Was an AI Agent?">
          <CsBody>
            <p>The thesis behind OnCall Lens is a simple inversion: instead of paging a human to debug and fix, page an AI agent to debug and fix &mdash; and page the human only to approve. The engineer becomes the decision-maker, not the debugger. They glance at their glasses, see a one-line summary of the error and the proposed fix, and tap &ldquo;Approve&rdquo; or &ldquo;Reject.&rdquo; That is the entire interaction.</p>
            <p>This is not about replacing engineers. It is about respecting their time and sleep. The AI agent does the mechanical work &mdash; reading stack traces, finding the relevant code, writing a patch, running tests. The human does what humans are best at: deciding whether this fix is correct and whether it should ship.</p>
            <p>Smart glasses are the perfect interface for this. You do not need a laptop to approve a PR. You need three seconds of attention and a single tap.</p>
          </CsBody>
        </CsSection>

        <CsProcessFlow
          title="Hackathon Design Sprint"
          steps={[
            { label: 'Whiteboard', desc: 'First 2 hours: mapped the entire incident response flow on a whiteboard. Identified the core interaction: alert → glance → tap → fixed.' },
            { label: 'Figma', desc: 'Hours 2–5: designed all glasses notification cards, the mini-app views, and the web dashboard in Figma. Three screens, three states each.' },
            { label: 'Build', desc: 'Hours 5–22: switched to code. Built the Mentra mini-app frontend, the backend orchestrator, and wired up Sentry, Claude, Daytona, and CodeRabbit.' },
            { label: 'Demo', desc: 'Hour 23–24: working demo at Sentry HQ. Real Sentry alert → real Claude fix → real PR → approved from smart glasses.' },
          ]}
        />

        <CsSection id="cs-challenges" label="Design Challenges" title="Three Constraints, Twenty-Four Hours">
          <CsBody>
            <p>Building OnCall Lens at a hackathon meant every design decision had to be made fast and right. There was no time for user research, no room for iteration cycles, and no luxury of polishing what did not work. These were the three constraints that shaped every choice.</p>
          </CsBody>
          <CsFeatureGrid features={[
            { title: '3-Second Notification', desc: 'A Sentry alert on glasses needs to be understood in three seconds or less. No scrolling, no detail views, no multi-step flows. I had to compress a stack trace, an error severity, and a service name into a single glanceable card that an engineer could triage without removing their glasses or reaching for a phone.' },
            { title: 'Human-in-the-Loop Trust', desc: 'An AI agent writing code and opening PRs on production repos is a trust problem. Engineers will not approve a fix they do not understand. The challenge was designing a review surface on a glasses display that conveys enough information to make an informed decision without overwhelming a 3am brain.' },
            { title: 'Transparent AI Debugging', desc: 'When Claude analyzes a stack trace and proposes a fix, the reasoning needs to be visible. Black-box AI fixes are a non-starter for production code. I designed a step-by-step progress view that shows the agent\u2019s reasoning chain \u2014 what it found, what it changed, and why \u2014 in a format that works on both glasses and the web dashboard.' },
          ]} />
        </CsSection>

        <CsSection id="cs-glasses" label="Glasses UX" title="Alert, Glance, Tap, Fixed">
          <CsBody>
            <p>The glasses notification flow is the heart of OnCall Lens. It is the interface between a production incident and a human decision. Every detail was designed to minimize cognitive load at the moment when cognitive load is highest &mdash; 3am, half asleep, adrenaline spiking from a page.</p>
          </CsBody>
          <CsSteps steps={[
            { num: '1', title: 'Sentry Alert', desc: 'Sentry detects a new error or a spike in an existing one. The webhook fires to the OnCall Lens backend, which parses severity, service name, and a one-line error summary.' },
            { num: '2', title: 'Glasses Card', desc: 'A notification card appears on the on-call engineer\u2019s smart glasses: service name, error type, severity badge, and a single action button. Red for critical, amber for warning. The card auto-dismisses in ten seconds if not engaged.' },
            { num: '3', title: 'Tap to Fix', desc: 'The engineer taps the \u201cFix\u201d button on the glasses frame. This triggers the backend orchestrator to spin up a Daytona workspace, clone the repo, and dispatch the Claude agent to analyze the error and write a patch.' },
            { num: '4', title: 'PR Ready', desc: 'Minutes later, a second card appears on the glasses: \u201cFix ready for review.\u201d The engineer taps to see a diff summary, the CodeRabbit review score, and two buttons \u2014 Approve or Reject. One tap to merge. Done.' },
          ]} />
          <CsBody className="cs-body--space-before">
            <p>The entire flow &mdash; from Sentry alert to merged PR &mdash; can complete without the engineer ever leaving bed. The glasses handle triage and approval. The AI handles everything else.</p>
          </CsBody>
        </CsSection>

        <CsArchDiagram
          title="System Architecture"
          cols={3}
          nodes={[
            { id: 'sentry', label: 'Sentry', desc: 'Detects errors in production and fires webhooks to the OnCall Lens backend with severity, service, and stack trace.', row: 0, col: 1 },
            { id: 'backend', label: 'OnCall Lens Backend', desc: 'Bun + Fastify orchestrator that receives Sentry webhooks, dispatches Claude agents, and manages the fix pipeline.', row: 1, col: 1 },
            { id: 'glasses', label: 'Smart Glasses', desc: 'Mentra mini-app shows alert cards, fix status, and approval interface. One tap to approve or reject.', row: 1, col: 0 },
            { id: 'daytona', label: 'Daytona Workspace', desc: 'Ephemeral dev environment spins up with the correct repo, branch, and dependencies in seconds.', row: 1, col: 2 },
            { id: 'claude', label: 'Claude Agent', desc: 'Reads the error, navigates the codebase, identifies root cause, and writes a patch using structured tool calls.', row: 2, col: 1 },
            { id: 'coderabbit', label: 'CodeRabbit', desc: 'Automated code review checks the patch for correctness, style, and regressions before PR is opened.', row: 2, col: 2 },
            { id: 'github', label: 'GitHub PR', desc: 'Final pull request with clear description, diff, and review summary. Engineer approves from glasses.', row: 2, col: 0 },
          ]}
          connections={[
            { from: 'sentry', to: 'backend', label: 'Webhook' },
            { from: 'backend', to: 'glasses', label: 'Alert notification' },
            { from: 'backend', to: 'daytona', label: 'Spin up workspace' },
            { from: 'daytona', to: 'claude', label: 'Agent dispatched' },
            { from: 'claude', to: 'coderabbit', label: 'Patch review' },
            { from: 'coderabbit', to: 'github', label: 'PR opened' },
            { from: 'github', to: 'glasses', label: 'Approve/Reject' },
          ]}
        />

        <CsSection id="cs-miniapp" label="Mini-App" title="The Mentra Mini-App for Incident Response">
          <CsBody>
            <p>OnCall Lens runs as a Mentra mini-app on the smart glasses, built on the MentraOS design system with three views &mdash; an incident feed ranked by severity, a fix-status progress view, and an approval view with two large tap targets &mdash; each held to the principle that an on-call engineer should never need to read more than two lines of text at a glance.</p>
          </CsBody>
        </CsSection>

        <CsSection id="cs-impact" label="Impact" title="Built in 24 Hours at Sentry HQ">
          <CsBody className="cs-body--space-after">
            <p>OnCall Lens was built from scratch at the Daytona HackSprint #4 in San Francisco, January 24, 2026, hosted at Sentry&rsquo;s headquarters. In twenty-four hours, we went from a whiteboard sketch to a working demo: a real Sentry alert triggering a real Claude agent in a real Daytona workspace, producing a real PR reviewed by CodeRabbit, all controlled from smart glasses.</p>
          </CsBody>
          <CsInfoGrid items={[
            { key: 'Build Time', value: '24 hours' },
            { key: 'Event', value: 'Daytona HackSprint #4' },
            { key: 'Location', value: 'Sentry HQ, SF' },
            { key: 'Backend', value: 'Bun + Fastify' },
            { key: 'AI Agent', value: 'Claude (Anthropic)' },
            { key: 'Demo', value: 'Working incident-to-PR flow' },
          ]} />
        </CsSection>

        <CsSection id="cs-reflections" label="Reflections" title="What Designing for Urgency Taught Me">
          <CsNumList items={[
            <><strong>Urgency compresses design to its essentials.</strong> When the user is an engineer woken up at 3am, every extra word, every unnecessary screen, every ambiguous icon is a failure. Designing for on-call stripped my work down to the absolute minimum viable information: what broke, how bad, what do you want to do about it. That discipline carries into everything I design now.</>,
            <><strong>AI agents need transparent reasoning, not just correct outputs.</strong> Engineers will not trust a black-box fix on a production system. The step-by-step pipeline view &mdash; showing what Claude found, what it changed, and why &mdash; was not a nice-to-have. It was the feature that made the entire product usable. Trust is built through visibility.</>,
            <><strong>Smart glasses are the right interface for interrupt-driven work.</strong> On-call is inherently an interrupt. You are doing something else, and then you are not. A laptop requires context-switching to an entirely different device and mental mode. Glasses let you stay in your current context and handle the interrupt with a glance and a tap. The form factor matches the task.</>,
          ]} />
        </CsSection>

        <CsSection label="Credits" title="Team">
          <CsCredits credits={[
            { role: 'Product Designer + Developer', name: 'Parth Pawar' },
            { role: 'Team', name: 'Team SOGA' },
            { role: 'Event', name: 'Daytona HackSprint #4 at Sentry HQ, SF' },
            { role: 'Stack', name: 'Bun, TypeScript, Fastify, MongoDB, Claude (Haiku + Sonnet), Daytona, CodeRabbit' },
            { role: 'Platform', name: 'MentraOS Smart Glasses, Web Dashboard' },
          ]} />
        </CsSection>

        <CsThanks contactCta />

        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-vision', label: 'Vision & Role' },
          { id: 'cs-context', label: 'Context' },
          { id: 'cs-glasses', label: 'Glasses UX' },
          { id: 'cs-impact', label: 'Impact' },
          { id: 'cs-reflections', label: 'Reflections' },
        ]} />

      </main>

      <NextProject slug="ai-voice" title="AI Voice Interface" image="/Assets/images/nda-cover.svg" />
      <Footer />
    </>
  )
}
