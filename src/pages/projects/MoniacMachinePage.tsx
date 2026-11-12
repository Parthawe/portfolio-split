import DeferredMoniac from '../../components/case-study/DeferredMoniac'
import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import CsScreenStrip from '../../components/case-study/CsScreenStrip'
import DecisionNote from '../../components/case-study/DecisionNote'
import '../../components/case-study/service-decisions.css'
import ExternalVideo from '../../components/ExternalVideo'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsMediaSpotlight from '../../components/case-study/CsMediaSpotlight'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function MoniacMachinePage() {
  return (
    <>
      <Helmet>
        <title>Moniac Machine &middot; Parth Pawar</title>
        <meta name="description" content="Economic strategy game inspired by the legendary 1949 Phillips hydraulic computer, a creative technology and game design project." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Moniac Machine &middot; Parth Pawar" />
        <meta property="og:description" content="Economic strategy game inspired by the legendary 1949 Phillips hydraulic computer." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/moniac-machine.jpg" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--moniac" style={{ '--project-color': '#3D7FA8' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="installations"
          backLabel="Back to Work"
          tags={['Creative Technology', 'Game Design']}
          title="Moniac Machine"
          subtitle="Economic strategy game inspired by the legendary 1949 Phillips hydraulic computer"
          info={[
            { label: 'Year', value: '2024' },
            { label: 'Role', value: 'Creator' },
          ]}
        />

        <CsMediaSpotlight
          id="cs-film"
          label="Watch first"
          title="Economy as a cabinet"
          lede="Watch the original cabinet and its hydraulic-style game screen. The film documents the physical controls; the browser below uses its own simplified economic rules."
          layout="stacked"
        >
          <ExternalVideo
            src="https://player.vimeo.com/video/996025152"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="Moniac Machine"
          />
        </CsMediaSpotlight>

        {/* Interactive simulator */}
        <CsSection id="cs-interactive" label="Interactive" title="Run the Economy">
          <CsBody>
            <p>Choose “Explore rules without shocks” for a matched one-step comparison, or start the 60-second browser game. Its six on-screen wheels follow the labelled layout in the original game; interest is an additional browser-model control. Physical cabinet valve assignments are unverified.</p>
          </CsBody>
          <div className="project-content-block--roomy">
            <DeferredMoniac />
          </div>
        </CsSection>

        <CsExpandPreview sectionIds={['cs-inspiration','cs-mechanics','cs-result','cs-original']} cta="Compare the cabinet and original game" note="Inspect the screen layout, construction and limits of the browser model.">
        <CsSection id="cs-original" title="Read the screen and the cabinet separately">
          <CsScreenExplorer format="landscape" label="Choose original Moniac evidence" screens={[
            {title:'The original game screen',label:'Layout reference',src:'/Assets/Projects/Moniac/photos/screen-closeup.png',alt:'Original Moniac screen with blue return loop, transparent column, reservoirs, valve wheels and countdown',caption:'The browser follows the return loop, central column, left tax reservoir, right consumption/import reservoir and timer arrangement.',decision:{question:'How can the game make settings visible?',choice:'Use labelled valves and reservoir levels in one isometric view.',evidence:'Compare the tax and consumption labels, white wheels, blue fill and timer with the browser drawing.',limit:'The visual layout is documented. Its original economic equations and event timings are not available.'}},
            {title:'Six physical valve controllers',label:'Cabinet construction',src:'/Assets/Projects/Moniac/photos/annotated-breakdown.png',alt:'Original annotated cabinet with iPad, wooden arcade enclosure, valve controls and Teensy wiring',caption:'The cabinet contains six photographed valve controllers; their individual policy assignments are not verified.'},
            {title:'Operate the cabinet',label:'Physical interaction',src:'/Assets/Projects/Moniac/photos/hand-playing.webp',alt:'Original player turning a valve controller on the Moniac cabinet',caption:'The photograph documents the hand-operated controller and exhibition setup.'},
          ]}/>
        </CsSection>
        <CsSection id="cs-mechanics" title="Change one setting, then compare its consequence">
          <DecisionNote decision={{question:'How can someone inspect a rule without a random event obscuring it?',choice:'Offer a deterministic one-step comparison alongside the timed game.',evidence:'Reset control and Your control use the same starting indices and other settings. The Difference column isolates the selected control’s effect in this browser rule set.',limit:'This comparison was added for the browser adaptation. It is not presented as a recovered feature or validation of the original game.'}} />
          <details className="service-source-details"><summary>Inspect the cabinet and historic inspiration</summary><CsScreenStrip label="Original Moniac construction and context" screens={[
            ['hero-cabinet.png','Complete cabinet'],['annotated-back.png','Rear construction'],['valve-detail.webp','Valve construction'],['gameplay-wide.png','Exhibition setup'],['original-moniac.png','Historic Phillips machine reference'],
          ].map(([file,label])=>({src:`/Assets/Projects/Moniac/photos/${file}`,label,alt:`Project archive: ${label}`}))}/></details>
        </CsSection>
        <CsSection id="cs-inspiration" title="A hydraulic metaphor for connected decisions">
          <CsBody><p>The project takes its name from the Phillips MONIAC hydraulic computer. The cabinet translates that visual idea into a digital strategy game; the browser drawing shows settings and illustrative indices. It is not a fluid simulation or an economic forecast.</p></CsBody>
        </CsSection>
        <CsSection id="cs-result" title="What a learning test would need">
          <CsBody><p>Ask a player to predict one policy’s effect, inspect the matched comparison, then explain which assumptions produced it. The source documents the cabinet and play, but no comparative learning study or real-world predictive accuracy. The 60-second balance score belongs to this browser exercise.</p></CsBody>
        </CsSection><CsThanks/>
        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-film', label: 'Film' },
          { id: 'cs-interactive', label: 'Simulator' },
          { id: 'cs-original', label: 'Original evidence' },
          { id: 'cs-inspiration', label: 'Inspiration' },
          { id: 'cs-mechanics', label: 'Mechanics' },
          { id: 'cs-result', label: 'Result' },
        ]} />

      </main>

      <NextProject slug="black-hole" title="Black Hole" image="/Assets/images/black-hole.jpg" />
      <Footer />
    </>
  )
}
