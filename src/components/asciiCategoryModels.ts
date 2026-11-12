import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js'

export const categoryModels: Record<string, string> = {
  motion: 'reel', ai: 'orbit', 'ai-wearables': 'glasses', 'ux-design': 'knot', ui: 'knot',
  'ux-research': 'lens', 'design-engineering': 'cube', 'design-engineer': 'cube',
  'creative-tech': 'cube', crypto: 'coin', fintech: 'coins',
  brand: 'rings', 'brand-visual': 'rings', 'visual-brand': 'rings',
  installations: 'arch', healthcare: 'cross', 'design-for-good': 'teapot',
}
export const modelNames: Record<string, string> = {
  reel: 'film reel', orbit: 'orbital sphere', glasses: 'glasses', knot: 'torus knot', lens: 'magnifying lens',
  cube: 'engineering frame', coin: 'coin', coins: 'coin stack', rings: 'interlocking rings',
  arch: 'sculptural arch', cross: 'medical cross', teapot: 'Utah teapot',
}

/** Reusable Three.js primitives, assembled and normalized for one shared slot. */
export function createAsciiModel(model: string, material: THREE.Material) {
  const group = new THREE.Group()
  const palette = [0x126bc0, 0x16a690, 0xb89126].map(color => new THREE.Color(color))
  let part = 0
  const add = (geometry: THREE.BufferGeometry, position = [0, 0, 0], rotation = [0, 0, 0]) => {
    const colors = new Float32Array(geometry.getAttribute('position').count * 3)
    const color = palette[part++ % palette.length]
    for (let i = 0; i < colors.length; i += 3) color.toArray(colors, i)
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...position as [number, number, number])
    mesh.rotation.set(...rotation as [number, number, number])
    group.add(mesh)
    return mesh
  }
  const ring = (radius = .85, tube = .13) => new THREE.TorusGeometry(radius, tube, 16, 80)
  const bead = (position: number[], radius = .075) => add(new THREE.IcosahedronGeometry(radius, 1), position)
  const strut = (from: number[], to: number[], radius = .028) => {
    const a = new THREE.Vector3(...from as [number, number, number])
    const b = new THREE.Vector3(...to as [number, number, number])
    const mesh = add(new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 8), a.clone().add(b).multiplyScalar(.5).toArray())
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize())
  }
  // Open structural cores inspired by ThreeUI's Wireframe Forms studies.
  // Own geometry implementation; retain the existing single-mesh ASCII renderer.
  const cage = (geometry: THREE.BufferGeometry, radius = .025) => {
    const edges = new THREE.EdgesGeometry(geometry)
    const positions = edges.getAttribute('position')
    for (let i = 0; i < positions.count; i += 2) {
      strut([positions.getX(i), positions.getY(i), positions.getZ(i)],
        [positions.getX(i + 1), positions.getY(i + 1), positions.getZ(i + 1)], radius)
    }
    edges.dispose()
    geometry.dispose()
  }
  const studs = (radius: number, count: number, z = 0) => {
    for (let i = 0; i < count; i++) {
      const angle = i * Math.PI * 2 / count
      bead([Math.cos(angle) * radius, Math.sin(angle) * radius, z], .045)
    }
  }
  if (model === 'reel') {
    add(ring(.92, .13))
    add(new THREE.CylinderGeometry(.24, .24, .22, 24), [0, 0, 0], [Math.PI / 2, 0, 0])
    for (let index = 0; index < 5; index++) {
      const angle = index * Math.PI * 2 / 5
      add(new THREE.BoxGeometry(.62, .17, .18), [Math.cos(angle) * .54, Math.sin(angle) * .54, 0], [0, 0, angle])
    }
  } else if (model === 'orbit') {
    add(new THREE.SphereGeometry(.45, 32, 20))
    add(ring(1, .075), [0, 0, 0], [.75, .35, 0])
    add(ring(1, .075), [0, 0, 0], [-.75, -.35, .6])
    add(new THREE.SphereGeometry(.14, 16, 12), [1, 0, 0])
  } else if (model === 'glasses') {
    for (const x of [-.62, .62]) {
      const lens = add(ring(.47, .08), [x, 0, 0]); lens.scale.y = .8
      add(new THREE.BoxGeometry(.08, .08, 1), [x * 1.7, .1, -.5])
    }
    add(new THREE.BoxGeometry(.32, .08, .08))
  } else if (model === 'lens') {
    add(ring(.68, .12), [0, .3, 0])
    add(new THREE.CapsuleGeometry(.12, .9, 8, 16), [.68, -.68, 0], [0, 0, .65])
  } else if (model === 'cube') {
    for (const axis of [0, 1, 2]) for (const a of [-.65, .65]) for (const b of [-.65, .65]) {
      const dimensions = [.13, .13, .13]; dimensions[axis] = 1.43
      const position = [a, b]; position.splice(axis, 0, 0)
      add(new THREE.BoxGeometry(...dimensions as [number, number, number]), position)
    }
    cage(new THREE.OctahedronGeometry(.48), .035)
  } else if (model === 'coin' || model === 'coins') {
    for (let index = 0; index < (model === 'coin' ? 1 : 3); index++) {
      const y = (index - (model === 'coin' ? 0 : 1)) * .32
      add(new THREE.CylinderGeometry(.8, .8, .17, 64), [0, y, 0])
      add(ring(.7, .045), [0, y + .095, 0], [Math.PI / 2, 0, 0])
      add(new THREE.BoxGeometry(.48, .05, .08), [0, y + .11, 0], [0, -.4, 0])
    }
    group.rotation.x = .85
  } else if (model === 'rings') {
    add(ring(.62, .14), [-.38, .18, 0], [.35, .25, -.15])
    add(ring(.62, .14), [.38, .18, .12], [-.4, -.35, .2])
  } else if (model === 'arch') {
    add(new THREE.BoxGeometry(.35, 1.6, .5), [-.65, 0, 0])
    add(new THREE.BoxGeometry(.35, 1.6, .5), [.65, 0, 0])
    add(new THREE.BoxGeometry(1.65, .35, .5), [0, .8, 0])
    add(new THREE.SphereGeometry(.32, 24, 16), [0, -.2, 0])
  } else if (model === 'cross') {
    add(new THREE.BoxGeometry(.5, 1.7, .5))
    add(new THREE.BoxGeometry(1.7, .5, .5))
  } else if (model === 'teapot') {
    add(new TeapotGeometry(.64, 12))
  } else {
    add(new THREE.TorusKnotGeometry(.78, .27, 192, 32, 2, 3))
  }
  // Secondary structures are designed for the small glyph grid: open space,
  // strong depth offsets, and details thick enough to survive rasterization.
  if (model === 'reel') {
    add(ring(.92, .045), [0, 0, -.23])
    add(ring(.32, .05), [0, 0, .18])
    studs(.8, 10, .08)
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5
      strut([Math.cos(a) * .9, Math.sin(a) * .9, -.23], [Math.cos(a) * .9, Math.sin(a) * .9, .08])
    }
  } else if (model === 'orbit') {
    cage(new THREE.IcosahedronGeometry(.62, 0), .027)
    add(ring(.7, .035), [0, 0, 0], [.3, 1.1, .3])
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3
      bead([Math.cos(a), Math.sin(a) * .72, Math.sin(a) * .7], .09)
    }
  } else if (model === 'glasses') {
    for (const x of [-.62, .62]) {
      const inner = add(ring(.37, .03), [x, 0, -.07]); inner.scale.y = .8
      add(new THREE.BoxGeometry(.14, .18, .28), [x * 1.7, .08, -.15])
      bead([x * 1.7, .09, .04], .065)
      strut([x * 1.7, .1, -.9], [x * 1.55, -.13, -1.08], .045)
    }
    add(ring(.075, .023), [.72, .05, -.1])
    add(new THREE.BoxGeometry(.2, .035, .035), [.72, -.1, -.1])
  } else if (model === 'lens') {
    add(ring(.56, .04), [0, .3, .08])
    add(ring(.68, .055), [0, .3, -.18])
    for (const x of [-.2, .2]) for (const y of [.1, .5]) bead([x, y, -.16], .065)
    strut([-.2, .1, -.16], [.2, .5, -.16])
    strut([-.2, .5, -.16], [.2, .1, -.16])
    for (let i = 0; i < 3; i++) add(ring(.13, .025), [.56 + i * .1, -.49 - i * .13, 0], [Math.PI / 2, -.65, 0])
  } else if (model === 'cube') {
    for (const x of [-.65, .65]) for (const y of [-.65, .65]) for (const z of [-.65, .65]) bead([x, y, z], .1)
    add(ring(.39, .025), [0, 0, 0], [.6, .8, 0])
    for (const z of [-.65, .65]) {
      strut([-.65, -.65, z], [.65, .65, z])
      strut([-.65, .65, z], [.65, -.65, z])
    }
  } else if (model === 'coin' || model === 'coins') {
    const count = model === 'coin' ? 1 : 3
    for (let j = 0; j < count; j++) {
      const y = (j - (count === 1 ? 0 : 1)) * .32
      for (let i = 0; i < 20; i++) {
        const a = i * Math.PI / 10
        add(new THREE.BoxGeometry(.045, .12, .055), [Math.cos(a) * .8, y, Math.sin(a) * .8], [0, -a, 0])
      }
      add(ring(.57, .022), [0, y + .105, 0], [Math.PI / 2, 0, 0])
    }
    add(new THREE.OctahedronGeometry(.24), [0, (count === 1 ? 0 : .32) + .29, 0])
  } else if (model === 'rings') {
    // Three interdependent planes, with a faceted mark held in their center.
    add(ring(.6, .09), [0, -.35, -.08], [.6, .5, 0])
    add(new THREE.OctahedronGeometry(.27), [0, 0, .12])
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3 + .4
      bead([Math.cos(a) * .83, Math.sin(a) * .7, Math.sin(a) * .45], .095)
    }
  } else if (model === 'arch') {
    for (let i = 0; i < 3; i++) {
      const z = -.23 - i * .2
      strut([-.48, -.62, z], [-.48, .57, z], .035)
      strut([-.48, .57, z], [.48, .57, z], .035)
      strut([.48, .57, z], [.48, -.62, z], .035)
    }
    add(ring(.44, .035), [0, -.2, 0], [.25, .45, 0])
    add(new THREE.CylinderGeometry(.51, .59, .1, 32), [0, -.78, 0])
  } else if (model === 'cross') {
    add(ring(.94, .04), [0, 0, -.3], [.1, .25, 0])
    const points = [[-.65, 0, .28], [-.26, 0, .28], [-.12, .23, .28], [.06, -.24, .28], [.2, 0, .28], [.65, 0, .28]]
    for (let i = 1; i < points.length; i++) strut(points[i - 1], points[i], .035)
    bead([0, .95, -.2], .09)
    bead([0, -.95, -.2], .09)
  } else if (model === 'teapot') {
    add(ring(.67, .045), [0, -.43, 0], [Math.PI / 2, 0, 0])
    add(new THREE.CylinderGeometry(.72, .64, .07, 48), [0, -.5, 0])
    for (let i = 0; i < 3; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-.12 + i * .15, .55, 0),
        new THREE.Vector3(-.2 + i * .15, .73, .03),
        new THREE.Vector3(-.1 + i * .15, .93, 0),
      ])
      add(new THREE.TubeGeometry(curve, 12, .018, 5, false))
    }
  } else {
    add(new THREE.TorusKnotGeometry(.78, .045, 128, 8, 2, 3), [0, 0, 0], [0, Math.PI / 2, .4])
    add(new THREE.IcosahedronGeometry(.22, 0))
    bead([.25, .7, .25], .1)
    bead([-.25, -.7, -.25], .1)
  }
  const bounds = new THREE.Box3().setFromObject(group)
  const center = bounds.getCenter(new THREE.Vector3())
  const size = bounds.getSize(new THREE.Vector3())
  const outer = new THREE.Group()
  group.position.sub(center)
  outer.add(group)
  outer.scale.setScalar((model === 'cube' ? 2.15 : 2.65) / Math.max(size.x, size.y, size.z))
  // Bake the colored parts into one draw call; added detail must not create
  // dozens of WebGL submissions per ASCII frame. No extra animation loops.
  outer.updateMatrixWorld(true)
  const parts: THREE.BufferGeometry[] = []
  outer.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone()
    geometry.applyMatrix4(object.matrixWorld)
    for (const key of Object.keys(geometry.attributes)) {
      if (!['position', 'normal', 'color'].includes(key)) geometry.deleteAttribute(key)
    }
    parts.push(geometry)
    object.geometry.dispose()
  })
  const combined = mergeGeometries(parts)
  parts.forEach(geometry => geometry.dispose())
  const result = new THREE.Group()
  if (combined) result.add(new THREE.Mesh(combined, material))
  return result
}
