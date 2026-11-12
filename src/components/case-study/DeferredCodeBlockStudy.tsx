import {lazy,Suspense,useEffect,useRef,useState} from 'react'
import ExperienceBoundary from '../ExperienceBoundary'
const CodeBlockStudy=lazy(()=>import('./CodeBlockStudy'))
export default function DeferredCodeBlockStudy(){
 const ref=useRef<HTMLDivElement>(null),[near,setNear]=useState(false)
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setNear(true);observer.disconnect()}},{rootMargin:'120px'});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect()},[])
 return <div ref={ref} style={{minHeight:240}}>{near?<ExperienceBoundary fallback={<p>The block lesson could not load. The original guide and screens remain below. <button className="glass-action" onClick={()=>location.reload()}>Reload lesson</button></p>}><Suspense fallback={<p role="status">Loading the block lesson…</p>}><CodeBlockStudy/></Suspense></ExperienceBoundary>:<p>The block lesson loads as you approach.</p>}</div>
}
