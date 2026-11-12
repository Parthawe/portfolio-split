import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import './stories.css'
export type StoryStep = { title: string; body: string }
export type StoryDraw = (root: HTMLElement) => (progress: number) => void

/** Scroll schedules a single paint. There is no idle or offscreen animation loop. */
export default function MechanismStory({ title, steps, art, createDraw, source, note }: {
  title: string; steps: StoryStep[]; art: ReactNode; createDraw: StoryDraw;
  source: { href: string; label: string }; note: string
}) {
  const id = useId(), root = useRef<HTMLElement>(null), drawing = useRef<HTMLDivElement>(null)
  const draw = useRef<(progress: number) => void>(() => {})
  const [following, setFollowing] = useState(false), [reduced, setReduced] = useState(false), [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)
  const progress = useRef(0)
  useEffect(() => {
    draw.current = createDraw(drawing.current!)
    draw.current(0)
    setReady(true)
  }, [createDraw])
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(media.matches); setFollowing(!media.matches)
    const change = () => { setReduced(media.matches); if (media.matches) setFollowing(false) }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    if (!following || reduced || !ready) return
    const node = root.current!, figure = drawing.current!
    const chapters = [...node.querySelectorAll<HTMLElement>('[data-story-step]')]
    let visible = false, frame = 0
    const paint = () => {
      frame = 0
      if (!visible || document.hidden) return
      const first = chapters[0].getBoundingClientRect().top
      const last = chapters[chapters.length - 1].getBoundingClientRect().top
      // On narrow screens text enters below the sticky illustration.
      const target = innerWidth < 760 ? Math.min(innerHeight - 100, figure.getBoundingClientRect().bottom + 90) : innerHeight * .58
      const p = Math.max(0, Math.min(1, (target - first) / Math.max(1, last - first)))
      progress.current = p; draw.current(p)
      setActive(Math.min(steps.length - 1, Math.floor(p * (steps.length - 1) + .5)))
    }
    const schedule = () => { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(paint) }
    const observer = new IntersectionObserver(entries => {
      visible = entries[entries.length - 1].isIntersecting
      if (visible) schedule(); else { cancelAnimationFrame(frame); frame = 0 }
    })
    observer.observe(node)
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0 } else schedule() }
    addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule)
    document.addEventListener('visibilitychange', visibility)
    return () => { observer.disconnect(); cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); document.removeEventListener('visibilitychange', visibility) }
  }, [following, reduced, ready, steps.length])
  function select(index: number) {
    setFollowing(false); setActive(index); progress.current = index / (steps.length - 1); draw.current(progress.current)
  }
  return <section ref={root} className="mechanism-story" data-following={following && !reduced} aria-labelledby={`${id}-title`}>
    <header><p className="mechanism-story__eyebrow">Mechanism study · draft</p><h2 id={`${id}-title`}>{title}</h2>
      <p>Scroll through the explanation, or choose a step to hold the drawing still.</p>
      <button type="button" aria-pressed={following && !reduced} disabled={reduced} onClick={() => setFollowing(!following)}>{reduced ? 'Reduced motion · step controls' : following ? 'Pause scroll animation' : 'Follow scrolling'}</button>
    </header>
    <div className="mechanism-story__layout">
      <div ref={drawing} className="mechanism-story__drawing" data-active-step={active}>
        {art}
        <nav aria-label={`${title} steps`}>{steps.map((step, index) => <button key={step.title} type="button" aria-label={`${index + 1}. ${step.title}`} aria-current={active === index ? 'step' : undefined} onClick={() => select(index)}>{index + 1}</button>)}</nav>
        <p className="mechanism-story__readout" aria-live={following ? 'off' : 'polite'}>{active + 1} / {steps.length} · {steps[active].title}</p>
      </div>
      <div className="mechanism-story__steps">{steps.map((step, index) => <section key={step.title} data-story-step={index} data-current={active === index}><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.body}</p></section>)}</div>
    </div>
    <footer><p>{note}</p><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></footer>
  </section>
}
