import { useRef, useState, useEffect, useCallback } from 'react'
import { useBackToTop } from '../hooks/useBackToTop'
import FigmaSelect from './FigmaSelect'
import '../styles/hand-tracker.css'
// @ts-expect-error MediaPipe's export map does not resolve its declarations.
import type { HandLandmarker } from '@mediapipe/tasks-vision'

/* ── Landmark indices ── */
const THUMB_TIP = 4
const INDEX_TIP = 8
const INDEX_MCP = 5
const MIDDLE_TIP = 12
const MIDDLE_MCP = 9
const RING_TIP = 16
const RING_MCP = 13
const PINKY_TIP = 20
const PINKY_MCP = 17
const WRIST = 0

/* ── Gesture types ── */
type Gesture = 'none' | 'point' | 'pinch' | 'fist' | 'palm'

/* ── Tuning ── */
const SMOOTH = 0.45              // cursor lerp (higher = snappier)
const GRAB_THRESHOLD = 3         // curled fingers needed for "grab" (click)
const CLICK_MAX_MS = 700         // generous tap window
const CLICK_MAX_MOVE = 0.12      // very forgiving movement during tap
const SCROLL_SPEED = 18          // scroll multiplier for two-finger gesture
const DEAD_ZONE = 0.06           // minimal camera edge dead zone
const GESTURE_HOLD_FRAMES = 4    // frames a gesture must be held to switch

/* ── Helpers ── */
function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
// Tilt-safe curl detection: measures if fingertip is closer to wrist than knuckle is.
// Works regardless of hand orientation.
let _wristRef: { x: number; y: number } = { x: 0, y: 0 }
function setWristRef(wrist: { x: number; y: number }) { _wristRef = wrist }
function fingerCurled(tip: { x: number; y: number }, mcp: { x: number; y: number }) {
  const tipToWrist = dist(tip, _wristRef)
  const mcpToWrist = dist(mcp, _wristRef)
  // Finger is curled when tip is closer to wrist than the knuckle
  return tipToWrist < mcpToWrist * 0.85
}
function mapRange(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin)
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

// Returns hand tilt: 1 = tilted down, -1 = tilted up, 0 = neutral
// Uses middle finger tip vs wrist — reliable regardless of individual finger curl
function getHandTilt(lm: { x: number; y: number; z: number }[]): number {
  const fingersY = (lm[MIDDLE_TIP].y + lm[INDEX_TIP].y) / 2
  const wristY = lm[WRIST].y
  const diff = fingersY - wristY // positive = fingers below wrist = hand tilted down
  if (diff > 0.15) return 1    // tilted down → scroll down
  if (diff < -0.15) return -1  // tilted up → scroll up
  return 0                     // level — move cursor
}

function detectGestureRaw(lm: { x: number; y: number; z: number }[], wasGrabbing: boolean): Gesture {
  const indexCurled = fingerCurled(lm[INDEX_TIP], lm[INDEX_MCP])
  const middleCurled = fingerCurled(lm[MIDDLE_TIP], lm[MIDDLE_MCP])
  const ringCurled = fingerCurled(lm[RING_TIP], lm[RING_MCP])
  const pinkyCurled = fingerCurled(lm[PINKY_TIP], lm[PINKY_MCP])

  const curledCount = [indexCurled, middleCurled, ringCurled, pinkyCurled].filter(Boolean).length

  // Grab (click): close your hand — 3+ fingers curled
  if (wasGrabbing) {
    if (curledCount >= 2) return 'fist'
  } else {
    if (curledCount >= GRAB_THRESHOLD) return 'fist'
  }

  // Open hand — either cursor or scroll depending on tilt (handled in main loop)
  return 'palm'
}

