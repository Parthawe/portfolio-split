import {memo,useEffect,useLayoutEffect,useRef,useState} from 'react'
import {useThemeMode} from '../../hooks/useThemeMode'
import PortfolioSlider from '../PortfolioSlider'
import art from './art.json'
import {MechanismAudio} from './audio'
import HexaPlayingSurface from './HexaPlayingSurface'
import {useGestureNotes} from './useGestureNotes'
import {hexaSections,planeRotation,pluckAt,type HexaVoice} from './model'
import {duetSequence,noteName,parseTune,responders,tunes,type DuetEvent} from './duet'
import './anatomy-ink.css'
import './jugalbandi.css'
const Drawing=memo(function Drawing({kind}:{kind:keyof typeof art}){
 const scene=art[kind]
 return <g data-instrument-art><g dangerouslySetInnerHTML={{__html:scene.svg}}/>{(!scene.embedded?scene.live:[]).map(part=><g key={part.id} data-moving={part.id} dangerouslySetInnerHTML={{__html:part.svg}}/>)}</g>
})
export default function JugalbandiDuet(){
 const [view,setView]=useState<'pair'|'ensemble'>('pair'),[allParts,setAllParts]=useState(false),[surfaceReset,setSurfaceReset]=useState(0)
 const performance=useRef<HTMLVideoElement>(null),[filmError,setFilmError]=useState(false)
 const [gestureCancel,setGestureCancel]=useState(0)
 const [activeNotes,setActiveNotes]=useState<Partial<Record<HexaVoice,number>>>({})
 const dark=useThemeMode(),[voice,setVoice]=useState<HexaVoice>('flute'),[sound,setSound]=useState(false),[status,setStatus]=useState('Tap the top for flute, move across the middle for tanpura, or strike the bottom for tabla.'),[phase,setPhase]=useState('ready'),[bpm,setBpm]=useState(84),[style,setStyle]=useState<'trade'|'phrase'>('phrase'),[tune,setTune]=useState<string>(tunes[0].notes),[preset,setPreset]=useState('rising'),[error,setError]=useState(''),[running,setRunning]=useState(false),[paused,setPaused]=useState(false),[velocity,setVelocity]=useState(96)
 const root=useRef<HTMLElement>(null),hexa=useRef<SVGSVGElement>(null),robots=useRef<Partial<Record<HexaVoice,SVGSVGElement>>>({}),readout=useRef<HTMLOutputElement>(null)
 const audio=useRef<MechanismAudio[]>([]),audioOn=useRef(false),frame=useRef(0),clock=useRef(0),previous=useRef(0),queue=useRef<DuetEvent[]>([]),pulses=useRef<Partial<Record<HexaVoice,{event:DuetEvent;at:number}>>>({}),playing=useRef(false),mode=useRef<'manual'|'auto'>('manual'),shown=useRef(true),reduced=useRef(false),latest=useRef({voice,velocity,bpm});latest.current={voice,velocity,bpm}
 if(!audio.current.length)audio.current=Array.from({length:6},()=>new MechanismAudio())
 // Fit static drawing bounds once per layout. Pointer mapping still uses the SVG's real CTM.
 useLayoutEffect(()=>{
  for(const svg of [hexa.current,...Object.values(robots.current)]){
   const drawing=svg?.querySelector<SVGGElement>('[data-instrument-art]');if(!svg||!drawing)continue
   const b=drawing.getBBox(),pad=32
   if(b.width&&b.height)svg.setAttribute('viewBox',`${b.x-pad} ${b.y-pad} ${b.width+pad*2} ${b.height+pad*2}`)
  }
 },[view,view==='pair'?voice:'ensemble'])
 const restoreVoice=(part:HexaVoice)=>{const svg=robots.current[part];svg?.querySelectorAll('[data-moving]').forEach(node=>node.removeAttribute('transform'));svg?.querySelectorAll('[data-string]').forEach(node=>{const [a,b]=art.harp.strings[Number((node as SVGElement).dataset.string)];node.setAttribute('d',`M${a} L${b}`)});svg?.parentElement?.removeAttribute('data-responding')}
 const restore=()=>{hexaSections.forEach(section=>restoreVoice(section.id));root.current?.removeAttribute('data-call-active');root.current?.removeAttribute('data-answer-active')}
 const halt=(message='Stopped. Play a note or start a tune.')=>{setGestureCancel(n=>n+1);cancelAnimationFrame(frame.current);frame.current=0;previous.current=0;playing.current=false;queue.current=[];pulses.current={};audio.current.forEach(a=>a.stop());restore();setActiveNotes({});setRunning(false);setPaused(false);setPhase('ready');setStatus(message);if(readout.current)readout.current.textContent='Ready'}
 const suspend=()=>{if(!playing.current)return;setGestureCancel(n=>n+1);cancelAnimationFrame(frame.current);frame.current=0;previous.current=0;playing.current=false;void audio.current[0].context?.suspend().catch(()=>{});setPaused(true);setStatus('Paused. Resume to continue the phrase.')}
 const fire=(event:DuetEvent)=>{
  const response=responders[event.voice],call=event.side==='call';restoreVoice(event.voice);pulses.current[event.voice]={event,at:clock.current};if(!call)robots.current[event.voice]?.parentElement?.setAttribute('data-responding','true');setActiveNotes(old=>({...old,[event.voice]:event.note}));setPhase(event.side)
  root.current?.setAttribute(call?'data-call-active':'data-answer-active',String(event.index))
  if(audioOn.current)audio.current[hexaSections.findIndex(section=>section.id===event.voice)+(call?0:3)].play(call?'hexa':response.kind,event.index,event.velocity,event.voice,event.note,!call&&response.kind==='harp'?.15:0,true)
  const message=call?`Hexa-18 ${event.voice} plays ${noteName(event.note)}.`:response.kind==='rain'?'Rainsticks answer the beat.':`${response.name} answers ${noteName(event.note)}.`
  setStatus(message);if(readout.current)readout.current.textContent=message
 }
 const draw=()=>{
  if(reduced.current)return
  for(const current of Object.values(pulses.current)){
  if(!current||current.event.side!=='answer')continue
  const {event,at}=current,t=clock.current-at,kind=responders[event.voice].kind,robot=robots.current[event.voice]
  if(!robot)continue
  if(kind==='harp'){
   const index=event.index%11,state=pluckAt(Math.min(1.3,t*2)),part=art.harp.live[index],stringIndex=art.harp.channels[index],[a,b]=art.harp.strings[stringIndex]
   robot.querySelector(`[data-moving="horn-${index}"]`)?.setAttribute('transform',planeRotation(state.angle,part.pivot,art.harp.projection))
   robot.querySelector(`[data-string="${stringIndex}"]`)?.setAttribute('d',`M${a} Q${(a[0]+b[0])/2+state.deflection*3} ${(a[1]+b[1])/2} ${b}`)
  }else if(kind==='flute'){
   art.flute.live.forEach((part,index)=>robot.querySelector(`[data-moving="finger-${index}"]`)?.setAttribute('transform',planeRotation(((event.note+index)%3===0?0:40)*(1-Math.exp(-t*16)),part.pivot,art.flute.projection,'yz')))
  }else{
   const index=event.index%8,part=art.rain.live[index],angle=65*Math.sin(Math.min(1,t/.7)*Math.PI/2)*(index%2?-1:1)
   robot.querySelector(`[data-moving="stick-${index}"]`)?.setAttribute('transform',planeRotation(angle,part.pivot,art.rain.projection))
  }
  }
 }
 const tick=(now:number)=>{
  if(!playing.current||document.hidden||!shown.current)return
  clock.current+=previous.current?Math.min(.1,(now-previous.current)/1000):0;previous.current=now
  const due:DuetEvent[]=[]
  while(queue.current.length&&queue.current[0].at<=clock.current){const event=queue.current.shift()!;fire(event);due.push(event)}
  if(new Set(due.map(event=>event.voice)).size>1){const message=due[0].side==='call'?`Hexa-18 plays all three parts: ${noteName(due[0].note)}.`:'The robotic flute, harp and rainsticks answer together.';setStatus(message);if(readout.current)readout.current.textContent=message}
  for(const part of hexaSections){const pulse=pulses.current[part.id];if(pulse&&clock.current-pulse.at>1.9){restoreVoice(part.id);delete pulses.current[part.id];setActiveNotes(old=>{const next={...old};delete next[part.id];return next})}}
  draw()
  if(!queue.current.length&&!Object.keys(pulses.current).length){halt('Phrase complete. Play again or try another instrument.');return}
  frame.current=requestAnimationFrame(tick)
 }
 const startClock=()=>{if(!playing.current){if(audioOn.current)void audio.current[0].context?.resume().catch(()=>setError('Sound could not resume. Toggle sound off and on to try again.'));playing.current=true;previous.current=0;setRunning(true);setPaused(false);frame.current=requestAnimationFrame(tick)}}
 const manual=(note:number,part:HexaVoice=latest.current.voice)=>{
  performance.current?.pause()
  if(document.hidden||!shown.current)return
  setVoice(part)
  if(mode.current==='auto'||paused){halt();clock.current=0}mode.current='manual';setError('')
  const current=latest.current,events=duetSequence([note],part,current.bpm,'trade',current.velocity).map(e=>({...e,index:note-60,at:e.at+clock.current}))
  // Manual input is immediate; queued replies preserve rapid sequences without an unbounded backlog.
  fire(events[0]);queue.current=[...queue.current,events[1]].sort((a,b)=>a.at-b.at).slice(-32);startClock()
 }
 const autoplay=()=>{
  performance.current?.pause()
  let notes:number[];try{notes=parseTune(tune)}catch(e){setError((e as Error).message);return}
  halt();clock.current=0;mode.current='auto';queue.current=(view==='ensemble'&&allParts?hexaSections.map(section=>section.id):[voice]).flatMap(part=>duetSequence(notes,part,bpm,style,velocity)).sort((a,b)=>a.at-b.at);setError('');startClock()
 }
 useEffect(()=>{
  const node=root.current!,film=performance.current,query=matchMedia('(prefers-reduced-motion: reduce)');reduced.current=query.matches
  const observer=new IntersectionObserver(entries=>{shown.current=entries[entries.length-1].isIntersecting;if(!shown.current)suspend()});observer.observe(node)
  const hide=()=>{if(document.hidden){suspend();film?.pause()}},motion=()=>{reduced.current=query.matches;restore()}
  document.addEventListener('visibilitychange',hide);query.addEventListener('change',motion)
  return()=>{film?.pause();cancelAnimationFrame(frame.current);playing.current=false;observer.disconnect();document.removeEventListener('visibilitychange',hide);query.removeEventListener('change',motion);const context=audio.current[0].context;audio.current.forEach(a=>{a.stop();a.context=null});if(context&&context.state!=='closed')void context.close().catch(()=>{})}
 },[])
 async function toggleSound(){
  if(audioOn.current){audioOn.current=false;setSound(false);audio.current.forEach(a=>a.stop());return}
  try{await audio.current[0].enable();audio.current.slice(1).forEach(a=>a.context=audio.current[0].context);audioOn.current=true;setSound(true);setError('')}catch{setError('Sound could not start. Try Enable sound again; the visual duet remains available.')}
 }
 const surfacePointer=useRef<number|null>(null)
 const surfaceGesture=useGestureNotes(index=>manual(60+index,'tanpura'),paused,gestureCancel)
 const surfacePoint=(event:React.PointerEvent<SVGSVGElement>)=>{const matrix=event.currentTarget.getScreenCTM();return matrix?new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()):null}
 const surfacePlay=(event:React.PointerEvent<SVGSVGElement>,pressed=false)=>{
  const point=surfacePoint(event);if(!point)return
  if(point.y>=280&&point.y<455&&point.x>=280&&point.x<=620){
   if(surfacePointer.current!==null&&surfacePointer.current!==event.pointerId)return
   if(!pressed&&event.pointerType!=='mouse'&&surfacePointer.current!==event.pointerId)return
   const note=60+Math.max(0,Math.min(17,Math.floor((point.x-280)/340*18)));surfaceGesture.send(note-60,pressed)
   if(pressed){surfacePointer.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId)}
  }else if(pressed&&point.y>=110&&point.y<280&&point.x>=380&&point.x<=530){const index=Math.max(0,Math.min(5,Math.floor((point.x-380)/150*6)));manual([60,62,64,65,67,69][index],'flute')}
  else if(pressed&&point.y>=455&&point.y<=560&&point.x>=350&&point.x<=550)manual(point.x<450?60:67,'tabla')
 }
 const surfaceRelease=(event:React.PointerEvent<SVGSVGElement>)=>{if(surfacePointer.current!==event.pointerId)return;surfacePointer.current=null;surfaceGesture.finish(event.type==='pointerup');if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}
 const visibleParts=view==='ensemble'?hexaSections:hexaSections.filter(section=>section.id===voice),keys='asdfghjkl;'.split('')
 return <section ref={root} className="ja iso ja-duet" data-theme={dark?'dark':'light'} aria-label="Play the Jugalbandi duet" data-phase={phase} data-paused={paused}>
  <div className="ja-intro"><h2>Play Hexa-18.</h2><p>Flute calls the robotic flute, tanpura calls the harp, and tabla calls the rainsticks. Play a note and watch its reply.</p></div>
  <div className="ja-duet-views" role="group" aria-label="Performance view"><button aria-pressed={view==='pair'} onClick={()=>{halt();setView('pair')}}>One pairing</button><button aria-pressed={view==='ensemble'} onClick={()=>{halt();setView('ensemble')}}>All instruments</button></div>
  <div className="ja-duet-pairing" role="group" aria-label="Duet pairing">{hexaSections.map(section=><button key={section.id} aria-pressed={voice===section.id} onClick={()=>{halt();setVoice(section.id)}}>{section.name}<span> → {responders[section.id].name}</span></button>)}</div>
  <div className={`ja-duet-stage ${view==='ensemble'?'ja-ensemble-stage':''}`}>
   <figure className="iso-plate"><div className="ja-caption"><span>You · Hexa-18</span><span>{hexaSections.find(s=>s.id===voice)!.location} · {voice}</span></div><svg className="iso-svg" ref={hexa} onPointerLeave={()=>{if(surfacePointer.current===null)surfaceGesture.finish(true)}} onPointerDown={event=>{if(event.button===0)surfacePlay(event,true)}} onPointerMove={event=>surfacePlay(event)} onPointerUp={surfaceRelease} onPointerCancel={surfaceRelease} onLostPointerCapture={surfaceRelease} viewBox="150 0 600 650" role="img" aria-label={`Hexa-18 ${voice} caller`}><Drawing kind="hexa"/><g className="ja-play-regions" aria-hidden="true"><path data-region="flute" data-active={!!activeNotes.flute} d="M382 275 Q450 250 528 275"/><path data-region="tanpura" data-active={!!activeNotes.tanpura} d="M300 370 Q450 445 600 370"/><path data-region="tabla" data-active={!!activeNotes.tabla} d="M385 475 L450 507 L515 475"/></g></svg><figcaption className="ja-caption">{phase==='call'?'Playing your note':voice==='flute'?'Tap a flute input':voice==='tanpura'?'Glide the tanpura control':'Tap a tabla input'}</figcaption></figure>
   {visibleParts.map(section=>{const response=responders[section.id];return <figure key={section.id} className="iso-plate"><div className="ja-caption"><span>Robotic answer · {section.name}</span><span>{response.name}</span></div><svg className="iso-svg" ref={node=>{if(node)robots.current[section.id]=node;else delete robots.current[section.id]}} viewBox={response.kind==='rain'?'150 0 600 650':'0 0 900 650'} role="img" aria-label={`${response.name} responder`}><Drawing kind={response.kind}/></svg><figcaption className="ja-caption">Answers Hexa-18’s {section.name.toLowerCase()}<a className="ja-source-link" href={`/Assets/Projects/Jugalbandi/Photos/${response.kind==='flute'?'757.png':response.kind==='harp'?'756.png':'758.png'}`} target="_blank" rel="noopener noreferrer" aria-label="Compare original mechanism">Original ↗</a></figcaption></figure>})}
  </div>
  <div className="ja-duet-play"><HexaPlayingSurface key={surfaceReset} voice={view==='pair'?voice:undefined} onPlay={manual} activeNotes={activeNotes} paused={paused} cancelVersion={gestureCancel}/></div>
  <div className="ja-duet-readout"><output ref={readout} aria-hidden="true">Ready</output><p role="status">{status}</p><button aria-pressed={sound} onClick={toggleSound}>{sound?'Sound on':'Enable sound'}</button></div>
  <div className="ja-pair-explanation" aria-label="Selected instrument mechanism">
    <h3>{hexaSections.find(section=>section.id===voice)!.name} → {responders[voice].name}</h3>
    <p>{voice==='flute'?'Touch the top flute inputs. The robotic reply moves fingers over the tone holes; its air supply sustains the note.':voice==='tanpura'?'Move across the side tanpura region. The harp replies with a servo-driven pluck; the string vibrates after the pick releases it.':'Strike the inside tabla region. The eight corner-mounted rainsticks reply by rotating so their contents fall through the tubes.'}</p>
  </div>
  <div className="ja-duet-controls">
   <div><h3>Keyboard and playing strength</h3><details className="ja-note-keyboard"><summary>Use the note keyboard instead</summary><p>Tap a note or focus the keyboard and use A S D F G H J K L ;. The matching machine answers each input.</p><div className="ja-duet-keys" role="group" aria-label="Play Hexa-18 notes" onKeyDown={e=>{if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;const i=keys.indexOf(e.key.toLowerCase());if(i>=0){e.preventDefault();manual(60+i)}}}>{Array.from({length:18},(_,i)=><button key={i} aria-label={`Play ${noteName(60+i)}`} aria-pressed={activeNotes[voice]===60+i} onClick={()=>manual(60+i)}>{noteName(60+i)}{i<10&&<small>{keys[i].toUpperCase()}</small>}</button>)}</div></details><label>Playing strength <output>{velocity}</output><PortfolioSlider aria-label="Playing strength" min={1} max={127} value={velocity} onChange={e=>setVelocity(Number(e.target.value))}/></label></div>
   <div><h3>Let a tune lead</h3><label htmlFor="ja-duet-tune">Demo tune</label><select id="ja-duet-tune" value={preset} onChange={e=>{halt();setPreset(e.target.value);const chosen=tunes.find(t=>t.id===e.target.value);if(chosen)setTune(chosen.notes)}}>{tunes.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}<option value="custom">Your own notes</option></select><label htmlFor="ja-duet-notes">Notes · C3–C6, up to 32</label><textarea id="ja-duet-notes" value={tune} onChange={e=>{halt();setPreset('custom');setTune(e.target.value);setError('')}} spellCheck={false}/><label htmlFor="ja-duet-style">Response style</label><select id="ja-duet-style" value={style} onChange={e=>{halt();setStyle(e.target.value as 'trade'|'phrase')}}><option value="phrase">Phrase, then robotic reply</option><option value="trade">Take turns, one note each</option></select><label>Tempo <output>{bpm} BPM</output><PortfolioSlider aria-label="Duet tempo" min={40} max={160} value={bpm} onChange={e=>{halt();setBpm(Number(e.target.value))}}/></label>{view==='ensemble'&&<label className="ja-ensemble-autoplay"><input type="checkbox" checked={allParts} onChange={e=>{halt();setAllParts(e.target.checked)}}/> Autoplay all three parts together</label>}<div className="ja-secondary"><button onClick={autoplay}>Autoplay tune</button>{running&&<><button onClick={paused?startClock:suspend}>{paused?'Resume duet':'Pause duet'}</button><button onClick={()=>halt()}>Stop duet</button></>}<button onClick={()=>{halt('Reset. Sound off; choose a note or tune.');setSurfaceReset(n=>n+1);audioOn.current=false;setSound(false);setVoice('flute');setAllParts(false);setBpm(84);setStyle('phrase');setPreset('rising');setTune(tunes[0].notes);setVelocity(96);setError('');clock.current=0}}>Reset duet</button></div></div>
  </div>
  {error&&<p className="ja-duet-error" role="alert">{error}</p>}
  <details className="ja-duet-evidence" onToggle={event=>{if(!event.currentTarget.open)performance.current?.pause()}}><summary>Compare the instruments and original performance</summary><div className="ja-duet-photos"><figure><img loading="lazy" src="/Assets/Projects/Jugalbandi/Photos/538A3938_nsquare_23.webp" alt="Original Hexa-18 enclosure with top pipes and sloping sensor faces"/><figcaption>Hexa-18 · original controller</figcaption></figure><figure><img loading="lazy" src={`/Assets/Projects/Jugalbandi/Photos/${voice==='flute'?'757.png':voice==='tanpura'?'756.png':'758.png'}`} alt={`Original ${responders[voice].name} construction photograph`}/><figcaption>{responders[voice].name} · original mechanism</figcaption></figure></div><video ref={performance} onError={()=>setFilmError(true)} controls playsInline preload="none" poster="/Assets/images/jugalbandi.webp" onPlay={()=>{halt();audioOn.current=false;setSound(false)}}><source src="/Assets/films/jugalbandi.mp4" type="video/mp4"/><track kind="captions" src="/Assets/captions/jugalbandi.en.vtt" srcLang="en" label="English (automatic, review pending)"/></video>{filmError&&<p role="alert">The recording could not load. <a className="glass-action" href="https://vimeo.com/996020149" target="_blank" rel="noopener noreferrer">Watch the original on Vimeo ↗</a></p>}<p className="ja-note">Original performance recording · 5:10. Its acoustic and digital sounds are separate from the browser synthesis above.</p></details>
  <p className="ja-note">This browser duet echoes your notes with synthesized sound; it does not run the original trained model.</p>
  <details className="ja-duet-model-note"><summary>About this reconstruction</summary><p className="ja-note">The instrument pairings follow the project. Browser sounds, note mapping, fingering and response timing are illustrative. Hexa-18 has 18 inputs in total; their original wiring and split between sections are not reconstructed. This browser duet echoes your notes; it does not run the original trained model. Demo tunes are simple note studies.</p></details>
 </section>
}
