import { memo, useEffect, useRef, useState } from 'react'
import { useThemeMode } from '../../hooks/useThemeMode'
import PortfolioSlider from '../PortfolioSlider'
import art from './art.json'
import { clamp, instruments, names, planeRotation, pluckAt, flutePitchStep, midiForSensor, HEXA_SENSOR_COUNT, hexaSections, rainMountNames, type HexaVoice, type Instrument } from './model'
import { MechanismAudio } from './audio'
import JugalbandiDuet from './JugalbandiDuet'
import './anatomy-ink.css'
import './jugalbandi.css'
// Preserve ref-driven moving groups while control state and readouts change.
const StaticArt=memo(function StaticArt({html}:{html:string}){return <g aria-hidden="true" dangerouslySetInnerHTML={{__html:html}}/>})
const photo = { harp: '756.png', flute: '757.png', rain: '758.png', hexa: '755.png' }
const descriptions = {
  harp: 'Choose a servo. Its pick loads a string, releases it, and returns to rest.',
  flute: 'Close the tone holes, then send air through the flute. Fingers alone make no sound.',
  rain: 'Eight rainsticks sit at the corners of two stacked cubes. Choose a mount and turn its tube.',
  hexa: 'Three Indian instruments: flute at the top, tanpura on the sides and tabla inside. Choose a section’s sound, then try the shared 18-input demo bank.',
}
export default function JugalbandiAnatomy(){
  const [inspect,setInspect]=useState(false)
  return <>{!inspect&&<JugalbandiDuet/>}<details className="jugal-inspection" onToggle={event=>setInspect(event.currentTarget.open)}><summary>{inspect?'Return to the duet':'Inspect individual instruments and original evidence'}</summary>{inspect&&<MechanismWorkshop/>}</details></>
}
function MechanismWorkshop() {
  const [instrument, setInstrument] = useState<Instrument>('harp'), [selected, setSelected] = useState(0)
  const [holes, setHoles] = useState([false, false, false, false, false, false]), [tilt, setTilt] = useState(0)
  const [velocity,setVelocity]=useState(96)
  const [hexaVoice,setHexaVoice]=useState<HexaVoice>('flute')
  const hexaSection=hexaSections.find(section=>section.id===hexaVoice)!
  const [zoom, setZoom] = useState(false)
  const [sound, setSound] = useState(false), [status, setStatus] = useState('Choose a servo to pluck a string.'), [error, setError] = useState(''), [filmError, setFilmError] = useState(false)
  const actualTilt = useRef(0)
  const stage = useRef<HTMLDivElement>(null), svg = useRef<SVGSVGElement>(null), video = useRef<HTMLVideoElement>(null), readout = useRef<HTMLOutputElement>(null)
  const controller = useRef(new MechanismAudio()), cancel = useRef<() => void>(() => {}), visible = useRef(true), audioOn = useRef(false), actionVersion = useRef(0)
  const dark = useThemeMode(), scene = art[instrument]
  const stop = () => { actionVersion.current++; cancel.current(); controller.current.stop(); stage.current?.setAttribute('data-running', 'false'); stage.current?.setAttribute('data-air','false');stage.current?.removeAttribute('data-midi-active') }
  const resetArt = () => {
    svg.current?.querySelectorAll<SVGGElement>('[data-moving]').forEach(node => node.removeAttribute('transform'))
    svg.current?.querySelectorAll<SVGPathElement>('[data-string]').forEach(node => {
      const [a, b] = art.harp.strings[Number(node.dataset.string)]; node.setAttribute('d', `M${a} L${b}`)
    })
    stage.current?.removeAttribute('data-midi-active')
    if (readout.current) readout.current.textContent = 'At rest'
  }
  const reset = () => { stop(); resetArt(); actualTilt.current=0; setZoom(false);setHexaVoice('flute');setVelocity(96); setHoles([false,false,false,false,false,false]); setTilt(0); setSelected(0); setSound(false); audioOn.current=false; setStatus('Reset. All mechanisms at rest; sound off.'); setError(''); video.current?.pause() }
  useEffect(() => {
    const node = stage.current!
    const observer = new IntersectionObserver(entries => {
      visible.current = entries[entries.length - 1].isIntersecting
      if (!visible.current) { stop(); if(svg.current?.closest('[data-instrument=harp]'))resetArt(); setStatus('Paused outside the view. Operate the mechanism to continue.') }
    }); observer.observe(node)
    const hide = () => { if (document.hidden) { stop(); if(svg.current?.closest('[data-instrument=harp]'))resetArt(); video.current?.pause() } }
    document.addEventListener('visibilitychange', hide)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', hide); stop(); controller.current.close() }
  }, [])
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => { if (query.matches) { stop(); resetArt() } }
    query.addEventListener('change', change); return () => query.removeEventListener('change', change)
  }, [])
  const changeInstrument = (next: Instrument) => { reset(); setInstrument(next); setStatus(descriptions[next]) }
  function animate(duration: number, draw: (elapsed: number) => void, done: () => void) {
    stop(); const token = actionVersion.current
    if (!visible.current || matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(duration); done(); return }
    let frame = 0, start = 0
    const tick = (now: number) => {
      if (token !== actionVersion.current || document.hidden || !visible.current) return
      if (!start) start = now
      const t = Math.min(duration, (now - start) / 1000); draw(t)
      if (t < duration) frame = requestAnimationFrame(tick)
      else { stage.current?.setAttribute('data-running', 'false'); done() }
    }
    cancel.current = () => cancelAnimationFrame(frame)
    stage.current?.setAttribute('data-running', 'true'); frame = requestAnimationFrame(tick)
  }
  const play = (kind: Instrument, channel: number) => { if (audioOn.current) controller.current.play(kind, channel) }
  function pluck(index: number) {
    resetArt(); setSelected(index); setStatus(`Servo ${index + 1}: loading, releasing, and returning.`)
    const horn = svg.current?.querySelector(`[data-moving="horn-${index}"]`), stringIndex = art.harp.channels[index]
    const string = svg.current?.querySelector(`[data-string="${stringIndex}"]`), [a,b] = art.harp.strings[stringIndex]
    let released = false
    animate(1.3, t => {
      const state = pluckAt(t)
      horn?.setAttribute('transform', planeRotation(state.angle, art.harp.live[index].pivot, art.harp.projection))
      string?.setAttribute('d', `M${a} Q${(a[0]+b[0])/2+state.deflection*3} ${(a[1]+b[1])/2} ${b}`)
      if (readout.current) readout.current.textContent = state.released ? 'String released · decaying' : 'Pick loading the string'
      if (state.released && !released) { released = true; play('harp', index) }
    }, () => { resetArt(); setStatus(`Servo ${index+1} completed one pluck.`) })
  }
  const toggleHole = (index: number) => {
    stop(); setSelected(index)
    const next = [...holes]; next[index] = !next[index]; setHoles(next)
    setStatus(`Hole ${index+1} ${next[index]?'closed':'open'}. Send air to hear the demonstration.`)
  }
  useEffect(() => {
    if (instrument !== 'flute') return
    holes.forEach((closed, i) => { const node=svg.current?.querySelector(`[data-moving="finger-${i}"]`); node?.setAttribute('transform', planeRotation(closed?0:(i%2===0?45:-45),art.flute.live[i].pivot,art.flute.projection,'yz')) })
  }, [holes, instrument])
  function breathe() {
    setStatus('Air pulse: the current finger pattern sets the illustrative pitch.')
    let played = false
    animate(.8, t => { if (!played) { play('flute', flutePitchStep(holes)); played=true }; stage.current?.setAttribute('data-air', t < .8?'true':'false'); if(readout.current)readout.current.textContent=`Air on · ${holes.filter(Boolean).length} holes closed` }, () => { stage.current?.setAttribute('data-air','false'); if(readout.current)readout.current.textContent='Air off';setStatus('Air pulse finished.') })
  }
  function turn(next: number) {
    const target=clamp(next,-70,70), from=actualTilt.current; setTilt(target)
    setStatus(`Turning rainstick ${selected+1} toward ${Math.round(target)}°.`)
    let played=false
    animate(.65,t=>{
      const angle=from+(target-from)*(1-Math.exp(-t*9))/(1-Math.exp(-.65*9))
      actualTilt.current=angle
      svg.current?.querySelector(`[data-moving="stick-${selected}"]`)?.setAttribute('transform',planeRotation(angle,art.rain.live[selected].pivot,art.rain.projection))
      if(readout.current)readout.current.textContent=`${Math.round(angle)}° from upright`
      if(!played&&Math.abs(target-from)>2){play('rain',selected);played=true}
    },()=>{setStatus(`Rainstick ${selected+1}: ${Math.round(target)}° from upright.`)})
  }
  function triggerSensor(index:number) {
    resetArt();setSelected(index)
    const event=midiForSensor(index,velocity)
    setStatus(`${hexaSection.name} · ${hexaSection.location.toLowerCase()}: input ${event.sensor+1} sends demo MIDI note ${event.note}, velocity ${event.velocity}, on channel ${event.channel}.`)
    let played=false
    animate(.6,()=>{
      stage.current?.setAttribute('data-midi-active',String(index))
      if(readout.current)readout.current.textContent=`${hexaSection.name} · input ${index+1} · note ${event.note} · velocity ${event.velocity}`
      if(!played){if(audioOn.current)controller.current.play('hexa',index,velocity,hexaVoice);played=true}
    },()=>{stage.current?.removeAttribute('data-midi-active');setStatus(`${hexaSection.name} · input ${index+1}: demo note ${event.note} released.`)})
  }
  const operate = (i: number) => { if(instrument==='hexa'){triggerSensor(i);return;} if(instrument==='harp')pluck(i);else if(instrument==='flute')toggleHole(i);else {stop();resetArt();actualTilt.current=0;setSelected(i);setTilt(0);setStatus(`Rainstick ${i+1} selected. Turn it with the angle control.`)} }
  async function toggleSound() {
    if(sound){audioOn.current=false;setSound(false);controller.current.stop();return}
    const token=actionVersion.current; try { await controller.current.enable(); if(token!==actionVersion.current)return; audioOn.current=true;setSound(true);setError('') } catch {setError('Sound could not start. Try again, or explore the mechanisms silently.')}
  }
  return <section className="ja iso" data-theme={dark?'dark':'light'} aria-label="Jugalbandi mechanism workshop">
    <div className="ja-intro"><p className="ja-eyebrow">Four instruments in the duet</p><h2>Play Jugalbandi’s acoustic and MIDI instruments.</h2><p>Play the acoustic mechanisms and explore Hexa-18’s 18 MIDI inputs. Compare each with the original photographs and performance.</p></div>
    <div className="ja-tabs" role="group" aria-label="Choose a mechanism">{instruments.map((key,i)=><button key={key} aria-pressed={instrument===key} onClick={()=>changeInstrument(key)}><span>0{i+1}</span>{names[key]}</button>)}</div>
    <div className="ja-workbench">
      <figure className="ja-figure iso-plate">
        <div className="ja-caption"><span>Fig. 0{instruments.indexOf(instrument)+1}</span><span>{names[instrument]}</span></div>
        <div className="ja-stage" ref={stage} data-running="false" data-instrument={instrument}>
          <svg ref={svg} viewBox={zoom?(instrument==='hexa'?'250 80 400 490':`${clamp(scene.points[selected][0]-150,0,600)} ${clamp(scene.points[selected][1]-150,0,350)} 300 300`):instrument==='rain'||instrument==='hexa'?'150 0 600 650':'0 0 900 650'} role="group" aria-label={`${names[instrument]} interactive mechanism`}>
            <StaticArt html={scene.svg}/>
            {(!scene.embedded?scene.live:[]).map(part=><g key={`${instrument}-${part.id}`} aria-hidden="true" data-moving={part.id} dangerouslySetInnerHTML={{__html:part.svg}} />)}
            {(instrument==='hexa'?[]:scene.points).map(([x,y],i)=><g key={`${instrument}-${i}`} role="button" tabIndex={zoom&&i!==selected?-1:0} aria-label={instrument==='harp'?`Pluck servo ${i+1}`:instrument==='flute'?`Toggle hole ${i+1}`:`Select rainstick ${i+1}`} aria-pressed={instrument==='flute'?holes[i]:selected===i} className="ja-hit" onClick={()=>operate(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();operate(i)}}}><circle cx={x} cy={y} r={18}/><title>{instrument==='harp'?'Pluck':instrument==='flute'?'Toggle hole':'Select'} {i+1}</title></g>)}
          </svg>
        </div>
        <figcaption className="ja-caption"><span>{instrument==='hexa'?'Choose one of the 18 inputs':'Tap a mechanism or use the controls'}</span><output ref={readout}>At rest</output></figcaption>
      </figure>
      <aside className="ja-controls" aria-label="Mechanism controls"><h3>{names[instrument]}</h3><p>{descriptions[instrument]}</p>
        {instrument==='harp'?<><label htmlFor="ja-servo">Servo position</label><select id="ja-servo" value={selected} onChange={e=>{stop();resetArt();setSelected(Number(e.target.value))}}>{Array.from({length:11},(_,i)=><option key={i} value={i}>{i<6?'Upper rail':'Lower rail'} · {i<6?i+1:i-5}</option>)}</select><button className="ja-action" onClick={()=>pluck(selected)}>Pluck selected string</button></>:instrument==='flute'?<><div className="ja-holes" role="group" aria-label="Flute tone holes">{holes.map((closed,i)=><button key={i} aria-label={`Hole ${i+1}`} aria-pressed={closed} onClick={()=>toggleHole(i)}>{i+1}<small>{closed?'Closed':'Open'}</small></button>)}</div><button className="ja-action" onClick={breathe}>Send an air pulse</button></>:instrument==='hexa'?<><div className="ja-hexa-sections" role="group" aria-label="Indian instrument sections">{hexaSections.map(section=><button key={section.id} aria-pressed={hexaVoice===section.id} onClick={()=>{stop();resetArt();setHexaVoice(section.id);setStatus(`${section.location}: ${section.name}. Choose an input to hear its synthesized demonstration.`)}}>{section.location} · {section.name}</button>)}</div><div className="ja-inputs" role="group" aria-label="Hexa-18 sensor inputs">{Array.from({length:HEXA_SENSOR_COUNT},(_,i)=><button key={i} aria-label={`Trigger sensor ${i+1}`} aria-pressed={selected===i} onClick={()=>triggerSensor(i)}><span>{String(i+1).padStart(2,'0')}</span></button>)}</div><label htmlFor="ja-velocity">Demo velocity <output>{velocity}</output></label><PortfolioSlider id="ja-velocity" min={1} max={127} value={velocity} onChange={e=>setVelocity(Number(e.target.value))}/><button className="ja-action" onClick={()=>triggerSensor(selected)}>Trigger selected sensor</button><p className="ja-note">18 inputs across the instrument. The bank uses demo notes 60–77 with the selected section’s synthesized sound. Exact sensor counts per section, wiring and tuning are not reconstructed.</p></>:<><label htmlFor="ja-stick">Corner mount</label><select id="ja-stick" value={selected} onChange={e=>operate(Number(e.target.value))}>{rainMountNames.map((s,i)=><option key={s} value={i}>{s}</option>)}</select><label htmlFor="ja-tilt">Rainstick angle <output>{tilt}°</output></label><PortfolioSlider id="ja-tilt" min={-70} max={70} value={tilt} onChange={e=>turn(Number(e.target.value))}/><button className="ja-action" onClick={()=>turn(tilt<=0?65:-65)}>Turn the rainstick</button></>}
        <button aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?'Show whole instrument':'Inspect selected mechanism'}</button>
        <p className="ja-status" role="status">{status}</p>
        <div className="ja-secondary"><button aria-pressed={sound} onClick={toggleSound}>{sound?'Sound on':'Enable sound'}</button><button onClick={reset}>Reset</button></div>
        <p className="ja-note">Sound is synthesized in your browser. Pitches, travel and timing are illustrative; the original model and actuator logs are not available here.</p>{error&&<p role="alert">{error}</p>}
      </aside>
    </div>
    <div className="ja-source"><div><p className="ja-eyebrow">Compare the construction</p><h3>The original {instrument==='rain'?'rainstick rack':instrument==='hexa'?'Hexa-18':instrument}.</h3><p>{instrument==='harp'?'The diagonal and lower rails hold the visible servos around the harp. Demo channels illustrate the pluck cycle; the original wiring and tuning are not reconstructed.':instrument==='flute'?'This bench view follows the annotated construction photo. In the performance, the flute is mounted upright. Six fingers control the holes; the pump supplies the air.':instrument==='hexa'?'The top is the flute, the side inputs are tanpura and the inside inputs are tabla. These instrument locations are confirmed by the creator. The enclosure and pipes follow the photograph; the 18-channel bank demonstrates MIDI input without claiming the original wiring or tuning.':'Eight tubes occupy the corners of two stacked cubic bays. Four are visible in this front construction photograph. Dimensions and the acoustic response are illustrative.'}</p></div><a href={`/Assets/Projects/Jugalbandi/Photos/${photo[instrument]}`} target="_blank" rel="noreferrer"><img src={`/Assets/Projects/Jugalbandi/Photos/${photo[instrument]}`} alt={`Original annotated ${names[instrument]} construction photograph`} loading="lazy"/><span>Open original photograph ↗</span></a></div>
    <details className="ja-film" onToggle={e=>{if(!e.currentTarget.open)video.current?.pause()}}><summary>Watch the original performance · 5:10</summary><p>The recording combines acoustic mechanisms and digital instruments. It is independent of the illustrative sounds above.</p><video ref={video} controls playsInline preload="none" poster="/Assets/images/jugalbandi.webp" onPlay={()=>{stop();audioOn.current=false;setSound(false)}} onError={()=>setFilmError(true)}><source src="/Assets/films/jugalbandi.mp4" type="video/mp4"/><track kind="captions" src="/Assets/captions/jugalbandi.en.vtt" srcLang="en" label="English (automatic, review pending)"/></video>{filmError&&<p role="alert">The local recording could not load. <a href="https://vimeo.com/996020149" target="_blank" rel="noreferrer">Watch the original on Vimeo ↗</a></p>}</details>
  </section>
}
