import { useRef, useCallback, useEffect, useState } from 'react'
import { processDrawing, classifyDrawing, prewarmTemplates, type LetterMatch } from '../utils/letterRecognizer'
import './drawing-pad.css'

interface Props {
  onRecognize: (letter: string, confidence: number) => void
  size?: number
  appearance?: 'default' | 'world'
}

export default function DrawingPad({ onRecognize, size = 200, appearance = 'default' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointer = useRef<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const distance = useRef(0)
  const lastPoint = useRef({ x: 0, y: 0 })
  const callback = useRef(onRecognize)
  callback.current = onRecognize
  const [hasInk, setHasInk] = useState(false)
  const [result, setResult] = useState('')
  const [candidates, setCandidates] = useState<LetterMatch[]>([])
  const [message, setMessage] = useState('Draw one capital letter. Clear before the next letter.')

  useEffect(() => { prewarmTemplates() }, [])
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = ctx.lineJoin = 'round'
    ctx.lineWidth = Math.max(4, size * 0.025)
    ctx.strokeStyle = '#fff'
  }, [size])

  const choose = useCallback((letter: string) => {
    clearTimeout(timer.current)
    setResult(letter)
    setMessage(`Selected ${letter}. Clear before drawing another letter.`)
    callback.current(letter, 1)
  }, [])

  const recognize = useCallback(() => {
    clearTimeout(timer.current)
    if (pointer.current !== null || !canvasRef.current) return
    if (distance.current < size * 0.2) {
      setMessage('Add more strokes to form a capital letter.')
      return
    }
    const match = classifyDrawing(processDrawing(canvasRef.current))
    setCandidates(match.candidates)
    if (match.letter && match.confidence > 0.2) {
      setResult(match.letter)
      setMessage(`Read as ${match.letter}. Choose another match if needed.`)
      callback.current(match.letter, match.confidence)
    } else {
      setResult('')
      setMessage('Uncertain. Choose a match below or add more strokes.')
    }
  }, [size])

  const position = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * size / rect.width, y: (e.clientY - rect.top) * size / rect.height }
  }
  const drawPoint = (point: { x: number; y: number }) => {
    const ctx = canvasRef.current!.getContext('2d')!
    distance.current += Math.hypot(point.x - lastPoint.current.x, point.y - lastPoint.current.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
    lastPoint.current = point
  }
  const clear = () => {
    clearTimeout(timer.current)
    const canvas = canvasRef.current!
    if (pointer.current !== null && canvas.hasPointerCapture(pointer.current)) canvas.releasePointerCapture(pointer.current)
    pointer.current = null
    canvas.getContext('2d')!.clearRect(0, 0, size, size)
    distance.current = 0
    setHasInk(false)
    setResult('')
    setCandidates([])
    setMessage('Draw one capital letter. Clear before the next letter.')
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return <div className="drawing-pad" data-appearance={appearance} style={{ width: size, maxWidth: '100%' }}>
    <div className="drawing-pad-surface" style={{ aspectRatio: '1' }}>
      <canvas ref={canvasRef} aria-label="Draw a capital letter"
        onPointerDown={e => {
          if (pointer.current !== null || e.button !== 0) return
          e.preventDefault()
          clearTimeout(timer.current)
          pointer.current = e.pointerId
          e.currentTarget.setPointerCapture(e.pointerId)
          lastPoint.current = position(e)
          const ctx = e.currentTarget.getContext('2d')!
          ctx.beginPath()
          ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
          setHasInk(true)
          setResult('')
          setCandidates([])
          setMessage('Finish the letter, then pause or press Recognize.')
        }}
        onPointerMove={e => { if (pointer.current === e.pointerId) { e.preventDefault(); drawPoint(position(e)) } }}
        onPointerUp={e => {
          if (pointer.current !== e.pointerId) return
          drawPoint(position(e))
          pointer.current = null
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
          timer.current = setTimeout(recognize, 1000)
        }}
        onPointerCancel={e => {
          if (pointer.current !== e.pointerId) return
          pointer.current = null
          clearTimeout(timer.current)
          setMessage('Drawing interrupted. Continue or press Recognize.')
        }}
        onLostPointerCapture={e => { if (pointer.current === e.pointerId) { pointer.current = null; clearTimeout(timer.current) } }}
      />
      {!hasInk && <span className="drawing-pad-placeholder">Draw a letter</span>}
      {result && <span className="drawing-pad-result">{result}</span>}
    </div>
    <div className="drawing-pad-actions">
      <button type="button" onClick={recognize} disabled={!hasInk}>Recognize</button>
      <button type="button" onClick={clear} aria-label="Clear drawing pad">Clear</button>
    </div>
    <p className="drawing-pad-message" role="status">{message}</p>
    {candidates.length > 0 && <div className="drawing-pad-matches" role="group" aria-label="Letter matches">
      {candidates.map(({ letter }) => <button key={letter} type="button" aria-label={`Use ${letter}`} aria-pressed={result === letter} onClick={() => choose(letter)}>{letter}</button>)}
    </div>}
  </div>
}
