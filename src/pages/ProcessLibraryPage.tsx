import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import DecisionNote from '../components/case-study/DecisionNote'
import { getProject, isRequestAccessProject } from '../data/projects'
import { projectRecords } from '../data/projectRecords'
import { getProcessCuration, processProjects, processHref, stageLabels, type ProcessStage, type ProcessArtifact } from '../data/processLibrary'
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock'
import NotFoundPage from './NotFoundPage'
import '../styles/process-library.css'

function ArtifactImage({ artifact, eager = false }: { artifact: ProcessArtifact; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  return failed ? <div className="process-image-failure">Preview unavailable. <span>Read the source case study for this artifact.</span></div> : <img src={artifact.src} alt={artifact.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
}

export default function ProcessLibraryPage() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  useEffect(() => { setQuery('') }, [slug])
  const stage = params.get('stage') || 'all'
  const selectedId = params.get('ref')
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const project = slug ? getProject(slug) : undefined
  const curation = slug ? getProcessCuration(slug) : undefined
  const selected = curation?.artifacts.find(a => a.id === selectedId)
  const record = slug ? projectRecords[slug] : undefined
  const requestOnly = isRequestAccessProject(project)
  function close() {
    setParams(p => { p.delete('ref'); return p }, { replace: true, preventScrollReset: true })
  }
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (selected && !el.open) { el.showModal(); lockBodyScroll('process-artifact') }
    if (!selected && el.open) { el.close(); trigger.current?.focus({ preventScroll: true }) }
    return () => { if (el.open) { el.close(); unlockBodyScroll('process-artifact'); trigger.current?.focus({ preventScroll: true }) } }
  }, [selected])
  if (slug && !curation) return <NotFoundPage />
  const artifacts = curation?.artifacts ?? []
  const shown = artifacts.filter(a => (stage === 'all' || a.stage === stage) && `${a.title} ${a.caption} ${a.creator} ${a.evidenceNote || ''}`.toLowerCase().includes(query.toLowerCase()))
  const categories = [...new Set(processProjects.map(x => x.project.category))]
  const filtered = [...processProjects].sort((a, b) => Number(b.curation.artifacts.length > 0) - Number(a.curation.artifacts.length > 0)).filter(x => (category === 'all' || x.project.category === category) && `${x.project.name} ${x.project.desc} ${x.record?.evidence || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <>
    <Helmet><title>{project ? `${project.name} · References & process` : 'References & process'} · Parth Pawar</title><meta name="description" content="Project references, experiments, alternatives, and decisions from the public portfolio archive." /><link rel="canonical" href={`https://designwhich.works/process${slug ? `/${slug}` : ''}`} /></Helmet>
    <Nav />
    <main id="main-content" className="process-library wrap">
      <nav className="process-breadcrumb" aria-label="Process navigation"><Link to="/work">Work</Link><span>/</span>{slug ? <><Link to="/process">References & process</Link><span>/</span><span>{project?.name}</span></> : <span>References & process</span>}</nav>
      <header className="process-heading">
        <div><h1>{project ? `${project.name}: references & process` : 'References & process'}</h1><p>{project ? 'The source material and choices behind the work.' : 'Browse the artifacts, experiments, and decisions behind each project.'}</p></div>
        {project && <Link className="process-action" to={`/${project.slug}`}>Read case study ↗</Link>}
      </header>
      {project ? <>
        <section className="process-context" aria-label="Project context"><p>{project.summaryProblem || project.storyline?.challenge || project.desc}</p><details><summary>About this archive</summary><p>{record?.evidence || 'This page collects the available public project material.'}</p>{record?.boundary && <p>{record.boundary}</p>}<p>Artifact order groups related work. It does not establish a dated research timeline. Only explicitly documented sources are called influences.</p></details></section>
        {requestOnly ? <section className="process-gap"><h2>Public preview only</h2><p>Additional process material is protected. The case study contains the available public preview and its access request.</p><Link className="process-action" to={`/${slug}`}>Open public preview ↗</Link></section> : <>
          {artifacts.length > 0 && <div className="process-tools"><label className="process-search">Find an artifact<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search titles, notes, or credits" /></label><div className="process-stage-tabs" role="group" aria-label="Filter artifacts"><button aria-pressed={stage === 'all'} onClick={() => setParams(p => { p.delete('stage'); return p }, { preventScrollReset: true })}>All <span>{artifacts.length}</span></button>{(Object.keys(stageLabels) as ProcessStage[]).filter(s => artifacts.some(a => a.stage === s)).map(s => <button key={s} aria-pressed={stage === s} onClick={() => setParams(p => { p.set('stage', s); return p }, { preventScrollReset: true })}>{stageLabels[s]} <span>{artifacts.filter(a => a.stage === s).length}</span></button>)}</div></div>}
          <div className="process-artifacts">{shown.map((a, i) => <figure key={a.id} className="process-artifact"><button className="process-image-button" aria-label={`Open ${a.title}`} onClick={e => { trigger.current = e.currentTarget; setParams(p => { p.set('ref', a.id); return p }, { preventScrollReset: true }) }}><ArtifactImage key={a.id} artifact={a} eager={i < 2} /><span className="process-open-hint">Inspect ↗</span></button><figcaption><small>{stageLabels[a.stage]}</small><h2>{a.title}</h2><p>{a.caption}</p><a href={a.sourceHref}>{a.creator} ↗</a></figcaption></figure>)}</div>
          {shown.length === 0 && <div className="process-gap"><h2>{artifacts.length ? 'No matching artifacts' : 'The process archive is incomplete'}</h2><p>{artifacts.length ? 'Try a different search or stage.' : record?.boundary || 'Original sketches, reference credits, and decision records have not yet been assembled for this project.'}</p>{artifacts.length > 0 && <button className="process-action" onClick={() => { setQuery(''); setParams({}, { preventScrollReset: true }) }}>Clear filters</button>}</div>}
          <section className="process-reflection"><div><h2>Alternatives considered</h2><p>{slug === 'mentra' ? 'The source compares a bottom drawer, persistent dock, and card switcher. Inspect “Three ways to reach runtime controls” for the qualitative comparison and its limits.' : slug === 'sculpture' ? 'The source board is labeled “Failed Ideas.” It records alternative forms, but the reasons for rejecting each one are not documented.' : 'A discarded direction needs a source artifact and a recorded reason. The current curation does not establish a rejection history.'}</p></div><div><h2>New directions to explore</h2><p>{curation?.exploration || 'What alternative would challenge the central interaction, and what small prototype could test its tradeoff?'}</p><small>Proposed now. This is a question for a future iteration, not a historical design decision.</small></div></section>
        </>}
        <section className="process-next"><h2>Keep exploring</h2><Link to={`/${slug}`} className="process-action">Return to {project.name} ↗</Link><Link to="/process" className="process-action">Browse all project archives ↗</Link></section>
      </> : <>
        <div className="process-tools"><label className="process-search">Find a project<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Project, material, or design question" /></label><label className="process-category">Discipline<select value={category} onChange={e => setCategory(e.target.value)}><option value="all">All disciplines</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></label><p role="status">{filtered.length} project {filtered.length === 1 ? 'archive' : 'archives'}</p></div>
        <div className="process-index">{filtered.map(({ project: p, curation: c, record: r }) => <Link key={p.slug} to={processHref(p.slug)} className={`process-index-entry${c.artifacts.length ? '' : ' process-index-entry--text'}`}>
          {c.artifacts[0] && <div className="process-index-image"><ArtifactImage artifact={c.artifacts[0]} /></div>}<div><small>{p.tag} · {p.year}</small><h2>{p.name} <span>↗</span></h2><p>{c.artifacts.length ? `${c.artifacts.length} curated artifacts` : isRequestAccessProject(p) ? 'Public preview; additional material protected' : 'Public context; process material incomplete'}</p>{!c.artifacts.length && <p className="process-index-evidence">{r?.evidence || p.desc}</p>}</div></Link>)}</div>
        {!filtered.length && <div className="process-gap"><h2>No matching projects</h2><button className="process-action" onClick={() => { setQuery(''); setCategory('all') }}>Clear filters</button></div>}
      </>}
      <dialog ref={dialog} className="process-dialog" aria-labelledby="process-detail-title" onCancel={e => { e.preventDefault(); close() }} onClick={e => { if (e.target === e.currentTarget) close() }}>
        {selected && <article><header><div><small>{stageLabels[selected.stage]}</small><h2 id="process-detail-title">{selected.title}</h2></div><button className="process-action" onClick={close} autoFocus>Close</button></header><ArtifactImage key={selected.id} artifact={selected} eager />{!selected.decision && <p>{selected.caption}</p>}{selected.decision && <DecisionNote decision={selected.decision} />}{selected.evidenceNote && !selected.decision && <p className="process-evidence-note">{selected.evidenceNote}</p>}<footer><a href={selected.sourceHref}>{selected.creator} · Source case study ↗</a><a href={selected.src} target="_blank" rel="noreferrer">Open full image ↗</a></footer></article>}
      </dialog>
    </main><Footer />
  </>
}
