import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import ExperienceBoundary from '../ExperienceBoundary'
const MoniacSimulator = lazy(() => import('../MoniacSimulator'))

export default function DeferredMoniac() {
  const host = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  return <div ref={host} className="moniac-deferred">
    <MountWhenNear host={host} onNear={() => setNear(true)} />
    <ExperienceBoundary fallback={<p role="status">The game could not load. The original cabinet film and photographs remain available. <button className="glass-action" onClick={() => location.reload()}>Reload game</button></p>}>
      <Suspense fallback={<p role="status">Preparing the hydraulic game…</p>}>
        {near ? <MoniacSimulator /> : <p role="status">The hydraulic game loads as you approach.</p>}
      </Suspense>
    </ExperienceBoundary>
  </div>
}
function MountWhenNear({ host, onNear }: { host: React.RefObject<HTMLDivElement | null>; onNear: () => void }) {
  const callback = useRef(onNear); callback.current = onNear
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { callback.current(); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { callback.current(); observer.disconnect() }
    }, { rootMargin: '160px' })
    if (host.current) observer.observe(host.current)
    return () => observer.disconnect()
  }, [host])
  return null
}
