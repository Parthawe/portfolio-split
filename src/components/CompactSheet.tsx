import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock'

/** A bounded modal surface; background focus and scroll resume on dismissal. */
export default function CompactSheet({ title, id, onClose, returnFocus, children }: {
  title: string; id: string; onClose: () => void; returnFocus?: HTMLElement | null; children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const lockId = useId()
  const closeRef=useRef(onClose);closeRef.current=onClose
  const swipeStart = useRef<number | null>(null)
  useEffect(() => {
    const surface = ref.current!
    const previousFocus = returnFocus ?? document.activeElement
    const background = [...document.body.children].filter((node): node is HTMLElement =>
      node instanceof HTMLElement && node !== surface)
    const previousInert = background.map(node => node.inert)
    background.forEach(node => { node.inert = true })
    lockBodyScroll(lockId)
    surface.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); return }
      if (event.key !== 'Tab') return
      const closedDetails = [...surface.querySelectorAll<HTMLDetailsElement>('details:not([open])')]
      const controls = [...surface.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]')].filter(node =>
        node.getClientRects().length > 0 && !node.hidden && getComputedStyle(node).visibility === 'visible' &&
        !closedDetails.some(details => details.contains(node) && details.querySelector(':scope > summary') !== node))
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      background.forEach((node, index) => { node.inert = previousInert[index] })
      unlockBodyScroll(lockId)
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [lockId, returnFocus])
  return createPortal(<div className="compact-sheet-backdrop" ref={ref} onClick={event => {
    if (event.target === event.currentTarget) onClose()
  }}>
    <section className="compact-sheet" id={id} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
      <div className="compact-sheet-grab" aria-hidden="true"
        onPointerDown={event => { if (event.button !== 0) return; swipeStart.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId) }}
        onPointerUp={event => { const start = swipeStart.current; swipeStart.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); if (start !== null && event.clientY - start > 55) onClose() }}
        onPointerCancel={() => { swipeStart.current = null }}
      ><div className="compact-sheet-handle" /></div>
      <header><h2 id={`${id}-title`}>{title}</h2><button type="button" className="glass-action" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}>Close</button></header>
      <div className="compact-sheet-content">{children}</div>
    </section>
  </div>, document.body)
}
