import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Nav from '../components/Nav'
import '../styles/mit-portfolio.css'

const performancePath = '/Assets/films/jugalbandi.mp4'

const groups = [
  {
    id: 'future-sketches',
    name: 'Future Sketches',
    heading: 'Making concepts physical',
    intro: 'I want to help people understand a system through behavior they can see and change.',
    guide: 'https://www.media.mit.edu/groups/future-sketches/applicant-information/',
    evidence: { text: 'At NYU ITP I was a graduate assistant for Physical Computing, Interaction as Art Medium, and 100 Days of Making.', to: '/about#teaching', label: 'See my teaching experience' },
    next: 'I’d build a small workshop around editable constraints. Give people one starting rule, let them change it, and see which variations they can explain and make again on their own.',
    projects: [
      {
        name: 'Enigma',
        featured: true,
        image: '/Assets/Projects/Enigma/photos/full-sculpture-wide.webp',
        alt: 'Enigma’s illuminated physical layers above a tablet showing a handwritten A',
        description: 'I built a 200-light sculpture so visitors could follow a handwritten letter through a neural network. The film shows the original installation responding.',
        to: '/enigma#cs-film',
        action: 'Watch the original installation',
      },
      {
        name: 'Shuffle',
        image: '/Assets/mockups/projects/shuffle_16x9.webp',
        alt: 'The original Shuffle board with labeled motorized faders',
        description: 'Push one fader and the others move. A physical game about balancing student life.',
        to: '/shuffle#cs-film',
        action: 'Watch the physical board in use',
      },
    ],
    supporting: [
      {
        name: 'After Hours',
        image: '/Assets/preview-covers/after-hours.jpg',
        description: 'A generative floor of illustrated workshops.',
        to: '/after-hours',
      },
      {
        name: 'Butler’s Slice',
        image: '/Assets/Projects/Typeface/photos/hero-title.jpg',
        description: 'Type design and an editable glyph workshop.',
        to: '/typeface/workshop',
      },
    ],
  },
  {
    id: 'critical-matter',
    name: 'Critical Matter',
    heading: 'Making invisible processes tangible',
    intro: 'I use light, sound, and material to ask what becomes easier to notice when an interaction leaves the screen.',
    guide: 'https://www.media.mit.edu/groups/critical-matter/applicant-information/',
    evidence: { text: 'The slider moves a servo, and each visitor’s turn leaves a visible trace in the salt.', to: '/sea-of-salt#cs-system', label: 'Inspect the slider, servo, and mill' },
    next: 'Enigma Tabletop is a proposed study. I’d compare the same letter classifier with activity shown on a screen or on a physical light panel, then ask visitors what they noticed when the model hesitated between two letters.',
    projects: [
      {
        name: 'Enigma',
        image: '/Assets/Projects/Enigma/photos/person-viewing.webp',
        alt: 'A visitor facing the original illuminated Enigma sculpture',
        description: 'I built a 200-light sculpture so visitors could follow a handwritten letter through a neural network. The film shows the original installation responding.',
        to: '/enigma#cs-film',
        action: 'Watch the original installation',
      },
      {
        name: 'Why the Sea is Salt',
        image: '/Assets/Projects/sea-of-salt/photos/overview.webp',
        alt: 'The original salt mill and story slider on a black platform',
        description: 'I co-created this piece with Audrey Oh. I fabricated the mill and mapped the story slider to motor speed. Each telling leaves real salt for the next visitor.',
        to: '/sea-of-salt#cs-original-object',
        action: 'See the mill and slider',
      },
      {
        name: 'Shuffle',
        image: '/Assets/mockups/projects/shuffle_16x9.webp',
        alt: 'The original Shuffle board with labeled motorized faders',
        description: 'Push one fader and the others move. A physical game about balancing student life.',
        to: '/shuffle#cs-film',
        action: 'Watch the physical board in use',
      },
    ],
  },
  {
    id: 'opera-of-the-future',
    name: 'Opera of the Future',
    heading: 'Making room for a musical answer',
    intro: 'I use fabrication and interaction design to make instruments that can take part in a performance. Jugalbandi began with a Hindustani duet and the question of how a machine could answer a musician.',
    guide: 'https://www.media.mit.edu/groups/opera-of-the-future/applicant-information/',
    next: 'I’d build a study for two performers around the same acoustic mechanisms. Give each performer control over when a reply can begin, then listen for how different timings affect whether they leave space, overlap, or pass the phrase back.',
    film: true,
    projects: [
      {
        name: 'Inside Jugalbandi',
        image: '/Assets/Projects/Jugalbandi/Photos/538A3938_nsquare_23.webp',
        alt: 'Hexa-18 controller showing its top and sensor faces',
        description: 'I designed and fabricated Hexa-18 and the robotic flute, harp, and rainsticks. The performer shapes the input with the controller. The acoustic mechanisms answer with air, plucked strings, and falling grains.',
        to: '/jugalbandi#cs-instrument',
        action: 'Follow the gesture into the mechanism',
      },
    ],
  },
]

