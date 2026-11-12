import { visibleAnimation } from '../utils/visibleActivity'
import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useInView } from '../hooks/useInView'
import { usePrefersReduced } from '../hooks/usePrefersReduced'

const DrawingPad = lazy(() => import('./DrawingPad'))

/* ═══════════════════════════════════════════════════════════
   Enigma Interactive — neural network visualization.

   Classic NN diagram: pixelated input on left, columns of
   3D-shaded nodes, colored wires (cyan=positive, red=negative),
   output labels on right. Matches the canonical deep learning
   visualization style.
   ═══════════════════════════════════════════════════════════ */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Network: input(28) → hidden1(12) → hidden2(8) → output(26)
const LAYER_SIZES = [28, 12, 8, 26]
const LAYER_X = [0.22, 0.44, 0.62, 0.82] // x positions (left 0-0.18 is for pixel grid)

const CASCADE_DELAY = 1200   // 1.2s between each layer lighting up
const INTERP_SPEED = 0.03    // very slow fade in/out
const AUTO_MS = 7000         // 7s per letter in auto mode

function rng(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
}

// Build node positions — vertical columns
function buildNodes() {
  const nodes: { x: number; y: number; layer: number; idx: number }[] = []
  LAYER_SIZES.forEach((count, li) => {
    const margin = 0.06
    for (let i = 0; i < count; i++) {
      const y = margin + (1 - 2 * margin) * (i / Math.max(count - 1, 1))
      nodes.push({ x: LAYER_X[li], y, layer: li, idx: i })
    }
  })
  return nodes
}

// Build weighted connections with sign (for color)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildConnections(_nodes: ReturnType<typeof buildNodes>) {
  const conns: { from: number; to: number; weight: number }[] = []
  const rand = rng(42)
  let nodeOffset = 0
  for (let li = 0; li < LAYER_SIZES.length - 1; li++) {
    const srcCount = LAYER_SIZES[li]
    const tgtCount = LAYER_SIZES[li + 1]
    const nextOffset = nodeOffset + srcCount
    for (let s = 0; s < srcCount; s++) {
      // Connect to 2-4 random targets (sparse for visual clarity)
      const count = li === 0 ? 1 + Math.floor(rand() * 2) : 2 + Math.floor(rand() * 3)
      const picked = new Set<number>()
      for (let c = 0; c < count; c++) {
        const ti = Math.floor(rand() * tgtCount)
        if (!picked.has(ti)) {
          picked.add(ti)
          const w = (rand() - 0.5) * 2 // -1 to 1
          conns.push({ from: nodeOffset + s, to: nextOffset + ti, weight: w })
        }
      }
    }
    nodeOffset = nextOffset
  }
  return conns
}

// Pixel grid for each letter (14×14 with grayscale, rendered from canvas text)
const PIXEL_SIZE = 14
let _pixelCache: Record<string, number[]> | null = null

function buildPixelPatterns() {
  if (_pixelCache) return _pixelCache
  if (typeof document === 'undefined') return {}
  const canvas = document.createElement('canvas')
  canvas.width = PIXEL_SIZE
  canvas.height = PIXEL_SIZE
  const ctx = canvas.getContext('2d')!
  const patterns: Record<string, number[]> = {}

  for (let l = 0; l < 26; l++) {
    ctx.clearRect(0, 0, PIXEL_SIZE, PIXEL_SIZE)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(LETTERS[l], PIXEL_SIZE / 2, PIXEL_SIZE / 2 + 1)

    const data = ctx.getImageData(0, 0, PIXEL_SIZE, PIXEL_SIZE).data
    const grid: number[] = []
    for (let i = 0; i < PIXEL_SIZE * PIXEL_SIZE; i++) {
      grid.push(data[i * 4 + 3] / 255) // use alpha as grayscale
    }
    patterns[LETTERS[l]] = grid
  }
  _pixelCache = patterns
  return patterns
}

