import { useMemo, useRef, type CSSProperties } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { useInView } from '../hooks/useInView'
import { usePrefersReduced } from '../hooks/usePrefersReduced'
import { useThemeMode } from '../hooks/useThemeMode'
import { useWebGLAvailable } from '../hooks/useWebGLAvailable'
import { usePerformanceDegraded } from '../hooks/usePerformanceDegraded'
import type { PlaybookObjectKind } from '../data/playbook'

type SceneProps = {
  dark: boolean
  reduced: boolean
}

const TOPIC_COLORS: Record<PlaybookObjectKind, { light: string[]; dark: string[] }> = {
  empathy: {
    light: ['#6d7bd8', '#d7dff8', '#98a6eb'],
    dark: ['#91a6ff', '#223057', '#cfd8ff'],
  },
  'holistic-thinking': {
    light: ['#5d7fb0', '#dfe7f2', '#9ab7d6'],
    dark: ['#89b4dd', '#1f3045', '#d9e5f2'],
  },
  innovation: {
    light: ['#8468d1', '#ece4ff', '#b7a0ef'],
    dark: ['#b49cff', '#2f2557', '#efe7ff'],
  },
  collaboration: {
    light: ['#5f9f99', '#def2ef', '#8ac7bf'],
    dark: ['#97d8d1', '#1f433f', '#e2faf5'],
  },
  adaptability: {
    light: ['#af7555', '#f8e7da', '#d8a27e'],
    dark: ['#efb28b', '#4c2f22', '#ffe8d6'],
  },
  ethics: {
    light: ['#6d8198', '#e8edf3', '#a5b4c3'],
    dark: ['#a9bdd4', '#263342', '#edf3fa'],
  },
  learning: {
    light: ['#6f86b6', '#e8eefb', '#a6b8ea'],
    dark: ['#a6c2ff', '#243253', '#eaf1ff'],
  },
  empowerment: {
    light: ['#5d8ab6', '#e2f0fb', '#8dbce2'],
    dark: ['#9acff9', '#1f3950', '#e8f7ff'],
  },
}

function paletteFor(topic: PlaybookObjectKind, dark: boolean) {
  const swatch = TOPIC_COLORS[topic][dark ? 'dark' : 'light']
  return { accent: swatch[0], base: swatch[1], glow: swatch[2] }
}

function ResonanceObject({ dark, reduced }: SceneProps) {
  const ref = useRef<THREE.Group>(null!)
  const shellRef = useRef<THREE.Mesh>(null!)
  const coreRef = useRef<THREE.Mesh>(null!)
  const nodeRefs = useRef<THREE.Mesh[]>([])
  const orbitOffsets = useMemo(() => Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2), [])
  const palette = paletteFor('empathy', dark)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * (reduced ? 0.28 : 0.8)
    ref.current.rotation.y += delta * (reduced ? 0.08 : 0.18)
    ref.current.rotation.x = Math.sin(t * 0.55) * 0.08
    if (shellRef.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.04
      shellRef.current.scale.setScalar(s)
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(t * 2.1) * 0.07)
    }
    nodeRefs.current.forEach((mesh, index) => {
      if (!mesh) return
      const angle = orbitOffsets[index] + t * (0.55 + index * 0.03)
      const radius = 0.45 + Math.sin(t + index) * 0.045
      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.4) * 0.12, Math.sin(angle) * radius * 0.75)
      mesh.scale.setScalar(0.8 + Math.sin(t * 1.5 + index) * 0.12)
    })
  })

  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[0.34, 0.012, 20, 96]} />
        <meshStandardMaterial color={palette.accent} metalness={0.72} roughness={0.18} emissive={palette.accent} emissiveIntensity={dark ? 0.14 : 0.05} />
      </mesh>
      <mesh ref={shellRef}>
        <sphereGeometry args={[0.48, 48, 48]} />
        <meshPhysicalMaterial color={palette.base} roughness={0.03} transmission={0.95} transparent opacity={dark ? 0.16 : 0.1} thickness={0.8} ior={1.36} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#f4f7ff" metalness={0.22} roughness={0.15} emissive={palette.glow} emissiveIntensity={dark ? 0.9 : 0.45} />
      </mesh>
      {orbitOffsets.map((_, index) => (
        <mesh key={index} ref={(el) => { if (el) nodeRefs.current[index] = el }}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial color={palette.base} metalness={0.68} roughness={0.18} emissive={palette.accent} emissiveIntensity={dark ? 0.16 : 0.05} />
        </mesh>
      ))}
    </group>
  )
}

