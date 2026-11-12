import ExternalVideo from '../components/ExternalVideo'
import { Helmet } from 'react-helmet-async'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ProjectHeader from '../components/case-study/ProjectHeader'
import CsSection from '../components/case-study/CsSection'
import CsBody from '../components/case-study/CsBody'
import NextProject from '../components/case-study/NextProject'
import BottomNav from '../components/case-study/BottomNav'
import '../styles/editing-motion.css'

const films = [
  {
    key: 'enigma',
    title: 'Enigma',
    subtitle: 'Make invisible computation visible',
    src: 'https://player.vimeo.com/video/895893649?h=d78737dcdb&title=0&byline=0&portrait=0&dnt=1',
    href: '/enigma',
    note: 'Gesture → signal → prediction',
    featured: true,
  },
  {
    key: 'omakase',
    title: 'The Omakase',
    subtitle: 'Turn a physical game into immediate competition',
    src: 'https://player.vimeo.com/video/996020990?title=0&byline=0&portrait=0&dnt=1',
    href: '/the-omakase',
    note: 'Hands → screen → opponent → score',
  },
  {
    key: 'time',
    title: 'Making of Time',
    subtitle: 'Connect three objects through one idea',
    src: 'https://player.vimeo.com/video/1010457989?title=0&byline=0&portrait=0&dnt=1',
    href: '/making-of-time',
    note: 'Shadow → escapement → software',
  },
  {
    key: 'drowning',
    title: 'Drowning',
    subtitle: 'Let the room become the emotional argument',
    src: 'https://player.vimeo.com/video/1026164956?title=0&byline=0&portrait=0&dnt=1',
    href: '/drowning',
    note: 'Threshold → texture → body → enclosure',
  },
]

const workflows = [
  ['01', 'Find the story', 'Sort footage by what it explains: input, response, detail, and reaction.'],
  ['02', 'Write one sentence', 'Define the change the viewer must understand before opening the timeline.'],
  ['03', 'Cut cause to effect', 'Show the action before the response. Earn the hero shot after the idea is clear.'],
  ['04', 'Finish once', 'Add sound and graphics after the story works, then version from one master.'],
]

const anatomies = [
  {
    key: 'enigma',
    title: 'Enigma',
    image: '/Assets/Projects/Enigma/photos/tablet-input.jpg',
    alt: 'A visitor drawing a letter on the Enigma input tablet',
    thesis: 'Cause before spectacle',
    body: 'Input first, then the network, then the wide reveal. The spectacle lands because the system is already clear.',
  },
  {
    key: 'omakase',
    title: 'The Omakase',
    image: '/Assets/Projects/the-omakase/photos/head-to-head-match.webp',
    alt: 'Two players competing head to head at The Omakase arcade cabinet',
    thesis: 'Action before explanation',
    body: 'Order, press, score, reaction. Repetition teaches the game without stopping to explain it.',
  },
  {
    key: 'time',
    title: 'Making of Time',
    image: '/Assets/Projects/making-of-time/photos/blue-dial-hero.webp',
    alt: 'Blue mechanical watch dial photographed for Making of Time',
    thesis: 'Match ideas, not objects',
    body: 'Shadow, escapement, and software are linked by rhythm rather than literal shape.',
  },
  {
    key: 'drowning',
    title: 'Drowning',
    image: '/Assets/Projects/Drowning/photos/WhatsApp Image 2024-10-10 at 11.54.18.webp',
    alt: 'The Drowning greenhouse set illuminated during performance',
    thesis: 'Restraint creates pressure',
    body: 'Longer holds and delayed close-ups let the greenhouse become the pressure.',
  },
]

function EditingHeroFilm() {
  return (
    <figure className="editing-hero-film is-loaded">
      <ExternalVideo
        src="https://player.vimeo.com/video/895893649?h=d78737dcdb&title=0&byline=0&portrait=0"
        poster="/Assets/mockups/projects/enigma_16x9.webp"
        allow="autoplay; fullscreen; picture-in-picture"
        title="Enigma project film"
      />
    </figure>
  )
}

