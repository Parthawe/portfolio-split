import PortfolioSlider from './PortfolioSlider'
import { useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   Lighting Slider — before/after set design reveal.

   Slider transitions between "empty stage" and "lit greenhouse"
   showing how lighting transforms the Drowning set.
   Uses CSS blend modes and opacity to simulate the effect.
   ═══════════════════════════════════════════════════════════ */

export default function LightingSlider({ beforeSrc, afterSrc, beforeLabel = 'Stage Dark', afterLabel = 'Stage Lit' }: {
  beforeSrc: string
  afterSrc: string
  beforeLabel?: string
  afterLabel?: string
}) {
  const [value, setValue] = useState(0)

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Before image (always visible) */}
      <div style={{ position: 'relative', width: '100%' }}>
        <img
          src={beforeSrc}
          alt={beforeLabel}
          style={{ display: 'block', width: '100%', height: 'auto', filter: `brightness(${0.15 + value * 0.85})` }}
          loading="lazy"
        />

        {/* After image overlay — fades in */}
        <img
          src={afterSrc}
          alt={afterLabel}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: value,
            transition: 'opacity 0.15s',
          }}
          loading="lazy"
        />

        {/* Labels */}
        <div style={{
          position: 'absolute', bottom: 12, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--mono)', fontSize: '16px',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.94)',
          textShadow: '0 1px 8px rgba(0,0,0,0.9)',
          pointerEvents: 'none',
        }}>
          <span style={{ opacity: 1 - value }}>{beforeLabel}</span>
          <span style={{ opacity: value }}>{afterLabel}</span>
        </div>
      </div>

      {/* Slider */}
      <div style={{
        padding: '10px 16px',
        background: 'var(--ink-03)',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '16px', color: 'var(--ink-70)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Dark
        </span>
        <PortfolioSlider
          type="range" min={0} max={100} value={value * 100}
          onChange={e => setValue(Number(e.target.value) / 100)}
          aria-label="Lighting intensity"
          style={{ width: 'clamp(120px, 30vw, 220px)', accentColor: 'var(--ink-30)' }}
        />
        <span style={{ fontFamily: 'var(--mono)', fontSize: '16px', color: 'var(--ink-70)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Lit
        </span>
      </div>
    </div>
  )
}
