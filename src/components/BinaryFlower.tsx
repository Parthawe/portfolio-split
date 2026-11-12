import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePrefersReduced } from '../hooks/usePrefersReduced'
import { useThemeMode } from '../hooks/useThemeMode'
import { useWebGLAvailable } from '../hooks/useWebGLAvailable'
import { usePerformanceDegraded } from '../hooks/usePerformanceDegraded'

type BinaryPoint = {
  x: number
  y: number
  z: number
  scale: number
  petal: number
  depth: number
  twist: number
}

type BinaryPointSet = {
  flower: BinaryPoint
  orbit: BinaryPoint
  wave: BinaryPoint
  cube: BinaryPoint
}

const OBJECT_SEQUENCE: Array<keyof BinaryPointSet> = ['flower', 'orbit', 'wave', 'cube']
const POINT_COUNT = 960

function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function mixPoint(from: BinaryPoint, to: BinaryPoint, t: number): BinaryPoint {
  const ease = t * t * (3 - 2 * t)
  return {
    x: THREE.MathUtils.lerp(from.x, to.x, ease),
    y: THREE.MathUtils.lerp(from.y, to.y, ease),
    z: THREE.MathUtils.lerp(from.z, to.z, ease),
    scale: THREE.MathUtils.lerp(from.scale, to.scale, ease),
    petal: Math.round(THREE.MathUtils.lerp(from.petal, to.petal, ease)),
    depth: THREE.MathUtils.lerp(from.depth, to.depth, ease),
    twist: THREE.MathUtils.lerp(from.twist, to.twist, ease),
  }
}

function makeGlyphTexture(glyph: '0' | '1') {
  const canvas = document.createElement('canvas')
  canvas.width = 96
  canvas.height = 96
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '700 68px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
    ctx.shadowBlur = 8
    ctx.fillStyle = '#fffaf0'
    ctx.fillText(glyph, 48, 48)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return texture
}

function createPointSet(index: number): BinaryPointSet {
  const seed = index * 41
  const petal = index % 6
  const depth = seeded(seed + 1)
  const petalAngle = (petal / 6) * Math.PI * 2 - Math.PI / 2
  const petalWidth = Math.sin(depth * Math.PI) * (0.44 + 0.2 * seeded(seed + 2))
  const lateral = (seeded(seed + 3) - 0.5) * petalWidth
  const flowerAngle = petalAngle + lateral + Math.sin(depth * Math.PI) * 0.16
  const flowerRadius = 0.2 + depth * 2.08

  const orbitAngle = (index / POINT_COUNT) * Math.PI * 2 * 2.4
  const orbitBand = (index % 9) / 8
  const orbitRadius = 0.78 + orbitBand * 1.6

  const waveX = (seeded(seed + 14) - 0.5) * 4.7
  const waveY = Math.sin(waveX * 1.45 + orbitBand * 4.2) * 0.74 + (orbitBand - 0.5) * 1.15

  const cubeLayer = Math.floor(index / 160)
  const cubeU = (index % 16) / 15
  const cubeV = (Math.floor(index / 16) % 10) / 9
  const cubeFace = cubeLayer % 6
  const cx = (cubeU - 0.5) * 3.05
  const cy = (cubeV - 0.5) * 2.35
  const faceOffset = 1.05

  const cube =
    cubeFace === 0 ? { x: cx, y: cy, z: faceOffset }
    : cubeFace === 1 ? { x: cx, y: cy, z: -faceOffset }
    : cubeFace === 2 ? { x: faceOffset * 1.25, y: cy, z: cx * 0.62 }
    : cubeFace === 3 ? { x: -faceOffset * 1.25, y: cy, z: cx * 0.62 }
    : cubeFace === 4 ? { x: cx, y: faceOffset, z: cy * 0.7 }
    : { x: cx, y: -faceOffset, z: cy * 0.7 }

  return {
    flower: {
      x: Math.cos(flowerAngle) * flowerRadius + (seeded(seed + 4) - 0.5) * 0.045,
      y: Math.sin(flowerAngle) * flowerRadius * 0.74 + (seeded(seed + 5) - 0.5) * 0.045,
      z: Math.sin(depth * Math.PI) * 0.44 - depth * 0.18 + (seeded(seed + 6) - 0.5) * 0.13,
      scale: 0.07 + seeded(seed + 7) * 0.035 + (1 - depth) * 0.03,
      petal,
      depth,
      twist: (seeded(seed + 8) - 0.5) * 0.65,
    },
    orbit: {
      x: Math.cos(orbitAngle) * orbitRadius,
      y: Math.sin(orbitAngle) * orbitRadius * 0.55,
      z: (orbitBand - 0.5) * 1.05 + Math.sin(orbitAngle * 2) * 0.12,
      scale: 0.07 + seeded(seed + 9) * 0.032,
      petal: cubeFace,
      depth: orbitBand,
      twist: orbitAngle + Math.PI / 2,
    },
    wave: {
      x: waveX,
      y: waveY,
      z: Math.cos(waveX * 1.2 + orbitBand * 2.4) * 0.48,
      scale: 0.068 + seeded(seed + 10) * 0.032,
      petal: Math.floor(orbitBand * 6),
      depth: orbitBand,
      twist: Math.sin(waveX) * 0.55,
    },
    cube: {
      x: cube.x + (seeded(seed + 11) - 0.5) * 0.05,
      y: cube.y + (seeded(seed + 12) - 0.5) * 0.05,
      z: cube.z + (seeded(seed + 13) - 0.5) * 0.05,
      scale: 0.062 + seeded(seed + 14) * 0.028,
      petal: cubeFace,
      depth: (cubeU + cubeV) / 2,
      twist: cubeFace * 0.35 + (seeded(seed + 15) - 0.5) * 0.45,
    },
  }
}

