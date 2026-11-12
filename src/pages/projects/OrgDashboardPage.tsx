import DecisionNote from '../../components/case-study/DecisionNote'
import '../../components/case-study/service-decisions.css'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from "../../components/case-study/CsExpandPreview"
import ProjectOverview from '../../components/case-study/ProjectOverview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

function OrgDashboardArtifact() {
  return (
    <div
      className="org-dashboard-artifact"
      role="img"
      aria-label="Illustrative OrgDashboard concept showing proposed knowledge structure and human review; not an active product interface"
    >
      <header className="org-dashboard-artifact__top">
        <strong>OrgDashboard</strong>
        <span>Organization context</span>
        <span>Concept illustration</span>
      </header>

      <div className="org-dashboard-artifact__body">
        <div className="org-dashboard-artifact__nav">
          <strong>Workspace</strong>
          <span className="is-active">Overview</span>
          <span>Knowledge base</span>
          <span>Integrations</span>
          <span>Action queue</span>
        </div>

        <section className="org-dashboard-artifact__content">
          <div className="org-dashboard-artifact__heading">
            <div>
              <span>Shared company brain</span>
              <h3>Context every agent can use.</h3>
            </div>
            <span className="org-dashboard-artifact__status">Proposed connections</span>
          </div>

          <div className="org-dashboard-artifact__columns">
            <section className="org-dashboard-artifact__knowledge">
              <header>
                <strong>Knowledge structure</strong>
                <span>Agent-readable</span>
              </header>
              <dl>
                <div><dt>Projects</dt><dd>Owners, status, decisions</dd></div>
                <div><dt>Team</dt><dd>Roles and working context</dd></div>
                <div><dt>SOPs</dt><dd>Shared operating knowledge</dd></div>
              </dl>
            </section>

            <section className="org-dashboard-artifact__actions">
              <header>
                <strong>Human approval</strong>
                <span>External actions</span>
              </header>
              <div><i /> Context and rationale attached</div>
              <div><i /> Final action stays with a person</div>
            </section>
          </div>
        </section>
      </div>
      <p className="cs-caption">Illustrative reconstruction. Product inactive; original product screens have not been recovered.</p>
    </div>
  )
}

export default function OrgDashboardPage() {
  return (
    <>
      <Helmet>
        <title>OrgDashboard &middot; Parth Pawar</title>
        <meta name="description" content="OrgDashboard concept: shared organizational context and human review of proposed agent actions. Product inactive; illustrative reconstruction." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="OrgDashboard · Parth Pawar" />
        <meta property="og:description" content="A proposed knowledge and review workspace for people and agents." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/org-dashboard.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--org-dashboard" style={{ '--project-color': '#2D3748' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="ux-design"
          backLabel="Back to Work"
          tags={['SaaS', 'AI', 'Product Design', 'B2B']}
          title="OrgDashboard"
          subtitle="A proposed workspace for tracing company context and reviewing an agent’s next action."
          info={[
            { label: 'Role', value: 'Designer' },
            { label: 'Type', value: 'SaaS \u00b7 Developer Tools' },
            { label: 'Platform', value: 'Web, CLI, MCP' },
            { label: 'Status', value: 'Inactive concept · illustrative reconstruction' },
            { label: 'Year', value: '2026' },
          ]}
          visualHeroMedia={<OrgDashboardArtifact />}
        />

        <ProjectOverview
          id="cs-problem"
          sections={[
            {
              label: 'The Problem',
              content: 'The design brief addresses repeated context assembly: finding project status, operating procedures, and team knowledge before an agent can propose useful work.',
            },
            {
              label: 'The Proposal',
              content: 'A shared knowledge layer pairs structured retrieval for agents with a dashboard where people inspect sources and review proposed external actions.',
            },
          ]}
        />

        <CsExpandPreview cta="Inspect the product decisions" note="A concept review with explicit source limits, rather than an active dashboard.">
          <CsSection id="cs-concept" label="01 · Concept scope" title="One context model, two ways to inspect it">
            <span id="cs-two-users" className="project-decision-alias" />
            <CsBody><p>The proposal gives people a visual knowledge explorer and agents a structured retrieval path. Both would use the same project names, owners and source references, so a reviewer could trace what an agent retrieved.</p><p>OrgDashboard is not active. The diagram above and the prepared prototype are reconstructions of the concept. Original product screens and a working integration recording have not been recovered.</p></CsBody>
          </CsSection>
          <CsSection id="cs-decisions" label="02 · Product decisions" title="Make context inspectable before granting permission">
            <span id="cs-system" className="project-decision-alias" />
            <span id="cs-surfaces" className="project-decision-alias" />
            <div className="concept-decision-list">
              <DecisionNote decision={{question:'Can a person trace what an agent found?',choice:'Use the same knowledge structure for browsing and retrieval.',evidence:'The illustrative model groups Projects, Team and SOPs, with owners, status and context attached.',limit:'These are proposed categories, not connected company records.'}} />
              <DecisionNote decision={{question:'Does retrieving information authorize an external change?',choice:'Keep the knowledge view separate from the action-review queue.',evidence:'The concept places organizational context beside a distinct Human approval area.'}} />
              <DecisionNote decision={{question:'What should be visible before a reviewer decides?',choice:'Show the destination, proposed change, supporting source and rationale together.',evidence:'The concept calls for context and rationale beside the proposed external action.',limit:'The current illustration does not implement permissions, connectors, command shortcuts or an approval service.'}} />
            </div>
          </CsSection>
          <CsSection id="cs-results" label="03 · Evidence still needed" title="Test a review, not an approval count">
            <span id="cs-reflections" className="project-decision-alias" />
            <CsBody><p>A useful next test would give a reviewer a stale source and a wrong destination. Can they find the relevant context, explain the problem and reject or correct the proposed action? Original interface captures, connection failures and a recorded end-to-end task are needed before making implementation or usability claims.</p><p>The prepared Figma flow uses example records. It is additional concept material, not recovered product evidence.</p></CsBody>
            <a className="glass-action" href="https://www.figma.com/design/u9ZRlQnwfUsErk2bFa9Ceq" target="_blank" rel="noreferrer">Inspect the prepared Figma flow ↗</a>
          </CsSection>
          <CsThanks contactCta />
        </CsExpandPreview>

        <BottomNav sections={[
          {id:'cs-problem',label:'Brief'},
          {id:'cs-concept',label:'Concept scope'},
          {id:'cs-decisions',label:'Decisions'},
          {id:'cs-results',label:'Evidence limits'},
        ]} />

      </main>

      <NextProject slug="raahi-project" title="Raahi" image="/Assets/images/raahi.jpg" />
      <Footer />
    </>
  )
}
