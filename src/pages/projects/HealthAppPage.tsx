import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import ProjectOverview from '../../components/case-study/ProjectOverview'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import CsReportReader from '../../components/case-study/CsReportReader'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'
import '../../components/case-study/service-decisions.css'

const base = '/Assets/Projects/HealthApp/optimized'
const archive = [
  {src:`${base}/01-planning.webp`,alt:'Original Reimagining Google Tasks App brief with self-initiated scope, four-month duration and design goals',label:'Project brief · 2024'},
  {src:`${base}/02-flow.webp`,alt:'Existing Google Tasks product and ecosystem reference board',label:'Existing Google Tasks · baseline'},
  {src:`${base}/03-tasks.webp`,alt:'Existing Google Tasks in Gmail, Workspace and Calendar',label:'Existing integrations · baseline'},
  {src:`${base}/04-insights.webp`,alt:'Historical problem-framing board with unverified health and economic assertions',label:'Historical problem framing · unvalidated claims'},
  {src:`${base}/cover-original.webp`,alt:'Original Health App project cover board',label:'Original cover board'},
]
export default function HealthAppPage() {
  return <>
    <Helmet>
      <title>Health App · Parth Pawar</title>
      <meta name="description" content="A self-initiated Google Tasks redesign concept: original goal selection, reminder setup and calendar-conflict screens, with design decisions and source limits." />
      <meta property="og:type" content="article" />
      <meta property="og:title" content="Health App · Parth Pawar" />
      <meta property="og:description" content="Original planning concept boards and proposed interactions, not a live health service." />
      <meta property="og:image" content="https://designwhich.works/Assets/mockups/projects/healthapp_16x9.webp" />
    </Helmet>
    <Nav />
    <main id="main-content" className="project-main project-main--healthapp" style={{'--project-color':'#4285F4'} as React.CSSProperties}>
      <ProjectHeader showHeaderSummary={false} backLink="/work" categorySlug="ux-design" backLabel="Back to Work"
        tags={['UX Design','Mobile','Self-initiated concept']} title="Health App"
        subtitle="Reimagining Google Tasks around personal goals, reminders and reviewable schedule changes."
        heroImage="/Assets/mockups/projects/healthapp_16x9.webp" heroAlt="Health App planning concept cover"
        info={[{label:'Year',value:'2024'},{label:'Role',value:'Product Designer'},{label:'Duration',value:'4 months'},{label:'Status',value:'Concept redesign · no live health service'}]} />
      <ProjectOverview id="cs-public-story" sections={[
        {label:'Design question',content:'How could a task planner include personal goals and recurring care activities without hiding changes to the day’s schedule?'},
        {label:'Proposal',content:'The original boards explore goal selection, reminder setup and a calendar-conflict prompt. They show interface ideas; they do not establish automatic health sensing or improved wellbeing.'},
      ]} />
      <CsExpandPreview cta="Inspect the original planning screens" note="Read the proposed interactions beside their original boards.">
        <CsSection id="cs-healthapp-screens" label="01 · Original redesign" title="Choose a goal; review the schedule change">
          <span id="cs-healthapp-model" className="project-decision-alias" />
          <span id="cs-process" className="project-decision-alias" />
          <CsBody><p>The original boards cover goal selection, reminders and a calendar-conflict prompt. Select one, scroll within it or open the original at full resolution.</p></CsBody>
          <CsScreenExplorer format="landscape" scrollPortrait label="Inspect original Health App redesign boards" screens={[
            {title:'Choose goals and set reminders',label:'Original mobile redesign board',src:`${base}/07-screen-set.webp`,alt:'Original low-fidelity sketches, goal-selection screens, daily diary and meditation reminder setup',caption:'Original proposed screens, including sketches and mobile flows.',decision:{question:'How could someone choose what the planner supports?',choice:'Ask for a personal goal and let the person set a reminder’s time and days.',evidence:'The board shows What Brings You to Us, a daily diary and a meditation reminder with Save and No Thanks.',limit:'The screens do not demonstrate measured sleep, energy sensing or an adaptive scheduling engine.'}},
            {title:'Ask before resolving an overlap',label:'Original calendar proposal',src:`${base}/09-calendar.webp`,alt:'Original calendar concept showing an Overlap Spotted prompt with Move Sleep and Cancel actions',caption:'Original conflict prompt shown against a calendar.',decision:{question:'Should a proposed schedule adjustment silently change the calendar?',choice:'Show the overlap and ask for confirmation or cancellation.',evidence:'The Overlap Spotted dialog offers Move Sleep and Cancel rather than silently applying the change.',limit:'The historical example proposes moving sleep. That recommendation has not been evaluated for suitability; the board is evidence of an interface proposal, not health guidance or a validated intervention.'}},
          ]} />
        </CsSection>
        <CsSection id="cs-healthapp-archive" label="02 · Supporting source material" title="Separate the baseline from the redesign">
          <details className="service-source-details">
            <summary>Inspect the brief and existing Google Tasks references</summary>
            <p>The Google Tasks integration boards show the existing product. The problem-framing board contains historical health and economic assertions without supporting research in this archive; those assertions are not treated as findings.</p>
            <CsReportReader chapters={archive} label="Health App source boards" continueHref="#cs-healthapp-evaluation" originalLabel="Open selected original board" />
          </details>
        </CsSection>
        <CsSection id="cs-healthapp-evaluation" label="03 · Open evaluation" title="Test whether the proposed change is understood">
          <CsBody><p>Ask someone to choose a goal, set a reminder, identify a calendar conflict and decline the proposed adjustment. Check whether they understand what would change and can edit it afterward.</p><p>The archive has original boards, not a running scheduling service or participant-level test results. A recorded prototype task and research supporting the recommendations are still needed.</p></CsBody>
        </CsSection>
        <CsThanks contactCta />
      </CsExpandPreview>
      <BottomNav sections={[{id:'cs-public-story',label:'Brief'},{id:'cs-healthapp-screens',label:'Original screens'},{id:'cs-healthapp-archive',label:'Source archive'},{id:'cs-healthapp-evaluation',label:'Open evaluation'}]} />
    </main>
    <NextProject slug="ibm" title="IBM Cancer Prognosis" image="/Assets/Projects/ibm/1.webp" />
    <Footer />
  </>
}
