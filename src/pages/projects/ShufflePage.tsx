import { projectImageProps } from '../../utils/projectImage'
import ExternalVideo from '../../components/ExternalVideo'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsMediaSpotlight from '../../components/case-study/CsMediaSpotlight'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsImage from '../../components/case-study/CsImage'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'
import ShuffleInteractive from '../../components/ShuffleInteractive'

export default function ShufflePage() {
  return (
    <>
      <Helmet>
        <title>Shuffle &middot; Parth Pawar</title>
        <meta name="description" content="A motorized-fader installation where student-life priorities push against each other in real time." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Shuffle · Parth Pawar" />
        <meta property="og:description" content="A physical simulator for the trade-offs of student life." />
        <meta property="og:image" content="https://designwhich.works/Assets/mockups/projects/shuffle_16x9.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--shuffle" style={{ '--project-color': '#C99B3F' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="creative-tech"
          backLabel="Back to Work"
          tags={['Creative Technology', 'Physical Computing', 'Installation']}
          title="Shuffle"
          heroFraming="image"
          subtitle="A motorized-fader board where every student-life priority has a cost"
          info={[
                { label: 'Year', value: '2023' },
            { label: 'Role', value: 'Interaction designer + fabricator' },
          ]}
        />

        <CsMediaSpotlight
          id="cs-film"
          label="Watch first"
          title="Time as sliders"
          lede="The video shows the physical idea quickly: every choice changes the balance of student life, and the board makes those tradeoffs visible."
        >
          <ExternalVideo
            src="https://player.vimeo.com/video/897796834?h=853abf08b1&badge=0&autopause=0&player_id=0&app_id=58479"
            allow="autoplay; fullscreen; picture-in-picture"
            loading="lazy"
            title="Shuffle"
          />
        </CsMediaSpotlight>

        <CsExpandPreview
          cta="Open the physical build proof"
          note="Product photos, interaction shots, hardware details, process, and exhibition notes."
        >
        {/* Product photos */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid project-image-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/Shuffle/photos/product-front.jpg")} data-project-preview src="/Assets/Projects/Shuffle/photos/product-front.jpg" alt="Shuffle: plywood slider board with labeled life-balance sliders" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/Shuffle/photos/slider-labels.jpg")} data-project-preview src="/Assets/Projects/Shuffle/photos/slider-labels.jpg" alt="Close-up: Class, Finals, Sleep, Food, Social Life, Energy slider labels" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* Interactive demo */}
        <CsSection id="cs-interactive" label="Interactive" title="Redistribute Your Time">
          <CsBody>
            <p className="cs-caption">Browser interpretation of the coupled faders. The film shows the original motorized hardware.</p>
            <p>Drag a slider to explore the relationships in this browser model. The weights are illustrative design choices, not measured relationships between student habits and outcomes.</p>
          </CsBody>
          <div className="project-content-block--roomy">
            <ShuffleInteractive />
            <p><Link to="/shuffle/simulation">Open the 3D simulation</Link></p>
          </div>
        </CsSection>

        <CsSection title="What one slider changes">
          <CsBody>
            <p>In the browser model, raising Job by 10 points adds 4 to Food and subtracts 2.5 from Sleep, 2 each from Social Life and Hobby, and 1.5 from Class. Each change travels one connection; it does not trigger a chain reaction through the whole board.</p>
            <p>Values stop at 0 and 100. Their sum is not fixed: this model demonstrates coupled controls, not a literal allocation of 168 weekly hours. The original installation is documented in the film and build photographs.</p>
          </CsBody>
        </CsSection>

        {/* Interaction photos */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid project-image-grid--three">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/Shuffle/photos/hand-sliding.jpg")} data-project-preview src="/Assets/Projects/Shuffle/photos/hand-sliding.jpg" alt="Hand adjusting the Food slider on the board" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/Shuffle/photos/hand-motion.jpg")} data-project-preview src="/Assets/Projects/Shuffle/photos/hand-motion.jpg" alt="Motion blur: player rapidly adjusting sliders" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/Shuffle/photos/product-angle.jpg")} data-project-preview src="/Assets/Projects/Shuffle/photos/product-angle.jpg" alt="Shuffle board from above showing all 8 labeled sliders and USB cable" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* Slider detail */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/Shuffle/photos/slider-detail.jpg")} data-project-preview src="/Assets/Projects/Shuffle/photos/slider-detail.jpg" alt="Detail: Social Life and Job sliders with plus/minus indicators" loading="lazy" /></div>
          </div>
        </section>

        {/* Concept */}
        <CsSection id="cs-concept" label="01 &mdash; Concept" title="Physical Redistribution of Time">
          <CsBody>
            <p>The board invites you to redistribute your time across the pressures of student life at ITP&mdash;class, finals, sleep, food, social life, energy, job, hobby. Each fader is a share of a finite week. Push one up and the others have to give something back, forcing trade-offs that are normally invisible.</p>
            <p>The idea started as a sketch of a much larger control panel: twelve sliders covering everything from volunteer work to cold weather. Paring that down to eight categories that actually compete for the same hours turned a dashboard into a game.</p>
          </CsBody>
          <div className="project-content-block--roomy project-stack">
            <CsImage
              src="/Assets/Projects/Shuffle/photos/idea-demonstration.jpg"
              alt="Early mockup of ITP Shuffle: twelve labeled sliders including Classes, Sleep, Food, Job, Social Media, and Finals at different positions"
              caption="The first sketch mapped twelve dimensions of ITP life to slider positions before the build narrowed it to eight."
            />
            <CsImage
              src="/Assets/Projects/Shuffle/photos/g80-inspiration.jpg"
              alt="G80 by Fragmentin: a wall of white slider panels with green motorized faders, a hand adjusting one labeled Financial speculation"
              caption="The reference point: G80 by Fragmentin (2023), a motorized-fader installation about resource distribution on a planetary scale. Shuffle borrows the mechanic and shrinks the scale to one student's week."
            />
          </div>
        </CsSection>

        {/* Process */}
        <CsSection id="cs-process" label="02 &mdash; Process" title="Hardware &amp; Fabrication">
          <CsBody>
            <p>The magic of the board is that the sliders push back. Each of the eight faders is a motorised potentiometer: the Arduino reads the one you move and drives the motors on the others, so raising Finals physically drags Sleep and Social Life down in front of you. The zero-sum rule is not displayed&mdash;it is enforced by the hardware.</p>
            <p>The enclosure is a laser-cut plywood wedge, built as two angled panels of four faders each, with the slider caps 3D-printed to sit comfortably under a fingertip. Underneath, the motorised faders bolt to the panels on standoffs and route back to an Arduino on a breadboard, with the firmware written in C++.</p>
          </CsBody>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Controller</span>
            <span className="cs-label-row-val">Arduino (C++)</span>
          </div>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Input / Output</span>
            <span className="cs-label-row-val">8 Motorised Potentiometers</span>
          </div>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Enclosure</span>
            <span className="cs-label-row-val">Laser-cut Plywood</span>
          </div>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Slider Caps</span>
            <span className="cs-label-row-val">3D Printed</span>
          </div>
        </CsSection>

        {/* Under the hood */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid project-image-grid--two">
              <div className="cs-img reveal">
                <img {...projectImageProps("/Assets/Projects/Shuffle/photos/underside-motors.jpg")} data-project-preview src="/Assets/Projects/Shuffle/photos/underside-motors.jpg" alt="Side view of the plywood wedge with the top panel lifted, exposing eight motorised fader assemblies and wiring on standoffs" loading="lazy" decoding="async" />
              </div>
              <div className="cs-img reveal">
                <img {...projectImageProps("/Assets/Projects/Shuffle/photos/electronics-breadboard.jpg")} data-project-preview src="/Assets/Projects/Shuffle/photos/electronics-breadboard.jpg" alt="Inside the enclosure: Arduino and breadboard wired with jumper cables, next to a close-up of a motorised fader mounted under the panel" loading="lazy" decoding="async" />
              </div>
            </div>
            <p className="cs-caption project-caption--standalone">Under the hood: motorised faders on standoffs, and the Arduino-plus-breadboard brain that redistributes the week.</p>
          </div>
        </section>

        {/* Exhibition */}
        <CsSection id="cs-exhibition" label="03 &mdash; In Play" title="Watching People Negotiate a Week">
          <CsBody>
            <p>During informal exhibition interactions, visitors reached for the faders and noticed the others moving in response. Those observations informed the presentation; no completion-rate or comprehension study is documented here.</p>
            <p>A quick interaction often became a longer conversation about priorities and burnout. Watching someone lower Sleep to raise Finals made the tradeoff immediately legible.</p>
            <p>Friends compared slider positions side by side, turning a tactile interface into the kind of reflective debate that forms and calendars rarely create.</p>
          </CsBody>
        </CsSection>

        <CsThanks />

        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-film', label: 'Film' },
          { id: 'cs-interactive', label: 'Interactive' },
          { id: 'cs-concept', label: 'Concept' },
          { id: 'cs-process', label: 'Process' },
          { id: 'cs-exhibition', label: 'In Play' },
        ]} />

      </main>

      <NextProject slug="the-omakase" title="The Omakase" image="/Assets/images/the-omakase.jpg" />
      <Footer />
    </>
  )
}
