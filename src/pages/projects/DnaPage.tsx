import { projectImageProps } from '../../utils/projectImage'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsImage from '../../components/case-study/CsImage'
import CsFeatureGrid from '../../components/case-study/CsFeatureGrid'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function DnaPage() {
  return (
    <>
      <Helmet>
        <title>DNA: Speculative Design &middot; Parth Pawar</title>
        <meta name="description" content="A compact glimpse of a speculative design artifact asking whether people would take a pill to live longer." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="DNA: Speculative Design &middot; Parth Pawar" />
        <meta property="og:description" content="Speculative pharmaceutical packaging exploring immortality, mortality, and choice." />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#2E5BFF' } as React.CSSProperties}>
        <ProjectHeader
          backLink="/work"
          categorySlug="creative-tech"
          backLabel="Back to Work"
          tags={['Speculative Design', 'Bioart']}
          title="Would You Take a Pill to Live Forever?"
          subtitle="A speculative artifact that presents immortality as a product choice."
          info={[
            { label: 'Context', value: 'NYU ITP' },
            { label: 'Role', value: 'Creator' },
            { label: 'Year', value: '2024' },
          ]}
        />

        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid project-image-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/DNA/photos/boxes-closed.webp")} data-project-preview src="/Assets/Projects/DNA/photos/boxes-closed.webp" alt="Two speculative pharmaceutical boxes: Live 50+ Years More and Embrace Death" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/DNA/photos/boxes-open.png")} data-project-preview src="/Assets/Projects/DNA/photos/boxes-open.png" alt="Open pharmaceutical boxes with inserts, cards, and pill packaging" loading="lazy" /></div>
            </div>
          </div>
        </section>

        <CsSection id="cs-glimpse" label="Glimpse" title="Putting the choice in someone’s hands">
          <CsBody>
            <p>This is a compact speculative design project. Instead of writing about the ethics of anti-aging, I built two believable pharmaceutical artifacts: one promising extended life, the other asking the participant to accept mortality. The intended pause is the choice between those two offers.</p>
          </CsBody>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Problem</span>
            <span className="cs-label-row-val">Immortality debates often stay abstract, which makes the ethical tension easy to dodge.</span>
          </div>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Method</span>
            <span className="cs-label-row-val">Turn the question into packaging, dosage cards, warnings, and physical choice architecture.</span>
          </div>
          <div className="cs-label-row project-label-row--open">
            <span className="cs-label-row-key">Result</span>
            <span className="cs-label-row-val">A finished set of fictional packaging and inserts presenting two opposing choices. Audience response is not documented as a study here.</span>
          </div>
        </CsSection>

        <CsExpandPreview
          cta="Open the artifact details"
          note="Dosage cards, packaging proof, impact notes, and the final message card."
        >
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid project-image-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/DNA/photos/dosage-card.webp")} data-project-preview src="/Assets/Projects/DNA/photos/dosage-card.webp" alt="Dosage and precautions card for the speculative pill" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/DNA/photos/pill-pack.webp")} data-project-preview src="/Assets/Projects/DNA/photos/pill-pack.webp" alt="Speculative pill blister pack labeled Unlock More Life" loading="lazy" /></div>
            </div>
          </div>
        </section>

        <CsSection id="cs-impact" label="Impact" title="The intended provocation">
          <CsFeatureGrid features={[
            { title: 'A familiar format', desc: 'Pharmaceutical packaging gives the fictional offer a recognizable form.' },
            { title: 'The choice was visible', desc: 'Two boxes turned a broad ethics prompt into a direct decision between extension and acceptance.' },
            { title: 'Details to question', desc: 'Warnings and dosage language invite inspection of what the fictional product asks someone to accept.' },
          ]} />
        </CsSection>

        <CsSection id="cs-learning" label="Learning" title="What the object makes discussable">
          <CsBody>
            <p>Speculative design needs enough realism to make the audience uneasy. If the artifact feels unfinished, people treat the scenario like fiction. When the details feel familiar, they start asking what they would actually do. That was the main lesson: the object carries the argument before the text does.</p>
          </CsBody>
          <CsImage
            src="/Assets/Projects/DNA/photos/card-final-message.webp"
            alt="Final message card from the Embrace Death artifact"
            caption="The supporting cards shifted the project from a prop into a small decision system."
          />
        </CsSection>

        <CsThanks />

        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-glimpse', label: 'Glimpse' },
          { id: 'cs-impact', label: 'Impact' },
          { id: 'cs-learning', label: 'Learning' },
        ]} />
      </main>

      <NextProject slug="uv-light" title="UV Light" image="/Assets/images/uv-light.jpg" />
      <Footer />
    </>
  )
}
