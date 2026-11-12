import { useMemo, useRef, type RefObject } from 'react'
import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function useHoverLerp(hovered: boolean, speed = 3) {
  const t = useRef(0)
  useFrame((_, delta) => {
    const target = hovered ? 1 : 0
    t.current += (target - t.current) * Math.min(delta * speed, 1)
  })
  return t
}

function useVirtualTime(ht: RefObject<number>) {
  const vt = useRef(0)
  useFrame((_, delta) => {
    vt.current += delta * (1 - ht.current)
  })
  return vt
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function seededRand(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function TrussStructure({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const ht = useHoverLerp(hovered)
  const vt = useVirtualTime(ht)
  const jointRefs = useRef<THREE.Mesh[]>([])
  const rodRefs = useRef<THREE.Mesh[]>([])

  const corners = useMemo(() => {
    const s = 0.5
    return [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
    ] as [number, number, number][]
  }, [])

  const cornerDirs = useMemo(() => corners.map(c => new THREE.Vector3(...c).normalize()), [corners])

  const rods = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3 }[] = []
    const c = corners.map(p => new THREE.Vector3(...p))
    const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
    const diags: [number, number][] = [[0, 2], [1, 3], [4, 6], [5, 7], [0, 5], [1, 4], [2, 7], [3, 6], [0, 7], [1, 6], [2, 5], [3, 4]]
    for (const [a, b] of [...edges, ...diags]) {
      result.push({ start: c[a], end: c[b] })
    }
    return result
  }, [corners])

  useFrame(() => {
    if (!ref.current) return
    const v = vt.current
    const h = ht.current
    ref.current.rotation.y = v * 0.06
    ref.current.rotation.x = Math.sin(v * 0.04) * 0.06
    ref.current.rotation.z = Math.cos(v * 0.03) * 0.04

    jointRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const base = corners[i]
      const dir = cornerDirs[i]
      const expand = h * 0.35
      mesh.position.set(base[0] + dir.x * expand, base[1] + dir.y * expand, base[2] + dir.z * expand)
      const s = mix(0.035, 0.06, h)
      mesh.scale.setScalar(s / 0.035)
      const mat = mesh.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = mix(0, 0.6, h)
    })

    rodRefs.current.forEach(mesh => {
      if (!mesh) return
      const mat = mesh.material as THREE.MeshPhysicalMaterial
      mat.opacity = mix(1, 0.15, h)
      mat.transparent = h > 0.01
    })
  })

  const rodTransforms = useMemo(() => rods.map((rod, i) => ({
    mid: new THREE.Vector3().addVectors(rod.start, rod.end).multiplyScalar(0.5),
    len: rod.start.distanceTo(rod.end),
    quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(rod.end, rod.start).normalize()),
    isEdge: i < 12,
  })), [rods])

  return (
    <Float speed={0.7} floatIntensity={0.5} rotationIntensity={0.15}>
      <group rotation={[0.4, 0.3, 0.15]} ref={ref}>
        {rodTransforms.map((rt, i) => (
          <mesh key={i} position={rt.mid} quaternion={rt.quat} ref={(el) => { if (el) rodRefs.current[i] = el }}>
            <cylinderGeometry args={[rt.isEdge ? 0.02 : 0.009, rt.isEdge ? 0.02 : 0.009, rt.len, 6]} />
            <meshPhysicalMaterial
              color={rt.isEdge ? (dark ? '#e0e0e8' : '#c0c0c8') : (dark ? '#a0a0a8' : '#b0b0b8')}
              metalness={0.85}
              roughness={rt.isEdge ? 0.05 : 0.12}
              clearcoat={1}
              clearcoatRoughness={0.03}
              envMapIntensity={dark ? 2.5 : 3}
              reflectivity={1}
              transmission={rt.isEdge ? 0 : 0.3}
              transparent={!rt.isEdge}
              opacity={rt.isEdge ? 1 : 0.7}
            />
          </mesh>
        ))}
        {corners.map((p, i) => (
          <mesh key={`j${i}`} position={p} ref={(el) => { if (el) jointRefs.current[i] = el }}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshPhysicalMaterial
              color={dark ? '#f0f0f8' : '#e0e0e8'}
              metalness={0.6}
              roughness={0.02}
              clearcoat={1}
              clearcoatRoughness={0.01}
              envMapIntensity={dark ? 3 : 3.5}
              reflectivity={1}
              transmission={0.4}
              transparent
              opacity={0.9}
              ior={1.8}
              emissive={dark ? '#8899cc' : '#6677aa'}
              emissiveIntensity={0}
            />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

export function PetalRose({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const shellRef = useRef<THREE.Mesh>(null!)
  const knotRef = useRef<THREE.Mesh>(null!)
  const coreRef = useRef<THREE.Mesh>(null!)
  const ht = useHoverLerp(hovered)
  const vt = useVirtualTime(ht)

  useFrame(() => {
    if (!ref.current) return
    const v = vt.current
    const h = ht.current
    ref.current.rotation.y = v * 0.07
    ref.current.rotation.x = Math.sin(v * 0.03) * 0.05
    ref.current.rotation.z = Math.cos(v * 0.025) * 0.03
    if (knotRef.current) {
      knotRef.current.scale.set(mix(1, 1.3, h), mix(1, 0.3, h), mix(1, 1.3, h))
    }
    if (shellRef.current) {
      const s = mix(1, 1.5, h) + Math.sin(v * 0.5) * 0.04
      shellRef.current.scale.set(s, s, s)
      const mat = shellRef.current.material as THREE.MeshPhysicalMaterial
      mat.opacity = mix(0.08, 0.25, h)
      mat.ior = mix(1.3, 2.2, h)
    }
    if (coreRef.current) {
      const s = mix(1, 1.8, h)
      coreRef.current.scale.setScalar(s)
      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = mix(dark ? 0.8 : 0.4, dark ? 1.4 : 1.0, h)
    }
  })

  return (
    <Float speed={0.6} floatIntensity={0.4} rotationIntensity={0.12}>
      <group ref={ref}>
        <mesh ref={knotRef}>
          <torusKnotGeometry args={[0.3, 0.065, 200, 32, 2, 3]} />
          <meshPhysicalMaterial
            color={dark ? '#e0e0f0' : '#c8c8d8'}
            metalness={1}
            roughness={0.03}
            clearcoat={1}
            clearcoatRoughness={0.02}
            envMapIntensity={dark ? 3 : 3.5}
            reflectivity={1}
          />
        </mesh>
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.48, 64, 64]} />
          <meshPhysicalMaterial
            color={dark ? '#d8e0f0' : '#e0e8f8'}
            metalness={0}
            roughness={0.02}
            transmission={0.92}
            transparent
            opacity={0.12}
            ior={1.5}
            thickness={1.2}
            envMapIntensity={dark ? 2 : 2.5}
            specularIntensity={2}
            specularColor={dark ? '#ddeeff' : '#bbccee'}
          />
        </mesh>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshPhysicalMaterial
            color="#ffffff"
            emissive={dark ? '#8899cc' : '#6677aa'}
            emissiveIntensity={dark ? 0.8 : 0.4}
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>
      </group>
    </Float>
  )
}

function cubeGradientColor(x: number, z: number, radius: number) {
  const angle = (Math.atan2(z, x) + Math.PI) / (Math.PI * 2)
  const d = Math.min(1, Math.sqrt(x * x + z * z) / radius)
  const coreMix = Math.max(0, 1 - d * 1.8)

  let er: number
  let eg: number
  let eb: number
  if (angle < 0.2) {
    const t = angle / 0.2
    er = mix(220, 200, t); eg = mix(40, 60, t); eb = mix(160, 220, t)
  } else if (angle < 0.4) {
    const t = (angle - 0.2) / 0.2
    er = mix(200, 50, t); eg = mix(60, 40, t); eb = mix(220, 230, t)
  } else if (angle < 0.6) {
    const t = (angle - 0.4) / 0.2
    er = mix(50, 30, t); eg = mix(40, 200, t); eb = mix(230, 180, t)
  } else if (angle < 0.8) {
    const t = (angle - 0.6) / 0.2
    er = mix(30, 230, t); eg = mix(200, 140, t); eb = mix(180, 50, t)
  } else {
    const t = (angle - 0.8) / 0.2
    er = mix(230, 220, t); eg = mix(140, 40, t); eb = mix(50, 160, t)
  }

  const r = Math.round(mix(25, er, 1 - coreMix))
  const g = Math.round(mix(25, eg, 1 - coreMix))
  const b = Math.round(mix(180, eb, 1 - coreMix))

  return `rgb(${r},${g},${b})`
}

export function MorphingScreens({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const ht = useHoverLerp(hovered)
  const vt = useVirtualTime(ht)

  const ringRef = useRef<THREE.Mesh>(null!)
  const shellRef = useRef<THREE.Mesh>(null!)
  const coreRef = useRef<THREE.Mesh>(null!)
  const crossRef = useRef<THREE.Group>(null!)
  const nodeRefs = useRef<THREE.Mesh[]>([])
  const pixelRefs = useRef<THREE.Mesh[]>([])

  const pixelData = useMemo(() => {
    const cubeSize = 0.04
    const gap = 0.003
    const step = cubeSize + gap
    const data: { solidPos: [number, number, number]; scatterPos: [number, number, number]; color: string; delay: number }[] = []
    const discs = [
      { y: -0.08, radius: 0.28 },
      { y: 0.0, radius: 0.35 },
      { y: 0.08, radius: 0.22 },
    ]

    for (const disc of discs) {
      const gridR = Math.ceil(disc.radius / step)
      for (let gx = -gridR; gx <= gridR; gx++) {
        for (let gz = -gridR; gz <= gridR; gz++) {
          const x = gx * step
          const z = gz * step
          if (Math.sqrt(x * x + z * z) > disc.radius - cubeSize * 0.5) continue

          const idx = data.length
          const angle = Math.atan2(z, x)
          const d = Math.sqrt(x * x + z * z)
          const r1 = seededRand(idx * 17 + 3)
          const r2 = seededRand(idx * 31 + 7)
          const r3 = seededRand(idx * 47 + 11)
          const scatter = 0.4 + r1 * 0.6

          data.push({
            solidPos: [x, disc.y, z],
            scatterPos: [
              x + Math.cos(angle + r2 * 2) * scatter,
              disc.y + (r3 - 0.5) * 0.8,
              z + Math.sin(angle + r2 * 2) * scatter,
            ],
            color: cubeGradientColor(x, z, disc.radius),
            delay: d / disc.radius,
          })
        }
      }
    }
    return data
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const v = vt.current
    const h = ht.current
    ref.current.rotation.y = v * 0.06
    ref.current.rotation.x = Math.sin(v * 0.035) * 0.06
    ref.current.rotation.z = Math.cos(v * 0.03) * 0.03

    pixelRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const pd = pixelData[i]
      const raw = Math.min(1, Math.max(0, h * 2.5 - pd.delay * 0.8))
      const eased = 1 - Math.pow(1 - raw, 3)

      mesh.position.set(
        mix(pd.solidPos[0], pd.scatterPos[0], eased),
        mix(pd.solidPos[1], pd.scatterPos[1], eased),
        mix(pd.solidPos[2], pd.scatterPos[2], eased),
      )

      if (h < 0.1) {
        const wave = Math.sin(v * 1.5 + pd.solidPos[0] * 8 + pd.solidPos[2] * 8) * 0.008
        mesh.position.y += wave
      }

      const spinSpeed = seededRand(i * 7) * 0.3 + 0.1
      mesh.rotation.x = eased * v * spinSpeed
      mesh.rotation.z = eased * v * spinSpeed * 0.7
      mesh.scale.setScalar(1 + eased * 0.3)
      const mat = mesh.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = eased * (dark ? 0.6 : 0.35)
    })

    if (ringRef.current) {
      ringRef.current.rotation.x = 0.8 + v * mix(0.1, 0.25, h)
      ringRef.current.rotation.z = 0.5 + v * mix(0.07, 0.15, h)
      ringRef.current.scale.setScalar(mix(1, 1.5, h))
    }
    nodeRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const angle = (i / 4) * Math.PI * 2 + 0.4 + v * mix(0.04, 0.1, h)
      const r = mix(0.32, 0.5, h)
      mesh.position.set(Math.cos(angle) * r, Math.sin(v * 0.3 + i) * h * 0.1, Math.sin(angle) * r)
      mesh.scale.setScalar(mix(1, 1.3, h))
    })
    if (shellRef.current) {
      const breathe = 1 + Math.sin(v * 0.8) * 0.02
      shellRef.current.scale.setScalar(mix(breathe, 1.4, h))
      const mat = shellRef.current.material as THREE.MeshPhysicalMaterial
      mat.opacity = mix(0.06, 0.15, h)
    }
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial
      const pulse = 1 + Math.sin(v * 2) * 0.15 * h
      mat.emissiveIntensity = mix(dark ? 0.8 : 0.4, dark ? 2 : 1.2, h) * pulse
      coreRef.current.scale.setScalar(mix(1, 1.6, h))
    }
    if (crossRef.current) {
      crossRef.current.rotation.y = -v * mix(0.04, 0.12, h)
      crossRef.current.scale.setScalar(mix(1, 1.15, h))
    }
  })

  const iriChrome = { metalness: 1, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: dark ? 4 : 5, reflectivity: 1, iridescence: 0.8, iridescenceIOR: 1.6 }

  return (
    <Float speed={0.6} floatIntensity={0.4} rotationIntensity={0.12}>
      <group ref={ref}>
        {pixelData.map((pd, i) => (
          <mesh key={`px${i}`} ref={(el) => { if (el) pixelRefs.current[i] = el }} position={pd.solidPos}>
            <boxGeometry args={[0.038, 0.015, 0.038]} />
            <meshPhysicalMaterial
              color={pd.color}
              metalness={1}
              roughness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.02}
              envMapIntensity={dark ? 4 : 5}
              reflectivity={1}
              specularIntensity={2}
              specularColor={dark ? '#aa88ff' : '#8866ee'}
              iridescence={1}
              iridescenceIOR={1.8}
              emissive={dark ? '#3344aa' : '#2233aa'}
              emissiveIntensity={0}
            />
          </mesh>
        ))}
        <group ref={crossRef}>
          <mesh><cylinderGeometry args={[0.012, 0.012, 0.55, 8]} /><meshPhysicalMaterial color={dark ? '#5060b0' : '#4050a0'} {...iriChrome} /></mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.008, 0.008, 0.4, 8]} /><meshPhysicalMaterial color={dark ? '#4050a0' : '#304090'} {...iriChrome} /></mesh>
        </group>
        <mesh ref={ringRef}><torusGeometry args={[0.42, 0.014, 16, 64]} /><meshPhysicalMaterial color={dark ? '#6070c0' : '#5060b0'} {...iriChrome} iridescence={1} /></mesh>
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.46, 48, 48]} />
          <meshPhysicalMaterial color={dark ? '#4060c0' : '#5070d0'} metalness={0} roughness={0} transmission={0.94} transparent opacity={0.06} ior={1.5} thickness={1.0} envMapIntensity={dark ? 2 : 2.5} specularIntensity={2} specularColor={dark ? '#aabbff' : '#8899ee'} />
        </mesh>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshPhysicalMaterial color="#ffffff" emissive={dark ? '#4466dd' : '#3355cc'} emissiveIntensity={dark ? 0.8 : 0.4} metalness={0.3} roughness={0.1} />
        </mesh>
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2 + 0.4
          return (
            <mesh key={`node${i}`} ref={(el) => { if (el) nodeRefs.current[i] = el }} position={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}>
              <sphereGeometry args={[0.025, 12, 12]} />
              <meshPhysicalMaterial color={dark ? '#5568cc' : '#4458bb'} {...iriChrome} iridescence={1} emissive={dark ? '#3350aa' : '#2240aa'} emissiveIntensity={0.15} />
            </mesh>
          )
        })}
      </group>
    </Float>
  )
}

