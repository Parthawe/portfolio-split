import { useEffect, useRef } from 'react'
import { createSceneActivity } from '../../utils/sceneActivity'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { LEFT, RIGHT, type Key } from './model'
import type { ShuffleView } from '../ShuffleInteractive'

type Props = {
  values: Record<Key, number>
  view: ShuffleView
  dark: boolean
  reduced: boolean
  viewRevision: number
  onChange: (key: Key, value: number) => void
  onFail: () => void
}
const ROWS = [.82, .27, -.28, -.83]
const TILT = .34
const TRAVEL = .82
const CAMERAS: Record<ShuffleView, [number, number, number]> = {
  Room: [4, 3.5, 5.3], Studio: [.65, 3.7, 4.6], Overhead: [0, 5.5, .04], Construction: [4.7, 1.15, 3.5],
}

// Seeded texture generation keeps material grain stable across renders.
function woodTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  let seed = 73
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  const pixels = ctx.createImageData(1024, 1024)
  for (let y = 0; y < 1024; y++) {
    for (let x = 0; x < 1024; x++) {
      const warp = Math.sin(y * .006) * 22 + Math.sin(y * .017 + x * .002) * 8
      const grain = Math.sin((x + warp) * .16) * 2 + Math.sin((x + warp) * .043) * 3
      const cloud = Math.sin(x * .011 + y * .003) * Math.sin(y * .009) * 4
      const n = (random() - .5) * 8 + grain + cloud
      const i = (y * 1024 + x) * 4
      pixels.data[i] = 219 + n; pixels.data[i + 1] = 195 + n; pixels.data[i + 2] = 156 + n; pixels.data[i + 3] = 255
    }
  }
  ctx.putImageData(pixels, 0, 0)
  for (let i = 0; i < 180; i++) {
    const x = random() * 1024
    ctx.beginPath(); ctx.moveTo(x, 0)
    for (let y = 0; y <= 1024; y += 16) ctx.lineTo(x + Math.sin(y * .005 + i) * 10 + Math.sin(y * .016) * 2, y)
    ctx.strokeStyle = `rgba(119,77,29,${.015 + random() * .035})`; ctx.lineWidth = .4 + random(); ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
function labelTexture(keys: readonly Key[]) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1536
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#785022'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  for (let i = 0; i < 4; i++) {
    const y = (1.15 - ROWS[i]) / 2.3 * canvas.height
    ctx.font = '500 40px Arial'; ctx.fillText(keys[i], 512, y - 136)
    ctx.strokeStyle = '#8b5a26'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(108, y - 14); ctx.lineTo(108, y + 14)
    ctx.moveTo(916, y - 19); ctx.lineTo(916, y + 19)
    ctx.moveTo(897, y); ctx.lineTo(935, y); ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
function rectangle(x: number, y: number, w: number, h: number) {
  const path = new THREE.Path()
  path.moveTo(x, y); path.lineTo(x, y + h); path.lineTo(x + w, y + h); path.lineTo(x + w, y); path.closePath()
  return path
}
function panelGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-.7, -1.15); shape.lineTo(.7, -1.15); shape.lineTo(.7, 1.15); shape.lineTo(-.7, 1.15); shape.closePath()
  ROWS.forEach(y => shape.holes.push(rectangle(-.46, y - .019, .92, .038)))
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: .033, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .002, bevelThickness: .002 })
  return geometry
}
function capGeometry() {
  // Side profile of the printed cap: two raised shoulders and a shallow centre groove.
  const profile = new THREE.Shape()
  profile.moveTo(-.115, 0); profile.lineTo(.115, 0); profile.lineTo(.115, .065)
  profile.lineTo(.103, .09); profile.lineTo(.018, .074); profile.lineTo(0, .067)
  profile.lineTo(-.018, .074); profile.lineTo(-.103, .09); profile.lineTo(-.115, .065); profile.closePath()
  const geometry = new THREE.ExtrudeGeometry(profile, { depth: .13, bevelEnabled: true, bevelSegments: 2, bevelSize: .005, bevelThickness: .005 })
  geometry.rotateX(Math.PI / 2); geometry.translate(0, .065, .006)
  return geometry
}

