import { useState, useEffect, useCallback, useRef } from 'react'
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock'

interface LightboxState {
  src: string
  alt: string
}

const LIGHTBOX_TRIGGER_SELECTOR = '.project-main .cs-img-full img, .project-main .proj-hero-img img, .project-main .cs-img img, .project-main [data-project-preview] img, .project-main img[data-project-preview], .project-main .proj-visual-hero__media:not(.proj-visual-hero__media--interactive) > img'

export default function Lightbox() {
  const [state, setState] = useState<LightboxState | null>(null)
  const prevFocusRef = useRef<Element | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setState(null)
    // Restore focus to the element that triggered the lightbox
    if (prevFocusRef.current instanceof HTMLElement) {
      prevFocusRef.current.focus()
      prevFocusRef.current = null
    }
  }, [])

  const openFromImage = useCallback((img: HTMLImageElement) => {
    prevFocusRef.current = img
    setState({ src: img.dataset.originalSrc || img.currentSrc || img.src, alt: img.alt || '' })
  }, [])

  // Listen for clicks on case study images
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // only left-click opens lightbox
      const img = (e.target as Element).closest(LIGHTBOX_TRIGGER_SELECTOR) as HTMLImageElement | null
      if (!img || img.closest('a, button') || img.getAttribute('aria-hidden') === 'true' || !img.alt) return
      e.preventDefault()
      openFromImage(img)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [openFromImage])

  // Make zoomable images keyboard reachable without changing the visual UI
  useEffect(() => {
    const decorate = (root: ParentNode) => {
      const images = [...root.querySelectorAll<HTMLImageElement>(LIGHTBOX_TRIGGER_SELECTOR)];
      if (root instanceof HTMLImageElement && root.matches(LIGHTBOX_TRIGGER_SELECTOR)) images.push(root);
      images.forEach(img => {
        if (img.closest('a, button') || img.getAttribute('aria-hidden') === 'true' || !img.alt) return;
        img.tabIndex = 0
        img.setAttribute('role', 'button')
        img.setAttribute('aria-haspopup', 'dialog')
        img.setAttribute('aria-label', img.alt ? `Open image preview: ${img.alt}` : 'Open image preview')
      })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const target = e.target
      if (!(target instanceof HTMLImageElement) || !target.matches(LIGHTBOX_TRIGGER_SELECTOR)) return
      e.preventDefault()
      openFromImage(target)
    }

    decorate(document)
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return
          decorate(node)
        })
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openFromImage])

  // Focus trap + keyboard handling
  useEffect(() => {
    if (!state) return

    // Focus the close button when lightbox opens
    requestAnimationFrame(() => closeRef.current?.focus())

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return }

      // Focus trap — keep Tab within the lightbox
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]')
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    lockBodyScroll('lightbox')
    return () => {
      document.removeEventListener('keydown', handleKey)
      unlockBodyScroll('lightbox')
    }
  }, [state, close])

  if (!state) return null

  return (
    <div
      ref={overlayRef}
      className="lightbox-overlay active project-image-preview"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button ref={closeRef} className="lightbox-close" type="button" onClick={close} aria-label="Close lightbox">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <img
        src={state.src}
        alt={state.alt}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="lightbox-caption" onClick={e => e.stopPropagation()}>
        {state.alt && <p>{state.alt}</p>}
        <a href={state.src} target="_blank" rel="noopener noreferrer">Open full-size image (new tab)</a>
      </div>
    </div>
  )
}
