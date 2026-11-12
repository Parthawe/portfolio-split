import { useEffect, useRef } from 'react'
import * as T from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createProjectRenderer, type ProjectRenderer } from '../../utils/projectRenderer'
import { observeVisible } from '../../utils/visibleActivity'
import { createSceneActivity } from '../../utils/sceneActivity'
import { worlds, type WorldKey } from './catalog'
import { buildJugalbandi } from './JugalbandiModel'
import { buildRevolvingStage } from './RevolvingStageModel'

type Props = { project: WorldKey; values: number[]; dark: boolean; reduced: boolean; cameraView: number; focus: number; revision: number; resetVersion: number; enigma?: { mode: 'type' | 'draw'; clear: number; label: number | null }; onInk?: (strokes: number) => void; onInput?: (values:number[]) => void; onReset: () => void; onChange: (index: number, value: number) => void; onFail: () => void }
type Update = (values: number[], time: number, delta: number) => void
const V = (x: number, y: number, z: number) => new T.Vector3(x, y, z)

export default function RoomScene(props: Props) {
  const hostRef = useRef<HTMLDivElement>(null), latest = useRef(props), wake = useRef<(() => void) | null>(null)
  latest.current = props
  useEffect(() => {
    const host = hostRef.current!
    const controller = new AbortController()
    let cleanup: (() => void) | undefined
    const setup = async () => {
    let renderer: ProjectRenderer
    try { renderer = await createProjectRenderer(controller.signal) } catch { if (!controller.signal.aborted) latest.current.onFail(); return }
    if (controller.signal.aborted) { renderer.dispose(); return }
    if ('onDeviceLost' in renderer) renderer.onDeviceLost = () => { if (!controller.signal.aborted) latest.current.onFail() }

    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1
    renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', `${worlds[props.project]?.title} mechanism. ${worlds[props.project]?.note} Current behavior is described below the scene.`)
    host.appendChild(renderer.domElement)
    const scene = new T.Scene(), root = new T.Group(); scene.add(root)
    const camera = new T.PerspectiveCamera(40, 1, .05, 60)
    const cameras = [V(5.4, 3.8, 6.5), V(3.4, 2.8, 4.8), V(0, 8, .001)]
    if (props.project === 'enigma') { cameras[0].set(3.6,3.2,5.4); cameras[1].set(1.8,2.8,4.5) }
    if (props.project === 'moniac-machine') { cameras[0].set(3.0,3.4,4.7); cameras[1].set(1.7,3.0,4.2) }
    if (props.project === 'black-hole') { cameras[0].set(4.0,3.0,5.5); cameras[1].set(2.7,2.4,4.2) }
    if (props.project === 'sea-of-salt') { cameras[0].set(3.3,3.2,4.8); cameras[1].set(2.1,2.6,3.8) }
    if (worlds[props.project]?.kind === 'set') cameras[1].set(4.5,3.5,6)
    camera.position.copy(cameras[0])
    const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(0, 1.1, 0)
    controls.enableDamping = true; controls.dampingFactor = .12; controls.enablePan = false
    controls.minDistance = 3.4; controls.maxDistance = 12; controls.minPolarAngle = .01; controls.maxPolarAngle = Math.PI / 2 - .04
    const materials = new Set<T.Material>(), textures = new Set<T.Texture>()
    const mat = (color: string, roughness = .7, metalness = 0) => { const m = new T.MeshStandardMaterial({ color, roughness, metalness }); materials.add(m); return m }
    const timber = mat('#bb9564'), black = mat('#242621'), silver = mat('#a6aaab', .28, .8), white = mat('#eceade'), clay = mat('#9e9b91')
    const mesh = (geo: T.BufferGeometry, material: T.Material, parent: T.Object3D = root, x = 0, y = 0, z = 0) => {
      const m = new T.Mesh(geo, material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m
    }
    const box = (w: number, h: number, d: number, m: T.Material, p: T.Object3D = root, x = 0, y = 0, z = 0) => mesh(new T.BoxGeometry(w, h, d), m, p, x, y, z)
    const cylinder = (r: number, h: number, m: T.Material, p: T.Object3D = root, x = 0, y = 0, z = 0, r2 = r) => mesh(new T.CylinderGeometry(r, r2, h, 32), m, p, x, y, z)
    const sphere = (r: number, m: T.Material, p: T.Object3D = root, x = 0, y = 0, z = 0) => mesh(new T.SphereGeometry(r, 20, 12), m, p, x, y, z)
    const rod = (a: T.Vector3, b: T.Vector3, radius = .007, m = silver, p: T.Object3D = root) => {
      const object = cylinder(radius, a.distanceTo(b), m, p); object.position.copy(a).add(b).multiplyScalar(.5); object.quaternion.setFromUnitVectors(V(0,1,0), b.clone().sub(a).normalize()); return object
    }
    const label = (text: string, w: number, h: number, p: T.Object3D = root, x = 0, y = 0, z = 0, color = '#deded4', bg = '#20241e') => {
      const c = document.createElement('canvas'); c.width = text.length === 1 ? 256 : 1024; c.height = 256
      const ctx = c.getContext('2d')!; if(bg!=='transparent'){ctx.fillStyle = bg; ctx.fillRect(0,0,1024,256)}
      ctx.fillStyle = color; ctx.font = text.length === 1 ? (bg==='transparent'?'bold 180px Georgia':'180px Arial') : '40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text,c.width/2,128)
      const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace; textures.add(texture)
      const material = new T.MeshBasicMaterial({ map: texture, transparent:bg==='transparent', depthWrite:bg!=='transparent', side:T.DoubleSide }); materials.add(material)
      return mesh(new T.PlaneGeometry(w,h), material, p,x,y,z)
    }
    let activity: ReturnType<typeof createSceneActivity> | undefined
    const roomMaterial = mat('#d9d3c6'), floorMaterial = mat('#b3ae9f'), wall2 = mat('#bfc4b7')
    const openFloor = ['enigma','jugalbandi','moniac-machine','sea-of-salt','black-hole','revolving-stage'].includes(props.project)
    if(openFloor){const floor=mesh(new T.PlaneGeometry(200,200),floorMaterial,scene,0,-.06,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false}else{box(9,.06,8,floorMaterial,scene,0,-.06,0)}
    if (!openFloor) {
      box(9,4.8,.09,roomMaterial,scene,0,2.3,-3.1)
      box(.09,4.8,8,wall2,scene,-4.4,2.3,.85)
      box(9,.08,.035,timber,scene,0,.05,-3.02)
    }
    const hemisphere = new T.HemisphereLight('#fff9ec','#4e5146',2);scene.add(hemisphere)
    const key = new T.DirectionalLight('#fff1d9',3);key.position.set(-3,7,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024)
    key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.025;scene.add(key)
    const fill = new T.DirectionalLight('#d7e1f2',1);fill.position.set(4,4,-1);scene.add(fill)
    const table = (width = 3.6, depth = 1.8) => {
      box(width,.08,depth,timber,root,0,.75,0)
      for(const x of [-width/2+.12,width/2-.12])for(const z of [-depth/2+.12,depth/2-.12]) box(.09,.72,.09,black,root,x,.36,z)
    }
    const pickables: T.Object3D[] = []
    const pick = (object: T.Object3D, control: number, value?: number) => { object.userData.control=control;object.userData.value=value;pickables.push(object) }
    const updates: Update[] = []
    let inkSurface: T.Mesh | undefined, inkCanvas: HTMLCanvasElement | undefined
    let inkVersion=0, inkStrokes=0, inkPointer:number|null=null, inkLast:T.Vector2|null=null, inkSnapshot:ImageData|null=null
    let inkMode='type', inkClear=-1
    const inkContext=()=>inkCanvas!.getContext('2d')!
    const clearInk=()=>{const ctx=inkContext();ctx.fillStyle='#000';ctx.fillRect(0,0,512,326);inkStrokes=0;inkVersion++}
    const inkPoint=(uv:T.Vector2)=>new T.Vector2(uv.x*512,(1-uv.y)*326)
    const paintInk=(uv:T.Vector2)=>{const point=inkPoint(uv),ctx=inkContext();ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=16;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();if(inkLast){ctx.moveTo(inkLast.x,inkLast.y);ctx.lineTo(point.x,point.y);ctx.stroke()}else{ctx.arc(point.x,point.y,8,0,Math.PI*2);ctx.fill()}inkLast=point;inkVersion++;activity?.wake()}


    const woodCanvas = document.createElement('canvas'); woodCanvas.width=256; woodCanvas.height=512
    const woodContext=woodCanvas.getContext('2d')!; woodContext.fillStyle='#f3eadb';woodContext.fillRect(0,0,256,512)
    for(let i=0;i<100;i++){woodContext.strokeStyle=`rgba(115,78,38,${.025+(i%7)*.009})`;woodContext.beginPath();for(let y=0;y<=512;y+=16){const x=i*2.6+Math.sin(y*.015+i)*1.5;y?woodContext.lineTo(x,y):woodContext.moveTo(x,y)}woodContext.stroke()}
    const woodTexture=new T.CanvasTexture(woodCanvas); woodTexture.colorSpace=T.SRGBColorSpace; textures.add(woodTexture)
    const plywood=mat('#f0dbc0');plywood.map=woodTexture

    if (props.project === 'enigma') {
      table(3.4,3.2);black.color.set('#333333');white.color.set('#e5e5e5');hemisphere.color.set('#ffffff');hemisphere.groundColor.set('#404040');key.color.set('#ffffff');fill.color.set('#ffffff'); (root.children[0] as T.Mesh).material=black
      const layers=[64,64,46,26], points:T.Vector3[][]=[]
      const nodes=new T.InstancedMesh(new T.SphereGeometry(.053,14,10),new T.MeshStandardMaterial({color:'#ffffff',roughness:.6,emissive:'#ffffff',emissiveIntensity:1.8}),200)
      materials.add(nodes.material as T.Material);(nodes.material as T.MeshStandardMaterial).onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#ifdef USE_COLOR\ntotalEmissiveRadiance *= clamp((vColor - vec3(0.1)) / 0.9, vec3(0.0), vec3(1.0));\n#endif')};nodes.castShadow=true;root.add(nodes)
      const dummy=new T.Object3D();let offset=0
      layers.forEach((count,layer)=>{
        const z=.6-layer*.56, top=2.14+layer*.36, rows=layer===3?3:8, cols=Math.ceil(count/rows)
        points[layer]=[]
        for(let i=0;i<count;i++){
          const row=layer===3?(i<9?0:i<17?1:2):Math.floor(i/cols)
          const col=layer===3?(row===0?i:row===1?i-9:i-17):i%cols
          const rowCols=layer===3?(row===1?8:9):cols
          const point=V((col-(rowCols-1)/2)*.19,top-row*.17,z)
          points[layer].push(point);dummy.position.copy(point);dummy.updateMatrix();nodes.setMatrixAt(offset++,dummy.matrix)
          if(layer===3){const letter=label(String.fromCharCode(65+i),.13,.09,root,point.x,point.y+.095,z+.057,'#dedede','transparent');pick(letter,0,i);const target=sphere(.071,black,root,point.x,point.y,z);target.visible=false;pick(target,0,i)}
        }
        for(const x of [-1.08,1.08])box(.025,top-.79,.025,black,root,x,(top+.79)/2,z)
        rod(V(-1.08,top+.17,z),V(1.08,top+.17,z),.012,black)
        rod(V(-1.08,.81,z),V(1.08,.81,z),.012,black)
      })
      const wirePoints:number[]=[]
      for(let layer=0;layer<3;layer++)for(let i=0;i<points[layer].length;i++)for(let branch=0;branch<2;branch++){
        const a=points[layer][i],b=points[layer+1][(i*7+branch*13)%points[layer+1].length];wirePoints.push(a.x,a.y,a.z,b.x,b.y,b.z)
      }
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(wirePoints,3))
      const wireMaterial=new T.LineBasicMaterial({color:'#b6b6b6',transparent:true,opacity:.35});materials.add(wireMaterial);root.add(new T.LineSegments(geometry,wireMaterial))
      const tablet=new T.Group();tablet.position.set(0,.86,1.12);tablet.rotation.x=-Math.PI*.34;root.add(tablet)
      box(.90,.60,.035,black,tablet);box(.83,.53,.006,white,tablet,0,0,.023)
      inkCanvas=document.createElement('canvas');inkCanvas.width=512;inkCanvas.height=326
      clearInk()
      const inkTexture=new T.CanvasTexture(inkCanvas);inkTexture.colorSpace=T.SRGBColorSpace;textures.add(inkTexture)
      const inkMaterial=new T.MeshBasicMaterial({map:inkTexture});materials.add(inkMaterial)
      const display=mesh(new T.PlaneGeometry(.66,.42),inkMaterial,tablet,0,0,.03);inkSurface=display
      let previous=-1,previousInk=-1,previewVersion=-1,previewAt=-1,age=0
      let signals:number[][]=[]
      updates.push((values,_time,delta)=>{
        const input=latest.current.enigma
        const nextMode=input?.mode??'type'
        if(input&&input.clear!==inkClear){inkClear=input.clear;if(nextMode==='draw')clearInk()}
        if(nextMode==='type'&&(inkMode!=='type'||values[0]!==previous||previousInk<0)){
          const ctx=inkContext();clearInk();ctx.fillStyle='#fff';ctx.font='bold 270px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String.fromCharCode(65+values[0]),256,174);inkVersion++
        }
        inkMode=nextMode;previous=values[0]
        if(inkVersion!==previousInk){
          previousInk=inkVersion;age=0;inkTexture.needsUpdate=true
          // Area coverage preserves thin strokes that point-sampling an 8 × 8 image misses.
          const pixels=inkContext().getImageData(0,0,512,326).data,coverage=new Float64Array(64),counts=new Uint16Array(64)
          for(let y=0;y<326;y++)for(let x=0;x<512;x++){const cell=Math.floor(y*8/326)*8+Math.floor(x/64);coverage[cell]+=pixels[(y*512+x)*4]/255;counts[cell]++}
          signals=[Array.from(coverage,(sum,i)=>Math.min(1,sum/counts[i]*5))]
          renderer.domElement.dataset.enigmaInput=JSON.stringify(signals[0].map(n=>Math.round(n*255)))
          for(let layer=1;layer<3;layer++)signals[layer]=points[layer].map(point=>{
            let sum=0,weights=0
            points[layer-1].forEach((other,i)=>{const weight=Math.exp(-Math.pow(point.x-other.x,2)*4-Math.pow(point.y-other.y+.36,2)*4);sum+=signals[layer-1][i]*weight;weights+=weight})
            return sum/Math.max(.001,weights)
          })

        }
        if(previewVersion!==inkVersion&&(elapsed-previewAt>.08||inkPointer===null)){
          previewVersion=inkVersion;previewAt=elapsed;latest.current.onInput?.(signals[0]??Array(64).fill(0))
        }
        age=latest.current.reduced?1:age+delta
        let k=0
        layers.forEach((count,layer)=>{for(let i=0;i<count;i++){
          const strength=age>layer*.16?(layer===3?(i===(inkMode==='draw'?latest.current.enigma?.label:values[0])?1:0):signals[layer]?.[i]??0):0
          nodes.setColorAt(k++,new T.Color('#515151').lerp(new T.Color('#ffffff'),strength))
        }})
        if(nodes.instanceColor)nodes.instanceColor.needsUpdate=true
        renderer.domElement.dataset.enigmaOutput=String(inkMode==='draw'?(latest.current.enigma?.label??''):values[0])
        renderer.domElement.dataset.enigmaStrokes=String(inkStrokes)
        display.updateWorldMatrix(true,false)
        renderer.domElement.dataset.enigmaTablet=JSON.stringify([[-.33,.21],[.33,.21],[.33,-.21],[-.33,-.21]].map(([x,y])=>{const point=display.localToWorld(V(x,y,0)).project(camera);return [(point.x+1)/2,(1-point.y)/2]}))
      })
    }
    const jugalbandi = props.project === 'jugalbandi' ? buildJugalbandi({root,plywood,black,silver,white,mat,mesh,box,cylinder,rod,pick}) : null
    if (jugalbandi) {
      updates.push(jugalbandi.update)
      controls.minDistance=1.2;controls.maxDistance=20
    }
    if (props.project === 'sea-of-salt') {
      table(3.2,2.2);box(3.2,.035,2.2,black,root,0,.81,0)
      const shell=mesh(new T.CylinderGeometry(.42,.42,.40,48,1,true),white,root,0,1.08,-.25);(shell.material as T.MeshStandardMaterial).side=T.DoubleSide
      cylinder(.42,.035,white,root,0,.90,-.25)
      const seam=mesh(new T.TorusGeometry(.422,.008,6,48),clay,root,0,1.07,-.25);seam.rotation.x=Math.PI/2
      cylinder(.07,.28,silver,root,0,1.13,-.25)
      const crank=new T.Group();crank.position.set(0,1.27,-.25);root.add(crank)
      const annulus=new T.Shape();annulus.absarc(0,0,.42,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,.13,0,Math.PI*2,true);annulus.holes.push(hole)
      const top=mesh(new T.ExtrudeGeometry(annulus,{depth:.06,bevelEnabled:true,bevelSegments:1,bevelSize:.002,bevelThickness:.002}),white,crank);top.rotation.x=-Math.PI/2
      const handle=cylinder(.045,.2,plywood,crank,.28,.1,0)
      pick(top,0);pick(handle,0);pick(shell,0);top.userData.dragKind='crank';handle.userData.dragKind='crank';shell.userData.dragKind='crank'
      box(1.6,.045,.28,black,root,0,.855,.72);box(1.3,.015,.035,silver,root,0,.89,.72)
      const cap=box(.12,.06,.11,white,root,-.65,.92,.72);pick(cap,0)
      label('WHY THE SEA IS SALT',2.0,.20,root,0,.58,1.12)
      const grains=new T.InstancedMesh(new T.IcosahedronGeometry(.015,0),white,900);root.add(grains);const dummy=new T.Object3D();let highest=0
      updates.push((values,time)=>{highest=Math.max(highest,values[0]);grains.count=Math.round(highest*9);cap.position.x=(values[0]/100-.5)*1.3;crank.rotation.y=values[0]/100*Math.PI*8
        for(let i=0;i<grains.count;i++){const angle=i*2.39996,radius=.22+Math.sqrt(i/900)*.8;dummy.position.set(Math.cos(angle)*radius,.845+Math.max(0,.18-radius*.15)+.015*Math.sin(i),-.25+Math.sin(angle)*radius);dummy.rotation.set(i,i*1.2,time*0);dummy.updateMatrix();grains.setMatrixAt(i,dummy.matrix)}grains.instanceMatrix.needsUpdate=true})
    }
    const revolvingStage=props.project==='revolving-stage'?buildRevolvingStage({root,plywood,black,silver,white,mat,mesh,box,cylinder,pick}):null
    if(revolvingStage){
      updates.push(values=>revolvingStage.update(values))
      const texture=new T.TextureLoader().load('/Assets/Projects/RevolvingStage/Mobile/3.jpg',()=>activity?.wake())
      texture.colorSpace=T.SRGBColorSpace;texture.repeat.set(210/585,135/1338);texture.offset.set(328/585,(1338-720)/1338);textures.add(texture)
      const gardenMaterial=mat('#ffffff');gardenMaterial.map=texture;revolvingStage.garden.material=gardenMaterial
      controls.maxDistance=22
    }

    let blackExhibits:T.Group[]|null=null
    if (props.project === 'black-hole') {
      const exhibits=[new T.Group(),new T.Group(),new T.Group()];exhibits.forEach(e=>root.add(e));blackExhibits=exhibits
      box(3.0,.08,2.0,black,root,0,.04,0)
      cylinder(1.1,.30,black,exhibits[0],0,.23,0)
      for(let i=0;i<32;i++){const a=i/32*Math.PI*2;box(.026,.27,.026,black,exhibits[0],Math.sin(a)*1.12,.23,Math.cos(a)*1.12)}
      cylinder(.018,.40,black,exhibits[0],0,.58,0);sphere(.13,black,exhibits[0],0,.91,0)
      const clocks:T.Group[]=[],hands:T.Group[]=[],minuteHands:T.Group[]=[]
      let referencePhase=0, adjustablePhase=0, previousTime=0, previousStep=0
      for(let i=0;i<2;i++){
        const c=new T.Group();c.position.set(i?.82:-.82,.62,.22);exhibits[0].add(c)
        const face=cylinder(.17,.04,white,c);face.rotation.x=Math.PI/2
        mesh(new T.TorusGeometry(.18,.012,8,32),silver,c,0,0,.025)
        for(let tick=0;tick<12;tick++){const a=tick/12*Math.PI*2;box(.012,.025,.007,black,c,Math.sin(a)*.14,Math.cos(a)*.14,.027)}
        const minute=new T.Group();c.add(minute);box(.014,.10,.006,black,minute,0,.035,.038)
        const hand=new T.Group();c.add(hand);box(.006,.145,.006,black,hand,0,.055,.047);sphere(.014,black,c,0,0,.053)
        if(i===1){const hitMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});materials.add(hitMaterial);const hit=sphere(.23,hitMaterial,c);hit.castShadow=false;hit.receiveShadow=false;hit.userData.dragKind='clock-distance';pick(hit,1)}
        cylinder(.018,.12,silver,c,0,-.17,0);box(.28,.025,.20,black,c,0,-.24,0)
        hands.push(hand);minuteHands.push(minute);clocks.push(c)
      }
      const fabric=new T.RingGeometry(0,.80,64,24);fabric.rotateX(-Math.PI/2)
      const cloth=mat('#30332f',.95);cloth.side=T.DoubleSide
      mesh(fabric,cloth,exhibits[1],0,1.28,0)
      const mass=sphere(.14,black,exhibits[1],0,1.16,0);pick(mass,1);mass.userData.dragAxis='y'
      for(let i=0;i<3;i++){const a=i/3*Math.PI*2;mesh(new T.CylinderGeometry(.09,.14,1.2,24),black,exhibits[1],Math.sin(a)*.72,.68,Math.cos(a)*.72)}
      const cells:T.Group[]=[],pairs:T.Mesh[][]=[]
      for(let i=0;i<3;i++){
        const cell=new T.Group();cell.position.set(i===2?.65:-.65,.1,i===0?-.47:.47);exhibits[2].add(cell);cells.push(cell)
        box(1.13,.08,.84,black,cell,0,.02,0)
        const lines:number[]=[]
        for(let ring=0;ring<14;ring++)for(let step=0;step<64;step++){
          const r=.035+ring*.027
          for(const turn of[step,step+1]){const a=turn/64*Math.PI*2;lines.push(Math.cos(a)*r,.073+Math.sin(r*35)*.009,Math.sin(a)*r)}
        }
        const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(lines,3))
        const material=new T.LineBasicMaterial({color:'#555a52'});materials.add(material);cell.add(new T.LineSegments(geometry,material))
        pairs.push(i===0?[sphere(.06,black,cell),sphere(.06,black,cell)]:[sphere(.08,black,cell)])
        const tag=label(['INSPIRAL','MERGER','RINGDOWN'][i],.9,.10,cell,0,.085,.36);tag.rotation.x=-Math.PI/2
      }
      let previousDepth=-1
      updates.push((values,time)=>{
        const step=values[4]??0, advance=Math.max(0,time-previousTime)+Math.max(0,step-previousStep);previousTime=time;previousStep=step
        if(values[0]===0){referencePhase+=advance;adjustablePhase+=advance*(.15+.85*values[1]/100)}
        cells.forEach((cell,i)=>{cell.visible=i===(values[2]??0);cell.position.set(0,.1,0)})
        exhibits.forEach((e,i)=>e.visible=values[0]===i)
        clocks[0].position.x=-.88;clocks[1].position.x=.35+values[1]/100*.50
        hands[0].rotation.z=-referencePhase;hands[1].rotation.z=-adjustablePhase
        minuteHands[0].rotation.z=-referencePhase/60-.6;minuteHands[1].rotation.z=-adjustablePhase/60-.6
        root.updateMatrixWorld(true);camera.updateMatrixWorld()
        const point=clocks[1].getWorldPosition(new T.Vector3()).project(camera),rect=renderer.domElement.getBoundingClientRect()
        renderer.domElement.dataset.timeTrap=JSON.stringify({reference:referencePhase,adjustable:adjustablePhase,rate:.15+.85*values[1]/100,distance:values[1],x:rect.left+(point.x+1)*rect.width/2,y:rect.top+(1-point.y)*rect.height/2})
        const depth=.08+values[1]/100*.30,pos=fabric.attributes.position
        if(depth!==previousDepth){previousDepth=depth;for(let i=0;i<pos.count;i++){const r=Math.min(1,Math.hypot(pos.getX(i),pos.getZ(i))/.8);pos.setY(i,-depth*Math.pow(1-r,2))}pos.needsUpdate=true;fabric.computeVertexNormals()}
        mass.position.y=1.28-depth+.14
        pairs[0].forEach((body,i)=>{const a=time+i*Math.PI,r=.04+values[1]/100*.16;body.position.set(Math.cos(a)*r,.13,Math.sin(a)*r)})
        const progress=values[1]/100
        pairs[1][0].position.set(0,.15,0);pairs[1][0].scale.set(1+.35*Math.sin(progress*Math.PI),1-.18*Math.sin(progress*Math.PI),1-.18*Math.sin(progress*Math.PI))
        pairs[2][0].position.set(0,.15,0);const settling=1+.16*Math.sin(time*7+progress*8)*(1-progress);pairs[2][0].scale.set(settling,1/settling,1)
      })
    }
    const target = controls.target.clone(), destination = camera.position.clone()
    let lastDark:boolean|undefined, lastMechanism=false, lastRevision=-1, cameraMoving=false, elapsed=0, studyTime=0, disposed=false
    const render=(delta:number)=>{
      if(disposed||(renderer instanceof T.WebGLRenderer && renderer.getContext().isContextLost()))return
      elapsed+=delta
      if(latest.current.values[3]&&!latest.current.reduced)studyTime+=delta
      const state=latest.current
      if(revolvingStage&&(state.values[1]>15)!==lastMechanism){lastMechanism=state.values[1]>15;lastRevision=-1}
      if(state.dark!==lastDark){lastDark=state.dark;const lights=props.project==='enigma';scene.background=new T.Color(lights?'#111111':state.dark?'#171a1b':'#efede9');roomMaterial.color.set(state.dark?'#343d35':'#d9d3c6');wall2.color.set(state.dark?'#29332c':'#bfc4b7');floorMaterial.color.set(lights?'#181818':state.dark?(props.project==='black-hole'?'#40464b':'#272a2b'):'#e1ded8');hemisphere.intensity=lights?.55:state.dark?1.1:1.8;key.intensity=lights?1.3:state.dark?2.4:3;fill.intensity=lights?.55:props.project==='black-hole'&&state.dark?2.6:1;scene.fog=new T.Fog(scene.background as T.Color,8,30)}
      if(state.revision!==lastRevision){
        lastRevision=state.revision;cameraMoving=true
        target.set(0,props.project==='enigma'?1.65:props.project==='black-hole'?.8:1.1,0);destination.copy(cameras[state.cameraView])
        if(props.project==='sea-of-salt'||blackExhibits){
          root.updateMatrixWorld(true)
          const bounds=blackExhibits?new T.Box3().setFromObject(blackExhibits[state.values[0]]):new T.Box3().setFromObject(root)
          if(props.project==='sea-of-salt'&&state.cameraView===1)bounds.set(V(-.65,.80,-.90),V(.65,1.60,.40))
          bounds.getCenter(target)
          const direction=(state.cameraView===2?V(0,1,.001):state.cameraView===1?V(.16,.38,1):V(.48,.50,1)).normalize()
          const vertical=T.MathUtils.degToRad(camera.fov/2),horizontal=Math.atan(Math.tan(vertical)*camera.aspect),right=V(0,1,0).cross(direction).normalize(),up=direction.clone().cross(right).normalize()
          let distance=.6
          for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){const point=V(x,y,z).sub(target),depth=point.dot(direction);distance=Math.max(distance,Math.abs(point.dot(right))/Math.tan(horizontal)+depth,Math.abs(point.dot(up))/Math.tan(vertical)+depth)}
          controls.minDistance=.6;destination.copy(target).add(direction.multiplyScalar(distance*1.12))
        }
        if(props.project==='enigma'){
          controls.minDistance=state.focus===4?.35:state.focus>0?.8:3.4;controls.enabled=state.focus!==4&&inkPointer===null
          const bounds=new T.Box3().setFromObject(root);bounds.min.y=Math.max(.68,bounds.min.y);bounds.getCenter(target)
          const direction=(state.cameraView===2?V(0,1,.001):state.cameraView===1?V(.2,.18,1):V(.27,.22,1)).normalize()
          const vertical=T.MathUtils.degToRad(camera.fov/2),horizontal=Math.atan(Math.tan(vertical)*camera.aspect)
          const right=V(0,1,0).cross(direction).normalize(),up=direction.clone().cross(right).normalize()
          let distance=1
          for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){const point=V(x,y,z).sub(target),depth=point.dot(direction);distance=Math.max(distance,Math.abs(point.dot(right))/Math.tan(horizontal)+depth,Math.abs(point.dot(up))/Math.tan(vertical)+depth)}
          destination.copy(target).add(direction.multiplyScalar(distance*1.04))
          if(state.focus>0&&state.focus<4){
            const layer=state.focus===1?0:state.focus===2?1:3,z=.6-layer*.56,top=2.14+layer*.36
            target.set(0,state.focus===3?top-.17:top-.60,z)
            const direction=V(1,.30,1).normalize(),halfWidth=1.15,halfHeight=state.focus===3?.6:1.05
            const distance=Math.max(halfWidth/Math.tan(horizontal),halfHeight/Math.tan(vertical))
            destination.copy(target).add(direction.multiplyScalar(distance*1.04))
          }
        }
        if(props.project==='enigma'&&state.focus===4&&inkSurface){
          inkSurface.updateWorldMatrix(true,false);inkSurface.getWorldPosition(target)
          const direction=inkSurface.getWorldDirection(new T.Vector3())
          const halfFov=T.MathUtils.degToRad(camera.fov/2)
          const distance=Math.max(.48/(Math.tan(halfFov)*camera.aspect),.34/Math.tan(halfFov))
          destination.copy(target).add(direction.multiplyScalar(distance))
        }
        if(revolvingStage){
          const mechanism=state.values[1]>15
          target.set(0,mechanism?.55:1.55,0)
          const direction=(state.cameraView===2?V(0,1,.001):state.cameraView===1?V(.08,.20,1):V(.46,.32,1)).normalize()
          const vertical=T.MathUtils.degToRad(camera.fov/2),horizontal=Math.atan(Math.tan(vertical)*camera.aspect)
          const right=V(0,1,0).cross(direction).normalize(),up=direction.clone().cross(right).normalize()
          let distance=1
          for(const x of[-2.6,2.6])for(const y of[0,mechanism?1.3:3.3])for(const z of[-2.6,2.6]){
            const point=V(x,y,z).sub(target),depth=point.dot(direction)
            distance=Math.max(distance,Math.abs(point.dot(right))/Math.tan(horizontal)+depth,Math.abs(point.dot(up))/Math.tan(vertical)+depth)
          }
          destination.copy(target).add(direction.multiplyScalar(distance*1.08))
        }
        if(jugalbandi){
          jugalbandi.instruments.forEach((instrument,i)=>instrument.visible=state.focus===0||state.focus===i+1)
          root.updateMatrixWorld(true)
          const bounds=new T.Box3()
          jugalbandi.instruments.filter(instrument=>instrument.visible).forEach(instrument=>bounds.union(new T.Box3().setFromObject(instrument)))
          if(state.focus===3){bounds.copy(jugalbandi.instruments[2].userData.focusBounds).applyMatrix4(jugalbandi.instruments[2].matrixWorld)}
          bounds.getCenter(target)
          const vertical=T.MathUtils.degToRad(camera.fov/2),horizontal=Math.atan(Math.tan(vertical)*camera.aspect)
          const direction=(state.cameraView===2?V(0,1,.001):state.cameraView===1?(state.focus===3?V(.22,.72,1):state.focus===1?V(.38,.28,1):V(.18,.12,1)):V(.38,.32,1)).normalize()
          const right=V(0,1,0).cross(direction).normalize(),up=direction.clone().cross(right).normalize()
          let distance=1.2
          for(const instrument of jugalbandi.instruments.filter(item=>item.visible)){const part=new T.Box3().setFromObject(instrument);for(const x of[part.min.x,part.max.x])for(const y of[part.min.y,part.max.y])for(const z of[part.min.z,part.max.z]){
            const point=V(x,y,z).sub(target),depth=point.dot(direction)
            distance=Math.max(distance,Math.abs(point.dot(right))/Math.tan(horizontal)+depth,Math.abs(point.dot(up))/Math.tan(vertical)+depth)
          }}
          destination.copy(target).add(direction.multiplyScalar(distance*(state.focus===0?1.02:1.08)))
        }
      }
      if(cameraMoving){camera.position.lerp(destination,state.reduced?1:1-Math.exp(-delta*7));controls.target.lerp(target,state.reduced?1:1-Math.exp(-delta*7));if(camera.position.distanceTo(destination)<.01&&controls.target.distanceTo(target)<.01)cameraMoving=false}
      // Tablet coordinates must use the same camera matrix as the visible frame.
      if(props.project==='enigma'){controls.update();camera.updateMatrixWorld()}
      updates.forEach(update=>update(state.values,state.reduced?0:props.project==='black-hole'?studyTime:elapsed,delta));
      if(props.project!=='enigma')controls.update()
      if(props.project==='enigma'){renderer.domElement.dataset.enigmaView=String(state.focus);renderer.domElement.dataset.enigmaCamera=cameraMoving?'moving':'ready'}
      try { renderer.render(scene,camera) } catch { activity?.dispose(); latest.current.onFail() }
    }
    activity=createSceneActivity(host,render,{idleMs:2200,introMs:2200,fps:24,interactionFps:60});wake.current=()=>activity?.wake()
    controls.addEventListener('change',()=>activity?.wake())
    controls.addEventListener('start',()=>{cameraMoving=false})
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;camera.aspect=w/h;camera.fov=w<600?50:40;camera.updateProjectionMatrix();renderer.setSize(w,h);lastRevision=-1;activity?.wake()}
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize()
    const ray=new T.Raycaster(),pointer=new T.Vector2();let drag:{index:number;startX:number;startY:number;axis?:string;startValue:number;pointerId:number;clockX?:number;crank?:boolean;rotary?:boolean;angle?:number;turn?:number}|null=null
    const crankPlane=new T.Plane(V(0,1,0),-1.33),crankPoint=new T.Vector3()
    const crankAngle=(event:PointerEvent)=>{crankPlane.constant=props.project==='revolving-stage'?-(.32+latest.current.values[1]/100*.9):-1.33;const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.ray.intersectPlane(crankPlane,crankPoint)?Math.atan2(crankPoint.z+(props.project==='sea-of-salt'?.25:0),crankPoint.x):null}
    const clockPlane=new T.Plane(V(0,1,0),-.62),clockPoint=new T.Vector3()
    const clockX=(event:PointerEvent)=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.ray.intersectPlane(clockPlane,clockPoint)?clockPoint.x:null}
    const tabletHit=(event:PointerEvent)=>{if(!inkSurface)return null;const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObject(inkSurface)[0]?.uv??null}
    const finishInk=(event:PointerEvent)=>{if(inkPointer!==event.pointerId)return false;const cancelled=event.type!=='pointerup';if(cancelled&&inkSnapshot){inkContext().putImageData(inkSnapshot,0,0);inkVersion++}else inkStrokes++;inkPointer=null;inkLast=null;inkSnapshot=null;latest.current.onInk?.(inkStrokes);controls.enabled=!(props.project==='enigma'&&latest.current.focus===4);if(renderer.domElement.hasPointerCapture(event.pointerId))renderer.domElement.releasePointerCapture(event.pointerId);activity?.wake();return true}
    const down=(event:PointerEvent)=>{if(inkPointer!==null){event.stopImmediatePropagation();return}if(event.button!==0||drag)return;
      const uv=tabletHit(event)
      if(uv){const input=latest.current.enigma;if(input&&input.clear!==inkClear){inkClear=input.clear;if(input.mode==='draw')clearInk()}if(inkMode!=='draw'){clearInk();inkMode='draw'}inkSnapshot=inkContext().getImageData(0,0,512,326);inkPointer=event.pointerId;inkLast=null;controls.enabled=false;cameraMoving=false;latest.current.onInk?.(inkStrokes);paintInk(uv);renderer.domElement.setPointerCapture(event.pointerId);event.preventDefault();event.stopImmediatePropagation();return}
      const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables,true).find(hit=>{let object:T.Object3D|null=hit.object;while(object){if(!object.visible)return false;object=object.parent}return true});if(!hit)return;if(hit.object.userData.reset){latest.current.onReset();event.stopImmediatePropagation();return}let picked:T.Object3D=hit.object;while(picked.userData.control===undefined&&picked.parent)picked=picked.parent;const index=picked.userData.control as number,value=picked.userData.value as number|undefined;if(value!==undefined){latest.current.onChange(index,value);event.stopImmediatePropagation();return}if(props.project==='jugalbandi'){const selected=picked.userData.stringIndex??(picked.userData.stringBank?Math.max(0,Math.min(17,Math.round((picked.parent!.worldToLocal(hit.point.clone()).x+.43)/.86*17))):undefined);if(selected!==undefined)latest.current.onChange(3,selected)};const startValue=props.project==='jugalbandi'?(latest.current.values[index]+20)%101:latest.current.values[index];if(props.project==='jugalbandi')latest.current.onChange(index,startValue);const crank=hit.object.userData.dragKind==='crank',rotary=props.project==='revolving-stage'&&index===0;drag={index,startX:event.clientX,startY:event.clientY,axis:picked.userData.dragAxis,startValue,pointerId:event.pointerId,clockX:picked.userData.dragKind==='clock-distance'?(clockX(event)??undefined):undefined,crank,rotary,angle:(crank||rotary)?(crankAngle(event)??0):undefined,turn:0};controls.enabled=false;cameraMoving=false;renderer.domElement.setPointerCapture(event.pointerId);event.stopImmediatePropagation()}
    const move=(event:PointerEvent)=>{if(inkPointer!==null){if(inkPointer===event.pointerId){for(const sample of (event.getCoalescedEvents?.().length?event.getCoalescedEvents():[event])){const uv=tabletHit(sample);if(uv)paintInk(uv);else inkLast=null}}event.preventDefault();event.stopImmediatePropagation();return}if(!drag||drag.pointerId!==event.pointerId)return;if(drag.clockX!==undefined){const x=clockX(event);if(x!==null)latest.current.onChange(1,Math.max(0,Math.min(100,drag.startValue+(x-drag.clockX)/.5*100)));event.preventDefault();return}if(drag.crank||drag.rotary){const angle=crankAngle(event);if(angle===null)return;let delta=angle-drag.angle!;if(delta>Math.PI)delta-=Math.PI*2;if(delta<-Math.PI)delta+=Math.PI*2;drag.angle=angle;drag.turn!-=delta;if(drag.rotary){latest.current.onChange(drag.index,((drag.startValue+drag.turn!*180/Math.PI)%360+360)%360);return}latest.current.onChange(drag.index,Math.max(0,Math.min(100,drag.startValue+drag.turn!/(Math.PI*8)*100)));return}const max=props.project==='revolving-stage'&&drag.index===0?360:100;latest.current.onChange(drag.index,Math.max(0,Math.min(max,drag.startValue+(drag.axis==='y'?(event.clientY-drag.startY)/host.clientHeight:(event.clientX-drag.startX)/host.clientWidth)*max*2)))}
    const up=(event:PointerEvent)=>{if(finishInk(event)){event.stopImmediatePropagation();return;}if(!drag||drag.pointerId!==event.pointerId)return;drag=null;controls.enabled=!(props.project==='enigma'&&latest.current.focus===4);if(renderer.domElement.hasPointerCapture(event.pointerId))renderer.domElement.releasePointerCapture(event.pointerId)}
    const blur=()=>{if(inkPointer!==null)finishInk(new PointerEvent('pointercancel',{pointerId:inkPointer}))}
    window.addEventListener('blur',blur)
    renderer.domElement.addEventListener('pointerdown',down,true);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up,true);renderer.domElement.addEventListener('pointercancel',up,true);renderer.domElement.addEventListener('lostpointercapture',up,true)
    const lost=(event:Event)=>{event.preventDefault();activity?.dispose();latest.current.onFail()};renderer.domElement.addEventListener('webglcontextlost',lost)
    cleanup=()=>{disposed=true;window.removeEventListener('blur',blur);wake.current=null;activity?.dispose();resizeObserver.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',down,true);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up,true);renderer.domElement.removeEventListener('pointercancel',up,true);renderer.domElement.removeEventListener('lostpointercapture',up,true);renderer.domElement.removeEventListener('webglcontextlost',lost)
      const geometries=new Set<T.BufferGeometry>();scene.traverse(object=>{if(object instanceof T.Mesh||object instanceof T.LineSegments){geometries.add(object.geometry);const ms=Array.isArray(object.material)?object.material:[object.material];ms.forEach(m=>materials.add(m))}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove()}
    }
    void setup().catch(() => { cleanup?.(); if (!controller.signal.aborted) latest.current.onFail() })
    return () => { controller.abort(); cleanup?.() }
  },[props.project,props.resetVersion])
  useEffect(()=>{wake.current?.()},[props.values,props.dark,props.revision,props.reduced,props.enigma])
  useEffect(()=>{
    if(props.project!=='black-hole'||!props.values[3]||props.reduced||![0,2].includes(props.values[0])||!hostRef.current)return
    let timer:number|undefined
    const observer=observeVisible(hostRef.current,visible=>{window.clearInterval(timer);if(visible&&!document.hidden)timer=window.setInterval(()=>wake.current?.(),300)})
    return()=>{window.clearInterval(timer);observer()}
  },[props.project,props.values[0],props.values[3],props.reduced])
  return <div ref={hostRef} style={{width:'100%',height:'100%'}} />
}
