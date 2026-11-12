// Original procedural illustrations. No artwork or source from Floor796 is used.
export const ROOMS = [
  { name: 'The greenhouse', color: '#5c7d65', note: 'The gardener tends a small forest while the ventilation fan turns.' },
  { name: 'Print night', color: '#9c654d', note: 'Fresh sheets travel through the press. Someone is still mixing the ink.' },
  { name: 'Listening room', color: '#626d98', note: 'A record turns, the sequencer blinks, and the drummer never quite stops.' },
  { name: 'Robot repairs', color: '#b58a43', note: 'A patient arm sorts parcels as the little inspection robot makes its rounds.' },
  { name: 'The observatory', color: '#4b7891', note: 'A telescope sweeps the room. The planets here have their own orbit.' },
  { name: 'Clock department', color: '#98735c', note: 'Three clocks disagree. The watchmaker keeps turning the same gear.' },
  { name: 'Tea break', color: '#8d6d81', note: 'The kettle is on. Two colleagues have forgotten whose turn it is.' },
  { name: 'Kinetic gallery', color: '#587d7d', note: 'A pendulum draws a quiet rhythm beside a slowly turning sculpture.' },
] as const
export type Camera = { x: number; y: number; zoom: number }
export type Cell = { col: number; row: number }
export function roomType(col: number, row: number) {
  let h = Math.imul(col, 374761393) ^ Math.imul(row, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return (h >>> 0) % ROOMS.length
}
export const point = (col: number, row: number) => ({ x: (col - row) * 132, y: (col + row) * 70 })
export function cellAt(x: number, y: number): Cell {
  return { col: Math.round((x / 132 + y / 70) / 2), row: Math.round((y / 70 - x / 132) / 2) }
}
export function visibleCells(width: number, height: number, camera: Camera) {
  const corners = [[0, 0], [width, 0], [0, height], [width, height]].map(([x, y]) => cellAt((x - width / 2) / camera.zoom + camera.x, (y - height / 2) / camera.zoom + camera.y))
  const result: Cell[] = []
  for (let col = Math.min(...corners.map(c => c.col)) - 2; col <= Math.max(...corners.map(c => c.col)) + 2; col++) {
    for (let row = Math.min(...corners.map(c => c.row)) - 2; row <= Math.max(...corners.map(c => c.row)) + 2; row++) {
      const p = point(col, row), x = (p.x - camera.x) * camera.zoom + width / 2, y = (p.y - camera.y) * camera.zoom + height / 2
      if (x > -170 * camera.zoom && x < width + 170 * camera.zoom && y > -100 * camera.zoom && y < height + 160 * camera.zoom) result.push({ col, row })
    }
  }
  return result.sort((a, b) => a.col + a.row - b.col - b.row)
}

type Context = CanvasRenderingContext2D
const palette = { ink: '#303b3c', paper: '#e8ddc5', skin: '#c5916b', blue: '#536e84', red: '#a95e4c', brass: '#bb965c', green: '#557661' }
function polygon(c: Context, points: number[][], color: string) { c.fillStyle = color; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill() }
function rect(c: Context, x: number, y: number, w: number, h: number, color: string) { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), w, h) }
function line(c: Context, points: number[][], color: string, width = 2) { c.strokeStyle = color; c.lineWidth = width; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke() }
function ellipse(c: Context, x: number, y: number, rx: number, ry: number, color: string) { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill() }
function box(c: Context, x: number, y: number, w: number, d: number, h: number, color: string) {
  polygon(c, [[x + w, y + w / 2], [x + w - d, y + (w + d) / 2], [x + w - d, y + (w + d) / 2 - h], [x + w, y + w / 2 - h]], color)
  polygon(c, [[x + w - d, y + (w + d) / 2], [x - d, y + d / 2], [x - d, y + d / 2 - h], [x + w - d, y + (w + d) / 2 - h]], palette.ink)
  polygon(c, [[x, y - h], [x + w, y + w / 2 - h], [x + w - d, y + (w + d) / 2 - h], [x - d, y + d / 2 - h]], palette.paper)
}
function person(c: Context, x: number, y: number, shirt: string, phase: number, walking = false) {
  const step = walking ? Math.sin(phase * 5) * 2 : 0
  ellipse(c, x, y + 1, 8, 3, '#00000020')
  rect(c, x - 4, y - 9, 3, 9 + step, palette.ink); rect(c, x + 1, y - 9, 3, 9 - step, palette.ink)
  rect(c, x - 5, y - 21, 10, 13, shirt); rect(c, x - 8, y - 19 + step, 3, 10, palette.skin); rect(c, x + 5, y - 19 - step, 3, 10, palette.skin)
  rect(c, x - 4, y - 30, 8, 9, palette.skin); rect(c, x - 5, y - 32, 10, 4, palette.ink); rect(c, x + 2, y - 26, 2, 2, palette.ink)
}
function plant(c: Context, x: number, y: number, phase: number) {
  box(c, x, y, 9, 9, 8, '#a26850')
  const lean = Math.sin(phase) * 2
  line(c, [[x, y - 7], [x + lean, y - 34]], palette.green)
  for (let n = 0; n < 3; n++) { ellipse(c, x - 6 + lean, y - 15 - n * 7, 7, 3, palette.green); ellipse(c, x + 5 + lean, y - 19 - n * 6, 6, 3, '#789265') }
}
function gear(c: Context, x: number, y: number, size: number, phase: number) {
  c.save(); c.translate(x, y); c.rotate(phase); ellipse(c, 0, 0, size, size, palette.brass); ellipse(c, 0, 0, size - 4, size - 4, palette.ink)
  for (let n = 0; n < 8; n++) { c.rotate(Math.PI / 4); rect(c, -2, 0, 4, size, palette.brass) } ellipse(c, 0, 0, 3, 3, palette.paper); c.restore()
}

