import ScenicStudy from '../../components/case-study/ScenicStudy'
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

const DUMB_WAITER_PHOTOS = '/Assets/Projects/dumb-waiter/photos'
const dumbWaiterImages = {
  hero: `${DUMB_WAITER_PHOTOS}/set-wide.jpg`,
  stairs: `${DUMB_WAITER_PHOTOS}/stairs-close.jpg`,
  wall: `${DUMB_WAITER_PHOTOS}/ben-gus-wall.jpg`,
  weaponWall: `${DUMB_WAITER_PHOTOS}/weapon-wall.jpg`,
  emptyRoom: `${DUMB_WAITER_PHOTOS}/empty-room.jpg`,
  roomDepth: `${DUMB_WAITER_PHOTOS}/room-depth.jpg`,
  doorway: `${DUMB_WAITER_PHOTOS}/doorway-hitman.jpg`,
  overhead: `${DUMB_WAITER_PHOTOS}/overhead-room.jpg`,
  props: `${DUMB_WAITER_PHOTOS}/props-flatlay.jpg`,
  model: `${DUMB_WAITER_PHOTOS}/model-full-props.jpg`,
  bathMirror: `${DUMB_WAITER_PHOTOS}/bath-mirror.jpg`,
  staircaseWeapons: `${DUMB_WAITER_PHOTOS}/staircase-weapons.jpg`,
}