function createBinaryPointSets() {
  return Array.from({ length: POINT_COUNT }, (_, index) => createPointSet(index))
}

function BinaryGlyphField({
  glyph,
  points,
  reduced,
  dark,
}: {
  glyph: '0' | '1'
  points: BinaryPointSet[]
  reduced: boolean
  dark: boolean
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const texture = useMemo(() => makeGlyphTexture(glyph), [glyph])
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        color: dark
          ? glyph === '1' ? '#f9fbff' : '#8fd9ff'
          : glyph === '1' ? '#1f3145' : '#2786aa',
        transparent: true,
        opacity: dark ? 0.88 : glyph === '1' ? 0.7 : 0.78,
        depthWrite: false,
        blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
        vertexColors: false,
      }),
    [dark, glyph, texture],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      texture.dispose()
    },
    [geometry, material, texture],
  )

  useFrame(({ clock, pointer }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const time = reduced ? 0.7 : clock.getElapsedTime()
    const cycle = reduced ? 0 : time / 6.5
    const fromIndex = Math.floor(cycle) % OBJECT_SEQUENCE.length
    const toIndex = (fromIndex + 1) % OBJECT_SEQUENCE.length
    const rawMorph = cycle - Math.floor(cycle)
    const morph = rawMorph < 0.72 ? 0 : (rawMorph - 0.72) / 0.28
    const fromKey = OBJECT_SEQUENCE[fromIndex]
    const toKey = OBJECT_SEQUENCE[toIndex]
    const pointerBendX = reduced ? 0 : pointer.x * 0.16
    const pointerBendY = reduced ? 0 : pointer.y * 0.1
    points.forEach((shapeSet, index) => {
      const point = mixPoint(shapeSet[fromKey], shapeSet[toKey], morph)
      const breathe = Math.sin(time * 0.9 + point.petal * 0.72 + point.depth * 4.1)
      const unfurl = reduced ? 0 : breathe * 0.13 * (0.24 + point.depth)
      const x = point.x * (1 + unfurl * 0.08)
      const y = point.y * (1 + unfurl * 0.06)
      const z = point.z + unfurl

      dummy.position.set(x, y, z)
      dummy.rotation.set(
        -0.14 + point.depth * 0.32 + pointerBendY,
        point.twist + pointerBendX,
        point.twist * 0.42 + breathe * 0.08,
      )
      dummy.scale.setScalar(point.scale * (1 + Math.max(0, breathe) * 0.16))
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, points.length]} frustumCulled={false} />
  )
}

function BinaryFlowerScene({
  reduced,
  dark,
  performanceDegraded,
}: {
  reduced: boolean
  dark: boolean
  performanceDegraded: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const points = useMemo(() => {
    const allPoints = createBinaryPointSets()
    return performanceDegraded
      ? allPoints.filter((_, index) => index % 2 === 0)
      : allPoints
  }, [performanceDegraded])
  const zeros = useMemo(() => points.filter((_, index) => index % 3 === 0), [points])
  const ones = useMemo(() => points.filter((_, index) => index % 3 !== 0), [points])

  useFrame(({ clock, pointer }) => {
    const group = groupRef.current
    if (!group) return

    const time = reduced ? 0.9 : clock.getElapsedTime()
    group.rotation.x = -0.15 + (reduced ? 0 : pointer.y * 0.08)
    group.rotation.y = Math.sin(time * 0.28) * 0.2 + (reduced ? 0 : pointer.x * 0.18)
    group.rotation.z = Math.sin(time * 0.2) * 0.04
  })

  return (
    <group ref={groupRef} scale={1.08}>
      <BinaryGlyphField glyph="0" points={zeros} reduced={reduced} dark={dark} />
      <BinaryGlyphField glyph="1" points={ones} reduced={reduced} dark={dark} />
    </group>
  )
}

function BinaryFlowerFallback() {
  return (
    <div className="abt-binary-flower-fallback" aria-hidden="true">
      {Array.from({ length: 84 }, (_, index) => (
        <span key={index}>{index % 3 === 0 ? '0' : '1'}</span>
      ))}
    </div>
  )
}

export default function BinaryFlower() {
  const reduced = usePrefersReduced()
  const dark = useThemeMode()
  const webGLAvailable = useWebGLAvailable()
  const performanceDegraded = usePerformanceDegraded()

  return (
    <div className="abt-binary-flower" aria-label="Morphing generative binary object">
      {webGLAvailable ? (
      <Canvas events={safeCanvasEvents}
          className="abt-binary-flower-canvas"
          camera={{ position: [0, 0, 5.15], fov: 43 }}
          dpr={performanceDegraded ? 1 : [1, 1.75]}
          gl={{
            alpha: true,
            antialias: !performanceDegraded,
            powerPreference: performanceDegraded ? 'low-power' : 'high-performance',
          }}
        >
          <BinaryFlowerScene
            reduced={reduced}
            dark={dark}
            performanceDegraded={performanceDegraded}
          />
        </Canvas>
      ) : (
        <BinaryFlowerFallback />
      )}
    </div>
  )
}
import { safeCanvasEvents } from '../utils/canvasEvents';
