// Keep direct links aligned while the expanded article lays out. Stop as soon
// as the visitor interacts, so late media never pulls them away from reading.
export function settleAnchor(id: string) {
  let stopped = false
  let frame = 0
  const align = () => {
    if (!stopped) document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(align)
  })
  observer.observe(document.body)
  const stop = () => {
    stopped = true
    observer.disconnect()
    cancelAnimationFrame(frame)
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.removeEventListener(event, stop)
  }
  for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(event, stop, { passive: true })
  frame = requestAnimationFrame(align)
  const timer = window.setTimeout(stop, 3000)
  return () => { clearTimeout(timer); stop() }
}
