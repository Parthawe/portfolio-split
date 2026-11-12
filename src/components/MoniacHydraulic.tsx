import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

export type MoniacControls = {taxRate:number;govSpending:number;interestRate:number;investmentRate:number;consumerSpending:number;imports:number;exports:number}
export type PolicyKey=keyof MoniacControls
type Point=[number,number,number]
// Orthographic 30° projection, matching the original game's front faces and floor.
const project=([x,y,z]:Point):[number,number]=>[500+(x-y)*.866,900+(x+y)*.5-z]
const polygon=(points:Point[])=>points.map(point=>project(point).join(',')).join(' ')
function Prism({x,y,z,w,d,h,water=false,pipe=false}:{x:number;y:number;z:number;w:number;d:number;h:number;water?:boolean;pipe?:boolean}){
 const a:Point=[x,y,z],b:Point=[x+w,y,z],c:Point=[x+w,y+d,z],e:Point=[x,y+d,z],up=(p:Point):Point=>[p[0],p[1],p[2]+h]
 return <g className={water?'moniac-water':pipe?'moniac-blue-pipe':'moniac-glass'}>
  <polygon className="hydraulic-back" points={polygon([a,b,up(b),up(a)])}/>
  <polygon className="hydraulic-side" points={polygon([b,c,up(c),up(b)])}/>
  <polygon className="hydraulic-front" points={polygon([e,c,up(c),up(e)])}/>
  <polygon className="hydraulic-top" points={polygon([up(a),up(b),up(c),up(e)])}/>
 </g>
}
function Tank({x,y,z,w,d,h,value,name,showPercent=true}:{x:number;y:number;z:number;w:number;d:number;h:number;value:number;name:string;showPercent?:boolean}){
 const fill=Math.max(.5,h*Math.max(0,Math.min(100,value))/100),[tx,ty]=project([x+16,y+d+2,z+fill+9])
 return <g data-hydraulic-tank={name} data-level={value}>
  <Prism x={x} y={y} z={z} w={w} d={d} h={h}/>
  <Prism x={x+1} y={y+1} z={z+1} w={w-2} d={d-2} h={fill} water/>
  {showPercent&&<text className="hydraulic-percent" transform={`translate(${tx} ${ty}) rotate(30)`}>{value.toFixed(1)}%</text>}
 </g>
}
const stations:{key:PolicyKey;name:string;point:Point}[]=[
 {key:'taxRate',name:'Tax Rate',point:[-38,35,614]},
 {key:'govSpending',name:'Gov Spend',point:[-38,35,386]},
 {key:'consumerSpending',name:'Consumer',point:[112,35,570]},
 {key:'investmentRate',name:'Invest',point:[112,35,406]},
 {key:'imports',name:'Imports',point:[112,35,200]},
 {key:'exports',name:'Exports',point:[112,35,50]},
]
function FaceLabel({at,lines}:{at:Point;lines:string[]}){
 const [x,y]=project(at)
 return <text className="hydraulic-label" transform={`translate(${x} ${y}) rotate(30)`}>{lines.map((line,i)=><tspan key={line} x="0" dy={i?28:0}>{line}</tspan>)}</text>
}
export default function MoniacHydraulic({values,income,timeLeft,enabled,active,onInspect,onChange}:{values:MoniacControls;income:number;timeLeft:number;enabled:boolean;active:PolicyKey;onInspect:(key:PolicyKey)=>void;onChange:(key:PolicyKey,value:number)=>void}){
 const [enlarged,setEnlarged]=useState(false)
 const id=useId().replace(/:/g,''),drag=useRef<{id:number;key:PolicyKey;x:number;y:number;value:number}|null>(null)
 const adjust=(key:PolicyKey,value:number)=>onChange(key,Math.round(Math.max(0,Math.min(100,value))*10)/10)
 const down=(event:PointerEvent<SVGGElement>,key:PolicyKey)=>{
  if(drag.current)return
  onInspect(key);if(!enabled||event.button!==0)return
  drag.current={id:event.pointerId,key,x:event.clientX,y:event.clientY,value:values[key]};event.currentTarget.setPointerCapture(event.pointerId);event.preventDefault()
 }
 const move=(event:PointerEvent<SVGGElement>)=>{
  const current=drag.current;if(!current||current.id!==event.pointerId||!enabled)return
  const width=event.currentTarget.ownerSVGElement?.getBoundingClientRect().width??840
  adjust(current.key,current.value+((event.clientX-current.x)+(current.y-event.clientY))*120/width);event.preventDefault()
 }
 const end=(event:PointerEvent<SVGGElement>)=>{if(drag.current?.id!==event.pointerId)return;drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}
 const keyDown=(event:KeyboardEvent<SVGGElement>,key:PolicyKey)=>{
  onInspect(key);if(!enabled)return
  const delta=event.key==='ArrowUp'||event.key==='ArrowRight'?1:event.key==='ArrowDown'||event.key==='ArrowLeft'?-1:event.key==='PageUp'?10:event.key==='PageDown'?-10:0
  if(delta||event.key==='Home'||event.key==='End'){event.preventDefault();adjust(key,event.key==='Home'?0:event.key==='End'?100:values[key]+delta)}
 }
 return <div className="moniac-isometric-screen" data-active-policy={active}>
  <div className="hydraulic-view-controls"><span>Original game layout · browser rules</span><button type="button" className="glass-action" aria-pressed={enlarged} onClick={()=>setEnlarged(value=>!value)}>{enlarged?'Fit diagram':'Enlarge diagram'}</button></div><div className="hydraulic-drawing-viewport" tabIndex={enlarged?0:undefined} aria-label={enlarged?'Enlarged hydraulic diagram, scroll to inspect':undefined} data-enlarged={enlarged}><svg viewBox="0 0 960 1280" role="group" aria-label="MONIAC isometric hydraulic game" style={{'--water-gradient':`url(#${id}-water)`} as React.CSSProperties}>
   <title>MONIAC hydraulic economic game</title><desc>Six valve wheels control the labelled economic policies. Drag a wheel right or up to increase its setting, or use arrow keys. Interest is an additional browser-model control in the inspector.</desc>
   <defs><linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#159eff"/><stop offset="1" stopColor="#21dae8"/></linearGradient></defs>
   <g className="hydraulic-floor" aria-hidden="true">{Array.from({length:22},(_,i)=>{const n=-420+i*40;return <g key={i}><path d={`M${project([-420,n,-212])} L${project([440,n,-212])}`}/><path d={`M${project([n,-420,-212])} L${project([n,440,-212])}`}/></g>})}</g>
   <g aria-hidden="true">
    {/* Blue return loop, behind the cabinet's central hydraulic column. */}
    <g className="hydraulic-return-loop">
     <path className="return-body" d="M460 1006 L350 1070 L110 930 L110 155 L300 45 L540 185"/>
     <path className="return-edge" d="M466 1019 L350 1084 L98 940 L98 148 L300 31 L550 176"/>
     <path className="return-edge" d="M454 993 L350 1056 L122 920 L122 162 L300 59 L530 194"/>
     <path className="return-edge return-seam" d="M110 930 L110 155 L300 45 L540 185 M98 148 L122 162 M300 31 L300 59 M98 940 L122 920"/>
    </g>
    {/* Branch pipes terminate at the photographed screen's six valve stations. */}
    <Prism x={-85} y={26} z={601} w={120} d={18} h={18}/>
    <Prism x={-85} y={26} z={373} w={120} d={18} h={18}/>
    {[557,393,187,37].map(z=><Prism key={z} x={65} y={26} z={z} w={130} d={18} h={18}/>)}
    <Prism x={0} y={0} z={-200} w={70} d={70} h={938}/>
    <Prism x={1} y={1} z={590} w={68} d={68} h={148} water/>
    {/* The reference includes pale floats in the column, above the income reservoir. */}
    <g className="hydraulic-float"><Prism x={1} y={1} z={370+income*1.5} w={68} d={68} h={20}/><Prism x={1} y={1} z={100+income*.6} w={68} d={68} h={20}/></g>
    <Tank x={-235} y={44} z={375} w={150} d={58} h={240} value={values.taxRate} name="tax-reservoir"/>
    <Tank x={195} y={0} z={400} w={148} d={58} h={172} value={values.consumerSpending} name="consumer-consumption"/>
    <Tank x={195} y={0} z={30} w={148} d={58} h={172} value={values.imports} name="imports"/>
    <Tank x={-5} y={47} z={-200} w={150} d={58} h={160} value={100} name="income" showPercent={false}/>
    <g className="hydraulic-pump"><Prism x={-117} y={57} z={-200} w={52} d={46} h={36}/></g>
    <FaceLabel at={[-190,70,672]} lines={['TAX','RATES']}/>
    <FaceLabel at={[-234,104,350]} lines={['GOVERNMENT','SPENDING']}/>
    <FaceLabel at={[209,8,659]} lines={['CONSUMER','CONSUMPTION','RATE']}/>
    <FaceLabel at={[181,34,348]} lines={['INVESTMENT','RATE']}/>
    <FaceLabel at={[220,12,240]} lines={['IMPORTS']}/>
    <FaceLabel at={[208,30,-15]} lines={['EXPORTS']}/>
    <FaceLabel at={[-300,50,-175]} lines={['PUMP - INCOME']}/>
   </g>
   <g className="hydraulic-timer" aria-label={`Time left ${timeLeft} seconds`}><text x="680" y="75">TIME LEFT</text><text className="hydraulic-clock" x="680" y="148">{String(Math.floor(timeLeft/60)).padStart(2,'0')}:{String(timeLeft%60).padStart(2,'0')}</text></g>
   {stations.map(({key,name,point})=>{
    const [x,y]=project(point),rotation=values[key]*5.4
    return <g key={key} className={`hydraulic-valve ${active===key?'is-selected':''}`} role="slider" tabIndex={0} aria-label={`${name} valve`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={values[key]} aria-valuetext={`${Math.round(values[key])} percent`} aria-disabled={!enabled} data-policy={key} onPointerDown={event=>down(event,key)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onKeyDown={event=>keyDown(event,key)} onFocus={()=>onInspect(key)}>
     <title>{name}: {Math.round(values[key])}%. Drag or use arrow keys.</title>
     <g aria-hidden="true"><Prism x={point[0]-16} y={point[1]-12} z={point[2]-25} w={32} d={24} h={25}/><path className="valve-stem" d={`M${x} ${y+4} L${x} ${y-16}`}/>
      <g transform={`matrix(.866 .5 -.866 .5 ${x} ${y-17})`}><circle className="valve-rim" r="25"/><g className="valve-spokes" style={{transform:`rotate(${rotation}deg)`}}>{Array.from({length:8},(_,i)=><path key={i} d={`M0 0 L${Math.cos(i*Math.PI/4)*24} ${Math.sin(i*Math.PI/4)*24}`}/>)}</g><circle className="valve-hub" r="5"/></g>
      <circle className="valve-focus-ring" cx={x} cy={y-17} r="34"/><circle className="valve-touch-target" cx={x} cy={y-17} r="72"/>
     </g>
    </g>
   })}
  </svg></div>
  <p className="hydraulic-interaction-hint">Select a valve. Drag up or right to open it; use arrow keys for small adjustments.</p>
 </div>
}