export default function MitPortfolioPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="mit-portfolio">
        <div className="wrap">
          <header className="mit-intro">
            <p className="mono-label">Parth Pawar · Fall 2027</p>
            <h1>Selected work for MIT Media Lab</h1>
            <p>I build tools and physical interfaces that let people see, hear, and change how a system responds.</p>
            <nav className="mit-group-nav" aria-label="Research groups">
              {groups.map(group => (
                <Link key={group.id} to={`#${group.id}`}>
                  <span className="mit-group-nav__name">{group.name} <span aria-hidden="true">↓</span></span>
                  <span>{group.film ? 'Jugalbandi · Original performance' : group.projects[0].name}</span>
                </Link>
              ))}
            </nav>
          </header>
          {groups.map(group => (
            <section className="mit-group" key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`}>
              <header className="mit-group-heading">
                <p className="mono-label">{group.name}</p>
                <h2 id={`${group.id}-heading`}>{group.heading}</h2>
                <p>{group.intro}</p>
              </header>
              {group.film && (
                <figure className="mit-performance">
                  <video controls playsInline preload="none" poster="/Assets/mockups/projects/jugalbandi_16x9.webp" aria-label="Jugalbandi original performance">
                    <source src={performancePath} type="video/mp4" />
                    <track kind="captions" src="/Assets/captions/jugalbandi.en.vtt" srcLang="en" label="English (automatic captions)" />
                  </video>
                  <figcaption>
                    <span>Jugalbandi · Original performance · Music begins at 0:20</span>
                    <div className="mit-performance__links">
                      <a href={`${performancePath}#t=20`}>Open at 0:20</a>
                      <a href={performancePath}>Open the full recording</a>
                    </div>
                  </figcaption>
                </figure>
              )}
              <ol className="mit-projects" aria-label={`Selected work for ${group.name}`}>
                {group.projects.map(project => (
                  <li key={project.name} className={'featured' in project && project.featured ? 'mit-project--featured' : undefined}>
                    <img src={project.image} alt={project.alt} loading="lazy" decoding="async" />
                    <div>
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      <Link className="mit-project-link" to={project.to}>{project.action} <span aria-hidden="true">↗</span></Link>
                    </div>
                  </li>
                ))}
              </ol>
              {group.supporting && (
                <aside className="mit-supporting" aria-label="Supporting experiments">
                  <h3>Supporting experiments</h3>
                  <ul>
                    {group.supporting.map(project => (
                      <li key={project.name}>
                        <Link to={project.to}>
                          <img src={project.image} alt="" loading="lazy" decoding="async" />
                          <span>
                            <strong>{project.name} <span aria-hidden="true">↗</span></strong>
                            <span>{project.description}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}
              {group.id === 'future-sketches' && group.evidence && (
                <div className="mit-evidence mit-evidence--teaching">
                  <p>{group.evidence.text}</p>
                  <Link className="mit-project-link" to={group.evidence.to}>{group.evidence.label} <span aria-hidden="true">↗</span></Link>
                </div>
              )}
              {group.id !== 'future-sketches' && group.evidence && (
                <div className="mit-evidence">
                  <p>{group.evidence.text}</p>
                  <Link className="mit-project-link" to={group.evidence.to}>{group.evidence.label} <span aria-hidden="true">↗</span></Link>
                </div>
              )}
              <div className="mit-next">
                <h3>What I’d explore next</h3>
                <p>{group.next}</p>
                <a href={group.guide}>Research group and applicant information <span aria-hidden="true">↗</span></a>
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
