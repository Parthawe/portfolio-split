import { memo } from 'react'
import art from '../case-study/anatomy/stage-art.json'
import '../../styles/stage-anatomy.css'
import MechanismStory, { type StoryDraw } from './MechanismStory'
const steps = [
  { title: 'Start with the fixed base', body: 'The drawing labels an 8 × 8 ft wooden base. It carries the central axle and the wheel mounts while the platform above changes orientation.' },
  { title: 'Spread support across the wheels', body: 'Two rings of caster assemblies sit underneath the platform. Their wheels follow the circular direction of travel, supporting the deck away from the centre.' },
  { title: 'Locate the centre with an axle', body: 'Steel plates, a shaft and bearings form the central assembly. The original exploded drawing separates these components; the illustration here groups the bearing internals.' },
  { title: 'Bring the platform down', body: 'The 15 × 8 ft wooden deck rests above the wheels and central assembly. Its footprint extends beyond the square base. The existing rotation study shows how scene zones face the audience.' },
]
const Drawing = memo(function Drawing() { return <div className="stage-anatomy story-stage"><svg viewBox={`0 0 ${art.width} ${art.height}`} role="img" aria-label="Stage platform, axle, caster rings and base in an exploded assembly">{art.groups.map(g => <g key={g.name} data-assembly={g.id} data-lift={g.lift} dangerouslySetInnerHTML={{ __html: g.svg }} />)}</svg></div> })
const createDraw: StoryDraw = root => {
  const svg = root.querySelector('svg')!, groups = [...root.querySelectorAll<SVGGElement>('[data-assembly]')]
  // Fit the complete sweep once; the camera stays still while parts move.
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity
  for(const g of groups){const b=g.getBBox();left=Math.min(left,b.x);right=Math.max(right,b.x+b.width);top=Math.min(top,b.y-Number(g.dataset.lift)*art.rise);bottom=Math.max(bottom,b.y+b.height)}
  svg.setAttribute('viewBox',`${left-24} ${top-24} ${right-left+48} ${bottom-top+48}`)
  return progress => {
    const t=Math.max(0,Math.min(1,(progress-2/3)*3)), eased=t*t*(3-2*t), separation=1-eased
    const selected=['base','casters','axle','deck'][Math.min(3,Math.floor(progress*3+.5))]
    for(const g of groups){g.setAttribute('transform',`translate(0 ${-Number(g.dataset.lift)*art.rise*separation})`);g.dataset.highlight=String(g.dataset.assembly===selected)}
  }
}
export default function StageStory(){return <MechanismStory title="What holds a moving stage?" steps={steps} art={<Drawing/>} createDraw={createDraw} source={{href:'/Assets/Projects/RevolvingStage/photos/full-assembly-exploded.png',label:'Compare the original assembly drawing'}} note="Footprints follow the original drawing. Thicknesses and bearing internals are illustrative. This explanation does not simulate loads or certify the structure."/>}
