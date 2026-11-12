import PortfolioSlider from './PortfolioSlider'
import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import { useThemeMode } from '../hooks/useThemeMode'
import { usePrefersReduced } from '../hooks/usePrefersReduced'
import { initValues, KEYS, propagate, type Key } from './shuffle/model'
import './shuffle/shuffle.css'

const ShuffleScene = lazy(() => import('./shuffle/ShuffleScene'))
export type ShuffleView = 'Studio' | 'Overhead' | 'Construction' | 'Room'

export default function ShuffleInteractive() {
  const [values, setValues] = useState(initValues)
  const current = useRef(values)
  const [view, setView] = useState<ShuffleView>('Studio')
  const [viewRevision, setViewRevision] = useState(0)
  const [active, setActive] = useState<Key | null>(null)
  const [failed, setFailed] = useState(false)
  const reduced = usePrefersReduced()
  const dark = useThemeMode()
  const change = useCallback((key: Key, value: number) => {
    const bounded = Math.max(0, Math.min(100, value))
    const next = propagate(current.current, key, bounded - current.current[key])
    next[key] = bounded
    current.current = next
    setValues(next)
    setActive(key)
  }, [])
  const reset = () => {
    const next = initValues()
    current.current = next
    setValues(next)
    setActive(null)
    setView('Studio')
    setViewRevision(value => value + 1)
  }
  return (
    <div className="shuffle-object" data-shuffle-theme={dark ? 'dark' : 'light'}>
      <div className="shuffle-toolbar">
        <p>Explore the board</p>
        <div className="shuffle-views glass-segments" role="group" aria-label="Board view">
          {(['Studio', 'Overhead', 'Construction', 'Room'] as const).map(item => (
            <button key={item} aria-pressed={view === item} onClick={() => { setView(item); setViewRevision(value => value + 1) }}>{item}</button>
          ))}
        </div>
        <button className="shuffle-reset glass-action" onClick={reset}>Reset</button>
      </div>
      <div className="shuffle-stage">
        {failed ? <div className="shuffle-loading" role="status"><p>3D is unavailable in this browser.</p><p>Use the slider controls below to explore the simulation.</p></div> :
          <Suspense fallback={<div className="shuffle-loading" role="status"><span className="shuffle-loading-board" />Loading the 3D board…</div>}>
            <ShuffleScene values={values} view={view} viewRevision={viewRevision} reduced={reduced} dark={dark} onChange={change} onFail={() => setFailed(true)} />
          </Suspense>}
        <div className="shuffle-stage-note" aria-hidden="true">{view === 'Construction' ? 'Motorized faders · plywood · metal standoffs' : 'Drag a white cap to change the balance'}</div>
      </div>
      <div className="shuffle-instructions">
        <p>Drag a cap to adjust it. Drag the board to rotate. Pinch or scroll to zoom.</p>
        <p className="shuffle-readout" role="status" aria-live="polite">{active ? `${active.toLowerCase()} · ${Math.round(values[active])} / 100` : 'Eight sliders. Connected choices.'}</p>
      </div>
      <details className="shuffle-controls" open={failed || undefined}>
        <summary>Slider controls <span>Keyboard and touch</span></summary>
        <div className="shuffle-controls-grid">
          {KEYS.map(key => <label key={key}>
            <span>{key.toLowerCase()}<output>{Math.round(values[key])}</output></span>
            <PortfolioSlider aria-label={key} type="range" min="0" max="100" step="1" value={Math.round(values[key])} onChange={event => change(key, Number(event.target.value))} />
          </label>)}
        </div>
      </details>
      <p className="shuffle-disclosure">A 3D reconstruction from the project photographs. Relationships use the portfolio’s digital simulation; they are not verified against the original firmware.</p>
    </div>
  )
}
