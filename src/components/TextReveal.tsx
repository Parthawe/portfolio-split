import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeCopy } from '../utils/normalizeCopy'

interface Props {
  front: string
  behind: string
  className?: string
}

type ParthRevealDetail = {
  element: HTMLElement
  message: string
}

function cursorUnavailable() {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia('(hover: none), (pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.innerWidth <= 768
  )
}

/**
 * Hidden-message reveal. On desktop, the shared Parth collaborator cursor
 * travels to the statement and speaks the second line. Touch and reduced-
 * motion visitors keep a direct tap-to-read fallback.
 */
export default function TextReveal({ front, behind, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fallbackMode, setFallbackMode] = useState(cursorUnavailable)
  const [flipped, setFlipped] = useState(false)
  const safeFront = normalizeCopy(front)
  const safeBehind = normalizeCopy(behind)

  const sendParth = useCallback((active: boolean) => {
    const element = containerRef.current
    if (!element || fallbackMode) return

    if (active) {
      window.dispatchEvent(new CustomEvent<ParthRevealDetail>('parth-cursor:reveal', {
        detail: { element, message: safeBehind },
      }))
    } else {
      window.dispatchEvent(new CustomEvent<Pick<ParthRevealDetail, 'element'>>('parth-cursor:reveal-end', {
        detail: { element },
      }))
    }
  }, [fallbackMode, safeBehind])

  useEffect(() => {
    const updateMode = () => setFallbackMode(cursorUnavailable())
    window.addEventListener('resize', updateMode, { passive: true })
    return () => window.removeEventListener('resize', updateMode)
  }, [])

  useEffect(() => () => sendParth(false), [sendParth])

  const toggleFallback = () => {
    if (fallbackMode) setFlipped(current => !current)
  }

  return (
    <div
      ref={containerRef}
      className={`spotlight-reveal ${fallbackMode ? 'spotlight-reveal--flip' : 'spotlight-reveal--parth'} ${flipped ? 'is-flipped' : ''} ${className}`}
      onMouseEnter={fallbackMode ? undefined : () => sendParth(true)}
      onMouseLeave={fallbackMode ? undefined : () => sendParth(false)}
      onFocus={fallbackMode ? undefined : () => sendParth(true)}
      onBlur={fallbackMode ? undefined : () => sendParth(false)}
      onClick={toggleFallback}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        if (fallbackMode) toggleFallback()
        else sendParth(true)
      }}
      aria-pressed={fallbackMode ? flipped : undefined}
      aria-label={fallbackMode ? 'Reveal the second half of this thought' : 'Ask Parth to reveal the hidden thought'}
    >
      <div className="spotlight-front" aria-hidden={fallbackMode && flipped}>
        <span>{safeFront}</span>
      </div>
      {fallbackMode && (
        <div className="spotlight-behind-inline" aria-hidden={!flipped}>
          <span>{safeBehind}</span>
        </div>
      )}
      <span className={`spotlight-hint${fallbackMode ? '' : ' spotlight-hint--parth'}`} aria-hidden="true">
        {fallbackMode ? 'tap' : 'ask parth'}
      </span>
      {!fallbackMode && <span className="sr-only">Hidden thought: {safeBehind}</span>}
    </div>
  )
}
