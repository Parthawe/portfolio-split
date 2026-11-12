import * as T from 'three'
import { batchStaticParts } from './batchStaticParts'
type Context={
 root:T.Group;plywood:T.MeshStandardMaterial;black:T.MeshStandardMaterial;silver:T.MeshStandardMaterial;white:T.MeshStandardMaterial
 mat:(color:string,roughness?:number,metalness?:number)=>T.MeshStandardMaterial
 mesh:(g:T.BufferGeometry,m:T.Material,p?:T.Object3D,x?:number,y?:number,z?:number)=>T.Mesh
 box:(w:number,h:number,d:number,m:T.Material,p?:T.Object3D,x?:number,y?:number,z?:number)=>T.Mesh
 cylinder:(r:number,h:number,m:T.Material,p?:T.Object3D,x?:number,y?:number,z?:number,r2?:number)=>T.Mesh
 rod:(a:T.Vector3,b:T.Vector3,r?:number,m?:T.MeshStandardMaterial,p?:T.Object3D)=>T.Mesh
 pick:(o:T.Object3D,control:number,value?:number)=>void
}
export function buildMoniac(ctx:Context){
 const {root,plywood,black,silver,white,mat,mesh,box,cylinder,rod,pick}=ctx
 const cabinet=new T.Group();cabinet.position.y=.025;root.add(cabinet)
 box(1.9,.06,1.96,plywood,cabinet,0,.03,0)
 // Rear-high cheeks and inset screen frame match the photographed cabinet.
 const shape=new T.Shape();shape.moveTo(-.98,.03);shape.lineTo(.94,.03);shape.lineTo(.94,2.10);shape.lineTo(.61,2.10);shape.lineTo(.18,.28);shape.lineTo(-.98,.21);shape.closePath()
 for(const x of[-.95,.90]){const side=mesh(new T.ExtrudeGeometry(shape,{depth:.05,bevelEnabled:true,bevelSegments:1,bevelThickness:.003,bevelSize:.003}),plywood,cabinet,x,0,0);side.rotation.y=Math.PI/2}
 const display=new T.Group();display.position.set(0,1.165,-.43);display.rotation.x=-.235;cabinet.add(display)
 // Four rails leave the back of the tablet open, as in the annotated view.
 for(const x of[-.81,.81])box(.18,1.88,.08,plywood,display,x,0,0)
 for(const y of[-.84,.84])box(1.50,.20,.08,plywood,display,0,y,0)
 const rounded=(w:number,h:number,r:number)=>{const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
 const tablet=mesh(new T.ExtrudeGeometry(rounded(1.38,1.68,.09),{depth:.035,bevelEnabled:true,bevelSegments:1,bevelSize:.005,bevelThickness:.003}),black,display,0,.015,.045)
 for(const x of[-.81,.81])for(const y of[-.70,-.62,.73]){const screw=cylinder(.018,.009,silver,display,x,y,.047);screw.rotation.x=Math.PI/2}
 box(.11,.12,.036,black,display,0,-.89,.065)
 const glass=mat('#cad8d3',.22);glass.transparent=true;glass.opacity=.10;glass.depthWrite=false
 const cover=box(1.57,.018,1.12,glass,cabinet,0,.235,.33)
 for(const x of[-.85,.85])box(.14,.19,1.24,plywood,cabinet,x,.145,.32)
 box(1.9,.19,.16,plywood,cabinet,0,.145,.90)
 // Six visible valves follow the staggered 2 / 2 / 1 / 1 photo layout.
 // The original photo does not identify their policy mapping; assignments here
 // are illustrative. Interest remains the seventh browser slider.
 const locations=[[-.50,-.04,0],[.12,-.04,4],[-.22,.25,1],[.53,.25,3],[.12,.54,5],[.53,.78,6]]
 const valves:T.Group[]=[],fittings:T.Group[]=[],targets:T.Mesh[]=[]
 const wiring=new T.Group();cabinet.add(wiring)
 const wireMat=[mat('#252723'),mat('#a3472c'),mat('#a38a30'),mat('#416859')]
 locations.forEach(([x,z,index],i)=>{
  const fitting=new T.Group();fitting.position.set(x,.12,z);fitting.rotation.y=i===5?-1.8:-.55;cabinet.add(fitting);fittings.push(fitting)
  cylinder(.069,.14,white,fitting)
  const elbow=cylinder(.067,.21,white,fitting,0,-.005,.09);elbow.rotation.x=Math.PI/2
  const mouth=mesh(new T.TorusGeometry(.052,.014,6,20),white,fitting,0,-.005,.20);const recess=mesh(new T.CircleGeometry(.050,20),mat('#c0c0af'),fitting,0,-.005,.193)
  recess.userData.animated=true;mouth.userData.animated=true
  cylinder(.03,.22,silver,cabinet,x,.265,z)
  const valve=new T.Group();valve.position.set(x,.395,z);valve.userData.animated=true;valve.userData.control=index;cabinet.add(valve);valves.push(valve)
  // The scalloped rim is molded, with six wide openings and a hexagonal hub.
  const rimShape=new T.Shape(),segments=72
  for(let j=0;j<=segments;j++){const a=j/segments*Math.PI*2,r=.139+.016*Math.cos(a*6);j?rimShape.lineTo(Math.cos(a)*r,Math.sin(a)*r):rimShape.moveTo(r,0)}
  const hole=new T.Path();hole.absarc(0,0,.102,0,Math.PI*2,true);rimShape.holes.push(hole)
  const rim=mesh(new T.ExtrudeGeometry(rimShape,{depth:.024,bevelEnabled:true,bevelSegments:1,bevelSize:.004,bevelThickness:.003}),white,valve);rim.rotation.x=-Math.PI/2
  mesh(new T.CylinderGeometry(.059,.059,.036,6),white,valve,0,.012,0)
  cylinder(.026,.041,white,valve,0,.017,0)
  for(let spoke=0;spoke<6;spoke++){const a=spoke*Math.PI/3;rod(new T.Vector3(Math.cos(a)*.041,.012,Math.sin(a)*.041),new T.Vector3(Math.cos(a)*.132,.012,Math.sin(a)*.132),.018,white,valve)}
  batchStaticParts(valve)
  valve.children.forEach(o=>pick(o,index))
  // An almost transparent disc catches a finger in the openings, without
  // adding an opaque pad to the photographed wheel silhouette.
  const hitMat=mat('#ffffff');hitMat.transparent=true;hitMat.opacity=0;hitMat.depthWrite=false
  const hit=cylinder(.162,.045,hitMat,valve,0,.018,0);pick(hit,index);targets.push(hit)
  const points=[new T.Vector3(x,.07,z),new T.Vector3(x+.12,.09,z+.1),new T.Vector3(.57,.075,-.46)]
  mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),14,.004,5,false),wireMat[i%4],wiring)
  batchStaticParts(fitting)
 })
 box(.17,.23,.025,mat('#28635b'),wiring,.56,.10,-.44)
 for(let i=0;i<7;i++)box(.018,.024,.04,silver,wiring,.49+i*.02,.08,-.413)
 mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,.36,-.25),new T.Vector3(0,.27,-.23),new T.Vector3(.04,.10,-.42)]),18,.012,6,false),black,cabinet)
 box(.18,.018,.18,white,cabinet,-.53,.25,.78)
 cylinder(.055,.016,white,cabinet,-.53,.267,.78)
 // Cabinet button resets the illustrative settings, just like the accessible Reset control.
 const reset=cylinder(.058,.02,white,cabinet,-.53,.28,.78);reset.userData.reset=true
 batchStaticParts(display);batchStaticParts(wiring)
 return {cabinet,display,tablet,cover,valves,targets,fittings,reset,locations,update:(values:number[])=>valves.forEach((valve,i)=>valve.rotation.y=values[locations[i][2]]/100*Math.PI*2)}
}
