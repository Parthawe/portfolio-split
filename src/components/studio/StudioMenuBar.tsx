import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { StudioCanvasRef } from './StudioCanvas'

interface Props {
  canvasRef: React.RefObject<StudioCanvasRef | null>
  onUndo: () => void
  onRedo: () => void
}

interface MenuItem { label: string; shortcut?: string; action?: () => void; separator?: boolean }

export default function StudioMenuBar({ canvasRef, onUndo, onRedo }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const c = () => canvasRef.current

  const menus: Record<string, MenuItem[]> = {
    File: [
      { label: 'New Canvas', action: () => { c()?.canvas?.clear(); c()?.canvas?.set('backgroundColor', '#3D3D3D') } },
      { separator: true, label: '' },
      { label: 'Export PNG', shortcut: '⌘⇧E', action: () => c()?.exportPNG() },
      { label: 'Export SVG', action: () => c()?.exportSVG() },
    ],
    Edit: [
      { label: 'Undo', shortcut: '⌘Z', action: onUndo },
      { label: 'Redo', shortcut: '⌘⇧Z', action: onRedo },
      { separator: true, label: '' },
      { label: 'Cut', shortcut: '⌘X', action: () => { c()?.copySelected(); c()?.deleteSelected() } },
      { label: 'Copy', shortcut: '⌘C', action: () => c()?.copySelected() },
      { label: 'Paste', shortcut: '⌘V', action: () => c()?.pasteClipboard() },
      { label: 'Delete', shortcut: 'Del', action: () => c()?.deleteSelected() },
      { separator: true, label: '' },
      { label: 'Select All', shortcut: '⌘A', action: () => c()?.selectAll() },
    ],
    Object: [
      { label: 'Group', shortcut: '⌘G', action: () => c()?.groupSelected() },
      { label: 'Ungroup', shortcut: '⌘⇧G', action: () => c()?.ungroupSelected() },
      { separator: true, label: '' },
      { label: 'Bring Forward', shortcut: '⌘]', action: () => c()?.bringForward() },
      { label: 'Send Backward', shortcut: '⌘[', action: () => c()?.sendBackward() },
    ],
    View: [
      { label: 'Zoom In', shortcut: '⌘+', action: () => { const z = c()?.canvas?.getZoom() || 1; c()?.zoomTo(Math.min(z * 1.25, 4)) } },
      { label: 'Zoom Out', shortcut: '⌘-', action: () => { const z = c()?.canvas?.getZoom() || 1; c()?.zoomTo(Math.max(z / 1.25, 0.25)) } },
      { label: 'Fit to Screen', shortcut: '⌘0', action: () => c()?.fitToScreen() },
      { separator: true, label: '' },
      { label: 'Toggle Grid', shortcut: '⌘\'', action: () => c()?.toggleGrid() },
    ],
  }

  return (
    <div className="studio-menubar" ref={barRef}>
      <div className="studio-menu-logo">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect width="16" height="16" rx="3" fill="#E85D26" />
          <text x="3" y="12" fontSize="10" fontWeight="bold" fill="#fff">P</text>
        </svg>
      </div>
      {Object.entries(menus).map(([name, items]) => (
        <div key={name} className="studio-menu-group">
          <button
            className={`studio-menu-trigger ${openMenu === name ? 'studio-menu-trigger--open' : ''}`}
            onMouseEnter={() => { if (openMenu) setOpenMenu(name) }}
            onClick={() => setOpenMenu(openMenu === name ? null : name)}
            type="button"
          >
            {name}
          </button>
          {openMenu === name && (
            <div className="studio-menu-dropdown">
              {items.map((item, i) =>
                item.separator ? (
                  <div key={i} className="studio-menu-sep" />
                ) : (
                  <button
                    key={item.label}
                    className="studio-menu-item"
                    onClick={() => { item.action?.(); setOpenMenu(null) }}
                    type="button"
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <span className="studio-menu-shortcut">{item.shortcut}</span>}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
      <Link className="studio-menu-trigger" to="/after-hours">After hours</Link>
    </div>
  )
}
