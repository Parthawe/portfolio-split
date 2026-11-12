import { visibleAnimation } from '../utils/visibleActivity'
import { useRef, useEffect, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════
   Stage Rotation — top-down view of the 15ft revolving stage.

   Drag to spin the platform. Four scene zones are painted
   on the circular stage, showing how rotation reveals
   different scenes to the audience.
   ═══════════════════════════════════════════════════════════ */

const SCENES = [
  { label: 'Living Room', color: '#8B5E3C', angle: 0 },
  { label: 'Garden', color: '#2D6A4F', angle: Math.PI / 2 },
  { label: 'Kitchen', color: '#B8860B', angle: Math.PI },
  { label: 'Bedroom', color: '#5B4A8A', angle: Math.PI * 1.5 },
]

export default function StageRotation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const dragging = useRef(false)
  const lastAngle = useRef(0)
  const velocity = useRef(0)

  const getAngle = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current!.parentElement!.getBoundingClientRect()
    const cx = rect.width / 2, cy = rect.height / 2
    const x = e.clientX - rect.left - cx, y = e.clientY - rect.top - cy
    return Math.atan2(y, x)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.parentElement!.getBoundingClientRect()
      const w = rect.width, h = rect.height
      if (w < 10 || h < 10) { return }
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr
        canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const isStageDark = Boolean(canvas.closest('.project-main--revolving-stage'))
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || isStageDark
      ctx.fillStyle = isStageDark ? '#1A2430' : isDark ? '#111110' : '#FAFAF8'
      ctx.fillRect(0, 0, w, h)

      // Momentum
      if (!dragging.current) {
        velocity.current *= 0.97
        setRotation(r => r + velocity.current)
      }

      const cx = w / 2, cy = h / 2
      const r = Math.min(w, h) * 0.38
      const ink = isDark ? 'rgba(255,255,255,' : 'rgba(0,0,0,'

      // Audience area label
      ctx.font = `${Math.max(7, w * 0.012)}px monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = ink + '0.1)'
      ctx.fillText('AUDIENCE', cx, cy + r + 30)

      // Audience seating arc
      ctx.beginPath()
      ctx.arc(cx, cy, r + 16, Math.PI * 0.15, Math.PI * 0.85)
      ctx.strokeStyle = ink + '0.06)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // Stage platform
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)

      // Scene quadrants
      for (let i = 0; i < 4; i++) {
        const startAngle = (i / 4) * Math.PI * 2 - Math.PI / 4
        const endAngle = startAngle + Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, r, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = SCENES[i].color + (isDark ? '40' : '25')
        ctx.fill()
        ctx.strokeStyle = ink + '0.08)'
        ctx.lineWidth = 1
        ctx.stroke()

        // Scene label
        const labelAngle = startAngle + Math.PI / 4
        const labelR = r * 0.6
        ctx.save()
        ctx.translate(Math.cos(labelAngle) * labelR, Math.sin(labelAngle) * labelR)
        ctx.rotate(-rotation) // counter-rotate so text stays readable
        ctx.font = `${Math.max(8, r * 0.08)}px monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = ink + '0.3)'
        ctx.fillText(SCENES[i].label, 0, 3)
        ctx.restore()
      }

      // Center pivot
      ctx.beginPath()
      ctx.arc(0, 0, 6, 0, Math.PI * 2)
      ctx.fillStyle = ink + '0.15)'
      ctx.fill()

      // Edge tick marks
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * (r - 4), Math.sin(a) * (r - 4))
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
        ctx.strokeStyle = ink + '0.1)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      ctx.restore()

      // Stage border
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = ink + '0.12)'
      ctx.lineWidth = 2
      ctx.stroke()

      // "Front" marker
      ctx.beginPath()
      ctx.moveTo(cx - 8, cy + r + 6)
      ctx.lineTo(cx + 8, cy + r + 6)
      ctx.lineTo(cx, cy + r - 2)
      ctx.closePath()
      ctx.fillStyle = ink + '0.15)'
      ctx.fill()

      // Current facing scene
      const normRot = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const faceIdx = Math.floor(((normRot + Math.PI / 4) / (Math.PI / 2)) % 4)
      const facingScene = SCENES[(4 - faceIdx) % 4]
      ctx.font = `${Math.max(9, w * 0.015)}px monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = ink + '0.25)'
      ctx.fillText(`Facing: ${facingScene.label}`, cx, 16)

    }

    const activity = visibleAnimation(canvas.parentElement ?? canvas, draw)
    return () => activity.dispose()
  }, [rotation])

  return (
    <div className="stage-rotation">
      <div
        className="stage-rotation__viewport"
        style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
        onPointerDown={e => {
          dragging.current = true
          lastAngle.current = getAngle(e)
          velocity.current = 0
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={e => {
          if (!dragging.current) return
          const a = getAngle(e)
          let delta = a - lastAngle.current
          if (delta > Math.PI) delta -= Math.PI * 2
          if (delta < -Math.PI) delta += Math.PI * 2
          velocity.current = delta
          setRotation(r => r + delta)
          lastAngle.current = a
        }}
        onPointerUp={e => {
          dragging.current = false
          ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }} />
      </div>
      <div className="stage-rotation__hint">
        Drag to rotate the stage
      </div>
    </div>
  )
}
