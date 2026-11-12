import { projectImageProps } from '../../utils/projectImage'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsBody from '../../components/case-study/CsBody'
import CsNumList from '../../components/case-study/CsNumList'
import CsCredits from '../../components/case-study/CsCredits'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function UvLightPage() {
  return (
    <>
      <Helmet>
        <title>UV Light Experience &middot; Parth Pawar</title>
        <meta name="description" content="Blacklight installation using invisible ink, hidden messages, and staged room sequencing to make participants search for what was being monitored." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="UV Light Installation &middot; Parth Pawar" />
        <meta property="og:description" content="Blacklight installation with invisible ink, hidden messages, staged rooms, and a surveillance reveal." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/uv-light.jpg" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#6B46C1' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="installations"
          backLabel="Back to Work"
          tags={['Installation', 'Experience Design', 'Art']}
          title="UV Light Experience"
          subtitle="A blacklight installation that reveals hidden messages as visitors move through the space."
          info={[
            { label: 'Client', value: 'NYU \u2013 ITP' },
            { label: 'Scope of Work', value: 'Experience Design' },
            { label: 'Role', value: 'Artist' },
            { label: 'Duration', value: '2 Weeks' },
            { label: 'Year', value: '2023' },
          ]}
          heroImage="/Assets/Projects/UVLight/photos/image-5.png"
          heroAlt="UV Light blacklight installation with participants searching for hidden messages"
        />

        {/* The Concept */}
        <section className="cs-section reveal" id="cs-background">
          <div className="wrap">
            <p className="cs-section-label">Background</p>
            <h2 className="cs-display">What the Piece Was Really About</h2>
            <CsBody>
              <p>The piece asked what changes when the important information is present, but not visible yet. Blacklight and invisible ink made that delay physical.</p>
              <p>Under normal light, the room felt harmless. Under UV, a second layer appeared, turning discovery into a question about observation and surveillance.</p>
              <p>I shaped the concept, room sequence, UV logic, participant flow, and live execution.</p>
            </CsBody>
          </div>
        </section>

        <CsExpandPreview
          ctaLabel="Open the full installation story"
          note="Research, room sequencing, UV tests, documentation, credits, and reflection."
        >

        {/* Research */}
        <section className="cs-section reveal" id="cs-discovery">
          <div className="wrap">
            <p className="cs-section-label">Discovery</p>
            <h2 className="cs-display">What the Research Clarified</h2>
            <CsBody>
              <p>The research pushed the work toward participatory theater, where curiosity and social cues guide people better than instructions.</p>
              <p>UV also behaved differently on paper, tape, clothes, skin, and walls. That unpredictability made the room feel alive instead of decorated.</p>
            </CsBody>
          </div>
        </section>

        {/* Ideation */}
        <section className="cs-section reveal" id="cs-exploration">
          <div className="wrap">
            <p className="cs-section-label">Exploration</p>
            <h2 className="cs-display">Designing for Discovery, Not Explanation</h2>
            <CsBody>
              <p>The risk was explaining too fast. I tested inks, paints, tape, and lighting until the clues felt discoverable without feeling scripted.</p>
              <p>The camera-feed layer worked because it arrived after people had relaxed into play. The room first invited them in, then revealed they were being watched.</p>
            </CsBody>
            <div className="cs-img-full"><img {...projectImageProps("/Assets/Projects/UVLight/photos/1000051727.webp")} data-project-preview src="/Assets/Projects/UVLight/photos/1000051727.webp" alt="Whiteboard brainstorming: room layouts, puzzle concepts, and interaction flow sketches" loading="lazy" /></div>
            <div className="cs-img-grid project-image-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/UVLight/photos/1000051740.png")} data-project-preview src="/Assets/Projects/UVLight/photos/1000051740.png" alt="Observation whiteboard: show rather than tell, bias, monitoring concepts" loading="lazy" /></div>
              <figure className="cs-img reveal">
                <img {...projectImageProps("/Assets/Projects/UVLight/photos/1000051772.png")} data-project-preview src="/Assets/Projects/UVLight/photos/1000051772.png" alt="Whiteboard close-up of an early four-room concept, murder, stolen data, money heist, with timing math for cycling groups of participants through the rooms" loading="lazy" decoding="async" />
                <figcaption className="cs-img-caption">An early version was four themed rooms, murder, stolen data, money heist, with the math for how many minutes each group could get before the pacing collapsed.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="cs-section reveal" id="cs-making">
          <div className="wrap">
            <p className="cs-section-label">Making</p>
            <h2 className="cs-display">Building the Reveal Across Rooms</h2>
            <CsBody>
              <p>The installation unfolded as a sequence: first hidden marks and prompts, then the reveal that the act of discovery was also being observed.</p>
              <p>We converted classrooms into controlled UV spaces, sealed light leaks, tuned blacklight coverage, and added the live-feed layer that changed the room&rsquo;s meaning.</p>
            </CsBody>
            <div className="cs-img-full"><img {...projectImageProps("/Assets/Projects/UVLight/photos/screenshot-2023-12-21-at-3.51-1.png")} data-project-preview src="/Assets/Projects/UVLight/photos/screenshot-2023-12-21-at-3.51-1.png" alt="The blacklight stage before participants entered: fluorescent tape letters and glowing UV dots scattered across the dark floor, with a banner reading TELL in the foreground" loading="lazy" decoding="async" /></div>
          </div>
        </section>

        {/* Unfold of Act */}
        <section className="cs-section reveal" id="cs-narrative">
          <div className="wrap">
            <p className="cs-section-label">Narrative</p>
            <h2 className="cs-display">How the Reveal Unfolded</h2>
            <CsNumList items={[
              <><strong>Arrival and Grouping</strong> &mdash; Participants were organized into groups of four and ushered into the first room.</>,
              <><strong>The UV Revelation</strong> &mdash; Initially handed blank paper, attendees discovered hidden drawings under UV light upon entering the room. Each revealed piece contributed to a larger painting.</>,
              <><strong>Completion of the Puzzle Painting</strong> &mdash; After completing their individual drawings, participants placed them strategically to form a cohesive puzzle painting.</>,
              <><strong>The Closing Performance</strong> &mdash; The sequence ended with a short Van Gogh-themed performance in the second room, closing with a paper violin placed at the center of the finished puzzle painting.</>,
            ]} />
          </div>
        </section>

        {/* Van Gogh inspiration */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid project-image-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/UVLight/photos/image-4.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-4.png" alt="Van Gogh Almond Blossom pamphlet held during the experience setup" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/UVLight/photos/letter---1.png")} data-project-preview src="/Assets/Projects/UVLight/photos/letter---1.png" alt="Van Gogh letter pamphlet: Paint the Soul" loading="lazy" /></div>
            </div>
            <p className="cs-caption">Van Gogh's Almond Blossom and letters served as the thematic anchor, connecting art, observation, and hidden meaning</p>
          </div>
        </section>

        {/* UV room experience */}
        <section className="cs-section reveal">
          <div className="wrap">
            <p className="cs-section-label">Documentation</p>
            <h2 className="cs-section-title">The Experience</h2>
            <div className="cs-img-grid project-image-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/UVLight/photos/image-1.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-1.png" alt="UV-lit room: participants discovering hidden projections under blacklight" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/UVLight/photos/image-2.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-2.png" alt="Participant discovering hidden UV drawings on the floor" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* Hidden Messages & Portraits */}
        <section className="cs-section reveal" id="cs-interaction">
          <div className="wrap">
            <p className="cs-section-label">Interaction</p>
            <h2 className="cs-section-title">Hidden Messages &amp; Portraits</h2>
            <CsBody>
              <p>Participants filled portrait cards with casual answers: sleep, coffee, work, weekend plans, sketches. Under UV, hidden annotations reframed those answers as collected data.</p>
              <p>The point was not that surveillance always looks sinister. It often arrives as invitation, convenience, and play.</p>
            </CsBody>
            <div className="cs-img-grid project-image-grid--three project-image-grid--top-aligned">
              <figure className="cs-img reveal">
                <img {...projectImageProps("/Assets/Projects/UVLight/photos/screenshot-2023-12-26-at-1.08-1.png")} data-project-preview src="/Assets/Projects/UVLight/photos/screenshot-2023-12-26-at-1.08-1.png" alt="The blank portrait card in daylight: scattered questions about coffee, sleep, work, weekend plans, and a prompt to draw anything" loading="lazy" decoding="async" />
                <figcaption className="cs-img-caption">Stage one: the card as participants received it. Just friendly questions and blank lines.</figcaption>
              </figure>
              <figure className="cs-img reveal">
                <img {...projectImageProps("/Assets/Projects/UVLight/photos/image-8-1.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-8-1.png" alt="A filled-in portrait card with a green-backdrop polaroid attached and handwritten answers about coffee, meetings, and weekend plans" loading="lazy" decoding="async" />
                <figcaption className="cs-img-caption">Stage two: a completed card, portrait attached, personal details volunteered in handwriting.</figcaption>
              </figure>
              <figure className="cs-img reveal">
                <img {...projectImageProps("/Assets/Projects/UVLight/photos/screenshot-2023-12-26-at-1.10-1.png")} data-project-preview src="/Assets/Projects/UVLight/photos/screenshot-2023-12-26-at-1.10-1.png" alt="The same portrait card under blacklight, where a hidden invisible-ink notation glows next to the printed question" loading="lazy" decoding="async" />
                <figcaption className="cs-img-caption">Stage three: under UV, the invisible-ink annotations appear, and the card reads as a record of observation.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid project-image-grid--three">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/UVLight/photos/image-6.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-6.png" alt="Participants sitting around glowing UV puzzle on the floor" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/UVLight/photos/image-7.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-7.png" alt="Close-up: glowing UV element in participant's hand" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/UVLight/photos/image-5.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-5.png" alt="UV-lit room with Starry Night projection and participants" loading="lazy" /></div>
            </div>
          </div>
        </section>

        <div className="cs-slide reveal">
          <img {...projectImageProps("/Assets/Projects/UVLight/photos/image-8.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-8.png" alt="The live camera feed of the UV rooms projected across large screens in the darkened auditorium, showing participants being watched in real time" loading="lazy" decoding="async" />
        </div>
        <div className="cs-slide reveal">
          <img {...projectImageProps("/Assets/Projects/UVLight/photos/image-7-1.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-7-1.png" alt="Polaroid-style participant portrait cards with green backdrops and printed names, laid out in normal light" loading="lazy" />
        </div>
        <div className="cs-slide reveal">
          <img {...projectImageProps("/Assets/Projects/UVLight/photos/image-3.png")} data-project-preview src="/Assets/Projects/UVLight/photos/image-3.png" alt="The completed puzzle painting glowing under blacklight on the floor as participants gather around its edges" loading="lazy" />
        </div>

        {/* Credits */}
        <section className="cs-section reveal">
          <div className="wrap">
            <p className="cs-section-label">Team</p>
            <h2 className="cs-display">Credits</h2>
            <CsCredits credits={[
              { role: 'Artist', name: 'Parth Pawar' },
              { role: 'Artist Collaborators', name: 'Nathan, Lauren, Baiyuian' },
            ]} />
          </div>
        </section>

        {/* Reflections */}
        <section className="cs-section reveal">
          <div className="wrap">
            <p className="cs-section-label">Reflections</p>
            <h2 className="cs-section-title">What I Learned</h2>
            <CsBody className="cs-body--measure">
              <p>Spatial work needs narrative discipline. The participant should know enough to keep going, but not so much that the answer arrives before the experience does.</p>
              <p>The strongest moment was structural, not spectacular: the camera feed changed the audience from participants into observed subjects.</p>
            </CsBody>
          </div>
        </section>

        <CsThanks />
        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-background', label: 'Background' },
          { id: 'cs-discovery', label: 'Discovery' },
          { id: 'cs-exploration', label: 'Exploration' },
          { id: 'cs-making', label: 'Making' },
          { id: 'cs-narrative', label: 'Narrative' },
          { id: 'cs-interaction', label: 'Interaction' },
        ]} />

      </main>

      <NextProject slug="revolving-stage" title="Revolving Stage" image="/Assets/images/revolving-stage.webp" />
      <Footer />
    </>
  )
}
