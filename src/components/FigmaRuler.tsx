import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Figma-style rulers: top (horizontal) + left (vertical).
 * Left ruler has numbers rotated 90° to match the reference.
 * No background — transparent overlay.
 */

const RULER_SIZE = 30 // px thickness of ruler strip
const MAJOR = 100     // major tick every 100px
const MINOR = 10      // minor tick every 10px

export default function FigmaRuler() {
  const leftRef = useRef<HTMLCanvasElement>(null)
  const topRef = useRef<HTMLCanvasElement>(null)

  const [isMobile] = useState(() =>
    typeof window !== 'undefined' && (window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window)
  )

  const draw = useCallback(() => {
    const isDark = document.documentElement.dataset.theme === 'dark' || document.body.classList.contains('nav-on-dark')
    const tick = isDark ? 'rgba(247,252,253,0.24)' : 'rgba(26,26,26,0.15)'
    const label = isDark ? 'rgba(247,252,253,0.46)' : 'rgba(26,26,26,0.3)'
    const dpr = window.devicePixelRatio || 1
    const sy = window.scrollY
    const vw = window.innerWidth
    const vh = window.innerHeight
    const topWidth = Math.max(0, vw - RULER_SIZE)
    const leftHeight = Math.max(0, vh - RULER_SIZE)

    // ── Top ruler (horizontal) ──
    const top = topRef.current
    if (top) {
      const ctx = top.getContext('2d')
      if (ctx) {
        top.width = topWidth * dpr
        top.height = RULER_SIZE * dpr
        top.style.width = `${topWidth}px`
        top.style.height = `${RULER_SIZE}px`
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, topWidth, RULER_SIZE)

        ctx.font = '9px General Sans, Nikolas'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        for (let px = 0; px <= vw + MINOR; px += MINOR) {
          const x = px - RULER_SIZE
          if (x < 0 || x > topWidth) continue

          if (px % MAJOR === 0) {
            // Major tick + label
            ctx.fillStyle = tick
            ctx.fillRect(x, RULER_SIZE - 8, 1, 8)
            ctx.fillStyle = label
            ctx.fillText(String(px), x, 7)
          } else if (px % 50 === 0) {
            ctx.fillStyle = tick
            ctx.fillRect(x, RULER_SIZE - 5, 0.5, 5)
          } else {
            ctx.fillStyle = tick
            ctx.fillRect(x, RULER_SIZE - 3, 0.5, 3)
          }
        }
      }
    }

    // ── Left ruler (vertical, numbers rotated 90°) ──
    const left = leftRef.current
    if (left) {
      const ctx = left.getContext('2d')
      if (ctx) {
        left.width = RULER_SIZE * dpr
        left.height = leftHeight * dpr
        left.style.width = `${RULER_SIZE}px`
        left.style.height = `${leftHeight}px`
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, RULER_SIZE, leftHeight)

        ctx.font = '9px General Sans, Nikolas'

        const startPx = Math.floor(sy / MINOR) * MINOR

        for (let px = startPx; px <= startPx + vh + MINOR; px += MINOR) {
          const y = px - sy - RULER_SIZE
          if (y < 0 || y > leftHeight) continue

          if (px % MAJOR === 0) {
            // Major tick
            ctx.fillStyle = tick
            ctx.fillRect(RULER_SIZE - 8, y, 8, 1)

            // Rotated label — save, rotate, draw, restore
            ctx.save()
            ctx.translate(RULER_SIZE / 2 - 2, y)
            ctx.rotate(-Math.PI / 2)
            ctx.fillStyle = label
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillText(String(px), 4, 0)
            ctx.restore()
          } else if (px % 50 === 0) {
            ctx.fillStyle = tick
            ctx.fillRect(RULER_SIZE - 5, y, 5, 0.5)
          } else {
            ctx.fillStyle = tick
            ctx.fillRect(RULER_SIZE - 3, y, 3, 0.5)
          }
        }
      }
    }
  }, [])

  useEffect(() => {
    if (isMobile) return
    draw()
    const onScroll = () => draw()
    const onResize = () => draw()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    const obs = new MutationObserver(draw)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      obs.disconnect()
    }
  }, [isMobile, draw])

  if (isMobile) return null

  return (
    <>
      <div className="figma-ruler-corner" aria-hidden="true" />
      <canvas ref={topRef} className="figma-ruler-top" aria-hidden="true" />
      <canvas ref={leftRef} className="figma-ruler" aria-hidden="true" />
    </>
  )
}
