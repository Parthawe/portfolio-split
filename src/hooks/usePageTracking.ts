import { useEffect, useRef, useState, useCallback } from 'react'

const STORAGE_KEY = 'folio-visit-history'

function loadVisitHistory(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveVisitHistory(history: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {}
}

export function usePageTracking(route: string) {
  const [scrollDepth, setScrollDepth] = useState(0)
  const [timeOnPage, setTimeOnPage] = useState(0)
  const [visitHistory, setVisitHistory] = useState<string[]>(loadVisitHistory)
  const routeStartRef = useRef(Date.now())

  // Track scroll depth
  useEffect(() => {
    const update = () => {
      const doc = document.documentElement
      const scrollTop = window.scrollY || doc.scrollTop
      const scrollHeight = doc.scrollHeight - doc.clientHeight
      if (scrollHeight <= 0) { setScrollDepth(0); return }
      setScrollDepth(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [route])

  // Track time on page
  useEffect(() => {
    routeStartRef.current = Date.now()
    setTimeOnPage(0)
    setScrollDepth(0)

    const interval = setInterval(() => {
      setTimeOnPage(Math.round((Date.now() - routeStartRef.current) / 1000))
    }, 5000) // update every 5s, no need for precision

    return () => clearInterval(interval)
  }, [route])

  // Track visit history
  useEffect(() => {
    setVisitHistory(prev => {
      if (prev[prev.length - 1] === route) return prev
      const next = [...prev, route]
      saveVisitHistory(next)
      return next
    })
  }, [route])

  const getSnapshot = useCallback(() => ({
    scrollDepth,
    timeOnPage,
    visitHistory,
  }), [scrollDepth, timeOnPage, visitHistory])

  return { scrollDepth, timeOnPage, visitHistory, getSnapshot }
}
