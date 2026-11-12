import {useEffect,useRef,useState} from 'react'
import StageAnatomy from './StageAnatomy'
import {AxleAnatomy,CasterAnatomy,StageAnatomyRotation} from './StageDetails'
import '../../styles/stage-anatomy.css'
const sourceRoot='/Assets/Projects/RevolvingStage/photos/'
const chapters=[
 {name:'Base',title:'Start at the floor',body:'The fixed 8 × 8 ft wooden base carries the central axle and circular caster arrangements. The platform above is 15 × 8 ft: a wide moving deck on a smaller fixed support.',file:'full-assembly-exploded.png',caption:'Original assembly drawing: labelled footprints and the order of the four main assemblies.'},
 {name:'Casters',title:'Support the platform away from its centre',body:'The overview shows two rings of wheels. Each wheel rolls along a tangent to its circular path. Inspect the mounting plate, fork, wheel and axle ends below.',file:'caster-engineering.webp',caption:'Original caster detail, including the swivel-bearing assembly and mounting plate.'},
 {name:'Axle',title:'Open the central mechanism',body:'The original drawing names six components. Separate them, select each one, then close the stack to see how the shaft enters the bearing housing between the two steel plates.',file:'axle-exploded.png',caption:'Original axle drawing: Steel Plate 1, shaft, thrust bearing, ball bearing, bearing and Steel Plate 2.'},
 {name:'Platform',title:'Seat the working surface',body:'The wooden platform sits above the wheels and central axle. Its rectangular footprint extends beyond the base. Lift it to inspect those contacts, then assemble it again.',file:'full-assembly-exploded.png',caption:'The source labels the upper platform 15 × 8 ft and the fixed base 8 × 8 ft.'},
 {name:'Rotation',title:'Turn the deck while the base stays put',body:'Moving the control rotates the rectangular platform in the isometric view; lifting it exposes the fixed support beneath. The 135° position also appears in the scenic concept.',file:'stage-rotation.png',caption:'Original rotation study: clockwise 45°, zero, anticlockwise 45° and anticlockwise 90°.'},
 {name:'Scenery',title:'A new view from the same platform',body:'Different faces present the building, street corner and garden. Compare the source render sequence to understand what a rotation reveals. The decorative construction is documented by these renders; its hidden frame is not specified.',file:'../Mobile/3.jpg',caption:'Original scenic render sequence. The garden reveal is labelled anticlockwise 135°.'},
 {name:'Performance',title:'See the mechanism disappear into the play',body:'The built set and its design render share the shopfront, shutter and striped umbrella. The performance photographs show the completed theatrical environment; the Anatomy views explain the structure beneath it.',file:'stage-vs-render.png',caption:'Built set compared with its design render.'},
 {name:'Disassembly',title:'Return to the individual assemblies',body:'Open the stack again and inspect the base, wheels, axle and platform. This reverse sequence explains their relationship. The drawings do not specify a removal procedure, fastener schedule or handling equipment.',file:'full-assembly-exploded.png',caption:'Original exploded arrangement. This is a project explanation, not a fabrication or dismantling instruction.'},
]
export default function StageWorkshop(){
 const [step,setStep]=useState(0),heading=useRef<HTMLHeadingElement>(null),first=useRef(true),chapter=chapters[step]
 useEffect(()=>{if(first.current){first.current=false;return}heading.current?.focus()},[step])
 const change=(next:number)=>setStep(Math.max(0,Math.min(chapters.length-1,next)))
 return <section className="stage-workshop" aria-label="Revolving stage workshop">
  <header className="stage-journey-intro"><p>From the floor to the final scene</p><h2>The anatomy of the whole stage.</h2><p>Follow eight chapters through the structure, mechanism and performance. Each view stays beside the original work that supports it.</p></header>
  <nav className="stage-journey-nav" aria-label="Stage anatomy chapters">{chapters.map((item,i)=><button key={item.name} aria-current={step===i?'step':undefined} onClick={()=>change(i)}><small>{String(i+1).padStart(2,'0')}</small>{item.name}</button>)}</nav>
  <section className="stage-journey-chapter" aria-labelledby="stage-chapter-title"><header><p className="stage-journey-counter">{step+1} / {chapters.length}</p><h2 id="stage-chapter-title" ref={heading} tabIndex={-1}>{chapter.title}</h2><p>{chapter.body}</p></header>
   <div className="stage-journey-layout"><div key={step}>
    {step===1?<CasterAnatomy/>:step===2?<AxleAnatomy/>:step===4||step===5?<StageAnatomyRotation/>:step===6?<figure className="stage-performance"><img loading="lazy" src={sourceRoot+'performance-collage.webp'} alt="Photographs of the finished revolving stage during the play"/><figcaption>The finished set during performance.</figcaption></figure>:<StageAnatomy initialSeparation={step===3?0:100}/>}
   </div><aside className="stage-journey-evidence"><p>Original work</p><figure><a href={sourceRoot+chapter.file} target="_blank" rel="noopener noreferrer"><img key={chapter.file} loading="lazy" src={sourceRoot+chapter.file} alt={chapter.caption}/></a><figcaption>{chapter.caption}</figcaption></figure><a href={sourceRoot+chapter.file} target="_blank" rel="noopener noreferrer">Inspect full-size source ↗</a></aside></div>
  </section>
  <nav className="stage-journey-progress" aria-label="Move through stage anatomy"><button disabled={step===0} onClick={()=>change(step-1)}>← Previous chapter</button><p role="status">{step+1} of {chapters.length} · {chapter.name}</p>{step===chapters.length-1?<button onClick={()=>change(0)}>Start again ↺</button>:<button onClick={()=>change(step+1)}>Next: {chapters[step+1].name} →</button>}</nav>
  <p className="stage-journey-note">The drawings establish the footprints and named components. Thicknesses and internal fits are illustrative. This experience does not calculate loads, certify the structure or infer undocumented drive equipment.</p>
 </section>
}
