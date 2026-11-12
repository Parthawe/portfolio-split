import PortfolioSlider from './PortfolioSlider'
import { createSceneActivity } from '../utils/sceneActivity'
import { visibleAnimation } from '../utils/visibleActivity'
import { useRef, useEffect, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════
   Black Hole — phenomenon interactives.

   Clean, dark, elegant — matching the physical models.
   Each interactive is a focused visualization, not a game.
   ═══════════════════════════════════════════════════════════ */

// ────────────────────────────────────────────────
// 1. TIME DILATION — circular platform with clocks
// ────────────────────────────────────────────────

export function TimeDilation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [distance, setDistance] = useState(0.8)
  const timeRef = useRef({ far: 0, near: 0 })
  const distanceRef = useRef(distance)
  distanceRef.current = distance
  const clockWake = useRef<(() => void) | null>(null)
  useEffect(() => { clockWake.current?.() }, [distance])
  const lastT = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    lastT.current = 0

    const draw = (now: number) => {
      const dt = motion.matches ? 0 : lastT.current ? Math.min(.08, (now - lastT.current) / 1000) : 0
      lastT.current = now

      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.parentElement!.getBoundingClientRect()
      const w = rect.width, h = rect.height
      if (w < 10 || h < 10) { return }
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr
        canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const distance = distanceRef.current
      canvas.dataset.clockTimes = JSON.stringify({ reference: timeRef.current.far, adjustable: timeRef.current.near, rate: Math.sqrt(Math.max(.01,distance)), distance })

      // Background
      ctx.fillStyle = '#08080f'
      ctx.fillRect(0, 0, w, h)

      const nearRate = Math.sqrt(Math.max(0.01, distanceRef.current))
      timeRef.current.far += dt * 8
      timeRef.current.near += dt * nearRate * 8

      const clockR = Math.min(w * 0.14, h * 0.28)
      const cy = h * 0.48

      // ── Circular platform (ellipse at bottom) ──
      const platY = h * 0.72
      const platRx = w * 0.38, platRy = h * 0.08
      ctx.beginPath()
      ctx.ellipse(w / 2, platY, platRx, platRy, 0, 0, Math.PI * 2)
      const platGrad = ctx.createRadialGradient(w / 2, platY, 0, w / 2, platY, platRx)
      platGrad.addColorStop(0, 'rgba(25, 25, 35, 0.9)')
      platGrad.addColorStop(1, 'rgba(15, 15, 20, 0.6)')
      ctx.fillStyle = platGrad
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Platform slats (vertical lines around edge — like the physical model)
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2
        const x1 = w / 2 + Math.cos(a) * platRx * 0.95
        const y1 = platY + Math.sin(a) * platRy * 0.95
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x1, y1 + 12)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // ── Central black hole sphere ──
      const bhX = w / 2, bhY = cy - clockR * 0.2
      const bhR = clockR * 0.5

      // Post/stand
      ctx.beginPath()
      ctx.moveTo(bhX - 1.5, bhY + bhR)
      ctx.lineTo(bhX - 1.5, platY - platRy * 0.3)
      ctx.lineTo(bhX + 1.5, platY - platRy * 0.3)
      ctx.lineTo(bhX + 1.5, bhY + bhR)
      ctx.fillStyle = 'rgba(20, 20, 28, 0.9)'
      ctx.fill()

      // Sphere with gradient
      const bhGrad = ctx.createRadialGradient(bhX - bhR * 0.3, bhY - bhR * 0.3, 0, bhX, bhY, bhR)
      bhGrad.addColorStop(0, 'rgba(50, 48, 55, 1)')
      bhGrad.addColorStop(0.5, 'rgba(20, 18, 25, 1)')
      bhGrad.addColorStop(1, 'rgba(8, 8, 12, 1)')
      ctx.beginPath()
      ctx.arc(bhX, bhY, bhR, 0, Math.PI * 2)
      ctx.fillStyle = bhGrad
      ctx.fill()

      // Subtle highlight on sphere
      ctx.beginPath()
      ctx.arc(bhX - bhR * 0.25, bhY - bhR * 0.25, bhR * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.fill()

      // ── Draw clock function ──
      const drawClock = (cx: number, clockCy: number, r: number, time: number, rate: number, label: string) => {
        const secs = time % 60, mins = (time / 60) % 60, hrs = (time / 3600) % 12
        const accent = rate < 0.3 ? '#ef4444' : rate < 0.6 ? '#f59e0b' : '#e2e0d8'

        // Clock mount / base
        ctx.beginPath()
        ctx.moveTo(cx - r * 0.15, clockCy + r)
        ctx.lineTo(cx - r * 0.15, platY - platRy * 0.5)
        ctx.lineTo(cx + r * 0.15, platY - platRy * 0.5)
        ctx.lineTo(cx + r * 0.15, clockCy + r)
        ctx.fillStyle = 'rgba(20, 20, 28, 0.8)'
        ctx.fill()

        // Clock body (ring)
        ctx.beginPath()
        ctx.arc(cx, clockCy, r * 1.12, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(30, 28, 35, 1)'
        ctx.fill()

        // Clock face
        const faceGrad = ctx.createRadialGradient(cx, clockCy, 0, cx, clockCy, r)
        faceGrad.addColorStop(0, 'rgba(245, 242, 235, 0.95)')
        faceGrad.addColorStop(0.85, 'rgba(235, 230, 220, 0.92)')
        faceGrad.addColorStop(1, 'rgba(210, 205, 195, 0.9)')
        ctx.beginPath()
        ctx.arc(cx, clockCy, r, 0, Math.PI * 2)
        ctx.fillStyle = faceGrad
        ctx.fill()

        // Roman-style hour marks
        ctx.lineCap = 'round'
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2
          const major = i % 3 === 0
          const inner = r * (major ? 0.72 : 0.82)
          const outer = r * 0.92
          ctx.beginPath()
          ctx.moveTo(cx + Math.cos(a) * inner, clockCy + Math.sin(a) * inner)
          ctx.lineTo(cx + Math.cos(a) * outer, clockCy + Math.sin(a) * outer)
          ctx.strokeStyle = major ? 'rgba(30,28,25,0.7)' : 'rgba(30,28,25,0.3)'
          ctx.lineWidth = major ? 2 : 1
          ctx.stroke()
        }

        // Hour hand
        const ha = (hrs / 12) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(cx - Math.cos(ha) * r * 0.08, clockCy - Math.sin(ha) * r * 0.08)
        ctx.lineTo(cx + Math.cos(ha) * r * 0.45, clockCy + Math.sin(ha) * r * 0.45)
        ctx.strokeStyle = 'rgba(20,18,15,0.8)'
        ctx.lineWidth = 2.5
        ctx.stroke()

        // Minute hand
        const ma = (mins / 60) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(cx - Math.cos(ma) * r * 0.06, clockCy - Math.sin(ma) * r * 0.06)
        ctx.lineTo(cx + Math.cos(ma) * r * 0.65, clockCy + Math.sin(ma) * r * 0.65)
        ctx.strokeStyle = 'rgba(20,18,15,0.6)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Second hand
        const sa = (secs / 60) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(cx - Math.cos(sa) * r * 0.12, clockCy - Math.sin(sa) * r * 0.12)
        ctx.lineTo(cx + Math.cos(sa) * r * 0.72, clockCy + Math.sin(sa) * r * 0.72)
        ctx.strokeStyle = rate < 0.6 ? accent : 'rgba(180,30,30,0.7)'
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Center pin
        ctx.beginPath()
        ctx.arc(cx, clockCy, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(20,18,15,0.8)'
        ctx.fill()

        // Label below
        ctx.font = `${Math.max(9, r * 0.22)}px var(--mono, monospace)`
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.fillText(label, cx, platY + platRy + 18)

        // Rate indicator
        ctx.font = `bold ${Math.max(10, r * 0.25)}px var(--mono, monospace)`
        ctx.fillStyle = accent
        ctx.fillText(`${(rate * 100).toFixed(0)}%`, cx, platY + platRy + 32)
      }

      // Position clocks on the platform at different distances
      const farX = w * 0.18, nearX = w * 0.82
      drawClock(farX, cy, clockR, timeRef.current.far, 1, 'Far away')
      drawClock(nearX, cy, clockR, timeRef.current.near, nearRate, 'Near black hole')

      // Distance arc on platform (shows where "near" clock sits)
      const arcAngle = (1 - distance) * Math.PI * 0.6
      ctx.beginPath()
      ctx.arc(w / 2, platY, platRx * 0.6, -Math.PI * 0.1, -Math.PI * 0.1 + arcAngle)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])

    }
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const activity = visibleAnimation(canvas.parentElement ?? canvas, draw, () => !motion.matches)
    clockWake.current = activity.wake
    return () => { clockWake.current = null; activity.dispose() }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        width: '100%', aspectRatio: '16 / 8',
        maxHeight: 'min(30rem, 62vh)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.04)', background: '#08080f',
        contain: 'layout paint size',
      }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div className="black-hole-distance-controls" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12,
        padding: '10px 0',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '16px', color: 'rgba(248,113,113,0.9)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Event horizon
        </span>
        <PortfolioSlider type="range" min={5} max={100} value={distance * 100}
          onChange={e => setDistance(Number(e.target.value) / 100)}
          aria-label="Distance from black hole"
          style={{ width: 'min(180px, 100%)', flex: '1 1 10rem', accentColor: '#999' }}
        />
        <span style={{ fontFamily: 'var(--mono)', fontSize: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Far away
        </span>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────
// 2. GRAVITATIONAL LENSING — glass lens distortion
// ────────────────────────────────────────────────

function seededStars(count: number) {
  let seed = 42
  const next = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  return Array.from({ length: count }, () => {
    const x = next(), y = next(), b = 0.2 + next() * 0.8
    const temp = next() // color temperature
    return { x, y, brightness: b, temp }
  })
}
const STARS = seededStars(300)

export function GravLensing({interactiveOnly=false}:{interactiveOnly?:boolean}={}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const massPos = useRef({ x: 0.5, y: 0.5 })
  const [massStrength, setMassStrength] = useState(60)
  const dragging = useRef(false)
  const timeRef = useRef(0)

  const getPos = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current!.parentElement!.getBoundingClientRect()
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const draw = () => {
      timeRef.current += 0.012
      const t = timeRef.current
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.parentElement!.getBoundingClientRect()
      const w = rect.width, h = rect.height
      if (w < 10 || h < 10) { return }
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr
        canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const bg = ctx.createRadialGradient(w * 0.52, h * 0.48, 20, w * 0.52, h * 0.52, Math.max(w, h) * 0.68)
      bg.addColorStop(0, '#092b4f')
      bg.addColorStop(0.42, '#061b34')
      bg.addColorStop(1, '#020710')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Faint instrument-grid, like a gallery screen rather than plain canvas.
      ctx.save()
      ctx.globalAlpha = 0.13
      ctx.strokeStyle = '#7ecbff'
      ctx.lineWidth = 1
      const grid = 36
      for (let gx = (t * 10) % grid; gx < w; gx += grid) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke()
      }
      for (let gy = (t * 6) % grid; gy < h; gy += grid) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke()
      }
      ctx.restore()

      const mx = massPos.current.x * w, my = massPos.current.y * h
      const strength = massStrength / 100
      const einsteinR = 50 * strength + 15

      // Draw lensed stars
      for (const star of STARS) {
        const driftX = Math.sin(t * 0.35 + star.x * 11) * 1.8
        const driftY = Math.cos(t * 0.28 + star.y * 9) * 1.2
        let sx = star.x * w + driftX
        let sy = star.y * h + driftY
        const dx = sx - mx, dy = sy - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const ox = sx, oy = sy
        if (dist > 15) {
          const deflection = (strength * 7200) / (dist * dist + 24)
          sx += (dx / dist) * deflection
          sy += (dy / dist) * deflection
        }

        // Einstein ring brightening
        const ringDist = Math.abs(dist - einsteinR)
        const ringBoost = ringDist < 34 ? (1 - ringDist / 34) * 0.85 : 0
        const shear = Math.min(16, ringBoost * (5 + strength * 16))

        const alpha = Math.min(1, star.brightness * 0.55 + ringBoost)
        const r = 0.85 + ringBoost * 3.5 + star.brightness * 0.55

        // Star color based on temperature
        const R = star.temp < 0.3 ? 180 : star.temp < 0.7 ? 240 : 255
        const G = star.temp < 0.3 ? 200 : star.temp < 0.7 ? 235 : 220
        const B = 255

        if (shear > 0.8 && dist > 1) {
          const tx = -dy / dist
          const ty = dx / dist
          ctx.beginPath()
          ctx.moveTo(sx - tx * shear, sy - ty * shear)
          ctx.lineTo(sx + tx * shear, sy + ty * shear)
          ctx.strokeStyle = `rgba(${R}, ${G}, ${B}, ${alpha * 0.72})`
          ctx.lineWidth = Math.max(1, r * 0.8)
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${alpha})`
          ctx.fill()
        }

        if (dist < einsteinR * 1.25 && dist > 20) {
          ctx.beginPath()
          ctx.moveTo(ox, oy)
          ctx.lineTo(sx, sy)
          ctx.strokeStyle = `rgba(126, 203, 255, ${0.02 + ringBoost * 0.08})`
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Glow on bright/boosted stars
        if (alpha > 0.5) {
          ctx.beginPath()
          ctx.arc(sx, sy, r * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${alpha * 0.09})`
          ctx.fill()
        }
      }

      // Black hole with accretion disk
      const bhR = 10 + strength * 18

      // Accretion disk
      ctx.save()
      ctx.translate(mx, my)
      ctx.rotate(0.18 + Math.sin(t * 0.4) * 0.04)
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.ellipse(0, 0, bhR * (3.2 + i * 0.42), bhR * (1.08 + i * 0.18), 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(111, 202, 255, ${0.16 - i * 0.035})`
        ctx.lineWidth = 2 - i * 0.35
        ctx.stroke()
      }
      const diskGrad = ctx.createRadialGradient(0, 0, bhR * 0.6, 0, 0, bhR * 3.6)
      diskGrad.addColorStop(0, 'rgba(174, 229, 255, 0.22)')
      diskGrad.addColorStop(0.45, 'rgba(45, 168, 255, 0.1)')
      diskGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = diskGrad
      ctx.beginPath()
      ctx.ellipse(0, 0, bhR * 3.7, bhR * 1.45, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Einstein ring
      ctx.beginPath()
      ctx.arc(mx, my, einsteinR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(142, 219, 255, ${0.1 + strength * 0.16})`
      ctx.lineWidth = 2
      ctx.shadowColor = 'rgba(68, 179, 255, 0.45)'
      ctx.shadowBlur = 18
      ctx.stroke()
      ctx.shadowBlur = 0

      // Photon sphere
      ctx.beginPath()
      ctx.arc(mx, my, bhR * 1.5, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(191, 232, 255, 0.18)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Event horizon
      const ehGrad = ctx.createRadialGradient(mx - bhR * 0.2, my - bhR * 0.2, 0, mx, my, bhR)
      ehGrad.addColorStop(0, 'rgba(2, 6, 12, 1)')
      ehGrad.addColorStop(1, 'rgba(0, 0, 0, 1)')
      ctx.beginPath()
      ctx.arc(mx, my, bhR, 0, Math.PI * 2)
      ctx.fillStyle = ehGrad
      ctx.fill()

      // Draggable target and status readout.
      ctx.beginPath()
      ctx.arc(mx, my, bhR + 7 + Math.sin(t * 2.4) * 2, 0, Math.PI * 2)
      ctx.strokeStyle = dragging.current ? 'rgba(255,255,255,0.62)' : 'rgba(142,219,255,0.34)'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.font = '10px var(--mono), monospace'
      ctx.fillStyle = 'rgba(226,244,255,0.62)'
      ctx.letterSpacing = '1px'
      ctx.fillText(`MASS ${Math.round(massStrength)}%`, 18, 24)
      ctx.fillStyle = 'rgba(226,244,255,0.38)'
      ctx.fillText('DRAG THE HORIZON', 18, 42)

    }
    const activity = interactiveOnly ? createSceneActivity(canvas.parentElement ?? canvas,()=>draw(),{idleMs:1500,introMs:1500}) : visibleAnimation(canvas.parentElement ?? canvas, draw)
    return () => activity.dispose()
  }, [massStrength,interactiveOnly])

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(7,30,54,0.96), rgba(3,10,20,0.96))',
      border: '1px solid rgba(81,174,255,0.36)',
      boxShadow: '0 18px 60px rgba(9,77,138,0.18)',
    }}>
      <div style={{
        width: '100%', aspectRatio: '16 / 9',
        maxHeight: 'min(34rem, 68vh)',
        overflow: 'hidden',
        background: '#040408',
        cursor: dragging.current ? 'grabbing' : 'grab', touchAction: 'none',
        contain: 'layout paint size',
      }}
        tabIndex={interactiveOnly ? 0 : undefined}
        role={interactiveOnly ? 'group' : undefined}
        aria-label={interactiveOnly ? 'Lens position. Use arrow keys to move; Home centers the lens.' : undefined}
        onKeyDown={e => { if (!interactiveOnly) return; const moves: Record<string,[number,number]> = {ArrowLeft:[-.03,0],ArrowRight:[.03,0],ArrowUp:[0,-.03],ArrowDown:[0,.03]}; if(e.key==='Home'){e.preventDefault();massPos.current={x:.5,y:.5}}else if(moves[e.key]){e.preventDefault();const [x,y]=moves[e.key];massPos.current={x:Math.max(.05,Math.min(.95,massPos.current.x+x)),y:Math.max(.05,Math.min(.95,massPos.current.y+y))}} }}
        onPointerCancel={() => { dragging.current = false }}
        onPointerDown={e => { dragging.current = true; massPos.current = getPos(e); (e.target as HTMLElement).setPointerCapture(e.pointerId) }}
        onPointerMove={e => { if (dragging.current) massPos.current = getPos(e) }}
        onPointerUp={e => { dragging.current = false; (e.target as HTMLElement).releasePointerCapture(e.pointerId) }}
      >
        <canvas ref={canvasRef} role={interactiveOnly ? 'img' : undefined} aria-label={interactiveOnly ? 'Original illustrative gravitational lensing demonstration: a movable lens distorts the star field.' : undefined} style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }} />
      </div>
      <div style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 14,
        display: 'grid',
        gridTemplateColumns: 'auto minmax(9rem, 16rem) auto',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 999,
        background: 'rgba(3, 12, 24, 0.7)',
        border: '1px solid rgba(142,219,255,0.18)',
        boxShadow: '0 14px 34px rgba(0,0,0,0.24)',
        backdropFilter: 'blur(10px)',
      }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '16px',
          color: 'rgba(226,244,255,0.72)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>Mass</span>
        <PortfolioSlider type="range" min={15} max={100} value={massStrength}
          onChange={e => setMassStrength(Number(e.target.value))}
          aria-label="Black hole mass" className="black-hole-mass-slider" style={{ width: '100%', accentColor: '#7dd3fc' }} />
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '16px',
          color: 'rgba(226,244,255,0.72)',
          fontVariantNumeric: 'tabular-nums',
        }}>{massStrength}%</span>
      </div>
      {!interactiveOnly&&<style>{`
        .black-hole-mass-slider {
          appearance: none;
          -webkit-appearance: none;
          height: 4px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7dd3fc ${massStrength}%, rgba(226,244,255,0.18) ${massStrength}%);
          outline: none;
        }
        .black-hole-mass-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(2, 8, 18, 0.9);
          background: #e2f4ff;
          box-shadow: 0 0 0 4px rgba(125,211,252,0.2), 0 0 22px rgba(125,211,252,0.55);
          cursor: pointer;
        }
        .black-hole-mass-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(2, 8, 18, 0.9);
          background: #e2f4ff;
          box-shadow: 0 0 0 4px rgba(125,211,252,0.2), 0 0 22px rgba(125,211,252,0.55);
          cursor: pointer;
        }
      `}</style>}
    </div>
  )
}

