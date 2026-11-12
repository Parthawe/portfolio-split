import { useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   Trust Tier Demo — Clawed Chat's three trust levels.

   Select a tier and see how the AI behaves differently:
   Read-only, Draft-first, or Autonomous.
   ═══════════════════════════════════════════════════════════ */

const TIERS = [
  {
    name: 'Read-only',
    icon: '👁',
    color: '#60a5fa',
    desc: 'AI can look at your files but can\'t touch anything',
    example: [
      { role: 'user', text: 'Summarize the Q3 report' },
      { role: 'ai', text: 'The Q3 report shows revenue up 12% YoY. Key drivers: enterprise expansion (+18%) offset by SMB churn (-3%). Margin improved 200bps.' },
      { role: 'system', text: '📋 Read 3 files · Changed nothing' },
    ],
  },
  {
    name: 'Draft-first',
    icon: '✏️',
    color: '#f59e0b',
    desc: 'AI proposes changes — you approve each one before it happens',
    example: [
      { role: 'user', text: 'Fix the typo in the homepage headline' },
      { role: 'ai', text: 'Found typo on line 42: "Desgin" → "Design". Here\'s the proposed change:' },
      { role: 'diff', text: '- Desgin Engineer\n+ Design Engineer' },
      { role: 'system', text: '⏸ Waiting for your approval before applying' },
    ],
  },
  {
    name: 'Autonomous',
    icon: '🤖',
    color: '#22c55e',
    desc: 'AI acts on its own — you review the receipt afterward',
    example: [
      { role: 'user', text: 'Fix the typo in the homepage headline' },
      { role: 'ai', text: 'Fixed. Changed "Desgin" to "Design" on line 42 of index.tsx.' },
      { role: 'system', text: '✅ Applied · 1 file changed · Receipt logged' },
    ],
  },
]

export default function TrustTierDemo() {
  const [tierIdx, setTierIdx] = useState(1)
  const tier = TIERS[tierIdx]

  return (
    <div style={{
      width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      border: '1px solid var(--ink-06)',
      background: 'var(--ink-03)',
    }}>
      {/* Tier selector */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--ink-06)',
      }}>
        {TIERS.map((t, i) => (
          <button key={t.name} onClick={() => setTierIdx(i)} style={{
            flex: 1, padding: '12px 8px',
            border: 'none', cursor: 'pointer',
            background: i === tierIdx ? 'var(--ink-06)' : 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            transition: 'background 0.2s',
          }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 600,
              color: i === tierIdx ? tier.color : 'var(--ink-30)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {t.name}
            </span>
          </button>
        ))}
      </div>

      {/* Description */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--ink-04)',
        fontFamily: 'var(--mono)', fontSize: 9,
        color: 'var(--ink-40)',
      }}>
        {tier.desc}
      </div>

      {/* Chat example */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tier.example.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8,
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%',
              padding: msg.role === 'diff' ? '8px 10px' : '8px 12px',
              borderRadius: 8,
              fontFamily: msg.role === 'diff' ? 'var(--mono)' : 'var(--sans)',
              fontSize: msg.role === 'system' ? 8 : 11,
              lineHeight: 1.5,
              whiteSpace: msg.role === 'diff' ? 'pre' : 'normal',
              ...(msg.role === 'user' ? {
                background: `${tier.color}15`,
                border: `1px solid ${tier.color}25`,
                color: 'var(--ink-70)',
              } : msg.role === 'ai' ? {
                background: 'var(--ink-06)',
                color: 'var(--ink-60)',
              } : msg.role === 'diff' ? {
                background: 'var(--ink-06)',
                color: 'var(--ink-50)',
                fontSize: 10,
                borderLeft: `2px solid ${tier.color}`,
              } : {
                background: 'transparent',
                color: 'var(--ink-25)',
                fontFamily: 'var(--mono)',
                letterSpacing: '0.02em',
              }),
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
