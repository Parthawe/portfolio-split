import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from "../../components/case-study/CsExpandPreview"
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import PixelPainting from '../../components/PixelPainting'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function IntroCompMediaPage() {
  return (
    <>
      <Helmet>
        <title>Computational Media &middot; Parth Pawar</title>
        <meta name="description" content="A camera-pixel painting experiment from NYU ITP computational-media coursework, with a working restoration and original p5.js source." />
      </Helmet>
      <Nav />
      <main id="main-content" className="project-main" style={{ '--project-color': '#e84393' } as React.CSSProperties}>
        <ProjectHeader
          backLink="/work" categorySlug="creative-tech" backLabel="Back to Work"
          tags={['Creative Coding', 'p5.js', 'Generative']}
          title="Computational Media"
          subtitle="Painting with camera pixels, wandering particles, and translucent marks"
          info={[
            { label: 'Context', value: 'Intro to Computational Media, NYU ITP' },
            { label: 'Year', value: '2023' },
            { label: 'Role', value: 'Creative Coder' },
            { label: 'Tools', value: 'p5.js, JavaScript, HTML Canvas' },
          ]}
        />
        <CsSection id="cs-sketch" label="Experiment" title="Paint with pixels">
          <CsBody><p>Two hundred particles wander across the canvas. Each samples a color from a small camera image and leaves a translucent mark. Change the opacity to see how quickly the image builds.</p></CsBody>
          <PixelPainting />
        </CsSection>
        <CsExpandPreview>
        <CsSection id="cs-overview" label="Source" title="From the original sketch">
          <CsBody>
            <p>The surviving coursework files contain the camera setup, a 200-particle system, and an opacity slider. Each particle moves randomly by up to ten pixels per axis, samples the camera color below it, and draws a small ellipse. Marks accumulate because the canvas is not cleared between frames.</p>
            <p>The version above restores that behavior in the browser. It adds a sample portrait, explicit camera permission, and pause controls. It is a restoration of the archived code, not a recording of the original submission.</p>
            <div className="icm-source-links">
              <a href="/Assets/Projects/comp-media/source/paintingpixels.js.txt" download>Original painting sketch</a>
              <a href="/Assets/Projects/comp-media/source/particle.js.txt" download>Original particle code</a>
              <a href="/Assets/Projects/comp-media/source/index.html.txt" download>Original page</a>
            </div>
          </CsBody>
        </CsSection>
        <CsSection id="cs-mechanism" label="Mechanism" title="Three rules make the image">
          <CsBody>
            <p><strong>Sample:</strong> a 40 × 30 image supplies color to a 640 × 480 canvas. One source pixel covers a sixteen-pixel step in the drawing.</p>
            <p><strong>Wander:</strong> particles take small random steps and stay within the canvas. Their paths determine where paint collects.</p>
            <p><strong>Layer:</strong> the opacity slider controls how much each mark covers earlier marks. Low opacity leaves a longer visual history; high opacity reveals the current input faster.</p>
          </CsBody>
        </CsSection>
        <CsThanks />
        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-sketch', label: 'Try the sketch' },
          { id: 'cs-overview', label: 'Original source' },
          { id: 'cs-mechanism', label: 'How it works' },
        ]} />
      </main>
      <NextProject slug="flow-fields" title="Flow Fields" image="/Assets/images/flow-fields.svg" />
      <Footer />
    </>
  )
}
