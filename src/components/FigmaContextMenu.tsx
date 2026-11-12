import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface MenuItem {
  label: string
  shortcut?: string
  action?: () => void
  divider?: boolean
}

const dispatchZoomShortcut = (key: '=' | '-' | '0') => {
  window.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    metaKey: true,
    bubbles: true,
    cancelable: true,
  }))
}

export default function FigmaContextMenu() {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleContext = useCallback((e: MouseEvent) => {
    const target = e.target
    if (
      target instanceof HTMLElement &&
      target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')
    ) {
      return
    }

    e.preventDefault()
    const x = Math.min(e.clientX, window.innerWidth - 240)
    const y = Math.min(e.clientY, window.innerHeight - 400)
    setPos({ x, y })
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    document.addEventListener('contextmenu', handleContext)
    document.addEventListener('click', close)
    document.addEventListener('scroll', close, { capture: true, passive: true })
    return () => {
      document.removeEventListener('contextmenu', handleContext)
      document.removeEventListener('click', close)
      document.removeEventListener('scroll', close, { capture: true } as EventListenerOptions)
    }
  }, [handleContext, close])

  useEffect(() => {
    if (!open) return
    const buttons = () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('.figma-ctx-item:not(:disabled)') ?? [])
    window.requestAnimationFrame(() => {
      buttons()[0]?.focus()
    })

    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }

      const items = buttons()
      if (!items.length) return
      const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement)

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        items[(currentIndex + 1 + items.length) % items.length]?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        items[(currentIndex - 1 + items.length) % items.length]?.focus()
      } else if (e.key === 'Home') {
        e.preventDefault()
        items[0]?.focus()
      } else if (e.key === 'End') {
        e.preventDefault()
        items[items.length - 1]?.focus()
      }
    }

    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, close])

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    close()
  }, [close])

  const viewSource = useCallback(() => {
    window.open('https://github.com/parthawe/Portfolio.github.io', '_blank')
    close()
  }, [close])

  const go = useCallback((path: string) => {
    navigate(path)
    close()
  }, [navigate, close])

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.dataset.theme
    document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark')
    try { localStorage.setItem('theme', current === 'dark' ? 'light' : 'dark') } catch {}
    close()
  }, [close])

  const items: MenuItem[] = [
    { label: 'Copy Link', shortcut: '\u2318C', action: copyUrl },
    { label: 'View Source', shortcut: '\u2318U', action: viewSource },
    { label: 'divider', divider: true },
    { label: 'Home', shortcut: '\u23181', action: () => go('/') },
    { label: 'Work', shortcut: '\u23182', action: () => go('/work') },
    { label: 'About', shortcut: '\u23183', action: () => go('/about') },
    { label: 'divider', divider: true },
    { label: 'Zoom In', shortcut: '\u2318+', action: () => { dispatchZoomShortcut('='); close() } },
    { label: 'Zoom Out', shortcut: '\u2318\u2212', action: () => { dispatchZoomShortcut('-'); close() } },
    { label: 'Zoom to 100%', shortcut: '\u23180', action: () => { dispatchZoomShortcut('0'); close() } },
    { label: 'divider', divider: true },
    { label: 'Toggle Theme', shortcut: '\u2318D', action: toggleTheme },
    { label: 'React 19 + Three.js + Tailwind v4', shortcut: '' },
  ]

  if (!open) return null

  return (
    <div
      ref={menuRef}
      className="figma-ctx surface-glass surface-glass--strong"
      style={{ left: pos.x, top: pos.y }}
      role="menu"
      aria-label="Canvas context menu"
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="figma-ctx-divider" />
        ) : (
          <button
            key={i}
            className="figma-ctx-item"
            onClick={item.action}
            role="menuitem"
            disabled={!item.action}
          >
            <span>{item.label}</span>
            {item.shortcut && <span className="figma-ctx-shortcut">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  )
}
