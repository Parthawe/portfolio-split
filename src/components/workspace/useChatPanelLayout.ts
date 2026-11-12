import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type Dock = 'left' | 'right' | 'floating'
type Layout = { dock: Dock; width: number; height: number; x: number; y: number; textSize: number }
const KEY = 'portfolio-chat-layout-v1'
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const defaults = (): Layout => ({ dock: 'left', width: clamp(innerWidth * .28, 300, 390), height: Math.min(620, innerHeight - 32), x: 24, y: 100, textSize: 15 })
function fit(value: Layout): Layout {
  const maxWidth = Math.max(260, Math.min(720, innerWidth >= 900 && value.dock !== 'floating' ? innerWidth * .48 : innerWidth - 16))
  const width = clamp(value.width, Math.min(300, maxWidth), maxWidth)
  const height = clamp(value.height, Math.min(260, innerHeight - 16), innerHeight - 16)
  return { ...value, width, height, x: clamp(value.x, 8, Math.max(8, innerWidth - width - 8)), y: clamp(value.y, 8, Math.max(8, innerHeight - height - 8)), textSize: clamp(value.textSize, 14, 19) }
}
function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (saved && ['left', 'right', 'floating'].includes(saved.dock) && ['width', 'height', 'x', 'y', 'textSize'].every(key => Number.isFinite(saved[key]))) return fit(saved as Layout)
  } catch { /* Optional preference storage. */ }
  return defaults()
}
export function useChatPanelLayout() {
  const [layout, setLayout] = useState<Layout>(restore)
  const [mobileHeight, setMobileHeight] = useState<number | null>(null)
  const drag = useRef<{ kind: 'move' | 'resize'; x: number; y: number; frame: Layout; mobile: boolean } | null>(null)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(layout)) } catch { /* The controls work without storage. */ }
  }, [layout])
  useEffect(() => {
    const resize = () => { setLayout(value => fit(value)); setMobileHeight(value => value === null ? null : clamp(value, Math.min(260, innerHeight - 16), innerHeight * .8)) }
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  const dock = useCallback((value: Dock) => setLayout(current => fit({ ...current, dock: value })), [])
  const reset = () => { setLayout(defaults()); setMobileHeight(null) }
  const resizeWidth = (delta: number) => setLayout(current => fit({ ...current, width: current.width + delta }))
  const resizeHeight = (delta: number) => {
    if (innerWidth < 600) setMobileHeight(value => clamp((value ?? Math.min(560, innerHeight * .56)) + delta, Math.min(260, innerHeight - 16), innerHeight * .8))
    else setLayout(value => fit({ ...value, height: value.height + delta }))
  }
  const textSize = (delta: number) => setLayout(value => fit({ ...value, textSize: value.textSize + delta }))
  const start = (event: ReactPointerEvent<HTMLElement>, kind: 'move' | 'resize') => {
    if (event.button !== 0 || (kind === 'move' && ((event.target as HTMLElement).closest('button, a, input, select') || innerWidth < 600))) return
    const panel = event.currentTarget.closest('.portfolio-chat-panel') as HTMLElement | null
    if (!panel) return
    event.preventDefault()
    const rect = panel.getBoundingClientRect(), mobile = innerWidth < 600
    const frame = fit({ ...layout, x: rect.x, y: rect.y, width: rect.width, height: rect.height, dock: kind === 'move' ? 'floating' : layout.dock })
    drag.current = { kind, x: event.clientX, y: event.clientY, frame, mobile }
    if (kind === 'move') setLayout(frame)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const move = (event: ReactPointerEvent<HTMLElement>) => {
    const active = drag.current
    if (!active) return
    const dx = event.clientX - active.x, dy = event.clientY - active.y
    if (active.kind === 'move') setLayout(fit({ ...active.frame, x: active.frame.x + dx, y: active.frame.y + dy }))
    else if (active.mobile) setMobileHeight(clamp(active.frame.height - dy, Math.min(260, innerHeight - 16), innerHeight * .8))
    else setLayout(fit({ ...active.frame, width: active.frame.width + dx * (active.frame.dock === 'right' ? -1 : 1), height: active.frame.dock === 'floating' ? active.frame.height + dy : active.frame.height }))
  }
  const stop = () => { drag.current = null }
  return { layout, mobileHeight, dock, reset, resizeWidth, resizeHeight, textSize, moveBy: (x: number, y: number) => setLayout(value => fit({ ...value, dock: 'floating', x: value.x + x, y: value.y + y })), drag: { onPointerDown: (event: ReactPointerEvent<HTMLElement>) => start(event, 'move'), onPointerMove: move, onPointerUp: stop, onPointerCancel: stop, onLostPointerCapture: stop }, resize: { onPointerDown: (event: ReactPointerEvent<HTMLElement>) => start(event, 'resize'), onPointerMove: move, onPointerUp: stop, onPointerCancel: stop, onLostPointerCapture: stop } }
}
