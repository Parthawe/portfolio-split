import { memo } from 'react'
import { useThemeMode } from '../../hooks/useThemeMode'
import art from '../jugalbandi-anatomy/art.json'
import { planeRotation } from '../jugalbandi-anatomy/model'
import '../jugalbandi-anatomy/anatomy-ink.css'
import MechanismStory, { type StoryDraw, type StoryStep } from './MechanismStory'
type Study = 'flute' | 'rain' | 'hexa'
const studies: Record<Study, { title: string; photo: string; steps: StoryStep[] }> = {
  flute: { title: 'Air and fingers, one phrase', photo: '757.png', steps: [
    { title: 'The air supply feeds the flute', body: 'The construction photograph shows a pump and hose supplying the bamboo flute. The drawing keeps the air inlet and actuator mounts visible.' },
    { title: 'A servo moves the linkage', body: 'Arduino-controlled servos move the photographed finger mechanisms. Hold this step to inspect how the linkage reaches a tone hole.' },
    { title: 'Opening a hole changes the air column', body: 'The finger lifts away from a tone hole. This explanatory motion shows the relationship between actuation and fingering; it does not recover the original tuning.' },
    { title: 'The mechanism returns', body: 'The finger returns to its closed pose. Compare the construction photograph and the original performance for the physical instrument and its actual sound.' },
  ] },
  rain: { title: 'Eight rainsticks, two stacked cubes', photo: '758.png', steps: [
    { title: 'Two bays support eight tubes', body: 'Four rainsticks occupy the corners of each cube. The two stacked bays give eight corner-mounted tubes, rather than four sticks on a flat frame.' },
    { title: 'A corner motor turns a tube', body: 'A selected rainstick turns about its photographed mount. The browser angle makes the change in orientation readable; its travel is illustrative.' },
    { title: 'The contents fall', body: 'Changing orientation makes the contents fall through the tube. That movement produces the rain-like percussion heard in the performance.' },
    { title: 'The tube is ready for another response', body: 'The tube returns to a resting pose. In the duet, a tabla gesture on Hexa-18 prompts the robotic rainstick response.' },
  ] },
  hexa: { title: 'Three gestures start the duet', photo: '755.png', steps: [
    { title: 'Play the top flute inputs', body: 'The top region belongs to the flute voice. A performed phrase on the controller prompts the robotic flute to answer.' },
    { title: 'Move a hand by the tanpura region', body: 'The side and middle region belongs to the tanpura voice. In the online instrument, pointer movement or touch sliding represents the hand gesture; the robotic harp answers.' },
    { title: 'Strike the tabla region', body: 'The inside and lower region belongs to the tabla voice. Percussive input prompts the rainsticks to respond.' },
    { title: 'Listen to the exchange', body: 'Hexa-18 is the performer’s MIDI instrument; the acoustic machines form the other voice. The source documents 18 inputs, but their exact wiring and allocation have not been recovered.' },
  ] },
}
const Drawing = memo(function Drawing({ study }: { study: Study }) {
  const dark = useThemeMode(), scene = art[study]
  return <div className="iso story-instrument" data-theme={dark ? 'dark' : 'light'}><svg role="img" viewBox="0 0 900 650" aria-label={studies[study].title}><g data-study-static dangerouslySetInnerHTML={{ __html: scene.svg }} />{scene.live.map(part => <g key={part.id} data-study-part={part.id} dangerouslySetInnerHTML={{ __html: part.svg }} />)}{study === 'hexa' && <circle data-study-region cx="450" cy="220" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />}</svg></div>
})
const draws: Record<Study, StoryDraw> = Object.fromEntries((['flute', 'rain', 'hexa'] as Study[]).map(study => [study, ((root: HTMLElement) => {
  const svg = root.querySelector('svg')!, scene = art[study]
  const box = svg.getBBox(), pad = 26
  const initial = { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 }
  const part = root.querySelector<SVGGElement>(`[data-study-part="${study === 'flute' ? 'finger-2' : 'stick-0'}"]`)
  if (part) part.setAttribute('data-emphasis', 'true')
  return (progress: number) => {
    const envelope = Math.sin(Math.PI * progress)
    if (part && study !== 'hexa') {
      const live = scene.live[study === 'flute' ? 2 : 0]
      part.setAttribute('transform', planeRotation(envelope * (study === 'flute' ? 40 : 55), live.pivot, scene.projection, study === 'flute' ? 'yz' : 'xz'))
    }
    // Keep turning parts within the frame; zoom only into the fixed controller.
    if (study === 'hexa') {
      const region = root.querySelector('[data-study-region]')!
      // Physical regions come from the same enclosure coordinate system as the build.
      const world = progress < 1/6 ? [0,0,245] : progress < .5 ? [55,55,155] : progress < 5/6 ? [0,0,50] : [0,0,140]
      const projection = art.hexa.projection, a = projection.azimuth * Math.PI / 180, e = projection.elevation * Math.PI / 180, k = projection.scale * Math.sqrt(1.6)
      region.setAttribute('cx', String(projection.origin[0] + (world[0] * Math.sin(a) - world[1] * Math.cos(a)) * k))
      region.setAttribute('cy', String(projection.origin[1] + ((world[0] * Math.cos(a) + world[1] * Math.sin(a)) * Math.sin(e) - world[2] * Math.cos(e)) * k))
      region.setAttribute('opacity', progress > 5/6 ? '0' : '1')
    }
    const zoom = 1
    svg.setAttribute('viewBox', `${initial.x + initial.width * (1 - 1 / zoom) / 2} ${initial.y + initial.height * (1 - 1 / zoom) / 2} ${initial.width / zoom} ${initial.height / zoom}`)
  }
}) as StoryDraw])) as Record<Study, StoryDraw>
export default function InstrumentStory({ study }: { study: Study }) {
  const definition = studies[study]
  return <MechanismStory title={definition.title} steps={definition.steps} art={<Drawing study={study} />} createDraw={draws[study]} source={{ href: `/Assets/Projects/Jugalbandi/Photos/${definition.photo}`, label: 'Compare the annotated construction photograph' }} note="Based on the original construction photographs and the creator’s description. Motion, timing and browser gestures are explanatory; scrolling never plays sound." />
}
