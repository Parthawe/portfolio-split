import { visibleAnimation } from '../utils/visibleActivity'
import { useRef, useEffect } from 'react'

/* ═══════════════════════════════════════════════════════════
   Clock Trio — three timekeeping methods side by side.

   1. Sundial: shadow rotates with real time, gnomon casts it
   2. Mechanical: visible escapement, ticking balance wheel
   3. Digital: abstract blue field — tone=hour, sat=min, lum=sec

   All three show the SAME current time, different mediums.
   ═══════════════════════════════════════════════════════════ */

export default function ClockTrio() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

      const now = new Date()
      const hrs = now.getHours() % 12 + now.getMinutes() / 60
      const mins = now.getMinutes() + now.getSeconds() / 60
      const secs = now.getSeconds() + now.getMilliseconds() / 1000

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      ctx.fillStyle = isDark ? '#111110' : '#FAFAF8'
      ctx.fillRect(0, 0, w, h)

      const panelW = w / 3
      const cy = h * 0.48
      const r = Math.min(panelW * 0.32, h * 0.32)
      const ink = isDark ? 'rgba(255,255,255,' : 'rgba(0,0,0,'

      // ── 1. SUNDIAL ──
      const sx = panelW * 0.5
      {
        // Ground plate (circle)
        ctx.beginPath()
        ctx.arc(sx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? '#1a1916' : '#f0ece0'
        ctx.fill()
        ctx.strokeStyle = ink + '0.1)'
        ctx.lineWidth = 1
        ctx.stroke()

        // Hour lines etched on plate
        ctx.lineCap = 'round'
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2
          ctx.beginPath()
          ctx.moveTo(sx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5)
          ctx.lineTo(sx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85)
          ctx.strokeStyle = ink + '0.12)'
          ctx.lineWidth = i % 3 === 0 ? 1.5 : 0.5
          ctx.stroke()
        }

        // Gnomon (vertical triangle)
        ctx.beginPath()
        ctx.moveTo(sx, cy - r * 0.6)
        ctx.lineTo(sx - 3, cy)
        ctx.lineTo(sx + 3, cy)
        ctx.closePath()
        ctx.fillStyle = ink + '0.5)'
        ctx.fill()

        // Shadow — rotates with hour
        const shadowAngle = (hrs / 12) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(sx, cy)
        ctx.lineTo(sx + Math.cos(shadowAngle) * r * 0.75, cy + Math.sin(shadowAngle) * r * 0.75)
        ctx.strokeStyle = ink + '0.08)'
        ctx.lineWidth = 8
        ctx.stroke()
        ctx.strokeStyle = ink + '0.15)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Label
        ctx.font = `${Math.max(8, w * 0.012)}px monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = ink + '0.25)'
        ctx.fillText('SUNDIAL', sx, cy + r + 24)
        ctx.font = `${Math.max(7, w * 0.009)}px monospace`
        ctx.fillStyle = ink + '0.12)'
        ctx.fillText('Shadow & patience', sx, cy + r + 36)
      }

      // ── 2. MECHANICAL ──
      const mx = panelW * 1.5
      {
        // Watch case
        ctx.beginPath()
        ctx.arc(mx, cy, r * 1.08, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? '#18171a' : '#eae6dc'
        ctx.fill()
        ctx.strokeStyle = ink + '0.08)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Watch face
        const faceGrad = ctx.createRadialGradient(mx, cy, 0, mx, cy, r)
        faceGrad.addColorStop(0, isDark ? '#f5f2ea' : '#fffcf5')
        faceGrad.addColorStop(1, isDark ? '#e0dcd0' : '#f0ece0')
        ctx.beginPath()
        ctx.arc(mx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = faceGrad
        ctx.fill()

        // Hour markers
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2
          const major = i % 3 === 0
          ctx.beginPath()
          ctx.moveTo(mx + Math.cos(a) * r * (major ? 0.72 : 0.82), cy + Math.sin(a) * r * (major ? 0.72 : 0.82))
          ctx.lineTo(mx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92)
          ctx.strokeStyle = 'rgba(30,25,20,' + (major ? '0.6)' : '0.25)')
          ctx.lineWidth = major ? 2 : 1
          ctx.lineCap = 'round'
          ctx.stroke()
        }

        // Hour hand
        const ha = (hrs / 12) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(mx - Math.cos(ha) * r * 0.08, cy - Math.sin(ha) * r * 0.08)
        ctx.lineTo(mx + Math.cos(ha) * r * 0.48, cy + Math.sin(ha) * r * 0.48)
        ctx.strokeStyle = 'rgba(20,18,15,0.75)'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.stroke()

        // Minute hand
        const ma = (mins / 60) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(mx - Math.cos(ma) * r * 0.06, cy - Math.sin(ma) * r * 0.06)
        ctx.lineTo(mx + Math.cos(ma) * r * 0.68, cy + Math.sin(ma) * r * 0.68)
        ctx.strokeStyle = 'rgba(20,18,15,0.55)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Second hand — ticks discretely like a mechanical watch
        const tickSecs = Math.floor(secs) + (1 - Math.pow(1 - (secs % 1), 3)) * 0.15 // slight overshoot
        const sa = (tickSecs / 60) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(mx - Math.cos(sa) * r * 0.12, cy - Math.sin(sa) * r * 0.12)
        ctx.lineTo(mx + Math.cos(sa) * r * 0.72, cy + Math.sin(sa) * r * 0.72)
        ctx.strokeStyle = 'rgba(180,30,30,0.6)'
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Center pin
        ctx.beginPath()
        ctx.arc(mx, cy, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(20,18,15,0.7)'
        ctx.fill()

        // Label
        ctx.font = `${Math.max(8, w * 0.012)}px monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = ink + '0.25)'
        ctx.fillText('MECHANICAL', mx, cy + r + 24)
        ctx.font = `${Math.max(7, w * 0.009)}px monospace`
        ctx.fillStyle = ink + '0.12)'
        ctx.fillText('Precision & craft', mx, cy + r + 36)
      }

      // ── 3. DIGITAL ──
      const dx = panelW * 2.5
      {
        // Color field stays blue while still shifting with the time values.
        const hue = 202 + (hrs / 12) * 18
        const sat = 48 + (mins / 60) * 24
        const lum = isDark ? 16 + (secs / 60) * 18 : 48 + (secs / 60) * 22

        // Background circle
        ctx.beginPath()
        ctx.arc(dx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lum}%)`
        ctx.fill()

        // Inner rings showing time subdivisions
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath()
          ctx.arc(dx, cy, r * (i / 4), 0, Math.PI * 2)
          ctx.strokeStyle = `hsla(${hue + 5 * i}, ${sat}%, ${lum + 15}%, 0.16)`
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Sweeping arc for seconds
        ctx.beginPath()
        ctx.arc(dx, cy, r * 0.85, -Math.PI / 2, -Math.PI / 2 + (secs / 60) * Math.PI * 2)
        ctx.strokeStyle = `hsla(${hue}, ${sat + 20}%, ${Math.min(90, lum + 30)}%, 0.3)`
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.stroke()

        // Digital time text
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        ctx.font = `300 ${Math.max(14, r * 0.3)}px monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = `hsla(0, 0%, ${lum > 40 ? 10 : 90}%, 0.7)`
        ctx.fillText(timeStr, dx, cy + r * 0.08)

        // Label
        ctx.font = `${Math.max(8, w * 0.012)}px monospace`
        ctx.fillStyle = ink + '0.25)'
        ctx.fillText('DIGITAL', dx, cy + r + 24)
        ctx.font = `${Math.max(7, w * 0.009)}px monospace`
        ctx.fillStyle = ink + '0.12)'
        ctx.fillText('Abstraction & data', dx, cy + r + 36)
      }

      // Divider lines between panels
      ctx.strokeStyle = ink + '0.04)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(panelW, h * 0.15); ctx.lineTo(panelW, h * 0.85)
      ctx.moveTo(panelW * 2, h * 0.15); ctx.lineTo(panelW * 2, h * 0.85)
      ctx.stroke()

      // Current time at top center
      const displayTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
      ctx.font = `300 ${Math.max(10, w * 0.014)}px Nikolas, General Sans`
      ctx.textAlign = 'center'
      ctx.fillStyle = ink + '0.2)'
      ctx.fillText(displayTime, w / 2, 20)

    }

    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const activity = visibleAnimation(canvas.parentElement ?? canvas, draw, () => !motion.matches)
    const change = () => activity.wake()
    motion.addEventListener('change', change)
    return () => { motion.removeEventListener('change', change); activity.dispose() }
  }, [])

  return (
    <div style={{
      width: '100%', aspectRatio: '3 / 1',
      maxHeight: 'min(24rem, 48vh)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      border: '1px solid var(--ink-06)',
      contain: 'layout paint size',
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
