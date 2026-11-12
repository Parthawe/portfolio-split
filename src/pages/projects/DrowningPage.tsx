import ScenicStudy from '../../components/case-study/ScenicStudy'
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
import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'

const DROWNING_PHOTOS = '/Assets/Projects/Drowning/photos'
const drowningImages = {
  unlit: `${DROWNING_PHOTOS}/A4 - 3.png`,
  revealed: `${DROWNING_PHOTOS}/WhatsApp Image 2024-10-10 at 11.54.18.webp`,
  concept: `${DROWNING_PHOTOS}/A4 - 3.png`,
  conceptDetail: `${DROWNING_PHOTOS}/A4 - 4.webp`,
  design: `${DROWNING_PHOTOS}/A4 - 5.png`,
  designDetail: `${DROWNING_PHOTOS}/A4 - 6.png`,
  production: `${DROWNING_PHOTOS}/WhatsApp Image 2024-10-10 at 11.54.18.webp`,
  productionDetail: `${DROWNING_PHOTOS}/A4 - 12.png`,
}

export default function DrowningPage() {
  return (
    <>
      <Helmet>
        <title>Drowning &middot; Parth Pawar</title>
        <meta name="description" content="Scenic design for stage production inspired by abandoned greenhouse aesthetics, a set design and creative technology project." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Drowning · Parth Pawar" />
        <meta property="og:description" content="Scenic design for stage production inspired by abandoned greenhouse aesthetics." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/drowning.jpg" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#5D7B6F' } as React.CSSProperties}>

        <ProjectHeader
          heroFraming="image"
          backLink="/work"
          categorySlug="installations"
          backLabel="Back to Work"
          tags={['Set Design', 'Creative Technology']}
          title="Drowning"
          subtitle="Scenic design for stage production inspired by abandoned greenhouse aesthetics"
          info={[
            { label: 'Year', value: '2024' },
            { label: 'Role', value: 'Set Designer' },
          ]}
        />

        <CsMediaSpotlight
          id="cs-film"
          label="Watch first"
          title="A room losing air"
          lede="The film shows what the set does best: a greenhouse that feels beautiful, fragile, and slowly enclosing the performers."
        >
          <ExternalVideo
            src="https://player.vimeo.com/video/1026164956"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="Drowning"
          />
        </CsMediaSpotlight>

        {/* Interactive, early proof */}
        <CsSection id="cs-lighting" label="Interactive" title="Light Transforms the Space">
          <CsBody>
            <p>Compare the original model photograph with the scene boards. These are different views of the scenic study, rather than two frames of one lighting transition.</p>
          </CsBody>
          <div className="project-content-block">
            <CsScreenExplorer format="landscape" label="Choose a Drowning scenic study" screens={[
              { title: 'The greenhouse model', label: 'Structure and planting', src: drowningImages.revealed, alt: 'Front view of the greenhouse scenic model with two figures', caption: 'The roof frame, dense planting, open doorway, and bare ground establish the enclosure.' },
              { title: 'Stephen enters', label: 'Scene 2 board', src: drowningImages.concept, alt: 'Scene 2 presentation board: Stephen enters while Pea is seated', caption: 'The original board describes stillness, dim light, and Stephen’s presence at the edge of the scene.' },
              { title: 'Pea’s breakdown', label: 'Scene 3 board', src: drowningImages.designDetail, alt: 'Scene 3 presentation board with a warm-lit model and shadow studies', caption: 'The board proposes deeper shadows and water-like reflections. It records a lighting intention, not a completed full-scale effect.' },
            ]} />
          </div>
        </CsSection>

        {/* Overview */}
        <CsSection label="Overview" title="Abandoned Greenhouse">
          <CsBody>
            <p>Drowning needed a black-box set that felt sheltering and suffocating at the same time. The abandoned greenhouse gave the production that contradiction: cracked transparency, overgrown life, and a room that seemed to close in as the play progressed.</p>
            <p>The surviving documentation is a scenic model, scene boards, and a film. The model lets the arrangement of figures, vegetation, and architectural frames be studied together.</p>
          </CsBody>
        </CsSection>

        {/* Concept */}
        <section className="wrap"><ScenicStudy kind="drowning" /></section>

        <CsExpandPreview>
        <section className="cs-section reveal" id="cs-concept">
          <div className="wrap">
            <p className="cs-section-label">01 &mdash; Concept</p>
            <h3 className="cs-section-title">Concept</h3>
            <CsBody>
              <p>The set needed to feel protective and suffocating at once. I used abandoned greenhouse references for that tension: cracked transparency, overgrowth, corrosion, and light that never feels fully clean.</p>
              <p>The final direction became a partial enclosure of frosted panels, salvaged frames, and trailing plants. It kept sightlines open while making the room feel like it was slowly closing in.</p>
            </CsBody>
          </div>
          <div className="wrap">
            <img data-project-preview src={drowningImages.concept} alt="Scene 2 board: Stephen enters, with notes on stillness and dim light" loading="lazy" />
          </div>
          <div className="wrap">
            <img data-project-preview src={drowningImages.conceptDetail} alt="Scene 2 board: Rae and Stephen discussing Pea, with notes on isolation" loading="lazy" />
          </div>
        </section>

        {/* Design */}
        <section className="cs-section reveal" id="cs-design">
          <div className="wrap">
            <p className="cs-section-label">02 &mdash; Design</p>
            <h3 className="cs-section-title">Design</h3>
            <CsBody>
              <p>The model is arranged in layers: vegetation in front, a greenhouse frame through the middle, and a gridded wall behind. Doorways and gaps keep the figures visible within that enclosure.</p>
              <p>The scene boards use light and shadow to change the emphasis within the same model. They show how a character can become isolated without replacing the architecture.</p>
            </CsBody>
          </div>
          <div className="wrap">
            <img data-project-preview src={drowningImages.design} alt="Scene 3 board: Pea’s emotional breakdown, with a close spotlight" loading="lazy" />
          </div>
          <div className="wrap">
            <img data-project-preview src={drowningImages.designDetail} alt="Scene 3 board: deeper shadows and proposed water-like reflections" loading="lazy" />
          </div>
        </section>

        {/* Production */}
        <section className="cs-section reveal" id="cs-production">
          <div className="wrap">
            <p className="cs-section-label">03 &mdash; Production</p>
            <h3 className="cs-section-title">Production</h3>
            <CsBody>
              <p>The final model brings the frame, foliage, furniture, and figures into one composition. The annotated view below identifies the final arrangement of the characters.</p>
              <p>These photographs document the scale model. They do not establish a full-scale construction schedule, material specification, or safety certification.</p>
            </CsBody>
          </div>
          <div className="wrap">
            <img data-project-preview src={drowningImages.production} alt="Completed greenhouse scenic model viewed from the front" loading="lazy" />
          </div>
          <div className="wrap">
            <img data-project-preview src={drowningImages.productionDetail} alt="Annotated model photograph identifying character positions at the end of the play" loading="lazy" />
          </div>
        </section>

        {/* Reflections */}
        <CsSection label="04, Reflections" title="Designing for Physical Space">
          <CsBody>
            <p><strong>Texture carries the atmosphere.</strong> Dense foliage and exposed framing make the same enclosure feel both occupied and abandoned.</p>
            <p><strong>Light changes the focus.</strong> The scene boards test where the audience looks as the relationship between the characters changes.</p>
            <p><strong>The next step is a full-scale test.</strong> Sightlines, performer movement, and the proposed water-like reflections would need to be checked in the performance space.</p>
          </CsBody>
        </CsSection>

        <CsThanks />

        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-film', label: 'Film' },
          { id: 'cs-lighting', label: 'Lighting' },
          { id: 'cs-concept', label: 'Concept' },
          { id: 'cs-design', label: 'Design' },
          { id: 'cs-production', label: 'Production' },
        ]} />

      </main>

      <NextProject slug="tedx" title="TEDx VIT Pune" image="/Assets/images/tedx.jpg" />
      <Footer />
    </>
  )
}
