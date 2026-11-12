import { useId, useState, useRef, useLayoutEffect } from 'react'
import PortfolioSlider from '../PortfolioSlider'
import art from './anatomy/stage-art.json'
import '../../styles/stage-anatomy.css'
const parts = [
  { id: 'deck', name: 'Revolving platform', text: 'The drawing labels a 15 × 8 ft wooden platform. Its overhang gives the set more area than the supporting base.' },
  { id: 'axle', name: 'Central axle', text: 'The central steel plates, shaft, and bearings locate the axis of rotation. The original axle drawing below shows the individual components.' },
  { id: 'casters', name: 'Caster assemblies', text: 'Two circular arrangements of wheels support the underside of the platform. Each wheel follows the direction of the circular track.' },
  { id: 'base', name: 'Fixed base', text: 'The 8 × 8 ft wooden base carries the axle and caster assemblies. It stays in place while the upper platform rotates.' },
]
export default function StageAnatomy({initialPart='all',initialSeparation=100}:{initialPart?:string;initialSeparation?:number}={}) {
 const id=useId(),[separation,setSeparation]=useState(initialSeparation),[selected,setSelected]=useState(initialPart)
 const svgRef=useRef<SVGSVGElement>(null)
 const [viewBox,setViewBox]=useState(`0 0 ${art.width} ${art.height}`)
 useLayoutEffect(()=>{
  const groups=svgRef.current?.querySelectorAll<SVGGElement>('g[data-part]')
  if(!groups)return
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity
  groups.forEach(g=>{
   if(selected!=='all'&&g.dataset.part!==selected)return
   const b=g.getBBox(),dy=Number(g.dataset.offset)
   left=Math.min(left,b.x);right=Math.max(right,b.x+b.width);top=Math.min(top,b.y+dy);bottom=Math.max(bottom,b.y+b.height+dy)
  })
  const padding=selected==='all'?24:12
  if(Number.isFinite(left))setViewBox(`${left-padding} ${top-padding} ${right-left+padding*2} ${bottom-top+padding*2}`)
 },[selected,separation])
 const active=parts.find(p=>p.id===selected)
 return <figure className="stage-anatomy">
  <div className="stage-anatomy__heading"><h3>Inside the revolving stage</h3><button type="button" onClick={()=>{setSeparation(100);setSelected('all')}}>Reset assembly</button></div>
  <p className="stage-anatomy__hint">Separate the deck to reveal the wheels and axle. Choose a component for a close-up and an explanation.</p>
  <svg ref={svgRef} viewBox={viewBox} role="img" aria-labelledby={`${id}-title ${id}-description`}>
   <title id={`${id}-title`}>Revolving stage assembly</title><desc id={`${id}-description`}>A rectangular platform sits above a central axle and two rings of caster wheels on a square base. Use the controls below to separate or inspect these assemblies.</desc>
   {art.groups.map(g=><g key={g.name} data-part={g.id} data-offset={-g.lift*art.rise*separation/100} data-selected={selected===g.id} opacity={selected==='all'||selected===g.id?1:0} transform={`translate(0 ${-g.lift*art.rise*separation/100})`} dangerouslySetInnerHTML={{__html:g.svg}} />)}
  </svg>
  <div className="stage-anatomy__parts" role="group" aria-label="Assembly positions"><button type="button" aria-pressed={separation===0} onClick={()=>setSeparation(0)}>Assemble</button><button type="button" aria-pressed={separation===100} onClick={()=>setSeparation(100)}>Take apart</button></div>
  <label className="stage-anatomy__range" htmlFor={`${id}-separation`}>Separate the assembly <output>{separation===0?'Together':separation===100?'Exploded':`${separation}% apart`}</output>
   <PortfolioSlider id={`${id}-separation`} type="range" min="0" max="100" value={separation} onChange={e=>setSeparation(Number(e.target.value))} />
  </label>
  <div className="stage-anatomy__parts" role="group" aria-label="Inspect an assembly">
   <button type="button" aria-pressed={selected==='all'} onClick={()=>setSelected('all')}>Whole assembly</button>
   {parts.map(p=><button type="button" key={p.id} aria-pressed={selected===p.id} onClick={()=>setSelected(p.id)}>{p.name}</button>)}
  </div>
  <p className="stage-anatomy__reading" aria-live="polite">{active?.text||'Separate the platform to see how the fixed base, wheels, and central axle sit underneath it. Select a component to inspect its role.'}</p>
  <figcaption>Assembly illustration based on the original construction drawing. Footprint proportions follow the labelled dimensions; component thicknesses are illustrative. This does not simulate loads or certify the structure. <a href="/Assets/Projects/RevolvingStage/photos/full-assembly-exploded.png" target="_blank" rel="noopener noreferrer">Compare the original drawing ↗</a></figcaption>
 </figure>
}
