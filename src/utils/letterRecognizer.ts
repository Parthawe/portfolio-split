/* ═══════════════════════════════════════════════════════════
   Letter Recognizer — handwriting → letter classification

   Pipeline:
   1. User draws on a canvas
   2. Drawing is normalized to 28×28 grayscale grid
   3. Compared against consistently normalized references using ink distance and overlap
   4. Templates are rendered from multiple fonts at startup

   No external ML model needed — pure canvas + math.
   Uncertain matches require confirmation; reference matching is not a trained model.
   ═══════════════════════════════════════════════════════════ */

const SIZE = 28
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

type LetterTemplate = {
  letter: string
  data: Float32Array
  distance: Float32Array
}

export type StrokePoint = {
  x: number
  y: number
}

// Reference templates (generated once, cached)
let templates: LetterTemplate[] | null = null

/**
 * Generate reference templates by rendering each letter
 * with multiple fonts into 28×28 canvases.
 */
function buildTemplates(): LetterTemplate[] {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  const fonts = [
    'bold 22px Arial',
    'bold 22px Georgia',
    'bold 20px Courier New',
    'bold 22px Helvetica',
    '22px sans-serif',
    'italic bold 22px serif',
  ]

  const result: LetterTemplate[] = []

  for (const letter of LETTERS) {
    for (const font of fonts) {
      ctx.clearRect(0, 0, SIZE, SIZE)
      ctx.fillStyle = '#fff'
      ctx.font = font
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(letter, SIZE / 2, SIZE / 2 + 1)

      const data = processDrawing(canvas)
      result.push({ letter, data, distance: distanceField(data) })

      ctx.clearRect(0, 0, SIZE, SIZE)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.font = font
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.strokeText(letter, SIZE / 2, SIZE / 2 + 1)

      const outline = processDrawing(canvas)
      result.push({ letter, data: outline, distance: distanceField(outline) })
    }

    for (const data of buildStrokeTemplates(letter)) {
      result.push({ letter, data, distance: distanceField(data) })
    }
  }

  return result
}

function buildStrokeTemplates(letter: string): Float32Array[] {
  const variants: Array<{ sx: number; sy: number; dx: number; dy: number }> = [
    { sx: 1, sy: 1, dx: 0, dy: 0 },
    { sx: 0.9, sy: 1.08, dx: 1.2, dy: -0.4 },
    { sx: 1.08, sy: 0.94, dx: -0.8, dy: 0.8 },
  ]

  return variants.map((variant) => {
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.save()
    ctx.translate(SIZE / 2 + variant.dx, SIZE / 2 + variant.dy)
    ctx.scale(variant.sx, variant.sy)
    ctx.translate(-SIZE / 2, -SIZE / 2)
    drawStrokeLetter(ctx, letter)
    ctx.restore()

    return processDrawing(canvas)
  }).concat(buildHandwrittenVariants(letter))
}

function buildHandwrittenVariants(letter: string): Float32Array[] {
  if (!'JOS'.includes(letter)) return []
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 100
  const ctx = canvas.getContext('2d')!
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 5
  ctx.lineCap = ctx.lineJoin = 'round'
  ctx.beginPath()
  if (letter === 'O') ctx.ellipse(50, 50, 35, 42, 0, 0, Math.PI * 2)
  if (letter === 'J') { ctx.moveTo(75, 8); ctx.lineTo(75, 70); ctx.bezierCurveTo(75, 100, 35, 102, 22, 78) }
  if (letter === 'S') {
    ctx.moveTo(83, 18)
    ctx.bezierCurveTo(35, -8, 4, 36, 47, 49)
    ctx.bezierCurveTo(97, 62, 79, 110, 15, 82)
  }
  ctx.stroke()
  return [processDrawing(canvas)]
}

function p(x: number, y: number) {
  return { x: 5 + x * 18, y: 4 + y * 20 }
}

function moveTo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const point = p(x, y)
  ctx.moveTo(point.x, point.y)
}

function lineTo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const point = p(x, y)
  ctx.lineTo(point.x, point.y)
}

function quadTo(ctx: CanvasRenderingContext2D, cx: number, cy: number, x: number, y: number) {
  const control = p(cx, cy)
  const point = p(x, y)
  ctx.quadraticCurveTo(control.x, control.y, point.x, point.y)
}

