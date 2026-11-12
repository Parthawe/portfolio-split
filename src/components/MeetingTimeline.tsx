import { useState, useEffect, useRef, useId } from 'react'
import PortfolioSlider from './PortfolioSlider'
import { observeVisible } from '../utils/visibleActivity'

const TRANSCRIPT = [
  { time: 0, speaker: 'Sarah', text: 'Let\'s start with the Q3 metrics. Revenue is up 12% but churn increased.' },
  { time: 3, speaker: 'Mike', text: 'The churn is mostly SMB segment. Enterprise is actually growing 18%.' },
  { time: 6, speaker: 'Sarah', text: 'We need to decide: do we double down on enterprise or fix SMB retention?' },
  { time: 9, speaker: 'Priya', text: 'I think we should launch the retention campaign by end of month.' },
  { time: 12, speaker: 'Mike', text: 'Agreed. Can we commit to having the campaign live by October 15th?' },
  { time: 15, speaker: 'Sarah', text: 'Yes. Priya owns the campaign. Mike, can you pull the SMB cohort data?' },
  { time: 18, speaker: 'Mike', text: 'I\'ll have it by Friday.' },
  { time: 20, speaker: 'Sarah', text: 'Perfect. Let\'s reconvene next Tuesday. Meeting adjourned.' },
]

export default function MeetingTimeline() {
  const root = useRef<HTMLDivElement>(null)
  const lines = useRef<(HTMLLIElement | null)[]>([])
  const id = useId()
  const excerpt = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [source, setSource] = useState<number | null>(null)
  const complete = progress >= 20

  useEffect(() => {
    if (!root.current) return
    return observeVisible(root.current, visible => { if (!visible) setPlaying(false) })
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setProgress(value => Math.min(20, value + 1)), 1000)
    return () => window.clearInterval(timer)
  }, [playing])

  useEffect(() => { if (complete) setPlaying(false) }, [complete])
  useEffect(() => {
    if (source === null) return
    const target=window.matchMedia('(max-width:680px)').matches?excerpt.current:lines.current[source]
    target?.focus({ preventScroll:true })
    target?.scrollIntoView({block:'nearest',behavior:'instant'})
  }, [source])

  const cite = (index: number) => {
    setSource(index)
    // Repeated citation clicks should also restore focus.
    const target=window.matchMedia('(max-width:680px)').matches?excerpt.current:lines.current[index]
    target?.focus({preventScroll:true});target?.scrollIntoView({block:'nearest',behavior:'instant'})
  }
  return (
    <div className="project-meeting-demo" ref={root}>
      <header>
        <h3>Meeting replay</h3>
        <p>Illustrative transcript and prepared summary. This demonstration does not record audio or run live AI.</p>
        <div className="project-demo-controls">
          {!complete && <button type="button" onClick={() => setPlaying(value => !value)}>{playing ? 'Pause replay' : progress ? 'Resume replay' : 'Play replay'}</button>}
          {!complete && <button type="button" onClick={() => { setProgress(20); setPlaying(false) }}>Show complete meeting</button>}
          <button type="button" onClick={() => { setProgress(0); setPlaying(false); setSource(null) }}>Reset replay</button>
        </div>
        <label htmlFor={`${id}-seek`}>Meeting position · {progress}s</label><PortfolioSlider id={`${id}-seek`} aria-label="Meeting position" min={0} max={20} value={progress} onChange={event=>{setPlaying(false);setSource(null);setProgress(Number(event.target.value))}}/><p role="status">{complete ? 'Replay complete. Select a source to check the summary.' : `${playing ? 'Playing' : 'Paused'} · ${progress} of 20 seconds`}</p>
      </header>
      <div className="project-meeting-demo__columns">
        <section aria-labelledby={`${id}-transcript`}>
          <h4 id={`${id}-transcript`}>Sample transcript</h4>
          <ol className="project-meeting-demo__transcript">
            {TRANSCRIPT.map((line, index) => line.time <= progress && (
              <li key={line.time} ref={element => { lines.current[index] = element }} tabIndex={-1} data-source={source === index || undefined}>
                <span>{String(line.time).padStart(2, '0')}s · {line.speaker}</span>
                <p>{line.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby={`${id}-summary`}>
          <h4 id={`${id}-summary`}>Prepared summary</h4>
          {source!==null&&<div className="project-meeting-source-excerpt" tabIndex={-1} ref={excerpt}><strong>Source · {TRANSCRIPT[source].time}s · {TRANSCRIPT[source].speaker}</strong><p>{TRANSCRIPT[source].text}</p></div>}
          {!complete ? <p>Play the replay or show the complete meeting to inspect the decisions and their sources.</p> : <>
            <h5>Agreed action</h5>
            <p>Launch the SMB retention campaign by October 15. Priya owns the campaign.</p>
            <button type="button" onClick={() => cite(4)}>Check proposed date · 12s</button>{' '}
            <button type="button" onClick={() => cite(5)}>Check approval and owner · 15s</button>
            <h5>Follow-up</h5>
            <p>Mike will provide SMB cohort data by Friday.</p>
            <button type="button" onClick={() => cite(6)}>Check commitment · 18s</button>
            <h5>Still unresolved</h5>
            <p>The group does not settle whether to prioritize enterprise growth. A summary should preserve that uncertainty.</p>
            <button type="button" onClick={() => cite(2)}>Check open question · 6s</button>
            <h5>Next meeting</h5>
            <p>Next Tuesday. The sample has no calendar date, so relative dates remain as spoken.</p>
            <button type="button" onClick={() => cite(7)}>Check next meeting · 20s</button>
          </>}
        </section>
      </div>
    </div>
  )
}
