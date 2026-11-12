type NavigatorWithPerformanceHints = Navigator & {
  deviceMemory?: number
  connection?: {
    saveData?: boolean
  }
}

export const PERFORMANCE_MODE_EVENT = 'portfolio:performance-mode'
const PERFORMANCE_MODE_SESSION_KEY = 'portfolio-performance-mode'

type PerformanceModeReason = 'device' | 'runtime' | 'forced'

type PerformanceModeDetail = {
  degraded: true
  reason: PerformanceModeReason
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isLowPowerDevice() {
  if (typeof window === 'undefined') return false

  const nav = navigator as NavigatorWithPerformanceHints
  const memory = nav.deviceMemory
  const cores = nav.hardwareConcurrency
  const coarseInput = window.matchMedia('(hover: none), (pointer: coarse)').matches
  const phoneViewport = window.matchMedia('(max-width: 768px)').matches
  const touchOrTablet = phoneViewport || (coarseInput && window.innerWidth <= 1180)
  const severelyLimitedMemory = typeof memory === 'number' && memory <= 2
  const severelyLimitedCpu = typeof cores === 'number' && cores <= 2
  const constrainedLaptop =
    typeof memory === 'number' && memory <= 4 &&
    typeof cores === 'number' && cores <= 4

  return Boolean(
    prefersReducedMotion() ||
    nav.connection?.saveData ||
    touchOrTablet ||
    severelyLimitedMemory ||
    severelyLimitedCpu ||
    constrainedLaptop,
  )
}

export function isPerformanceDegraded() {
  return typeof document !== 'undefined' &&
    document.documentElement.classList.contains('is-low-power-device')
}

function activatePerformanceMode(reason: PerformanceModeReason) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const wasDegraded = root.classList.contains('is-low-power-device')
  root.classList.add('is-low-power-device')
  root.classList.toggle(
    'is-runtime-performance-degraded',
    reason === 'runtime' || reason === 'forced',
  )
  root.dataset.performanceMode = 'reduced'

  try {
    window.sessionStorage.setItem(PERFORMANCE_MODE_SESSION_KEY, reason)
  } catch {
    // Session storage can be unavailable in private contexts.
  }

  if (!wasDegraded) {
    window.dispatchEvent(new CustomEvent<PerformanceModeDetail>(PERFORMANCE_MODE_EVENT, {
      detail: { degraded: true, reason },
    }))
  }
}

export function applyPerformanceModeClass() {
  if (typeof document === 'undefined') return

  let savedReason: PerformanceModeReason | null = null
  try {
    const saved = window.sessionStorage.getItem(PERFORMANCE_MODE_SESSION_KEY)
    if (saved === 'device' || saved === 'runtime' || saved === 'forced') {
      savedReason = saved
    }
  } catch {
    // Session storage can be unavailable in private contexts.
  }

  const clearPerformanceMode = () => {
    document.documentElement.classList.remove('is-low-power-device', 'is-runtime-performance-degraded')
    document.documentElement.dataset.performanceMode = 'full'
    try {
      window.sessionStorage.removeItem(PERFORMANCE_MODE_SESSION_KEY)
    } catch {
      // Session storage can be unavailable in private contexts.
    }
  }

  const forced = new URLSearchParams(window.location.search).get('perf') === 'emergency'
  const deviceIsLowPower = isLowPowerDevice()
  if (forced || savedReason === 'forced') activatePerformanceMode('forced')
  else if (deviceIsLowPower) activatePerformanceMode('device')
  // Runtime degradation is intentionally temporary. A reload starts a fresh
  // measurement window so a single slow moment cannot disable 3D indefinitely.
  else clearPerformanceMode()
}

let sceneStartupUntil = 0
let sceneStartupEndedAt = 0

/** Exclude bounded, one-time asset decoding and shader compilation from
 * sustained runtime pressure. The existing device and emergency guards apply. */
