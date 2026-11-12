import { useEffect, useRef, useState, type RefObject } from 'react'
import type { CoverPreview as Preview } from '../data/coverPreviews'
import '../styles/cover-preview.css'

// One decoder/sequence across all cards. Intent can interrupt an automatic
// preview, while simultaneous viewport entries never start competing players.
let owner: (() => void) | undefined
let browsed = false
const browsingSubscribers = new Set<() => void>()
const browsingEvents = ['scroll', 'pointermove', 'keydown', 'touchmove'] as const
function armBrowsing() {
  browsed = true
  browsingEvents.forEach(event => window.removeEventListener(event, armBrowsing))
  browsingSubscribers.forEach(notify => notify())
}
function observeBrowsing(notify: () => void) {
  if (!browsed && browsingSubscribers.size === 0) browsingEvents.forEach(event => window.addEventListener(event, armBrowsing, { passive: true }))
  browsingSubscribers.add(notify)
  return () => {
    browsingSubscribers.delete(notify)
    if (browsingSubscribers.size === 0) browsingEvents.forEach(event => window.removeEventListener(event, armBrowsing))
  }
}
function claim(stop: () => void, intent: boolean) {
  if (owner && owner !== stop) {
    if (!intent) return false
    owner()
  }
  owner = stop
  return true
}