export function createWorldRenderer() {
  const plates = new Map<string, HTMLCanvasElement>()
  function backplate(type: number, dark: boolean) {
    const key = `${type}-${dark}`
    const cached = plates.get(key); if (cached) return cached
    const canvas = document.createElement('canvas'); canvas.width = 272; canvas.height = 232
    const c = canvas.getContext('2d'); if (!c) return null
    c.translate(136, 146)
    polygon(c, [[0, -64], [124, 0], [0, 64], [-124, 0]], dark ? '#77776a' : '#c8bfa9')
    for (let u = 0; u < 5; u++) for (let v = 0; v < 5; v++) {
      const x = (u - v) * 24, y = (u + v) * 12 - 60
      polygon(c, [[x, y], [x + 23, y + 11.5], [x, y + 23], [x - 23, y + 11.5]], (u + v) % 2 ? (dark ? '#a99e82' : '#d8ccb1') : (dark ? '#c3b99b' : '#e9dfc7'))
    }
    polygon(c, [[-124, 0], [0, -64], [0, -96], [-124, -32]], dark ? '#596766' : '#8d9e94')
    polygon(c, [[0, -64], [124, 0], [124, -32], [0, -96]], dark ? '#78817a' : '#b0baaa')
    line(c, [[-124, -32], [0, -96], [124, -32]], palette.ink, 3)
    // Wall windows and services bind the rooms into one continuous building.
    polygon(c, [[25, -80], [74, -55], [74, -35], [25, -60]], '#d8c596')
    line(c, [[49, -68], [49, -48]], palette.ink); line(c, [[25, -70], [74, -45]], palette.ink)
    polygon(c, [[-102, -28], [-69, -45], [-69, -66], [-102, -49]], ROOMS[type].color)
    for (let i = 0; i < 3; i++) line(c, [[-96 + i * 7, -34 - i * 3.5], [-96 + i * 7, -44 - i * 3.5]], palette.paper, 2)
    line(c, [[-124, 0], [0, 64], [124, 0]], '#8a806b', 3)
    plates.set(key, canvas); return canvas
  }
  function scene(c: Context, type: number, t: number) {
    const p = palette, bounce = Math.sin(t * 3)
    switch (type) {
      case 0:
        box(c, -33, -16, 36, 29, 13, '#6f7960'); for (let i = 0; i < 4; i++) plant(c, -57 + i * 24, 2 + (i % 2) * 13, t + i)
        ellipse(c, 13, -74, 13, 13, p.ink); c.save(); c.translate(13, -74); c.rotate(t); for (let i = 0; i < 4; i++) { ellipse(c, 0, 6, 3, 7, p.paper); c.rotate(Math.PI / 2) } c.restore()
        person(c, 47 + Math.sin(t / 3) * 11, 23, p.green, t, true); break
      case 1:
        box(c, -18, -9, 48, 34, 26, p.blue); rect(c, -20, -39, 48, 6, p.ink)
        for (let i = 0; i < 3; i++) { const x = -14 + ((t * 9 + i * 15) % 44); polygon(c, [[x, -22], [x + 10, -17], [x, -12], [x - 10, -17]], p.paper) }
        for (let i = 0; i < 3; i++) box(c, 58, 8 + i * 3, 17, 18, 5, p.red)
        person(c, -65, 7, p.red, t); person(c, 17, 39, p.brass, t + 1); break
      case 2:
        box(c, -30, -13, 56, 23, 14, p.blue)
        for (let i = 0; i < 8; i++) { rect(c, -38 + i * 6, -16 + i * .8, 4, 7, p.paper); rect(c, -38 + i * 6, -26, 3, 3, Math.sin(t * 5 - i) > 0 ? p.brass : p.ink) }
        ellipse(c, 48, 0, 19, 11, p.ink); ellipse(c, 48, 0, 5, 3, p.red); line(c, [[48, 0], [48 + Math.cos(t * 3) * 14, Math.sin(t * 3) * 7]], p.paper)
        person(c, -4, 32, p.red, t); ellipse(c, -52, 15, 15, 8, p.red); line(c, [[-62, 11], [-45, 6 + bounce * 4]], p.paper); break
      case 3:
        box(c, -50, -2, 78, 20, 13, p.blue)
        for (let i = 0; i < 4; i++) { const x = -59 + ((t * 12 + i * 20) % 80); box(c, x, 7 + (x + 59) * .25, 9, 9, 9, p.brass) }
        const armX = 24 + Math.sin(t) * 18, armY = -48 + Math.cos(t) * 6
        line(c, [[32, -3], [50, -46], [armX, armY], [armX - 8, armY + 14]], p.ink, 7); line(c, [[32, -3], [50, -46], [armX, armY]], p.brass, 4)
        box(c, -55 + Math.sin(t) * 15, 38, 15, 12, 10, '#9eaaa0'); rect(c, -58 + Math.sin(t) * 15, 24, 3, 3, p.red); break
      case 4:
        line(c, [[-5, -9], [-20, 27]], p.ink, 4); line(c, [[-5, -9], [17, 28]], p.ink, 4)
        const angle = -.65 + Math.sin(t / 3) * .12
        c.save(); c.translate(-5, -28); c.rotate(angle); rect(c, -29, -8, 58, 16, p.blue); rect(c, 21, -10, 9, 20, p.brass); c.restore()
        ellipse(c, 60, 5, 24, 9, '#7c9894'); const orbit = t / 2; ellipse(c, 60 + Math.cos(orbit) * 21, 5 + Math.sin(orbit) * 8, 5, 5, p.brass)
        person(c, -46, 17, p.blue, t); break
      case 5:
        for (let i = 0; i < 3; i++) { ellipse(c, -52 + i * 38, -58 + i * 11, 12, 12, p.ink); ellipse(c, -52 + i * 38, -58 + i * 11, 10, 10, p.paper); line(c, [[-52 + i * 38, -58 + i * 11], [-52 + i * 38 + Math.sin(t * (i + 1)) * 8, -58 + i * 11 - Math.cos(t * (i + 1)) * 8]], p.ink) }
        box(c, -20, 10, 42, 22, 15, p.red); gear(c, 8, -1, 12, t / 2); gear(c, -14, -4, 8, -t * .75); person(c, -47, 29, p.brass, t); break
      case 6:
        polygon(c, [[0, -12], [53, 15], [0, 43], [-53, 15]], '#967a72'); box(c, 0, 2, 30, 30, 16, p.red)
        for (let i = 0; i < 2; i++) { ellipse(c, -7 + i * 18, -1 + i * 6, 4, 3, p.paper); const steam = (t * 9 + i * 7) % 14; line(c, [[-7 + i * 18, -8 + i * 6 - steam], [-4 + i * 18, -14 + i * 6 - steam]], '#e8ddc590') }
        person(c, -38, 8, p.green, t); person(c, 36, 31, p.blue, t + 1); plant(c, 62, 3, t); break
      case 7:
        box(c, 17, 12, 25, 25, 14, p.green); c.save(); c.translate(16, -20); c.rotate(t / 3); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); rect(c, -3, -27, 6, 54, i % 2 ? p.brass : p.blue) } c.restore()
        line(c, [[-65, 15], [-43, -55], [-18, 20]], p.ink, 3); const pendulum = Math.sin(t * 2) * 20; line(c, [[-43, -55], [-43 + pendulum, -10]], p.ink); ellipse(c, -43 + pendulum, -10, 7, 7, p.brass)
        person(c, 58, 23, p.red, t); break
    }
  }
  return {
    draw(c: Context, width: number, height: number, camera: Camera, time: number, selected: Cell, dark: boolean) {
      c.fillStyle = dark ? '#202827' : '#e5e5da'; c.fillRect(0, 0, width, height)
      const cells = visibleCells(width, height, camera)
      for (const cell of cells) {
        const { col, row } = cell, type = roomType(col, row), p = point(col, row)
        c.save(); c.translate(width / 2 + (p.x - camera.x) * camera.zoom, height / 2 + (p.y - camera.y) * camera.zoom); c.scale(camera.zoom, camera.zoom)
        const plate = backplate(type, dark); if (plate) c.drawImage(plate, -136, -146)
        scene(c, type, time / 1000 + ((col * 17 + row * 31) % 53))
        if (selected.col === col && selected.row === row) line(c, [[0, -65], [125, 0], [0, 65], [-125, 0], [0, -65]], dark ? '#f2d390' : '#365a78', 3)
        if (camera.zoom > .7) { c.font = '8px monospace'; c.textAlign = 'center'; c.fillStyle = palette.ink; c.fillText(`${col},${row}  /  ${ROOMS[type].name.toUpperCase()}`, 0, 60) }
        c.restore()
      }
      return cells.length
    },
    dispose() { plates.clear() },
  }
}