export default function DumbWaiterPage() {
  return (
    <>
      <Helmet>
        <title>Set Design for Pinter&apos;s The Dumb Waiter &middot; Parth Pawar</title>
        <meta name="description" content="Set design model for Harold Pinter's The Dumb Waiter, staged as a John Wick-inspired basement room for two hitmen waiting under invisible authority." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Set Design for Pinter's The Dumb Waiter · Parth Pawar" />
        <meta property="og:description" content="A cinematic basement set model for two hitmen, an unseen boss, and a dumb waiter that turns waiting into threat." />
        <meta property="og:image" content="https://designwhich.works/Assets/Projects/dumb-waiter/photos/set-wide.jpg" />
      </Helmet>

      <Nav />

      <main
        id="main-content"
        className="project-main project-main--dumb-waiter"
        style={{ '--project-color': '#8D6A4B' } as React.CSSProperties}
      >
        <ProjectHeader
          heroFraming="image"
          backLink="/work"
          categorySlug="installations"
          backLabel="Back to Work"
          tags={['Set Design', 'Theatre', 'Model Making', 'Cinematic Staging']}
          title="Set Design for Pinter's The Dumb Waiter"
          subtitle="A John Wick-inflected basement model for two hitmen waiting under an unseen system."
          info={[
            { label: 'Year', value: '2024' },
            { label: 'Role', value: 'Set Designer' },
            { label: 'Format', value: 'Scenic model' },
            { label: 'Text', value: 'Harold Pinter' },
          ]}
          heroImage={dumbWaiterImages.hero}
          heroAlt="Wide front view of the Dumb Waiter scenic model inside a black stage frame."
        />

        <CsMediaSpotlight
          id="cs-set"
          label="Set first"
          title="A basement built like a threat"
          lede="The model treats Pinter's waiting room as a pressure chamber: a basement with beds, doors, weapons, a gramophone, and a dumb waiter that behaves like an unseen command system."
          actionLabel="Scenic model"
        >
          <img data-project-preview
            src={dumbWaiterImages.wall}
            alt="Close scenic model view showing Ben and Gus staged near the stairs, bed, and dark wall."
            loading="lazy"
            decoding="async"
          />
        </CsMediaSpotlight>

        <CsSection id="cs-overview" label="Overview" title="Waiting as Violence">
          <CsBody>
            <p>The Dumb Waiter is a one-act play about Ben and Gus, two hitmen trapped in a basement room while they wait for instructions. Nothing dramatic seems to happen at first: they argue, correct each other, fuss over tea, and circle around the question of who their next target will be.</p>
            <p>I designed the room as a polished criminal basement rather than a naturalistic flat. The John Wick reference gave the model a hard visual language: dark walls, a weapons display, warm wood, sharp thresholds, and objects that make ordinary waiting feel choreographed and dangerous.</p>
          </CsBody>
        </CsSection>

        <section className="wrap"><ScenicStudy kind="dumb-waiter" /></section>

        <CsExpandPreview>
          <section className="cs-section reveal" id="cs-concept">
            <div className="wrap">
              <p className="cs-section-label">01 &mdash; Concept</p>
              <h3 className="cs-section-title">Concept</h3>
              <CsBody>
                <p>The central idea was to make the room feel controlled from above. The dumb waiter is small, but it changes the scale of the entire space: every object becomes evidence that someone unseen is watching, judging, and sending orders down.</p>
                <p>Ben and Gus are not placed in a messy hideout. They are placed inside a clean, curated machine for violence. That contrast lets the comedy of their small talk sit next to the dread of what the room is built to do.</p>
              </CsBody>
            </div>
            <div className="wrap dumb-waiter-media-grid">
              <img data-project-preview className="dumb-waiter-photo" src={dumbWaiterImages.roomDepth} alt="Depth view through the basement scenic model with Ben and Gus in the room." loading="lazy" decoding="async" />
              <img data-project-preview className="dumb-waiter-photo" src={dumbWaiterImages.doorway} alt="Close view of a hitman figure framed in a narrow doorway." loading="lazy" decoding="async" />
            </div>
          </section>

          <section className="cs-section reveal" id="cs-space">
            <div className="wrap">
              <p className="cs-section-label">02 &mdash; Spatial System</p>
              <h3 className="cs-section-title">Spatial System</h3>
              <CsBody>
                <p>The set is organized around pressure points: the raised stair landing, the sleeping area, the speaking wall, the bathroom door, and the dumb waiter. Each zone gives the actors somewhere to wait, hide, listen, or be cornered.</p>
                <p>The room stays mostly open, but the sightlines are sliced by the stairs and wall openings. From the audience, Ben and Gus can look exposed and trapped at the same time.</p>
              </CsBody>
            </div>
            <div className="wrap dumb-waiter-media-grid dumb-waiter-media-grid--wide">
              <img data-project-preview className="dumb-waiter-photo" src={dumbWaiterImages.overhead} alt="Overhead view of the scenic model showing stair, bed, gramophone, and wall placement." loading="lazy" decoding="async" />
              <img data-project-preview className="dumb-waiter-photo" src={dumbWaiterImages.staircaseWeapons} alt="Overhead detail of the staircase and weapons wall in the scenic model." loading="lazy" decoding="async" />
            </div>
          </section>

          <section className="cs-section reveal" id="cs-details">
            <div className="wrap">
              <p className="cs-section-label">03 &mdash; Details</p>
              <h3 className="cs-section-title">Objects That Keep Score</h3>
              <CsBody>
                <p>The props carry the play's power structure. The beds make the basement domestic, the weapons make it professional, the bathroom makes it humiliating, and the dumb waiter turns a wall opening into command, surveillance, and threat.</p>
                <p>The gramophone, rug, wood shutters, and black surfaces keep the room from becoming a plain basement. They make it feel like a criminal waiting room with taste, ritual, and a little too much control.</p>
              </CsBody>
            </div>
            <div className="wrap dumb-waiter-media-grid">
              <img data-project-preview className="dumb-waiter-photo" src={dumbWaiterImages.weaponWall} alt="Close view of the weapons wall and dumb waiter opening." loading="lazy" decoding="async" />
              <img data-project-preview className="dumb-waiter-photo" src={dumbWaiterImages.bathMirror} alt="Bathroom and mirror detail seen through a narrow dark opening." loading="lazy" decoding="async" />
            </div>
            <div className="wrap">
              <img data-project-preview className="dumb-waiter-photo dumb-waiter-photo--panorama" src={dumbWaiterImages.props} alt="Flat lay of miniature props used in the Dumb Waiter scenic model." loading="lazy" decoding="async" />
            </div>
          </section>

          <section className="cs-section reveal" id="cs-model">
            <div className="wrap">
              <p className="cs-section-label">04 &mdash; Model</p>
              <h3 className="cs-section-title">Built to Read From Every Angle</h3>
              <CsBody>
                <p>The model works as a stage proposal and as a camera object. Wide views show the room as a boxed trap; close views let the audience inspect the little systems of power: the tube, the doorways, the staircase, and the weapons.</p>
                <p>That mattered because the play itself works by withholding. The set had to give the audience enough to read the world, while still keeping the real source of authority outside the frame.</p>
              </CsBody>
            </div>
            <div className="wrap dumb-waiter-media-grid dumb-waiter-media-grid--wide">
              <img data-project-preview className="dumb-waiter-photo" src={dumbWaiterImages.model} alt="Full scenic model with the assembled room and loose props in front." loading="lazy" decoding="async" />
              <img data-project-preview className="dumb-waiter-photo" src={dumbWaiterImages.emptyRoom} alt="Empty-room view of the scenic model with stairs, rug, bed, and dark walls." loading="lazy" decoding="async" />
            </div>
          </section>

          <CsSection id="cs-reflections" label="05, Reflections" title="Designing the Offstage">
            <CsBody>
              <p><strong>The threat is architectural.</strong> The room matters because the most powerful character never enters it.</p>
              <p><strong>Objects can behave like dialogue.</strong> The dumb waiter, doors, beds, and weapons all ask the same question as the text: who is in control?</p>
              <p><strong>Cinematic references need discipline.</strong> The John Wick tone helped sharpen the room, but Pinter's tension still comes from restraint, silence, and waiting.</p>
            </CsBody>
          </CsSection>

          <CsThanks />
        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-set', label: 'Set' },
          { id: 'cs-overview', label: 'Overview' },
          { id: 'cs-concept', label: 'Concept' },
          { id: 'cs-space', label: 'Space' },
          { id: 'cs-details', label: 'Details' },
        ]} />
      </main>

      <NextProject slug="drowning" title="Drowning" image="/Assets/images/drowning.jpg" />
      <Footer />
    </>
  )
}
