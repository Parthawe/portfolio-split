import { visibleAnimation } from '../utils/visibleActivity'
import { useRef, useEffect, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════
   Generative Canvas — multiple visual modes.

   1. Flow Field — Perlin noise particle trails
   2. Constellation — nodes + edges forming and dissolving
   3. Waves — layered sine waves with interference
   4. Orbits — gravity simulator with mass attraction
   5. Grid — responsive dot grid that warps near cursor

   Canvas for Coders — NYU ITP Fall 2024.
   ═══════════════════════════════════════════════════════════ */

// Perlin noise
const PERM = new Uint8Array(512)
const GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]
;(() => {
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]] }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]
})()
function noise2d(x: number, y: number): number {
  const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255
  const xf = x - Math.floor(x), yf = y - Math.floor(y)
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const dot = (g: number[], fx: number, fy: number) => g[0] * fx + g[1] * fy
  const aa = PERM[PERM[xi] + yi], ab = PERM[PERM[xi] + yi + 1]
  const ba = PERM[PERM[xi + 1] + yi], bb = PERM[PERM[xi + 1] + yi + 1]
  return (dot(GRAD[aa&7],xf,yf)*(1-u)+dot(GRAD[ba&7],xf-1,yf)*u)*(1-v) +
         (dot(GRAD[ab&7],xf,yf-1)*(1-u)+dot(GRAD[bb&7],xf-1,yf-1)*u)*v
}

const MODES = [
  { name: 'Flow Field', icon: '〰️' },
  { name: 'Constellation', icon: '✦' },
  { name: 'Waves', icon: '≈' },
  { name: 'Orbits', icon: '◎' },
  { name: 'Grid', icon: '⊞' },
]

const PALETTES = [
  { name: 'Ocean', bg: '#080e14', colors: ['#0a7ec2','#1ba8d8','#4dd8e8','#88e8f0','#c8f4f8'], accent: '#1ba8d8' },
  { name: 'Aurora', bg: '#060810', colors: ['#22d3ee','#a78bfa','#f472b6','#34d399','#60a5fa'], accent: '#a78bfa' },
  { name: 'Ember', bg: '#100804', colors: ['#dc2626','#ea580c','#f59e0b','#fbbf24','#fde68a'], accent: '#f59e0b' },
  { name: 'Forest', bg: '#040a06', colors: ['#166534','#22c55e','#4ade80','#86efac','#d1fae5'], accent: '#22c55e' },
  { name: 'Mono', bg: '#000000', colors: ['#fff','#d4d4d8','#a1a1aa','#71717a','#52525b'], accent: '#a1a1aa' },
]