// Activation patterns
function buildActivations(nodes: ReturnType<typeof buildNodes>) {
  const patterns: Record<string, number[]> = {}
  for (let l = 0; l < 26; l++) {
    const rand = rng(l * 1000 + 7)
    patterns[LETTERS[l]] = nodes.map(n => {
      if (n.layer === 0) {
        return rand() > 0.4 ? 0.7 + rand() * 0.3 : 0.05
      }
      if (n.layer === 1 || n.layer === 2) {
        const v = Math.sin((n.idx * 7 + l * 13) * 0.4) + rand() * 0.6
        return v > 0.4 ? 0.6 + rand() * 0.4 : 0.05
      }
      // Output
      const dist = Math.min(Math.abs(n.idx - l), 26 - Math.abs(n.idx - l))
      if (dist === 0) return 1.0
      if (dist <= 2) return 0.15
      return 0.03
    })
  }
  return patterns
}

// Draw a 3D-shaded sphere
function drawSphere(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, brightness: number) {
  if (brightness < 0.08) {
    // Dark node — matte dark sphere
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r)
    g.addColorStop(0, 'rgba(60, 58, 65, 0.6)')
    g.addColorStop(0.7, 'rgba(30, 28, 35, 0.5)')
    g.addColorStop(1, 'rgba(15, 13, 20, 0.3)')
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
    return
  }

  // Bright node — glossy 3D sphere with highlight
  ctx.save()
  if (brightness > 0.3) {
    ctx.shadowBlur = brightness * 15 + 4
    ctx.shadowColor = `rgba(255, 250, 240, ${brightness * 0.4})`
  }

  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r)
  g.addColorStop(0, `rgba(255, 252, 245, ${brightness})`)
  g.addColorStop(0.3, `rgba(220, 218, 210, ${brightness * 0.9})`)
  g.addColorStop(0.7, `rgba(150, 148, 140, ${brightness * 0.6})`)
  g.addColorStop(1, `rgba(80, 78, 75, ${brightness * 0.3})`)

  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()

  // Specular highlight
  if (brightness > 0.4) {
    const hg = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, 0, x - r * 0.25, y - r * 0.3, r * 0.4)
    hg.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.5})`)
    hg.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.beginPath()
    ctx.arc(x - r * 0.25, y - r * 0.3, r * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = hg
    ctx.fill()
  }

  ctx.restore()
}

export default function EnigmaInteractive() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [containerRef, inView] = useInView(0.05)
  const reduced = usePrefersReduced()
  const [activeLetter, setActiveLetter] = useState('')
  const [isAuto, setIsAuto] = useState(true)
  const autoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const cascadeTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const currentAct = useRef<Float32Array | null>(null)
  const targetAct = useRef<Float32Array | null>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const cascadeLayer = useRef(-1) // which layer is currently firing (-1 = none)

  const nodes = useMemo(() => buildNodes(), [])
  const connections = useMemo(() => buildConnections(nodes), [nodes])
  const patterns = useMemo(() => buildActivations(nodes), [nodes])
  const pixelPatterns = useMemo(() => buildPixelPatterns(), [])
  const [currentPixels, setCurrentPixels] = useState<number[]>([])

  useEffect(() => {
    currentAct.current = new Float32Array(nodes.length).fill(0.03)
    targetAct.current = new Float32Array(nodes.length).fill(0.03)
  }, [nodes])

  const triggerLetter = useCallback((letter: string) => {
    const pat = patterns[letter]
    if (!pat || !targetAct.current) return
    setActiveLetter(letter)
    setCurrentPixels(pixelPatterns[letter] || [])

    for (const t of cascadeTimers.current) clearTimeout(t)
    cascadeTimers.current = []

    cascadeLayer.current = -1
    if (reduced) {
      for (let i = 0; i < pat.length; i++) targetAct.current[i] = pat[i]
      cascadeLayer.current = 3
    } else {
      let offset = 0
      for (let li = 0; li < LAYER_SIZES.length; li++) {
        const start = offset
        const end = offset + LAYER_SIZES[li]
        const timer = setTimeout(() => {
          if (!targetAct.current) return
          cascadeLayer.current = li // mark this layer as currently firing
          for (let i = start; i < end; i++) targetAct.current[i] = pat[i]
        }, li * CASCADE_DELAY)
        cascadeTimers.current.push(timer)
        offset = end
      }
    }
  }, [patterns, pixelPatterns, reduced])

  // Auto-demo
  useEffect(() => {
    if (!isAuto || !inView) return
    let idx = 0
    const cycle = () => {
      triggerLetter(LETTERS[idx % 26])
      idx++
      autoTimer.current = setTimeout(cycle, AUTO_MS)
    }
    autoTimer.current = setTimeout(cycle, 600)
    return () => clearTimeout(autoTimer.current)
  }, [isAuto, inView, triggerLetter])

  // Keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ch = e.key.toUpperCase()
      if (ch >= 'A' && ch <= 'Z' && ch.length === 1) {
        setIsAuto(false)
        clearTimeout(autoTimer.current)
        triggerLetter(ch)
        clearTimeout(idleTimer.current)
        idleTimer.current = setTimeout(() => setIsAuto(true), 6000)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(idleTimer.current)
      for (const t of cascadeTimers.current) clearTimeout(t)
    }
  }, [triggerLetter])

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !inView) return
    const ctx = canvas.getContext('2d')!

    const draw = () => {
      const parent = canvas.parentElement
      if (!parent) { return }
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = rect.width, h = rect.height
      if (w < 10 || h < 10) { return }
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr
        canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)

      if (!currentAct.current || !targetAct.current) {
          return
      }

      const cur = currentAct.current
      const tgt = targetAct.current
      const speed = reduced ? 1 : INTERP_SPEED
      for (let i = 0; i < cur.length; i++) {
        cur[i] += (tgt[i] - cur[i]) * speed
      }

      // ── Pixel grid on the left (input image) ──
      if (currentPixels.length === PIXEL_SIZE * PIXEL_SIZE) {
        const gridSize = Math.min(w * 0.16, h * 0.6)
        const cellSize = gridSize / PIXEL_SIZE
        const gx = w * 0.02
        const gy = (h - gridSize) / 2

        // Dark background for pixel area
        ctx.fillStyle = 'rgba(255,255,255,0.015)'
        ctx.fillRect(gx - 2, gy - 2, gridSize + 4, gridSize + 4)

        for (let r = 0; r < PIXEL_SIZE; r++) {
          for (let c = 0; c < PIXEL_SIZE; c++) {
            const v = currentPixels[r * PIXEL_SIZE + c]
            if (v > 0.05) {
              ctx.fillStyle = `rgba(255, 250, 240, ${v * 0.9})`
              ctx.fillRect(gx + c * cellSize, gy + r * cellSize, cellSize - 0.5, cellSize - 0.5)
            }
          }
        }

        // Subtle outer grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 0.3
        for (let i = 0; i <= PIXEL_SIZE; i++) {
          ctx.beginPath()
          ctx.moveTo(gx + i * cellSize, gy)
          ctx.lineTo(gx + i * cellSize, gy + gridSize)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(gx, gy + i * cellSize)
          ctx.lineTo(gx + gridSize, gy + i * cellSize)
          ctx.stroke()
        }
      }

      // Node radii per layer
      const r0 = Math.max(2, Math.min(5, h / (LAYER_SIZES[0] * 3.5)))
      const r1 = Math.max(5, Math.min(12, h / (LAYER_SIZES[1] * 4)))
      const r2 = Math.max(6, Math.min(14, h / (LAYER_SIZES[2] * 5)))
      const r3 = Math.max(2.5, Math.min(6, h / (LAYER_SIZES[3] * 3.5)))
      const radii = [r0, r1, r2, r3]

      // ── Draw connections (colored wires) ──
      // Wires light up when signal flows: source layer active → wire glows
      const activeLayer = cascadeLayer.current
      for (const conn of connections) {
        const from = nodes[conn.from]
        const to = nodes[conn.to]
        const fromAct = cur[conn.from]
        const toAct = cur[conn.to]

        // Wire is "live" when its source layer just fired
        const isLive = from.layer <= activeLayer && to.layer <= activeLayer + 1
        const strength = isLive ? Math.max(fromAct, toAct) : Math.max(fromAct, toAct) * 0.3

        // Always draw wires faintly (the physical rods are always visible)
        const baseAlpha = 0.015
        const liveAlpha = strength * 0.35
        const alpha = baseAlpha + liveAlpha
        const lineW = isLive ? (0.5 + strength * 2) : 0.3

        ctx.save()

        // Glow on live wires
        if (isLive && strength > 0.2) {
          ctx.shadowBlur = strength * 8
          if (conn.weight > 0) {
            ctx.shadowColor = `rgba(0, 200, 255, ${strength * 0.3})`
          } else {
            ctx.shadowColor = `rgba(220, 60, 30, ${strength * 0.3})`
          }
        }

        if (conn.weight > 0) {
          ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`
        } else {
          ctx.strokeStyle = `rgba(220, 60, 30, ${alpha})`
        }
        ctx.lineWidth = lineW
        ctx.beginPath()
        ctx.moveTo(from.x * w, from.y * h)
        ctx.lineTo(to.x * w, to.y * h)
        ctx.stroke()

        ctx.restore()
      }

      // ── Draw nodes (3D spheres) ──
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const a = cur[i]
        const r = radii[n.layer]
        drawSphere(ctx, n.x * w, n.y * h, r, a)
      }

      // ── Output labels ──
      const outputStart = LAYER_SIZES[0] + LAYER_SIZES[1] + LAYER_SIZES[2]
      const labelFs = Math.max(7, Math.min(10, h / (LAYER_SIZES[3] * 3)))
      ctx.font = `${labelFs}px monospace`
      ctx.textAlign = 'left'
      for (let i = 0; i < LAYER_SIZES[3]; i++) {
        const n = nodes[outputStart + i]
        const a = cur[outputStart + i]
        ctx.fillStyle = a > 0.5
          ? `rgba(255, 255, 255, ${0.5 + a * 0.5})`
          : 'rgba(255, 255, 255, 0.1)'
        ctx.fillText(LETTERS[i], n.x * w + radii[3] + 5, n.y * h + labelFs * 0.35)
      }

      // ── Layer labels at bottom ──
      ctx.font = `${Math.max(6, w * 0.009)}px monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillText('INPUT', LAYER_X[0] * w, h - 4)
      ctx.fillText('HIDDEN', LAYER_X[1] * w, h - 4)
      ctx.fillText('HIDDEN', LAYER_X[2] * w, h - 4)
      ctx.fillText('OUTPUT', LAYER_X[3] * w, h - 4)

    }

    const activity = visibleAnimation(canvas.parentElement ?? canvas, draw)
    return () => activity.dispose()
  }, [inView, nodes, connections, reduced, currentPixels])

  const handleMobileInput = useCallback(() => { hiddenInputRef.current?.focus() }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    if (val.length > 0) {
      const ch = val[val.length - 1]
      if (ch >= 'A' && ch <= 'Z') {
        setIsAuto(false)
        clearTimeout(autoTimer.current)
        triggerLetter(ch)
        clearTimeout(idleTimer.current)
        idleTimer.current = setTimeout(() => setIsAuto(true), 6000)
      }
    }
    e.target.value = ''
  }, [triggerLetter])

  // When user starts drawing, stop auto permanently (don't resume after idle)
  const handleDrawRecognize = useCallback((letter: string, conf: number) => {
    if (conf > 0.2) {
      setIsAuto(false)
      clearTimeout(autoTimer.current)
      clearTimeout(idleTimer.current) // don't resume auto
      triggerLetter(letter)
    }
  }, [triggerLetter])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Sculpture: network above, tablet below */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Neural network */}
        <div style={{
          width: '100%',
          aspectRatio: '16 / 10',
          maxHeight: '480px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid rgba(100, 100, 180, 0.06)',
          background: '#000',
          position: 'relative',
        }}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Neural network visualization"
            style={{ display: 'block', width: '100%', height: '100%' }}
          />

          {isAuto && (
            <div style={{
              position: 'absolute', top: 8, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '16px',
                letterSpacing: '0.04em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.78)',
                padding: '6px 10px', borderRadius: 'var(--radius-pill)',
                background: 'rgba(0,0,0,0.56)',
              }}>
                Auto &middot; Press a key or draw below
              </span>
            </div>
          )}
        </div>

        {/* Input tablet + controls */}
        <div style={{
          width: '100%',
          background: '#0a0a0f',
          border: '1px solid rgba(100, 100, 180, 0.08)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(16px, 3vw, 24px)',
        }}>
          {/* Instruction text */}
          <p style={{
            fontFamily: 'var(--mono)', fontSize: '16px', lineHeight: 1.6,
            color: 'rgba(255,255,255,0.76)', textAlign: 'center',
            margin: '0 0 12px', maxWidth: '50ch', marginLeft: 'auto', marginRight: 'auto',
          }}>
            Draw a letter on the pad below, or press any key A–Z on your keyboard.
            Review the handwriting match below. Selecting a letter lights up its activation through the layers.
          </p>

          {/* Drawing pad + recognized letter */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'clamp(16px, 4vw, 32px)', flexWrap: 'wrap',
          }}>
            <Suspense fallback={null}>
              <DrawingPad onRecognize={handleDrawRecognize} size={180} />
            </Suspense>

            {/* Result + controls */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              minWidth: 80,
            }}>
              {/* Big letter */}
              <div style={{
                fontFamily: 'var(--serif)',
                fontSize: activeLetter ? 'clamp(3rem, 7vw, 5rem)' : '1.5rem',
                fontWeight: 300, color: '#fff',
                opacity: activeLetter ? 0.9 : 0.06,
                lineHeight: 1,
                textShadow: activeLetter ? '0 0 20px rgba(255,255,255,0.12)' : 'none',
                transition: 'opacity 0.3s',
              }}>
                {activeLetter || '?'}
              </div>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '16px',
                letterSpacing: '0.04em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.68)',
              }}>
                {activeLetter ? 'Predicted' : 'Waiting'}
              </span>

              {/* Auto-play toggle */}
              <button
                onClick={() => {
                  if (isAuto) {
                    setIsAuto(false)
                    clearTimeout(autoTimer.current)
                  } else {
                    setIsAuto(true)
                  }
                }}
                style={{
                  marginTop: 4,
                  padding: '5px 14px', borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${isAuto ? 'rgba(0,200,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  background: isAuto ? 'rgba(0,200,255,0.06)' : 'rgba(255,255,255,0.02)',
                  color: isAuto ? 'rgba(97,218,255,0.96)' : 'rgba(255,255,255,0.72)',
                  fontFamily: 'var(--mono)', fontSize: '16px',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.2s',
                }}
              >
                {isAuto ? (
                  <>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(0,200,255,0.5)', animation: 'enigma-pulse 1.5s infinite' }} />
                    Auto-playing
                  </>
                ) : (
                  <>
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 14,8 3,15" /></svg>
                    Auto-play
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile tap-to-type */}
          <button
            onClick={handleMobileInput}
            className="enigma-mobile-btn"
            style={{
              padding: '6px 12px', borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'var(--mono)', fontSize: '16px',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              cursor: 'pointer', display: 'none', margin: '10px auto 0',
            }}
          >
            Tap to type on mobile
          </button>
        </div>
      </div>

      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        onChange={handleInputChange}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        aria-label="Type a letter"
      />

      <style>{`
        @media (max-width: 640px) {
          .enigma-mobile-btn { display: flex !important; }
        }
        @keyframes enigma-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
