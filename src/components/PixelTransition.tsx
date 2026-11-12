import { useRef, useEffect, useMemo } from 'react'

/**
 * Pixelated scroll transition.
 *
 * The section above is clipped by a pixelated edge that eats into it
 * as you scroll. The image/content starts complete — as you scroll,
 * pixel blocks (matching the bg below) appear from the bottom up,
 * disintegrating the image into the next section.
 *
 * Uses CSS clip-path on the previous section? No — simpler:
 * A grid of cells overlaid on the bottom of the previous section.
 * Cells start transparent. As you scroll, they become opaque
 * (bg-colored), eating the image away pixel by pixel.
 * Bottom cells appear first, top cells last = upward dissolve.
 */

interface Props {
  cols?: number
  rows?: number
  className?: string
}

export default function PixelTransition({
  cols = 16,
  rows = 8,
  className = '',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])
  const total = cols * rows

  // Each cell gets a threshold: when scroll progress exceeds it, cell appears.
  // Bottom rows appear first (low threshold), top rows last (high threshold).
  const thresholds = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols)
      const rowNorm = row / Math.max(rows - 1, 1) // 0 = top row, 1 = bottom row
      // Invert: bottom rows get low thresholds (appear first)
      const base = (1 - rowNorm) * 0.7
      const noise = (Math.random() - 0.5) * 0.2
      arr.push(Math.max(0, Math.min(1, base + noise)))
    }
    return arr
  }, [cols, rows, total])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const update = () => {
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight
      // p = how far the transition zone has scrolled into view
      // 0 = transition just entered viewport at bottom
      // 1 = transition is near the top of viewport
      const p = Math.max(0, Math.min(1, 1 - rect.top / vh))

      for (let i = 0; i < total; i++) {
        const cell = cellRefs.current[i]
        if (!cell) continue
        if (p > thresholds[i]) {
          // Snap on — pixel blocks, not gradual fade
          cell.style.opacity = '1'
        } else {
          cell.style.opacity = '0'
        }
      }
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [total, thresholds])

  return (
    <div
      ref={wrapRef}
      className={`pixel-transition ${className}`}
      aria-hidden="true"
      style={{ '--px-cols': cols } as React.CSSProperties}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          ref={el => { cellRefs.current[i] = el }}
          className="pixel-transition-cell"
          style={{ opacity: 0 }}
        />
      ))}
    </div>
  )
}
