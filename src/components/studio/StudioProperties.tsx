import { useState, useEffect, useCallback } from 'react'
import type { Canvas, FabricObject } from 'fabric'

type StudioObject = FabricObject & {
  name?: string
  fill?: string | null
  stroke?: string | null
  strokeWidth?: number
  fontSize?: number
  fontWeight?: string | number
  fontFamily?: string
}

interface Props {
  canvas: Canvas | null
  selectedObject: FabricObject | null
}

export default function StudioProperties({ canvas, selectedObject }: Props) {
  const [tab, setTab] = useState<'properties' | 'layers'>('properties')
  const [objects, setObjects] = useState<FabricObject[]>([])
  const [, setTick] = useState(0)

  // Refresh object list
  const refreshObjects = useCallback(() => {
    if (!canvas) return
    setObjects([...canvas.getObjects()].reverse().filter(o => o.selectable !== false))
  }, [canvas])

  useEffect(() => { refreshObjects() }, [refreshObjects, selectedObject])

  // Force re-render when properties change
  useEffect(() => {
    if (!canvas) return
    const update = () => setTick(t => t + 1)
    canvas.on('object:modified', update)
    canvas.on('object:scaling', update)
    canvas.on('object:moving', update)
    canvas.on('object:rotating', update)
    return () => {
      canvas.off('object:modified', update)
      canvas.off('object:scaling', update)
      canvas.off('object:moving', update)
      canvas.off('object:rotating', update)
    }
  }, [canvas])

  const setProp = (key: string, value: string | number | boolean) => {
    if (!selectedObject || !canvas) return
    selectedObject.set(key, value)
    canvas.renderAll()
  }

  const obj = selectedObject as StudioObject | null
  const fillValue = typeof obj?.fill === 'string' ? obj.fill : '#000000'
  const strokeValue = typeof obj?.stroke === 'string' ? obj.stroke : '#000000'
  const isTextObject = obj?.type === 'i-text' || obj?.type === 'text' || obj?.type === 'textbox'

  return (
    <div className="studio-properties">
      {/* Tab bar */}
      <div className="studio-props-tabs">
        <button className={`studio-props-tab ${tab === 'properties' ? 'active' : ''}`} onClick={() => setTab('properties')} type="button">Properties</button>
        <button className={`studio-props-tab ${tab === 'layers' ? 'active' : ''}`} onClick={() => { setTab('layers'); refreshObjects() }} type="button">Layers</button>
      </div>

      {tab === 'properties' && (
        <div className="studio-props-content">
          {obj ? (
            <>
              {/* Object name */}
              <div className="studio-props-section">
                <div className="studio-props-label">{obj.name || obj.type}</div>
              </div>

              {/* Transform */}
              <div className="studio-props-section">
                <div className="studio-props-title">Transform</div>
                <div className="studio-props-grid">
                  <label>X <input type="number" value={Math.round(obj.left || 0)} onChange={e => setProp('left', +e.target.value)} /></label>
                  <label>Y <input type="number" value={Math.round(obj.top || 0)} onChange={e => setProp('top', +e.target.value)} /></label>
                  <label>W <input type="number" value={Math.round((obj.width || 0) * (obj.scaleX || 1))} onChange={e => { setProp('scaleX', +e.target.value / (obj.width || 1)) }} /></label>
                  <label>H <input type="number" value={Math.round((obj.height || 0) * (obj.scaleY || 1))} onChange={e => { setProp('scaleY', +e.target.value / (obj.height || 1)) }} /></label>
                  <label>R° <input type="number" value={Math.round(obj.angle || 0)} onChange={e => setProp('angle', +e.target.value)} /></label>
                  <label>α <input type="number" value={Math.round((obj.opacity || 1) * 100)} min={0} max={100} onChange={e => setProp('opacity', +e.target.value / 100)} /></label>
                </div>
              </div>

              {/* Fill & Stroke */}
              <div className="studio-props-section">
                <div className="studio-props-title">Appearance</div>
                <div className="studio-props-row">
                  <span>Fill</span>
                  <input type="color" value={fillValue} onChange={e => setProp('fill', e.target.value)} />
                  <input type="text" className="studio-props-hex" value={fillValue} onChange={e => setProp('fill', e.target.value)} />
                </div>
                <div className="studio-props-row">
                  <span>Stroke</span>
                  <input type="color" value={strokeValue} onChange={e => setProp('stroke', e.target.value)} />
                  <input type="number" className="studio-props-small" value={obj.strokeWidth || 0} min={0} onChange={e => setProp('strokeWidth', +e.target.value)} />
                </div>
              </div>

              {/* Text properties */}
              {isTextObject && (
                <div className="studio-props-section">
                  <div className="studio-props-title">Text</div>
                  <div className="studio-props-row">
                    <span>Size</span>
                    <input type="number" value={obj.fontSize || 16} min={1} onChange={e => setProp('fontSize', +e.target.value)} />
                  </div>
                  <div className="studio-props-row">
                    <span>Weight</span>
                    <select value={obj.fontWeight || 'normal'} onChange={e => setProp('fontWeight', e.target.value)}>
                      <option value="normal">Regular</option>
                      <option value="bold">Bold</option>
                      <option value="300">Light</option>
                    </select>
                  </div>
                  <div className="studio-props-row">
                    <span>Font</span>
                    <select value={obj.fontFamily || 'General Sans, Nikolas'} onChange={e => setProp('fontFamily', e.target.value)}>
                      <option value="General Sans, Nikolas">General Sans</option>
                      <option value="Nikolas, General Sans">Nikolas</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="studio-props-empty">
              <p>Select an object to see properties</p>
            </div>
          )}
        </div>
      )}

      {tab === 'layers' && (
        <div className="studio-props-content studio-layers">
          {objects.length === 0 && <div className="studio-props-empty"><p>No objects</p></div>}
          {objects.map((o, i) => (
            <button
              key={i}
              className={`studio-layer ${canvas?.getActiveObject() === o ? 'studio-layer--active' : ''}`}
              onClick={() => { canvas?.setActiveObject(o); canvas?.renderAll() }}
              type="button"
            >
              <span className="studio-layer-icon">
                {o.type === 'i-text' || o.type === 'text' ? 'T' : o.type === 'rect' ? '□' : o.type === 'ellipse' ? '○' : o.type === 'line' ? '/' : o.type === 'image' ? '◻' : o.type === 'group' ? '⊞' : '◆'}
              </span>
              <span className="studio-layer-name">{(o as any).name || o.type}</span>
              <button
                className="studio-layer-vis"
                onClick={(e) => { e.stopPropagation(); o.set('visible', !o.visible); canvas?.renderAll(); refreshObjects() }}
                type="button"
                title={o.visible !== false ? 'Hide' : 'Show'}
              >
                {o.visible !== false ? '👁' : '·'}
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
