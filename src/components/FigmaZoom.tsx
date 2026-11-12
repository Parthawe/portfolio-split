import { useEffect, useCallback, useState } from 'react'

/**
 * Figma-style zoom: Cmd+/- to zoom page, badge shows percentage.
 * Badge only visible when zoom !== 100%. Click to reset.
 */

const STEPS = [50, 67, 75, 80, 90, 100, 110, 125, 150, 200]

export default function FigmaZoom() {
  const [zoom, setZoom] = useState(100)

  const applyZoom = useCallback((level: number) => {
    setZoom(level)
    document.documentElement.style.setProperty('--page-zoom', String(level / 100))
    const wrapper = document.getElementById('root')
    if (wrapper) {
      // CSS zoom participates in layout. A transform only changed the visual
      // size, leaving the root's original height as empty scroll after footer.
      wrapper.style.transform = ''
      wrapper.style.transformOrigin = ''
      wrapper.style.minHeight = ''
      if (level === 100) {
        wrapper.style.zoom = ''
        wrapper.style.width = ''
        document.body.style.overflow = ''
      } else {
        const scale = level / 100
        wrapper.style.zoom = String(scale)
        wrapper.style.width = `${100 / scale}%`
        document.body.style.overflow = ''
      }
    }
  }, [])

  const zoomIn = useCallback(() => {
    const current = zoom
    const next = STEPS.find(s => s > current) || current
    applyZoom(next)
  }, [zoom, applyZoom])

  const zoomOut = useCallback(() => {
    const current = zoom
    const next = [...STEPS].reverse().find(s => s < current) || current
    applyZoom(next)
  }, [zoom, applyZoom])

  const zoomReset = useCallback(() => {
    applyZoom(100)
  }, [applyZoom])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn() }
      if (e.key === '-') { e.preventDefault(); zoomOut() }
      if (e.key === '0') { e.preventDefault(); zoomReset() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomIn, zoomOut, zoomReset])

  const [isMobile] = useState(() =>
    typeof window !== 'undefined' && (window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window)
  )
  if (isMobile) return null

  // Only show badge when zoomed (not at 100%)
  if (zoom === 100) return null

  return (
    <button
      className="figma-zoom-badge surface-glass surface-glass--subtle figma-hover"
      onClick={zoomReset}
      title="Reset zoom (\u23180)"
      aria-label={`Zoom ${zoom}%, click to reset`}
    >
      {zoom}%
    </button>
  )
}
