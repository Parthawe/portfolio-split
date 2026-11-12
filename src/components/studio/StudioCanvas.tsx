import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Canvas, IText, Rect, Ellipse, Line, PencilBrush, FabricImage, Group, FabricText, ActiveSelection, Point, type FabricObject, type TPointerEventInfo, type TPointerEvent } from 'fabric'

export type ToolType = 'select' | 'direct' | 'text' | 'rect' | 'ellipse' | 'line' | 'pencil' | 'hand' | 'zoom' | 'eyedropper'

interface Props {
  activeTool: ToolType
  onSelectionChange: (obj: FabricObject | null) => void
  onZoomChange: (zoom: number) => void
  onCoordsChange: (x: number, y: number) => void
  onModified: () => void
  onObjectsChange: () => void
}

export interface StudioCanvasRef {
  canvas: Canvas | null
  exportPNG: () => void
  exportSVG: () => void
  fitToScreen: () => void
  zoomTo: (level: number) => void
  deleteSelected: () => void
  selectAll: () => void
  groupSelected: () => void
  ungroupSelected: () => void
  bringForward: () => void
  sendBackward: () => void
  toggleGrid: () => void
  copySelected: () => void
  pasteClipboard: () => void
}

const ACCENT = '#E85D26'
const ARTBOARD_W = 960
const ARTBOARD_H = 640

