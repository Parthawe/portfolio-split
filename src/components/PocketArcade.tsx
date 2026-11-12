import { visibleAnimation } from '../utils/visibleActivity'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useThemeMode } from '../hooks/useThemeMode'
import '../styles/arcade.css'

type Action = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'menu'
type GameId = 'snake' | 'pong' | 'breakout' | 'dodge' | 'quickdraw'
type Mode = 'menu' | 'playing' | 'over'

type SnakeState = { body: Array<[number, number]>; dir: [number, number]; next: [number, number]; food: [number, number]; elapsed: number }
type PongState = { ball: { x: number; y: number; vx: number; vy: number }; player: number; cpu: number }
type BreakoutState = { ball: { x: number; y: number; vx: number; vy: number }; paddle: number; bricks: boolean[] }
type DodgeState = { player: number; hazards: Array<{ x: number; y: number; speed: number }>; elapsed: number; spawn: number }
type QuickDrawState = { phase: 'wait' | 'go' | 'result'; timer: number; result: string }
type GameState = SnakeState | PongState | BreakoutState | DodgeState | QuickDrawState

const W = 320
const H = 220
const games: Array<{ id: GameId; label: string; hint: string }> = [
  { id: 'snake', label: 'SNAKE', hint: 'D-pad to turn' },
  { id: 'pong', label: 'PONG', hint: 'Up / down' },
  { id: 'breakout', label: 'BREAKOUT', hint: 'Left / right' },
  { id: 'dodge', label: 'ROAD DASH', hint: 'Dodge the rain' },
  { id: 'quickdraw', label: 'QUICK DRAW', hint: 'Press A on light' },
]

const LIGHT_COLORS = {
  bg: '#d8dbd4',
  grid: '#c4c8c0',
  green: '#171717',
  greenDim: '#565656',
  red: '#080808',
  amber: '#2e2e2e',
  go: '#111111',
  text: '#111111',
  muted: '#666963',
  selected: '#f4f4f0',
  overlay: 'rgba(12, 12, 12, .9)',
  overlayText: '#f3f3ef',
}

const DARK_COLORS = {
  bg: '#101010',
  grid: '#202020',
  green: '#f2f2ef',
  greenDim: '#9a9a96',
  red: '#ffffff',
  amber: '#d0d0cc',
  go: '#ffffff',
  text: '#f5f5f1',
  muted: '#8b8b87',
  selected: '#303030',
  overlay: 'rgba(245, 245, 241, .92)',
  overlayText: '#111111',
}

type ArcadeColors = typeof LIGHT_COLORS

function randomInt(max: number) {
  return Math.floor(Math.random() * max)
}

function isSnake(state: GameState): state is SnakeState { return 'body' in state }
function isPong(state: GameState): state is PongState { return 'cpu' in state }
function isBreakout(state: GameState): state is BreakoutState { return 'bricks' in state }
function isDodge(state: GameState): state is DodgeState { return 'hazards' in state }
function isQuickDraw(state: GameState): state is QuickDrawState { return 'phase' in state }

function makeState(id: GameId): GameState {
  if (id === 'snake') return { body: [[8, 7], [7, 7], [6, 7]], dir: [1, 0], next: [1, 0], food: [14, 7], elapsed: 0 }
  if (id === 'pong') return { ball: { x: W / 2, y: H / 2, vx: 145, vy: 90 }, player: H / 2, cpu: H / 2 }
  if (id === 'breakout') return { ball: { x: W / 2, y: H - 38, vx: 115, vy: -135 }, paddle: W / 2, bricks: Array(32).fill(true) }
  if (id === 'dodge') return { player: W / 2, hazards: [], elapsed: 0, spawn: 0 }
  return { phase: 'wait', timer: 1.2 + Math.random() * 2.2, result: '' }
}

