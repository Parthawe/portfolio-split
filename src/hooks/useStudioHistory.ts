import { useRef, useCallback } from 'react'
import type { Canvas } from 'fabric'

const MAX = 50

export function useStudioHistory(canvasRef: React.RefObject<Canvas | null>) {
  const stack = useRef<string[]>([])
  const index = useRef(-1)
  const locked = useRef(false)

  const save = useCallback(() => {
    const c = canvasRef.current
    if (!c || locked.current) return
    const json = JSON.stringify(c.toJSON())
    // Trim forward history if we've undone
    stack.current = stack.current.slice(0, index.current + 1)
    stack.current.push(json)
    if (stack.current.length > MAX) stack.current.shift()
    index.current = stack.current.length - 1
  }, [canvasRef])

  const restore = useCallback((idx: number) => {
    const c = canvasRef.current
    const data = stack.current[idx]
    if (!c || !data) return
    locked.current = true
    c.loadFromJSON(data).then(() => {
      c.renderAll()
      locked.current = false
    })
  }, [canvasRef])

  const undo = useCallback(() => {
    if (index.current > 0) {
      index.current--
      restore(index.current)
    }
  }, [restore])

  const redo = useCallback(() => {
    if (index.current < stack.current.length - 1) {
      index.current++
      restore(index.current)
    }
  }, [restore])

  const canUndo = () => index.current > 0
  const canRedo = () => index.current < stack.current.length - 1

  return { save, undo, redo, canUndo, canRedo }
}
