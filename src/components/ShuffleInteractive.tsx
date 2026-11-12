import PortfolioSlider from './PortfolioSlider'
import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import { useThemeMode } from '../hooks/useThemeMode'
import { usePrefersReduced } from '../hooks/usePrefersReduced'
import { initValues, KEYS, propagate, type Key } from './shuffle/model'
import './shuffle/shuffle.css'

const ShuffleScene = lazy(() => import('./shuffle/ShuffleScene'))
export type ShuffleView = 'Studio' | 'Overhead' | 'Construction' | 'Room'

const startingValues = initValues()
const finalsEffects = [
  { key: 'SLEEP', label: 'Sleep' },
  { key: 'SOCIAL LIFE', label: 'Social life' },
  { key: 'HOBBY', label: 'Hobby' },
] as const

export default function ShuffleInteractive({ featured = false }: { featured?: boolean }) {
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
    <div className={`shuffle-object${featured ? ' shuffle-object--featured' : ''}`} data-shuffle-theme={dark ? 'dark' : 'light'}>
      {featured && (
        <section className="shuffle-example" aria-labelledby="shuffle-example-title">
          <div>
            <h2 id="shuffle-example-title">What happens when Finals goes up?</h2>
            <label className="shuffle-example__slider">
              <span>Finals <output>{Math.round(values.FINALS)}</output></span>
              <PortfolioSlider aria-label="Finals" min={0} max={100} step={1}
                value={Math.round(values.FINALS)} onChange={event => change('FINALS', Number(event.currentTarget.value))} />
            </label>
            <div className="shuffle-example__actions">
              <button type="button" className="glass-action" onClick={() => change('FINALS', 82)}>Set Finals to 82</button>
              <button type="button" className="glass-action" onClick={reset}>Reset</button>
            </div>
          </div>
          <div>
            <p>Raising Finals lowers these three faders.</p>
            <p className="shuffle-example__legend">Starting value → current value</p>
            <dl className="shuffle-example__effects" aria-live="polite">
              {finalsEffects.map(({ key, label }) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{startingValues[key]} → <strong>{Math.round(values[key] * 10) / 10}</strong></dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}
      <div className="shuffle-toolbar">
        <p>Explore the board</p>
        <div className="shuffle-views glass-segments" role="group" aria-label="Board view">
          {(['Studio', 'Overhead', 'Construction', 'Room'] as const).map(item => (
            <button key={item} aria-pressed={view === item} onClick={() => { setView(item); setViewRevision(value => value + 1) }}>{item}</button>
          ))}
        </div>
        {!featured && <button className="shuffle-reset glass-action" onClick={reset}>Reset</button>}
      </div>
      <div className="shuffle-stage">
        {failed ? <div className="shuffle-loading" role="status"><p>3D is unavailable in this browser.</p><p>Use the slider controls to explore the simulation.</p></div> :
          <Suspense fallback={<div className="shuffle-loading" role="status"><span className="shuffle-loading-board" />Loading the 3D board…</div>}>
            <ShuffleScene values={values} view={view} viewRevision={viewRevision} reduced={reduced} dark={dark} featured={featured} onChange={change} onFail={() => setFailed(true)} />
          </Suspense>}
        {(!featured || view === 'Construction') && <div className="shuffle-stage-note" aria-hidden="true">{view === 'Construction' ? 'Motorized faders · plywood · metal standoffs' : 'Drag a white cap to change the balance'}</div>}
      </div>
      <div className="shuffle-instructions">
        <p>Drag a cap to adjust it. Drag the board to rotate. Pinch or scroll to zoom.</p>
        <p className="shuffle-readout" role="status" aria-live="polite">{active ? `${active.toLowerCase()} · ${Math.round(values[active])} / 100` : 'Eight sliders. Connected choices.'}</p>
      </div>
      <details className="shuffle-controls" open={failed || undefined}>
        <summary>Slider controls <span>Keyboard and touch</span></summary>
        <div className="shuffle-controls-grid">
          {KEYS.filter(key => !featured || key !== 'FINALS').map(key => <label key={key}>
            <span>{key.toLowerCase()}<output>{Math.round(values[key])}</output></span>
            <PortfolioSlider aria-label={key} type="range" min="0" max="100" step="1" value={Math.round(values[key])} onChange={event => change(key, Number(event.target.value))} />
          </label>)}
        </div>
      </details>
      <p className="shuffle-disclosure">This browser simulation reconstructs the board from photographs and uses illustrative relationships between faders.</p>
    </div>
  )
}
