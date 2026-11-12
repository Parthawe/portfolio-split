import { useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   Route Demo — Raahi's 8-mode color system.

   Shows how the color-coded transport system works:
   pick a route and see the multimodal journey with each
   segment in its transport mode's color.
   ═══════════════════════════════════════════════════════════ */

const MODES = [
  { name: 'Bus', color: '#3B82F6', icon: '🚌' },
  { name: 'Metro', color: '#EF4444', icon: '🚇' },
  { name: 'Auto', color: '#F59E0B', icon: '🛺' },
  { name: 'Walk', color: '#22C55E', icon: '🚶' },
  { name: 'Train', color: '#8B5CF6', icon: '🚆' },
  { name: 'Cycle', color: '#06B6D4', icon: '🚲' },
  { name: 'Cab', color: '#EC4899', icon: '🚕' },
  { name: 'Ferry', color: '#14B8A6', icon: '⛴' },
]

const ROUTES = [
  {
    from: 'Shivajinagar',
    to: 'Hinjewadi IT Park',
    segments: [
      { mode: 3, duration: '4 min', detail: 'Walk to bus stop' },
      { mode: 0, duration: '25 min', detail: 'Route 104 → Wakad' },
      { mode: 6, duration: '8 min', detail: 'Shared cab to IT Park' },
    ],
    total: '37 min',
  },
  {
    from: 'Pune Station',
    to: 'Kothrud',
    segments: [
      { mode: 3, duration: '3 min', detail: 'Walk to Metro' },
      { mode: 1, duration: '12 min', detail: 'Purple Line → Nal Stop' },
      { mode: 2, duration: '5 min', detail: 'Auto to destination' },
    ],
    total: '20 min',
  },
  {
    from: 'Koregaon Park',
    to: 'Swargate',
    segments: [
      { mode: 5, duration: '6 min', detail: 'Cycle share to MG Road' },
      { mode: 0, duration: '15 min', detail: 'Route 56 → Swargate' },
    ],
    total: '21 min',
  },
]

export default function RouteDemo() {
  const [routeIdx, setRouteIdx] = useState(0)
  const route = ROUTES[routeIdx]

  return (
    <div style={{
      width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      border: '1px solid var(--ink-06)',
      background: 'var(--ink-03)',
    }}>
      {/* Color legend */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--ink-04)',
        display: 'flex', flexWrap: 'wrap', gap: '6px 12px',
        justifyContent: 'center',
      }}>
        {MODES.map(m => (
          <div key={m.name} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--mono)', fontSize: 7,
            color: 'var(--ink-30)', textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color }} />
            {m.name}
          </div>
        ))}
      </div>

      {/* Route selector */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid var(--ink-04)',
        display: 'flex', gap: 4,
        justifyContent: 'center',
      }}>
        {ROUTES.map((r, i) => (
          <button key={i} onClick={() => setRouteIdx(i)} style={{
            padding: '4px 10px', borderRadius: 'var(--radius-pill)',
            border: i === routeIdx ? '1px solid var(--ink-15)' : '1px solid var(--ink-06)',
            background: i === routeIdx ? 'var(--ink-06)' : 'transparent',
            color: i === routeIdx ? 'var(--ink-60)' : 'var(--ink-25)',
            fontFamily: 'var(--mono)', fontSize: 7,
            letterSpacing: '0.04em', cursor: 'pointer',
          }}>
            {r.from} → {r.to}
          </button>
        ))}
      </div>

      {/* Route visualization */}
      <div style={{ padding: '16px 20px' }}>
        {/* From label */}
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-25)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
        }}>
          {route.from}
        </div>

        {/* Segments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 12 }}>
          {route.segments.map((seg, i) => {
            const mode = MODES[seg.mode]
            return (
              <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                {/* Vertical color bar */}
                <div style={{
                  width: 3, background: mode.color,
                  borderRadius: 2,
                  minHeight: 48,
                  position: 'relative',
                }}>
                  {/* Dot at top */}
                  <div style={{
                    position: 'absolute', top: -3, left: -4,
                    width: 11, height: 11, borderRadius: '50%',
                    background: mode.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 6,
                  }}>
                  </div>
                </div>

                {/* Content */}
                <div style={{ paddingBottom: 12, flex: 1 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2,
                  }}>
                    <span style={{ fontSize: 14 }}>{mode.icon}</span>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
                      color: mode.color,
                    }}>
                      {mode.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 8,
                      color: 'var(--ink-30)',
                    }}>
                      {seg.duration}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--sans)', fontSize: 11,
                    color: 'var(--ink-40)', lineHeight: 1.4,
                  }}>
                    {seg.detail}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* To label + total */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingLeft: 12, paddingTop: 4,
          borderTop: '1px solid var(--ink-04)',
          marginTop: 4,
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-25)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {route.to}
          </span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
            color: 'var(--ink-50)',
          }}>
            {route.total}
          </span>
        </div>
      </div>
    </div>
  )
}
