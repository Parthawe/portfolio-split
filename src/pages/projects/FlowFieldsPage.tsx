import GenerativeCanvas from '../../components/GenerativeCanvas'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsFeatureGrid from '../../components/case-study/CsFeatureGrid'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function FlowFieldsPage() {
  return (
    <>
      <Helmet>
        <title>Flow Fields &middot; Parth Pawar</title>
        <meta name="description" content="A small generative-art study using Perlin noise, particle movement, and tuned visual constraints to create organic flow-field patterns." />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#4f8cff' } as React.CSSProperties}>
        <ProjectHeader
          showHeaderSummary={false}
          backLink="/work"
          categorySlug="creative-tech"
          backLabel="Back to Work"
          tags={['Generative Art', 'p5.js', 'Perlin Noise']}
          title="Flow Fields"
          subtitle="A generative-art study of how particle speed, trails, and density reveal a noise field."
          info={[
            { label: 'Context', value: 'Creative coding study' },
            { label: 'Year', value: '2024' },
            { label: 'Role', value: 'Creative coder' },
            { label: 'Tools', value: 'p5.js, JavaScript, noise fields' },
          ]}
          heroImage="/Assets/images/flow-fields.svg"
          heroAlt="Static illustration of a flow-field pattern."
        />

        <CsSection id="cs-glimpse" label="01 &mdash; Glimpse" title="Making a hidden field visible">
          <CsBody>
            <p>A noise field becomes visible through the particles moving across it. I tuned velocity, trail opacity, and particle resets to make currents readable without filling the canvas with visual noise.</p>
            <p>The cover is a static illustration. The original running sketch is not included in this archive.</p>
          </CsBody>
        </CsSection>

        <CsSection id="cs-flow-demo" label="02 &mdash; Demonstration" title="Watch the paths accumulate">
          <CsBody><p>This portfolio demonstration uses the existing noise-field canvas implementation. It illustrates the technique; it is not a recovered copy of the original 2024 sketch.</p><p>Start the animation, let the trails develop, then pause to inspect their direction. Move a pointer through the field to compare its undisturbed paths with local attraction.</p></CsBody>
          <GenerativeCanvas flowOnly />
        </CsSection>

        <CsSection id="cs-learnings" label="03 &mdash; Learning" title="Three visual controls">
          <CsFeatureGrid features={[
  {
    "title": "Velocity",
    "desc": "Particle speed changes how quickly the field becomes visible and how sharply its paths turn."
  },
  {
    "title": "Trails",
    "desc": "Opacity and trail length control how much history remains on the canvas. Longer trails reveal currents but can obscure new movement."
  },
  {
    "title": "Reset behavior",
    "desc": "Particle lifetime and resets regulate density. They determine when the image clears enough for a new pattern to emerge."
  }
]} />
        </CsSection>

        <CsSection id="cs-impact" label="04 &mdash; Related study" title="Available material">
          <CsBody>
            <p>For an available interactive study with restored source, try <a href="/comp-media" className="project-text-link">Computational Media</a>. It uses camera pixels and wandering particles.</p>
          </CsBody>
        </CsSection>

        <CsThanks />


        <BottomNav sections={[
          { id: 'cs-glimpse', label: 'Glimpse' },
          { id: 'cs-flow-demo', label: 'Try the field' },
          { id: 'cs-learnings', label: 'Learning' },
          { id: 'cs-impact', label: 'Impact' },
        ]} />
      </main>

      <NextProject slug="embodied-web" title="Embodied Web" image="/Assets/images/embodied-web.svg" />
      <Footer />
    </>
  )
}
