import PortfolioSlider from '../PortfolioSlider'
import type { ToolType } from './StudioCanvas'

interface Props {
  activeTool: ToolType
  zoom: number
  coords: { x: number; y: number }
  onZoomChange: (zoom: number) => void
  onFit: () => void
}

const toolNames: Record<ToolType, string> = {
  select: 'Selection Tool',
  direct: 'Direct Selection',
  text: 'Type Tool',
  rect: 'Rectangle Tool',
  ellipse: 'Ellipse Tool',
  line: 'Line Tool',
  pencil: 'Pencil Tool',
  hand: 'Hand Tool',
  zoom: 'Zoom Tool',
  eyedropper: 'Eyedropper',
}

export default function StudioStatusBar({ activeTool, zoom, coords, onZoomChange, onFit }: Props) {
  const pct = Math.round(zoom * 100)

  return (
    <div className="studio-statusbar">
      <div className="studio-status-left">
        <span className="studio-status-tool">{toolNames[activeTool]}</span>
        <span className="studio-status-coords">X: {coords.x}  Y: {coords.y}</span>
      </div>
      <div className="studio-status-right">
        <button className="studio-status-btn" onClick={() => onZoomChange(Math.max(zoom / 1.25, 0.25))} type="button" title="Zoom out">−</button>
        <PortfolioSlider
          type="range"
          className="studio-status-slider" aria-label="Canvas zoom"
          min={25} max={400} value={pct}
          onChange={e => onZoomChange(+e.target.value / 100)}
        />
        <button className="studio-status-btn" onClick={() => onZoomChange(Math.min(zoom * 1.25, 4))} type="button" title="Zoom in">+</button>
        <span className="studio-status-pct">{pct}%</span>
        <button className="studio-status-btn studio-status-fit" onClick={onFit} type="button" title="Fit to screen">Fit</button>
      </div>
    </div>
  )
}
