import { projectImageProps } from '../../utils/projectImage'
import { useEffect, useId, useRef, useState } from 'react'
import DecisionNote, { type ScreenDecision } from './DecisionNote'
import { scrollEvidenceViewport } from './evidenceKeyboard'

type Screen = { title: string; label: string; caption: string; src: string; alt: string; width?: number; height?: number; decision?: ScreenDecision }

/** Original implementation; interaction reference: Skiper's expandable cards. */
export default function CsScreenExplorer({ screens, label = 'Choose a MiniApp screen', format = 'portrait', scrollPortrait = false }: { screens: Screen[]; label?: string; format?: 'portrait' | 'landscape'; scrollPortrait?: boolean }) {
  const id = useId()
  const [selected, setSelected] = useState(0)
  const [failed, setFailed] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<string | null>(null)
  const retrying = useRef(false)
  const retryButton = useRef<HTMLButtonElement>(null)
  const screen = screens[selected]
  useEffect(() => {
    if (retrying.current && failed === screen?.src) {
      if (document.activeElement === document.body) retryButton.current?.focus()
      retrying.current = false
    }
  }, [failed, screen?.src])
  if (!screen) return null
  return (
    <div className={`cs-screen-explorer cs-screen-explorer--${format}${scrollPortrait ? ' cs-screen-explorer--scroll-portrait' : ''}`}>
      <div className="cs-screen-explorer__choices" role="group" aria-label={label}>
        {screens.map((item, index) => (
          <button type="button" key={item.src} aria-pressed={selected === index} aria-controls={`${id}-preview`} onClick={() => { retrying.current = false; setSelected(index) }}>
            <span className="cs-screen-explorer__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span><strong>{item.title}</strong><small>{item.label}</small></span>
            <span aria-hidden="true">{selected === index ? '−' : '+'}</span>
          </button>
        ))}
      </div>
      <figure id={`${id}-preview`} className="cs-screen-explorer__preview">
        <div key={scrollPortrait ? screen.src : undefined} className="cs-screen-explorer__image" tabIndex={scrollPortrait ? 0 : undefined} aria-label={scrollPortrait ? `${screen.title}, scroll to inspect the complete original` : undefined} aria-busy={loaded !== screen.src && failed !== screen.src} onKeyDown={event => {
          if (scrollPortrait) scrollEvidenceViewport(event)
        }}>
          {failed === screen.src ? <div role="status"><p>The preview couldn’t load.</p><button ref={retryButton} type="button" onClick={() => { retrying.current = true; setFailed(null); setLoaded(null) }}>Retry image</button></div> : <>
            {loaded !== screen.src && <span className="cs-screen-explorer__loading">Loading screen…</span>}
            <img data-project-preview data-original-src={screen.src} {...projectImageProps(screen.src)} key={screen.src} src={screen.src} alt={screen.alt} width={screen.width ?? projectImageProps(screen.src).width} height={screen.height ?? projectImageProps(screen.src).height} loading="lazy" decoding="async" tabIndex={0} onLoad={event => {
              setLoaded(screen.src)
              if (retrying.current) {
                if (document.activeElement === document.body) event.currentTarget.focus()
                retrying.current = false
              }
            }} onError={() => setFailed(screen.src)} />
          </>}
        </div>
        <figcaption>
          <div aria-live="polite" aria-atomic="true"><strong>{screen.title}</strong><p>{screen.caption}</p>{screen.decision && <DecisionNote decision={screen.decision} />}</div>
          <a className="glass-action" href={screen.src} target="_blank" rel="noopener noreferrer">Open original image <span className="sr-only">in a new tab</span><span aria-hidden="true"> ↗</span></a>
        </figcaption>
      </figure>
    </div>
  )
}
