import DeferredObjectStudy from '../../components/case-study/DeferredObjectStudy'
import ExternalVideo from '../../components/ExternalVideo'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsMediaSpotlight from '../../components/case-study/CsMediaSpotlight'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import CsScreenStrip from '../../components/case-study/CsScreenStrip'
import '../../components/case-study/service-decisions.css'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function EnigmaPage() {
  return (
    <>
      <Helmet>
        <title>Enigma &middot; Parth Pawar</title>
        <meta name="description" content="A 200-neuron light sculpture that makes a letter-recognition neural network visible through physical LEDs." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Enigma &middot; Parth Pawar" />
        <meta property="og:description" content="A physical light sculpture that makes neural-network activity visible." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/enigma.jpg" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--enigma" style={{ '--project-color': '#3A3A40' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="creative-tech"
          backLabel="Back to Work"
          tags={['Creative Technology', 'AI', 'Installation']}
          title="Enigma"
          subtitle="A 200-neuron light sculpture that makes a neural network visible"
          info={[
            { label: 'Year', value: '2023' },
            { label: 'Role', value: 'Creator' },
          ]}
        />

        <CsMediaSpotlight layout="stacked"
          id="cs-film"
          label="Watch first"
          title="Light as inference"
          lede="The film shows the main idea faster than text can: a handwritten letter becomes a visible cascade through 200 physical neurons."
        >
          <ExternalVideo
            src="https://player.vimeo.com/video/895893649?h=d78737dcdb&badge=0&autopause=0&player_id=0&app_id=58479"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="Enigma"
          />
        </CsMediaSpotlight>

        {/* Interactive */}
        <CsSection id="cs-interactive" label="Interactive" title="Draw through the sculpture">
          <CsBody>
            <p>Draw on the tablet or type a letter to drive the sculpture’s lights. Switch to the signal explanation to inspect the input and layer relationships. Both browser studies are explanatory adaptations; the original trained model is not available. The film records the actual installation.</p>
          </CsBody>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Network</span>
            <span className="cs-label-row-val">200 physical lights in the documented sculpture</span>
          </div>
          <div className="project-content-block--roomy">
            <DeferredObjectStudy project="enigma" />
          </div>
        </CsSection>

        <CsExpandPreview
          cta="Open the sculpture proof"
          note="Gallery shots, concept, technical system, exhibition notes, and thanks."
        >
        <CsSection id="cs-source" title="Compare input, arrangement and output">
          <CsScreenExplorer format="landscape" label="Choose original Enigma evidence" screens={[
            {title:'Draw at the tablet',label:'Original interaction',src:'/Assets/Projects/Enigma/photos/tablet-input.jpg',alt:'Original visitor drawing on the tablet beneath the installation',caption:'The tablet invites one alphabet letter; the physical lights provide the response.',decision:{question:'Where should an interaction begin?',choice:'Put a single-letter drawing surface beside the sculpture.',evidence:'The original prompt reads “Please draw one Alphabet.” The browser uses the same physical starting point.'}},
            {title:'Follow the layers',label:'Original sculpture',src:'/Assets/Projects/Enigma/photos/full-sculpture-wide.webp',alt:'Original Enigma sculpture showing light layers, wires and alphabet output',caption:'The light arrangement can be compared directly with the browser model.',decision:{question:'How can an invisible network become inspectable?',choice:'Give its layers physical lights and expose their connections.',evidence:'Follow the rows and crossing wires toward the labelled alphabet. The project documents 200 lights.',limit:'Photographs establish arrangement; they do not supply the original weights or a recognition benchmark.'}},
            {title:'Read the selected letter',label:'Alphabet output',src:'/Assets/Projects/Enigma/photos/alphabet-layer.webp',alt:'Original Enigma alphabet-labelled output lights',caption:'The original model’s prediction and the browser’s chosen label have different sources.',decision:{question:'What does the final light mean?',choice:'Make the alphabet readable at the output layer.',evidence:'In the original installation it represents the model’s prediction. In the browser drawing mode, it represents the label you choose.',limit:'Browser drawing drives the front input lights and illustrative intermediate layers. It does not automatically recognize the letter.'}},
          ]} />
          <details className="service-source-details"><summary>Inspect the remaining installation photographs</summary><CsScreenStrip label="Original Enigma installation details" screens={[
            ['person-viewing.webp','Visitor and sculpture'],['full-sculpture-c.webp','Letter C in the original installation'],['wire-detail.webp','Connections'],['neuron-closeup.webp','Light construction'],
          ].map(([file,label])=>({src:`/Assets/Projects/Enigma/photos/${file}`,label,alt:`Original Enigma: ${label}`}))} /></details>
        </CsSection>

        {/* Concept */}
        <CsSection id="cs-concept" label="01 &mdash; Concept" title="200 Neurons of Light">
          <CsBody>
            <p>The sculpture turns a letter-recognition network into a spatial sequence: draw below, follow the lights, inspect the alphabet above. The film documents the original model response; the browser is an explanatory adaptation.</p>
            <p>The project builds on <a href="https://pangenerator.com/projects/the-abacus/" target="_blank" rel="noopener noreferrer" className="project-text-link">The Abacus</a> by <a href="https://pangenerator.com/" target="_blank" rel="noopener noreferrer" className="project-text-link">panGenerator Studio</a>, extending the idea from digit recognition to the full alphabet.</p>
          </CsBody>
        </CsSection>


        {/* Technology */}
        <CsSection id="cs-technology" label="02 &mdash; Technology" title="From Model to Light">
          <CsBody>
            <p>The original project describes a feedforward network trained on EMNIST letters, with input, hidden and output layers represented by lights.</p>
            <p>The documented pipeline preprocesses tablet input into a 28 × 28 matrix and uses an Arduino Mega to drive the LEDs. The browser instead samples strokes into an 8 × 8 input grid and uses illustrative signal mixing. Choosing a label lights the corresponding output; editing the ink clears that label.</p>
            <p>The visible activation sequence connects the submitted letter to the prediction. A measured latency or recognition-accuracy report is not included in the project archive.</p>
          </CsBody>
        </CsSection>


        {/* Exhibition */}
        <CsSection id="cs-exhibition" label="03 &mdash; Exhibition" title="ITP Winter Show 2023">
          <CsBody>
            <p>Enigma was exhibited at the ITP Winter Show 2023, NYU&rsquo;s public showcase for experimental technology and art.</p>
            <p>The photographs document participation. Recognition accuracy, measured latency and changes in visitors’ understanding were not evaluated in the surviving record.</p>
          </CsBody>


        </CsSection>


        {/* Thanks */}
        <CsThanks />

        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-film', label: 'Film' },
          { id: 'cs-interactive', label: 'Interactive' },
          { id: 'cs-source', label: 'Original evidence' },
          { id: 'cs-concept', label: 'Concept' },
          { id: 'cs-technology', label: 'Technology' },
          { id: 'cs-exhibition', label: 'Exhibition' },
        ]} />

      </main>

      <NextProject slug="shuffle" title="Shuffle" image="/Assets/mockups/projects/shuffle_16x9.webp" />
      <Footer />
    </>
  )
}
