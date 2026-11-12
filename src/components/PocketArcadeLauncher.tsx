import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const PocketArcade = lazy(() => import('./PocketArcade'))

function GamepadGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.4 8.3h9.2a4.1 4.1 0 0 1 3.9 5.4l-1.2 3.5a2.4 2.4 0 0 1-3.8 1.1l-1.7-1.4h-3.6l-1.7 1.4a2.4 2.4 0 0 1-3.8-1.1l-1.2-3.5a4.1 4.1 0 0 1 3.9-5.4Z" />
      <path d="M7.2 12.1v3.2M5.6 13.7h3.2M15.9 12.8h.01M18 14.8h.01" />
    </svg>
  )
}

export default function PocketArcadeLauncher({
  inlineDesktop = false,
  showIntro = true,
}: {
  inlineDesktop?: boolean
  showIntro?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [showInline, setShowInline] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!inlineDesktop) return
    const query = window.matchMedia('(min-width: 761px)')
    const sync = () => setShowInline(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [inlineDesktop])

  const closeArcade = () => {
    setOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <>
      {inlineDesktop && showInline && (
        <div className="ft-arcade-inline">
          {showIntro ? (
            <div className="ft-arcade-intro">
              <span>INTERMISSION / OPTIONAL</span>
              <p>Five tiny games. Keyboard or buttons.</p>
            </div>
          ) : null}
          <Suspense fallback={<span className="ft-arcade-loading" role="status">Loading arcade...</span>}>
            <PocketArcade embedded />
          </Suspense>
        </div>
      )}
      <button
        ref={triggerRef}
        type="button"
        className={`ft-arcade-launcher${inlineDesktop ? ' ft-arcade-launcher--mobile' : ''}`}
        aria-label="Open Pocket Arcade"
        aria-haspopup="dialog"
        onPointerDown={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
      >
        <span className="ft-arcade-launcher__device" aria-hidden="true">
          <span className="ft-arcade-launcher__screen">
            <i /><i /><i /><i /><i />
          </span>
          <span className="ft-arcade-launcher__controls">
            <span className="ft-arcade-launcher__dpad" />
            <span className="ft-arcade-launcher__buttons"><i /><i /><i /><i /></span>
          </span>
        </span>
        <span className="ft-arcade-launcher__icon"><GamepadGlyph /></span>
        <span className="ft-arcade-launcher__label">Pocket Arcade</span>
      </button>
      {open && (
        <Suspense fallback={<span className="sr-only" role="status">Loading Pocket Arcade</span>}>
          <PocketArcade onClose={closeArcade} />
        </Suspense>
      )}
    </>
  )
}
