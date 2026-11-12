import type { ToolType } from './StudioCanvas'

interface Props {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
}

const tools: { id: ToolType; key: string; label: string; icon: string }[] = [
  { id: 'select', key: 'V', label: 'Selection', icon: 'M4 2L14 8L8 10L6 16L4 2Z' },
  { id: 'direct', key: 'A', label: 'Direct Selection', icon: 'M4 4L14 8L8 10L6 16L4 4Z' },
  { id: 'text', key: 'T', label: 'Type', icon: '' },
  { id: 'rect', key: 'R', label: 'Rectangle', icon: '' },
  { id: 'ellipse', key: 'E', label: 'Ellipse', icon: '' },
  { id: 'line', key: 'L', label: 'Line', icon: '' },
  { id: 'pencil', key: 'P', label: 'Pencil', icon: '' },
  { id: 'hand', key: 'H', label: 'Hand', icon: '' },
  { id: 'zoom', key: 'Z', label: 'Zoom', icon: '' },
  { id: 'eyedropper', key: 'I', label: 'Eyedropper', icon: '' },
]

function ToolIcon({ tool }: { tool: typeof tools[0] }) {
  const s = 16
  switch (tool.id) {
    case 'select':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 1L13 7L7 9L5 15L3 1Z" fill="currentColor" /></svg>
    case 'direct':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 1L13 7L7 9L5 15L3 1Z" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
    case 'text':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><text x="3" y="13" fontSize="14" fontWeight="bold" fill="currentColor">T</text></svg>
    case 'rect':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" stroke="currentColor" strokeWidth="1.5" rx="1" /></svg>
    case 'ellipse':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="8" rx="6" ry="5" stroke="currentColor" strokeWidth="1.5" /></svg>
    case 'line':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" /></svg>
    case 'pencil':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M11 2L14 5L6 13H3V10L11 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
    case 'hand':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2V10M5 4V10M11 4V10M3 7V11C3 13.2 4.8 15 7 15H9C11.2 15 13 13.2 13 11V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
    case 'zoom':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" /><line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" /></svg>
    case 'eyedropper':
      return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M13 3L10 6L6 10L3 13M10 6L12 4M6 10L4 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
    default:
      return null
  }
}

export default function StudioToolbar({ activeTool, onToolChange }: Props) {
  return (
    <div className="studio-toolbar">
      {tools.map((tool, i) => (
        <div key={tool.id}>
          {i === 2 && <div className="studio-toolbar-sep" />}
          {i === 7 && <div className="studio-toolbar-sep" />}
          <button
            className={`studio-tool ${activeTool === tool.id ? 'studio-tool--active' : ''}`}
            onClick={() => onToolChange(tool.id)}
            title={`${tool.label} (${tool.key})`}
            type="button"
          >
            <ToolIcon tool={tool} />
          </button>
        </div>
      ))}
    </div>
  )
}