function SystemsObject({ dark, reduced }: SceneProps) {
  const ref = useRef<THREE.Group>(null!)
  const ringRefs = useRef<THREE.Mesh[]>([])
  const plateRefs = useRef<THREE.Mesh[]>([])
  const palette = paletteFor('holistic-thinking', dark)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * (reduced ? 0.2 : 0.7)
    ref.current.rotation.y += delta * (reduced ? 0.06 : 0.12)
    ref.current.rotation.z = Math.sin(t * 0.35) * 0.08
    ringRefs.current.forEach((ring, index) => {
      if (!ring) return
      ring.rotation[index === 0 ? 'x' : index === 1 ? 'y' : 'z'] += delta * (0.12 + index * 0.04)
    })
    plateRefs.current.forEach((plate, index) => {
      if (!plate) return
      plate.position.y = Math.sin(t * 1.1 + index) * 0.06
      plate.rotation.z = Math.sin(t * 0.7 + index) * 0.12
    })
  })

  return (
    <group ref={ref}>
      {[0, 1, 2].map((_, index) => (
        <mesh
          key={index}
          ref={(el) => { if (el) ringRefs.current[index] = el }}
          rotation={index === 0 ? [Math.PI / 2, 0, 0] : index === 1 ? [0, Math.PI / 2, 0] : [0, 0, 0]}
        >
          <torusGeometry args={[0.42 - index * 0.06, 0.016, 20, 90]} />
          <meshStandardMaterial color={index === 1 ? palette.base : palette.accent} metalness={0.86} roughness={0.16} emissive={palette.glow} emissiveIntensity={dark ? 0.08 : 0.03} />
        </mesh>
      ))}
      {[
        { pos: [0.26, 0.08, -0.02], rot: [0.2, 0.45, 0.1] },
        { pos: [-0.24, -0.12, 0.08], rot: [-0.18, 0.15, -0.55] },
        { pos: [0.02, 0.25, 0.18], rot: [0.55, -0.15, 0.05] },
      ].map((plate, index) => (
        <mesh key={index} ref={(el) => { if (el) plateRefs.current[index] = el }} position={plate.pos as [number, number, number]} rotation={plate.rot as [number, number, number]}>
          <boxGeometry args={[0.36, 0.08, 0.18]} />
          <meshStandardMaterial color={palette.base} metalness={0.76} roughness={0.22} emissive={palette.accent} emissiveIntensity={dark ? 0.06 : 0.02} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.11, 26, 26]} />
        <meshStandardMaterial color="#f6f8ff" metalness={0.28} roughness={0.18} emissive={palette.accent} emissiveIntensity={dark ? 0.7 : 0.3} />
      </mesh>
    </group>
  )
}

function PrototypeObject({ dark, reduced }: SceneProps) {
  const ref = useRef<THREE.Group>(null!)
  const screenRefs = useRef<THREE.Mesh[]>([])
  const dotRefs = useRef<THREE.Mesh[]>([])
  const palette = paletteFor('innovation', dark)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * (reduced ? 0.22 : 0.78)
    ref.current.rotation.y += delta * 0.16
    screenRefs.current.forEach((screen, index) => {
      if (!screen) return
      screen.position.x = (index - 1.5) * 0.16
      screen.position.y = Math.sin(t * 1.4 + index * 0.7) * 0.08
      screen.position.z = Math.cos(t * 1.1 + index) * 0.09
      screen.rotation.x = -0.28 + Math.sin(t * 0.9 + index) * 0.08
      screen.rotation.y = (index - 1.5) * 0.22 + Math.sin(t * 0.6 + index) * 0.06
    })
    dotRefs.current.forEach((dot, index) => {
      if (!dot) return
      dot.position.set(Math.cos(t + index * 2.1) * 0.18, Math.sin(t * 1.7 + index) * 0.16, Math.sin(t + index * 1.8) * 0.18)
    })
  })

  return (
    <group ref={ref}>
      {[-1.5, -0.5, 0.5, 1.5].map((offset, index) => (
        <mesh key={index} ref={(el) => { if (el) screenRefs.current[index] = el }} position={[offset * 0.16, 0, 0]}>
          <boxGeometry args={[0.18, 0.28, 0.04]} />
          <meshStandardMaterial color={index % 2 === 0 ? palette.base : palette.accent} metalness={0.7} roughness={0.2} emissive={palette.glow} emissiveIntensity={dark ? 0.11 : 0.04} />
        </mesh>
      ))}
      {[0, 1, 2].map((_, index) => (
        <mesh key={`dot-${index}`} ref={(el) => { if (el) dotRefs.current[index] = el }}>
          <sphereGeometry args={[0.05, 20, 20]} />
          <meshStandardMaterial color="#ffffff" emissive={palette.accent} emissiveIntensity={dark ? 1.1 : 0.5} />
        </mesh>
      ))}
    </group>
  )
}

