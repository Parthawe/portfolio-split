import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const positions = new Map<string, number>()

/** Standalone experiences have no RootLayout. Keep new visits and history distinct. */
export function useExperienceNavigation() {
  const location = useLocation()
  const navigation = useNavigationType()

  useLayoutEffect(() => {
    const key = `${location.key}:${location.pathname}${location.search}${location.hash}`
    const target = navigation === 'POP' ? positions.get(key) ?? 0 : 0
    const previousRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    let lastY = target
    let settling = true
    let frame = 0
    let timeout = 0
    const record = () => { lastY = window.scrollY }
    const stop = () => {
      settling = false
      mutations.disconnect()
      resize.disconnect()
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
      for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.removeEventListener(type, stop)
    }
    const restore = () => {
      if (!settling) return
      const heading = document.querySelector<HTMLElement>('#main-content h1')
      if (!heading) return
      let anchorId = location.hash.slice(1)
      try { anchorId = decodeURIComponent(anchorId) } catch { /* Preserve literal malformed hashes. */ }
      const anchor = anchorId ? document.getElementById(anchorId) : null
      if (navigation !== 'POP') {
        heading.tabIndex = -1
        heading.focus({ preventScroll: true })
      }
      if (anchor) anchor.scrollIntoView({ behavior: 'instant' })
      else window.scrollTo({ top: target, behavior: 'instant' })
      record()
      // A history position can exceed the temporary height of a lazy route.
      if (anchor || (!anchorId && document.documentElement.scrollHeight >= target + innerHeight)) stop()
    }
    const mutations = new MutationObserver(restore)
    const resize = new ResizeObserver(restore)
    mutations.observe(document.getElementById('site-zoom-stage') ?? document.body, { childList: true, subtree: true })
    resize.observe(document.body)
    window.addEventListener('scroll', record, { passive: true })
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(type, stop, { passive: true })
    timeout = window.setTimeout(stop, 5000)
    frame = requestAnimationFrame(restore)
    restore()
    return () => {
      positions.set(key, lastY)
      if (positions.size > 80) positions.delete(positions.keys().next().value!)
      stop()
      window.removeEventListener('scroll', record)
      history.scrollRestoration = previousRestoration
    }
  }, [location.key, location.pathname, location.search, location.hash, navigation])
}