function text(ctx: CanvasRenderingContext2D, colors: ArcadeColors, value: string, x: number, y: number, size = 12, color = colors.text, align: CanvasTextAlign = 'left') {
  ctx.fillStyle = color
  ctx.font = `600 ${size}px SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(value, x, y)
}

function panel(ctx: CanvasRenderingContext2D, colors: ArcadeColors) {
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = colors.grid
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
}

function drawMenu(ctx: CanvasRenderingContext2D, selected: number, colors: ArcadeColors) {
  panel(ctx, colors)
  text(ctx, colors, 'POCKET ARCADE', 18, 22, 16, colors.red)
  text(ctx, colors, '05 GAMES / SELECT ONE', 18, 43, 8, colors.muted)
  ctx.strokeStyle = colors.grid
  ctx.beginPath(); ctx.moveTo(18, 55); ctx.lineTo(W - 18, 55); ctx.stroke()
  games.forEach((game, index) => {
    const y = 72 + index * 27
    if (selected === index) {
      ctx.fillStyle = colors.selected
      ctx.fillRect(12, y - 11, W - 24, 22)
      ctx.fillStyle = colors.green
      ctx.fillRect(12, y - 11, 3, 22)
      text(ctx, colors, '▶', 21, y, 9, colors.green)
    }
    text(ctx, colors, game.label, 39, y, 12, selected === index ? colors.green : colors.text)
    text(ctx, colors, game.hint, W - 18, y, 8, colors.muted, 'right')
  })
  text(ctx, colors, 'A / ENTER TO PLAY', W / 2, H - 12, 8, colors.muted, 'center')
}

function drawHeader(ctx: CanvasRenderingContext2D, label: string, score: number, colors: ArcadeColors) {
  text(ctx, colors, label, 10, 11, 9, colors.muted)
  text(ctx, colors, String(score).padStart(4, '0'), W - 10, 11, 9, colors.green, 'right')
}

function resetBall(ball: { x: number; y: number; vx: number; vy: number }, direction = 1) {
  ball.x = W / 2
  ball.y = H / 2
  ball.vx = 145 * direction
  ball.vy = (Math.random() > 0.5 ? 1 : -1) * (70 + Math.random() * 45)
}

function GamepadButton({ action, label, onPress, onRelease, className = '' }: {
  action: Action
  label: string
  onPress: (action: Action) => void
  onRelease: (action: Action) => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={`arcade-control ${className}`}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        // Execute first: pointer capture can be unavailable in embedded browsers,
        // but a failed capture should never cancel the actual game input.
        onPress(action)
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          // Pointer-up/leave handlers still release held controls.
        }
      }}
      onPointerUp={() => onRelease(action)}
      onPointerCancel={() => onRelease(action)}
      onPointerLeave={(event) => {
        if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) onRelease(action)
      }}
      onLostPointerCapture={() => onRelease(action)}
    >
      <span aria-hidden="true">{label}</span>
    </button>
  )
}

export default function PocketArcade({ onClose = () => {}, embedded = false }: { onClose?: () => void; embedded?: boolean }) {
  const dark = useThemeMode()
  const instanceId = useId().replace(/:/g, '')
  const titleId = `arcade-title-${instanceId}`
  const hintId = `arcade-hint-${instanceId}`
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const consoleRef = useRef<HTMLElement>(null)
  const activityRef = useRef<ReturnType<typeof visibleAnimation> | null>(null)
  const lastRef = useRef(0)
  const selectedRef = useRef(0)
  const modeRef = useRef<Mode>('menu')
  const gameRef = useRef<GameId>('snake')
  const gameStateRef = useRef<GameState>(makeState('snake'))
  const scoreRef = useRef(0)
  const heldRef = useRef(new Set<Action>())
  const [mode, setMode] = useState<Mode>('menu')
  const [selected, setSelected] = useState(0)
  const [score, setScore] = useState(0)
  const activeGame = games.find(game => game.id === gameRef.current)?.label ?? games[selected].label
  const statusLabel = mode === 'menu' ? 'READY' : mode === 'playing' ? 'PLAYING' : 'GAME OVER'

  const syncScore = (value: number) => {
    scoreRef.current = value
    setScore(value)
  }

  const goMenu = useCallback(() => {
    modeRef.current = 'menu'
    setMode('menu')
    heldRef.current.clear()
  }, [])

  const startGame = useCallback((index = selectedRef.current) => {
    const id = games[index].id
    gameRef.current = id
    gameStateRef.current = makeState(id)
    scoreRef.current = 0
    setScore(0)
    modeRef.current = 'playing'
    setMode('playing')
  }, [])

  const endGame = useCallback(() => {
    modeRef.current = 'over'
    setMode('over')
    heldRef.current.clear()
  }, [])

  const press = useCallback((action: Action) => {
    heldRef.current.add(action)
    if (action === 'menu' || action === 'b') { goMenu(); return }
    if (modeRef.current === 'menu') {
      if (action === 'up') {
        const next = (selectedRef.current + games.length - 1) % games.length
        selectedRef.current = next
        setSelected(next)
      } else if (action === 'down') {
        const next = (selectedRef.current + 1) % games.length
        selectedRef.current = next
        setSelected(next)
      } else if (action === 'a') startGame()
      return
    }
    if (modeRef.current === 'over') {
      if (action === 'a') startGame()
      return
    }
    const state = gameStateRef.current
    if (isSnake(state)) {
      if (action === 'up' && state.dir[1] !== 1) state.next = [0, -1]
      if (action === 'down' && state.dir[1] !== -1) state.next = [0, 1]
      if (action === 'left' && state.dir[0] !== 1) state.next = [-1, 0]
      if (action === 'right' && state.dir[0] !== -1) state.next = [1, 0]
    } else if (isQuickDraw(state) && action === 'a') {
      if (state.phase === 'wait') { state.phase = 'result'; state.result = 'TOO SOON'; endGame() }
      else if (state.phase === 'go') { state.phase = 'result'; state.result = 'NICE DRAW'; syncScore(Math.max(1, Math.round(1000 - state.timer * 1000))); endGame() }
    }
  }, [endGame, goMenu, startGame])

  const release = useCallback((action: Action) => heldRef.current.delete(action), [])

  useEffect(() => {
    if (!embedded) closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    if (!embedded) document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (embedded && !consoleRef.current?.contains(document.activeElement)) return
      const map: Record<string, Action | undefined> = {
        ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
        Enter: 'a', ' ': 'a', Backspace: 'b', m: 'menu', M: 'menu',
      }
      if (event.key === 'Escape') { if (!embedded) onClose(); return }
      const action = map[event.key]
      if (action) { event.preventDefault(); if (!event.repeat) press(action) }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      const map: Record<string, Action | undefined> = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }
      const action = map[event.key]
      if (action) release(action)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      if (!embedded) document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [embedded, onClose, press, release])


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * pixelRatio)
    canvas.height = Math.round(H * pixelRatio)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingEnabled = true

    const draw = () => {
      const colors = dark ? DARK_COLORS : LIGHT_COLORS
      if (modeRef.current === 'menu') { drawMenu(ctx, selectedRef.current, colors); return }
      const state = gameStateRef.current
      panel(ctx, colors)
      drawHeader(ctx, games.find(game => game.id === gameRef.current)?.label ?? '', scoreRef.current, colors)

      if (isSnake(state)) {
        const cell = 14; const ox = 20; const oy = 18
        ctx.fillStyle = colors.red; ctx.fillRect(ox + state.food[0] * cell + 3, oy + state.food[1] * cell + 3, 8, 8)
        state.body.forEach(([x, y], index) => { ctx.fillStyle = index ? colors.greenDim : colors.green; ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, 12, 12) })
      } else if (isPong(state)) {
        ctx.fillStyle = colors.green; ctx.fillRect(15, state.player - 22, 6, 44)
        ctx.fillStyle = colors.greenDim; ctx.fillRect(W - 21, state.cpu - 22, 6, 44)
        ctx.fillStyle = colors.text; ctx.fillRect(state.ball.x - 4, state.ball.y - 4, 8, 8)
        ctx.setLineDash([5, 6]); ctx.strokeStyle = colors.grid; ctx.beginPath(); ctx.moveTo(W / 2, 24); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([])
      } else if (isBreakout(state)) {
        state.bricks.forEach((alive, index) => {
          if (!alive) return
          const col = index % 8; const row = Math.floor(index / 8)
          ctx.fillStyle = row % 2 ? colors.greenDim : colors.green
          ctx.fillRect(13 + col * 37, 31 + row * 14, 32, 9)
        })
        ctx.fillStyle = colors.text; ctx.fillRect(state.paddle - 25, H - 17, 50, 6); ctx.fillRect(state.ball.x - 3, state.ball.y - 3, 6, 6)
      } else if (isDodge(state)) {
        ctx.strokeStyle = colors.grid; ctx.setLineDash([8, 10]); ctx.beginPath(); ctx.moveTo(W / 2, 25); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([])
        ctx.fillStyle = colors.green; ctx.fillRect(state.player - 10, H - 28, 20, 16)
        ctx.fillStyle = colors.red; state.hazards.forEach(hazard => ctx.fillRect(hazard.x - 8, hazard.y - 8, 16, 16))
      } else if (isQuickDraw(state)) {
        const go = state.phase === 'go'
        ctx.fillStyle = go ? colors.go : colors.red
        ctx.beginPath(); ctx.arc(W / 2, H / 2, 42, 0, Math.PI * 2); ctx.fill()
        text(ctx, colors, go ? 'DRAW!' : 'WAIT…', W / 2, H / 2, 18, colors.bg, 'center')
        text(ctx, colors, 'PRESS A ONLY ON LIGHT', W / 2, H - 24, 9, colors.muted, 'center')
      }

      if (modeRef.current === 'over') {
        ctx.fillStyle = colors.overlay; ctx.fillRect(44, 65, W - 88, 90)
        text(ctx, colors, isQuickDraw(state) ? state.result : 'GAME OVER', W / 2, 91, 18, colors.overlayText, 'center')
        text(ctx, colors, `SCORE ${scoreRef.current}`, W / 2, 119, 11, colors.overlayText, 'center')
        text(ctx, colors, 'A RETRY  ·  B MENU', W / 2, 141, 8, colors.overlayText, 'center')
      }
    }

    const update = (dt: number) => {
      if (modeRef.current !== 'playing') return
      const state = gameStateRef.current
      const held = heldRef.current
      if (isSnake(state)) {
        state.elapsed += dt
        if (state.elapsed >= Math.max(0.065, 0.12 - scoreRef.current * 0.002)) {
          state.elapsed = 0; state.dir = state.next
          const head: [number, number] = [state.body[0][0] + state.dir[0], state.body[0][1] + state.dir[1]]
          if (head[0] < 0 || head[0] >= 20 || head[1] < 0 || head[1] >= 14 || state.body.some(([x, y]) => x === head[0] && y === head[1])) { endGame(); return }
          state.body.unshift(head)
          if (head[0] === state.food[0] && head[1] === state.food[1]) {
            syncScore(scoreRef.current + 1)
            do { state.food = [randomInt(20), randomInt(14)] } while (state.body.some(([x, y]) => x === state.food[0] && y === state.food[1]))
          } else state.body.pop()
        }
      } else if (isPong(state)) {
        const speed = 180
        if (held.has('up')) state.player -= speed * dt
        if (held.has('down')) state.player += speed * dt
        state.player = Math.max(43, Math.min(H - 24, state.player))
        state.cpu += Math.sign(state.ball.y - state.cpu) * 92 * dt
        state.ball.x += state.ball.vx * dt; state.ball.y += state.ball.vy * dt
        if (state.ball.y < 25 || state.ball.y > H - 5) state.ball.vy *= -1
        if (state.ball.vx < 0 && state.ball.x < 24 && Math.abs(state.ball.y - state.player) < 27) { state.ball.vx = Math.abs(state.ball.vx) * 1.04; syncScore(scoreRef.current + 1) }
        if (state.ball.vx > 0 && state.ball.x > W - 24 && Math.abs(state.ball.y - state.cpu) < 29) state.ball.vx = -Math.abs(state.ball.vx)
        if (state.ball.x < -8) endGame()
        if (state.ball.x > W + 8) { syncScore(scoreRef.current + 3); resetBall(state.ball, -1) }
      } else if (isBreakout(state)) {
        if (held.has('left')) state.paddle -= 190 * dt
        if (held.has('right')) state.paddle += 190 * dt
        state.paddle = Math.max(32, Math.min(W - 32, state.paddle))
        state.ball.x += state.ball.vx * dt; state.ball.y += state.ball.vy * dt
        if (state.ball.x < 4 || state.ball.x > W - 4) state.ball.vx *= -1
        if (state.ball.y < 24) state.ball.vy = Math.abs(state.ball.vy)
        if (state.ball.y > H - 25 && state.ball.y < H - 10 && Math.abs(state.ball.x - state.paddle) < 31) state.ball.vy = -Math.abs(state.ball.vy)
        if (state.ball.y > H + 8) { endGame(); return }
        const col = Math.floor((state.ball.x - 13) / 37); const row = Math.floor((state.ball.y - 31) / 14); const index = row * 8 + col
        if (col >= 0 && col < 8 && row >= 0 && row < 4 && state.bricks[index]) { state.bricks[index] = false; state.ball.vy *= -1; syncScore(scoreRef.current + 1) }
        if (state.bricks.every(alive => !alive)) endGame()
      } else if (isDodge(state)) {
        if (held.has('left')) state.player -= 180 * dt
        if (held.has('right')) state.player += 180 * dt
        state.player = Math.max(16, Math.min(W - 16, state.player))
        state.elapsed += dt; state.spawn -= dt
        if (state.spawn <= 0) { state.hazards.push({ x: 15 + Math.random() * (W - 30), y: 28, speed: 80 + Math.random() * 80 + scoreRef.current * 2 }); state.spawn = Math.max(0.28, 0.75 - scoreRef.current * 0.01) }
        state.hazards.forEach(hazard => { hazard.y += hazard.speed * dt })
        if (state.hazards.some(hazard => Math.abs(hazard.x - state.player) < 18 && hazard.y > H - 42 && hazard.y < H - 8)) { endGame(); return }
        const passed = state.hazards.filter(hazard => hazard.y >= H + 10).length
        if (passed) { state.hazards = state.hazards.filter(hazard => hazard.y < H + 10); syncScore(scoreRef.current + passed) }
      } else if (isQuickDraw(state)) {
        if (state.phase === 'wait') {
          state.timer -= dt
          if (state.timer <= 0) { state.phase = 'go'; state.timer = 0 }
        } else if (state.phase === 'go') {
          state.timer += dt
          if (state.timer > 1.1) { state.result = 'TOO SLOW'; endGame() }
        }
      }
    }

    const activity = visibleAnimation(consoleRef.current ?? canvas, now => {
      const dt = Math.min(0.034, Math.max(0, (now - (lastRef.current || now)) / 1000))
      lastRef.current = now
      update(dt); draw()
    }, () => modeRef.current === 'playing')
    activityRef.current = activity
    lastRef.current = 0
    return () => { activity.dispose(); activityRef.current = null }

  }, [dark, endGame])

  useEffect(() => { activityRef.current?.wake() }, [mode, selected])

  const console = (
      <section
        ref={consoleRef}
        className={`arcade-console${embedded ? ' arcade-console--embedded' : ''}`}
        role={embedded ? 'region' : 'dialog'}
        aria-modal={embedded ? undefined : true}
        aria-labelledby={titleId}
        aria-describedby={hintId}
        tabIndex={embedded ? 0 : undefined}
        onPointerDownCapture={(event) => {
          if (embedded) event.currentTarget.focus({ preventScroll: true })
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="arcade-console__topline">
          <span id={titleId}>POCKET ARCADE <small>/ 05</small></span>
          <span className={`arcade-console__status arcade-console__status--${mode}`}>
            <i aria-hidden="true" />
            {statusLabel}
          </span>
          {!embedded && <button ref={closeRef} type="button" className="arcade-close" onClick={onClose} aria-label="Close Pocket Arcade">×</button>}
        </div>
        <div className="arcade-screen-bezel">
          <canvas ref={canvasRef} width={W} height={H} aria-label={`${mode === 'menu' ? `Game menu, ${games[selected].label} selected` : activeGame}, score ${score}`} />
          <span className="arcade-power" aria-hidden="true" />
        </div>
        <div className="arcade-body">
          <div className="arcade-dpad" aria-label="Directional controls">
            <GamepadButton action="up" label="Up" onPress={press} onRelease={release} className="arcade-dpad__up" />
            <GamepadButton action="left" label="Left" onPress={press} onRelease={release} className="arcade-dpad__left" />
            <span className="arcade-dpad__center" aria-hidden="true" />
            <GamepadButton action="right" label="Right" onPress={press} onRelease={release} className="arcade-dpad__right" />
            <GamepadButton action="down" label="Down" onPress={press} onRelease={release} className="arcade-dpad__down" />
          </div>
          <div className="arcade-actions">
            <GamepadButton action="menu" label="X" onPress={press} onRelease={release} className="arcade-action arcade-action--x" />
            <GamepadButton action="b" label="Y" onPress={press} onRelease={release} className="arcade-action arcade-action--y" />
            <GamepadButton action="b" label="B" onPress={press} onRelease={release} className="arcade-action arcade-action--b" />
            <GamepadButton action="a" label="A" onPress={press} onRelease={release} className="arcade-action arcade-action--a" />
          </div>
          <div className="arcade-system-controls">
            <button type="button" className="arcade-menu-button" onClick={goMenu}>MENU</button>
            <button type="button" onClick={() => { if (modeRef.current === 'menu') startGame(); else goMenu() }}>SELECT</button>
            <button type="button" onClick={() => startGame()}>START</button>
          </div>
          <span className="arcade-speaker" aria-hidden="true" />
        </div>
        <p className="arcade-key-hint" id={hintId}>
          {embedded && <span className="arcade-key-hint__lead">Click or tab in</span>}
          <span><kbd>↑ ↓ ← →</kbd> move</span>
          <span><kbd>Enter</kbd> play</span>
          {!embedded && <span><kbd>Esc</kbd> close</span>}
        </p>
      </section>
  )

  if (embedded) return console

  return createPortal(
    <div className="arcade-overlay" role="presentation" data-cursor-exclude onPointerDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      {console}
    </div>,
    document.body,
  )
}
