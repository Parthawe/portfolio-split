import { isExperimental, portfolio, projectLink } from '../config/portfolio'
import { Fragment, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import '../styles/about.css'
import {
  siAnthropic,
  siArduino,
  siAutodesk,
  siBlender,
  siCinema4d,
  siCursor,
  siD3,
  siFigma,
  siFirebase,
  siFramer,
  siGithub,
  siGreensock,
  siJavascript,
  siJira,
  siLinear,
  siLottiefiles,
  siMiro,
  siNodedotjs,
  siNotion,
  siP5dotjs,
  siProcessingfoundation,
  siProtodotio,
  siPython,
  siRaspberrypi,
  siReact,
  siRhinoceros,
  siRive,
  siSupabase,
  siSwift,
  siThreedotjs,
  siTypescript,
  siUnity,
  siUnrealengine,
  siVite,
  siWebflow,
} from 'simple-icons'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import FigmaSelect from '../components/FigmaSelect'
import TextReveal from '../components/TextReveal'
import PortalReveal from '../components/PortalReveal'
import BinaryFlower from '../components/BinaryFlower'
import { heroObjectStories } from '../data/portfolioEntrances'
import { DEFAULT_OG_IMAGE, SITE_ORIGIN, SITE_URL } from '../config/site'

/* ── Data ── */

type Row = { date?: string; role: string; co?: string; desc?: string; link?: string; section?: string }

const rows: Row[] = [
  { section: 'Work Experience', date: 'Q3 2025 - Present', role: 'Head of UI/UX', co: 'Mentra', link: '/mentra', desc: 'AI wearable OS, companion app, MiniApp Store, and launch systems.' },
  { date: '2025', role: 'Founding Product Designer', co: 'ZentiPay', link: '/zentipay', desc: '0 to 1 fintech product design across research, flows, and MVP UX.' },
  { date: '2024', role: 'Designer', co: 'The Point CDC', link: '/the-point-cdc', desc: 'Civic web redesign for a Hunts Point community organization.' },
  { date: '2023 - 2024', role: 'Web Publishing Designer', co: 'NYU Tisch Office of Diversity', desc: 'Accessible publishing systems and annual report design.' },
  { date: '2022 - 2023', role: 'Lead Product Designer', co: 'TransFi', link: '/transfi-project', desc: 'Cross-border crypto payments, dashboards, widgets, and trust flows.' },
  { date: '2021 - 2022', role: 'UI/UX Designer', co: 'Monsoonfish', desc: 'Mobile and web UX for product studio clients.' },
  { date: '2020 - 2021', role: 'Research Intern', co: 'IBM', link: '/ibm', desc: 'Enterprise UX research and workflow synthesis.' },
  { section: 'Teaching Experience', date: 'Fall 2024', role: 'Graduate Assistant', co: 'NYU', desc: 'Classes: Applications.' },
  { date: 'Fall 2024', role: 'Graduate Assistant', co: 'NYU', desc: 'Classes: Physical Computing.' },
  { date: 'Spring 2024', role: 'Graduate Assistant', co: 'NYU', desc: 'Classes: Interaction as Art Medium.' },
  { date: 'Fall 2023', role: 'Graduate Assistant', co: 'NYU', desc: 'Classes: 100 Days of Making.' },
  { section: 'Education', role: 'MPS, Interactive Telecommunications Program', co: 'NYU Tisch School of the Arts', desc: 'New York.' },
  { role: 'BE, Computer Science Engineering', co: 'Vishwakarma Institute of Technology', desc: 'Pune.' },
]

const recognitionGroups = [
  {
    label: 'Awards',
    items: [
      { title: 'Red Burns + ITP Scholarships', meta: 'NYU ITP · 2024', theme: 'impact' },
      { title: 'Tisch Scholarship', meta: 'NYU Tisch · 2023', theme: 'tisch' },
      { title: 'Firodia Karandak', meta: 'Competition recognition', theme: 'firodia' },
    ],
  },
  {
    label: 'Exhibitions',
    items: [
      { title: 'ITP Thesis Show', meta: 'New York City', theme: 'thesis' },
      { title: 'ITP Spring / Winter Shows', meta: 'NYU ITP', theme: 'seasonal' },
      { title: 'Maker Faire Coney Island', meta: 'Public exhibition', theme: 'maker' },
      { title: 'WonderVille NYC', meta: 'Brooklyn, New York', theme: 'wonderville' },
    ],
  },
]

const offClockImages = [
  {
    src: '/Assets/images/about/off-clock/nyu-subway-flowers.webp',
    label: 'NYU flowers',
  },
  {
    src: '/Assets/images/about/off-clock/gallery-suit.webp',
    label: 'Gallery days',
  },
  {
    src: '/Assets/images/about/off-clock/f1-store.webp',
    label: 'Formula 1',
  },
  {
    src: '/Assets/images/about/off-clock/library-shelf.webp',
    label: 'Book stacks',
  },
  {
    src: '/Assets/images/about/off-clock/color-gallery.webp',
    label: 'Color studies',
  },
  {
    src: '/Assets/images/about/off-clock/monet-wall.webp',
    label: 'Museum looking',
  },
  {
    src: '/Assets/images/about/off-clock/polaroid-portrait.webp',
    label: 'Instant photos',
  },
  {
    src: '/Assets/images/about/off-clock/painting-view.webp',
    label: 'Painting rooms',
  },
  {
    src: '/Assets/images/about/off-clock/nyu-grad.webp',
    label: 'NYU graduation',
  },
  {
    src: '/Assets/images/about/off-clock/washington-square.webp',
    label: 'Washington Square',
  },
  {
    src: '/Assets/images/about/off-clock/mclaren-jacket.webp',
    label: 'McLaren days',
  },
  {
    src: '/Assets/images/about/off-clock/yc-founder-visit.webp',
    label: 'Founder visits',
  },
  {
    src: '/Assets/images/about/off-clock/edge-nyc.jpg',
    label: 'Edge NYC',
  },
  {
    src: '/Assets/images/about/off-clock/nyu-graduation-wall.jpg',
    label: 'Graduation day',
  },
  {
    src: '/Assets/images/about/off-clock/chicago-river.jpg',
    label: 'Chicago river',
  },
  {
    src: '/Assets/images/about/off-clock/gym-mirror.jpg',
    label: 'Gym days',
  },
  {
    src: '/Assets/images/about/off-clock/west-village-cafe.jpg',
    label: 'West Village cafe',
  },
  {
    src: '/Assets/images/about/off-clock/seattle-waterfront.jpg',
    label: 'Seattle waterfront',
  },
  {
    src: '/Assets/images/about/off-clock/bellagio-garden.jpg',
    label: 'Bellagio garden',
  },
  {
    src: '/Assets/images/about/off-clock/seattle-overlook.jpg',
    label: 'Seattle overlook',
  },
  {
    src: '/Assets/images/about/off-clock/vintage-car-museum.jpg',
    label: 'Vintage cars',
  },
  {
    src: '/Assets/images/about/off-clock/museum-architecture.jpg',
    label: 'Museum architecture',
  },
  {
    src: '/Assets/images/about/off-clock/plaid-mirror.jpg',
    label: 'Mirror moments',
  },
  {
    src: '/Assets/images/about/off-clock/yellow-sweater.jpg',
    label: 'Sunday light',
  },
  {
    src: '/Assets/images/about/off-clock/studio-smart-glasses.jpg',
    label: 'Smart glasses portrait',
  },
  {
    src: '/Assets/images/about/off-clock/coastal-sunset.jpg',
    label: 'Coastal sunset',
  },
]

const offClockRows = [
  offClockImages.filter((_, index) => index % 2 === 0),
  offClockImages.filter((_, index) => index % 2 === 1).reverse(),
]

const aboutCharacterFrames = Array.from(
  { length: 9 },
  (_, index) => `/Assets/character/me/${index + 1}.webp`,
)

const softwareStack = [
  'Figma', 'FigJam', 'Framer', 'Webflow', 'Spline', 'Rive', 'Lottie', 'ProtoPie',
  'Principle', 'After Effects', 'Premiere Pro', 'Photoshop', 'Illustrator', 'InDesign',
  'Lightroom', 'Blender', 'Cinema 4D', 'Fusion 360', 'Rhino', 'KeyShot', 'TouchDesigner',
  'p5.js', 'Processing', 'Arduino', 'Raspberry Pi', 'Unity', 'Unreal', 'React',
  'TypeScript', 'JavaScript', 'Vite', 'Three.js', 'GSAP', 'Node', 'Python', 'Swift',
  'D3.js', 'Tableau', 'Supabase', 'Firebase', 'Notion', 'Linear', 'Jira', 'GitHub',
  'Cursor', 'Claude Code', 'ChatGPT', 'Midjourney', 'Runway', 'Whimsical', 'Miro',
]

const softwareRows = [
  softwareStack.filter((_, index) => index % 3 === 0),
  softwareStack.filter((_, index) => index % 3 === 1),
  softwareStack.filter((_, index) => index % 3 === 2),
]

const codexStats = [
  { value: '38.8B', label: 'Lifetime tokens' },
  { value: '1.5B', label: 'Peak tokens' },
  { value: '7h 5m', label: 'Longest chat' },
  { value: '98 days', label: 'Current streak' },
  { value: '98 days', label: 'Longest streak' },
]

const codexPractice = [
  { title: 'Context first', text: 'Live repo. Real data. Current surface.' },
  { title: 'Tight loops', text: 'Build, inspect, correct, repeat.' },
  { title: 'Verify the finish', text: 'Tests, screenshots, deploy checks.' },
]

type SimpleBrandIcon = {
  title: string
  hex: string
  path: string
}

const softwareIcons: Record<string, SimpleBrandIcon> = {
  Figma: siFigma,
  Framer: siFramer,
  Webflow: siWebflow,
  Rive: siRive,
  Lottie: siLottiefiles,
  ProtoPie: siProtodotio,
  Blender: siBlender,
  'Cinema 4D': siCinema4d,
  'Fusion 360': siAutodesk,
  Rhino: siRhinoceros,
  'p5.js': siP5dotjs,
  Processing: siProcessingfoundation,
  Arduino: siArduino,
  'Raspberry Pi': siRaspberrypi,
  Unity: siUnity,
  Unreal: siUnrealengine,
  React: siReact,
  TypeScript: siTypescript,
  JavaScript: siJavascript,
  Vite: siVite,
  'Three.js': siThreedotjs,
  GSAP: siGreensock,
  Node: siNodedotjs,
  Python: siPython,
  Swift: siSwift,
  'D3.js': siD3,
  Supabase: siSupabase,
  Firebase: siFirebase,
  Notion: siNotion,
  Linear: siLinear,
  Jira: siJira,
  GitHub: siGithub,
  Cursor: siCursor,
  'Claude Code': siAnthropic,
  Miro: siMiro,
}

const adobeAppIcons: Record<string, { label: string; bg: string; fg: string }> = {
  'After Effects': { label: 'Ae', bg: '#00005b', fg: '#9999ff' },
  'Premiere Pro': { label: 'Pr', bg: '#00005b', fg: '#9999ff' },
  Photoshop: { label: 'Ps', bg: '#001e36', fg: '#31a8ff' },
  Illustrator: { label: 'Ai', bg: '#330000', fg: '#ff9a00' },
  InDesign: { label: 'Id', bg: '#49021f', fg: '#ff3366' },
  Lightroom: { label: 'Lr', bg: '#001e36', fg: '#31a8ff' },
}

function SoftwareLogo({ tool }: { tool: string }) {
  const icon = softwareIcons[tool]
  const adobeIcon = adobeAppIcons[tool]

  if (icon) {
    return (
      <span
        className="abt-vibe-software-logo abt-vibe-software-logo--svg"
        style={{ color: `#${icon.hex}` }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" role="img" focusable="false">
          <path fill="currentColor" d={icon.path} />
        </svg>
      </span>
    )
  }

  if (adobeIcon) {
    return (
      <span
        className="abt-vibe-software-logo abt-vibe-software-logo--adobe"
        style={{ '--logo-bg': adobeIcon.bg, '--logo-fg': adobeIcon.fg } as CSSProperties}
        aria-hidden="true"
      >
        {adobeIcon.label}
      </span>
    )
  }

  return null
}

function SoftwareChip({ tool }: { tool: string }) {
  const hasLogo = Boolean(softwareIcons[tool] || adobeAppIcons[tool])

  return (
    <span className={`abt-vibe-software-chip${hasLogo ? ' has-actual-logo' : ''}`}>
      <SoftwareLogo tool={tool} />
      <span>{tool}</span>
    </span>
  )
}

function CodexProfile() {
  return <div className="abt-build-practice">
    <div className="abt-build-steps" aria-label="How Parth works with Codex">
      {codexPractice.map(item => <div key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>)}
    </div>
    <details className="abt-build-usage"><summary>Codex usage snapshot · September 26, 2026</summary>
      <dl>{codexStats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
    </details>
  </div>
}

/* ── Component ── */

const productDecisions = [
  { title: 'Mentra', story: heroObjectStories[2], role: 'I moved MiniApps into the main area and gave running apps a dedicated control.' },
  { title: 'TransFi', story: heroObjectStories[0], role: 'I separated pay and receive and put the fee breakdown above the buy button.' },
]

const selectedExperiments = [
  { title: 'Jugalbandi', story: heroObjectStories[1], image: '/Assets/mockups/projects/jugalbandi_16x9.webp', alt: 'A musician performs on Hexa-18', role: 'I designed and fabricated Hexa-18 and the robotic flute, harp, and rainsticks that answer it.' },
  { title: 'Enigma', story: heroObjectStories[0], image: '/Assets/mockups/projects/enigma_16x9.webp', alt: 'A visitor faces the illuminated Enigma sculpture', role: 'I built a light sculpture that shows how a neural network recognizes a handwritten letter.' },
  { title: 'Shuffle', story: heroObjectStories[4], image: '/Assets/mockups/projects/shuffle_16x9.webp', alt: 'Shuffle’s plywood board and motorized faders', role: 'I built an eight-fader board and programmed the faders to move in response to one another.' },
]

function ExperienceTable({ teaching = false }: { teaching?: boolean }) {
  const teachingStart = rows.findIndex(row => row.section === 'Teaching Experience')
  const educationStart = rows.findIndex(row => row.section === 'Education')
  const entries = teaching ? rows.slice(teachingStart + 1, educationStart)
    : isExperimental ? [...rows.slice(0, teachingStart), ...rows.slice(educationStart)] : rows

  return (
    <section id={teaching ? 'teaching' : 'experience'} className="abt-table-wrap">
      <div className="abt-experience-heading">
        <h2>{teaching ? 'Teaching' : 'Experience'}</h2>
        {!teaching && <a className="glass-action" href="https://designwhich.works/book">Read the 2022 portfolio</a>}
      </div>
      <table className="abt-table">
        <tbody>
          {entries.map((row, index) => (
            <Fragment key={index}>
              {row.section && (
                <tr className="abt-table-section">
                  <td colSpan={3}><span className="abt-table-section-label">{row.section}</span></td>
                </tr>
              )}
              <tr className={`abt-table-row${!row.date ? ' abt-table-row--no-date' : ''}`}>
                {row.date && <td className="abt-table-date">{row.date}</td>}
                <td className="abt-table-main" data-co={row.co || ''} colSpan={row.date ? undefined : 2}>
                  <span className="abt-table-role">
                    {row.link ? <Link to={projectLink(row.link)}>{row.role}</Link> : row.role}
                  </span>
                  {row.co && <span className="abt-table-co-inline">{row.co}</span>}
                  {row.desc && <span className="abt-table-desc">{row.desc}</span>}
                </td>
                <td className="abt-table-co">{row.co}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Recognition({ exhibitions = false }: { exhibitions?: boolean }) {
  const groups = recognitionGroups.filter(group => (group.label === 'Exhibitions') === exhibitions)
  return (
    <section id={exhibitions ? 'exhibitions' : 'recognition'} className="abt-recognition" aria-labelledby={exhibitions ? 'abt-exhibitions-title' : 'abt-recognition-title'}>
      <div className="abt-recognition-head">
        <h2 id={exhibitions ? 'abt-exhibitions-title' : 'abt-recognition-title'}>{exhibitions ? 'Exhibitions' : 'Recognition'}</h2>
      </div>
      <div className="abt-recognition-ledger">
        {groups.map(group => (
          <div className="abt-recognition-group" key={group.label}>
            <ul>{group.items.map(item => (
              <li className="abt-recognition-row" key={item.title}><h3>{item.title}</h3><p>{item.meta}</p></li>
            ))}</ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function AboutPage() {
  /* Body class so CSS can target nav + global elements on this page */
  useEffect(() => {
    document.body.classList.add('page-about')
    return () => document.body.classList.remove('page-about')
  }, [])

  return (
    <>
      <Helmet>
        <title>About &middot; Parth Pawar</title>
        <meta name="description" content={portfolio.description} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About &middot; Parth Pawar" />
        <meta property="og:description" content={portfolio.description} />
        <meta property="og:image" content={`${SITE_ORIGIN}${DEFAULT_OG_IMAGE}`} />
        <link rel="canonical" href={`${SITE_URL}/about`} />
      </Helmet>

      <Nav />

      <main id="main-content">
        <h1 className="sr-only">About Parth Pawar</h1>

        {/* ── Paper canvas wraps entire page ── */}
        <div className="abt-paper">

          {/* ── Photo ── */}
          <div className="abt-photo-hero">
            <PortalReveal
              images={aboutCharacterFrames}
              alt="Parth Pawar"
              className="abt-portal-img"
              fit="contain"
            />
          </div>

          <div className="wrap">

            {/* ── Spotlight: after hero ── */}
            <section className="wr-reveal-section">
              <TextReveal
                front={isExperimental ? "I make instruments, installations, and experimental interfaces." : "I design product systems for AI wearables, fintech, and civic tools."}
                behind={isExperimental ? "I use sound, light, and physical feedback to make systems people can explore for themselves." : "I build and test interfaces where people need to understand what the system is doing."}
              />
            </section>

            {isExperimental ? (
              <>
                <section className="abt-featured-work" aria-labelledby="abt-featured-title">
                  <h2 id="abt-featured-title">Selected experiments</h2>
                  <div className="abt-experiment-list">
                    {selectedExperiments.map(({ title, story, image, alt, role }) => (
                      <article className="abt-featured-project" key={title}>
                        <img src={image} alt={alt} width="960" height="540" loading="lazy" />
                        <div>
                          <h3>{title}</h3>
                          <p>{role}</p>
                          <Link className="glass-action" to={story.to}>{story.label}</Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
                <Recognition exhibitions />
                <ExperienceTable teaching />
                <ExperienceTable />
                <Recognition />
              </>
            ) : (
              <>
                <ExperienceTable />
                <section className="abt-featured-work" aria-labelledby="abt-featured-title">
                  <h2 id="abt-featured-title">Two design decisions</h2>
                  {productDecisions.map(({ title, story, role }) => (
                    <article className="abt-featured-project" key={title}>
                      <div>
                        <h3>{title}</h3>
                        <p>{role}</p>
                      </div>
                      <Link className="glass-action" to={story.to}>{story.label}</Link>
                    </article>
                  ))}
                </section>
                <Recognition />
                <Recognition exhibitions />
              </>
            )}

            {/* ── Vibe coding / software stack ── */}
            <section className="abt-vibe reveal" aria-labelledby="abt-vibe-title">
              <div className="abt-vibe-head">
                <h2 id="abt-vibe-title">Code with design</h2>
                <p>I do not stop at the mockup. I build prototypes, wire interactions, and use code to prove the system works.</p>
              </div>

              <div className="abt-vibe-stage" aria-label="Generative design engineering object">
                <div className="abt-vibe-window">
                  <BinaryFlower />
                </div>

              </div>

              <div className="abt-vibe-software" aria-label="Software stack">
                {softwareRows.map((row, rowIndex) => (
                  <div
                    className={`abt-vibe-software-row${rowIndex === 1 ? ' is-reverse' : ''}`}
                    key={`software-row-${rowIndex}`}
                  >
                    <div className="abt-vibe-software-track">
                      {row.map((tool, index) => (
                        <SoftwareChip tool={tool} key={`${tool}-${rowIndex}-${index}`} />
                      ))}
                    </div>
                    <div className="abt-vibe-software-track" aria-hidden="true">
                      {row.map((tool, index) => (
                        <SoftwareChip tool={tool} key={`${tool}-${rowIndex}-duplicate-${index}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <CodexProfile />
            </section>

            {/* ── Spotlight: after experience ── */}
            <section className="wr-reveal-section">
              <TextReveal
                front="Mentra, ZentiPay, TransFi, NYU, each one taught me something I couldn't learn from a tutorial."
                behind="When your payment flow fails, someone doesn't get paid. When your glasses UI fails, someone walks into a wall."
              />
            </section>


            {/* ── Off the clock ── */}
            <section className="abt-beyond reveal" aria-labelledby="abt-beyond-title">
              <div className="abt-beyond-inner">
                <div className="abt-beyond-copy">
                  <span className="sec-label">Off the clock</span>
                  <h2 id="abt-beyond-title" className="abt-beyond-title"><em>What</em> I enjoy</h2>
                  <p className="abt-beyond-text">When I am not designing, I am usually building something just because I love it: a side project, a sketch, a painting, a small sculpture, or a meal that turns into a whole evening. I also like getting outside for treks and hikes whenever the city starts feeling too flat.</p>
                </div>
                <div className="abt-image-asides" aria-label="Off the clock image reel">
                  {offClockRows.map((row, rowIndex) => (
                    <div className="abt-image-asides-row" key={`off-clock-row-${rowIndex}`}>
                      <div className={`abt-image-asides-track${rowIndex === 1 ? ' abt-image-asides-track--reverse' : ''}`}>
                        {[...row, ...row, ...row, ...row].map((item, imageIndex) => (
                          <figure
                            key={`${item.label}-${rowIndex}-${imageIndex}`}
                            className="abt-image-aside"
                            aria-hidden={imageIndex >= row.length ? 'true' : undefined}
                          >
                            <img src={item.src} alt="" loading="lazy" decoding="async" />
                          </figure>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Creative Practice, daily disciplines ── */}
            <section className="abt-practice reveal">
              <div className="sec-head">
                <span className="sec-label">Creative practice</span>
              </div>
              <p className="abt-practice-intro">Outside of product work, I maintain daily creative disciplines, proof that making things is a habit, not just a job.</p>
              <motion.div
                className="abt-practice-grid"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-30px' }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
              >
                <motion.a
                  href="https://www.instagram.com/poem.nyc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="abt-practice-card figma-hover"
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }}
                >
                  <span className="abt-practice-num">100</span>
                  <span className="abt-practice-title">Days of Poem</span>
                  <span className="abt-practice-desc">A poem every day for 100 days. Writing as a design tool, compression, rhythm, saying more with less.</span>
                  <span className="abt-practice-handle">@poem.nyc</span><FigmaSelect />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/townforartist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="abt-practice-card figma-hover"
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }}
                >
                  <span className="abt-practice-num">100</span>
                  <span className="abt-practice-title">Days of Sketch</span>
                  <span className="abt-practice-desc">Daily sketching practice. Observation, hand-eye coordination, and the discipline of showing up whether the drawing is good or not.</span>
                  <span className="abt-practice-handle">@townforartist</span><FigmaSelect />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/designwhich.works"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="abt-practice-card figma-hover"
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }}
                >
                  <span className="abt-practice-num">50</span>
                  <span className="abt-practice-title">Days of Photoshop</span>
                  <span className="abt-practice-desc">Daily visual explorations in Photoshop. Compositing, manipulation, and finding a personal visual language through repetition.</span>
                  <span className="abt-practice-handle">@designwhich.works</span><FigmaSelect />
                </motion.a>
                <motion.a
                  href="https://open.spotify.com/show/15NJs12QEkUFUax80KndG3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="abt-practice-card figma-hover"
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }}
                >
                  <span className="abt-practice-num">45</span>
                  <span className="abt-practice-title">Episodes &middot; ArtTown Podcast</span>
                  <span className="abt-practice-desc">Co-founded a podcast interviewing designers from Puma, Royal College of Arts, Google, Asana, and Bollywood. 3 seasons, 45 episodes.</span>
                  <span className="abt-practice-handle">@arttown.store</span><FigmaSelect />
                </motion.a>
              </motion.div>
            </section>

            {/* ── Spotlight: after creative practice ── */}
            <section className="wr-reveal-section">
              <TextReveal
                front="Making things is a daily discipline, 100 days of poems, 100 days of sketches, 50 days of Photoshop."
                behind="Proof that creativity is a habit you build, not a talent you're born with. Show up every day."
              />
            </section>


            {/* ── Graveyard banner ── */}
            <section className="abt-graveyard reveal">
              <a href="https://designwhich.works/graveyard" className="abt-graveyard-card">
                <div>
                  <p className="abt-gy-label">Portfolio Archaeology</p>
                  <h3 className="abt-gy-title">The <em>Graveyard</em></h3>
                  <p className="abt-gy-desc">Every portfolio I&rsquo;ve ever built. Some survived. Most didn&rsquo;t. Dig up the remains.</p>
                </div>
                <div className="abt-gy-icon">
                  <div className="abt-gy-tombstone" />
                </div>
                <svg className="abt-gy-arrow" viewBox="0 0 24 24" fill="none"><path d="M5 19L19 5M19 5H9M19 5V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </section>

            {/* ── Typography showcase, Butler's Slice ── */}
            <section className="abt-type reveal">
              <div className="abt-type-intro">
                <span className="abt-type-label">Made this typeface</span>
                <div className="abt-type-links">
                  <a href="/Assets/Projects/Typeface/butlers-slice.zip" download className="abt-type-link figma-hover">
                    <svg viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5.5l3 3 3-3M2 10h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Download .zip
                    <FigmaSelect />
                  </a>
                  <Link to={projectLink("/typeface")} className="abt-type-link figma-hover">
                    Case study
                    <svg viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <FigmaSelect />
                  </Link>
                </div>
              </div>

              <div className="abt-type-specimen">
                <p className="abt-type-name">Butler&rsquo;s Slice</p>
              </div>

              <div className="abt-type-weights">
                <div className="abt-type-weight">
                  <p className="abt-type-weight-label">200 &middot; UltraLight</p>
                  <p className="abt-type-weight-sample abt-type-weight--ultra">Hamburgevons</p>
                </div>
                <div className="abt-type-weight">
                  <p className="abt-type-weight-label">400 &middot; Regular</p>
                  <p className="abt-type-weight-sample abt-type-weight--regular">Hamburgevons</p>
                </div>
                <div className="abt-type-weight">
                  <p className="abt-type-weight-label">700 &middot; Bold</p>
                  <p className="abt-type-weight-sample abt-type-weight--bold">Hamburgevons</p>
                </div>
              </div>

              <p className="abt-type-alphabet">A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