const StudioCanvas = forwardRef<StudioCanvasRef, Props>(
  ({ activeTool, onSelectionChange, onZoomChange, onCoordsChange, onModified, onObjectsChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<Canvas | null>(null)
    const isPanning = useRef(false)
    const lastPan = useRef({ x: 0, y: 0 })
    const clipboard = useRef<FabricObject | null>(null)
    const gridVisible = useRef(false)
    const gridObjects = useRef<FabricObject[]>([])
    const drawStart = useRef<{ x: number; y: number } | null>(null)
    const drawObj = useRef<FabricObject | null>(null)

    // ── Initialize canvas ──────────────────────────────
    useEffect(() => {
      const el = containerRef.current
      if (!el || canvasRef.current) return

      const canvasEl = document.createElement('canvas')
      canvasEl.id = 'studio-canvas'
      el.appendChild(canvasEl)

      const c = new Canvas(canvasEl, {
        width: el.clientWidth,
        height: el.clientHeight,
        backgroundColor: '#3D3D3D',
        selection: true,
        preserveObjectStacking: true,
      })
      canvasRef.current = c

      // Artboard
      const artboard = new Rect({
        left: (el.clientWidth - ARTBOARD_W) / 2,
        top: (el.clientHeight - ARTBOARD_H) / 2,
        width: ARTBOARD_W, height: ARTBOARD_H,
        fill: '#FFFFFF', selectable: false, evented: false,
      })
      c.add(artboard)

      const ox = artboard.left!
      const oy = artboard.top!

      // "portfolio" main text
      c.add(new IText('portfolio', {
        left: ox + 80, top: oy + 200, fontSize: 110,
        fontFamily: 'General Sans, Nikolas', fontWeight: 'bold',
        fill: '#1A1A1A',
      }))

      // Accent "f"
      c.add(new IText('f', {
        left: ox + 270, top: oy + 150, fontSize: 180,
        fontFamily: 'Nikolas, General Sans', fontStyle: 'italic',
        fill: ACCENT, opacity: 0.85,
      }))

      // Ai logo
      c.add(new Rect({ left: ox + 60, top: oy + 100, width: 36, height: 36, rx: 4, ry: 4, fill: '#330000' }))
      c.add(new FabricText('Ai', { left: ox + 66, top: oy + 106, fontSize: 18, fontFamily: 'Nikolas, General Sans', fill: '#FF9A00' }))

      // Ps logo
      c.add(new Rect({ left: ox + 106, top: oy + 100, width: 36, height: 36, rx: 4, ry: 4, fill: '#001E36' }))
      c.add(new FabricText('Ps', { left: ox + 112, top: oy + 106, fontSize: 18, fontFamily: 'Nikolas, General Sans', fill: '#31A8FF' }))

      // #25 accent
      c.add(new IText('#25', {
        left: ox + ARTBOARD_W - 120, top: oy + 100, fontSize: 48,
        fontFamily: 'General Sans, Nikolas', fontWeight: 'bold', fill: ACCENT,
      }))

      // Bezier line + pen icon
      c.add(new Line([ox + 250, oy + 100, ox + 350, oy + 130], { stroke: '#1A1A1A', strokeWidth: 2 }))
      c.add(new Rect({ left: ox + 340, top: oy + 80, width: 16, height: 24, angle: 15, fill: '#1A1A1A' }))

      // Color swatches
      ;['#1A1A1A', '#666666', '#999999', ACCENT].forEach((color, i) => {
        c.add(new Rect({
          left: ox + 200 + i * 30, top: oy + 420,
          width: 24, height: 24, fill: color, stroke: '#CCC', strokeWidth: 0.5,
        }))
      })

      // Labels
      c.add(new FabricText('COLOR\nPALETTE', { left: ox + 180, top: oy + 390, fontSize: 7, fontFamily: 'General Sans, Nikolas', fill: '#888' }))
      c.add(new FabricText('NIKOLAS\nGENERAL SANS', { left: ox + 60, top: oy + 390, fontSize: 9, fontFamily: 'General Sans, Nikolas', fill: '#333' }))

      // "Graphics Designer"
      c.add(new IText('Graphics\nDesigner', { left: ox + 500, top: oy + 380, fontSize: 32, fontFamily: 'Nikolas, General Sans', fontStyle: 'italic', fill: '#333' }))

      // Label
      c.add(new FabricText('NHANDIGIER', { left: ox + 700, top: oy + 400, fontSize: 11, fontFamily: 'General Sans, Nikolas', fontWeight: 'bold', fill: '#333' }))

      // Selection rectangles (decorative)
      c.add(new Rect({ left: ox + 460, top: oy + 170, width: 180, height: 220, fill: 'transparent', stroke: ACCENT, strokeWidth: 1, strokeDashArray: [4, 3] }))
      c.add(new Rect({ left: ox + 60, top: oy + 290, width: 140, height: 80, fill: 'transparent', stroke: '#4A90D9', strokeWidth: 1, strokeDashArray: [4, 3] }))

      // Cursor icon
      c.add(new Rect({ left: ox + 80, top: oy + 330, width: 14, height: 14, angle: 45, fill: ACCENT }))

      // Load images
      ;['/Assets/images/mentra.webp', '/Assets/images/nda-cover.svg'].forEach((path, i) => {
        const imgEl = new Image()
        imgEl.crossOrigin = 'anonymous'
        imgEl.onload = () => {
          const fImg = new FabricImage(imgEl, {
            left: ox + 650 + i * 100, top: oy + 450,
            scaleX: 60 / imgEl.width, scaleY: 60 / imgEl.height,
          })
          c.add(fImg)
          c.renderAll()
        }
        imgEl.src = path
      })

      // Events
      c.on('selection:created', (e) => onSelectionChange(e.selected?.[0] || null))
      c.on('selection:updated', (e) => onSelectionChange(e.selected?.[0] || null))
      c.on('selection:cleared', () => onSelectionChange(null))
      c.on('object:modified', () => { onModified(); onObjectsChange() })
      c.on('object:added', () => onObjectsChange())
      c.on('object:removed', () => onObjectsChange())
      c.on('mouse:move', (e) => {
        const pointer = c.getScenePoint(e.e)
        onCoordsChange(Math.round(pointer.x - ox), Math.round(pointer.y - oy))
      })

      // Zoom with Ctrl+scroll
      c.on('mouse:wheel', (opt) => {
        const e = opt.e as WheelEvent
        if (!e.ctrlKey && !e.metaKey) return
        e.preventDefault()
        let zoom = c.getZoom() * (0.999 ** e.deltaY)
        zoom = Math.min(Math.max(zoom, 0.25), 4)
        c.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom)
        onZoomChange(zoom)
      })

      // Resize
      const handleResize = () => { if (el) c.setDimensions({ width: el.clientWidth, height: el.clientHeight }) }
      window.addEventListener('resize', handleResize)

      setTimeout(() => onModified(), 100)

      return () => {
        window.removeEventListener('resize', handleResize)
        c.dispose()
        canvasRef.current = null
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Tool switching ─────────────────────────────────
    useEffect(() => {
      const c = canvasRef.current
      if (!c) return
      c.isDrawingMode = false
      c.selection = true
      c.defaultCursor = 'default'
      c.hoverCursor = 'move'
      drawStart.current = null
      drawObj.current = null

      switch (activeTool) {
        case 'select': case 'direct': c.selection = true; break
        case 'pencil':
          c.isDrawingMode = true
          c.freeDrawingBrush = new PencilBrush(c)
          c.freeDrawingBrush.width = 2
          c.freeDrawingBrush.color = '#1A1A1A'
          break
        case 'hand': c.selection = false; c.defaultCursor = 'grab'; c.hoverCursor = 'grab'; break
        case 'zoom': c.selection = false; c.defaultCursor = 'zoom-in'; c.hoverCursor = 'zoom-in'; break
        case 'text': c.selection = false; c.defaultCursor = 'text'; c.hoverCursor = 'text'; break
        case 'rect': case 'ellipse': case 'line':
          c.selection = false; c.defaultCursor = 'crosshair'; c.hoverCursor = 'crosshair'; break
        case 'eyedropper':
          c.selection = false; c.defaultCursor = 'crosshair'; c.hoverCursor = 'crosshair'; break
      }
    }, [activeTool])

    // ── Drawing tools ──────────────────────────────────
    useEffect(() => {
      const c = canvasRef.current
      if (!c) return
      if (!['rect', 'ellipse', 'line', 'text', 'hand', 'zoom', 'eyedropper'].includes(activeTool)) return

      const onDown = (opt: TPointerEventInfo<TPointerEvent>) => {
        const { x, y } = opt.scenePoint || { x: 0, y: 0 }

        if (activeTool === 'hand') {
          isPanning.current = true
          lastPan.current = { x: (opt.e as MouseEvent).clientX, y: (opt.e as MouseEvent).clientY }
          c.defaultCursor = 'grabbing'
          return
        }
        if (activeTool === 'zoom') {
          const e = opt.e as MouseEvent
          let zoom = c.getZoom()
          zoom = e.altKey ? zoom / 1.3 : zoom * 1.3
          zoom = Math.min(Math.max(zoom, 0.25), 4)
          c.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom)
          onZoomChange(zoom)
          return
        }
        if (activeTool === 'text') {
          const text = new IText('Type here', {
            left: x, top: y, fontSize: 24,
            fontFamily: 'General Sans, Nikolas', fill: '#1A1A1A',
          })
          c.add(text)
          c.setActiveObject(text)
          text.enterEditing()
          onModified()
          return
        }
        if (activeTool === 'eyedropper') {
          const ctx = c.getContext()
          const pixel = ctx.getImageData(x * c.getZoom(), y * c.getZoom(), 1, 1).data
          const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('')
          navigator.clipboard?.writeText(hex)
          return
        }

        drawStart.current = { x, y }
        if (activeTool === 'rect') {
          const obj = new Rect({ left: x, top: y, width: 0, height: 0, fill: ACCENT, opacity: 0.7 })
          c.add(obj); drawObj.current = obj
        } else if (activeTool === 'ellipse') {
          const obj = new Ellipse({ left: x, top: y, rx: 0, ry: 0, fill: ACCENT, opacity: 0.7 })
          c.add(obj); drawObj.current = obj
        } else if (activeTool === 'line') {
          const obj = new Line([x, y, x, y], { stroke: '#1A1A1A', strokeWidth: 2 })
          c.add(obj); drawObj.current = obj
        }
      }

      const onMove = (opt: TPointerEventInfo<TPointerEvent>) => {
        if (activeTool === 'hand' && isPanning.current) {
          const e = opt.e as MouseEvent
          const vpt = c.viewportTransform!
          vpt[4] += e.clientX - lastPan.current.x
          vpt[5] += e.clientY - lastPan.current.y
          lastPan.current = { x: e.clientX, y: e.clientY }
          c.requestRenderAll()
          return
        }
        if (!drawStart.current || !drawObj.current) return
        const { x, y } = opt.scenePoint || { x: 0, y: 0 }
        const s = drawStart.current
        if (activeTool === 'rect') {
          (drawObj.current as InstanceType<typeof Rect>).set({ left: Math.min(s.x, x), top: Math.min(s.y, y), width: Math.abs(x - s.x), height: Math.abs(y - s.y) })
        } else if (activeTool === 'ellipse') {
          (drawObj.current as InstanceType<typeof Ellipse>).set({ left: Math.min(s.x, x), top: Math.min(s.y, y), rx: Math.abs(x - s.x) / 2, ry: Math.abs(y - s.y) / 2 })
        } else if (activeTool === 'line') {
          (drawObj.current as InstanceType<typeof Line>).set({ x2: x, y2: y })
        }
        c.renderAll()
      }

      const onUp = () => {
        if (activeTool === 'hand') { isPanning.current = false; c.defaultCursor = 'grab'; return }
        if (drawObj.current) { c.setActiveObject(drawObj.current); onModified() }
        drawStart.current = null; drawObj.current = null
      }

      c.on('mouse:down', onDown)
      c.on('mouse:move', onMove)
      c.on('mouse:up', onUp)
      return () => { c.off('mouse:down', onDown); c.off('mouse:move', onMove); c.off('mouse:up', onUp) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool])

    // ── Space for temporary hand ───────────────────────
    useEffect(() => {
      const c = canvasRef.current
      if (!c) return
      let wasSelection = true

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat && activeTool !== 'hand') {
          e.preventDefault()
          wasSelection = c.selection
          c.selection = false
          c.defaultCursor = 'grab'
          isPanning.current = false

          const pd = (opt: TPointerEventInfo<TPointerEvent>) => { isPanning.current = true; lastPan.current = { x: (opt.e as MouseEvent).clientX, y: (opt.e as MouseEvent).clientY }; c.defaultCursor = 'grabbing' }
          const pm = (opt: TPointerEventInfo<TPointerEvent>) => { if (!isPanning.current) return; const me = opt.e as MouseEvent; const vpt = c.viewportTransform!; vpt[4] += me.clientX - lastPan.current.x; vpt[5] += me.clientY - lastPan.current.y; lastPan.current = { x: me.clientX, y: me.clientY }; c.requestRenderAll() }
          const pu = () => { isPanning.current = false; c.defaultCursor = 'grab' }
          c.on('mouse:down', pd); c.on('mouse:move', pm); c.on('mouse:up', pu)

          const cleanup = (ev: KeyboardEvent) => {
            if (ev.code === 'Space') { c.off('mouse:down', pd); c.off('mouse:move', pm); c.off('mouse:up', pu); c.selection = wasSelection; c.defaultCursor = 'default'; isPanning.current = false; window.removeEventListener('keyup', cleanup) }
          }
          window.addEventListener('keyup', cleanup)
        }
      }
      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    }, [activeTool])

    // ── Imperative methods ─────────────────────────────
    const deleteSelected = useCallback(() => {
      const c = canvasRef.current
      if (!c) return
      c.getActiveObjects().forEach(o => c.remove(o))
      c.discardActiveObject()
      onModified()
    }, [onModified])

    useImperativeHandle(ref, () => ({
      canvas: canvasRef.current,
      exportPNG: () => {
        const c = canvasRef.current; if (!c) return
        const url = c.toDataURL({ format: 'png', multiplier: 2 })
        const a = document.createElement('a'); a.download = 'studio.png'; a.href = url; a.click()
      },
      exportSVG: () => {
        const c = canvasRef.current; if (!c) return
        const blob = new Blob([c.toSVG()], { type: 'image/svg+xml' })
        const a = document.createElement('a'); a.download = 'studio.svg'; a.href = URL.createObjectURL(blob); a.click()
      },
      fitToScreen: () => {
        const c = canvasRef.current; const el = containerRef.current; if (!c || !el) return
        const z = Math.min(el.clientWidth / (ARTBOARD_W + 100), el.clientHeight / (ARTBOARD_H + 100))
        c.setViewportTransform([z, 0, 0, z, (el.clientWidth - ARTBOARD_W * z) / 2, (el.clientHeight - ARTBOARD_H * z) / 2])
        onZoomChange(z)
      },
      zoomTo: (level: number) => {
        const c = canvasRef.current; const el = containerRef.current; if (!c || !el) return
        c.zoomToPoint(new Point(el.clientWidth / 2, el.clientHeight / 2), level)
        onZoomChange(level)
      },
      deleteSelected,
      selectAll: () => {
        const c = canvasRef.current; if (!c) return
        const objs = c.getObjects().filter(o => o.selectable)
        if (objs.length > 1) c.setActiveObject(new ActiveSelection(objs, { canvas: c }))
        else if (objs.length === 1) c.setActiveObject(objs[0])
        c.renderAll()
      },
      groupSelected: () => {
        const c = canvasRef.current; if (!c) return
        const active = c.getActiveObject()
        if (!active || active.type !== 'activeSelection') return
        const objs = (active as ActiveSelection).getObjects()
        c.discardActiveObject()
        const group = new Group([...objs])
        objs.forEach(o => c.remove(o))
        c.add(group); c.setActiveObject(group); onModified()
      },
      ungroupSelected: () => {
        const c = canvasRef.current; if (!c) return
        const active = c.getActiveObject()
        if (!active || active.type !== 'group') return
        const items = (active as Group).removeAll()
        c.remove(active)
        items.forEach(o => c.add(o))
        c.renderAll(); onModified()
      },
      bringForward: () => {
        const c = canvasRef.current; const obj = c?.getActiveObject()
        if (c && obj) { c.bringObjectForward(obj); c.renderAll(); onModified() }
      },
      sendBackward: () => {
        const c = canvasRef.current; const obj = c?.getActiveObject()
        if (c && obj) { c.sendObjectBackwards(obj); c.renderAll(); onModified() }
      },
      toggleGrid: () => {
        const c = canvasRef.current; if (!c) return
        if (gridVisible.current) {
          gridObjects.current.forEach(o => c.remove(o)); gridObjects.current = []; gridVisible.current = false
        } else {
          const el = containerRef.current!
          const lines: FabricObject[] = []
          for (let i = 0; i <= ARTBOARD_W; i += 24)
            lines.push(new Line([i + (el.clientWidth - ARTBOARD_W) / 2, (el.clientHeight - ARTBOARD_H) / 2, i + (el.clientWidth - ARTBOARD_W) / 2, (el.clientHeight - ARTBOARD_H) / 2 + ARTBOARD_H], { stroke: 'rgba(0,0,0,0.06)', strokeWidth: 0.5, selectable: false, evented: false }))
          for (let j = 0; j <= ARTBOARD_H; j += 24)
            lines.push(new Line([(el.clientWidth - ARTBOARD_W) / 2, j + (el.clientHeight - ARTBOARD_H) / 2, (el.clientWidth - ARTBOARD_W) / 2 + ARTBOARD_W, j + (el.clientHeight - ARTBOARD_H) / 2], { stroke: 'rgba(0,0,0,0.06)', strokeWidth: 0.5, selectable: false, evented: false }))
          lines.forEach(l => c.add(l))
          gridObjects.current = lines; gridVisible.current = true
        }
        c.renderAll()
      },
      copySelected: () => {
        const obj = canvasRef.current?.getActiveObject()
        if (obj) obj.clone().then((cloned: FabricObject) => { clipboard.current = cloned })
      },
      pasteClipboard: async () => {
        const c = canvasRef.current; if (!c || !clipboard.current) return
        const cloned = await clipboard.current.clone()
        cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 })
        c.add(cloned); c.setActiveObject(cloned); onModified()
      },
    }), [deleteSelected, onModified, onZoomChange])

    return <div ref={containerRef} className="studio-canvas-container" />
  }
)

StudioCanvas.displayName = 'StudioCanvas'
export default StudioCanvas
