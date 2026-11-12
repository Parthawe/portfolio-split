import { useState, useCallback, type ReactElement } from 'react'

/* ═══════════════════════════════════════════════════════════
   Block Coding Demo — isometric block builder.

   Kids stack colorful 3D blocks (HTML elements) to build
   a castle/webpage. Isometric SVG rendering. Click blocks
   in palette to stack them. Live code preview on the right.
   ═══════════════════════════════════════════════════════════ */

interface Block {
  id: string
  label: string
  color: string
  darkColor: string
  topColor: string
  tag: string
  h: number // height in isometric units
}

const BLOCKS: Block[] = [
  { id: 'body',      label: 'Body',      color: '#3B82F6', darkColor: '#2563EB', topColor: '#60A5FA', tag: '<body>',      h: 1.2 },
  { id: 'container', label: 'Container', color: '#8B5CF6', darkColor: '#7C3AED', topColor: '#A78BFA', tag: '<div>',       h: 1 },
  { id: 'header',    label: 'Header',    color: '#EF4444', darkColor: '#DC2626', topColor: '#F87171', tag: '<h1>',        h: 0.8 },
  { id: 'image',     label: 'Image',     color: '#F97316', darkColor: '#EA580C', topColor: '#FB923C', tag: '<img>',       h: 1.2 },
  { id: 'text',      label: 'Text',      color: '#22C55E', darkColor: '#16A34A', topColor: '#4ADE80', tag: '<p>',         h: 0.6 },
  { id: 'button',    label: 'Button',    color: '#06B6D4', darkColor: '#0891B2', topColor: '#22D3EE', tag: '<button>',    h: 0.5 },
  { id: 'nav',       label: 'Nav',       color: '#EC4899', darkColor: '#DB2777', topColor: '#F472B6', tag: '<nav>',       h: 0.7 },
  { id: 'card',      label: 'Card',      color: '#EAB308', darkColor: '#CA8A04', topColor: '#FACC15', tag: '<article>',   h: 1.4 },
]

const PRESETS: { name: string; blocks: string[] }[] = [
  { name: 'Empty', blocks: [] },
  { name: 'Simple', blocks: ['body', 'header', 'text', 'button'] },
  { name: 'Cards', blocks: ['body', 'container', 'card', 'card', 'card'] },
  { name: 'Netflix', blocks: ['body', 'nav', 'header', 'container', 'card', 'image', 'card', 'image'] },
]

// Isometric projection
const IX = 0.866
const IY = 0.5
function iso(x: number, y: number, z: number): [number, number] {
  return [180 + (x - z) * IX * 22, 280 - y * 18 + (x + z) * IY * 22]
}

// Draw an isometric box
function IsoBlock({ x, z, y, w, d, h, color, darkColor, topColor, label, tag, onRemove }: {
  x: number; z: number; y: number; w: number; d: number; h: number
  color: string; darkColor: string; topColor: string
  label: string; tag: string; onRemove: () => void
}) {
  // 6 corners for 3 visible faces
  const fl = iso(x, y + h, z)
  const fr = iso(x + w, y + h, z)
  const br = iso(x + w, y + h, z + d)
  const bl = iso(x, y + h, z + d)
  const fbl = iso(x, y, z)
  const fbr = iso(x + w, y, z)
  const bbr = iso(x + w, y, z + d)

  // Top face
  const top = `${fl} ${fr} ${br} ${bl}`
  // Front face
  const front = `${fl} ${fr} ${fbr} ${fbl}`
  // Right face
  const right = `${fr} ${br} ${bbr} ${fbr}`

  // Label position (center of top face)
  const cx = (fl[0] + fr[0] + br[0] + bl[0]) / 4
  const cy = (fl[1] + fr[1] + br[1] + bl[1]) / 4

  return (
    <g style={{ cursor: 'pointer' }} onClick={onRemove}>
      {/* Front face */}
      <polygon points={front} fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      {/* Right face */}
      <polygon points={right} fill={darkColor} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
      {/* Top face */}
      <polygon points={top} fill={topColor} stroke="rgba(0,0,0,0.1)" strokeWidth={0.5} />
      {/* Label */}
      <text x={cx} y={cy - 2} textAnchor="middle" fill="rgba(255,255,255,0.9)"
        fontSize={7} fontWeight={700} fontFamily="var(--mono)">
        {label}
      </text>
      <text x={cx} y={cy + 7} textAnchor="middle" fill="rgba(255,255,255,0.5)"
        fontSize={5} fontFamily="var(--mono)">
        {tag}
      </text>
    </g>
  )
}