export default function ShuffleScene(props: Props) {
  const mount = useRef<HTMLDivElement>(null)
  const wake = useRef<(() => void) | null>(null)
  const latest = useRef(props)
  latest.current = props
  useEffect(() => {
    const host = mount.current!
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' }) }
    catch { latest.current.onFail(); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true; renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D Shuffle board. Use slider controls below for keyboard access.')
    renderer.domElement.setAttribute('role', 'img')
    host.appendChild(renderer.domElement)
    const scene = new THREE.Scene(); scene.background = new THREE.Color(latest.current.dark ? '#1b1d1a' : '#eae6de')
    const camera = new THREE.PerspectiveCamera(36, 1, .05, 50)
    camera.position.set(...CAMERAS.Studio)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, .35, 0); controls.enableDamping = true; controls.dampingFactor = .08
    controls.enablePan = false; controls.minDistance = 3.3; controls.maxDistance = 8
    controls.minPolarAngle = .01; controls.maxPolarAngle = Math.PI / 2 - .035
    controls.rotateSpeed = .65; controls.zoomSpeed = .65
    const hemisphere = new THREE.HemisphereLight('#fff9ee', '#a39c8f', 1.4); scene.add(hemisphere)
    const keyLight = new THREE.DirectionalLight('#fff8ee', 3); keyLight.position.set(-3, 6, 3)
    keyLight.castShadow = true; keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.camera.left = -4; keyLight.shadow.camera.right = 4
    keyLight.shadow.camera.top = 4; keyLight.shadow.camera.bottom = -4
    keyLight.shadow.normalBias = .025; keyLight.shadow.bias = -.0003
    keyLight.shadow.radius = 4; scene.add(keyLight)
    const fill = new THREE.DirectionalLight('#edf2ff', .9); fill.position.set(4, 3, -3); scene.add(fill)
    const grain = woodTexture()
    const wood = new THREE.MeshStandardMaterial({ map: grain, roughness: .85, color: '#fff8eb' })
    const edge = new THREE.MeshStandardMaterial({ color: '#ae8253', roughness: .9 })
    const metal = new THREE.MeshStandardMaterial({ color: '#b5b8b7', roughness: .28, metalness: .8 })
    const black = new THREE.MeshStandardMaterial({ color: '#1e1b18', roughness: .7, metalness: .3 })
    const white = new THREE.MeshStandardMaterial({ color: '#f1efe6', roughness: .64 })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: latest.current.dark ? '#1b1d1a' : '#eae6de', roughness: 1 }))
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.025; floor.receiveShadow = true; scene.add(floor)
    const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], parent: THREE.Object3D, x: number, y: number, z: number) => {
      const object = new THREE.Mesh(geometry, material); object.position.set(x, y, z)
      object.castShadow = true; object.receiveShadow = true; parent.add(object); return object
    }
    const box = (w: number, h: number, d: number, material: THREE.Material, parent: THREE.Object3D, x: number, y: number, z: number) => mesh(new THREE.BoxGeometry(w, h, d), material, parent, x, y, z)
    const room = new THREE.Group(); scene.add(room); room.visible = false
    const roomWall = new THREE.MeshStandardMaterial({color:'#abae9f',roughness:1})
    box(10,.08,9,roomWall,room,0,-1.38,0)
    box(10,5,.08,roomWall,room,0,1.08,-3)
    box(.08,5,9,roomWall,room,-4,1.08,0)
    for(const x of [-1.75,1.75]) for(const z of [-1.25,1.25]) box(.08,1.3,.08,black,room,x,-.7,z)
    box(3.8,.06,2.8,wood,room,0,-.06,0)
    const screw = (parent: THREE.Object3D, x: number, y: number, z: number, radius: number, material: THREE.Material) => {
      const head = mesh(new THREE.CylinderGeometry(radius, radius * .88, .014, 16), material, parent, x, y, z)
      head.rotation.x = Math.PI / 2
      box(radius * 1.1, .007, .003, black, parent, x, y, z + .009)
      box(.007, radius * 1.1, .003, black, parent, x, y, z + .009)
    }
    const caps: { key: Key; cap: THREE.Mesh; panel: THREE.Group; row: number; hit: THREE.Mesh }[] = []
    const panels: THREE.Group[] = []
    const capGeo = capGeometry()
    const invisible = new THREE.MeshBasicMaterial({ visible: false })
    for (let side = 0; side < 2; side++) {
      const keys = side === 0 ? LEFT : RIGHT
      const x = side === 0 ? -.72 : .72
      const base = box(1.4, .035, 2.3, wood, scene, x, .015, 0)
      base.receiveShadow = true
      const panel = new THREE.Group(); panel.rotation.x = -Math.PI / 2 + TILT
      panel.position.set(x, .43, 0); scene.add(panel); panels.push(panel)
      mesh(panelGeometry(), [wood, edge], panel, 0, 0, 0)
      const labels = new THREE.MeshBasicMaterial({ map: labelTexture(keys), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
      const lettering = mesh(new THREE.PlaneGeometry(1.4, 2.3), labels, panel, 0, 0, .038)
      lettering.castShadow = false
      // Plywood plies on each visible side edge.
      for (let layer = 0; layer < 4; layer++) {
        box(.002, 2.3, .002, edge, panel, -.702, 0, layer * .009)
        box(.002, 2.3, .002, edge, panel, .702, 0, layer * .009)
      }
      for (const sx of [-.59, .59]) for (const sy of [-1.03, 1.03]) {
        screw(panel, sx, sy, .047, .028, metal)
        const z = -sy * Math.cos(TILT)
        const top = .43 + sy * Math.sin(TILT)
        mesh(new THREE.CylinderGeometry(.025, .025, top - .06, 12), metal, scene, x + sx, (top + .06) / 2, z)
        mesh(new THREE.CylinderGeometry(.042, .042, .012, 16), metal, scene, x + sx, .044, z)
      }
      // Side wedge has the same incline as the upper panel.
      const wedge = new THREE.Shape()
      wedge.moveTo(-1.1, .04); wedge.lineTo(1.1, .04)
      wedge.lineTo(1.1, Math.max(.055, .43 - 1.1 * Math.tan(TILT) - .18))
      wedge.lineTo(-1.1, .43 + 1.1 * Math.tan(TILT) - .18); wedge.closePath()
      const wedgeGeo = new THREE.ExtrudeGeometry(wedge, { depth: .025, bevelEnabled: false })
      wedgeGeo.rotateY(-Math.PI / 2)
      mesh(wedgeGeo, [wood, edge], scene, x + (side === 0 ? -.67 : .695), 0, 0)
      for (let row = 0; row < 4; row++) {
        const y = ROWS[row]
        // Housing under each through-slot; guide rod, belt and motor.
        box(1.01, .085, .07, metal, panel, 0, y, -.055)
        box(.94, .038, .007, black, panel, 0, y, -.018)
        box(.9, .006, .006, metal, panel, 0, y, -.010)
        screw(panel, -.51, y, .045, .023, black); screw(panel, .51, y, .045, .023, black)
        const motor = mesh(new THREE.CylinderGeometry(.043, .043, .15, 18), metal, panel, .50, y - .10, -.093)
        motor.rotation.x = Math.PI / 2
        box(.08, .06, .04, black, panel, .5, y - .1, -.17)
        const cap = mesh(capGeo, white, panel, (latest.current.values[keys[row]] / 100 - .5) * TRAVEL, y, .042)
        // Tiny print grooves run across the cap shoulders.
        for (let line = 0; line < 12; line++) {
          const groove = new THREE.Mesh(new THREE.BoxGeometry(.19, .001, .001), new THREE.MeshStandardMaterial({ color: '#deddd4', roughness: .9 }))
          groove.position.set(0, -.055 + line * .01, .081); cap.add(groove)
        }
        const hit = mesh(new THREE.BoxGeometry(.30, .20, .17), invisible, panel, cap.position.x, y, .10)
        hit.userData.key = keys[row]
        caps.push({ key: keys[row], cap, hit, panel, row: y })
        const wireMaterial = new THREE.MeshStandardMaterial({ color: row % 2 ? '#80372c' : '#292a27', roughness: .8 })
        const wire = new THREE.CatmullRomCurve3([new THREE.Vector3(.5, y - .12, -.17), new THREE.Vector3(.24, y - .19, -.23), new THREE.Vector3(-.15, y - .12, -.28), new THREE.Vector3(-.33, -.50, -.30)])
        mesh(new THREE.TubeGeometry(wire, 28, .006, 5, false), wireMaterial, panel, 0, 0, 0)
      }
      // A small controller board beneath the panel, visible from the construction angle.
      const circuit = new THREE.MeshStandardMaterial({ color: '#276b70', roughness: .8 })
      box(.29, .017, .42, circuit, scene, x - .10, .068, -.30)
      box(.09, .028, .13, black, scene, x - .1, .09, -.28)
      box(.08, .07, .09, metal, scene, x -.1, .094, -.51)
      for (let pin = 0; pin < 8; pin++) box(.012, .025, .014, metal, scene, x + .015, .09, -.44 + pin * .035)
    }
    const cableCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.82, .07, -.52), new THREE.Vector3(-1.05, .08, -.9), new THREE.Vector3(-1.65, .018, -1.25), new THREE.Vector3(-2.05, .018, -.80)])
    mesh(new THREE.TubeGeometry(cableCurve, 40, .014, 8, false), new THREE.MeshStandardMaterial({ color: '#417180', roughness: .7 }), scene, 0, 0, 0)

    const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2()
    const localPoint = new THREE.Vector3(); const intersection = new THREE.Vector3()
    let drag: typeof caps[number] | null = null
    let dragOffset = 0
    let view = latest.current.view
    let viewRevision = latest.current.viewRevision
    let movingCamera = false
    let disposed = false
    let activity: ReturnType<typeof createSceneActivity> | undefined
    const updateRay = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
    }
    const planeFor = (panel: THREE.Group) => {
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(panel.quaternion)
      return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, panel.localToWorld(new THREE.Vector3(0, 0, .042)))
    }
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return
      updateRay(event)
      const hit = raycaster.intersectObjects(caps.map(item => item.hit))[0]
      if (!hit) return
      drag = caps.find(item => item.hit === hit.object)!
      if (raycaster.ray.intersectPlane(planeFor(drag.panel), intersection)) {
        localPoint.copy(intersection); drag.panel.worldToLocal(localPoint)
        dragOffset = drag.cap.position.x - localPoint.x
      }
      controls.enabled = false; movingCamera = false
      renderer.domElement.setPointerCapture(event.pointerId)
      renderer.domElement.style.cursor = 'grabbing'
      event.stopImmediatePropagation()
    }
    const move = (event: PointerEvent) => {
      updateRay(event)
      if (drag) {
        if (raycaster.ray.intersectPlane(planeFor(drag.panel), intersection)) {
          localPoint.copy(intersection); drag.panel.worldToLocal(localPoint)
          latest.current.onChange(drag.key, ((localPoint.x + dragOffset) / TRAVEL + .5) * 100)
        }
      } else renderer.domElement.style.cursor = raycaster.intersectObjects(caps.map(item => item.hit)).length ? 'grab' : 'default'
    }
    const up = (event: PointerEvent) => {
      drag = null; controls.enabled = true
      if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId)
      renderer.domElement.style.cursor = 'default'
    }
    renderer.domElement.addEventListener('pointerdown', down, true)
    renderer.domElement.addEventListener('pointermove', move)
    renderer.domElement.addEventListener('pointerup', up)
    renderer.domElement.addEventListener('pointercancel', up)
    const contextLost = (event: Event) => { event.preventDefault(); latest.current.onFail() }
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    controls.addEventListener('start', () => { movingCamera = false })
    let dark = latest.current.dark
    let dirty = true
    controls.addEventListener('change', () => { dirty = true; activity?.wake() })
    const resize = () => {
      dirty = true
      activity?.wake()
      const w = host.clientWidth; const h = host.clientHeight
      renderer.setSize(w, h); camera.aspect = w / h
      camera.fov = w < 600 ? 46 : 36; camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize); observer.observe(host); resize()
    const render = (delta: number) => {
      if (disposed) return
      if (dark !== latest.current.dark) {
        dark = latest.current.dark
        const background = dark ? '#1b1d1a' : '#eae6de'
        ;(scene.background as THREE.Color).set(background)
        floor.material.color.set(background)
        dirty = true
      }
      if (latest.current.viewRevision !== viewRevision) { view = latest.current.view; viewRevision = latest.current.viewRevision; movingCamera = true }
      room.visible = view === 'Room'; floor.visible = view !== 'Room'
      roomWall.color.set(dark ? '#353c32' : '#abae9f')
      if (movingCamera) {
        const destination = new THREE.Vector3(...CAMERAS[view])
        dirty = true
        camera.position.lerp(destination, latest.current.reduced ? 1 : 1 - Math.exp(-delta * 7))
        controls.target.set(0, .35, 0)
        if (camera.position.distanceTo(destination) < .005) movingCamera = false
      }
      for (const item of caps) {
        const target = (latest.current.values[item.key] / 100 - .5) * TRAVEL
        if (Math.abs(item.cap.position.x - target) > .0001) { dirty = true; renderer.shadowMap.needsUpdate = true }
        item.cap.position.x = latest.current.reduced || drag === item ? target : THREE.MathUtils.damp(item.cap.position.x, target, 12, delta)
        item.hit.position.x = item.cap.position.x
      }
      controls.update()
      if (dirty) { renderer.render(scene, camera); dirty = false }
    }
    activity = createSceneActivity(host, render, { idleMs: 2000, introMs: 2000, fps: 30, interactionFps: 60 })
    wake.current = () => { dirty = true; activity?.wake() }
    return () => {
      disposed = true; wake.current = null; activity?.dispose(); observer.disconnect(); controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', down, true)
      renderer.domElement.removeEventListener('pointermove', move)
      renderer.domElement.removeEventListener('pointerup', up)
      renderer.domElement.removeEventListener('pointercancel', up)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>(); const textures = new Set<THREE.Texture>()
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry)
          const all = Array.isArray(object.material) ? object.material : [object.material]
          all.forEach(material => { materials.add(material); const map = (material as THREE.MeshStandardMaterial).map; if (map) textures.add(map) })
        }
      })
      geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); textures.forEach(item => item.dispose())
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])
  useEffect(() => { wake.current?.() }, [props.values, props.viewRevision, props.dark, props.reduced])
  return <div ref={mount} style={{ width: '100%', height: '100%' }} />
}
