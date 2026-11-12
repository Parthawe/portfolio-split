import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import CsScreenStrip, { EvidenceImage } from '../../components/case-study/CsScreenStrip'
import CsCredits from '../../components/case-study/CsCredits'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'
import '../../components/case-study/service-decisions.css'
const asset = (file:string) => `/Assets/Projects/vj/photos/${file}`
export default function VjSoftwarePage(){return <>
      <Helmet>
        <title>VJ Parivar &middot; Parth Pawar</title>
        <meta name="description" content="Vehicle parking management app for homeowners in Vilas Javdekar residential societies, covering user research, UI/UX design, and prototyping." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="VJ Parivar &middot; Parth Pawar" />
        <meta property="og:description" content="Vehicle parking management app for VJ residential societies, user research, UI/UX and prototyping." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/vj.jpg" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--vj" style={{ '--project-color': '#E8702A' } as React.CSSProperties}>

        <ProjectHeader
          showHeaderSummary={false}
          backLink="/work"
          categorySlug="ux-design"
          backLabel="Back to Work"
          tags={['UX', 'UI', 'Research', 'Prototyping']}
          title="VJ Parivar"
          subtitle="Choose a parking space with its location, dimensions and booking record in view"
          info={[
            { label: 'Client', value: 'Vilas Javdekar' },
            { label: 'Scope', value: 'User Research, UI/UX, Prototyping' },
            { label: 'Role', value: 'UI/UX Designer' },
            { label: 'Duration', value: '3 Months' },
            { label: 'Year', value: '2022' },
          ]}
          heroFraming="image"
          heroImage="/Assets/Projects/vj/photos/car-parking.png"
          heroAlt="Original VJ Parivar vehicle parking screen with availability and booking window"
        />


        <CsSection id="cs-context" title="The decision starts with a place">
          <CsBody><p>My work focused on parking within VJ’s resident-services app. Choosing a space requires its location and dimensions, followed by a booking record the resident can find again. The original screens below show that sequence; adoption and task-completion results are not recorded.</p></CsBody>
        </CsSection>
        <CsExpandPreview sectionIds={['cs-discover','cs-define','cs-develop','cs-deliver']} cta="Read the parking decisions" note="Inspect the original entry, map-selection and confirmed-booking screens.">
        <CsSection id="cs-deliver" title="Make the booking state visible">
          <CsScreenExplorer scrollPortrait label="Choose an original VJ parking screen" screens={[
            {title:'Find the parking task',label:'Legal & Pay',src:asset('legal-pay.png'),alt:'Original Legal and Pay hub with parking entry and selection countdown',caption:'Scroll inside the viewer to inspect the complete original.',decision:{question:'Where does a resident enter the booking flow?',choice:'Expose parking within the Legal & Pay hub.',evidence:'The parking entry and countdown appear alongside other post-purchase tasks.',limit:'The countdown is a proposed urgency treatment; its effect and the fairness of the booking window were not evaluated.'}},
            {title:'Explain availability and the window',label:'Parking landing',src:asset('car-parking.png'),alt:'Original parking page showing 50 total, 30 available and 20 booked spots plus priority-window explanation',caption:'The design presents availability before the selection action.',decision:{question:'What does someone need before choosing a space?',choice:'Show availability and explain when the selection window applies.',evidence:'Total, available and booked counts precede Select your spot now and the parking FAQs.',limit:'These are source screen values and proposed rules, not live inventory.'}},
            {title:'Recover the booking afterwards',label:'Post-booking record',src:asset('post-possession.png'),alt:'Original confirmed vehicle spots, owner details, dimensions and legal-document download',caption:'The record keeps the selected spots and their details together.',decision:{question:'What remains after the transaction?',choice:'Keep both vehicle spots, owner context and the document download in one place.',evidence:'Inspect the four-wheeler and two-wheeler cards, spot number, dimensions and download notice.'}},
          ]} />
        </CsSection>
        <CsSection id="cs-define" title="Carry the chosen spot through payment">
          <figure className="service-evidence vj-system-overview"><EvidenceImage src={asset('all-screens-ui.png')} alt="Original complete VJ parking flow: onboarding, map selection, filters, payment and confirmation" /><figcaption>The original board connects wing/floor choice, a selected map space, filters, payment and confirmation. Open it to inspect every screen at its original resolution.</figcaption></figure>
          <CsBody><p>The map keeps a spatial choice visible through the price and payment steps. The final acknowledgment warns that confirmed spots cannot be changed later. That makes a comprehension and recovery test necessary before treating the flow as complete.</p></CsBody>
        </CsSection>
        <CsSection id="cs-develop" title="Inspect the structure before the final screens">
          <CsScreenStrip label="Original flow and wireframe evidence" screens={[
            {src:asset('user-flows.png'),label:'Paper wireframe sequence',alt:'Original paper sketches from Legal and Pay through map choice, filters, vehicle information and payment'},
            {src:asset('all-screens-wireframes.png'),label:'Complete wireframe board',alt:'Original VJ parking wireframe board'},
            {src:'/Assets/Projects/vj/Desktop/7.webp',label:'Journey and feature synthesis',alt:'Original VJ journey and feature synthesis board'},
          ]} />
        </CsSection>
        <CsSection id="cs-discover" title="What the supporting research establishes">
          <CsBody><p>The archive includes resident profiles, a competitor comparison and two existing office-based booking flows. They frame the design question; they do not establish a representative sample or a measured improvement in resident confidence.</p></CsBody>
          <details className="service-source-details"><summary>Inspect the original research and design-system boards</summary><CsScreenStrip label="Original VJ research and presentation" screens={[
            ['3.jpg','Project context and process'],['4.webp','Resident profiles and competitor comparison'],['5.webp','Existing booking methods'],['6.jpg','Design definition'],['8.webp','Interface development'],['9.webp','Style guide'],['10.webp','Final presentation'],
          ].map(([file,label])=>({src:`/Assets/Projects/vj/Desktop/${file}`,label,alt:`Original VJ Parivar ${label}`}))} /></details>
        </CsSection>
        <CsSection id="cs-evaluation" title="Test the commitment, not just the happy path">
          <CsBody><p>Ask residents to choose between two spaces, explain the dimensions and price, then recover the booking document. Include an unavailable spot, an expired selection window and a failed payment. The source designs do not establish that these failure states were implemented or tested.</p></CsBody>
          <CsCredits credits={[{role:'UX Lead',name:'Akshita Anand'},{role:'UI/UX Designer',name:'Parth Pawar'}]} />
        </CsSection>
        </CsExpandPreview>
        <BottomNav sections={[{id:'cs-context',label:'Problem'},{id:'cs-deliver',label:'Original screens'},{id:'cs-define',label:'Booking flow'},{id:'cs-develop',label:'Wireframes'},{id:'cs-discover',label:'Research'},{id:'cs-evaluation',label:'Next test'}]} />
      </main><NextProject slug="office-of-diversity" title="Office of Diversity" image="/Assets/mockups/projects/office-of-diversity_16x9.webp"/><Footer/>
    </>}
