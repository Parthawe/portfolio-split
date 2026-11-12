import { useState, useEffect, useRef } from 'react'

/** Returns [ref, inView] — attach ref to the element to observe. */
export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.05, rootMargin = '0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold, rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, threshold])
  return [ref, inView] as const
}
