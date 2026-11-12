import * as T from 'three'
import { batchStaticParts } from './batchStaticParts'

type Context = {
  root:T.Group; plywood:T.MeshStandardMaterial; black:T.MeshStandardMaterial; silver:T.MeshStandardMaterial; white:T.MeshStandardMaterial
  mat:(color:string,roughness?:number,metalness?:number)=>T.MeshStandardMaterial
  mesh:(geometry:T.BufferGeometry,material:T.Material,parent?:T.Object3D,x?:number,y?:number,z?:number)=>T.Mesh
  box:(w:number,h:number,d:number,material:T.Material,parent?:T.Object3D,x?:number,y?:number,z?:number)=>T.Mesh
  cylinder:(r:number,h:number,material:T.Material,parent?:T.Object3D,x?:number,y?:number,z?:number,r2?:number)=>T.Mesh
  pick:(object:T.Object3D,control:number,value?:number)=>void
}

// Deck and base follow the drawing dimensions at .3 units per foot. Scenic
// details follow the project renders; this is a visual study, not a load model.
export function buildRevolvingStage(ctx:Context) {
  const {root,plywood,black,silver,white,mat,mesh,box,cylinder,pick}=ctx
  const wood=mat('#9c691f'),ochre=mat('#c58c20'),mint=mat('#779887'),cream=mat('#e7dfb2'),red=mat('#af2729'),green=mat('#487557'),glass=mat('#b8c2bc',.4)
  wood.map=plywood.map
  const base=box(2.4,.075,2.4,wood,root,0,.04,0);base.name='Stationary 8 ft square base'
  const casters:T.Group[]=[]
  for(const radius of[.73,1.08])for(let i=0;i<8;i++){
    const a=i*Math.PI/4,g=new T.Group();g.position.set(Math.cos(a)*radius,.08,Math.sin(a)*radius);g.rotation.y=-a;g.name='Caster';root.add(g);casters.push(g)
    box(.15,.017,.17,silver,g,0,.012,0)
    cylinder(.048,.025,silver,g,0,.035,0)
    for(const x of[-.046,.046])box(.013,.12,.10,silver,g,x,.105,0)
    const wheel=cylinder(.074,.073,black,g,0,.13,0);wheel.rotation.z=Math.PI/2
    const axle=cylinder(.015,.11,silver,g,0,.13,0);axle.rotation.z=Math.PI/2
    for(const x of[-.054,.054]){const hub=cylinder(.023,.009,silver,g,x,.13,0);hub.rotation.z=Math.PI/2}
  }
  box(.36,.025,.36,silver,root,0,.092,0)
  cylinder(.13,.13,silver,root,0,.165,0)
  const ring=mesh(new T.TorusGeometry(.103,.018,8,32),silver,root,0,.235,0);ring.rotation.x=Math.PI/2
  cylinder(.053,.21,silver,root,0,.195,0)
  const assembly=new T.Group();assembly.name='Rotating 15 × 8 ft deck';assembly.position.y=.32;root.add(assembly)
  box(.36,.025,.36,silver,assembly,0,-.038,0)
  const deck=box(4.5,.10,2.4,wood,assembly);pick(deck,0)
  const cutaway=mat('#bc8b40');cutaway.transparent=true;cutaway.opacity=.17;cutaway.depthWrite=false
  const scenery=new T.Group();scenery.position.y=.05;assembly.add(scenery)
  // Building front, with four upstairs windows and three shop bays.
  box(3.55,2.85,.06,ochre,scenery,-.34,1.425,-.12)
  for(let i=0;i<4;i++){
    const x=-1.64+i*.86
    box(.64,.78,.035,black,scenery,x,2.23,-.075)
    box(.59,.73,.018,glass,scenery,x,2.23,-.048)
    box(.63,.022,.025,black,scenery,x,2.23,-.027)
  }
  box(2.63,1.58,.022,mint,scenery,-.80,.79,-.074)
  for(const x of[-2.11,-1.23,-.35,.52])box(.055,1.60,.075,white,scenery,x,.80,.58)
  const fascias=[mat('#c7c4de'),cream,mat('#c7d3bc')]
  for(let i=0;i<3;i++){
    box(.84,.08,.69,cream,scenery,-1.67+i*.88,1.59,.25)
    box(.84,.27,.025,fascias[i],scenery,-1.67+i*.88,1.52,.60)
    box(.017,1.33,.024,white,scenery,-1.67+i*.88,.665,-.05)
  }
  // Corrugated shutter on the right, as shown in the construction render.
  box(.60,1.59,.025,silver,scenery,.85,.795,.585)
  const shutter=mat('#8b9391',.65,.25)
  for(let i=0;i<28;i++)box(.58,.025,.026,i%2?shutter:silver,scenery,.85,.035+i*.055,.61)
  box(.055,1.63,.07,white,scenery,1.18,.815,.59)
  box(.44,.88,.027,black,scenery,.24,.44,.61)
  // Perpendicular scenic return and the reverse garden view.
  box(.065,2.36,1.12,ochre,scenery,1.42,1.18,-.71)
  box(3.55,2.85,.018,green,scenery,-.34,1.425,-.163)
  const garden=mesh(new T.PlaneGeometry(3.53,1.91),green,scenery,-.34,1.875,-.178);garden.rotation.y=Math.PI
  box(.83,.06,.32,cream,scenery,-.30,.55,-.80)
  for(const x of[-.65,.05])for(const z of[-.91,-.69])box(.032,.50,.032,white,scenery,x,.28,z)
  // Orange vendor counter and eight broad red/white canopy panels.
  const orange=mat('#ed8b30'),stallX=1.67,stallZ=.59
  box(.83,.57,.66,orange,scenery,stallX,.43,stallZ)
  box(.88,.045,.71,orange,scenery,stallX,.74,stallZ)
  for(const x of[stallX-.32,stallX+.32])for(const z of[stallZ-.24,stallZ+.24])box(.055,.16,.055,wood,scenery,x,.08,z)
  const parasol=new T.Group();parasol.position.set(stallX,0,stallZ);parasol.rotation.z=-.10;scenery.add(parasol)
  cylinder(.015,2.17,silver,parasol,0,1.085,0)
  for(let sector=0;sector<8;sector++){
    const positions:number[]=[],indices:number[]=[],steps=6
    positions.push(0,2.28,0)
    for(let j=0;j<=steps;j++){const a=(sector+j/steps)*Math.PI/4;positions.push(Math.cos(a)*.72,1.97+.025*Math.sin(j/steps*Math.PI),Math.sin(a)*.72)}
    for(let j=0;j<steps;j++)indices.push(0,j+1,j+2)
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));geometry.setIndex(indices);geometry.computeVertexNormals()
    const material=sector%2?white:red;material.side=T.DoubleSide
    mesh(geometry,material,parasol)
  }
  cylinder(.022,.08,silver,parasol,0,2.31,0)
  for(const caster of casters)batchStaticParts(caster)
  garden.userData.animated=true // Keep the separately textured backdrop out of the material batches.
  batchStaticParts(scenery)
  return {base,deck,assembly,scenery,casters,garden,update:(values:number[])=>{
    const reveal=Math.max(0,Math.min(1,values[1]/100))
    assembly.rotation.y=-values[0]*Math.PI/180;assembly.position.y=.32+reveal*.9
    scenery.visible=reveal<.15;deck.material=reveal>.15?cutaway:wood
  }}
}
