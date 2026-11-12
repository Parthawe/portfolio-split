import { useState, useRef, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import StudioCanvas, { type ToolType, type StudioCanvasRef } from '../components/studio/StudioCanvas'
import StudioToolbar from '../components/studio/StudioToolbar'
import StudioMenuBar from '../components/studio/StudioMenuBar'
import StudioProperties from '../components/studio/StudioProperties'
import StudioStatusBar from '../components/studio/StudioStatusBar'
import { useStudioHistory } from '../hooks/useStudioHistory'
import '../styles/studio.css'

export default function StudioPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('select')
  const [selectedObject, setSelectedObject] = useState<any>(null)
  const [zoom, setZoom] = useState(1)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  const canvasCompRef = useRef<StudioCanvasRef>(null)

  // Proxy ref for history hook — synced via onModified callback instead of polling
  const canvasProxy = useRef<any>(null)

  const { save, undo, redo } = useStudioHistory(canvasProxy)

  // Mobile check
  useEffect(() => {
    setIsMobile(window.innerWidth < 900)
    const handler = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when editing text on canvas
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return
      if (target.closest('.upper-canvas')) return // Fabric text editing

      const ctrl = e.ctrlKey || e.metaKey

      // Tool shortcuts (single keys, no modifiers)
      if (!ctrl && !e.altKey && !e.shiftKey) {
        const toolMap: Record<string, ToolType> = {
          v: 'select', a: 'direct', t: 'text', r: 'rect',
          e: 'ellipse', l: 'line', p: 'pencil', h: 'hand',
          z: 'zoom', i: 'eyedropper',
        }
        if (toolMap[e.key.toLowerCase()]) {
          e.preventDefault()
          setActiveTool(toolMap[e.key.toLowerCase()])
          return
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          canvasCompRef.current?.deleteSelected()
          return
        }
        if (e.key === '=' || e.key === '+') {
          e.preventDefault()
          canvasCompRef.current?.zoomTo(Math.min(zoom * 1.25, 4))
          return
        }
        if (e.key === '-') {
          e.preventDefault()
          canvasCompRef.current?.zoomTo(Math.max(zoom / 1.25, 0.25))
          return
        }
      }

      // Ctrl shortcuts
      if (ctrl) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
        else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo() }
        else if (e.key === 'c') { e.preventDefault(); canvasCompRef.current?.copySelected() }
        else if (e.key === 'v') { e.preventDefault(); canvasCompRef.current?.pasteClipboard() }
        else if (e.key === 'x') { e.preventDefault(); canvasCompRef.current?.copySelected(); canvasCompRef.current?.deleteSelected() }
        else if (e.key === 'a') { e.preventDefault(); canvasCompRef.current?.selectAll() }
        else if (e.key === 'g' && !e.shiftKey) { e.preventDefault(); canvasCompRef.current?.groupSelected() }
        else if (e.key === 'g' && e.shiftKey) { e.preventDefault(); canvasCompRef.current?.ungroupSelected() }
        else if (e.key === ']') { e.preventDefault(); canvasCompRef.current?.bringForward() }
        else if (e.key === '[') { e.preventDefault(); canvasCompRef.current?.sendBackward() }
        else if (e.key === '0') { e.preventDefault(); canvasCompRef.current?.fitToScreen() }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [zoom, undo, redo])

  const handleModified = useCallback(() => {
    // Sync proxy ref on first modification (canvas is ready)
    if (!canvasProxy.current && canvasCompRef.current?.canvas) {
      canvasProxy.current = canvasCompRef.current.canvas
    }
    save()
  }, [save])
  const handleObjectsChange = useCallback(() => {}, [])
  const handleZoomFromCanvas = useCallback((z: number) => setZoom(z), [])
  const handleZoomFromStatus = useCallback((z: number) => {
    setZoom(z)
    canvasCompRef.current?.zoomTo(z)
  }, [])

  // Mobile fallback
  if (isMobile) {
    return (
      <div className="studio-mobile">
        <Helmet><title>Studio · Parth Pawar</title></Helmet>
        <main id="main-content" className="studio-mobile-inner">
          <h1>Design Studio</h1>
          <p>This interactive editor works best on a desktop screen.</p>
          <p>Grab a bigger screen for the full Illustrator-like experience.</p>
          <Link to="/work" className="studio-mobile-link">Browse work instead →</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="studio-page">
      <Helmet>
        <title>Studio · Parth Pawar</title>
        <meta name="description" content="Interactive design studio — a fully functional canvas editor pre-loaded with portfolio content." />
      </Helmet>

      <h1 className="sr-only">Design Studio</h1>

      {/* Menu Bar */}
      <StudioMenuBar canvasRef={canvasCompRef} onUndo={undo} onRedo={redo} />

      {/* Main area */}
      <main id="main-content" className="studio-main">
        {/* Left toolbar */}
        <StudioToolbar activeTool={activeTool} onToolChange={setActiveTool} />

        {/* Canvas */}
        <StudioCanvas
          ref={canvasCompRef}
          activeTool={activeTool}
          onSelectionChange={setSelectedObject}
          onZoomChange={handleZoomFromCanvas}
          onCoordsChange={(x, y) => setCoords({ x, y })}
          onModified={handleModified}
          onObjectsChange={handleObjectsChange}
        />

        {/* Right properties */}
        <StudioProperties
          canvas={canvasCompRef.current?.canvas || null}
          selectedObject={selectedObject}
        />
      </main>

      {/* Status Bar */}
      <StudioStatusBar
        activeTool={activeTool}
        zoom={zoom}
        coords={coords}
        onZoomChange={handleZoomFromStatus}
        onFit={() => canvasCompRef.current?.fitToScreen()}
      />
    </div>
  )
}
