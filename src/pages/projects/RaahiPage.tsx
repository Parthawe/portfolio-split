import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import CsScreenStrip from '../../components/case-study/CsScreenStrip'
import { EvidenceImage } from '../../components/case-study/CsScreenStrip'
import DecisionNote from '../../components/case-study/DecisionNote'
import CsCredits from '../../components/case-study/CsCredits'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'
import RaahiServiceStudy from '../../components/case-study/RaahiServiceStudy'
import '../../components/case-study/service-decisions.css'
const raahiAsset = (file: string) => `/Assets/Projects/Raahi/photos/${encodeURIComponent(file)}`
const serviceAsset=(file:string)=>`/Assets/Projects/Raahi/service-2026/${file}`
const tripStages = [
  {
    surface: 'App',
    title: 'Plan from Vanaz',
    description: 'Aditi sets EON IT Park as her destination. She takes the Aqua Line to Ramwadi, where she’ll change to a feeder bus.',
    image: 'mobile-home.png',
    alt: 'Raahi app showing the Vanaz to EON IT Park journey and the start and destination fields.',
    width: 390,
    height: 844,
  },
  {
    surface: 'Station kiosk',
    title: 'Find the feeder at Ramwadi',
    description: 'At Ramwadi, she selects EON IT Park on the kiosk and sees Metro Shuttle 20 as an option. The kiosk starts its own session.',
    image: 'kiosk.png',
    alt: 'Raahi kiosk showing a connection from Ramwadi to EON IT Park on Metro Shuttle 20.',
    width: 1280,
    height: 900,
  },
  {
    surface: 'Bus display',
    title: 'Check the next stop',
    description: 'On the shuttle, Kharadi Bypass is the next stop. Aditi can see EON IT Park farther along the route.',
    image: 'bus.png',
    alt: 'Raahi bus display showing Kharadi Bypass as the next stop and EON IT Park later on the route.',
    width: 1280,
    height: 900,
  },
]

