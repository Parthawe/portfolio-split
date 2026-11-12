import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Figma-style HUD that follows the cursor.
 * Shows coordinates next to the cursor, fades out when cursor stops moving.
 * Grid toggle stays in a fixed small button bottom-right.
 */

export default function FigmaHUD() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const [isOverFooter, setIsOverFooter] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const rafRef = useRef(0)

  const getRulerOffset = (axis: 'inline' | 'block') => {
    const prop = axis === 'inline' ? '--ruler-inline-offset' : '--ruler-block-offset'
    const value = getComputedStyle(document.body).getPropertyValue(prop)
    return Number.parseFloat(value) || 0
  }

  useEffect(() => {
    if ('ontouchstart' in window || window.matchMedia('(max-width: 768px)').matches) return

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY })
        setVisible(true)

        // Check for figma-hover dimensions
        const el = document.elementFromPoint(e.clientX, e.clientY)
        const nextIsOverFooter = Boolean(el?.closest('footer'))
        setIsOverFooter((current) => current === nextIsOverFooter ? current : nextIsOverFooter)
        const hover = el?.closest('.figma-hover') as HTMLElement | null
        if (hover) {
          const rect = hover.getBoundingClientRect()
          setDim({ w: Math.round(rect.width), h: Math.round(rect.height) })
        } else {
          setDim(null)
        }
      })

      // Fade out after 1.5s of no movement
      clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setVisible(false), 1500)
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
      clearTimeout(hideTimer.current)
    }
  }, [])

  // Grid toggle
  const toggleGrid = useCallback(() => {
    const isOn = document.body.classList.contains('figma-grid-on')
    document.body.classList.toggle('figma-grid-on', !isOn)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "'") { e.preventDefault(); toggleGrid() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleGrid])

  const [isMobile] = useState(() => typeof window !== 'undefined' && (window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window))
  if (isMobile) return null

  const labelLeft = typeof document === 'undefined' ? pos.x + 16 : Math.max(pos.x + 16, getRulerOffset('inline') + 8)
  const footerOffset = isOverFooter ? 12 : 0
  const labelTop = typeof document === 'undefined'
    ? pos.y + 20 + footerOffset
    : Math.max(pos.y + 20 + footerOffset, getRulerOffset('block') + 8)

  return (
    <>
      {/* Cursor-following coordinate label */}
      <div
        className={`figma-cursor-label${visible ? ' figma-cursor-label--visible' : ''}`}
        style={{ left: labelLeft, top: labelTop }}
        aria-hidden="true"
      >
        <span>{pos.x}, {pos.y}</span>
        {dim && <span className="figma-cursor-dim">{dim.w} × {dim.h}</span>}
      </div>

    </>
  )
}
