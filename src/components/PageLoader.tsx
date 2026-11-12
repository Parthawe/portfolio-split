import { useState, useEffect } from 'react'
import PixelLoaderVisual from './PixelLoaderVisual'

export default function PageLoader() {
  const [loaded, setLoaded] = useState(false)
  const [removed, setRemoved] = useState(false)

  useEffect(() => {
    const startedAt = performance.now()
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Keep the visual handoff, but never make a ready route feel stalled.
    const minDuration = prefersReduced ? 20 : 160
    const maxDuration = prefersReduced ? 80 : 360
    let releaseTimer: number | undefined
    let capTimer: number | undefined
    let cancelled = false

    const release = () => {
      if (cancelled) return
      const elapsed = performance.now() - startedAt
      releaseTimer = window.setTimeout(() => {
        if (!cancelled) setLoaded(true)
      }, Math.max(0, minDuration - elapsed))
    }

    const twoFrames = new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
    const fontReady = document.fonts?.ready
      ? Promise.race([
          document.fonts.ready.then(() => undefined),
          new Promise<void>(resolve => window.setTimeout(resolve, 260)),
        ])
      : Promise.resolve()

    capTimer = window.setTimeout(release, maxDuration)
    Promise.all([twoFrames, fontReady]).then(release)

    return () => {
      cancelled = true
      clearTimeout(capTimer)
      clearTimeout(releaseTimer)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    document.body.classList.add('page-ready')
    window.dispatchEvent(new CustomEvent('portfolio:page-ready'))
    const id = window.setTimeout(() => setRemoved(true), 180)
    return () => window.clearTimeout(id)
  }, [loaded])

  if (removed) return null

  return (
    <div className={`page-loader${loaded ? ' loaded' : ''}`} aria-hidden="true">
      <PixelLoaderVisual />
    </div>
  )
}