function drawStrokeLetter(ctx: CanvasRenderingContext2D, letter: string): void {
  ctx.beginPath()

  switch (letter) {
    case 'A':
      moveTo(ctx, 0.05, 1); lineTo(ctx, 0.5, 0); lineTo(ctx, 0.95, 1); moveTo(ctx, 0.25, 0.58); lineTo(ctx, 0.75, 0.58); break
    case 'B':
      moveTo(ctx, 0.12, 0); lineTo(ctx, 0.12, 1); moveTo(ctx, 0.12, 0.02); quadTo(ctx, 0.95, 0.05, 0.72, 0.48); quadTo(ctx, 0.42, 0.55, 0.12, 0.5); moveTo(ctx, 0.12, 0.5); quadTo(ctx, 1.02, 0.55, 0.78, 0.98); quadTo(ctx, 0.42, 1.04, 0.12, 1); break
    case 'C':
      moveTo(ctx, 0.88, 0.15); quadTo(ctx, 0.2, -0.05, 0.1, 0.5); quadTo(ctx, 0.18, 1.04, 0.88, 0.86); break
    case 'D':
      moveTo(ctx, 0.12, 0); lineTo(ctx, 0.12, 1); moveTo(ctx, 0.12, 0.02); quadTo(ctx, 1.02, 0.5, 0.12, 0.98); break
    case 'E':
      moveTo(ctx, 0.88, 0.02); lineTo(ctx, 0.12, 0.02); lineTo(ctx, 0.12, 1); lineTo(ctx, 0.9, 1); moveTo(ctx, 0.12, 0.5); lineTo(ctx, 0.72, 0.5); break
    case 'F':
      moveTo(ctx, 0.12, 1); lineTo(ctx, 0.12, 0.02); lineTo(ctx, 0.9, 0.02); moveTo(ctx, 0.12, 0.5); lineTo(ctx, 0.72, 0.5); break
    case 'G':
      moveTo(ctx, 0.88, 0.18); quadTo(ctx, 0.18, -0.03, 0.1, 0.52); quadTo(ctx, 0.18, 1.02, 0.9, 0.86); lineTo(ctx, 0.9, 0.6); lineTo(ctx, 0.58, 0.6); break
    case 'H':
      moveTo(ctx, 0.12, 0); lineTo(ctx, 0.12, 1); moveTo(ctx, 0.88, 0); lineTo(ctx, 0.88, 1); moveTo(ctx, 0.12, 0.52); lineTo(ctx, 0.88, 0.52); break
    case 'I':
      moveTo(ctx, 0.22, 0.02); lineTo(ctx, 0.78, 0.02); moveTo(ctx, 0.5, 0.02); lineTo(ctx, 0.5, 1); moveTo(ctx, 0.22, 1); lineTo(ctx, 0.78, 1); break
    case 'J':
      moveTo(ctx, 0.18, 0.02); lineTo(ctx, 0.86, 0.02); moveTo(ctx, 0.64, 0.02); lineTo(ctx, 0.64, 0.78); quadTo(ctx, 0.58, 1.06, 0.18, 0.88); break
    case 'K':
      moveTo(ctx, 0.14, 0); lineTo(ctx, 0.14, 1); moveTo(ctx, 0.9, 0.02); lineTo(ctx, 0.18, 0.56); lineTo(ctx, 0.9, 1); break
    case 'L':
      moveTo(ctx, 0.14, 0); lineTo(ctx, 0.14, 1); lineTo(ctx, 0.88, 1); break
    case 'M':
      moveTo(ctx, 0.08, 1); lineTo(ctx, 0.08, 0); lineTo(ctx, 0.5, 0.58); lineTo(ctx, 0.92, 0); lineTo(ctx, 0.92, 1); break
    case 'N':
      moveTo(ctx, 0.12, 1); lineTo(ctx, 0.12, 0); lineTo(ctx, 0.88, 1); lineTo(ctx, 0.88, 0); break
    case 'O':
      moveTo(ctx, 0.5, 0); quadTo(ctx, 1, 0.08, 0.9, 0.55); quadTo(ctx, 0.82, 1.04, 0.48, 1); quadTo(ctx, 0, 0.92, 0.1, 0.45); quadTo(ctx, 0.18, 0.04, 0.5, 0); break
    case 'P':
      moveTo(ctx, 0.12, 1); lineTo(ctx, 0.12, 0); moveTo(ctx, 0.12, 0.02); quadTo(ctx, 0.95, 0.08, 0.72, 0.5); quadTo(ctx, 0.42, 0.58, 0.12, 0.5); break
    case 'Q':
      moveTo(ctx, 0.5, 0); quadTo(ctx, 1, 0.08, 0.9, 0.55); quadTo(ctx, 0.82, 1.04, 0.48, 1); quadTo(ctx, 0, 0.92, 0.1, 0.45); quadTo(ctx, 0.18, 0.04, 0.5, 0); moveTo(ctx, 0.6, 0.7); lineTo(ctx, 0.95, 1); break
    case 'R':
      moveTo(ctx, 0.12, 1); lineTo(ctx, 0.12, 0); moveTo(ctx, 0.12, 0.02); quadTo(ctx, 0.95, 0.08, 0.72, 0.48); quadTo(ctx, 0.42, 0.56, 0.12, 0.5); moveTo(ctx, 0.45, 0.52); lineTo(ctx, 0.92, 1); break
    case 'S':
      moveTo(ctx, 0.88, 0.12); quadTo(ctx, 0.08, 0, 0.18, 0.42); quadTo(ctx, 0.22, 0.62, 0.72, 0.56); quadTo(ctx, 1, 0.86, 0.12, 0.92); break
    case 'T':
      moveTo(ctx, 0.08, 0.02); lineTo(ctx, 0.92, 0.02); moveTo(ctx, 0.5, 0.02); lineTo(ctx, 0.5, 1); break
    case 'U':
      moveTo(ctx, 0.12, 0); lineTo(ctx, 0.12, 0.72); quadTo(ctx, 0.5, 1.15, 0.88, 0.72); lineTo(ctx, 0.88, 0); break
    case 'V':
      moveTo(ctx, 0.08, 0); lineTo(ctx, 0.5, 1); lineTo(ctx, 0.92, 0); break
    case 'W':
      moveTo(ctx, 0.04, 0); lineTo(ctx, 0.24, 1); lineTo(ctx, 0.5, 0.45); lineTo(ctx, 0.76, 1); lineTo(ctx, 0.96, 0); break
    case 'X':
      moveTo(ctx, 0.1, 0); lineTo(ctx, 0.9, 1); moveTo(ctx, 0.9, 0); lineTo(ctx, 0.1, 1); break
    case 'Y':
      moveTo(ctx, 0.08, 0); lineTo(ctx, 0.5, 0.52); lineTo(ctx, 0.92, 0); moveTo(ctx, 0.5, 0.52); lineTo(ctx, 0.5, 1); break
    case 'Z':
      moveTo(ctx, 0.1, 0.02); lineTo(ctx, 0.9, 0.02); lineTo(ctx, 0.1, 1); lineTo(ctx, 0.9, 1); break
  }

  ctx.stroke()
}

