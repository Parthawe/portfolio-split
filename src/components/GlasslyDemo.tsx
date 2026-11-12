import { useEffect, useRef, useState } from 'react'

const demoUrl = '/Assets/Projects/Glassly/demo/index.html'

export default function GlasslyDemo() {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [height, setHeight] = useState(800)
  const iframe = useRef<HTMLIFrameElement>(null)
  const loadButton = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef(false)
  const focusOrigin = useRef<Element | null>(null)
  useEffect(() => {
    if (restoreFocus.current) {
      const unchanged = document.activeElement === document.body || document.activeElement === iframe.current || document.activeElement === focusOrigin.current
      if (state === 'ready') { if (unchanged) iframe.current?.focus({ preventScroll: true }); restoreFocus.current = false }
      if (state === 'idle' || state === 'error') { if (state === 'idle' || unchanged) loadButton.current?.focus({ preventScroll: true }); restoreFocus.current = false }
    }
    if (state !== 'loading' && state !== 'ready') return
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow || event.data?.type !== 'glassly-demo') return
      if (event.data.error) setState('error')
      if (event.data.ready) setState('ready')
      if (Number.isFinite(event.data.height)) setHeight(Math.max(500, Math.min(2400, event.data.height)))
    }
    window.addEventListener('message', receive)
    const timeout = state === 'loading' ? window.setTimeout(() => setState('error'), 15000) : undefined
    return () => { window.removeEventListener('message', receive); window.clearTimeout(timeout) }
  }, [state])
  return <div className="glassly-case-demo">
    {(state === 'idle' || state === 'error') && <>
      <img src="/Assets/Projects/Glassly/website-demo.webp" width={1326} height={984} alt="Original Glassly website demo showing synchronized phone and glasses interfaces" loading="lazy" decoding="async" />
      {state === 'error' && <p role="status">The demo couldn’t load. You can retry or open Glassly’s website.</p>}
      <div className="glassly-case-actions"><button ref={loadButton} type="button" onClick={() => { focusOrigin.current = document.activeElement; restoreFocus.current = true; setState('loading') }}>{state === 'error' ? 'Retry original demo' : 'Load original demo'}</button><a href="https://glassly.ai/#demo" target="_blank" rel="noopener noreferrer">Open Glassly’s website ↗</a></div>
    </>}
    {(state === 'loading' || state === 'ready') && <div className="glassly-case-demo__frame" style={{height}}>
      {state === 'loading' && <div className="glassly-case-demo__loading" role="status"><img src="/Assets/Projects/Glassly/website-demo.webp" alt="" /><p>Loading the original demo…</p></div>}
      <iframe ref={iframe} title="Original Glassly phone and glasses demo" src={demoUrl} sandbox="allow-scripts allow-same-origin" style={{height,visibility:state === 'ready' ? 'visible' : 'hidden'}} />
      {state === 'ready' && <button className="glassly-case-demo__unload" type="button" onClick={() => { restoreFocus.current = true; setState('idle') }}>Close demo</button>}
    </div>}
    <p className="glassly-case-note">Original website demonstration with illustrative content. It does not connect to glasses or run live miniapp services.</p>
  </div>
}
