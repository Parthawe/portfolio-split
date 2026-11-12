import { useEffect, useId, useRef, useState } from 'react'
import { projectImageProps } from '../../utils/projectImage'
import './evidence-readers.css'
import DecisionNote, { type ScreenDecision } from './DecisionNote'
export type EvidenceScreen = { src: string; alt: string; label: string; decision?: ScreenDecision }
export function EvidenceImage({ src, alt, zoomable = true }: { src: string; alt: string; zoomable?: boolean }) {
  const [attempt, setAttempt] = useState(0), [failed, setFailed] = useState(false), [loaded, setLoaded] = useState<string | null>(null)
  const retrying = useRef(false), retryButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (failed && retrying.current) {
      if (document.activeElement === document.body) retryButton.current?.focus()
      retrying.current = false
    }
  }, [failed])
  return failed ? <div className="evidence-error" role="status"><p>This image could not load.</p><button ref={retryButton} type="button" className="glass-action" onClick={() => { retrying.current = true; setFailed(false); setLoaded(null); setAttempt(n => n + 1) }}>Retry image</button><a href={src} className="glass-action">Open original</a></div> : <>{loaded !== src && <span className="evidence-loading" role="status">Loading original image…</span>}<img key={`${src}-${attempt}`} data-project-preview={zoomable ? true : undefined} {...projectImageProps(src)} src={src} alt={alt} loading="lazy" decoding="async" tabIndex={zoomable ? 0 : -1} onLoad={event => {
    setLoaded(src)
    if (retrying.current) {
      if (document.activeElement === document.body) event.currentTarget.focus()
      retrying.current = false
    }
  }} onError={() => setFailed(true)} /></>
}
export default function CsScreenStrip({ screens, label, format = 'landscape' }: { screens: EvidenceScreen[]; label: string; format?: 'landscape' | 'portrait' }) {
  const id = useId(), rail = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0), [overflow, setOverflow] = useState(false), [atEnd, setAtEnd] = useState(false)
  useEffect(() => {
    const node = rail.current!
    const measure = () => { setOverflow(node.scrollWidth > node.clientWidth + 1); setAtEnd(node.scrollLeft >= node.scrollWidth - node.clientWidth - 1) }
    const observer = new ResizeObserver(measure); observer.observe(node); measure()
    return () => observer.disconnect()
  }, [screens.length])
  const go = (next: number) => {
    const target = rail.current?.children[next] as HTMLElement | undefined
    if (!target || !rail.current) return
    rail.current.scrollTo({ left: target.offsetLeft - (rail.current.children[0] as HTMLElement).offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <section className={`cs-screen-strip cs-screen-strip--${format}`} aria-label={label}>
    <div className="evidence-controls"><span>{label}</span>{overflow && <div><button type="button" className="glass-action" aria-controls={id} disabled={index === 0} onClick={() => go(index - 1)}>Previous</button><button type="button" className="glass-action" aria-controls={id} disabled={atEnd} onClick={() => go(index + 1)}>Next</button></div>}</div>
    <div ref={rail} id={id} className="cs-screen-strip__rail" tabIndex={0} aria-label={`${label}, scroll to inspect screens`} onScroll={() => {
      const node = rail.current!; setAtEnd(node.scrollLeft >= node.scrollWidth - node.clientWidth - 1); const first = (node.children[0] as HTMLElement)?.offsetLeft ?? 0
      let closest = 0, distance = Infinity
      Array.from(node.children).forEach((child, i) => { const d = Math.abs((child as HTMLElement).offsetLeft - first - node.scrollLeft); if (d < distance) { distance = d; closest = i } }); setIndex(closest)
    }}>
      {screens.map((screen, i) => <figure key={screen.src}><EvidenceImage src={screen.src} alt={screen.alt} /><figcaption>{screen.decision && <DecisionNote decision={screen.decision} />}<span>{String(i + 1).padStart(2, '0')} / {screen.label}</span><a className="glass-action" href={screen.src} target="_blank" rel="noreferrer">Inspect original<span className="sr-only"> in a new tab</span></a></figcaption></figure>)}
    </div>
  </section>
}