export default function GenerativeCanvas({ flowOnly = false }: { flowOnly?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)
  const activityRef = useRef<ReturnType<typeof visibleAnimation> | null>(null)
  const [generation, setGeneration] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [modeIdx, setModeIdx] = useState(0)
  const [palIdx, setPalIdx] = useState(0)
  const mouseRef = useRef({ x: -1, y: -1, active: false })
  const stateRef = useRef<Record<string, unknown>>({})

  const pal = PALETTES[palIdx]

  const resetState = useCallback(() => { setGeneration(value => value + 1) }, [])
  useEffect(() => {
    playingRef.current = playing
    activityRef.current?.wake()
  }, [playing])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let w = 0, h = 0, t = 0
    stateRef.current = {}
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.parentElement!.getBoundingClientRect()
      const nw = rect.width, nh = rect.height
      if (nw < 10 || nh < 10) { return }
      if (canvas.width !== Math.round(nw * dpr) || canvas.height !== Math.round(nh * dpr)) {
        canvas.width = Math.round(nw * dpr); canvas.height = Math.round(nh * dpr)
        canvas.style.width = `${nw}px`; canvas.style.height = `${nh}px`
        w = nw; h = nh; stateRef.current = {}
      }
      w = nw; h = nh
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      t += 0.016
      const m = mouseRef.current
      const colors = pal.colors

      // ── MODE 0: Flow Field ──
      if (modeIdx === 0) {
        type P = { x:number;y:number;vx:number;vy:number;c:string;life:number;ml:number }
        let ps = stateRef.current.ps as P[] | undefined
        if (!ps || ps.length === 0) {
          ps = Array.from({length:1800},()=>({x:Math.random()*w,y:Math.random()*h,vx:0,vy:0,c:colors[Math.floor(Math.random()*colors.length)],life:Math.random()*300,ml:250+Math.random()*250}))
          stateRef.current.ps = ps
        }
        ctx.fillStyle = pal.bg; ctx.globalAlpha = 0.025; ctx.fillRect(0,0,w,h); ctx.globalAlpha = 1
        for (const p of ps) {
          const a = noise2d(p.x*0.003+t*0.4,p.y*0.003+t*0.15)*Math.PI*4
          p.vx += Math.cos(a)*0.12; p.vy += Math.sin(a)*0.12
          if (m.active) { const dx=m.x-p.x,dy=m.y-p.y,d=Math.sqrt(dx*dx+dy*dy); if(d<250&&d>5){const f=3/(d*0.08+1);p.vx+=dx/d*f;p.vy+=dy/d*f} }
          p.vx*=0.96;p.vy*=0.96;const s=Math.sqrt(p.vx*p.vx+p.vy*p.vy);if(s>4){p.vx*=4/s;p.vy*=4/s}
          const ox=p.x,oy=p.y;p.x+=p.vx;p.y+=p.vy;p.life++
          if(p.x<0 || p.x>w || p.y<0 || p.y>h) { p.x=(p.x+w)%w; p.y=(p.y+h)%h; continue }
          if(p.life>p.ml){p.x=Math.random()*w;p.y=Math.random()*h;p.vx=0;p.vy=0;p.life=0;p.c=colors[Math.floor(Math.random()*colors.length)]}
          const al=Math.min(1,p.life/30)*Math.min(1,(p.ml-p.life)/40)
          ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(p.x,p.y);ctx.strokeStyle=p.c;ctx.globalAlpha=al*0.6;ctx.lineWidth=0.5+s*0.3;ctx.stroke()
        }
        ctx.globalAlpha=1
      }

      // ── MODE 1: Constellation ──
      else if (modeIdx === 1) {
        type N = { x:number;y:number;vx:number;vy:number;r:number;c:string }
        let ns = stateRef.current.ns as N[] | undefined
        if (!ns) {
          ns = Array.from({length:60},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,r:2+Math.random()*3,c:colors[Math.floor(Math.random()*colors.length)]}))
          stateRef.current.ns = ns
        }
        ctx.fillStyle = pal.bg; ctx.globalAlpha = 0.04; ctx.fillRect(0,0,w,h); ctx.globalAlpha = 1
        // Move nodes
        for (const n of ns) {
          if (m.active) { const dx=m.x-n.x,dy=m.y-n.y,d=Math.sqrt(dx*dx+dy*dy); if(d<200){n.vx+=(dx/d)*0.05;n.vy+=(dy/d)*0.05} }
          n.x+=n.vx;n.y+=n.vy;n.vx*=0.99;n.vy*=0.99
          if(n.x<0||n.x>w)n.vx*=-1;if(n.y<0||n.y>h)n.vy*=-1
          n.x=Math.max(0,Math.min(w,n.x));n.y=Math.max(0,Math.min(h,n.y))
        }
        // Draw edges
        for (let i=0;i<ns.length;i++) for (let j=i+1;j<ns.length;j++) {
          const dx=ns[i].x-ns[j].x,dy=ns[i].y-ns[j].y,d=Math.sqrt(dx*dx+dy*dy)
          if (d<150) {
            const al=(1-d/150)*0.3
            ctx.beginPath();ctx.moveTo(ns[i].x,ns[i].y);ctx.lineTo(ns[j].x,ns[j].y)
            ctx.strokeStyle=ns[i].c;ctx.globalAlpha=al;ctx.lineWidth=0.5;ctx.stroke()
          }
        }
        ctx.globalAlpha=1
        // Draw nodes
        for (const n of ns) {
          ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2)
          ctx.fillStyle=n.c;ctx.globalAlpha=0.8;ctx.fill()
          ctx.beginPath();ctx.arc(n.x,n.y,n.r*3,0,Math.PI*2)
          ctx.fillStyle=n.c;ctx.globalAlpha=0.04;ctx.fill()
        }
        ctx.globalAlpha=1
      }

      // ── MODE 2: Waves ──
      else if (modeIdx === 2) {
        ctx.fillStyle = pal.bg; ctx.fillRect(0,0,w,h)
        const layers = 8
        for (let l=0;l<layers;l++) {
          const yBase = h*0.2 + (h*0.6)*(l/(layers-1))
          const freq = 0.003 + l*0.001
          const amp = 20 + l*8
          const phase = t*0.8 + l*0.5
          const mouseInfl = m.active ? Math.sin((m.x||0)*0.01)*30*(1-l/layers) : 0

          ctx.beginPath()
          ctx.moveTo(0, h)
          for (let x=0;x<=w;x+=2) {
            const y = yBase + Math.sin(x*freq+phase)*amp + Math.sin(x*freq*2.5+phase*1.3)*amp*0.3 + mouseInfl*Math.sin(x*0.005+t)
            if(x===0)ctx.moveTo(x,y); else ctx.lineTo(x,y)
          }
          ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath()
          ctx.fillStyle=colors[l%colors.length];ctx.globalAlpha=0.08+l*0.02;ctx.fill()
          // Stroke the top edge
          ctx.beginPath()
          for(let x=0;x<=w;x+=2){const y=yBase+Math.sin(x*freq+phase)*amp+Math.sin(x*freq*2.5+phase*1.3)*amp*0.3+mouseInfl*Math.sin(x*0.005+t);if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}
          ctx.strokeStyle=colors[l%colors.length];ctx.globalAlpha=0.3+l*0.05;ctx.lineWidth=1;ctx.stroke()
        }
        ctx.globalAlpha=1
      }

      // ── MODE 3: Orbits ──
      else if (modeIdx === 3) {
        type O = {x:number;y:number;vx:number;vy:number;c:string;trail:{x:number;y:number}[]}
        let os = stateRef.current.os as O[] | undefined
        if (!os) {
          os = Array.from({length:30},()=>{
            const angle=Math.random()*Math.PI*2,dist=50+Math.random()*150
            const cx=w/2,cy=h/2
            return {x:cx+Math.cos(angle)*dist,y:cy+Math.sin(angle)*dist,vx:Math.cos(angle+Math.PI/2)*1.5,vy:Math.sin(angle+Math.PI/2)*1.5,c:colors[Math.floor(Math.random()*colors.length)],trail:[]}
          })
          stateRef.current.os=os
        }
        ctx.fillStyle=pal.bg;ctx.globalAlpha=0.015;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1
        const gx=m.active?m.x:w/2, gy=m.active?m.y:h/2
        for(const o of os){
          const dx=gx-o.x,dy=gy-o.y,d=Math.sqrt(dx*dx+dy*dy)+1
          const f=200/(d*d+100)
          o.vx+=dx/d*f;o.vy+=dy/d*f;o.vx*=0.998;o.vy*=0.998
          o.x+=o.vx;o.y+=o.vy
          o.trail.push({x:o.x,y:o.y});if(o.trail.length>80)o.trail.shift()
          // Draw trail
          if(o.trail.length>2){
            ctx.beginPath();ctx.moveTo(o.trail[0].x,o.trail[0].y)
            for(let i=1;i<o.trail.length;i++)ctx.lineTo(o.trail[i].x,o.trail[i].y)
            ctx.strokeStyle=o.c;ctx.globalAlpha=0.3;ctx.lineWidth=1.5;ctx.stroke()
          }
          // Head
          ctx.beginPath();ctx.arc(o.x,o.y,3,0,Math.PI*2);ctx.fillStyle=o.c;ctx.globalAlpha=0.9;ctx.fill()
          ctx.beginPath();ctx.arc(o.x,o.y,8,0,Math.PI*2);ctx.fillStyle=o.c;ctx.globalAlpha=0.06;ctx.fill()
        }
        // Central mass
        ctx.beginPath();ctx.arc(gx,gy,6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.globalAlpha=0.15;ctx.fill()
        ctx.globalAlpha=1
      }

      // ── MODE 4: Grid ──
      else if (modeIdx === 4) {
        ctx.fillStyle=pal.bg;ctx.fillRect(0,0,w,h)
        const spacing=Math.max(20,Math.min(35,w/25))
        const cols=Math.ceil(w/spacing)+1,rows=Math.ceil(h/spacing)+1
        for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
          let x=c*spacing,y=r*spacing
          // Warp near mouse
          if(m.active){
            const dx=m.x-x,dy=m.y-y,d=Math.sqrt(dx*dx+dy*dy)
            if(d<180){const push=1-d/180;x-=dx/d*push*25;y-=dy/d*push*25}
          }
          // Noise displacement
          const nx=noise2d(c*0.15+t*0.3,r*0.15+t*0.2)*6
          const ny=noise2d(c*0.15+100+t*0.2,r*0.15+100+t*0.3)*6
          x+=nx;y+=ny
          const ci=(r*cols+c)%colors.length
          const dist=m.active?Math.sqrt((m.x-x)**2+(m.y-y)**2):999
          const sz=dist<150?2+3*(1-dist/150):2
          ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2)
          ctx.fillStyle=colors[ci];ctx.globalAlpha=dist<150?0.6:0.15;ctx.fill()
        }
        // Connecting lines near cursor
        if(m.active){
          for(let r=0;r<rows-1;r++)for(let c=0;c<cols-1;c++){
            const x=c*spacing,y=r*spacing
            const d=Math.sqrt((m.x-x)**2+(m.y-y)**2)
            if(d<120){
              ctx.beginPath();ctx.moveTo(x+noise2d(c*0.15+t*0.3,r*0.15+t*0.2)*6,y+noise2d(c*0.15+100+t*0.2,r*0.15+100+t*0.3)*6)
              const x2=(c+1)*spacing+noise2d((c+1)*0.15+t*0.3,r*0.15+t*0.2)*6
              const y2=r*spacing+noise2d((c+1)*0.15+100+t*0.2,r*0.15+100+t*0.3)*6
              ctx.lineTo(x2,y2);ctx.strokeStyle=colors[c%colors.length];ctx.globalAlpha=0.08;ctx.lineWidth=0.5;ctx.stroke()
            }
          }
        }
        ctx.globalAlpha=1
      }

    }

    let lastWidth = 0, lastHeight = 0
    const activity = visibleAnimation(canvas.parentElement ?? canvas, () => {
      const bounds = canvas.parentElement!.getBoundingClientRect()
      const changed = bounds.width !== lastWidth || bounds.height !== lastHeight
      if (changed) {
        lastWidth = bounds.width; lastHeight = bounds.height
        for (let frame = 0; frame < 24; frame++) draw()
      } else if (playingRef.current) draw()
    }, () => playingRef.current)
    activityRef.current = activity
    return () => { activity.dispose(); activityRef.current = null }
  }, [modeIdx, palIdx, pal, generation])

  const handlePointer = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.parentElement?.getBoundingClientRect()
    if (!rect) return
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }
  }, [])

  return (
    <div className="project-generative-demo">
      <div className="project-demo-controls">
        <button type="button" onClick={() => setPlaying(value => !value)}>{playing ? 'Pause animation' : 'Play animation'}</button>
        <button type="button" onClick={resetState}>New pattern</button>
      </div>
      {!flowOnly && <div className="project-demo-controls" role="group" aria-label="Visual mode">
        {MODES.map((mode, index) => <button type="button" key={mode.name} aria-pressed={index === modeIdx} onClick={() => setModeIdx(index)}>{mode.name}</button>)}
      </div>}
      <div style={{ width: '100%', aspectRatio: '16 / 10', maxHeight: 'min(34rem, 68vh)', overflow: 'hidden', background: pal.bg, touchAction: 'pan-y', position: 'relative', contain: 'layout paint size' }}
        onPointerMove={handlePointer} onPointerDown={handlePointer} onPointerLeave={() => { mouseRef.current.active = false }}>
        <canvas ref={canvasRef} role="img" aria-label={`${pal.name} ${MODES[modeIdx].name.toLowerCase()} pattern`} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div className="project-demo-controls" role="group" aria-label="Color palette">
        {PALETTES.map((palette, index) => <button type="button" key={palette.name} aria-pressed={index === palIdx} onClick={() => setPalIdx(index)}>{palette.name}</button>)}
      </div>
      <p>{playing ? 'Playing; motion pauses when this canvas is offscreen.' : 'Paused. Play to watch particle trails develop.'} While playing, move a pointer across the canvas to bend the field.</p>
    </div>
  )
}
