import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import FigmaSelect from '../components/FigmaSelect'
import { CONTACT_EMAIL } from '../config/site'
import { getProjectAccessLabel, visibleProjects } from '../data/projects'
import '../styles/accessibility.css'

const contents = [
  { href: '#intent', label: 'Intent' },
  { href: '#current-state', label: 'Current state' },
  { href: '#interaction-model', label: 'Interaction model' },
  { href: '#media-motion', label: 'Media and motion' },
  { href: '#privacy', label: 'Private work' },
  { href: '#known-gaps', label: 'Known gaps' },
  { href: '#references', label: 'References' },
]

const statusNotes = [
  {
    title: 'Keyboard path',
    state: 'Handled',
    body: 'The site has a skip link, semantic links and buttons, visible focus states, Escape-close patterns, and route-level keyboard navigation. The portfolio should be browsable without requiring the mouse, even when the visual layer is playful.',
  },
  {
    title: 'Reduced motion',
    state: 'Handled',
    body: 'Loader states, reveal motion, scroll effects, animated tools, and decorative 3D layers include reduced-motion paths. Motion is treated as enhancement, not a requirement for understanding the work.',
  },
  {
    title: 'Responsive layout',
    state: 'Handled',
    body: 'Work cards, navigation, case-study rails, and footer controls use stable dimensions, safe-area spacing, and touch-sized targets across mobile and desktop.',
  },
  {
    title: 'Canvas parity',
    state: 'Watch',
    body: 'Decorative 3D scenes are hidden from assistive technology today. If those scenes become navigational, they need equivalent controls, labels, and state descriptions.',
  },
  {
    title: 'Automated audit',
    state: 'Next',
    body: 'A manual pass is documented here. A future release should add repeatable Lighthouse or axe checks before deployment to catch contrast, name, role, focus, and regression issues.',
  },
]

const checkpoints = [
  'Pages should keep one clear heading structure: one h1, predictable h2 sections, and descriptive link text.',
  'Experimental tools should never be the only path to content. Grid, ruler, hand controls, and Figma mode are optional layers.',
  'NDA work should be marked before a visitor opens it, with a public preview that does not imply the full case study is available.',
  'Dark mode and glass overlays need contrast checks after visual polish, because subtle opacity changes can drift quickly.',
  'Media-heavy case studies should keep alt text, captions, transcripts, and keyboard-visible controls in the review loop.',
]

const standards = [
  {
    label: 'WCAG 2.2',
    href: 'https://www.w3.org/TR/WCAG22/',
    text: 'Baseline for perceivable, operable, understandable, and robust behavior.',
  },
  {
    label: 'WAI-ARIA keyboard guidance',
    href: 'https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/',
    text: 'Reference for focus visibility, keyboard movement, and predictable controls.',
  },
]

