import type { KeyboardEvent } from 'react'

/** Scroll the focused source viewport consistently across browser keyboard defaults. */
export function scrollEvidenceViewport(event: KeyboardEvent<HTMLDivElement>) {
  if (event.target !== event.currentTarget) return
  const node = event.currentTarget
  const vertical = event.key === 'ArrowDown' ? 40 : event.key === 'ArrowUp' ? -40 : event.key === 'PageDown' ? node.clientHeight * .8 : event.key === 'PageUp' ? -node.clientHeight * .8 : 0
  const horizontal = event.key === 'ArrowRight' ? 40 : event.key === 'ArrowLeft' ? -40 : 0
  if (vertical || horizontal || event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    node.scrollTo({
      top: event.key === 'Home' ? 0 : event.key === 'End' ? node.scrollHeight : node.scrollTop + vertical,
      left: node.scrollLeft + horizontal,
      behavior: 'instant',
    })
  }
}