/* ── Gesture tutorial ── */
const GESTURES = [
  {
    name: 'Open Hand',
    desc: 'Hold your hand up with fingers spread to move the cursor',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <path d="M12 24V16a1.5 1.5 0 0 1 3 0V13a1.5 1.5 0 0 1 3 0V12a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0v11a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Grab',
    desc: 'Close your hand into a fist to click. Quick grab = tap, hold = drag',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <path d="M14 22V18a2 2 0 0 1 4 0v-1a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.1" strokeLinecap="round" />
        <path d="M15 18l3-3 3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: 'Scroll',
    desc: 'Tilt your open hand down to scroll down, tilt up to scroll up',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <path d="M10 20h20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.3" />
        <path d="M12 14l8 6 8-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 7l-2 3h4l-2-3z" fill="currentColor" opacity="0.4" />
        <path d="M12 26l8-6 8 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 33l-2-3h4l-2 3z" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
]

export default function HandTracker() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const rafRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)

  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detected, setDetected] = useState(false)
  const [gesture, setGesture] = useState<Gesture>('none')
  const [tutorialStep, setTutorialStep] = useState(-1)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    try { return localStorage.getItem('ht-tutorial-seen') === '1' } catch { return false }
  })

  useEffect(() => {
    const dots = document.querySelectorAll('.cursor-dot, .cursor-ring')
    dots.forEach((el) => { ;(el as HTMLElement).style.display = active ? 'none' : '' })
    document.body.style.cursor = active && detected ? 'none' : ''
    return () => { document.body.style.cursor = '' }
  }, [active, detected])

  // State machine refs
  const pos = useRef({ x: 0.5, y: 0.5 })
  const gestureRef = useRef<Gesture>('none')
  const pinchStartTime = useRef(0)
  const pinchStartPos = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  // scroll via point direction — no tracking ref needed
  const lastHoveredRef = useRef<HTMLElement | null>(null)

  // Debounce: track how many consecutive frames a gesture is seen
  const pendingGesture = useRef<Gesture>('none')
  const pendingFrames = useRef(0)

  function debouncedGesture(raw: Gesture): Gesture {
    if (raw === pendingGesture.current) {
      pendingFrames.current++
    } else {
      pendingGesture.current = raw
      pendingFrames.current = 1
    }
    // Only switch after N consistent frames
    if (pendingFrames.current >= GESTURE_HOLD_FRAMES) {
      return raw
    }
    return gestureRef.current // keep previous
  }

  // ── Init MediaPipe ──
  const init = useCallback(async () => {
    if (handLandmarkerRef.current) return handLandmarkerRef.current
    // @ts-expect-error MediaPipe's export map does not resolve its declarations.
    const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.33/wasm'
    )
    let hl: HandLandmarker
    try {
      hl = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO', numHands: 1,
        minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.6, minTrackingConfidence: 0.5,
      })
    } catch {
      hl = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO', numHands: 1,
        minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.6, minTrackingConfidence: 0.5,
      })
    }
    handLandmarkerRef.current = hl
    return hl
  }, [])

  // ── Start ──
  const start = useCallback(async () => {
    setLoading(true)
    try {
      const hl = await init()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()

      if (!hasSeenTutorial) {
        setTutorialStep(0)
        setHasSeenTutorial(true)
        try { localStorage.setItem('ht-tutorial-seen', '1') } catch {}
      }

      const detect = () => {
        if (!video.videoWidth) { rafRef.current = requestAnimationFrame(detect); return }

        const result = hl.detectForVideo(video, performance.now())
        const hasHand = result.landmarks && result.landmarks.length > 0
        setDetected(hasHand)

        if (hasHand) {
          const lm = result.landmarks[0]
          const now = performance.now()

          // ── Cursor from index tip ──
          const rawX = 1 - lm[INDEX_TIP].x
          const rawY = lm[INDEX_TIP].y
          const mappedX = clamp(mapRange(rawX, DEAD_ZONE, 1 - DEAD_ZONE, 0, 1), 0, 1)
          const mappedY = clamp(mapRange(rawY, DEAD_ZONE, 1 - DEAD_ZONE, 0, 1), 0, 1)

          pos.current.x += (mappedX - pos.current.x) * SMOOTH
          pos.current.y += (mappedY - pos.current.y) * SMOOTH

          const cx = pos.current.x * window.innerWidth
          const cy = pos.current.y * window.innerHeight

          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${cx}px, ${cy}px)`
          }

          // Hover (only on element change)
          const hoveredEl = document.elementFromPoint(cx, cy)
          if (hoveredEl && hoveredEl !== lastHoveredRef.current) {
            if (lastHoveredRef.current) {
              lastHoveredRef.current.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: cx, clientY: cy }))
            }
            hoveredEl.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: cx, clientY: cy }))
            lastHoveredRef.current = hoveredEl as HTMLElement
          }

          // ── Gesture with debounce ──
          setWristRef(lm[WRIST])
          const rawG = detectGestureRaw(lm, gestureRef.current === 'fist')
          const g = debouncedGesture(rawG)
          const prev = gestureRef.current

          if (g !== prev) setGesture(g)
          gestureRef.current = g

          // ── GRAB (fist): click — close hand to click, open to release ──
          if (g === 'fist') {
            if (prev !== 'fist') {
              // Grab just started
              pinchStartTime.current = now
              pinchStartPos.current = { x: pos.current.x, y: pos.current.y }
              isDragging.current = false
              if (cursorRef.current) cursorRef.current.classList.add('hand-cursor--drag')
            }
          } else if (prev === 'fist') {
            // Hand opened — release
            const duration = now - pinchStartTime.current
            const moveD = dist(pos.current, pinchStartPos.current)

            if (cursorRef.current) cursorRef.current.classList.remove('hand-cursor--drag')
            isDragging.current = false

            if (duration < CLICK_MAX_MS && moveD < CLICK_MAX_MOVE) {
              // Quick grab-release = tap/click
              const el = document.elementFromPoint(cx, cy)
              if (el instanceof HTMLElement) {
                el.click()
              }
              if (cursorRef.current) {
                cursorRef.current.classList.add('hand-cursor--click')
                setTimeout(() => cursorRef.current?.classList.remove('hand-cursor--click'), 350)
              }
            }
          }

          // ── PALM: tilt hand to scroll, level hand to move cursor ──
          if (g === 'palm') {
            const tilt = getHandTilt(lm)
            if (tilt !== 0) {
              // Hand tilted — scroll
              const fingersY = (lm[MIDDLE_TIP].y + lm[INDEX_TIP].y) / 2
              const tiltAmount = Math.abs(fingersY - lm[WRIST].y)
              const scrollAmt = tilt * tiltAmount * SCROLL_SPEED * 6
              const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
              const nextScroll = Math.min(maxScroll, Math.max(0, window.scrollY + scrollAmt))
              const lenis = (window as unknown as Record<string, { scrollTo: (t: number, o?: Record<string, unknown>) => void }>).__lenis
              if (lenis) {
                lenis.scrollTo(nextScroll, { immediate: true })
              } else {
                window.scrollTo({ top: nextScroll })
              }
            }
            // When level (tilt === 0), cursor movement already handled above
          }

          drawLandmarks(lm, g)
        } else {
          if (gestureRef.current !== 'none') { setGesture('none'); gestureRef.current = 'none' }
        }

        rafRef.current = requestAnimationFrame(detect)
      }

      rafRef.current = requestAnimationFrame(detect)
      setLoading(false)
      setActive(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Permission') || msg.includes('NotAllowed')) setError('Camera permission denied')
      else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) setError('No camera found')
      else setError('Could not start hand tracking')
      setLoading(false)
      setTimeout(() => setError(null), 4000)
    }
  }, [init, hasSeenTutorial])

  // ── Draw skeleton ──
  const drawLandmarks = (lm: { x: number; y: number; z: number }[], g: Gesture) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]]
    const accentColor = g === 'pinch' ? '#ffd43b' : g === 'fist' ? '#74c0fc' : g === 'palm' ? '#b2f2bb' : '#ff6b6b'

    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1
    for (const [a, b] of connections) {
      ctx.beginPath()
      ctx.moveTo((1 - lm[a].x) * w, lm[a].y * h)
      ctx.lineTo((1 - lm[b].x) * w, lm[b].y * h)
      ctx.stroke()
    }
    for (let i = 0; i < lm.length; i++) {
      const x = (1 - lm[i].x) * w, y = lm[i].y * h
      const isKey = i === INDEX_TIP || i === THUMB_TIP
      ctx.beginPath()
      ctx.arc(x, y, isKey ? 4 : 1.5, 0, Math.PI * 2)
      ctx.fillStyle = isKey ? accentColor : 'rgba(255,255,255,0.5)'
      ctx.fill()
    }
    if (g !== 'none') {
      ctx.font = '600 9px system-ui'
      ctx.fillStyle = accentColor
      ctx.textAlign = 'right'
      ctx.fillText(g.toUpperCase(), w - 6, 12)
    }
  }

  // ── Stop ──
  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    try { streamRef.current?.getTracks().forEach(t => t.stop()) } catch { /* stream already ended */ }
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false); setDetected(false); setGesture('none')
    isDragging.current = false; lastHoveredRef.current = null
  }, [])

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); try { streamRef.current?.getTracks().forEach(t => t.stop()) } catch { /* */ } }, [])

  // Bridge for the Figma panel: it hosts its own "use your hands" button while the chip is hidden.
  useEffect(() => {
    const onToggle = () => { if (active) stop(); else void start() }
    window.addEventListener('hand-tracker:toggle', onToggle)
    return () => window.removeEventListener('hand-tracker:toggle', onToggle)
  }, [active, start, stop])
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('hand-tracker:state', { detail: { active } }))
  }, [active])

  // Desktop only
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)')
    setIsDesktop(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const { visible: showBackToTop, scrollToTop } = useBackToTop()

  if (!isDesktop) return null

  const cursorIcon = (() => {
    switch (gesture) {
      case 'pinch': return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" /><path d="M8 18v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      case 'fist': return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="7" y="7" width="10" height="12" rx="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" /><path d="M12 10v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 3l-2 2h4l-2-2z" fill="currentColor" opacity="0.5" /><path d="M12 21l-2-2h4l-2 2z" fill="currentColor" opacity="0.5" /></svg>
      default: return <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M10 19V8a2 2 0 1 1 4 0v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="6" r="1" fill="currentColor" opacity="0.5" /></svg>
    }
  })()

  return (
    <>
      {active && (
        <div ref={cursorRef} className={`hand-cursor ${detected ? 'hand-cursor--visible' : ''} hand-cursor--${gesture}`} aria-hidden="true">
          {cursorIcon}
          <span className="hand-cursor-ring" />
        </div>
      )}
      <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
      {active && (
        <div className="ht-preview-float">
          {tutorialStep >= 0 && tutorialStep < GESTURES.length && (
            <div className="ht-step-card">
              <div className="ht-step-top">
                <span className="ht-step-label">Step {tutorialStep + 1}/{GESTURES.length}</span>
                <button className="ht-step-close" onClick={() => setTutorialStep(-1)} aria-label="Close guide">
                  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="ht-step-icon">{GESTURES[tutorialStep].icon}</div>
              <div className="ht-step-name">{GESTURES[tutorialStep].name}</div>
              <div className="ht-step-desc">{GESTURES[tutorialStep].desc}</div>
              <div className="ht-step-nav">
                {tutorialStep > 0 && <button className="ht-step-btn" onClick={() => setTutorialStep(s => s - 1)}>Back</button>}
                <button className="ht-step-btn ht-step-btn--primary" onClick={() => tutorialStep < GESTURES.length - 1 ? setTutorialStep(s => s + 1) : setTutorialStep(-1)}>
                  {tutorialStep < GESTURES.length - 1 ? 'Next' : 'Got it'}
                </button>
              </div>
            </div>
          )}
          <div className="hand-tracker-preview">
            <video ref={(el) => { if (el && streamRef.current) { el.srcObject = streamRef.current; el.play().catch(() => {}) } }} playsInline muted className="hand-tracker-video" />
            <canvas ref={canvasRef} width={160} height={120} className="hand-tracker-canvas" aria-hidden="true" />
            <div className={`hand-tracker-status ${detected ? 'hand-tracker-status--detected' : ''}`}>
              <span className="hand-tracker-dot" />
              {detected ? gesture === 'none' ? 'Tracking' : gesture : 'Show hand'}
            </div>
            {tutorialStep < 0 && (
              <button className="hand-tracker-help" onClick={() => setTutorialStep(0)} aria-label="Show gesture guide" title="Gesture guide">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6.5 12.5V9a1.5 1.5 0 0 1 3 0v-2a1.5 1.5 0 0 1 3 0V6a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0v6.5a5.5 5.5 0 0 1-5.5 5.5h-1A5.5 5.5 0 0 1 6.5 13.5v-1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}
          </div>
        </div>
      )}
      <div className="bt-toolbar">
        <button className={`bt-toolbar-btn bt-toolbar-btn--top ${showBackToTop ? 'bt-toolbar-btn--visible' : ''}`} onClick={scrollToTop} aria-label="Back to top" title="Back to top">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14V4M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className={`bt-toolbar-divider ${showBackToTop ? 'bt-toolbar-divider--visible' : ''}`} />
        <button className={`bt-toolbar-btn bt-toolbar-btn--hand figma-hover ${active ? 'bt-toolbar-btn--active' : ''} ${loading ? 'bt-toolbar-btn--loading' : ''}`} onClick={active ? stop : start} disabled={loading} aria-label={active ? 'Disable hand tracking' : 'Enable hand tracking'} title={active ? 'Stop hand tracking' : 'Control with your hand'}>
          {loading ? (
            <svg className="hand-tracker-spinner" width="16" height="16" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="40 20" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6.5 12.5V9a1.5 1.5 0 0 1 3 0v-2a1.5 1.5 0 0 1 3 0V6a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0v6.5a5.5 5.5 0 0 1-5.5 5.5h-1A5.5 5.5 0 0 1 6.5 13.5v-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          )}
          <span className="bt-toolbar-label">{active ? 'Stop' : 'Use your hands'}</span>
          <FigmaSelect />
        </button>
        {error && <span className="bt-toolbar-error">{error}</span>}
      </div>
    </>
  )
}