function BridgeObject({ dark, reduced }: SceneProps) {
  const ref = useRef<THREE.Group>(null!)
  const nodesRef = useRef<THREE.Mesh[]>([])
  const beamRef = useRef<THREE.Mesh>(null!)
  const palette = paletteFor('collaboration', dark)
  const nodePositions = useMemo<[number, number, number][]>(() => [
    [-0.34, -0.16, -0.12],
    [0.34, -0.16, -0.12],
    [-0.12, 0.22, 0.12],
    [0.16, 0.2, 0.16],
  ], [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * (reduced ? 0.24 : 0.72)
    ref.current.rotation.y += delta * 0.14
    if (beamRef.current) {
      beamRef.current.rotation.z = Math.sin(t * 0.8) * 0.1
      beamRef.current.position.y = 0.05 + Math.sin(t * 1.3) * 0.04
    }
    nodesRef.current.forEach((node, index) => {
      if (!node) return
      const [x, y, z] = nodePositions[index]
      node.position.set(x, y + Math.sin(t * 1.1 + index) * 0.04, z)
    })
  })

  const links = useMemo(() => [
    { pos: [-0.22, -0.02, -0.1], rot: [0, 0, -0.52], len: 0.42 },
    { pos: [0.24, -0.02, -0.1], rot: [0, 0, 0.44], len: 0.42 },
    { pos: [0.02, 0.2, 0.12], rot: [0.18, 0.22, 0.2], len: 0.28 },
  ], [])

  return (
    <group ref={ref}>
      {links.map((link, index) => (
        <mesh key={index} position={link.pos as [number, number, number]} rotation={link.rot as [number, number, number]}>
          <cylinderGeometry args={[0.024, 0.024, link.len, 12]} />
          <meshStandardMaterial color={palette.base} metalness={0.82} roughness={0.16} />
        </mesh>
      ))}
      <mesh ref={beamRef} position={[0, 0.05, 0.08]}>
        <boxGeometry args={[0.46, 0.07, 0.12]} />
        <meshStandardMaterial color={palette.accent} metalness={0.72} roughness={0.18} emissive={palette.glow} emissiveIntensity={dark ? 0.12 : 0.04} />
      </mesh>
      {nodePositions.map((pos, index) => (
        <mesh key={index} ref={(el) => { if (el) nodesRef.current[index] = el }} position={pos}>
          <sphereGeometry args={[0.08, 22, 22]} />
          <meshStandardMaterial color="#f8fbff" metalness={0.26} roughness={0.18} emissive={palette.accent} emissiveIntensity={dark ? 0.8 : 0.35} />
        </mesh>
      ))}
    </group>
  )
}

