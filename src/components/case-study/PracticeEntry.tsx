import { Helmet } from 'react-helmet-async'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { settleAnchor } from '../../utils/settleAnchor'
import Nav from '../Nav'
import Footer from '../Footer'
import { getProject } from '../../data/projects'
import { projectRecords } from '../../data/projectRecords'
import { studyComparisons } from '../../data/studyComparisons'
import { practiceEntries, practiceAnchors } from '../../data/practiceEntries'
import './practice-entry.css'

/** A short practice record, without suggesting that missing originals are demonstrated. */
export default function PracticeEntry({ slug }: { slug: keyof typeof practiceEntries }) {
  const entry = practiceEntries[slug]
  const anchors = practiceAnchors[slug]
  const location = useLocation()
  const [notesOpen, setNotesOpen] = useState(false)
  useEffect(() => {
    const id = location.hash.slice(1)
    if (!id) return
    if (anchors.notes.includes(id)) setNotesOpen(true)
    return settleAnchor(id)
  }, [location.hash, anchors])
  const project = getProject(slug)!
  const record = projectRecords[slug]
  const study = studyComparisons[slug]
  return <>
    <Helmet><title>{project.name} · Practice · Parth Pawar</title><meta name="description" content={entry.description} /></Helmet>
    <Nav />
    <main id="main-content" className="project-main practice-entry">
      <article className="wrap">
        <Link to="/work" className="glass-action">Back to work</Link>
        <Link to={`/process/${encodeURIComponent(slug)}`} className="glass-action">References &amp; process ↗</Link>
        <header>
          <h1>{project.name}</h1>
          <p>{entry.description}</p>
          <p className="practice-entry__context">Practice notes · {project.year} · NYU ITP</p>
        </header>
        <section id={anchors.intro[0]} aria-label="Practice and source status">
          <h2>What I explored</h2>
          <p>{entry.focus}</p>
          <ul id={!study ? anchors.notes[0] : undefined}>{entry.notes.map(note => <li key={note}>{note}</li>)}</ul>
          <h2>Available material</h2>
          <p>{record.evidence}</p>
          <p>{entry.limitation}</p>
        </section>
        {study && <details id={anchors.notes[0]} className="practice-entry__details" open={notesOpen} onToggle={event => setNotesOpen(event.currentTarget.open)}>
          <summary>Read the study notes ({study.items.length})</summary>
          <p>These descriptions organize the course notes. They are reading aids, not recovered prototypes or test results.</p>
          {study.items.map(item => <section key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.input} {item.mapping} {item.response}</p>
            <p><strong>Open question:</strong> {item.question}</p>
          </section>)}
        </details>}
        <section id={anchors.related[0]} className="practice-entry__related" aria-label="Related documented projects">
          {anchors.related.slice(1).map(id => <span key={id} id={id} className="practice-entry__anchor" />)}
          <h2>Related work with original material</h2>
          <p>These separate projects have their own documentation; they do not replace the missing course artifacts.</p>
          {entry.related.map(item => <Link key={item.slug} to={`/${item.slug}`} className="practice-entry__link"><span>{item.title}</span><span>{item.note}</span></Link>)}
        </section>
      </article>
    </main>
    <Footer />
  </>
}
