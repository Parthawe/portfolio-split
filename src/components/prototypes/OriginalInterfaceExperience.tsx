import {lazy,Suspense,useEffect,useRef,useState} from 'react'
import {useThemeMode} from '../../hooks/useThemeMode'
import {interfaceSource} from '../../data/interfaceSources'
import './original-interfaces.css'
const ProductPrototypes=lazy(()=>import('./ProductPrototypes'))

export default function OriginalInterfaceExperience({project}:{project:string}) {
 const dark=useThemeMode()
 const source=interfaceSource(project)!,[selected,setSelected]=useState(0),[open,setOpen]=useState(false),[attempt,setAttempt]=useState(0),[slow,setSlow]=useState(false),[loaded,setLoaded]=useState(false),[study,setStudy]=useState(false)
 const studyRef=useRef<HTMLDetailsElement>(null)
 const start=useRef<HTMLButtonElement>(null),prototype=source.prototypes[selected]
 useEffect(()=>{if(!open||loaded)return;const timer=window.setTimeout(()=>setSlow(true),18000);return()=>window.clearTimeout(timer)},[open,attempt,selected,loaded])
 const openStudy=()=>{setOpen(false);setLoaded(false);setSlow(false);setStudy(true);requestAnimationFrame(()=>{studyRef.current?.scrollIntoView({block:'start',behavior:'instant'});studyRef.current?.querySelector('summary')?.focus({preventScroll:true})})}
 const close=()=>{setOpen(false);setLoaded(false);setSlow(false);requestAnimationFrame(()=>start.current?.focus())}
 return <section className="original-interface" aria-label="Original project experiences">
  <header><p className="original-interface-label">{source.live?source.live.verified?'Live product':'Product link · verification needed':prototype?prototype.provenance==='reconstructed'?'Figma task prototype · reconstructed':'Original Figma prototype':'Browser study · original source pending'}</p><h2>{source.live?source.live.verified?'Experience the released product.':'Explore the recorded product and browser study.':prototype?prototype.provenance==='reconstructed'?'Explore the task prototype.':'Explore the original design.':'Original prototype not connected yet.'}</h2><p>{source.sourceNote}</p></header>
  {source.evidence&&<figure className="original-interface-context"><img loading="lazy" src={source.evidence.image} alt={source.evidence.caption}/><figcaption>{source.evidence.caption}</figcaption></figure>}
  {source.live&&<section className="original-interface-live" aria-label="Live product access"><div><h3>{source.live.verified?'Live product':'Product destination unverified'}</h3><p>{source.live.note}</p></div>{source.live.verified?<a href={source.live.url} target="_blank" rel="noopener noreferrer">{source.live.label} ↗</a>:<button className="glass-action" onClick={openStudy}>Use the browser study</button>}</section>}
  {prototype&&<section className="original-interface-figma" aria-label="Original Figma prototypes">{source.prototypes.length>1&&<div className="original-interface-flow-tabs" role="group" aria-label="Choose an original prototype">{source.prototypes.map((flow,index)=><button key={flow.name} aria-pressed={index===selected} onClick={()=>{setSelected(index);setOpen(false);setLoaded(false);setSlow(false)}}>{flow.name}</button>)}</div>}<h3>{prototype.name}</h3><p>{prototype.description}</p>
   <div className={`original-interface-player${open?' is-open':''}`}>
    {open?<iframe key={`${selected}-${attempt}`} src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototype.url)}`} title={`${prototype.name} Figma prototype`} allowFullScreen onLoad={()=>{setLoaded(true);setSlow(false)}} onError={()=>{setLoaded(false);setSlow(true)}} />:<>{prototype.poster&&<div className="original-interface-poster"><img src={prototype.poster} alt={`${prototype.provenance==='reconstructed'?'Reconstructed':'Original'} ${prototype.name} design preview`} /></div>}<div className="original-interface-launch"><button ref={start} className="prototype-primary" onClick={()=>setOpen(true)}>{prototype.provenance==='reconstructed'?'Load Figma task prototype':'Load original Figma prototype'}</button><p>Figma access follows the file’s sharing settings and may require sign-in. The browser study below works without a Figma account.</p></div></>}
   </div>
   {open&&<div className="original-interface-player-tools"><p role="status">{slow?'If Figma is still blank or asks for access, open the original file or retry.':loaded?'The Figma frame loaded. Access and interaction depend on the Figma file’s permissions.':'Opening the original Figma prototype…'}</p><button onClick={close}>Close prototype</button><button onClick={()=>{setLoaded(false);setSlow(false);setAttempt(value=>value+1)}}>Reload prototype</button></div>}
   <div className="original-interface-handoff"><button className="glass-action" onClick={openStudy}>Use the browser study</button><a href={prototype.url} target="_blank" rel="noopener noreferrer">Open {prototype.name} in Figma ↗</a></div>
  </section>}
  <details ref={studyRef} open={study} className="original-interface-study" onToggle={event=>setStudy(event.currentTarget.open)}><summary>Browser interaction study <span>Sample data · local adaptation</span></summary><p>This earlier portfolio study demonstrates a limited task with prepared data. It does not connect to the live product or reproduce every original screen.</p>{study&&<Suspense fallback={<p role="status">Preparing the local study…</p>}><div data-prototype={project} data-prototype-theme={dark?'dark':'light'}><ProductPrototypes project={project}/></div></Suspense>}</details>
 </section>
}
