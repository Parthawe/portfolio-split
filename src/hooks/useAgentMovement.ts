import { useRef, useCallback } from 'react'

interface MovementState {
  walking: boolean
  targetLeft: number | null
  facingLeft: boolean
}

/**
 * Animates Folio to walk toward a target element on the page.
 * Uses RAF with ease-out interpolation for smooth movement.
 */
export function useAgentMovement(
  wrapRef: React.RefObject<HTMLDivElement | null>,
  onStateChange: (state: 'walking' | 'pointing' | 'idle') => void,
) {
  const rafRef = useRef(0)
  const stateRef = useRef<MovementState>({ walking: false, targetLeft: null, facingLeft: false })
  const returnTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const walkTo = useCallback((targetEl: HTMLElement | null) => {
    const el = wrapRef.current
    if (!el || !targetEl) return

    // Cancel any existing walk
    cancelAnimationFrame(rafRef.current)
    if (returnTimer.current) clearTimeout(returnTimer.current)

    const targetRect = targetEl.getBoundingClientRect()
    const charRect = el.getBoundingClientRect()

    // Target: align horizontally with the target's center, stay at current bottom
    const targetLeft = Math.max(0, Math.min(
      targetRect.left + targetRect.width / 2 - 32,
      window.innerWidth - 64,
    ))

    const startLeft = charRect.left
    const distance = targetLeft - startLeft
    stateRef.current = {
      walking: true,
      targetLeft,
      facingLeft: distance < 0,
    }

    // Start walking animation
    onStateChange('walking')
    el.style.transition = 'none'

    const duration = Math.min(1200, Math.max(500, Math.abs(distance) * 1.5))
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      const currentLeft = startLeft + distance * eased
      el.style.right = 'auto'
      el.style.left = `${currentLeft}px`

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Arrived, point at the target
        stateRef.current.walking = false
        onStateChange('pointing')

        // Return to idle after 3s
        returnTimer.current = setTimeout(() => {
          onStateChange('idle')
          el.style.transition = ''
        }, 3000)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [wrapRef, onStateChange])

  const cancel = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    if (returnTimer.current) clearTimeout(returnTimer.current)
    stateRef.current.walking = false
  }, [])

  return {
    walkTo,
    cancel,
    get facingLeft() { return stateRef.current.facingLeft },
    get isMoving() { return stateRef.current.walking },
  }
}
