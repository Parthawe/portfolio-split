import { visibleAnimation } from '../utils/visibleActivity'
import { useRef, useEffect, useCallback } from 'react'

/**
 * Portal Reveal — fluid cursor mask over stacked photos.
 *
 * Image 1 is always the base. Each hover-enter advances to the
 * next image in the array, revealed through the fluid blob mask.
 * Cycles back to image 2 after the last one.
 */

interface Props {
  images: string[]
  alt?: string
  className?: string
  fit?: 'cover' | 'contain'
}

interface Blob {
  x: number; y: number; r: number; life: number; max: number
}

export default function PortalReveal({ images, alt = '', className = '', fit = 'cover' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activityRef = useRef<ReturnType<typeof visibleAnimation> | null>(null)
  const mouseRef = useRef({ x: -999, y: -999, inside: false })
  const blobsRef = useRef<Blob[]>([])
  const revealIndexRef = useRef(1) // start revealing image index 1

  const loadedImgs = useRef<HTMLImageElement[]>([])
  const readyCount = useRef(0)

  useEffect(() => {
    readyCount.current = 0
    loadedImgs.current = images.map(src => {
      const img = new Image()
      img.onload = () => { readyCount.current++; activityRef.current?.wake() }
      img.src = src
      return img
    })
  }, [images])

  const handleEnter = useCallback(() => {
    mouseRef.current.inside = true
    document.body.classList.add('spotlight-active')
    // Clear old blobs so the new image starts fresh
    blobsRef.current = []
  }, [])

  const handleLeave = useCallback(() => {
    mouseRef.current.inside = false
    document.body.classList.remove('spotlight-active')
    // Advance to next image for the next hover (skip index 0, that's the base)
    if (images.length > 2) {
      const next = revealIndexRef.current + 1
      revealIndexRef.current = next >= images.length ? 1 : next
    }
  }, [images.length])

  const handleMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseRef.current.x = e.clientX - rect.left
    mouseRef.current.y = e.clientY - rect.top
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')!

    const mask = document.createElement('canvas')
    const tmp = document.createElement('canvas')
    const mCtx = mask.getContext('2d')!
    const tmpCtx = tmp.getContext('2d')!

    let w = 0, h = 0, dpr = 1

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      mask.width = w; mask.height = h
      tmp.width = w; tmp.height = h
      activityRef.current?.wake()
    }
    resize()
    window.addEventListener('resize', resize)

    const drawImageFit = (
      target: CanvasRenderingContext2D,
      img: HTMLImageElement,
      tw: number,
      th: number,
      mode: 'cover' | 'contain',
    ) => {
      if (!img.complete || !img.naturalWidth) return
      const iw = img.naturalWidth, ih = img.naturalHeight

      if (mode === 'contain') {
        const scale = Math.min(tw / iw, th / ih)
        const dw = iw * scale
        const dh = ih * scale
        target.drawImage(img, 0, 0, iw, ih, (tw - dw) / 2, (th - dh) / 2, dw, dh)
        return
      }

      const cr = tw / th, ir = iw / ih
      let sx = 0, sy = 0, sw = iw, sh = ih
      if (ir > cr) { sw = ih * cr; sx = (iw - sw) / 2 }
      else { sh = iw / cr; sy = (ih - sh) / 2 }
      target.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th)
    }

    const loop = () => {
      if (readyCount.current < 2 || !loadedImgs.current[0] || !loadedImgs.current[1]) {
        return
      }

      const mouse = mouseRef.current
      const blobs = blobsRef.current

      // Spawn blobs while hovering
      if (mouse.inside && mouse.x > 0) {
        for (let i = 0; i < 2; i++) {
          blobs.push({
            x: mouse.x + (Math.random() - 0.5) * 20,
            y: mouse.y + (Math.random() - 0.5) * 20,
            r: 55 + Math.random() * 55,
            life: 0,
            max: 100 + Math.random() * 60,
          })
        }
      }

      // Update blobs
      for (let i = blobs.length - 1; i >= 0; i--) {
        blobs[i].life++
        if (blobs[i].life > blobs[i].max) { blobs.splice(i, 1); continue }
        blobs[i].x += (Math.random() - 0.5) * 0.3
        blobs[i].y += (Math.random() - 0.5) * 0.3
      }
      if (blobs.length > 200) blobs.splice(0, blobs.length - 200)

      // Draw mask
      const fadeAlpha = mouse.inside ? 0.003 : 0.025
      mCtx.globalCompositeOperation = 'destination-out'
      mCtx.fillStyle = `rgba(0,0,0,${fadeAlpha})`
      mCtx.fillRect(0, 0, w, h)
      mCtx.globalCompositeOperation = 'source-over'
      for (const b of blobs) {
        const t = b.life / b.max
        let s: number
        if (t < 0.08) s = (t / 0.08) ** 2
        else if (t < 0.4) s = 1
        else { const f = (t - 0.4) / 0.6; s = 1 - f * f }
        const r = b.r * Math.max(s, 0)
        if (r < 1) continue
        const g = mCtx.createRadialGradient(b.x, b.y, r * 0.08, b.x, b.y, r)
        g.addColorStop(0, `rgba(255,255,255,${s * 0.85})`)
        g.addColorStop(0.4, `rgba(255,255,255,${0.5 * s})`)
        g.addColorStop(1, 'rgba(255,255,255,0)')
        mCtx.fillStyle = g
        mCtx.beginPath()
        mCtx.arc(b.x, b.y, r, 0, Math.PI * 2)
        mCtx.fill()
      }

      // Composite: reveal image through mask
      const revealImg = loadedImgs.current[revealIndexRef.current]
      if (revealImg?.naturalWidth && blobs.length > 0) {
        tmpCtx.clearRect(0, 0, w, h)
        tmpCtx.globalCompositeOperation = 'source-over'
        tmpCtx.drawImage(mask, 0, 0)
        tmpCtx.globalCompositeOperation = 'source-in'
        drawImageFit(tmpCtx, revealImg, w, h, fit)
      }

      // Final draw
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      drawImageFit(ctx, loadedImgs.current[0], w, h, fit)
      if (blobs.length > 0) ctx.drawImage(tmp, 0, 0)

    }

    const activity = visibleAnimation(wrap, loop, () => readyCount.current >= 2 && (mouseRef.current.inside || blobsRef.current.length > 0))
    activityRef.current = activity
    return () => {
      activity.dispose()
      activityRef.current = null
      document.body.classList.remove('spotlight-active')
      window.removeEventListener('resize', resize)
    }
  }, [images, fit])

  return (
    <div
      ref={wrapRef}
      className={`portal-reveal ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMove}
    >
      <canvas ref={canvasRef} className="portal-reveal-canvas" />
      <noscript><img src={images[0]} alt={alt} style={{ width: '100%' }} /></noscript>
    </div>
  )
}