/**
 * Extract grayscale grid from canvas context.
 */
function extractGrid(ctx: CanvasRenderingContext2D): Float32Array {
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE)
  const grid = new Float32Array(SIZE * SIZE)
  for (let i = 0; i < SIZE * SIZE; i++) {
    // Use alpha channel (text on transparent bg) or red channel
    grid[i] = imageData.data[i * 4 + 3] / 255
  }
  return grid
}

/**
 * Simple 3×3 box blur.
 */
function blur3x3(src: Float32Array, w: number): Float32Array {
  const out = new Float32Array(src.length)
  for (let y = 0; y < w; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, count = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy, nx = x + dx
          if (ny >= 0 && ny < w && nx >= 0 && nx < w) {
            sum += src[ny * w + nx]
            count++
          }
        }
      }
      out[y * w + x] = sum / count
    }
  }
  return out
}

/**
 * Normalize a vector to unit length (in place).
 */
function normalize(v: Float32Array): void {
  let mag = 0
  for (let i = 0; i < v.length; i++) mag += v[i] * v[i]
  mag = Math.sqrt(mag)
  if (mag > 0) {
    for (let i = 0; i < v.length; i++) v[i] /= mag
  }
}

/**
 * Cosine similarity between two unit vectors.
 */
function cosineSim(a: Float32Array, b: Float32Array): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i]
  return dot
}

/**
 * Process a drawing canvas into a normalized 28×28 grid.
 * Crops to bounding box, centers, and scales.
 */