export default function CoverPreview({ preview, cardRef }: {
  preview: Preview
  cardRef: RefObject<HTMLElement | null>
}) {
  const [active, setActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [take, setTake] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readyRef = useRef<() => void>(() => {})
  const stopRef = useRef<() => void>(() => {})
  const loaded = useRef(new Set<string>())

  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const trigger = card.closest('a') || card
    // The optional chunk can finish after pointerenter. Read live hover state
    // when binding, so a stationary pointer still expresses intent. Touch's
    // sticky :hover state must not turn into a mouse preview.
    let pointerInside = window.matchMedia('(hover: hover)').matches && trigger.matches(':hover')
    let disposed = false, playing = false, visible = false, automaticVisible = false, triedAutomatic = false, failed = false
    let watchdog: ReturnType<typeof setTimeout> | undefined
    let endTimer: ReturnType<typeof setTimeout> | undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hints = navigator as Navigator & {
      deviceMemory?: number
      connection?: { saveData?: boolean; effectiveType?: string; addEventListener?: typeof window.addEventListener; removeEventListener?: typeof window.removeEventListener }
    }
    const connection = hints.connection
    // The site's 3D policy also marks every phone as low-power. A bounded,
    // silent film is cheaper than 3D; use actual constraints and emergency mode.
    const constrainedHardware = (hints.deviceMemory !== undefined && hints.deviceMemory <= 2) || navigator.hardwareConcurrency <= 2
    const allowed = () => !disposed && !failed && !document.hidden && !reduce.matches &&
      !connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || '') &&
      !constrainedHardware && !document.documentElement.classList.contains('is-runtime-performance-degraded')
    const stop = () => {
      clearTimeout(watchdog); clearTimeout(endTimer)
      const video = videoRef.current
      if (video) { video.pause(); video.removeAttribute('src'); video.load() }
      playing = false
      if (owner === stop) owner = undefined
      card.dataset.coverMotion = 'idle'
      if (!disposed) { setActive(false); setReady(false) }
    }
    stopRef.current = stop
    readyRef.current = () => {
      if (!playing || !allowed()) { stop(); return }
      clearTimeout(watchdog)
      setReady(true)
      card.dataset.coverMotion = 'playing'
      // Nonessential motion is a short, finite preview, never an endless loop.
      endTimer = setTimeout(stop, 4400)
    }
    const start = (intent: boolean) => {
      if (playing || !visible || (!intent && !browsed) || !allowed() || !claim(stop, intent)) return
      playing = true
      triedAutomatic = true
      loaded.current.clear()
      card.dataset.coverMotion = 'loading'
      setReady(false); setTake(value => value + 1); setActive(true)
      watchdog = setTimeout(stop, 8000)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      automaticVisible = entry.intersectionRatio >= .65
      if (!visible) stop()
      // A focus/enter event can precede this asynchronous visibility update
      // (notably after a keyboard scroll in Safari). Honor that live intent.
      else if (pointerInside || trigger.contains(document.activeElement)) start(true)
      else if (automaticVisible && !triedAutomatic) start(false)
    }, { threshold: [0, .65] })
    observer.observe(card)
    const stopBrowsing = observeBrowsing(() => { if (automaticVisible && !triedAutomatic) start(false) })
    const onEnter = (event: PointerEvent) => { if (event.pointerType !== 'touch') { pointerInside = true; start(true) } }
    const onFocus = () => start(true)
    const onLeave = (event: PointerEvent) => {
      // Native touch scrolling cancels its pointer stream and sends leave.
      // Visibility, rather than a nonexistent touch hover, owns that preview.
      if (event.pointerType === 'touch') return
      pointerInside = false
      if (!trigger.contains(document.activeElement)) stop()
    }
    const onBlur = () => queueMicrotask(() => { if (!trigger.matches(':hover') && !trigger.contains(document.activeElement)) stop() })
    // Index artwork sits beside its focused row. Escape must reach the single
    // active player even when focus is outside that artwork's DOM subtree.
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && owner === stop) stop() }
    const onPolicy = () => { if (!allowed()) stop() }
    const rootObserver = new MutationObserver(onPolicy)
    rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    trigger.addEventListener('pointerenter', onEnter)
    trigger.addEventListener('pointerleave', onLeave)
    trigger.addEventListener('focusin', onFocus)
    trigger.addEventListener('focusout', onBlur)
    document.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onPolicy)
    reduce.addEventListener('change', onPolicy)
    const onError = () => { failed = true; stop() }
    card.addEventListener('cover-preview-error', onError)
    connection?.addEventListener?.('change', onPolicy)
    return () => {
      disposed = true; stop(); observer.disconnect(); rootObserver.disconnect(); stopBrowsing()
      trigger.removeEventListener('pointerenter', onEnter); trigger.removeEventListener('pointerleave', onLeave)
      trigger.removeEventListener('focusin', onFocus); trigger.removeEventListener('focusout', onBlur)
      document.removeEventListener('keydown', onKey); card.removeEventListener('cover-preview-error', onError)
      document.removeEventListener('visibilitychange', onPolicy); reduce.removeEventListener('change', onPolicy)
      connection?.removeEventListener?.('change', onPolicy)
      delete card.dataset.coverMotion
    }
  }, [cardRef, preview])

  useEffect(() => {
    if (!active || preview.kind !== 'type') return
    let current = true
    Promise.all([200, 400, 700].map(weight => document.fonts.load(`${weight} 48px "Cover Slice"`)))
      .then(fonts => { if (current && fonts.every(list => list.length > 0)) readyRef.current(); else if (current) fail() })
      .catch(() => { if (current) fail() })
    return () => { current = false }
  }, [active, preview, take])

  function fail() { cardRef.current?.dispatchEvent(new Event('cover-preview-error')) }
  function imageReady(src: string) {
    loaded.current.add(src)
    if (preview.kind === 'screens' && loaded.current.size === preview.sources.length) readyRef.current()
  }

  if (!active) return null
  return <span key={take} className={`cover-motion cover-motion--${preview.kind}${ready ? ' is-ready' : ''}`} aria-hidden="true">
    {preview.kind === 'film' ? <video ref={videoRef} className="cover-motion__film" src={preview.src}
      style={{ objectPosition: preview.position, objectFit: preview.contain ? 'contain' : 'cover' }}
      autoPlay muted playsInline preload="none" disablePictureInPicture tabIndex={-1}
      onPlaying={() => readyRef.current()} onEnded={() => stopRef.current()}
      onError={() => { if (videoRef.current?.getAttribute('src')) fail() }}
    /> : preview.kind === 'screens' ? <>
      {preview.sources.map((src, index) => <span className={`cover-motion__screen cover-motion__screen--${index}`} key={src}>
        <img src={src} alt="" decoding="async" onLoad={() => imageReady(src)} onError={fail} />
        <span>{preview.labels[index]}</span>
      </span>)}
    </> : <span className="cover-motion__type">
      {[200, 400, 700].map((weight, index) => <span className={`cover-motion__weight cover-motion__weight--${index}`} key={weight} style={{ fontWeight: weight }}>
        <span>Slice</span><small>{['Ultralight', 'Regular', 'Bold'][index]}</small>
      </span>)}
    </span>}
  </span>
}
