import { useState, useEffect, useRef, useCallback } from 'react'
import { getTourSteps, type TourStep } from '../../services/agentAI'
import FigmaSelect from '../FigmaSelect'

interface Props {
  route: string
  onExit: () => void
}

function highlightSection(scrollTo?: string) {
  if (!scrollTo) return
  const el = document.querySelector(scrollTo) as HTMLElement | null
  if (!el) return
  el.style.scrollMarginTop = 'calc(var(--nav-h, 56px) + 1.5rem)'
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  el.style.outline = '2px solid var(--select-blue)'
  el.style.outlineOffset = '4px'
  el.style.transition = 'outline 0.25s ease, outline-offset 0.25s ease'
  window.setTimeout(() => {
    el.style.outline = ''
    el.style.outlineOffset = ''
  }, 3000)
}

export default function PresentationBar({ route, onExit }: Props) {
  const [steps, setSteps] = useState<TourStep[]>([])
  const [idx, setIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    setSteps(getTourSteps(route))
    setIdx(0)
    startRef.current = Date.now()
  }, [route])

  // Timer
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.round((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const next = useCallback(() => {
    if (steps.length === 0) return
    setIdx(i => {
      const n = Math.min(i + 1, steps.length - 1)
      if (steps[n]?.scrollTo) highlightSection(steps[n].scrollTo)
      return n
    })
  }, [steps])

  const prev = useCallback(() => {
    if (steps.length === 0) return
    setIdx(i => {
      const n = Math.max(i - 1, 0)
      if (steps[n]?.scrollTo) highlightSection(steps[n].scrollTo)
      return n
    })
  }, [steps])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit()
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit, next, prev])

  // Highlight first step on mount
  useEffect(() => {
    if (steps.length && steps[0].scrollTo) {
      window.setTimeout(() => highlightSection(steps[0].scrollTo), 400)
    }
  }, [steps])

  if (steps.length === 0) return null

  const step = steps[idx]
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="present-bar surface-glass" role="region" aria-label="Presentation mode">
      <div className="present-bar-inner">
        <div className="present-bar-meta">
          <span className="present-bar-step">{idx + 1} / {steps.length}</span>
          <span className="present-bar-timer">{mm}:{ss}</span>
        </div>

        <p className="present-bar-note">{step.text.replace(/\*\*/g, '')}</p>

        <div className="present-bar-controls">
          <button type="button" className="present-bar-btn figma-hover" onClick={prev} disabled={idx === 0} aria-label="Previous">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <FigmaSelect />
          </button>
          <button type="button" className="present-bar-btn figma-hover" onClick={next} disabled={idx === steps.length - 1} aria-label="Next">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <FigmaSelect />
          </button>
          <button type="button" className="present-bar-btn present-bar-exit figma-hover" onClick={onExit} aria-label="Exit presentation">
            ESC
            <FigmaSelect />
          </button>
        </div>
      </div>
    </div>
  )
}