export function processDrawing(sourceCanvas: HTMLCanvasElement): Float32Array {
  const srcCtx = sourceCanvas.getContext('2d')!
  const w = sourceCanvas.width
  const h = sourceCanvas.height
  const imageData = srcCtx.getImageData(0, 0, w, h)
  const pixels = imageData.data

  // Find bounding box of drawn content
  let minX = w, maxX = 0, minY = h, maxY = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = pixels[(y * w + x) * 4 + 3]
      if (a > 30) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  // Nothing drawn
  if (minX > maxX || minY > maxY) return new Float32Array(SIZE * SIZE)

  // Crop and resize to SIZE×SIZE with padding
  const pad = 3
  const cropW = maxX - minX + 1
  const cropH = maxY - minY + 1
  const maxDim = Math.max(cropW, cropH)
  const scaleY = (SIZE - pad * 2) / cropH
  // Keep a single narrow stem narrow (I), while allowing ordinary letters
  // to be written taller or wider than the reference font.
  const scaleX = cropW / cropH < 0.22 ? (SIZE - pad * 2) / maxDim : (SIZE - pad * 2) / cropW

  const destCanvas = document.createElement('canvas')
  destCanvas.width = SIZE
  destCanvas.height = SIZE
  const destCtx = destCanvas.getContext('2d')!

  // Center the drawing
  const offX = pad + ((SIZE - pad * 2) - cropW * scaleX) / 2
  const offY = pad + ((SIZE - pad * 2) - cropH * scaleY) / 2

  destCtx.drawImage(
    sourceCanvas,
    minX, minY, cropW, cropH,
    offX, offY, cropW * scaleX, cropH * scaleY,
  )

  const grid = extractGrid(destCtx)
  const blurred = blur3x3(grid, SIZE)
  normalize(blurred)
  return blurred
}

/**
 * Classify a processed drawing against reference templates.
 * Returns top match + confidence.
 */
/**
 * Pre-build templates during idle time so first classify doesn't block.
 * Called when the drawing pad opens.
 */
export function prewarmTemplates(): void {
  if (!templates) {
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
        if (!templates) templates = buildTemplates()
      })
    } else {
      setTimeout(() => { if (!templates) templates = buildTemplates() }, 100)
    }
  }
}

export type LetterMatch = { letter: string; score: number }

// Symmetric ink distance tolerates small shifts and differences in stroke width.
function distanceField(grid: Float32Array): Float32Array {
  const peak = Math.max(...grid)
  const ink: number[] = []
  grid.forEach((value, index) => { if (value > peak * 0.35) ink.push(index) })
  return Float32Array.from(grid, (_, index) => {
    let nearest = SIZE * SIZE
    const x = index % SIZE, y = Math.floor(index / SIZE)
    for (const point of ink) nearest = Math.min(nearest, (x - point % SIZE) ** 2 + (y - Math.floor(point / SIZE)) ** 2)
    return nearest
  })
}

function inkSimilarity(ink: Float32Array, distance: Float32Array): number {
  const peak = Math.max(...ink)
  let total = 0, count = 0
  ink.forEach((value, index) => {
    if (value > peak * 0.35) { total += Math.exp(-distance[index] / 4); count++ }
  })
  return count ? total / count : 0
}

export function classifyDrawing(grid: Float32Array): { letter: string; confidence: number; candidates: LetterMatch[] } {
  if (!grid.some(value => value > 0)) return { letter: '', confidence: 0, candidates: [] }
  if (!templates) templates = buildTemplates()
  const distance = distanceField(grid)
  const letterScores = new Map<string, number>()
  for (const template of templates) {
    const shape = (inkSimilarity(grid, template.distance) + inkSimilarity(template.data, distance)) / 2
    const score = cosineSim(grid, template.data) * 0.55 + shape * 0.45
    letterScores.set(template.letter, Math.max(letterScores.get(template.letter) ?? 0, score))
  }
  const candidates = [...letterScores].map(([letter, score]) => ({ letter, score })).sort((a, b) => b.score - a.score).slice(0, 3)
  const [best, runnerUp] = candidates
  const margin = best.score - runnerUp.score
  // This is a template score, not a calibrated model probability. Ambiguous
  // shapes require confirmation rather than silently changing the exhibit.
  const confidence = best.score >= 0.62 && margin >= 0.025 ? Math.min(1, (best.score - 0.5) * 2) : 0.15
  return { letter: best.letter, confidence, candidates }
}
