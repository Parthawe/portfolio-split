import { useEffect, useState } from 'react'

interface DeferredMountOptions {
  timeout?: number
  delayMs?: number
  afterPaint?: boolean
}

type IdleCapableWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: { timeout: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

export function useDeferredMount(
  enabled = true,
  { timeout = 1500, delayMs = 0, afterPaint = false }: DeferredMountOptions = {},
) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!enabled) {
      if (mounted) setMounted(false)
      return
    }
    if (mounted) return

    if (afterPaint) {
      let secondFrame = 0
      const firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => setMounted(true))
      })
      return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
    }

    let cancelled = false
    let delayId: number | null = null
    let timeoutId: number | null = null
    let idleId: number | null = null

    const activate = () => {
      if (!cancelled) setMounted(true)
    }

    const schedule = () => {
      const idleWindow = window as IdleCapableWindow
      if (typeof idleWindow.requestIdleCallback === 'function') {
        idleId = idleWindow.requestIdleCallback(() => activate(), { timeout })
        return
      }

      timeoutId = window.setTimeout(activate, Math.min(timeout, 400))
    }

    if (delayMs > 0) {
      delayId = window.setTimeout(schedule, delayMs)
    } else {
      schedule()
    }

    return () => {
      cancelled = true
      if (delayId !== null) window.clearTimeout(delayId)
      if (timeoutId !== null) window.clearTimeout(timeoutId)
      if (idleId !== null) {
        const idleWindow = window as IdleCapableWindow
        idleWindow.cancelIdleCallback?.(idleId)
      }
    }
  }, [afterPaint, delayMs, enabled, mounted, timeout])

  return mounted
}