// ────────────────────────────────────────────────
// 3. BINARY MERGER — three stages with ripple patterns
// Matches the 3D-printed models with concentric spirals
// ────────────────────────────────────────────────

export function BinaryMerger() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)

  const restart = useCallback(() => { tRef.current = 0 }, [])

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
      ctx.fillStyle = '#08080f'
      ctx.fillRect(0, 0, w, h)

      tRef.current += 0.012
      const t = tRef.current
      const totalDuration = 12 // seconds per full cycle

      // Three panels side by side (like the physical models)
      const panelW = (w - 40) / 3
      const panelH = h - 40
      const panelY = 20

      const panels = [
        { label: 'Inspiral', x: 10 },
        { label: 'Merger', x: 10 + panelW + 10 },
        { label: 'Ringdown', x: 10 + (panelW + 10) * 2 },
      ]

      // Determine which phase is "active" based on time
      const cycle = t % totalDuration
      const activeIdx = cycle < 5 ? 0 : cycle < 8 ? 1 : 2

      for (let pi = 0; pi < 3; pi++) {
        const p = panels[pi]
        const pcx = p.x + panelW / 2
        const pcy = panelY + panelH / 2

        // Panel background
        const isActive = pi === activeIdx
        ctx.fillStyle = isActive ? 'rgba(20, 18, 28, 0.8)' : 'rgba(12, 11, 18, 0.6)'
        ctx.strokeStyle = isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(p.x, panelY, panelW, panelH, 6)
        ctx.fill()
        ctx.stroke()

        // Draw concentric spiral pattern (like the 3D prints)
        const maxR = Math.min(panelW, panelH) * 0.35
        const animPhase = isActive ? t * 2 : 0

        if (pi === 0) {
          // Inspiral: TWO interleaved spirals (two masses orbiting)
          for (let s = 0; s < 2; s++) {
            ctx.beginPath()
            for (let a = 0; a < Math.PI * 8; a += 0.05) {
              const sr = maxR * (1 - a / (Math.PI * 8)) * 0.9 + 3
              const offset = s * Math.PI + animPhase
              const sx = pcx + Math.cos(a + offset) * sr
              const sy = pcy + Math.sin(a + offset) * sr
              if (a === 0) ctx.moveTo(sx, sy)
              else ctx.lineTo(sx, sy)
            }
            const alpha = isActive ? 0.25 : 0.1
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
        } else if (pi === 1) {
          // Merger: single deep spiral (collision)
          ctx.beginPath()
          for (let a = 0; a < Math.PI * 6; a += 0.05) {
            const sr = maxR * (1 - a / (Math.PI * 6)) + 2
            const sx = pcx + Math.cos(a + animPhase * 1.5) * sr
            const sy = pcy + Math.sin(a + animPhase * 1.5) * sr
            if (a === 0) ctx.moveTo(sx, sy)
            else ctx.lineTo(sx, sy)
          }
          ctx.strokeStyle = `rgba(255,255,255,${isActive ? 0.3 : 0.1})`
          ctx.lineWidth = 2
          ctx.stroke()

          // Central bright point
          if (isActive) {
            const flash = Math.sin(t * 4) * 0.5 + 0.5
            ctx.beginPath()
            ctx.arc(pcx, pcy, 3 + flash * 2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255,255,255,${0.3 + flash * 0.3})`
            ctx.fill()
          }
        } else {
          // Ringdown: concentric circles (settling ripples)
          for (let ri = 1; ri <= 6; ri++) {
            const rr = maxR * (ri / 6)
            const alpha = isActive
              ? (0.15 - ri * 0.018) * (1 + Math.sin(t * 3 - ri * 0.5) * 0.3)
              : 0.04
            ctx.beginPath()
            ctx.arc(pcx, pcy, rr, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(255,255,255,${Math.max(0.02, alpha)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }

          // Central settled mass
          ctx.beginPath()
          ctx.arc(pcx, pcy, 4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${isActive ? 0.2 : 0.06})`
          ctx.fill()
        }

        // Label
        ctx.font = `${Math.max(9, panelW * 0.06)}px var(--mono, monospace)`
        ctx.textAlign = 'center'
        ctx.fillStyle = isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'
        ctx.fillText(p.label, pcx, panelY + panelH - 10)
      }

    }
    const activity = visibleAnimation(canvas.parentElement ?? canvas, draw)
    return () => activity.dispose()
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        width: '100%', aspectRatio: '2.5 / 1',
        maxHeight: 'min(24rem, 48vh)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.04)', background: '#08080f',
        contain: 'layout paint size',
      }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
        <button onClick={restart} style={{
          padding: '4px 14px', borderRadius: 'var(--radius-pill)',
          border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
          color: 'rgba(255,255,255,0.76)', fontFamily: 'var(--mono)', fontSize: '16px',
          letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer',
        }}>
          Restart
        </button>
      </div>
    </div>
  )
}