function SelectedFilms() {
  return (
    <div className="editing-film-grid">
      {films.map((film) => (
        <figure className={`editing-film${film.featured ? ' is-featured' : ''}`} key={film.key}>
          <div className="editing-film__player">
            <ExternalVideo
              src={film.src}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={`${film.title} project film`}
            />
          </div>
          <figcaption>
            <div><span>{film.title}</span><strong>{film.subtitle}</strong></div>
            <small>{film.note}</small>
            <a href={film.href}>Open full project ↗</a>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function EditorialWorkflow() {
  return (
    <div className="editing-workflow">
      {workflows.map(([num, title, body]) => (
        <article key={num}><span>{num}</span><h3>{title}</h3><p>{body}</p></article>
      ))}
    </div>
  )
}

function EditAnatomies() {
  return (
    <div className="editing-anatomy-grid">
      {anatomies.map((item) => (
        <article className={`editing-anatomy editing-anatomy--${item.key}`} key={item.key}>
          <div className="editing-anatomy__image"><img src={item.image} alt={item.alt} loading="lazy" /></div>
          <div className="editing-anatomy__copy">
            <small>{item.title}</small><h3>{item.thesis}</h3><p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function EditingEvidence() {
  const items = [
    ['Evidence shown', 'Four completed project films.'],
    ['My contribution', 'Portfolio editing and motion graphics; original project roles appear on the linked pages.'],
    ['Case-study focus', 'Story structure, pacing, graphics, and delivery—not solo authorship of every project artifact.'],
  ]

  return (
    <aside className="editing-evidence" aria-label="Film evidence and authorship">
      {items.map(([label, value]) => <div key={label}><small>{label}</small><p>{value}</p></div>)}
    </aside>
  )
}

export default function EditingMotionCaseStudy() {
  return (
    <>
      <Helmet>
        <title>Cutting Systems into Stories · Motion Design · Parth Pawar</title>
        <meta name="description" content="Four completed project films, with a concise look at story structure, pacing, motion graphics, and delivery." />
        <meta property="og:title" content="Cutting Systems into Stories · Parth Pawar" />
        <meta property="og:description" content="How four project films were shaped through editorial structure, pacing, sound, and motion graphics." />
        <meta property="og:image" content="https://designwhich.works/Assets/mockups/projects/enigma_16x9.webp" />
        <link rel="canonical" href="https://designwhich.works/motion/editing-motion-stories" />
      </Helmet>
      <Nav />
      <main id="main-content" className="project-main motion-project-main editing-motion-main">
        <ProjectHeader
          backLink="/motion"
          backLabel="Back to Motion"
          categorySlug="creative-tech"
          tags={['Video editing', 'Editorial direction', 'Motion graphics']}
          title="Cutting Systems into Stories"
          subtitle="Editing interactive systems into films that explain the idea before the spectacle"
          info={[
            { label: 'Role', value: 'Editor · Motion designer' },
            { label: 'Years', value: '2023–25' },
            { label: 'Tools', value: 'Premiere Pro · After Effects' },
            { label: 'Scope', value: 'Story edit · sound · graphics' },
          ]}
          heroExperience="visual"
          visualTitleMode="stacked"
          visualHeadline="A good project film reveals the idea before it asks for attention."
          visualHeroImage="/Assets/mockups/projects/enigma_16x9.webp"
          visualHeroAlt="Enigma neural-network sculpture illuminated in a dark exhibition space"
          visualHeroMedia={<EditingHeroFilm />}
          heroTone="motion"
          showHeaderSummary={false}
        />

        <EditingEvidence />

        <CsSection id="selected-films" label="01 — Selected films" title="Four subjects. Four editorial rhythms.">
          <CsBody><p>These films document projects I created, designed, built, or staged. This page focuses on how their footage was shaped into a clear story; each linked project page preserves the underlying role.</p></CsBody>
          <SelectedFilms />
        </CsSection>

        <CsSection id="editing-process" label="02 — Editing process" title="One question before the timeline.">
          <CsBody><p>What changes, what causes it, and what proves it? The same questions guide every edit; the pace does not.</p></CsBody>
          <EditorialWorkflow />
        </CsSection>

        <CsSection id="edit-anatomy" label="03 — Edit decisions" title="The pace follows the subject.">
          <CsBody><p>Enigma needs latency. Omakase needs pressure. Time needs rhythm. Drowning needs duration.</p></CsBody>
          <EditAnatomies />
        </CsSection>

        <CsSection id="post-production" label="04 — Finish" title="Premiere owns the story. After Effects handles intervention.">
          <CsBody><p>Structure stays in Premiere. Tracked graphics, composites, cleanup, and title motion move to After Effects.</p></CsBody>
          <div className="editing-tool-grid">
            <article><span>Pr</span><div><strong>Editorial spine</strong><p>Selects, story structure, pacing, sync, sound layout, captions, and delivery versions.</p></div></article>
            <article><span>Ae</span><div><strong>Motion and composites</strong><p>Tracked screens, stabilization, cleanup, state labels, title motion, and reusable end cards.</p></div></article>
          </div>
          <div className="editing-finish-list">
            <p><span>Delivery</span>16:9 master · captions · sound-off · 4:5 and 9:16 cutdowns</p>
            <p><span>Authorship</span>Portfolio edits and motion graphics by Parth Pawar. The films draw on collaborative project footage; linked project pages retain the underlying roles and credits.</p>
          </div>
        </CsSection>

        <NextProject slug="motion/vishwa-conclave-motion" title="VishwaConclave: An event identity in motion" image="/Assets/mockups/projects/vishwaconclave_16x9.webp" />
        <BottomNav sections={[
          { id: 'selected-films', label: 'Films' },
          { id: 'editing-process', label: 'Process' },
          { id: 'edit-anatomy', label: 'Decisions' },
          { id: 'post-production', label: 'Finish' },
        ]} />
      </main>
      <Footer />
    </>
  )
}
