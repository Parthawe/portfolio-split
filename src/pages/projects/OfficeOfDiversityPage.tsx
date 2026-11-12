import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsSection from '../../components/case-study/CsSection'
import CsReportReader from '../../components/case-study/CsReportReader'
import CsBody from '../../components/case-study/CsBody'
import CsImage from '../../components/case-study/CsImage'
import DecisionNote from '../../components/case-study/DecisionNote'
import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import '../../components/case-study/service-decisions.css'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function OfficeOfDiversityPage() {
  return (
    <>
      <Helmet>
        <title>Office of Diversity &middot; Parth Pawar</title>
        <meta name="description" content="A compact glimpse of the NYU Tisch Office of Diversity IDBEA report, translating institutional content into an accessible web report." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Office of Diversity · Parth Pawar" />
        <meta property="og:description" content="Interactive IDBEA report for NYU Tisch, focused on accessible structure, data clarity, and responsive publishing." />
        <meta property="og:image" content="https://designwhich.works/Assets/mockups/projects/office-of-diversity_16x9.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--office-diversity" style={{ '--project-color': '#57068C' } as React.CSSProperties}>
        <ProjectHeader
          backLink="/work"
          categorySlug="design-for-good"
          backLabel="Back to Work"
          tags={['UI/UX', 'Data Visualization', 'Accessibility']}
          title="Office of Diversity Report"
          subtitle="Make a long institutional report easier to enter and revisit"
          info={[
            { label: 'Client', value: 'Office of Diversity, TSOA' },
            { label: 'Role', value: 'Website Publishing Designer' },
            { label: 'Duration', value: '3 Months' },
            { label: 'Year', value: '2024' },
          ]}
          heroFraming="image"
          heroImage="/Assets/Projects/office-of-diversity/photos/responsive-preview.png"
          heroAlt="Tisch IDBEA report shown across desktop and mobile responsive views"
        />

        <CsSection id="cs-glimpse" label="Design decision" title="Give a long report recognizable entry points">
          <CsBody><p>I worked on publishing the Office of Diversity’s IDBEA report for the web. The surviving capture shows numbered program areas, repeated headings and visual summaries. The desktop and mobile composition above documents the intended responsive presentation.</p></CsBody>
          <DecisionNote decision={{question:'How can a reader find the part relevant to them?',choice:'Repeat the four program areas as an overview and as section headings.',evidence:'Learning and Engagement, Resource Development, Restorative Practices and Collaborative Programming appear in the original report.',limit:'The source captures document layout. They do not establish accessibility compliance or improved reading performance.'}} />
        </CsSection>

        <CsSection id="cs-report" label="Report" title="Read the original report excerpts">
          <CsBody>
            <p>These four overlapping excerpts preserve the original capture. Their labels describe the content actually visible. Choose an excerpt, zoom for detail, or open the complete original report including its opening and background timeline.</p>
          </CsBody>
          <CsReportReader original="/Assets/Projects/office-of-diversity/photos/full-report-page.webp" chapters={[
            { label: 'Priorities and community feedback', src: '/Assets/Projects/office-of-diversity/photos/report-slices/report-timeline.png', alt: 'Original four program priorities, advisement groups and community feedback structure' },
            { label: 'Program overview and learning', src: '/Assets/Projects/office-of-diversity/photos/report-slices/report-intro.png', alt: 'Original program-area overview, learning and engagement chart, and resource development' },
            { label: 'Learning and restorative practice', src: '/Assets/Projects/office-of-diversity/photos/report-slices/report-data.png', alt: 'Original learning participation chart, resource development and restorative-practice case summaries' },
            { label: 'Feedback and the year ahead', src: '/Assets/Projects/office-of-diversity/photos/report-slices/report-access.png', alt: 'Original workshop feedback, implementation challenges, HEAR US, Future Artists and year-ahead priorities' },
          ]} />
        </CsSection>

        <CsSection id="cs-impact" label="Read the evidence" title="Keep the report’s figures in their context">
          <CsBody><p>The participation chart, case summaries and community feedback belong to the institution’s report. They are not measurements of this website’s usability. Keep the explanatory text beside those visuals; the source explicitly warns that restorative cases can involve more than one component.</p><p>A next review should test finding a program area, understanding a chart and returning to a section on a small screen. Keyboard navigation, text alternatives and chart comprehension need a documented audit before making accessibility claims.</p></CsBody>
        </CsSection>
        <CsSection id="cs-learning" label="Supporting material" title="What the archive can establish">
          <details className="service-source-details"><summary>Inspect the planning board and community context</summary>
          <CsScreenExplorer format="landscape" label="Choose Office of Diversity source material" screens={[
            {title:'Scope and intended approach',label:'Planning board',src:'/Assets/Projects/office-of-diversity/photos/scope-timeline.png',alt:'Original scope board naming themes, concepts, visualization, engagement, collaboration and accessibility',caption:'This board records intended work. Tool names and the “WCAG standards met” wording do not constitute an implementation or accessibility audit.'},
            {title:'Archive photograph',label:'Attribution not verified',src:'/Assets/Projects/office-of-diversity/photos/research-wall.webp',alt:'Archived sticky-note photograph including finance and risk-review labels',caption:'This photograph is stored with the project but contains finance and risk-review language. Its relationship to the report is unverified; it is not used as research evidence.'},
            ...[1,2,3].map(n=>({title:`Community photograph ${n}`,label:'Report context',src:`/Assets/Projects/office-of-diversity/photos/community-workshop-${n}.png`,alt:`Original archived community event photograph ${n}`,caption:'Community-event context from the project archive; this does not document a website usability test.'})),
          ]} />
          <CsImage src="/Assets/Projects/office-of-diversity/4.webp" alt="Original Office of Diversity presentation board" caption="Original presentation board, retained for source inspection." />
          </details>
        </CsSection>

        <CsThanks contactCta />

        <BottomNav sections={[
          { id: 'cs-glimpse', label: 'Decision' },
          { id: 'cs-report', label: 'Report' },
          { id: 'cs-impact', label: 'Evidence limits' },
          { id: 'cs-learning', label: 'Source archive' },
        ]} />
      </main>

      <NextProject slug="jugalbandi" title="Jugalbandi" image="/Assets/mockups/projects/jugalbandi_16x9.webp" />
      <Footer />
    </>
  )
}
