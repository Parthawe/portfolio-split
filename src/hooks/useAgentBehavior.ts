import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import type { AgentState } from '../components/agent/AgentCharacter'

const IDLE_TIMEOUT = 60_000

export function useAgentBehavior() {
  const location = useLocation()
  const [state, setState] = useState<AgentState>('idle')
  const [entered, setEntered] = useState(false)
  const [dockVisible, setDockVisible] = useState(true)
  const [dragging, setDragging] = useState(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const didDrag = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)

  // ── Entry ──────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 1500)
    return () => clearTimeout(t)
  }, [])

  // ── Dock visibility ────────────────────────────────
  useEffect(() => {
    const check = () => {
      const dock = document.querySelector('.work-bottom-nav, .cs-bottom-nav')
      if (dock) {
        setDockVisible(!dock.classList.contains('is-hidden'))
      } else {
        const footer = document.querySelector('.footer')
        if (footer) {
          setDockVisible(footer.getBoundingClientRect().top > window.innerHeight - 100)
        } else {
          setDockVisible(true)
        }
      }
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    const mo = new MutationObserver(check)
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] })
    return () => { window.removeEventListener('scroll', check); mo.disconnect() }
  }, [location.pathname])

  // ── Idle timeout → sleep ───────────────────────────
  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      setState(prev => prev === 'idle' ? 'sleeping' : prev)
    }, IDLE_TIMEOUT)
  }, [])

  useEffect(() => {
    const wake = () => {
      setState(prev => prev === 'sleeping' ? 'idle' : prev)
      resetIdleTimer()
    }
    window.addEventListener('mousemove', wake, { passive: true })
    window.addEventListener('scroll', wake, { passive: true })
    resetIdleTimer()
    return () => {
      window.removeEventListener('mousemove', wake)
      window.removeEventListener('scroll', wake)
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [resetIdleTimer])

  // ── Drag (long-press) ──────────────────────────────
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    let pointerId: number | null = null
    let longPressTimer: ReturnType<typeof setTimeout> | null = null
    let dragReady = false
    let startLeft = 0

    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement)?.closest('.agent-trigger')) return
      pointerId = e.pointerId
      didDrag.current = false
      dragReady = false
      dragStart.current = { x: e.clientX, y: e.clientY }
      const rect = el.getBoundingClientRect()
      startLeft = rect.left
      longPressTimer = setTimeout(() => { dragReady = true; setDragging(true); el.style.transition = 'none' }, 300)
    }

    const onMove = (e: PointerEvent) => {
      if (pointerId === null || e.pointerId !== pointerId) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      if (!dragReady && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
        pointerId = null
        return
      }
      if (!dragReady) return
      didDrag.current = true
      hasMoved.current = true
      el.style.right = 'auto'
      // Constrain to horizontal movement only — character walks on the platform bar
      el.style.left = `${Math.max(0, Math.min(startLeft + dx, window.innerWidth - 64))}px`
    }

    const onUp = () => {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
      pointerId = null
      dragReady = false
      setDragging(false)
      requestAnimationFrame(() => { el.style.transition = '' })
    }

    el.addEventListener('pointerdown', onDown, { passive: true })
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerup', onUp, { passive: true })
    el.addEventListener('pointercancel', onUp, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      if (longPressTimer) clearTimeout(longPressTimer)
    }
  }, [])

  const setAgentState = useCallback((s: AgentState) => {
    setState(s)
    if (s === 'idle') resetIdleTimer()
  }, [resetIdleTimer])

  const wake = useCallback(() => {
    setState('idle')
    resetIdleTimer()
  }, [resetIdleTimer])

  return { state, entered, dockVisible, dragging, didDrag, wrapRef, setAgentState, wake, route: location.pathname }
}
