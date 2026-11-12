import DeferredCodeBlockStudy from '../../components/case-study/DeferredCodeBlockStudy'
import { projectImageProps } from '../../utils/projectImage'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsImage from '../../components/case-study/CsImage'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsFeatureGrid from '../../components/case-study/CsFeatureGrid'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

const CFB_PHOTOS = '/Assets/Projects/CodeforBuild/photos'

export default function CodeForBuildPage() {
  return (
    <>
      <Helmet>
        <title>Code for Build &middot; Parth Pawar</title>
        <meta name="description" content="A compact glimpse of Code for Build, a mobile-first coding education concept that maps HTML/CSS ideas to 3D building blocks." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Code for Build &middot; Parth Pawar" />
        <meta property="og:description" content="A mobile-first coding education concept using 3D building blocks to make HTML/CSS structure easier to understand." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/code-for-build.jpg" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#2B6CB0' } as React.CSSProperties}>
        <ProjectHeader
          heroFraming="image"
          showHeaderSummary={false}
          backLink="/work"
          categorySlug="ux-design"
          backLabel="Back to Work"
          tags={['UX', 'Education', '3D']}
          title={'Learn Coding\nBy Building Blocks'}
          subtitle="A mobile coding concept that connects visual blocks to their output."
          info={[
            { label: 'Context', value: 'Self initiated' },
            { label: 'Role', value: 'Interaction Designer' },
            { label: 'Year', value: '2021' },
          ]}
          heroImage={`${CFB_PHOTOS}/phone-hero.png`}
          heroAlt="Code for Build hero with 3D block illustrations and mobile mockups"
        />


        <CsSection id="cs-glimpse" label="Glimpse" title="Learning to code on a phone">
          <CsBody>
            <p>I explored how students with limited desktop access could learn HTML and CSS on a phone. Containers, padding, images, text, and buttons became stackable 3D blocks.</p>
          </CsBody>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Problem</span>
            <span className="cs-label-row-val">Learning web structure on a small phone screen can feel abstract, especially for first-time learners.</span>
          </div>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Method</span>
            <span className="cs-label-row-val">Map code concepts to familiar building blocks, then pair each block with a live preview and 3D model of the page structure.</span>
          </div>
          <div className="cs-label-row project-label-row--open">
            <span className="cs-label-row-key">Result</span>
            <span className="cs-label-row-val">A visual learning prototype that makes layout concepts easier to inspect before reading code syntax.</span>
          </div>
        </CsSection>

        <section className="wrap"><DeferredCodeBlockStudy /></section>
        <CsExpandPreview
          ctaLabel="Open the full build concept"
          note="Process maps, block grammar, result screens, and the learning system."
        >
        <section className="cs-section reveal" id="cs-process">
          <div className="wrap">
            <p className="cs-section-label">Process</p>
            <h3 className="cs-section-title">From learning goals to blocks</h3>
            <div className="cfb-process-strip" aria-label="Code for Build process map">
              <img {...projectImageProps(`${CFB_PHOTOS}/process-map.png`)} data-project-preview src={`${CFB_PHOTOS}/process-map.png`} alt="Process map showing research, insights, goals, UX, visuals, prototyping, and improvements." loading="lazy" decoding="async" />
            </div>
            <div className="cfb-evidence-grid">
              <CsImage
                src={`${CFB_PHOTOS}/wireframe-blueprint.png`}
                alt="Blue wireframe collage showing Code for Build app screens and lesson states."
                caption="Early screens explored how code, output, lessons, and block previews could live inside one phone-first learning flow."
                aspectRatio="1 / 1"
              />
              <CsImage
                src={`${CFB_PHOTOS}/block-system-guide.png`}
                alt="Guide explaining Body Block, Container, Padding, Image Block, Icons Block, Button, and Text blocks."
                caption="The block language became the core teaching layer: abstract HTML and CSS ideas were translated into pieces a beginner could inspect."
                aspectRatio="1 / 1"
              />
            </div>
          </div>
        </section>

        <CsSection id="cs-result" label="Result" title="Connect code to its output">
          <CsBody>
            <p className="cs-caption">Interaction prototype. Learning outcomes have not been established by a documented comparative study.</p>
            <p>Learners switch between the rendered page and its 3D structure to see how each block changes the output.</p>
          </CsBody>
          <CsImage
            src={`${CFB_PHOTOS}/two-phones.png`}
            alt="Two Code for Build app screens showing visual code blocks and a 3D layout explanation"
            caption="The prototype pairs phone UI, block structure, and a 3D layout model so the learner can connect output to structure."
          />
          <div className="cfb-result-grid">
            <CsImage
              src={`${CFB_PHOTOS}/output-code-pair.png`}
              alt="Two tilted phone mockups showing output and code states in Code for Build."
              caption="The same lesson can be read as output first or code first, depending on what the learner is trying to understand."
            />
            <div className="cfb-block-card">
              <img {...projectImageProps(`${CFB_PHOTOS}/block-kit.png`)} data-project-preview src={`${CFB_PHOTOS}/block-kit.png`} alt="Color-coded 3D block kit for Code for Build." loading="lazy" decoding="async" />
              <div>
                <h3>Block kit</h3>
                <p>Body, container, padding, image, icon, text, and button blocks form the visual grammar of the prototype.</p>
              </div>
            </div>
          </div>
          <CsImage
            src={`${CFB_PHOTOS}/app-screens-collage.png`}
            alt="Collage of Code for Build mobile screens showing lessons, code view, and output view."
            caption="The screen set shows the app moving between lesson selection, structure explanation, code preview, and final output."
            className="cfb-collage"
          />
        </CsSection>

        <CsSection id="cs-learning" label="Learning" title="What I Learned">
          <div className="cfb-learning-visuals" aria-label="Code for Build block system examples">
            <img {...projectImageProps(`${CFB_PHOTOS}/body-block.png`)} data-project-preview src={`${CFB_PHOTOS}/body-block.png`} alt="Single isometric body block." loading="lazy" decoding="async" />
            <img {...projectImageProps(`${CFB_PHOTOS}/block-stack.png`)} data-project-preview src={`${CFB_PHOTOS}/block-stack.png`} alt="Vertical stack of colored blocks." loading="lazy" decoding="async" />
          </div>
          <CsFeatureGrid
            className="cs-feature-grid--plain"
            features={[
              { title: 'Metaphors need limits', desc: 'Blocks made layout approachable, but the interface had to avoid showing too many layers at once.' },
              { title: 'Education is pacing', desc: 'The learner needs one clear next concept, not a wall of features or a full visual system upfront.' },
              { title: 'Small screens sharpen hierarchy', desc: 'The phone constraint forced the 3D view, lesson flow, and code explanation to fight for attention. Progressive disclosure became the main design lesson.' },
            ]}
          />
        </CsSection>

        <CsThanks />
        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-glimpse', label: 'Glimpse' },
          { id: 'cs-process', label: 'Process' },
          { id: 'cs-result', label: 'Result' },
          { id: 'cs-learning', label: 'Learning' },
        ]} />
      </main>

      <NextProject slug="typeface" title="Butler's Slice" image="/Assets/images/typeface.webp" />
      <Footer />
    </>
  )
}