export default function AccessibilityPage() {
  useEffect(() => {
    document.body.classList.add('page-accessibility')
    return () => document.body.classList.remove('page-accessibility')
  }, [])

  const ndaProjects = visibleProjects.filter(project => getProjectAccessLabel(project))

  return (
    <>
      <Helmet>
        <title>Accessibility · Parth Pawar</title>
        <meta
          name="description"
          content="Accessibility documentation for Parth Pawar portfolio, including current decisions, known concerns, and planned improvements."
        />
      </Helmet>

      <Nav />

      <main id="main-content" className="a11y-page">
        <header className="a11y-doc-hero">
          <div className="wrap a11y-doc-hero__inner">
            <div className="a11y-doc-meta">
              <span>Portfolio accessibility note</span>
              <span>Last reviewed July 9, 2026</span>
              <span>Static GitHub Pages build</span>
            </div>
            <h1>Accessibility is product behavior.</h1>
            <p>
              This document explains how the portfolio is intended to work for keyboard users, screen-reader users,
              people who reduce motion, and visitors who simply need a calmer path through the work.
            </p>
          </div>
        </header>

        <div className="wrap a11y-doc-shell">
          <aside className="a11y-doc-toc" aria-label="Accessibility document contents">
            <span className="mono-label">Contents</span>
            <nav>
              {contents.map(item => (
                <a key={item.href} href={item.href}>{item.label}</a>
              ))}
            </nav>
          </aside>

          <article className="a11y-doc">
            <section id="intent" className="a11y-doc-section">
              <span className="a11y-section-num">01</span>
              <h2>Intent</h2>
              <p>
                This portfolio has a lot of expressive UI: rulers, canvas overlays, 3D objects, motion, cards,
                case-study rails, and experimental interaction tools. The accessibility goal is not to remove that
                personality. The goal is to make sure the expressive layer never blocks the basic job: reading the work,
                opening projects, understanding access limits, and contacting me.
              </p>
              <p>
                The practical standard is WCAG 2.2 AA behavior. That means readable text, visible focus, keyboard access,
                reduced-motion safety, resilient layouts, and meaningful alternatives for non-text media.
              </p>
            </section>

            <section id="current-state" className="a11y-doc-section">
              <span className="a11y-section-num">02</span>
              <h2>Current state</h2>
              <div className="a11y-note-list">
                {statusNotes.map(note => (
                  <section key={note.title} className="a11y-note">
                    <div>
                      <span>{note.state}</span>
                      <h3>{note.title}</h3>
                    </div>
                    <p>{note.body}</p>
                  </section>
                ))}
              </div>
            </section>

            <section id="interaction-model" className="a11y-doc-section">
              <span className="a11y-section-num">03</span>
              <h2>Interaction model</h2>
              <p>
                Primary navigation is conventional: logo, Work, About, and contact. Category pages and case studies use
                ordinary links first. Optional tools such as grid, ruler, Figma mode, hand controls, and audio do not
                replace the page structure.
              </p>
              <blockquote>
                Experimental interactions are allowed to delight, but they should not become the only door into the room.
              </blockquote>
              <p>
                The page also keeps a skip link and semantic landmarks so a visitor can jump directly to the main content
                without crossing the decorative frame.
              </p>
            </section>

            <section id="media-motion" className="a11y-doc-section">
              <span className="a11y-section-num">04</span>
              <h2>Media and motion</h2>
              <p>
                Motion is used to show hierarchy and spatial context, but the site should remain legible when motion is
                reduced. Decorative canvases collapse when WebGL is unavailable. Images in project cards and case studies
                need useful alt text when they carry meaning, and empty alt text when they are purely decorative.
              </p>
              <ul className="a11y-checklist">
                {checkpoints.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section id="privacy" className="a11y-doc-section">
              <span className="a11y-section-num">05</span>
              <h2>Private work</h2>
              <p>
                Some portfolio work is access-limited. Those projects are marked before opening, and the public page
                gives only a safe glimpse. That makes the access state understandable for recruiters while keeping
                protected material out of the public static build.
              </p>
              {ndaProjects.length > 0 ? (
                <div className="a11y-inline-list" aria-label="Projects currently marked as access limited">
                  {ndaProjects.map(project => (
                    <Link key={project.slug} to={`/${project.slug}`} className="a11y-inline-link figma-hover">
                      <span>{project.name}</span>
                      <small>{getProjectAccessLabel(project)}</small>
                      <FigmaSelect />
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>

            <section id="known-gaps" className="a11y-doc-section">
              <span className="a11y-section-num">06</span>
              <h2>Known gaps</h2>
              <p>
                This is an actively changing portfolio, so the risk is drift. Visual polish can weaken contrast, new
                media can miss captions, and new controls can accidentally bypass keyboard users. The next pass should
                make the audit repeatable instead of relying on a manual review.
              </p>
              <ol className="a11y-action-list">
                <li>Run Lighthouse and axe checks before the final deployment.</li>
                <li>Review every case-study image for alt text quality, not just presence.</li>
                <li>Check focus order on Work, About, category pages, and the longest case studies.</li>
                <li>Retest dark mode contrast after visual changes to glass, overlays, and labels.</li>
              </ol>
            </section>

            <section id="references" className="a11y-doc-section">
              <span className="a11y-section-num">07</span>
              <h2>References and feedback</h2>
              <p>
                This page is a working note, not a certification. If something is hard to read, hard to operate, or
                confusing with assistive technology, I want to know.
              </p>
              <div className="a11y-reference-list">
                {standards.map(item => (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="a11y-reference figma-hover">
                    <span>{item.label}</span>
                    <small>{item.text}</small>
                    <FigmaSelect />
                  </a>
                ))}
              </div>
              <a
                className="a11y-contact figma-hover"
                href={`mailto:${CONTACT_EMAIL}?subject=Portfolio%20accessibility%20feedback`}
              >
                Report an accessibility issue
                <FigmaSelect />
              </a>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </>
  )
}