export function StackedPlates({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  const cubeRef = useRef<THREE.Mesh>(null!)
  const discRef = useRef<THREE.Mesh>(null!)
  const slabRef = useRef<THREE.Mesh>(null!)
  const sphereRef = useRef<THREE.Mesh>(null!)
  const coneRef = useRef<THREE.Mesh>(null!)
  const ht = useHoverLerp(hovered)
  const vt = useVirtualTime(ht)

  useFrame(() => {
    if (!ref.current) return
    const v = vt.current
    const h = ht.current
    ref.current.rotation.y = v * 0.05
    ref.current.rotation.x = Math.sin(v * 0.03) * 0.06
    ref.current.rotation.z = Math.cos(v * 0.035) * 0.04
    if (ringRef.current) {
      ringRef.current.rotation.x = v * 0.1
      ringRef.current.rotation.z = v * 0.12
      const rs = mix(1, 1.4, h)
      ringRef.current.scale.set(rs, rs, rs)
    }
    if (cubeRef.current) {
      cubeRef.current.rotation.x = v * 0.08
      cubeRef.current.rotation.y = v * 0.1
      cubeRef.current.position.set(mix(-0.2, -0.35, h), mix(0.22, 0.3, h), mix(-0.08, -0.2, h))
    }
    if (discRef.current) {
      discRef.current.rotation.x = mix(0, 0.5, h)
      discRef.current.position.y = mix(0, 0.15, h)
    }
    if (slabRef.current) {
      slabRef.current.position.set(mix(-0.12, -0.3, h), mix(-0.06, -0.2, h), mix(0.08, 0.25, h))
    }
    if (sphereRef.current) {
      const mat = sphereRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = mix(0, dark ? 1.5 : 1, h)
      sphereRef.current.position.set(mix(0.17, 0.28, h), mix(0.12, 0.25, h), mix(0.06, 0.15, h))
    }
    if (coneRef.current) {
      coneRef.current.position.y = mix(0.38, 0.55, h)
    }
  })

  const chrome = {
    metalness: 1,
    roughness: 0.03,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: dark ? 2.5 : 3,
    reflectivity: 1,
  }

  const darkChrome = {
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: dark ? 2 : 2.5,
    reflectivity: 1,
  }

  return (
    <Float speed={0.5} floatIntensity={0.35} rotationIntensity={0.12}>
      <group ref={ref}>
        <mesh>
          <cylinderGeometry args={[0.055, 0.055, 0.65, 32]} />
          <meshPhysicalMaterial color={dark ? '#d0d0d8' : '#b8b8c0'} {...chrome} />
        </mesh>
        <mesh ref={discRef} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.018, 48]} />
          <meshPhysicalMaterial color={dark ? '#404048' : '#606068'} {...darkChrome} />
        </mesh>
        <mesh ref={ringRef} position={[0, 0.05, 0]}>
          <torusGeometry args={[0.38, 0.016, 16, 64]} />
          <meshPhysicalMaterial color={dark ? '#e0e0f0' : '#d0d0e0'} {...chrome} />
        </mesh>
        <mesh ref={sphereRef} position={[0.17, 0.12, 0.06]}>
          <sphereGeometry args={[0.1, 48, 48]} />
          <meshPhysicalMaterial
            color={dark ? '#c8d8f0' : '#d0e0ff'}
            metalness={0}
            roughness={0}
            transmission={0.97}
            transparent
            opacity={0.1}
            ior={2.0}
            thickness={0.8}
            envMapIntensity={dark ? 1.5 : 1.8}
            specularIntensity={1.5}
            specularColor="#ffffff"
            clearcoat={0.5}
            clearcoatRoughness={0.02}
            emissive={dark ? '#6688bb' : '#4466aa'}
            emissiveIntensity={0}
          />
        </mesh>
        <mesh ref={slabRef} position={[-0.12, -0.06, 0.08]} rotation={[0.15, 0.35, 0.55]}>
          <boxGeometry args={[0.24, 0.34, 0.012]} />
          <meshPhysicalMaterial color={dark ? '#555565' : '#808090'} {...darkChrome} />
        </mesh>
        <mesh ref={cubeRef} position={[-0.2, 0.22, -0.08]}>
          <boxGeometry args={[0.075, 0.075, 0.075]} />
          <meshPhysicalMaterial color={dark ? '#e8e8f0' : '#d0d0d8'} {...chrome} />
        </mesh>
        <mesh ref={coneRef} position={[0, 0.38, 0]}>
          <coneGeometry args={[0.04, 0.09, 24]} />
          <meshPhysicalMaterial color={dark ? '#2a2a34' : '#505058'} {...darkChrome} />
        </mesh>
      </group>
    </Float>
  )
}

