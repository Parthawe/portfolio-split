import PortfolioSlider from './PortfolioSlider'
import { visibleAnimation } from '../utils/visibleActivity'
import { useRef, useEffect, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════
   Salt Simulation — digital version of the salt mill.

   Slider advances the "story" and particles (salt grains)
   accumulate on a dark surface. Mirrors the physical
   installation where a salt mill grinds as you read.
   ═══════════════════════════════════════════════════════════ */

interface Grain {
  x: number; y: number; vx: number; vy: number
  size: number; settled: boolean; alpha: number; drift: number
}

export default function SaltSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [storyPos, setStoryPos] = useState(0)
  const grainsRef = useRef<Grain[]>([])
  const lastPosRef = useRef(0)

  const spawnGrains = useCallback((count: number, w: number, h: number) => {
    const cx = w / 2
    const spawnY = h * 0.25
    for (let i = 0; i < count; i++) {
      grainsRef.current.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: spawnY + Math.random() * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: 0.5 + Math.random() * 1.5,
        size: 1.5 + Math.random() * 2.5,
        settled: false,
        alpha: 0.6 + Math.random() * 0.4,
        drift: Math.random() * Math.PI * 2,
      })
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const parent = canvas.parentElement
      if (!parent) { return }
      const rect = parent.getBoundingClientRect()
      const w = rect.width, h = rect.height
      if (w < 10 || h < 10) { return }
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr
        canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const progress = storyPos / 100
      const centerX = w / 2
      const groundY = h * 0.78

      // Installation surface
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, '#132f48')
      bg.addColorStop(0.58, '#0d243a')
      bg.addColorStop(1, '#071724')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      const vignette = ctx.createRadialGradient(centerX, h * 0.5, 0, centerX, h * 0.5, w * 0.7)
      vignette.addColorStop(0, 'rgba(255, 246, 224, 0.08)')
      vignette.addColorStop(0.48, 'rgba(49, 111, 148, 0.08)')
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.36)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, w, h)

      // Physical black platform / table edge
      const platformY = h * 0.62
      const platformH = h * 0.28
      ctx.fillStyle = 'rgba(4, 10, 16, 0.36)'
      ctx.fillRect(w * 0.08, platformY, w * 0.84, platformH)
      ctx.strokeStyle = 'rgba(244, 231, 203, 0.12)'
      ctx.lineWidth = 1
      ctx.strokeRect(w * 0.08, platformY, w * 0.84, platformH)

      // Story path — visible even before interaction.
      ctx.save()
      ctx.translate(centerX, groundY)
      ctx.strokeStyle = 'rgba(244, 231, 203, 0.16)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 10])
      ctx.beginPath()
      ctx.moveTo(-w * 0.32, 0)
      ctx.bezierCurveTo(-w * 0.14, -h * 0.08, w * 0.14, -h * 0.08, w * 0.32, 0)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      const checkpoints = [
        { x: w * 0.18, label: 'ask' },
        { x: w * 0.38, label: 'grind' },
        { x: w * 0.62, label: 'cannot stop' },
        { x: w * 0.82, label: 'sea' },
      ]
      checkpoints.forEach((point, index) => {
        const active = progress >= index / (checkpoints.length - 1)
        ctx.beginPath()
        ctx.arc(point.x, groundY + Math.sin(index) * 6, active ? 4.5 : 3.5, 0, Math.PI * 2)
        ctx.fillStyle = active ? 'rgba(244, 231, 203, 0.84)' : 'rgba(244, 231, 203, 0.2)'
        ctx.fill()
        ctx.font = `${Math.max(8, w * 0.012)}px monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = active ? 'rgba(244, 231, 203, 0.72)' : 'rgba(244, 231, 203, 0.24)'
        ctx.fillText(point.label.toUpperCase(), point.x, groundY + 22)
      })

      // Mill (white cylinder at top)
      const millX = centerX, millY = h * 0.2
      const millR = Math.min(w * 0.078, 42)
      const handleTurn = storyPos * 0.12

      // Soft spotlight under mill
      const glow = ctx.createRadialGradient(millX, millY + millR * 2.5, 0, millX, millY + millR * 2.5, millR * 4.8)
      glow.addColorStop(0, `rgba(244, 231, 203, ${0.08 + progress * 0.1})`)
      glow.addColorStop(1, 'rgba(244, 231, 203, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(millX - millR * 5, millY, millR * 10, millR * 7)

      // Mill body
      ctx.beginPath()
      ctx.ellipse(millX, millY + millR * 0.8, millR, millR * 0.3, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(232, 224, 211, 0.42)'
      ctx.fill()
      ctx.fillStyle = 'rgba(232, 224, 211, 0.72)'
      ctx.fillRect(millX - millR, millY - millR, millR * 2, millR * 1.8)
      const bodyShade = ctx.createLinearGradient(millX - millR, 0, millX + millR, 0)
      bodyShade.addColorStop(0, 'rgba(23, 44, 60, 0.3)')
      bodyShade.addColorStop(0.48, 'rgba(255,255,255,0)')
      bodyShade.addColorStop(1, 'rgba(23, 44, 60, 0.22)')
      ctx.fillStyle = bodyShade
      ctx.fillRect(millX - millR, millY - millR, millR * 2, millR * 1.8)
      ctx.beginPath()
      ctx.ellipse(millX, millY - millR, millR, millR * 0.3, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(248, 240, 224, 0.88)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.stroke()

      // Handle
      ctx.save()
      ctx.translate(millX, millY - millR - 10)
      ctx.rotate(handleTurn)
      ctx.fillStyle = '#bb8b57'
      ctx.fillRect(-2, -18, 4, 34)
      ctx.beginPath()
      ctx.arc(0, -20, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Spawn grains based on slider movement
      const delta = storyPos - lastPosRef.current
      if (delta > 0) {
        const count = Math.ceil(delta * (8 + progress * 10))
        spawnGrains(count, w, h)
      }
      lastPosRef.current = storyPos

      // Update and draw grains
      const grains = grainsRef.current

      for (const g of grains) {
        if (!g.settled) {
          g.vy += 0.15 // gravity
          g.vx *= 0.98
          g.vx += Math.sin(g.drift + g.y * 0.02) * 0.012
          g.x += g.vx
          g.y += g.vy

          // Check if settled
          if (g.y >= groundY - g.size) {
            // Check pile — settle on top of other grains
            let settleY = groundY
            for (const other of grains) {
              if (other.settled && Math.abs(other.x - g.x) < g.size + other.size) {
                settleY = Math.min(settleY, other.y - g.size)
              }
            }
            g.y = settleY
            g.vy = 0; g.vx = 0
            g.settled = true
          }
        }

        // Draw grain
        ctx.beginPath()
        ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(244, 238, 222, ${g.alpha * (g.settled ? 0.76 : 0.94)})`
        ctx.fill()
      }

      // Static salt bed based on progress, so the end state feels full.
      if (progress > 0.03) {
        const moundW = w * (0.14 + progress * 0.38)
        const moundH = h * (0.015 + progress * 0.11)
        const salt = ctx.createRadialGradient(centerX, groundY, 0, centerX, groundY, moundW)
        salt.addColorStop(0, `rgba(244, 238, 222, ${0.55 + progress * 0.3})`)
        salt.addColorStop(0.56, `rgba(244, 238, 222, ${0.2 + progress * 0.26})`)
        salt.addColorStop(1, 'rgba(244, 238, 222, 0)')
        ctx.fillStyle = salt
        ctx.beginPath()
        ctx.ellipse(centerX, groundY + moundH * 0.28, moundW, moundH, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      // Invitation / title label
      ctx.font = `${Math.max(8, w * 0.015)}px monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(244, 231, 203, 0.34)'
      ctx.fillText('WHY THE SEA IS SALT', w / 2, h - 16)

      if (storyPos === 0 && grains.length === 0) {
        ctx.font = `${Math.max(12, w * 0.022)}px var(--sans, sans-serif)`
        ctx.fillStyle = 'rgba(244, 231, 203, 0.74)'
        ctx.fillText('Pull the story forward', w / 2, h * 0.49)
        ctx.font = `${Math.max(9, w * 0.013)}px var(--sans, sans-serif)`
        ctx.fillStyle = 'rgba(244, 231, 203, 0.42)'
        ctx.fillText('The mill remembers every inch.', w / 2, h * 0.55)
      }

    }

    const activity = visibleAnimation(canvas.parentElement ?? canvas, draw)
    return () => activity.dispose()
  }, [storyPos, spawnGrains])

  const reset = useCallback(() => {
    grainsRef.current = []
    setStoryPos(0)
    lastPosRef.current = 0
  }, [])

  const chapter =
    storyPos < 25 ? 'The gift is found'
      : storyPos < 55 ? 'The mill begins'
        : storyPos < 82 ? 'The command breaks loose'
          : 'The sea fills with salt'

  return (
    <div className="salt-sim cs-interactive-contained">
      <div className="salt-sim__stage">
        <canvas ref={canvasRef} className="salt-sim__canvas" />
      </div>

      <div className="salt-sim__controls" aria-label="Story controls">
        <div className="salt-sim__readout">
          <span>{chapter}</span>
          <strong>{Math.round(storyPos)}%</strong>
        </div>
        <label className="salt-sim__label" htmlFor="salt-story-range">Start</label>
        <PortfolioSlider
          id="salt-story-range"
          className="salt-sim__range"
          type="range" min={0} max={100} value={storyPos}
          onChange={e => setStoryPos(Number(e.target.value))}
          aria-label="Story progress"
          style={{ '--story-progress': `${storyPos}%` } as React.CSSProperties}
        />
        <label className="salt-sim__label" htmlFor="salt-story-range">End</label>
        <button className="salt-sim__reset" onClick={reset}>Reset</button>
      </div>
    </div>
  )
}
