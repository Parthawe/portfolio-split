import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import ExperienceBoundary from '../ExperienceBoundary'
const EnigmaInteractive=lazy(()=>import('../EnigmaInteractive'))
const PhysicalWorld=lazy(()=>import('../physical-worlds/PhysicalWorld'))
/** Keep renderer code deferred and mount only one version of the experiment. */
export default function DeferredObjectStudy({project}:{project:'enigma'|'sea-of-salt'}){
 const host=useRef<HTMLDivElement>(null),[near,setNear]=useState(false),[view,setView]=useState<'object'|'experiment'>('object')
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setNear(true);observer.disconnect()}},{rootMargin:'160px'});if(host.current)observer.observe(host.current);return()=>observer.disconnect()},[])
 return <div ref={host} className="project-study">
 {project==='enigma'&&<div className="project-study-controls" role="group" aria-label="Enigma study view"><button className="glass-action" aria-pressed={view==='object'} onClick={()=>setView('object')}>Sculpture and tablet</button><button className="glass-action" aria-pressed={view==='experiment'} onClick={()=>setView('experiment')}>Signal explanation</button></div>}
 <ExperienceBoundary fallback={<p>The object could not load. The original film and photographs remain available. <button className="glass-action" onClick={()=>location.reload()}>Reload</button></p>}><Suspense fallback={<p role="status">Loading the object study…</p>}>{near?(view==='object'?<PhysicalWorld project={project}/>:<EnigmaInteractive/>):<p>Object study loads as you approach.</p>}</Suspense></ExperienceBoundary>
 </div>
}
