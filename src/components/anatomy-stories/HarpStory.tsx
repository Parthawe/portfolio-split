import { memo } from 'react'
import { useThemeMode } from '../../hooks/useThemeMode'
import art from './harp-art.json'
import { planeRotation, pluckAt } from '../jugalbandi-anatomy/model'
import '../jugalbandi-anatomy/anatomy-ink.css'
import MechanismStory, { type StoryDraw } from './MechanismStory'
const steps = [
  { title: 'A sequence becomes a movement', body: 'In the documented installation, Arduino-controlled servos turn a musical pattern into plucks. The diagonal and lower rails position the actuators around the harp.' },
  { title: 'The pick loads a string', body: 'A small servo movement displaces a string. Holding this pose makes the physical action visible before the release.' },
  { title: 'Release creates the attack', body: 'Once released, the string vibrates. The browser drawing exaggerates its displacement so the causal sequence is readable at this size.' },
  { title: 'The pick returns to rest', body: 'The servo returns and the vibration decays. Hear the actual instruments in the original performance; scrolling this explanation never plays audio.' },
]
const scene=art
const Drawing=memo(function Drawing(){const dark=useThemeMode();return <div className="iso story-harp" data-theme={dark?'dark':'light'}><svg viewBox="0 0 900 650" role="img" aria-label="Mechanized harp showing one servo loading and releasing a string"><g dangerouslySetInnerHTML={{__html:scene.svg}}/>{scene.live.map(g=><g key={g.id} data-story-horn={g.id} dangerouslySetInnerHTML={{__html:g.svg}}/>)}</svg></div>})
const createDraw:StoryDraw=root=>{
 const svg=root.querySelector('svg')!
 const index=2, horn=root.querySelector(`[data-story-horn="horn-${index}"]`)!, string=root.querySelector(`[data-string="${scene.channels[index]}"]`)!,[a,b]=scene.strings[scene.channels[index]]
 horn.setAttribute('data-emphasis','true');string.setAttribute('data-emphasis','true')
 return progress=>{
  // These are readable mechanical poses, not recovered actuator timestamps.
  const seconds=progress<=1/3?progress*3*.29:progress<=2/3?.29+(progress-1/3)*3*.11:.4+(progress-2/3)*3*.9
  const state=pluckAt(seconds)
  const zoomT=progress<1/3?progress*3:progress>2/3?(1-progress)*3:1, zoom=zoomT*zoomT*(3-2*zoomT)
  const [px,py]=scene.points[index]
  svg.setAttribute('viewBox',`${(px-125)*zoom} ${(py-125)*zoom} ${900+(250-900)*zoom} ${650+(250-650)*zoom}`)
  horn.setAttribute('transform',planeRotation(state.angle,scene.live[index].pivot,scene.projection))
  string.setAttribute('d',`M${a} Q${(a[0]+b[0])/2+state.deflection*3} ${(a[1]+b[1])/2} ${b}`)
 }
}
export default function HarpStory(){return <MechanismStory title="One pluck, step by step" steps={steps} art={<Drawing/>} createDraw={createDraw} source={{href:'/Assets/Projects/Jugalbandi/Photos/756.png',label:'Compare the annotated construction photograph'}} note="An illustrative pluck cycle based on the photographed mechanism. Channel routing, travel, timing and vibration are not recovered measurements of the original controller."/>}
