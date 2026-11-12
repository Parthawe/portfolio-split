import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { AnalyticsPreferences } from '../components/PortfolioAnalytics'
import { CONTACT_EMAIL } from '../config/site'
import { createPortfolioComment, getCommentStoreMode, listPortfolioComments, type PortfolioComment } from '../lib/commentStore'
import { sampleNotes } from '../data/sampleNotes'
import '../styles/notes.css'

// Keep the footer's existing storage route so previous notes remain on this wall.
const STORAGE_ROUTE = '/guestbook'
const NOTE_LIMIT = 240

function noteDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NotesPage() {
  const [notes, setNotes] = useState<PortfolioComment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [composing, setComposing] = useState(false)
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [notice, setNotice] = useState('')
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const newNoteRef = useRef<HTMLButtonElement>(null)
  const saveLock = useRef(false)
  const localOnly = getCommentStoreMode() === 'local'
  const localPreview = localOnly && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
  const [showSamples, setShowSamples] = useState(localPreview)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError(false)
    listPortfolioComments(STORAGE_ROUTE)
      .then(list => {
        if (!active) return
        setNotes(current => {
          const ids = new Set(list.map(note => note.id))
          return [...list, ...current.filter(note => !ids.has(note.id))]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        })
      })
      .catch(() => { if (active) setLoadError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  useEffect(() => {
    if (composing) fieldRef.current?.focus({ preventScroll: true })
    else if (notice) newNoteRef.current?.focus({ preventScroll: true })
  }, [composing, notice])

  const closeComposer = useCallback(() => {
    if (saveLock.current) return
    setComposing(false)
    setSaveError('')
    // The draft survives closing the form.
    requestAnimationFrame(() => newNoteRef.current?.focus({ preventScroll: true }))
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (saveLock.current || !body.trim()) return
    saveLock.current = true
    setSaving(true)
    setSaveError('')
    setNotice('')
    try {
      const saved = await createPortfolioComment({
        route: STORAGE_ROUTE,
        xPercent: 50,
        yPercent: 50,
        selector: 'footer-guestbook',
        authorName: name.trim() || 'Anonymous',
        authorEmail: null,
        body: body.trim(),
      })
      setNotes(current => [saved, ...current])
      setBody('')
      setName('')
      setComposing(false)
      setNotice(saved.status === 'pending'
        ? 'Thanks for the note. It will appear publicly after review.'
        : 'Your note is saved in this browser.')
    } catch {
      setSaveError('Your note could not be saved. Your draft is still here; try posting again.')
    } finally {
      saveLock.current = false
      setSaving(false)
    }
  }

  const approvedCount = notes.filter(note => note.status === 'open').length
  const samples = localPreview && showSamples ? sampleNotes.slice(0, 6) : []
  const displayedNotes = [...notes, ...samples]

  return (
    <>
      <Nav />
      <main id="main-content" className="notes-page">
        <div className="notes-wrap">
          <header className="notes-header">
            <div>
              <h1>Notes</h1>
              <p>A place to say hello, share a thought, or leave feedback.</p>
            </div>
            {!loading && !loadError && displayedNotes.length > 0 && (
              <span className="notes-count">{approvedCount > 0 ? `${approvedCount} ${approvedCount === 1 ? 'note' : 'notes'}` : ''}{approvedCount > 0 && samples.length > 0 ? ' + ' : ''}{samples.length > 0 ? `${samples.length} preview notes` : ''}</span>
            )}
          </header>

          {localOnly && !localPreview && <p className="notes-storage">Your notes stay in this browser and are only visible to you.</p>}
          {localPreview && (
            <div className="notes-preview-tools">
              <span>{showSamples ? 'Six example notes are shown in this local preview.' : 'Example notes hidden.'} Your own notes stay in this browser.</span>
              <button className="glass-action" type="button" aria-pressed={showSamples} onClick={() => setShowSamples(value => !value)}>
                {showSamples ? 'Hide examples' : 'Show examples'}
              </button>
            </div>
          )}
          <p className="notes-notice" role="status">{notice}</p>

          <section className="notes-board" aria-label="Visitor notes" aria-busy={loading}>
            <div className={`notes-new${composing ? ' is-open' : ''}`}>
              {composing ? (
                <form id="new-note-form" className="notes-form" onSubmit={submit} onKeyDown={event => {
                  if (event.key === 'Escape') { event.preventDefault(); closeComposer() }
                }}>
                  <div className="notes-form-heading">
                    <h2>New note</h2>
                    <button type="button" onClick={closeComposer} disabled={saving}>Close</button>
                  </div>
                  <label htmlFor="note-body">Your note</label>
                  <textarea id="note-body" ref={fieldRef} value={body} maxLength={NOTE_LIMIT} required rows={4}
                    placeholder="What’s on your mind?" onChange={event => setBody(event.target.value)}
                    disabled={saving} aria-describedby="note-sharing note-length" />
                  <span id="note-length" className="notes-length">{body.length}/{NOTE_LIMIT}</span>
                  <label htmlFor="note-name">Your name <span>(optional)</span></label>
                  <input id="note-name" value={name} maxLength={60} autoComplete="nickname"
                    placeholder="Anonymous" onChange={event => setName(event.target.value)} disabled={saving} />
                  <p id="note-sharing" className="notes-sharing">{localOnly
                    ? 'This note stays in your browser.'
                    : 'Your name and note will be public after review. Leave private details out.'}</p>
                  {saveError && <p className="notes-error" role="alert">{saveError}</p>}
                  <button type="submit" className="notes-post" disabled={saving || !body.trim()}>
                    {saving ? 'Posting…' : 'Post note'}
                  </button>
                </form>
              ) : (
                <button ref={newNoteRef} type="button" className="notes-new-button" aria-expanded={false}
                  onClick={() => { setComposing(true); setNotice('') }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.25" />
                  </svg>
                  <span>New note</span>
                  <span className="notes-new-hint">Leave something here.</span>
                </button>
              )}
            </div>

            {loading && displayedNotes.length === 0 && Array.from({ length: 3 }, (_, index) => (
              <div className="note-card note-skeleton" aria-hidden="true" key={index}><span /><span /><span /></div>
            ))}
            {displayedNotes.map(note => (
              <article className="note-card" data-note-kind={note.selector === 'preview-sample' ? 'example' : 'visitor'} data-preserve-copy key={note.id} aria-label={`${note.selector === 'preview-sample' ? 'Example note' : 'Note'} from ${note.authorName}`}>
                <p className="note-body">{note.body}</p>
                <footer className="note-meta">
                  <div className="note-credit">
                    <span className="note-author">{note.authorName}</span>
                  </div>
                  <time dateTime={note.createdAt}>{noteDate(note.createdAt)}</time>
                  {note.status === 'pending' && <span className="note-pending">Awaiting review · visible only to you</span>}
                </footer>
              </article>
            ))}
          </section>

          {loadError ? (
            <div className="notes-load-error" role="alert">
              <p>Notes could not be loaded.</p>
              <button type="button" onClick={() => setAttempt(value => value + 1)} disabled={loading}>
                {loading ? 'Loading…' : 'Try again'}
              </button>
            </div>
          ) : !loading && displayedNotes.length === 0 ? (
            <p className="notes-empty">No notes yet. You can leave the first one.</p>
          ) : null}

          <footer className="notes-footer">
            <Link className="glass-action" to="/">Back to the portfolio</Link>
            <a className="glass-action" href={`mailto:${CONTACT_EMAIL}`}>Email Parth</a>
            <Link className="glass-action" to="/accessibility">Accessibility</Link>
          </footer>
          <AnalyticsPreferences />
        </div>
      </main>
    </>
  )
}
