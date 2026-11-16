import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Nav from '../components/Nav'
import '../styles/mit-portfolio.css'

const groups = [
  {
    id: 'future-sketches',
    name: 'Future Sketches',
    heading: 'Tools for making with code',
    intro: 'I’m interested in tools that let people change a rule and find something they wouldn’t have drawn on their own.',
    guide: 'https://www.media.mit.edu/groups/future-sketches/applicant-information/',
    next: 'I’d build a small workshop around editable constraints. Give people one starting rule, let them change it, and see which variations they can explain and make again on their own.',
    projects: [
      {
        name: 'Butler’s Slice',
        image: '/Assets/Projects/Typeface/photos/hero-title.jpg',
        alt: 'A display specimen of Butler’s Slice',
        description: 'I carried one diagonal cut through a type family. In the browser workshop, you can pull the actual Bézier points and see how the outline changes.',
        to: '/typeface/workshop',
        action: 'Open the glyph workshop',
      },
      {
        name: 'Enigma',
        image: '/Assets/Projects/Enigma/photos/tablet-input.jpg',
        alt: 'A hand drawing on the tablet below Enigma',
        description: 'I built a sculpture around the act of drawing one letter. The browser study lets you draw again to compare the input and illustrative light patterns.',
        to: '/enigma#cs-interactive',
        action: 'Draw a letter',
      },
      {
        name: 'After Hours',
        image: '/Assets/preview-covers/after-hours.jpg',
        alt: 'An isometric floor of illustrated workshops',
        description: 'I drew eight workshops and wrote the rules that arrange them into a floor you can explore.',
        to: '/after-hours',
        action: 'Explore the workshop floor',
      },
    ],
  },
  {
    id: 'critical-matter',
    name: 'Critical Matter',
    heading: 'Making invisible processes tangible',
    intro: 'I use light, sound, and material to ask what becomes easier to notice when an interaction leaves the screen.',
    guide: 'https://www.media.mit.edu/groups/critical-matter/applicant-information/',
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
        name: 'Jugalbandi',
        image: '/Assets/mockups/projects/jugalbandi_16x9.webp',
        alt: 'A musician performing with the Hexa-18 controller',
        description: 'I built the performer’s controller and the acoustic instruments that answer it. Air, strings, and falling grains each needed their own timing.',
        to: '/jugalbandi#cs-film',
        action: 'Watch the original duet',
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
                <Link key={group.id} to={`#${group.id}`} className="glass-action">{group.name} <span aria-hidden="true">↓</span></Link>
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
              <ol className="mit-projects" aria-label={`Selected work for ${group.name}`}>
                {group.projects.map(project => (
                  <li key={project.name}>
                    <img src={project.image} alt={project.alt} loading="lazy" decoding="async" />
                    <div>
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      <Link className="mit-project-link" to={project.to}>{project.action} <span aria-hidden="true">↗</span></Link>
                    </div>
                  </li>
                ))}
              </ol>
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