export function LensAssembly({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const apertureRef = useRef<THREE.Group>(null!)
  const frontLensRef = useRef<THREE.Mesh>(null!)
  const rearLensRef = useRef<THREE.Mesh>(null!)
  const frontBezelRef = useRef<THREE.Mesh>(null!)
  const rearRingRef = useRef<THREE.Mesh>(null!)
  const centerRef = useRef<THREE.Mesh>(null!)
  const ht = useHoverLerp(hovered)
  const vt = useVirtualTime(ht)

  useFrame(() => {
    if (!ref.current) return
    const v = vt.current
    const h = ht.current
    ref.current.rotation.y = v * 0.05
    ref.current.rotation.x = Math.sin(v * 0.03) * 0.08
    ref.current.rotation.z = Math.cos(v * 0.025) * 0.04
    if (apertureRef.current) {
      const base = 0.9 + Math.sin(v * 0.4) * 0.15
      const scale = mix(base, 1.8, h)
      apertureRef.current.scale.set(scale, scale, 1)
    }
    if (frontLensRef.current) frontLensRef.current.position.z = mix(0.08, 0.25, h)
    if (rearLensRef.current) rearLensRef.current.position.z = mix(-0.06, -0.25, h)
    if (frontBezelRef.current) frontBezelRef.current.position.z = mix(0.14, 0.35, h)
    if (rearRingRef.current) rearRingRef.current.position.z = mix(-0.14, -0.35, h)
    if (centerRef.current) {
      const mat = centerRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = mix(dark ? 1 : 0.5, dark ? 1.8 : 1.2, h)
      centerRef.current.scale.setScalar(mix(1, 1.5, h))
    }
  })

  const chrome = {
    metalness: 1,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: dark ? 2.5 : 3,
    reflectivity: 1,
  }

  return (
    <Float speed={0.5} floatIntensity={0.3} rotationIntensity={0.1}>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.46, 0.28, 48, 1, true]} />
          <meshPhysicalMaterial color={dark ? '#d0d0d8' : '#b8b8c0'} {...chrome} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={frontBezelRef} position={[0, 0, 0.14]}>
          <torusGeometry args={[0.48, 0.035, 24, 64]} />
          <meshPhysicalMaterial color={dark ? '#e0e0e8' : '#d0d0d8'} {...chrome} />
        </mesh>
        <mesh ref={rearRingRef} position={[0, 0, -0.14]}>
          <torusGeometry args={[0.44, 0.025, 20, 64]} />
          <meshPhysicalMaterial color={dark ? '#3a3a44' : '#606068'} metalness={0.95} roughness={0.1} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={dark ? 2 : 2.5} />
        </mesh>
        <mesh ref={frontLensRef} position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.32, 48, 48, 0, Math.PI * 2, 0, Math.PI / 3.5]} />
          <meshPhysicalMaterial color={dark ? '#80a0d0' : '#90b0e0'} metalness={0} roughness={0} transmission={0.96} transparent opacity={0.08} ior={2.2} thickness={1.0} envMapIntensity={dark ? 1.5 : 2} specularIntensity={1.5} specularColor={dark ? '#ccddff' : '#aabbdd'} />
        </mesh>
        <mesh ref={rearLensRef} position={[0, 0, -0.06]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.24, 32, 32, 0, Math.PI * 2, 0, Math.PI / 4]} />
          <meshPhysicalMaterial color={dark ? '#8899cc' : '#99aadd'} metalness={0} roughness={0} transmission={0.95} transparent opacity={0.06} ior={1.9} thickness={0.7} specularIntensity={1.2} specularColor={dark ? '#bbccee' : '#99aacc'} />
        </mesh>
        <group ref={apertureRef}>
          {Array.from({ length: 9 }, (_, i) => {
            const angle = (i / 9) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, 0]} rotation={[0, 0, angle + 0.35]}>
                <boxGeometry args={[0.1, 0.025, 0.004]} />
                <meshPhysicalMaterial color={dark ? '#2a2a32' : '#484850'} metalness={0.9} roughness={0.15} clearcoat={0.8} clearcoatRoughness={0.1} envMapIntensity={dark ? 1.5 : 2} />
              </mesh>
            )
          })}
        </group>
        <mesh ref={centerRef} position={[0, 0, 0.01]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshPhysicalMaterial color="#ffffff" emissive={dark ? '#aaccff' : '#6688bb'} emissiveIntensity={dark ? 1 : 0.5} metalness={0.3} roughness={0.05} />
        </mesh>
        {[-0.04, 0.04].map((z, i) => (
          <mesh key={`gr${i}`} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.505, 0.006, 8, 48]} />
            <meshPhysicalMaterial color={dark ? '#888890' : '#707078'} metalness={0.9} roughness={0.2} clearcoat={0.5} envMapIntensity={dark ? 1.5 : 2} />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

export function GlassCrystal({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  const orbitRef = useRef<THREE.Group>(null!)
  const shellRef = useRef<THREE.Mesh>(null!)
  const wireRef = useRef<THREE.LineSegments>(null!)
  const coreRef = useRef<THREE.Mesh>(null!)
  const ht = useHoverLerp(hovered)
  const vt = useVirtualTime(ht)
  const innerTime = useRef(0)

  const outerEdges = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.55, 1)
    return new THREE.EdgesGeometry(geo)
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    const v = vt.current
    const h = ht.current
    innerTime.current += delta * mix(0.5, 1, h)
    ref.current.rotation.y = v * 0.06
    ref.current.rotation.x = Math.sin(v * 0.035) * 0.05
    ref.current.rotation.z = Math.cos(v * 0.03) * 0.04
    const it = innerTime.current
    if (innerRef.current) {
      innerRef.current.rotation.x = -it * 0.08
      innerRef.current.rotation.y = it * 0.1
      innerRef.current.rotation.z = Math.cos(it * 0.06) * 0.05
      innerRef.current.scale.setScalar(mix(1, 1.6, h))
      const mat = innerRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = mix(0, dark ? 0.8 : 0.5, h)
    }
    if (wireRef.current) {
      wireRef.current.scale.setScalar(mix(1, 1.4, h))
      const mat = wireRef.current.material as THREE.LineBasicMaterial
      mat.opacity = mix(dark ? 0.35 : 0.3, dark ? 0.6 : 0.5, h)
    }
    if (shellRef.current) {
      shellRef.current.scale.setScalar(mix(1, 1.4, h))
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.y = v * 0.1
      orbitRef.current.rotation.x = Math.sin(v * 0.06) * 0.15
      orbitRef.current.scale.setScalar(mix(1, 1.35, h))
    }
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = mix(dark ? 0.8 : 0.4, dark ? 1.6 : 1.2, h)
      coreRef.current.scale.setScalar(mix(1, 1.4, h))
    }
  })

  return (
    <Float speed={0.8} floatIntensity={0.45} rotationIntensity={0.15}>
      <group ref={ref}>
        <lineSegments ref={wireRef} geometry={outerEdges}>
          <lineBasicMaterial color={dark ? '#b8c8e0' : '#8899aa'} transparent opacity={dark ? 0.5 : 0.4} />
        </lineSegments>
        <mesh ref={shellRef}>
          <icosahedronGeometry args={[0.53, 1]} />
          <meshPhysicalMaterial color={dark ? '#c0d0e8' : '#d0ddf0'} metalness={0} roughness={0} transmission={0.96} transparent opacity={0.08} ior={1.4} thickness={0.6} envMapIntensity={dark ? 1.0 : 1.2} specularIntensity={1.2} specularColor={dark ? '#ccddff' : '#aabbdd'} />
        </mesh>
        <mesh ref={innerRef}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshPhysicalMaterial color={dark ? '#d0d0e0' : '#b8b8c8'} metalness={1} roughness={0.02} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={dark ? 3 : 3.5} reflectivity={1} emissive={dark ? '#6688bb' : '#4466aa'} emissiveIntensity={0} />
        </mesh>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshPhysicalMaterial color="#ffffff" emissive={dark ? '#99bbff' : '#6688bb'} emissiveIntensity={dark ? 0.8 : 0.4} metalness={0.2} roughness={0.05} clearcoat={1} />
        </mesh>
        <group ref={orbitRef}>
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const r = 0.4
            return (
              <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle * 0.7) * 0.12, Math.sin(angle) * r]}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshPhysicalMaterial color={dark ? '#e0e0f0' : '#d0d0e0'} metalness={1} roughness={0.02} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={dark ? 3 : 3.5} reflectivity={1} />
              </mesh>
            )
          })}
        </group>
      </group>
    </Float>
  )
}
