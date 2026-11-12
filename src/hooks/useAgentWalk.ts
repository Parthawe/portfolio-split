import { useEffect, useRef, useCallback } from 'react'

/**
 * Smooth walk patrol using CSS transitions instead of RAF.
 * Character glides from one position to another, pauses, turns, repeats.
 */

const SPEED_PX_PER_SEC = 30     // walking speed in px/sec
const PAUSE_MIN = 2500
const PAUSE_MAX = 5000
const NAV_INSET = 0.22          // walk within center 56% of viewport

export function useAgentWalk(
  wrapRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  onWalkStateChange: (walking: boolean, facingRight: boolean) => void,
) {
  const facingRight = useRef(true)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const walking = useRef(false)

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    walking.current = false
    const el = wrapRef.current
    if (el) {
      el.style.transition = ''
    }
    onWalkStateChange(false, facingRight.current)
  }, [wrapRef, onWalkStateChange])

  useEffect(() => {
    if (!enabled) { stop(); return }

    const el = wrapRef.current
    if (!el) return

    const startWalk = () => {
      const vw = window.innerWidth
      const leftBound = vw * NAV_INSET
      const rightBound = vw * (1 - NAV_INSET) - 48 // 48 = avatar width

      const rect = el.getBoundingClientRect()
      const currentLeft = rect.left

      // Pick target: opposite end from current position
      const targetLeft = facingRight.current ? rightBound : leftBound
      const distance = Math.abs(targetLeft - currentLeft)
      const duration = distance / SPEED_PX_PER_SEC // seconds

      if (distance < 20) {
        // Already at the edge, flip and walk back
        facingRight.current = !facingRight.current
        onWalkStateChange(false, facingRight.current)
        pause()
        return
      }

      // Start walking
      walking.current = true
      onWalkStateChange(true, facingRight.current)

      // Use CSS transition for smooth glide
      el.style.transition = `left ${duration}s linear`
      el.style.left = `${targetLeft}px`
      el.style.right = 'auto'

      // When walk completes, pause and turn
      timer.current = setTimeout(() => {
        walking.current = false
        facingRight.current = !facingRight.current
        onWalkStateChange(false, facingRight.current)
        el.style.transition = ''
        pause()
      }, duration * 1000)
    }

    const pause = () => {
      const delay = PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN)
      timer.current = setTimeout(() => {
        if (!enabled) return
        startWalk()
      }, delay)
    }

    // Initial pause before first walk
    timer.current = setTimeout(startWalk, 2000)

    return () => {
      if (timer.current) clearTimeout(timer.current)
      walking.current = false
      if (el) el.style.transition = ''
    }
  }, [enabled, wrapRef, onWalkStateChange, stop])

  return {
    stop,
    get facingRight() { return facingRight.current },
    get isWalking() { return walking.current },
  }
}
