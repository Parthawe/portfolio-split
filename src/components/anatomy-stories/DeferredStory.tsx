import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import ExperienceBoundary from '../ExperienceBoundary'
const StageStory = lazy(() => import('./StageStory'))
const InstrumentStory = lazy(() => import('./InstrumentStory'))
const HarpStory = lazy(() => import('./HarpStory'))
/** The original case study remains usable if the optional drawing fails to load. */
export default function DeferredStory({ project }: { project: 'stage' | 'harp' | 'flute' | 'rain' | 'hexa' }) {
  const host=useRef<HTMLDivElement>(null),[near,setNear]=useState(false)
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setNear(true);observer.disconnect()}},{rootMargin:'300px'})
    observer.observe(host.current!);return()=>observer.disconnect()
  },[])
  return <div ref={host} style={{minHeight:200}}>
    {near?<ExperienceBoundary fallback={<p>The mechanism drawing could not load. The original photographs and explanation remain below. <button onClick={()=>location.reload()}>Reload drawing</button></p>}><Suspense fallback={<p role="status">Loading the mechanism drawing…</p>}>{project==='stage'?<StageStory/>:project==='harp'?<HarpStory/>:<InstrumentStory study={project}/>}</Suspense></ExperienceBoundary>:<p>Mechanism study loads as you approach.</p>}
  </div>
}
