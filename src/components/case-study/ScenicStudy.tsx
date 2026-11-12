import { lazy, Suspense, useState } from 'react'
import ExperienceBoundary from '../ExperienceBoundary'
const ScenicViewport=lazy(()=>import('./ScenicViewport'))
export type ScenicKind='dumb-waiter'|'drowning'|'tedx'
const sources:Record<ScenicKind,{title:string;image:string;detail:string;note:string}>={
 'dumb-waiter':{title:'A basement in depth',image:'/Assets/Projects/dumb-waiter/photos/set-wide.jpg',detail:'/Assets/Projects/dumb-waiter/photos/overhead-room.jpg',note:'Photograph-informed study of the room, stair, landing and furniture. Proportions are illustrative; hidden construction is omitted.'},
 drowning:{title:'Inside the greenhouse',image:'/Assets/Projects/Drowning/photos/A4 - 3.png',detail:'/Assets/Projects/Drowning/photos/A4 - 5.png',note:'Drawing-informed study of the greenhouse frame, doors and planting. Scene lighting is illustrative, not a reconstruction of the original lighting rig.'},
 tedx:{title:'A skyline with depth',image:'/Assets/Projects/Tedxvitpune/Desktop/5.jpg',detail:'/Assets/Projects/Tedxvitpune/Desktop/3.jpg',note:'Photograph-informed study of the skyline layers and stage lettering. Heights and depths are proportional, not fabrication measurements.'}}
export default function ScenicStudy({kind}:{kind:ScenicKind}){
 const [active,setActive]=useState(false),[view,setView]=useState(0),[revision,setRevision]=useState(0),[light,setLight]=useState(false),[touch,setTouch]=useState(false)
 const source=sources[kind]
 return <section className="project-study" aria-label={`${source.title} spatial study`}>
 <header><h3>{source.title}</h3><span>Spatial reconstruction · draft</span></header><p>{source.note}</p>
 {!active?<button className="glass-action" onClick={()=>setActive(true)}>Explore the set in 3D</button>:<><div className="project-study-controls" role="group" aria-label="Set views">
 {['Overview','Front','Above'].map((name,i)=><button key={name} className="glass-action" aria-pressed={view===i} onClick={()=>{setView(i);setRevision(v=>v+1)}}>{name}</button>)}
 <button className="glass-action" aria-pressed={light} onClick={()=>setLight(v=>!v)}>{light?'Work light':'Performance light'}</button>
 <button className="glass-action" aria-pressed={touch} onClick={()=>setTouch(v=>!v)}>Touch rotation {touch?'on':'off'}</button>
 <button className="glass-action" onClick={()=>{setView(0);setLight(false);setTouch(false);setRevision(v=>v+1)}}>Reset view</button><button className="glass-action" onClick={()=>setActive(false)}>Close 3D</button></div>
 <ExperienceBoundary fallback={<p>The 3D study could not load. Compare the source images below. <button className="glass-action" onClick={()=>{setActive(false)}}>Close failed view</button></p>}><Suspense fallback={<div className="project-study-stage" aria-busy="true"><p role="status">Loading the set geometry…</p></div>}><ScenicViewport kind={kind} view={view} revision={revision} light={light} touch={touch}/></Suspense></ExperienceBoundary>
 <p>Drag to orbit, or focus the view and use arrow keys. Touch rotation is optional so you can scroll the page.</p></>}
 <details><summary className="glass-action">Compare with the original</summary><div className="project-study-source"><figure><img data-project-preview src={source.image} alt={`Original ${kind} composition`} loading="lazy"/><figcaption>Original composition. Use this as the fidelity reference.</figcaption></figure><figure><img data-project-preview src={source.detail} alt={`Original ${kind} construction or scene detail`} loading="lazy"/><figcaption>Original detail. The reconstruction omits undocumented backs and mechanisms.</figcaption></figure></div></details>
 </section>
}
