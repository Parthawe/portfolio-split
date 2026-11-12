import { observeVisible } from '../utils/visibleActivity'
import PortfolioSlider from './PortfolioSlider'
import MoniacHydraulic from './MoniacHydraulic'
import './MoniacSimulator.css'
import { useState, useCallback, useRef, useEffect } from 'react'

// Browser rules are preserved; the hydraulic view follows the original game screen.

interface Controls {
  taxRate: number
  govSpending: number
  interestRate: number
  investmentRate: number
  consumerSpending: number
  imports: number
  exports: number
}
interface Econ { gdp: number; inflation: number; employment: number; debt: number }

const INIT_C: Controls = { taxRate: 35, govSpending: 45, interestRate: 30, investmentRate: 50, consumerSpending: 60, imports: 40, exports: 45 }
const INIT_E: Econ = { gdp: 55, inflation: 25, employment: 60, debt: 30 }

const EVENTS = [
  { name: 'Trade War', icon: '⚔️', fx: 'Exports crash, costs spike', apply: (e: Econ): Econ => ({ ...e, gdp: e.gdp - 8, inflation: e.inflation + 6 }) },
  { name: 'Tech Boom', icon: '🚀', fx: 'GDP surges, jobs grow', apply: (e: Econ): Econ => ({ ...e, gdp: e.gdp + 10, employment: e.employment + 7 }) },
  { name: 'Pandemic', icon: '🦠', fx: 'Jobs & GDP collapse', apply: (e: Econ): Econ => ({ ...e, employment: e.employment - 15, gdp: e.gdp - 12 }) },
  { name: 'Oil Crisis', icon: '🛢️', fx: 'Inflation spikes', apply: (e: Econ): Econ => ({ ...e, inflation: e.inflation + 12, gdp: e.gdp - 6 }) },
  { name: 'Housing Bubble', icon: '🏠', fx: 'Debt balloons', apply: (e: Econ): Econ => ({ ...e, debt: e.debt + 14, gdp: e.gdp + 5 }) },
  { name: 'Consumer Boom', icon: '🛒', fx: 'Spending lifts all', apply: (e: Econ): Econ => ({ ...e, employment: e.employment + 5, gdp: e.gdp + 6 }) },
]

function cl(v: number) { return Math.max(0, Math.min(100, v)) }

function simulate(e: Econ, c: Controls, noise:()=>number=Math.random): Econ {
  const t = (c.taxRate - 40) * 0.08, s = (c.govSpending - 40) * 0.06
  const i = (c.interestRate - 35) * 0.05, inv = (c.investmentRate - 45) * 0.04
  const con = (c.consumerSpending - 50) * 0.05, tr = (c.exports - c.imports) * 0.03
  return {
    gdp: cl(e.gdp - t + s - i + inv + con + tr + (50 - e.gdp) * 0.01 + (noise() - 0.5) * 1.5),
    inflation: cl(e.inflation + s * 0.7 - i * 0.5 - t * 0.3 + con * 0.4 + (20 - e.inflation) * 0.02 + (noise() - 0.5)),
    employment: cl(e.employment + (e.gdp - 50) * 0.03 - i * 0.2 + inv * 0.3 + (55 - e.employment) * 0.01 + (noise() - 0.5)),
    debt: cl(e.debt + s * 0.5 - t * 0.4 - (e.gdp > 55 ? 0.5 : -0.5) + (35 - e.debt) * 0.01 + (noise() - 0.5) * 0.5),
  }
}

function grade(e: Econ) {
  const s = e.gdp * 0.3 + (100 - e.inflation) * 0.25 + e.employment * 0.3 + (100 - e.debt) * 0.15
  if (s > 70) return { l: 'A', c: '#22c55e', m: 'High balance score in this game.' }
  if (s > 55) return { l: 'B', c: '#84cc16', m: 'Moderate balance score in this game.' }
  if (s > 40) return { l: 'C', c: '#eab308', m: 'The economy is struggling.' }
  if (s > 25) return { l: 'D', c: '#f97316', m: 'Low balance score in this game.' }
  return { l: 'F', c: '#ef4444', m: 'Lowest balance band in this game.' }
}