export function beginSceneStartup(maxDurationMs = 15_000) {
  const until = performance.now() + maxDurationMs
  sceneStartupUntil = until
  return (settleMs = 0) => {
    if (sceneStartupUntil !== until) return
    const now = performance.now()
    sceneStartupUntil = settleMs ? Math.min(until, now + settleMs) : 0
    sceneStartupEndedAt = settleMs ? sceneStartupUntil : now
  }
}

export function startRuntimePerformanceMonitor() {
  if (typeof window === 'undefined' || isPerformanceDegraded()) return () => undefined

  const WARMUP_MS = 2200
  const WINDOW_MS = 4200
  const SLOW_FRAME_MS = 45
  const VERY_SLOW_FRAME_MS = 90
  const startedAt = performance.now()
  let previousFrame = startedAt
  let windowStartedAt = startedAt
  let frameDeltas: number[] = []
  let longTaskCount = 0
  let longTaskBlockedMs = 0
  let severeWindows = 0
  let frameId = 0
  let stopped = false

  const observer = typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes?.includes('longtask')
    ? new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (performance.now() < sceneStartupUntil || entry.startTime < sceneStartupEndedAt) continue
          longTaskCount += 1
          longTaskBlockedMs += entry.duration
        }
      })
    : null

  observer?.observe({ entryTypes: ['longtask'] })

  const resetWindow = (now: number) => {
    windowStartedAt = now
    frameDeltas = []
    longTaskCount = 0
    longTaskBlockedMs = 0
  }

  const finish = (reason: PerformanceModeReason) => {
    if (stopped) return
    stopped = true
    cancelAnimationFrame(frameId)
    observer?.disconnect()
    activatePerformanceMode(reason)
  }

  const sample = (now: number) => {
    if (stopped) return

    if (document.visibilityState !== 'visible' || now < sceneStartupUntil) {
      previousFrame = now
      resetWindow(now)
      frameId = requestAnimationFrame(sample)
      return
    }

    const delta = now - previousFrame
    previousFrame = now
    if (delta > 0 && delta < 1000) frameDeltas.push(delta)

    if (now - startedAt < WARMUP_MS) {
      resetWindow(now)
      frameId = requestAnimationFrame(sample)
      return
    }

    if (now - windowStartedAt >= WINDOW_MS) {
      const averageDelta = frameDeltas.length
        ? frameDeltas.reduce((sum, value) => sum + value, 0) / frameDeltas.length
        : 0
      const slowRatio = frameDeltas.length
        ? frameDeltas.filter((value) => value >= SLOW_FRAME_MS).length / frameDeltas.length
        : 0
      const verySlowFrames = frameDeltas.filter((value) => value >= VERY_SLOW_FRAME_MS).length
      const enoughEvidence = frameDeltas.length >= 24
      const severeFramePressure = enoughEvidence && averageDelta >= 42 && slowRatio >= 0.35
      const severeStutter = enoughEvidence && slowRatio >= 0.48 && verySlowFrames >= 4
      const severeMainThreadBlock = longTaskBlockedMs >= 900 || longTaskCount >= 6
      const criticalFreeze = longTaskBlockedMs >= 1600 || verySlowFrames >= 10
      const severe = severeFramePressure || severeStutter || severeMainThreadBlock

      severeWindows = severe ? severeWindows + 1 : Math.max(0, severeWindows - 1)

      if (criticalFreeze || severeWindows >= 2) {
        finish('runtime')
        return
      }

      resetWindow(now)
    }

    frameId = requestAnimationFrame(sample)
  }

  frameId = requestAnimationFrame(sample)

  return () => {
    stopped = true
    cancelAnimationFrame(frameId)
    observer?.disconnect()
  }
}

export const CANVAS_CHROME_PREF_KEY = 'portfolio-canvas-chrome'

export function prefersCanvasChrome() {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(CANVAS_CHROME_PREF_KEY) === 'on'
  } catch {
    return false
  }
}

export function setCanvasChromePreference(enabled: boolean) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(CANVAS_CHROME_PREF_KEY, enabled ? 'on' : 'off')
  } catch {
    // Storage can be unavailable in private contexts; the body classes still work.
  }

  window.dispatchEvent(new CustomEvent('portfolio:canvas-chrome-preference', { detail: { enabled } }))
}
