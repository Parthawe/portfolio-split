import * as T from 'three'
import { batchStaticParts } from './batchStaticParts'

type Context = {
  root: T.Group; plywood: T.MeshStandardMaterial; black: T.MeshStandardMaterial; silver: T.MeshStandardMaterial; white: T.MeshStandardMaterial
  mat: (color: string, roughness?: number, metalness?: number) => T.MeshStandardMaterial
  mesh: (geometry: T.BufferGeometry, material: T.Material, parent?: T.Object3D, x?: number, y?: number, z?: number) => T.Mesh
  box: (w: number, h: number, d: number, material: T.Material, parent?: T.Object3D, x?: number, y?: number, z?: number) => T.Mesh
  cylinder: (r: number, h: number, material: T.Material, parent?: T.Object3D, x?: number, y?: number, z?: number, r2?: number) => T.Mesh
  rod: (a: T.Vector3, b: T.Vector3, radius?: number, material?: T.MeshStandardMaterial, parent?: T.Object3D) => T.Mesh
  pick: (object: T.Object3D, control: number, value?: number) => void
}
const v = (x: number, y: number, z: number) => new T.Vector3(x, y, z)

// Reconstruct the documented silhouettes and exposed mechanisms. Dimensions are
// proportional studies from the project photographs, not measured fabrication plans.
export function buildJugalbandi(ctx: Context) {
  const {root,plywood,black,silver,white,mat,mesh,box,cylinder,rod,pick}=ctx
  const ochre=mat('#d8aa34',.65), mahogany=mat('#b95c25',.48), blue=mat('#164b97',.35), copper=mat('#ae9568',.32,.6)
  mahogany.map=plywood.map;blue.roughness=.28
  const red=mat('#b72d26'), green=mat('#277156'), cream=mat('#ded4b6'), darkWood=mat('#654022')
  const wireMaterials=new Map<string,T.MeshStandardMaterial>()
  const cable=(points:T.Vector3[],color:string,parent:T.Object3D=root,radius=.006)=>{
    let material=wireMaterials.get(color)
    if(!material){material=mat(color);wireMaterials.set(color,material)}
    return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),18,radius,5,false),material,parent)
  }
  const instruments:T.Group[]=[]
  const group=(name:string,x:number,y:number,z:number)=>{const g=new T.Group();g.name=name;g.position.set(x,y,z);root.add(g);instruments.push(g);return g}
  const bolt=(parent:T.Object3D,x:number,y:number,z:number)=>{const b=cylinder(.015,.008,silver,parent,x,y,z);b.rotation.x=Math.PI/2}
  const controller=(parent:T.Object3D,x:number,y:number,z:number)=>{
    const board=new T.Group();board.position.set(x,y,z);parent.add(board)
    box(.16,.29,.018,blue,board)
    box(.065,.11,.02,black,board,0,0,.02)
    for(const xx of[-.065,.065])for(let i=0;i<9;i++)box(.015,.016,.022,black,board,xx,-.11+i*.026,.015)
    box(.055,.045,.045,silver,board,.035,.15,.01)
  }
  const servo=(parent:T.Object3D,x:number,y:number,z:number,angle=0)=>{
    const g=new T.Group();g.position.set(x,y,z);g.rotation.z=angle;parent.add(g)
    box(.095,.12,.055,blue,g)
    box(.125,.025,.06,blue,g,0,-.03,0)
    cylinder(.031,.025,black,g,0,.068,0).rotation.x=Math.PI/2
    box(.055,.038,.003,cream,g,0,-.015,.03)
    const arm=new T.Group();arm.position.set(0,.073,.04);arm.userData.animated=true;g.add(arm)
    box(.025,.16,.015,black,arm,0,-.064,0);pick(arm.children[0],0)
    return arm
  }

  // Hexa-18: square top, four sloped panels and open tapered percussion frame.
  const hexa=group('Hexa-18',0,0,.9)
  const bottom=.76,top=.39,baseY=.48,topY=1.38,slant=Math.hypot(topY-baseY,bottom-top)
  const inclination=-Math.atan2(bottom-top,topY-baseY)
  const sensorMeshes:T.Mesh[]=[]
  for(let faceIndex=0;faceIndex<4;faceIndex++){
    const face=new T.Group();face.rotation.y=faceIndex*Math.PI/2;hexa.add(face)
    const panel=new T.Group();panel.position.set(0,baseY,bottom);panel.rotation.x=inclination;face.add(panel)
    const shape=new T.Shape();shape.moveTo(-bottom,0);shape.lineTo(bottom,0);shape.lineTo(top,slant);shape.lineTo(-top,slant);shape.closePath()
    if(faceIndex<2)for(let row=0;row<4;row++)for(let side=0;side<2;side++){
      const x=(side?1:-1)*.21,y=.16+row*.18+(side?.085:0)
      const hole=new T.Path();hole.absarc(x,y,.043,0,Math.PI*2,true);shape.holes.push(hole)
      const rim=mesh(new T.TorusGeometry(.038,.006,6,18),silver,panel,x,y,.027)
      const recess=mesh(new T.CircleGeometry(.032,18),black,panel,x,y,.009);sensorMeshes.push(recess);pick(recess,0);pick(rim,0)
      for(let line=-2;line<=2;line++)rod(v(x-.022,y+line*.008,.013),v(x+.022,y+line*.008,.013),.001,silver,panel)
    }
    mesh(new T.ExtrudeGeometry(shape,{depth:.023,bevelEnabled:true,bevelSegments:1,bevelThickness:.002,bevelSize:.002,curveSegments:14}),ochre,panel)
    rod(v(-bottom,baseY,bottom),v(-.30,.035,.30),.035,ochre,face)
    rod(v(bottom,baseY,bottom),v(.30,.035,.30),.035,ochre,face)
    rod(v(-bottom,baseY,bottom),v(bottom,baseY,bottom),.035,ochre,face)
    rod(v(-.30,.035,.30),v(.30,.035,.30),.035,ochre,face)
  }
  box(top*2,.025,top*2,ochre,hexa,0,topY,0)
  const pipeHeights=[.82,.57,.37,.16,.72,.46,.26,.075]
  for(let i=0;i<8;i++){
    const h=pipeHeights[i],x=(i%2-.5)*.22,z=(Math.floor(i/2)-1.5)*.16
    const pipe=mesh(new T.CylinderGeometry(.034,.035,h,18,1,true),plywood,hexa,x,topY+h/2,z)
    pick(pipe,1)
    const rim=mesh(new T.TorusGeometry(.028,.006,5,18),plywood,hexa,x,topY+h,z);rim.rotation.x=Math.PI/2
    cylinder(.025,.004,black,hexa,x,topY+h-.026,z)
  }

  // The photographed harp has a solid oval soundboard with one circular sound hole.
  const harp=group('Mechanized harp',-1.88,0,-.08);harp.scale.y=.82
  for(const x of[-.79,.79])box(.065,2.53,.14,plywood,harp,x,1.31,0)
  for(const y of[.075,2.56])box(1.64,.065,.14,plywood,harp,0,y,0)
  for(const x of[-.73,.73])box(.028,2.40,.11,black,harp,x,1.31,-.005)
  for(const y of[.13,2.50])box(1.48,.028,.11,black,harp,0,y,-.005)
  for(const x of[-.77,.77])box(.23,.075,.72,black,harp,x,.035,0)
  const oval=new T.Shape();oval.absellipse(0,0,.50,.81,0,Math.PI*2,false,0)
  const soundhole=new T.Path();soundhole.absarc(0,-.26,.125,0,Math.PI*2,true);oval.holes.push(soundhole)
  const body=mesh(new T.ExtrudeGeometry(oval,{depth:.075,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:1,curveSegments:32}),mahogany,harp,0,1.28,.025)
  body.name='Oval soundboard with circular sound hole'
  const strings:T.Mesh[]=[],arms:T.Group[]=[]
  for(let i=0;i<18;i++){
    const x=-.43+i*.86/17,arc=Math.sqrt(1-(x/.50)**2)
    const bottomY=1.28-.76*arc,topY=1.28+.76*arc
    const string=rod(v(x,bottomY,.115),v(x,topY,.115),.0016,copper.clone(),harp);string.userData.stringIndex=i;strings.push(string);pick(string,0)
    const pin=cylinder(.012,.055,silver,harp,x,topY,.12);pin.rotation.x=Math.PI/2;rod(v(x,topY,.14),v(x+.022,topY,.14),.007,silver,harp);const eyelet=mesh(new T.TorusGeometry(.010,.003,5,12),copper,harp,x,bottomY,.108);eyelet.name='String anchor eyelet'
  }
  const hitMaterial=mat('#ffffff');hitMaterial.transparent=true;hitMaterial.opacity=0;hitMaterial.depthWrite=false;hitMaterial.colorWrite=false
  const stringBank=box(.89,1.38,.018,hitMaterial,harp,0,1.28,.14)
  stringBank.name='String bank pointer target';stringBank.userData.stringBank=true;stringBank.castShadow=stringBank.receiveShadow=false;pick(stringBank,0)
  // Wide, flat wooden rails, aligned exactly with their endpoints.
  const rail=(a:T.Vector3,b:T.Vector3)=>{const rail=box(.065,a.distanceTo(b),.09,plywood,harp);rail.position.copy(a).add(b).multiplyScalar(.5);rail.quaternion.setFromUnitVectors(v(0,1,0),b.clone().sub(a).normalize())}
  rail(v(-.84,2.10,.18),v(.98,.80,.18));rail(v(-.84,.66,.18),v(.98,.73,.18))
  for(let i=0;i<5;i++){
    const x=-.38+i*.18,y=1.65-i*.13
    arms.push(servo(harp,x,y,.23,-.48));arms.push(servo(harp,x,.68,.23,Math.PI))
    for(let wire=0;wire<3;wire++){
      const color=['#b33d27','#c5a332','#3b423e'][wire]
      cable([v(x,y,.25),v(x-.10,y+.11,.30+wire*.008),v(-.57,1.5,.31),v(-.70,1.25,.27)],color,harp,.0025)
      cable([v(x,.67,.25),v(x-.1,.57,.30+wire*.008),v(-.70,.72,.27),v(-.70,1.25,.27)],color,harp,.0025)
    }
  }
  controller(harp,-.70,1.25,.21)
  for(const x of[-.78,.78])for(const y of[.15,2.48])bolt(harp,x,y,.10)

  // Flute: bamboo on a white board, paired Lego fingers and dual air pumps.
  const flute=group('Automated flute',1.6,.91,.73)
  flute.userData.focusBounds=new T.Box3(v(-1,.02,-.40),v(1,.44,.40))
  box(1.95,.04,.72,white,flute)
  for(const x of[-.78,.78])for(const z of[-.26,.26])box(.045,.88,.045,black,flute,x,-.46,z)
  const bamboo=cylinder(.045,1.51,plywood,flute,0,.115,.08);bamboo.rotation.z=Math.PI/2;pick(bamboo,1)
  for(const x of[-.70,-.57,.52,.66]){const band=cylinder(.047,.035,x===-.57||x===.52?red:black,flute,x,.115,.08);band.rotation.z=Math.PI/2}
  const fingers:T.Group[]=[]
  for(let i=0;i<6;i++){
    const x=-.28+i*.14,front=i%2===0,z=front?.28:-.10
    const hole=mesh(new T.CircleGeometry(.018,14),black,flute,x,.158,.08);hole.rotation.x=-Math.PI/2
    box(.125,.085,.13,[black,red,green,darkWood][i%4],flute,x,.068,z)
    for(const dx of[-.035,.035])for(const dz of[-.035,.035])cylinder(.017,.012,silver,flute,x+dx,.118,z+dz)
    box(.08,.10,.052,blue,flute,x,.17,z)
    const finger=new T.Group();finger.position.set(x,.23,z);finger.userData.animated=true;flute.add(finger);fingers.push(finger)
    rod(v(0,0,0),v(0,.05,front?-.16:.16),.009,white,finger)
    const pad=cylinder(.024,.015,white,finger,0,.05,front?-.16:.16);pick(pad,1)
  }
  box(.25,.025,.18,green,flute,-.70,.06,-.17)
  for(const x of[-.77,-.65]){
    cylinder(.039,.16,silver,flute,x,.15,-.17)
    cylinder(.043,.045,white,flute,x,.25,-.17)
  }
  cable([v(-.77,.27,-.17),v(-.82,.39,-.08),v(-.95,.27,.26),v(-.69,.15,.09)],'#e0ddcc',flute,.012)
  cable([v(-.65,.27,-.17),v(-.65,.37,-.31),v(-.82,.38,-.33),v(-.83,.28,-.25)],'#e0ddcc',flute,.01)
  const board=new T.Group();board.position.set(.80,.06,-.03);board.rotation.x=-Math.PI/2;flute.add(board);controller(board,0,0,0)
  for(let i=0;i<6;i++)cable([v(-.28+i*.14,.12,i%2?.28:-.10),v(-.05+i*.14,.07,-.28),v(.78,.075,-.15)],i%2?'#b33d27':'#bd9e2d',flute,.0025)

  // All four rainsticks share the documented tall wooden rack.
  const rack=group('Rainsticks',1.67,0,-1.32)
  for(const x of[-.53,.53])box(.065,2.56,.09,plywood,rack,x,1.30,0)
  for(const y of[.10,.55,2.32,2.51])box(1.13,.06,.09,plywood,rack,0,y,0)
  for(const x of[-.54,.54])box(.22,.07,.70,plywood,rack,x,.035,0)
  const sticks:T.Group[]=[]
  for(const [i,x,y]of[[0,-.58,2.28],[1,.58,2.28],[2,-.58,.68],[3,.58,.68]]){
    box(.085,.10,.085,blue,rack,x,y,.045)
    const stick=new T.Group();stick.name=`Rainstick ${i+1}`;stick.position.set(x,y,.105);stick.userData.animated=true;rack.add(stick);sticks.push(stick)
    const tube=cylinder(.041,.86,plywood,stick);pick(tube,2)
    for(const yy of[-.38,.38])cylinder(.043,.10,white,stick,0,yy,0)
    cylinder(.044,.095,black,stick,0,.06,0)
    rod(v(-.065,0,-.07),v(.065,0,-.07),.013,black,stick)
    for(let hole=0;hole<4;hole++)mesh(new T.CircleGeometry(.005,8),white,stick,.01,-.24+hole*.12,.042)
    cable([v(x,y,.04),v(x*.8,y-.16,.03),v(.30,.60,.055),v(.23,.21,.07)],'#9a632e',rack,.003)
  }
  controller(rack,.23,.25,.08)
  for(const x of[-.53,.53])for(const y of[.55,2.32])bolt(rack,x,y,.052)

  // Batch stationary hardware by material within each instrument. Moving and
  // pickable parts retain their own meshes and transforms.
  for(const instrument of instruments)batchStaticParts(instrument)
  let lastPluck=-1,age=10
  const update=(values:number[],time:number,delta:number)=>{
    if(values[0]!==lastPluck){lastPluck=values[0];age=0}else age+=delta
    const amplitude=Math.exp(-age*3)*values[0]/100
    strings.forEach((string,i)=>{const selected=i===(values[3]??0);(string.material as T.MeshStandardMaterial).color.set(selected?'#f4d46c':'#ae9568');string.position.z=.115+(time&&selected?Math.sin(time*38+i)*.014*amplitude:0)})
    arms.forEach((arm,i)=>arm.rotation.z=time?Math.sin(age*18+i)*.28*amplitude:0)
    fingers.forEach((finger,i)=>finger.rotation.x=(values[1]/100)*.65*(i%2?-1:1))
    sticks.forEach((stick,i)=>stick.rotation.z=(values[2]/100-.5)*1.7*(i%2?-1:1))
  }
  return {instruments,update}
}
