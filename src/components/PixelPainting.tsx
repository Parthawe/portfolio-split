import PortfolioSlider from './PortfolioSlider'
import { useEffect, useRef, useState } from 'react'
import '../styles/pixel-painting.css'

/** Browser restoration of the archived ICM paintingpixels.js and particle.js. */
export default function PixelPainting() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const request = useRef(0)
  const painter = useRef<{ step: () => void; reset: () => void } | null>(null)
  const alpha = useRef(127)
  const [opacity, setOpacity] = useState(127)
  const [running, setRunning] = useState(false)
  const [source, setSource] = useState<'sample' | 'camera'>('sample')
  const [cameraPending, setCameraPending] = useState(false)
  const [message, setMessage] = useState('Sample portrait loaded. Press Start painting to watch the particles build an image.')

  const stopCamera = () => {
    request.current += 1
    stream.current?.getTracks().forEach(track => track.stop())
    stream.current = null
    if (video.current) video.current.srcObject = null
    setSource('sample')
    setCameraPending(false)
  }

  useEffect(() => () => {
    request.current += 1
    stream.current?.getTracks().forEach(track => track.stop())
  }, [])

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    let disposed = false
    const sample = new Image()
    const sampler = document.createElement('canvas')
    sampler.width = 40
    sampler.height = 30
    const sampleContext = sampler.getContext('2d', { willReadFrequently: true })!
    const particles = Array.from({ length: 200 }, () => ({ x: Math.random() * 640, y: Math.random() * 480 }))
    const reset = () => { ctx.fillStyle = '#333'; ctx.fillRect(0, 0, 640, 480) }
    const step = () => {
      const input = source === 'camera' ? video.current : sample
      if (!input || (input instanceof HTMLVideoElement ? input.readyState < 2 : !input.complete || !input.naturalWidth)) return
      const width = input instanceof HTMLVideoElement ? input.videoWidth : input.naturalWidth
      const height = input instanceof HTMLVideoElement ? input.videoHeight : input.naturalHeight
      const cropWidth = Math.min(width, height * 4 / 3)
      const cropHeight = cropWidth * 3 / 4
      sampleContext.drawImage(input, (width - cropWidth) / 2, (height - cropHeight) / 2, cropWidth, cropHeight, 0, 0, 40, 30)
      const pixels = sampleContext.getImageData(0, 0, 40, 30).data
      particles.forEach(particle => {
        particle.x = Math.max(0, Math.min(639, particle.x + Math.random() * 20 - 10))
        particle.y = Math.max(0, Math.min(479, particle.y + Math.random() * 20 - 10))
        const offset = (Math.floor(particle.y / 16) * 40 + Math.floor(particle.x / 16)) * 4
        ctx.fillStyle = `rgba(${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]},${alpha.current / 255})`
        ctx.beginPath()
        ctx.ellipse(particle.x, particle.y, 12.5, 12, 0, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    painter.current = { step, reset }
    reset()
    sample.onload = () => {
      if (disposed) return
      // A still preview is available before motion or camera permission.
      for (let index = 0; index < 35; index += 1) step()
    }
    sample.onerror = () => { if (!disposed) setMessage('The sample image could not load. You can still try your camera.') }
    sample.src = '/Assets/images/parth.jpg'
    return () => { disposed = true; painter.current = null }
  }, [source])

  useEffect(() => {
    if (!running) return
    let frame = 0
    let previous = 0
    const draw = (time: number) => {
      if (time - previous >= 1000 / 30 && !document.hidden) { painter.current?.step(); previous = time }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [running])

  const useCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage('Camera access is unavailable in this browser. The sample portrait still works.')
      return
    }
    const current = ++request.current
    setCameraPending(true)
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      if (request.current !== current || !video.current) { nextStream.getTracks().forEach(track => track.stop()); return }
      stream.current = nextStream
      video.current.srcObject = nextStream
      await video.current.play()
      if (request.current !== current) return
      setSource('camera')
      setMessage('Camera ready. Your video stays in this browser. Press Start painting if the canvas is paused.')
    } catch {
      if (request.current !== current) return
      stopCamera()
      setMessage('The camera could not start. Check browser permissions or continue with the sample portrait.')
    } finally {
      if (request.current === current) setCameraPending(false)
    }
  }

  return (
    <div className="pixel-painting">
      <canvas ref={canvas} width="640" height="480" role="img" aria-label="A portrait built from translucent circular particles. Each particle samples the image color beneath it." />
      <video ref={video} muted playsInline hidden />
      <div className="pixel-painting__controls">
        <button type="button" onClick={() => setRunning(value => !value)}>{running ? 'Pause painting' : 'Start painting'}</button>
        <button type="button" onClick={() => { setRunning(false); painter.current?.reset() }}>Clear canvas</button>
        <button type="button" onClick={() => {
          if (cameraPending) { stopCamera(); setMessage('Camera request cancelled. Painting from the sample portrait.'); return }
          if (source === 'camera') { stopCamera(); setMessage('Camera stopped. Painting from the sample portrait.') }
          else void useCamera()
        }}>{cameraPending ? 'Cancel camera request' : source === 'camera' ? 'Stop camera' : 'Use my camera'}</button>
        <label htmlFor="pixel-opacity">Paint opacity <output>{Math.round(opacity / 255 * 100)}%</output>
          <PortfolioSlider id="pixel-opacity" type="range" min="1" max="255" value={opacity} onChange={event => {
            const value = Number(event.target.value); alpha.current = value; setOpacity(value)
            if (!running) painter.current?.step()
          }} />
        </label>
      </div>
      <p role="status">{message}</p>
      <p>Interactive restoration of the original camera-pixel sketch. The sample portrait lets you try it without a camera.</p>
    </div>
  )
}
