/** Preserve active-frame timing, but schedule no work offscreen or in hidden tabs. */
export function observeVisible(element: Element, change: (visible: boolean) => void) {
  let intersecting = false
  let previous: boolean | undefined
  const sync = () => {
    const visible = intersecting && !document.hidden
    if (visible !== previous) { previous = visible; change(visible) }
  }
  const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; sync() })
  observer.observe(element)
  document.addEventListener('visibilitychange', sync)
  return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
}

export function visibleAnimation(element: HTMLElement, draw: (time: number) => void, keepRunning = () => true) {
  let visible = false, disposed = false, frame = 0, previous = 0, elapsed = 0
  const tick = (now: number) => {
    frame = 0
    if (!visible || disposed) return
    elapsed += previous ? Math.min(now - previous, 80) : 1000 / 60
    previous = now
    draw(elapsed)
    if (keepRunning()) frame = requestAnimationFrame(tick)
    else previous = 0
  }
  const wake = () => { if (visible && !disposed && !frame) frame = requestAnimationFrame(tick) }
  const stopObserving = observeVisible(element, value => {
    visible = value
    if (value) wake()
    else { cancelAnimationFrame(frame); frame = 0; previous = 0 }
  })
  const events = ['pointerenter', 'pointerleave', 'pointermove', 'pointerdown', 'pointerup', 'click', 'keydown', 'keyup', 'focusin'] as const
  events.forEach(event => element.addEventListener(event, wake))
  const resize = new ResizeObserver(wake)
  resize.observe(element)
  return { wake, dispose() {
    disposed = true
    cancelAnimationFrame(frame)
    stopObserving()
    resize.disconnect()
    events.forEach(event => element.removeEventListener(event, wake))
  } }
}
