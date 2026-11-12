/** A scene owns no animation callbacks once idle, offscreen, or in a hidden tab. */
type SceneActivityOptions = {
  idleMs?: number
  introMs?: number
  fps?: number
  interactionFps?: number
  wakeOnWheel?: boolean
}

export function createSceneActivity(element: HTMLElement, render: (delta: number) => void, options: SceneActivityOptions = {}) {
  const { idleMs = 10_000, introMs = idleMs, fps = 24, interactionFps = 60, wakeOnWheel = true } = options
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  let visible = false
  let disposed = false
  let timeout = 0
  let frame = 0
  let previous = 0
  let activeUntil = 0
  let interactiveUntil = 0
  let pending = true

  const cancel = () => {
    clearTimeout(timeout)
    cancelAnimationFrame(frame)
    timeout = frame = 0
    previous = 0
  }
  const schedule = () => {
    if (disposed || !visible || document.hidden || timeout || frame) return
    if (!pending && (motion.matches || performance.now() >= activeUntil)) { previous = 0; return }
    const interval = performance.now() < interactiveUntil ? 1000 / interactionFps : 1000 / fps
    // During direct manipulation, use the browser's frame boundary instead of
    // stacking a 16ms timer before rAF (which can miss every other refresh).
    if (interval <= 1000 / 60) { frame = requestAnimationFrame(tick); return }
    timeout = window.setTimeout(() => {
      timeout = 0
      frame = requestAnimationFrame(tick)
    }, Math.max(0, interval - (performance.now() - previous)))
  }
  const tick = (now: number) => {
    frame = 0
    if (disposed || !visible || document.hidden) { cancel(); return }
    const interval = performance.now() < interactiveUntil ? 1000 / interactionFps : 1000 / fps
    if (previous && now - previous < interval - .5) { schedule(); return }
    const delta = previous ? Math.min((now - previous) / 1000, .08) : 1 / 60
    previous = now
    pending = false
    // Ease motion to rest during the final second; paused wall time never advances it.
    const remaining = Math.max(0, Math.min(1, (activeUntil - now) / 1000))
    const easing = remaining * remaining * (3 - 2 * remaining)
    render(delta * (motion.matches ? 1 : easing))
    schedule()
  }
  const wakeFor = (duration: number) => {
    activeUntil = performance.now() + duration
    pending = true
    schedule()
  }
  const wake = () => wakeFor(introMs)
  const interact = () => {
    interactiveUntil = performance.now() + 250
    // An ambient-rate timer must not delay the first drag/keyboard response.
    if (timeout) { clearTimeout(timeout); timeout = 0 }
    wakeFor(idleMs)
  }
  const visibility = () => { if (document.hidden) cancel(); else wake() }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) wake(); else cancel()
  })
  observer.observe(element)
  const events = ['pointerenter', 'pointerleave', 'pointermove', 'pointerdown', 'pointerup', 'focusin', 'keydown', ...(wakeOnWheel ? ['wheel'] : [])]
  events.forEach(event => element.addEventListener(event, interact, { passive: true }))
  document.addEventListener('visibilitychange', visibility)
  motion.addEventListener('change', wake)
  return {
    wake,
    dispose() {
      disposed = true
      cancel()
      observer.disconnect()
      events.forEach(event => element.removeEventListener(event, interact))
      document.removeEventListener('visibilitychange', visibility)
      motion.removeEventListener('change', wake)
    },
  }
}