function PivotObject({ dark, reduced }: SceneProps) {
  const ref = useRef<THREE.Group>(null!)
  const bladeRefs = useRef<THREE.Mesh[]>([])
  const palette = paletteFor('adaptability', dark)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * (reduced ? 0.18 : 0.68)
    ref.current.rotation.y += delta * 0.12
    bladeRefs.current.forEach((blade, index) => {
      if (!blade) return
      blade.rotation.z = Math.sin(t * 0.9 + index * 0.7) * 0.55
      blade.rotation.x = Math.cos(t * 0.6 + index) * 0.22
      blade.position.y = (index - 2) * 0.14 + Math.sin(t * 1.2 + index) * 0.03
    })
  })

  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
        <meshStandardMaterial color={palette.base} metalness={0.76} roughness={0.2} />
      </mesh>
      {[-2, -1, 0, 1, 2].map((y, index) => (
        <mesh key={index} ref={(el) => { if (el) bladeRefs.current[index] = el }} position={[0, y * 0.14, 0]} rotation={[0, 0, index % 2 === 0 ? 0.4 : -0.4]}>
          <boxGeometry args={[0.45, 0.05, 0.13]} />
          <meshStandardMaterial color={index % 2 === 0 ? palette.accent : palette.base} metalness={0.72} roughness={0.18} emissive={palette.glow} emissiveIntensity={dark ? 0.08 : 0.03} />
        </mesh>
      ))}
    </group>
  )
}

function TrustObject({ dark, reduced }: SceneProps) {
  const ref = useRef<THREE.Group>(null!)
  const outerRef = useRef<THREE.Mesh>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  const palette = paletteFor('ethics', dark)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * (reduced ? 0.2 : 0.62)
    ref.current.rotation.y += delta * 0.1
    if (outerRef.current) outerRef.current.rotation.x += delta * 0.2
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.26
      innerRef.current.rotation.z = Math.sin(t * 0.8) * 0.3
    }
  })

  return (
    <group ref={ref}>
      <mesh ref={outerRef}>
        <torusGeometry args={[0.44, 0.02, 20, 120]} />
        <meshStandardMaterial color={palette.base} metalness={0.82} roughness={0.14} />
      </mesh>
      <mesh ref={innerRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.018, 20, 90]} />
        <meshStandardMaterial color={palette.accent} metalness={0.86} roughness={0.12} emissive={palette.glow} emissiveIntensity={dark ? 0.09 : 0.03} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.12, 28, 28]} />
        <meshStandardMaterial color="#f7f9ff" metalness={0.22} roughness={0.16} emissive={palette.accent} emissiveIntensity={dark ? 0.62 : 0.24} />
      </mesh>
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * 0.34, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.05, 0.16, 8, 14]} />
          <meshStandardMaterial color={palette.base} metalness={0.78} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function LearningObject({ dark, reduced }: SceneProps) {
  const ref = useRef<THREE.Group>(null!)
  const discRefs = useRef<THREE.Mesh[]>([])
  const palette = paletteFor('learning', dark)
  const discs = useMemo(() => Array.from({ length: 7 }, (_, index) => index), [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * (reduced ? 0.2 : 0.68)
    ref.current.rotation.y += delta * 0.12
    discRefs.current.forEach((disc, index) => {
      if (!disc) return
      const angle = t * 0.6 + index * 0.7
      const radius = 0.12 + index * 0.048
      disc.position.set(Math.cos(angle) * radius, -0.28 + index * 0.095, Math.sin(angle) * radius)
      disc.rotation.x = Math.PI / 2
      disc.rotation.z = angle
    })
  })

  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.9, 10]} />
        <meshStandardMaterial color={palette.base} metalness={0.82} roughness={0.18} />
      </mesh>
      {discs.map((disc, index) => (
        <mesh key={disc} ref={(el) => { if (el) discRefs.current[index] = el }}>
          <cylinderGeometry args={[0.12 + index * 0.01, 0.12 + index * 0.01, 0.035, 28]} />
          <meshStandardMaterial color={index % 2 === 0 ? palette.accent : palette.base} metalness={0.74} roughness={0.18} emissive={palette.glow} emissiveIntensity={dark ? 0.07 : 0.02} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.07, 22, 22]} />
        <meshStandardMaterial color="#ffffff" emissive={palette.accent} emissiveIntensity={dark ? 1 : 0.42} />
      </mesh>
    </group>
  )
}

