import { useEffect, useState } from 'react'
import DeferredStory from '../anatomy-stories/DeferredStory'
import DecisionNote from './DecisionNote'
import { EvidenceImage } from './CsScreenStrip'
import { experiencePreviewsEnabled } from '../../utils/experiencePreview'
const studies = [
 {id:'hexa',name:'Hexa-18',pair:'You play the controller',photo:'755.png',question:'How does a performer address three different machines?',choice:'Separate flute, tanpura and tabla gestures across one MIDI controller.',evidence:'The annotated original identifies wind at the top, string inputs on the sloping sides and percussion inside the open lower frame.',limit:'18 inputs are documented. The exact sensor allocation and original wiring are not reconstructed.'},
 {id:'flute',name:'Flute',pair:'Flute → robotic flute',photo:'757.png',question:'What turns the reply into a sustained acoustic note?',choice:'Combine an air supply with servo-driven tone-hole fingers.',evidence:'Follow the pump and hose to the blowing hole, then the Lego-mounted fingers to the flute and Arduino.',limit:'The drawing explains actuation. Browser fingering, pitch and timing do not reproduce the original tuning.'},
 {id:'harp',name:'Harp',pair:'Tanpura → mechanized harp',photo:'756.png',question:'How does a digital phrase become a physical pluck?',choice:'Use servo-mounted picks to release tuned strings in a wooden frame.',evidence:'Compare the annotated string assembly, servo motors and Mega Arduino with the moving pick in the study.',limit:'The browser echoes the played notes. It does not run the original trained model or recover actuator logs.'},
 {id:'rain',name:'Rainsticks',pair:'Tabla → eight rainsticks',photo:'758.png',question:'How can a strike receive a different percussive answer?',choice:'Rotate corner-mounted tubes so their contents fall.',evidence:'The original shows the wooden structure, circuit and servo mount. The creator specifies eight tubes across two stacked cubes.',limit:'Tube travel and browser synthesis are illustrative. The performance records the original acoustic sound.'},
] as const
export default function JugalbandiMechanismStudy(){
 const [selected,setSelected]=useState(0),study=studies[selected]
 useEffect(()=>{const follow=()=>{if(location.hash==='#cs-harp-story')setSelected(2)};follow();addEventListener('hashchange',follow);return()=>removeEventListener('hashchange',follow)},[])
 return <div className="mechanism-evidence">
  <div className="mechanism-evidence__choices" role="group" aria-label="Choose a documented instrument">{studies.map((item,i)=><button className="glass-action" key={item.id} aria-pressed={i===selected} onClick={()=>setSelected(i)}>{item.name}<small>{item.pair}</small></button>)}</div>
  <figure className="service-evidence"><EvidenceImage key={study.id} src={`/Assets/Projects/Jugalbandi/Photos/${study.photo}`} alt={`Original annotated ${study.name} construction photograph`} /><figcaption aria-live="polite"><DecisionNote decision={study} /></figcaption></figure>
  {experiencePreviewsEnabled&&<div key={study.id} data-mechanism-study={study.id}><DeferredStory project={study.id}/></div>}
 </div>
}
