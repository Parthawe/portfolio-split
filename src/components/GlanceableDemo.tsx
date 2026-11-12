import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   Glanceable Demo — simulates Mentra's 640×400 display.

   Shows the three UI layers:
   1. Ambient: time + battery (always on, nearly invisible)
   2. Focus: notification card (appears, waits, disappears)
   3. Immersive: navigation turn-by-turn

   Cycles through automatically, or click to trigger manually.
   ═══════════════════════════════════════════════════════════ */

const NOTIFICATIONS = [
  { app: 'Messages', title: 'Sarah Chen', body: 'Are we still meeting at 3?', icon: '💬' },
  { app: 'Calendar', title: 'In 10 min', body: 'Design review with eng team', icon: '📅' },
  { app: 'Transit', title: 'Walk 2 min', body: 'Turn left on Broadway', icon: '🧭' },
  { app: 'Weather', title: '72°F Sunny', body: 'No umbrella needed', icon: '☀️' },
  { app: 'Mentra', title: 'Focus mode', body: 'Notifications paused for 30 min', icon: '🎯' },
]

type Layer = 'ambient' | 'focus' | 'immersive'

export default function GlanceableDemo() {
  const [layer, setLayer] = useState<Layer>('ambient')
  const [notifIdx, setNotifIdx] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [time, setTime] = useState(new Date())

  // Update clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-cycle notifications
  useEffect(() => {
    const cycle = () => {
      setLayer('focus')
      setShowNotif(true)
      timerRef.current = setTimeout(() => {
        setShowNotif(false)
        setTimeout(() => {
          setLayer('ambient')
          setNotifIdx(i => (i + 1) % NOTIFICATIONS.length)
          timerRef.current = setTimeout(cycle, 3000)
        }, 500)
      }, 3500)
    }
    timerRef.current = setTimeout(cycle, 2000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const notif = NOTIFICATIONS[notifIdx]
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
      {/* The "glasses lens" — simulated transparent display */}
      <div style={{
        width: '100%', maxWidth: 480,
        aspectRatio: '640 / 400',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(120,140,160,0.08), rgba(80,100,120,0.04))',
        border: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
        fontFamily: 'var(--sans)',
      }}>
        {/* Simulated "world" behind the display */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #b8c6d4 0%, #8a9caa 40%, #5a6a78 100%)',
          opacity: 0.15,
        }} />

        {/* ── AMBIENT LAYER — always visible ── */}
        <div style={{
          position: 'absolute', top: 12, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          opacity: 0.5,
          transition: 'opacity 0.5s',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em' }}>
            {timeStr}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 20, height: 9, borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.3)',
              padding: 1,
            }}>
              <div style={{ width: '75%', height: '100%', borderRadius: 1, background: 'rgba(255,255,255,0.4)' }} />
            </div>
          </div>
        </div>

        {/* ── FOCUS LAYER — notification card ── */}
        <div style={{
          position: 'absolute',
          top: showNotif ? '50%' : '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%', maxWidth: 320,
          padding: '14px 16px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          opacity: showNotif ? 1 : 0,
          transition: 'opacity 0.4s, top 0.4s ease',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{notif.icon}</span>
            <div>
              <div style={{
                fontSize: 8, fontWeight: 500, color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3,
              }}>
                {notif.app}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                {notif.title}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>
                {notif.body}
              </div>
            </div>
          </div>
          {/* Action hints */}
          <div style={{
            display: 'flex', gap: 8, marginTop: 10,
            fontSize: 9, color: 'rgba(255,255,255,0.25)',
            fontFamily: 'var(--mono)', letterSpacing: '0.04em',
          }}>
            <span>↑ Dismiss</span>
            <span>•</span>
            <span>&ldquo;Reply&rdquo; to respond</span>
          </div>
        </div>

        {/* ── Layer indicator ── */}
        <div style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          {(['ambient', 'focus', 'immersive'] as Layer[]).map(l => (
            <div key={l} style={{
              width: 4, height: 4, borderRadius: '50%',
              background: layer === l ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 32px)',
        fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--ink-20)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span style={{ opacity: layer === 'ambient' ? 1 : 0.4, transition: 'opacity 0.3s' }}>Ambient</span>
        <span style={{ opacity: layer === 'focus' ? 1 : 0.4, transition: 'opacity 0.3s' }}>Focus</span>
        <span style={{ opacity: layer === 'immersive' ? 1 : 0.4, transition: 'opacity 0.3s' }}>Immersive</span>
      </div>
    </div>
  )
}