// Grid floor
function IsoGrid() {
  const lines: ReactElement[] = []
  for (let i = 0; i <= 6; i++) {
    const a = iso(i, 0, 0), b = iso(i, 0, 6)
    lines.push(<line key={`x${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />)
    const c = iso(0, 0, i), d = iso(6, 0, i)
    lines.push(<line key={`z${i}`} x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />)
  }
  return <g>{lines}</g>
}

export default function BlockCodingDemo() {
  const [placed, setPlaced] = useState<string[]>([])

  const addBlock = useCallback((blockId: string) => {
    setPlaced(prev => [...prev, blockId])
  }, [])

  const removeBlock = useCallback((idx: number) => {
    setPlaced(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const loadPreset = useCallback((blocks: string[]) => {
    setPlaced(blocks)
  }, [])

  // Compute stacked positions
  const stackedBlocks = placed.map((id, i) => {
    const block = BLOCKS.find(b => b.id === id)!
    // Stack on a grid pattern: first 3 in a row, then next row back
    const col = i % 3
    const row = Math.floor(i / 3)
    // Y = cumulative height for same column
    let y = 0
    for (let j = 0; j < i; j++) {
      if (j % 3 === col && Math.floor(j / 3) === row) {
        y += BLOCKS.find(b => b.id === placed[j])!.h
      }
    }
    // Actually simpler: just stack vertically per column
    const colBlocks = placed.slice(0, i).filter((_, idx) => idx % 3 === col)
    y = colBlocks.reduce((sum, bid) => sum + BLOCKS.find(b => b.id === bid)!.h, 0)

    return { ...block, x: 1 + col * 1.8, z: 1 + row * 1.8, y, idx: i }
  })

  return (
    <div style={{
      width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      border: '1px solid rgba(59,130,246,0.15)',
      background: 'linear-gradient(160deg, #0a0e1a, #0d1225)',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 14px', borderBottom: '1px solid rgba(59,130,246,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '8px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(96,165,250,0.4)' }}>
          Code for Build
        </span>
        <div style={{ display: 'flex', gap: 3 }}>
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => loadPreset(p.blocks)} style={{
              padding: '2px 7px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--mono)', fontSize: '6px', cursor: 'pointer',
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex' }} className="cfb-layout">
        {/* Block palette */}
        <div style={{
          width: 90, padding: '8px 6px', borderRight: '1px solid rgba(59,130,246,0.06)',
          display: 'flex', flexDirection: 'column', gap: 3,
        }} className="cfb-palette">
          <span style={{ fontFamily: 'var(--mono)', fontSize: '6px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Blocks
          </span>
          {BLOCKS.map(block => (
            <button key={block.id} onClick={() => addBlock(block.id)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 6px', borderRadius: 4,
              border: `1px solid ${block.color}40`, background: `${block.color}10`,
              cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '7px',
              fontWeight: 600, color: block.color, textAlign: 'left',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: block.color, flexShrink: 0 }} />
              {block.label}
            </button>
          ))}
        </div>

        {/* Isometric view */}
        <div style={{ flex: 1, position: 'relative' }}>
          <svg viewBox="0 0 360 320" width="100%" style={{ display: 'block' }}>
            <IsoGrid />

            {/* Render blocks back-to-front for correct overlap */}
            {stackedBlocks
              .sort((a, b) => (a.z + a.x) - (b.z + b.x)) // painter's algorithm
              .map(block => (
                <IsoBlock
                  key={block.idx}
                  x={block.x} z={block.z} y={block.y}
                  w={1.5} d={1.5} h={block.h}
                  color={block.color} darkColor={block.darkColor} topColor={block.topColor}
                  label={block.label} tag={block.tag}
                  onRemove={() => removeBlock(block.idx)}
                />
              ))
            }

            {/* Empty state */}
            {placed.length === 0 && (
              <text x={180} y={200} textAnchor="middle" fill="rgba(255,255,255,0.08)"
                fontSize={9} fontFamily="var(--mono)">
                Click blocks to build
              </text>
            )}
          </svg>
        </div>

        {/* Code preview */}
        <div style={{
          width: 120, padding: '8px', borderLeft: '1px solid rgba(59,130,246,0.06)',
          fontFamily: 'var(--mono)', fontSize: '7px', color: 'rgba(255,255,255,0.35)',
          overflowY: 'auto', maxHeight: 320,
        }} className="cfb-code">
          <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Code
          </span>
          <pre style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {placed.length === 0 ? (
              <span style={{ color: 'rgba(255,255,255,0.08)' }}>{'// empty'}</span>
            ) : (
              placed.map((id, i) => {
                const b = BLOCKS.find(bl => bl.id === id)!
                return (
                  <div key={i}>
                    <span style={{ color: b.color }}>{b.tag}</span>
                  </div>
                )
              })
            )}
          </pre>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .cfb-layout { flex-direction: column !important; }
          .cfb-palette { width: 100% !important; flex-direction: row !important; flex-wrap: wrap; border-right: none !important; border-bottom: 1px solid rgba(59,130,246,0.06); }
          .cfb-code { width: 100% !important; max-height: 120px !important; border-left: none !important; border-top: 1px solid rgba(59,130,246,0.06); }
        }
      `}</style>
    </div>
  )
}