const research = [
 ['Mind Map.png', 'Problem-space map', 'Early framing of transport needs and service opportunities.'],
 ['Group 2531.png', 'Rider models and journey maps', 'Concept synthesis for convenience switchers, captive riders and mode mixers. Participant counts and sampling records are unavailable.'],
 ['service blueprints.png', 'Service blueprint', 'The source blueprint connects journey stages and service touchpoints.'],
 ['information architecture.png', 'Mobile architecture', 'The mobile structure before screen design.'],
 ['information architecture_kiosk.png', 'Kiosk architecture', 'Only this low-resolution original survives; enlargement cannot recover missing detail.'],
]
const identity = [
 ['Spectrum.png', 'Brand personality spectrum'], ['brand personality.png', 'Brand directions'], ['brand personality-1.png', 'Chosen brand direction'],
 ['Nomenclature.png', 'Wordmark and script studies'], ['WhatsApp Image 2022-09-19 at 10.54.png', 'Transit and connection sketches'], ['WhatsApp Image 2022-09-20 at 18.28.png', 'Devanagari sketches'], ['Frame 2547-1.png', 'Transport-mode system'], ['Frame 427318656.png', 'Identity and palette'],
]
export default function RaahiPage() {
 return <>
      <Helmet>
        <title>Raahi Public Transit Research Case Study &middot; Parth Pawar</title>
        <meta name="description" content="Follow one proposed Pune transit trip across the Raahi app, station kiosk, and bus display, with the original service design and prototype evidence." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Raahi · Parth Pawar" />
        <meta property="og:description" content="How rider research and service mapping reframed Pune transit as one connected journey across digital and physical touchpoints." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/raahi.jpg" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--raahi" style={{ '--project-color': '#3C5DDB' } as React.CSSProperties}>

        <ProjectHeader
          showHeaderSummary={false}
          backLink="/work"
          categorySlug="design-for-good"
          backLabel="Back to Work"
          tags={['Service design', 'Research', 'UI design']}
          title="Raahi"
          subtitle="A connected Pune transit concept, from the phone to the station kiosk and the next stop on the bus."
          heroFraming="image"
          openingMediaId="cs-raahi-trip"
          visualHeroMedia={
            <div>
              <section className="raahi-trip-opening" aria-labelledby="raahi-trip-title">
                <h2 id="raahi-trip-title">One trip across Pune</h2>
                <p className="raahi-trip-opening__route">
                  Vanaz <span aria-hidden="true">→</span> Ramwadi <span aria-hidden="true">→</span> EON IT Park
                </p>
                <p className="raahi-trip-opening__note">Example trip from the 2026 browser prototype, based on the 2022 service concept.</p>
                <ol className="raahi-trip-opening__stages" aria-label="Trip stages">
                  {tripStages.map(stage => (
                    <li key={stage.surface}>
                      <p className="raahi-trip-opening__surface">{stage.surface}</p>
                      <h3>{stage.title}</h3>
                      <p className="raahi-trip-opening__description">{stage.description}</p>
                      <div className="raahi-trip-opening__screen">
                        <img data-project-preview src={serviceAsset(stage.image)} alt={stage.alt}
                          width={stage.width} height={stage.height} decoding="async" />
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="raahi-trip-opening__note">The screens show demo fares and a simulated bus position.</p>
              </section>
              <section id="cs-summary" className="public-workflow-contribution" aria-labelledby="raahi-contribution-title">
                <h2 id="raahi-contribution-title">What I designed</h2>
                <p>I worked with Sampada Inamdar on rider research and service mapping. I designed the visual identity, saved places and route comparison in the app, language choice and route lookup at the kiosk, and a bus display that puts the next stop first.</p>
              </section>
            </div>
          }
          info={[
            { label: 'Decision at risk', value: 'Where should one service connect fragmented transit touchpoints?' },
            { label: 'My contribution', value: 'Research, service synthesis, brand, and UI system' },
            { label: 'Team', value: '2 designers' },
            { label: 'Duration', value: '3 months · 2022' },
            { label: 'Working extension', value: '2026 · Browser prototype and source-based service study' },
          ]}
        />


        <CsExpandPreview sectionIds={['cs-pune-evidence','cs-service-journey','cs-service-blueprint','cs-service-architecture','cs-service-mockups','cs-service-validation','cs-research','cs-system','cs-visual','cs-features','cs-touchpoints','cs-results','cs-reflections']} cta="Read the decisions and original screens" note="Inspect the mobile journey, shared-service touchpoints and supporting research artifacts.">
        <figure className="wrap service-overview raahi-overview-proof"><EvidenceImage src={raahiAsset('Frame 427318652.png')} alt="Original Raahi concept overview showing mobile, bus and service touchpoints" /><figcaption>Original 2022 Pune transit concept.</figcaption></figure>
        <RaahiServiceStudy />
        <CsSection id="cs-features" label="Mobile journey" title="From a familiar place to the next leg">
          <CsScreenExplorer scrollPortrait label="Choose a Raahi journey screen" screens={[
            { title:'Start with familiar places', label:'Home and recent trips', src:raahiAsset('homepage.png'), alt:'Original Raahi home screen with destination shortcuts, transport modes and recent trips', caption:'Scroll within the screen to inspect the complete home design, or open the original.', decision:{question:'What should a repeat rider enter again?', choice:'Put destination shortcuts and recent trips before the rest of the service.', evidence:'The destination field, saved-place chips and recent-trip cards share the home screen.', limit:'The carbon and reward values are concept content, not measured environmental or adoption results.'}},
            { title:'Compare routes by priority', label:'Route options', src:raahiAsset('route list.png'), alt:'Original Raahi route list with bookmarked, earliest-arrival and lowest-cost groups', caption:'Route options grouped by the rider’s immediate decision.', decision:{question:'How should a rider choose between similar routes?',choice:'Group options by bookmarked, earliest arrival and lowest cost.',evidence:'Compare the time, fare and mode sequence before each Start action.'}},
            { title:'Keep every leg in view', label:'Route detail', src:raahiAsset('route details.png'), alt:'Original Raahi route detail with walking and bus legs, timings, fare and start action', caption:'One itinerary connects the map and the detailed sequence.', decision:{question:'What happens after choosing a route?',choice:'Keep walking, boarding and transfer detail in one ordered itinerary.',evidence:'Follow the colored mode markers, stop names, arrival times and total fare.',limit:'Timings and crowding labels are designed states; no live transport integration is demonstrated.'}},
            { title:'Carry the ticket into the trip', label:'Ticket',src:raahiAsset('bus in transit.png'),alt:'Original Raahi mobile ticket with QR code and save-to-gallery action',caption:'The original ticket concept keeps its own inspection view.'},
          ]} />
          <details className="service-source-details"><summary>Inspect saved-place setup and commute insights</summary><CsScreenStrip label="Supporting mobile screens" format="portrait" screens={[
            ['added addresses.png','Saved addresses'],['added addresses-1.png','Address confirmation'],['frequent addresses.png','Places and preferred modes'],['insights-1.png','Visited places'],['insights.png','Commute insights'],['Frame 427318655.png','Journey mockup'],
          ].map(([file,label])=>({src:raahiAsset(file),label,alt:`Original Raahi concept: ${label}`}))} /></details>
        </CsSection>
        <CsSection id="cs-touchpoints" label="Service touchpoints" title="Keep the same route language beyond the phone">
          <figure className="service-evidence"><EvidenceImage src={raahiAsset('Frame 2547.png')} alt="Original Raahi kiosk board showing ticket purchase, three language choices, timetable and route lookup" /><figcaption><DecisionNote decision={{question:'How can someone use the service at a stop?',choice:'Offer timetable, route, ticket and day-pass entry points at the kiosk.',evidence:'The central Welcome screen exposes English, Hindi and Marathi; the adjacent screens show ticket purchase and route selection.',limit:'These are kiosk concepts. Operational feasibility and language comprehension still need testing.'}} /></figcaption></figure>
          <CsScreenStrip label="Welcome and vehicle display" screens={[
            {src:raahiAsset('welcome.png'),label:'Mobile welcome',alt:'Original mobile welcome with sign-up and sign-in actions'},
            {src:raahiAsset('kiosk home.png'),label:'In-vehicle next stop',alt:'Original in-vehicle display emphasizing Mundhwa Gaon as the next stop',decision:{question:'What should stand out during the ride?',choice:'Emphasize the next stop within the route sequence.',evidence:'Mundhwa Gaon and its arrival time receive orange emphasis; the bus route remains visible below.'}},
          ]} />
        </CsSection>
        <CsSection id="cs-research" label="Supporting work" title="Inspect the synthesis behind the service">
          <CsBody><p>The surviving maps show how the concept was organized. They do not provide a reliable participant count, interview record or usability result. The personality spectrum belongs to the brand exploration.</p></CsBody>
          <CsScreenStrip label="Research and service artifacts" screens={research.map(([file,label,alt])=>({src:raahiAsset(file),label,alt}))} />
          <span id="cs-visual" className="project-decision-alias" /><details id="cs-system" className="service-source-details"><summary>Inspect the identity and transport-mode system</summary><p>The dot-and-connection mark and script studies explore a shared identity. Mode colors repeat across the app and kiosk; their readability has not been validated here.</p><CsScreenStrip label="Original identity studies" screens={identity.map(([file,label])=>({src:raahiAsset(file),label,alt:`Original Raahi ${label}`}))} /></details>
          <details className="service-source-details"><summary>Inspect the complete service composition</summary><figure className="service-evidence"><EvidenceImage src={raahiAsset('Frame 427318657.png')} alt="Original Raahi full system overview" /></figure></details>
        </CsSection>
        <CsSection id="cs-results" label="Evidence limits" title="What needs testing next">
          <span id="cs-reflections" className="project-decision-alias" /><CsBody><p>The original record and new working prototype support a coordinated service proposal. Neither establishes an improvement in rider confidence or travel outcomes. Test whether riders can compare two routes, explain a transfer and find their next stop across the mobile and vehicle displays. Include Marathi, Hindi and English speakers and people unfamiliar with the route.</p></CsBody>
          <CsCredits credits={[{role:'UI Designer & Researcher',name:'Parth Pawar'},{role:'UX Designer & Researcher',name:'Sampada Inamdar'}]} />
        </CsSection>
        </CsExpandPreview>
        <BottomNav sections={[{id:'cs-raahi-trip',label:'The trip'},{id:'cs-pune-evidence',label:'Pune evidence'},{id:'cs-service-blueprint',label:'Service blueprint'},{id:'cs-service-architecture',label:'Architecture'},{id:'cs-service-mockups',label:'Final touchpoints'},{id:'cs-features',label:'Original screens'},{id:'cs-touchpoints',label:'Beyond the phone'},{id:'cs-research',label:'Source artifacts'},{id:'cs-results',label:'Next study'}]} />
      </main>
      <NextProject slug="mentra-miniapps" title="MiniApps in OS" image="/Assets/mockups/projects/mentra-miniapps_16x9.webp" />
      <Footer />
    </>
}
