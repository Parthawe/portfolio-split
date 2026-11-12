import { useEffect, useRef } from 'react'
import * as T from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import lettering from 'three/examples/fonts/helvetiker_bold.typeface.json'
import { createSceneActivity } from '../../utils/sceneActivity'
import { useThemeMode } from '../../hooks/useThemeMode'
import type { ScenicKind } from './ScenicStudy'
type Props={kind:ScenicKind;view:number;revision:number;light:boolean;touch:boolean}
export default function ScenicViewport(props:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(props),update=useRef<(()=>void)|null>(null),dark=useThemeMode()
 latest.current=props
 useEffect(()=>{
  const element=host.current!
  const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(dark?'#191919':'#edeae5');renderer.shadowMap.enabled=true
  renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Spatial set study. Arrow keys orbit.');renderer.domElement.setAttribute('role','img');element.append(renderer.domElement)
  const scene=new T.Scene(),root=new T.Group();scene.add(root)
  const camera=new T.PerspectiveCamera(38,1,.1,100);camera.position.set(7,5.5,8)
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.4,0);controls.enableDamping=false;controls.enableZoom=false;controls.minPolarAngle=.12;controls.maxPolarAngle=Math.PI/2-.04
  const ambient=new T.HemisphereLight(0xffffff,0x404044,2);scene.add(ambient)
  const key=new T.DirectionalLight(0xffe4bd,3);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;scene.add(key)
  const materials=new Map<string,T.MeshStandardMaterial>()
  const mat=(color:string)=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.8}));return materials.get(color)!}
  const box=(x:number,y:number,z:number,w:number,h:number,d:number,color:string)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;root.add(m);return m}
  const rod=(a:number[],b:number[],radius:number,color:string)=>{const v=new T.Vector3(...b as [number,number,number]).sub(new T.Vector3(...a as [number,number,number]));const m=new T.Mesh(new T.CylinderGeometry(radius,radius,v.length(),8),mat(color));m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());m.castShadow=true;root.add(m)}
  box(0,-.1,0,8,.2,5,'#282725')
  if(props.kind==='dumb-waiter'){
   box(0,1.8,-2.35,7.6,3.6,.12,'#33302d');box(-3.75,1.8,0,.12,3.6,4.7,'#33302d')
   for(let i=0;i<18;i++)box(-3.5+i*.4,.02,0,.015,.01,4.5,'#605246')
   box(-1.65,2.3,-1.6,2.5,.12,1.3,'#805c3e')
   for(let i=0;i<10;i++){const y=.12+i*.22,z=.8-i*.25;box(-1.7,y,z,1.3,.08,.28,'#97714b');rod([-2.35,y,z],[-2.35,y+.8,z],.022,'#766044');rod([-1.05,y,z],[-1.05,y+.8,z],.022,'#766044')}
   rod([-2.35,.95,.8],[-2.35,2.93,-1.45],.035,'#97714b');rod([-1.05,.95,.8],[-1.05,2.93,-1.45],.035,'#97714b')
   for(let i=0;i<16;i++)box(-2.8+i*.15,2.4,-1.6,.06,.06,1.2,'#a07950')
   box(2.1,.35,-1.2,1.2,.35,1.9,'#151515');box(2.1,.75,-2,1.2,.65,.15,'#57514b');box(2.1,.56,-1.2,1.1,.12,1.6,'#9f9b90')
   box(-.6,.03,.8,3,.025,2.1,'#6e3e30');box(-2.8,.85,1.25,.9,.09,.65,'#c1ab8c');for(const x of [-3.1,-2.5])for(const z of [1,1.5])box(x,.4,z,.06,.8,.06,'#9c886c')
   box(-1.4,2.85,-2.25,1.1,1.65,.08,'#825d3b');box(-1.4,2.9,-2.19,.85,1.25,.025,'#6c4e33')
  }else if(props.kind==='drowning'){
   box(0,1.9,-2.25,6,3.8,.08,'#1b2420')
   for(const x of [-3,3])rod([x,0,-2],[x,3.9,-2],.06,'#403c2f')
   for(let x=-3;x<=3;x+=.6)rod([x,0,-2.1],[x,3.8,-2.1],.025,'#4b4d3a')
   for(let y=.4;y<3.9;y+=.65)rod([-3,y,-2.05],[3,y,-2.05],.025,'#4b4d3a')
   rod([-3,3.9,-2],[3,3.9,-2],.07,'#5e513a')
   for(const x of [-1.6,.8]){box(x- .48,1.15,-1.1,.07,2.3,.08,'#a2753d');box(x+.48,1.15,-1.1,.07,2.3,.08,'#a2753d');box(x,2.3,-1.1,1.03,.07,.08,'#a2753d')}
   box(1.1,.25,.5,.9,.5,.65,'#b98b35')
   // The source shows a planted floor and trailing leaves, rather than stones.
   const leaves=new T.InstancedMesh(new T.SphereGeometry(1,5,3),mat('#576e3c'),320),dummy=new T.Object3D()
   for(let i=0;i<320;i++){const x=Math.sin(i*5.7)*2.9,z=Math.cos(i*3.3)*1.7,y=.12+(i%7)*.035;dummy.position.set(x,y,z);dummy.rotation.set(i*.7,i*.81,.4);dummy.scale.set(.07,.025,.17);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix)}leaves.castShadow=true;root.add(leaves)
   for(const side of [-1,1])for(let j=0;j<3;j++){let a=[side*(2.7-j*.16),3.8,-1.9];for(let i=0;i<10;i++){const b=[side*(2.6-j*.15+Math.sin(i*1.3+j)*.12),3.55-i*.26,-1.85+Math.cos(i)*.1];rod(a,b,.018,'#796341');a=b}}

   for(const side of [-1,1])for(let i=0;i<9;i++)rod([side*2.8,3.85-i*.3,-1.95],[side*(2.55+Math.sin(i)*.2),3.6-i*.3,-1.6],.018,'#796341')
  }else{
   const heights=[1.1,2.2,1.6,3.1,2.5,1.4,2.8,1.8,3.4,2.3,1.1,2.6,3.1,1.9,2.4,1.3]
   heights.forEach((h,i)=>{const x=-3.6+i*.48;box(x,h/2,-1.4-(i%3)*.22,.3,h,.14,i%3===0?'#8f9eb0':'#48677f')})
   const font=new FontLoader().parse(lettering),words=[{text:'TEDx',x:-3.55,color:'#b41f23',size:.82},{text:'VITPune',x:-.68,color:'#dfdfd8',size:.75}]
   for(const word of words){const geometry=new TextGeometry(word.text,{font,size:word.size,depth:.09,curveSegments:4,bevelEnabled:false});const m=new T.Mesh(geometry,mat(word.color));m.position.set(word.x,.12,.2);m.castShadow=true;root.add(m)}
   const carpet=new T.Mesh(new T.CylinderGeometry(.85,.85,.035,48),mat('#ad292b'));carpet.position.set(0,.035,1.15);root.add(carpet)
  }
  let lastView=-1,lastRevision=-1
  const activity=createSceneActivity(element,()=>{const p=latest.current;if(p.view!==lastView||p.revision!==lastRevision){lastView=p.view;lastRevision=p.revision;camera.position.set(...(p.view===1?[0,2,11]:p.view===2?[.01,11,.01]:[7,5.5,8]) as [number,number,number]);controls.target.set(0,1.4,0)}
   controls.enableRotate=matchMedia('(pointer:fine)').matches||p.touch;renderer.domElement.style.touchAction=p.touch?'none':'pan-y';key.color.set(p.light?(p.kind==='tedx'?'#628bff':'#e2b46d'):'#ffffff');ambient.intensity=p.light?.65:2;key.intensity=p.light?4:2.3;controls.update();renderer.render(scene,camera)
  },{idleMs:600,introMs:600})
  update.current=()=>activity.wake()
  const onChange=()=>activity.wake();controls.addEventListener('change',onChange)
  const resize=new ResizeObserver(()=>{const w=element.clientWidth,h=element.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();activity.wake()});resize.observe(element)
  const keyboard=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const spherical=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));spherical.theta+=(e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0);spherical.phi=T.MathUtils.clamp(spherical.phi+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),.1,Math.PI/2-.04);camera.position.copy(new T.Vector3().setFromSpherical(spherical).add(controls.target));activity.wake()};renderer.domElement.addEventListener('keydown',keyboard)
  return()=>{update.current=null;resize.disconnect();activity.dispose();controls.removeEventListener('change',onChange);controls.dispose();renderer.domElement.removeEventListener('keydown',keyboard);scene.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose()});materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()}
 },[props.kind,dark])
 useEffect(()=>update.current?.(),[props.view,props.revision,props.light,props.touch])
 return <div className="project-study-stage" ref={host}/>
}