// ── Health meter ──
function Meter({ label, value, color, warn }: {
  label: string; value: number; color: string; warn: 'high' | 'low'
}) {
  const bad = (warn === 'high' && value > 70) || (warn === 'low' && value < 30)
  const displayColor=bad?'var(--moniac-danger)':color
  return (
    <div style={{ flex: 1, minWidth: 130 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: 3,
        fontFamily: 'var(--mono)', fontSize: 16, letterSpacing: '0.02em', textTransform: 'uppercase',
      }}>
        <span style={{ color: 'var(--moniac-muted)' }}>{label}</span>
        <span style={{ color: displayColor, fontWeight: 700 }}>{Math.round(value)}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3, width:'100%', transform:`scaleX(${value/100})`,transformOrigin:'left',
          background:bad?'var(--moniac-danger)':color,
          transition:'transform .3s ease',
          boxShadow:'none',
        }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════

export default function MoniacSimulator() {
  const [c, setC] = useState<Controls>(INIT_C)
  const [exploring,setExploring]=useState(true)
  const [trial,setTrial]=useState<{before:Econ;after:Econ;reference:Econ;policy:string;value:number;resetValue:number}|null>(null)
  const [policy,setPolicy]=useState<keyof Controls>('taxRate')
  const policies:{key:keyof Controls;label:string;effect:string}[]=[
    {key:'taxRate',label:'Tax Rate',effect:'Higher tax reduces GDP growth, inflation and debt in this simplified rule set.'},
    {key:'govSpending',label:'Gov Spend',effect:'Higher public spending increases GDP growth, inflation and debt in this rule set.'},
    {key:'interestRate',label:'Interest',effect:'Higher interest reduces GDP growth, inflation and employment in this rule set.'},
    {key:'investmentRate',label:'Invest',effect:'Higher investment increases GDP growth and employment in this rule set.'},
    {key:'consumerSpending',label:'Consumer',effect:'Higher consumption increases GDP growth and inflation in this rule set.'},
    {key:'imports',label:'Imports',effect:'Higher imports reduce the net-trade contribution to GDP in this rule set.'},
    {key:'exports',label:'Exports',effect:'Higher exports increase the net-trade contribution to GDP in this rule set.'},
  ]
  const currentPolicy=policies.find(item=>item.key===policy)!

  const [e, setE] = useState<Econ>(INIT_E)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const pauseButton = useRef<HTMLButtonElement>(null)
  const startFrame = useRef(0)
  useEffect(() => host.current ? observeVisible(host.current,setVisible) : undefined, [])
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameOver, setGameOver] = useState(false)
  const [event, setEvent] = useState<typeof EVENTS[0] | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const simRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const noticeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const evRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const start = useCallback(() => {
    setC(INIT_C); setE(INIT_E); setTimeLeft(60)
    setExploring(false);setTrial(null);setGameOver(false); setEvent(null); setPaused(false); setRunning(true)
    cancelAnimationFrame(startFrame.current)
    startFrame.current = requestAnimationFrame(() => {
      host.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
      pauseButton.current?.focus({ preventScroll: true })
    })
  }, [])

  const upd = useCallback((k: keyof Controls, v: number) => {
    if (running||exploring) setC(p => ({ ...p, [k]: v }))
  }, [running, exploring])

  // Timer
  useEffect(() => {
    if (!running || !visible) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { setRunning(false); setGameOver(true); return 0 }; return t - 1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running, visible])

  // Simulation
  useEffect(() => {
    if (!running || !visible) return
    simRef.current = setInterval(() => setE(p => simulate(p, c)), 1000)
    return () => clearInterval(simRef.current)
  }, [running, c, visible])

  // Random events
  useEffect(() => {
    if (!running || !visible) return
    const sched = () => {
      evRef.current = setTimeout(() => {
        const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)]
        setEvent(ev)
        setE(p => ({ gdp: cl(ev.apply(p).gdp), inflation: cl(ev.apply(p).inflation), employment: cl(ev.apply(p).employment), debt: cl(ev.apply(p).debt) }))
        noticeRef.current = setTimeout(() => setEvent(null), 3500)
        sched()
      }, 10000 + Math.random() * 8000)
    }; sched()
    return () => { clearTimeout(evRef.current); clearTimeout(noticeRef.current) }
  }, [running, visible])

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(simRef.current); clearTimeout(evRef.current); clearTimeout(noticeRef.current); cancelAnimationFrame(startFrame.current) }, [])

  const displayEconomy = exploring ? trial?.after ?? INIT_E : e
  const res = gameOver ? grade(e) : null
  const timerColor = timeLeft <= 10 ? 'var(--moniac-danger)' : 'var(--moniac-accent)'

  return (
    <div ref={host} className="moniac-game" data-mode={exploring?'study':'game'} style={{
      width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.04)',
      background: 'var(--moniac-bg)',
      fontFamily: 'var(--sans)',
    }}>
      <div className="moniac-session-controls">{running && <button ref={pauseButton} onClick={() => { setRunning(false); setPaused(true) }}>Pause game</button>}{paused && <><button onClick={() => { setExploring(false); setTrial(null); setRunning(true); setPaused(false) }}>Resume game</button><button onClick={start}>Restart game</button></>}{!visible && running && <span role="status">Game paused while out of view.</span>}</div>
      {/* ── Header ── */}
      <div className="moniac-console-header" style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div>
          <div style={{ fontSize: 16, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--moniac-muted)', marginBottom: 4 }}>
            MONIAC · Economic model
          </div>
          {running && (
            <div style={{ fontSize: 16, color: 'var(--moniac-muted)' }}>
              Balance the economy for 60 seconds
            </div>
          )}
        </div>
        {running ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--moniac-muted)' }}>Time</div>
            <div style={{
              fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: timerColor,
              lineHeight: 1, textShadow: timeLeft <= 10 ? '0 0 20px rgba(239,68,68,0.3)' : 'none',
            }}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>
        ) : <span className="moniac-mode-label">{gameOver?'Game complete':paused?'Game paused':'Untimed study'}</span>}
      </div>

      {/* ── Event banner ── */}
      {event && (
        <div style={{
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(234,179,8,0.04)', borderBottom: '1px solid rgba(234,179,8,0.08)',
          animation: 'moniac-enter 0.3s ease',
        }}>

          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color:'var(--moniac-ink)' }}>{event.name}</div>
            <div style={{ fontSize: 16, color: 'var(--moniac-muted)', marginTop: 2 }}>{event.fx}</div>
          </div>
        </div>
      )}

      <section className="moniac-policy" aria-label="Operate the economic model">
        <div className="moniac-machine-layout">
          <div className="moniac-control-inspector">
            <label htmlFor="moniac-policy">Policy</label>
            <select id="moniac-policy" value={policy} onChange={event=>setPolicy(event.target.value as keyof Controls)}>{policies.map(item=><option key={item.key} value={item.key}>{item.label}</option>)}</select>
            <label htmlFor="moniac-active-policy"><span>{currentPolicy.label}</span><output>{c[policy].toFixed(1)}%</output></label>
            <PortfolioSlider id="moniac-active-policy" step={.1} aria-label={`${currentPolicy.label}: ${c[policy]}%`} min={0} max={100} value={c[policy]} disabled={!running&&!exploring} onChange={event=>upd(policy,Number(event.target.value))}/>
            {exploring&&<div className="moniac-experiment-controls"><button onClick={()=>{const before=trial?.after??INIT_E;setTrial({before:{...before},after:simulate(before,c,()=>.5),reference:simulate(before,{...c,[policy]:INIT_C[policy]},()=>.5),policy:currentPolicy.label,value:c[policy],resetValue:INIT_C[policy]})}} aria-label="Run one model step">Run a step</button><button onClick={()=>{setTrial(null);setC({...INIT_C});setPolicy('taxRate')}} aria-label="Reset experiment">Reset</button></div>}

          </div>
          <MoniacHydraulic values={c} income={displayEconomy.gdp} timeLeft={timeLeft} enabled={running||exploring} active={policy} onInspect={setPolicy} onChange={upd}/>
        </div>
        {trial&&exploring&&<p role="status" className="moniac-trial-feedback">One step: GDP {trial.after.gdp.toFixed(2)}, employment {trial.after.employment.toFixed(2)}. The full comparison follows the diagram.</p>}
            <details className="moniac-policy-detail"><summary>How {currentPolicy.label.toLowerCase()} affects the model</summary><h3>{currentPolicy.label} → economy</h3><p>{currentPolicy.effect}</p><p>{policy==='interestRate'?'Interest is an additional browser-model control. The original screen does not show a seventh valve.':'Turn its labelled wheel or adjust the value above.'} {exploring?'Run one model step to compare outcomes with random noise disabled.':'Settings feed the next simulation tick. Other controls, mean reversion and random shocks also affect the result.'} Percentages are game indices, not economic forecasts.</p></details>
        {trial&&<div className="moniac-step-scroll" role="region" aria-label="Model step comparison" tabIndex={0}><table className="moniac-step-results"><caption>One step with random noise disabled. {trial.policy}: {trial.value.toFixed(1)}% compared with its reset value of {trial.resetValue}%. All other inputs and starting indices match.</caption><thead><tr><th>Index</th><th>Before</th><th>Reset control</th><th>Your control</th><th>Difference</th></tr></thead><tbody>{(Object.keys(trial.before) as (keyof Econ)[]).map(key=><tr key={key}><th scope="row">{key}</th><td>{trial.before[key].toFixed(2)}</td><td>{trial.reference[key].toFixed(2)}</td><td>{trial.after[key].toFixed(2)}</td><td>{(trial.after[key]-trial.reference[key]).toFixed(2)}</td></tr>)}</tbody></table></div>}
      </section>
      <div className="moniac-game-mode"><p>{exploring?'Untimed: change a valve, then run one step. Try the 60-second game when you know the controls.':'Explore the rules without a countdown or random shocks.'}</p><div className="moniac-experiment-controls"><button onClick={()=>{if(running){setRunning(false);setPaused(true)}setExploring(true);setTrial(null)}}>Explore rules without shocks</button>{!running&&!gameOver&&!paused&&<button className="glass-action moniac-start" onClick={start}>Start Economy</button>}</div></div>

      {/* ── Economy health ── */}
      <div className="moniac-economy-health" style={{ padding: '14px 20px', display: 'flex', gap: 14, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <Meter label="GDP" value={displayEconomy.gdp} color="var(--moniac-accent)" warn="low" />
        <Meter label="Employment" value={displayEconomy.employment} color="var(--moniac-accent)" warn="low" />
        <Meter label="Inflation" value={displayEconomy.inflation} color="var(--moniac-accent)" warn="high" />
        <Meter label="Debt" value={displayEconomy.debt} color="var(--moniac-accent)" warn="high" />
      </div>

      {/* ── Game over ── */}
      {gameOver && res && (
        <div style={{
          padding: '28px 20px', textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{
            fontSize: 56, fontWeight: 800, color: res.c, lineHeight: 1,
            textShadow: `0 0 30px ${res.c}30`,
          }}>{res.l}</div>
          <p style={{ fontSize: 16, color: 'var(--moniac-muted)', maxWidth: '34ch', margin: '10px auto 20px', lineHeight: 1.5 }}>
            {res.m}
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20,
            fontSize: 16, color: 'var(--moniac-muted)', flexWrap: 'wrap',
          }}>
            <span>GDP <strong style={{ color: '#3b82f6' }}>{Math.round(e.gdp)}%</strong></span>
            <span>Jobs <strong style={{ color: '#22c55e' }}>{Math.round(e.employment)}%</strong></span>
            <span>Infl <strong style={{ color: '#f59e0b' }}>{Math.round(e.inflation)}%</strong></span>
            <span>Debt <strong style={{ color: '#ef4444' }}>{Math.round(e.debt)}%</strong></span>
          </div>
          <button onClick={start} style={{
            padding: '10px 24px', borderRadius: 'var(--radius-pill)',
            border: `1px solid ${res.c}40`, background: `${res.c}10`,
            color: res.c, fontSize: 16, fontWeight: 600, letterSpacing: '0.03em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--mono)',
          }}>
            Play Again
          </button>
        </div>
      )}

      {/* ── Idle ── */}
      {!running && !gameOver && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: 'var(--moniac-muted)', lineHeight: 1.6, maxWidth: '48ch', margin: '0 auto' }}>
            Inspired by the 1949 Phillips Hydraulic Computer. Adjust six valve controls and the additional interest-rate setting. The drawing follows the original game screen; the browser rules are simplified. Keep GDP &amp; employment high, inflation &amp; debt low. Random events will test your strategy.
          </p>
        </div>
      )}

      <style>{`
        @keyframes moniac-enter {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