function BeaconObject({ dark, reduced }: SceneProps) {
  const ref = useRef<THREE.Group>(null!)
  const finRefs = useRef<THREE.Mesh[]>([])
  const ringRef = useRef<THREE.Mesh>(null!)
  const palette = paletteFor('empowerment', dark)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * (reduced ? 0.22 : 0.74)
    ref.current.rotation.y += delta * 0.16
    if (ringRef.current) ringRef.current.scale.setScalar(1 + Math.sin(t * 1.1) * 0.04)
    finRefs.current.forEach((fin, index) => {
      if (!fin) return
      const dir = index - 1
      fin.rotation.y = dir * 0.82 + Math.sin(t * 0.8 + index) * 0.08
      fin.position.x = dir * 0.19
      fin.position.y = Math.sin(t * 1.2 + index) * 0.04
    })
  })

  return (
    <group ref={ref}>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.3, 0.03, 24, 110]} />
        <meshStandardMaterial color={palette.accent} metalness={0.84} roughness={0.14} emissive={palette.glow} emissiveIntensity={dark ? 0.16 : 0.05} />
      </mesh>
      {[-1, 0, 1].map((dir, index) => (
        <mesh key={dir} ref={(el) => { if (el) finRefs.current[index] = el }} position={[dir * 0.19, 0, 0.04]} rotation={[0, dir * 0.82, 0]}>
          <boxGeometry args={[0.12, 0.44, 0.06]} />
          <meshStandardMaterial color={index === 1 ? palette.base : palette.accent} metalness={0.76} roughness={0.18} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.1, 26, 26]} />
        <meshStandardMaterial color="#ffffff" emissive={palette.glow} emissiveIntensity={dark ? 1.2 : 0.56} />
      </mesh>
    </group>
  )
}

function TopicObjectScene({ topic, dark, reduced }: { topic: PlaybookObjectKind } & SceneProps) {
  switch (topic) {
    case 'empathy':
      return <ResonanceObject dark={dark} reduced={reduced} />
    case 'holistic-thinking':
      return <SystemsObject dark={dark} reduced={reduced} />
    case 'innovation':
      return <PrototypeObject dark={dark} reduced={reduced} />
    case 'collaboration':
      return <BridgeObject dark={dark} reduced={reduced} />
    case 'adaptability':
      return <PivotObject dark={dark} reduced={reduced} />
    case 'ethics':
      return <TrustObject dark={dark} reduced={reduced} />
    case 'learning':
      return <LearningObject dark={dark} reduced={reduced} />
    case 'empowerment':
      return <BeaconObject dark={dark} reduced={reduced} />
    default:
      return null
  }
}

export default function PlaybookTopicObject({ topic, title }: { topic: PlaybookObjectKind; title: string }) {
  const dark = useThemeMode()
  const reduced = usePrefersReduced()
  const webglOk = useWebGLAvailable()
  const performanceDegraded = usePerformanceDegraded()
  const [ref, inView] = useInView<HTMLDivElement>(0.08, '220px 0px')
  const mountScene = useDeferredMount(inView, { timeout: 1400, delayMs: 80 })
  const palette = paletteFor(topic, dark)

  return (
    <div ref={ref} className="pb-object-stage" aria-hidden="true">
      {webglOk && mountScene && !performanceDegraded ? (
      <Canvas events={safeCanvasEvents}
          camera={{ position: [0, 0, 3.5], fov: 34 }}
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: dark ? 1.12 : 1.18,
          }}
          style={{ pointerEvents: 'none' }}
        >
          <ambientLight intensity={dark ? 0.95 : 0.82} />
          <hemisphereLight intensity={dark ? 0.45 : 0.55} groundColor={dark ? '#11161f' : '#d9dde6'} color={dark ? '#d9e4ff' : '#ffffff'} />
          <directionalLight position={[4, 5, 4]} intensity={dark ? 1.25 : 1.05} color="#ffffff" />
          <pointLight position={[-3, 2, 3]} intensity={dark ? 0.9 : 0.55} color={palette.glow} />
          <TopicObjectScene topic={topic} dark={dark} reduced={reduced} />
        </Canvas>
      ) : (
        <div className="pb-object-fallback" style={{ '--pb-fallback-accent': palette.accent, '--pb-fallback-base': palette.base } as CSSProperties}>
          <span>{title}</span>
        </div>
      )}
    </div>
  )
}
import { safeCanvasEvents } from '../utils/canvasEvents';
