import { useState, useRef, useEffect, useMemo, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useWebGLAvailable } from '../hooks/useWebGLAvailable'
import { usePerformanceDegraded } from '../hooks/usePerformanceDegraded'

/* ═══════════════════════════════════════════════════════════
   Spacetime Fabric — interactive gravitational well.

   Matches the physical installation: a stretched fabric
   (white grid) on a dark background with heavy dark spheres
   creating visible depressions. Clean, minimal, physical.

   Drag masses on the fabric. Watch spacetime warp.
   ═══════════════════════════════════════════════════════════ */

const GRID_SIZE = 7
const GRID_SEGS = 64
const MAX_MASSES = 3
const MASS_RADIUS = 0.22
const SOFTENING = 0.3
const MAX_WELL_DEPTH = 1.35

function computeGravityY(px: number, pz: number, masses: Mass[], excludeId?: number): number {
  let y = 0
  for (const mass of masses) {
    if (mass.id === excludeId) continue
    const dx = px - mass.x
    const dz = pz - mass.z
    const distSq = dx * dx + dz * dz
    y -= (mass.strength * 0.72) / (distSq + SOFTENING + 0.18)
  }
  return Math.max(-MAX_WELL_DEPTH, y)
}

interface Mass {
  id: number
  x: number
  z: number
  strength: number
}

// ── Deformable fabric grid ──
// Two layers: solid surface (slight opacity) + wireframe on top
// Gives the appearance of a real stretched fabric with visible grid lines

function FabricGrid({ masses }: { masses: Mass[] }) {
  const wireRef = useRef<THREE.Mesh>(null!)
  const surfaceRef = useRef<THREE.Mesh>(null!)
  const posAttr = useRef<THREE.BufferAttribute>(null!)
  const surfacePosAttr = useRef<THREE.BufferAttribute>(null!)
  const origPositions = useRef<Float32Array>(null!)

  useEffect(() => {
    if (!wireRef.current) return
    const geo = wireRef.current.geometry as THREE.PlaneGeometry
    posAttr.current = geo.attributes.position as THREE.BufferAttribute
    origPositions.current = new Float32Array(posAttr.current.array)
    // Surface shares same geometry data
    if (surfaceRef.current) {
      surfacePosAttr.current = (surfaceRef.current.geometry as THREE.PlaneGeometry).attributes.position as THREE.BufferAttribute
    }
  }, [])

  useFrame(() => {
    if (!posAttr.current || !origPositions.current) return
    const pos = posAttr.current
    const orig = origPositions.current

    for (let i = 0; i < pos.count; i++) {
      const ox = orig[i * 3]
      const oz = orig[i * 3 + 2]
      const y = computeGravityY(ox, oz, masses)
      pos.setY(i, y)
    }
    pos.needsUpdate = true

    // Copy deformation to surface mesh
    if (surfacePosAttr.current) {
      const sPos = surfacePosAttr.current
      for (let i = 0; i < sPos.count; i++) {
        sPos.setY(i, pos.getY(i))
      }
      sPos.needsUpdate = true
      surfaceRef.current.geometry.computeVertexNormals()
    }
  })

  return (
    <group>
      {/* Subtle solid surface for depth/lighting */}
      <mesh ref={surfaceRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE, GRID_SEGS, GRID_SEGS]} />
        <meshStandardMaterial
          color="#061d35"
          emissive="#041120"
          emissiveIntensity={0.18}
          transparent
          opacity={0.78}
          side={THREE.DoubleSide}
          roughness={0.72}
          metalness={0}
        />
      </mesh>
      {/* Wireframe grid on top — the "fabric" lines */}
      <mesh ref={wireRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE, GRID_SEGS, GRID_SEGS]} />
        <meshBasicMaterial
          color="#9bd8ff"
          wireframe
          transparent
          opacity={0.32}
        />
      </mesh>
    </group>
  )
}

function MassWell({ mass }: { mass: Mass }) {
  const ringRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.8 + mass.id) * 0.035
    if (ringRef.current) {
      ringRef.current.position.set(mass.x, 0.035, mass.z)
      ringRef.current.rotation.z += 0.003
      ringRef.current.scale.setScalar(pulse)
    }
    if (glowRef.current) {
      glowRef.current.position.set(mass.x, 0.02, mass.z)
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.5 + mass.id) * 0.05)
    }
  })

  return (
    <>
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.72 + mass.strength * 0.18, 64]} />
        <meshBasicMaterial color="#2196ff" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42 + mass.strength * 0.08, 0.46 + mass.strength * 0.08, 64]} />
        <meshBasicMaterial color="#73c7ff" transparent opacity={0.42} depthWrite={false} />
      </mesh>
    </>
  )
}

// ── Draggable mass sphere ──
// Dark matte sphere — like the physical black ball on the fabric

function MassSphere({ mass, masses, onDrag, onRemove }: {
  mass: Mass
  masses: Mass[]
  onDrag: (id: number, x: number, z: number) => void
  onRemove: (id: number) => void
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const dragging = useRef(false)
  const { camera, gl } = useThree()
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const rc = useMemo(() => new THREE.Raycaster(), [])
  const pt = useMemo(() => new THREE.Vector2(), [])
  const hit = useMemo(() => new THREE.Vector3(), [])
  const cleanupRef = useRef<(() => void) | null>(null)

  useFrame((state) => {
    if (!ref.current) return
    const wellY = computeGravityY(mass.x, mass.z, masses, mass.id)
    const bob = dragging.current ? 0.08 : Math.sin(state.clock.elapsedTime * 1.2 + mass.id) * 0.025
    ref.current.position.set(mass.x, wellY + MASS_RADIUS * 1.65 + bob, mass.z)
  })

  const onDown = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    dragging.current = true
    gl.domElement.style.cursor = 'grabbing'

    const move = (ev: PointerEvent) => {
      if (!dragging.current) return
      const rect = gl.domElement.getBoundingClientRect()
      pt.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1)
      rc.setFromCamera(pt, camera)
      rc.ray.intersectPlane(plane, hit)
      const half = GRID_SIZE / 2 - 0.4
      const nx = Math.max(-half, Math.min(half, hit.x))
      const nz = Math.max(-half, Math.min(half, hit.z))
      onDrag(mass.id, nx, nz)
    }
    const up = () => {
      dragging.current = false
      gl.domElement.style.cursor = ''
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      cleanupRef.current = null
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    cleanupRef.current = up
  }, [camera, gl, mass.id, onDrag, plane, rc, pt, hit])

  useEffect(() => {
    return () => { cleanupRef.current?.() }
  }, [])

  return (
    <mesh
      ref={ref}
      position={[mass.x, 0.1, mass.z]}
      onPointerDown={onDown}
      onDoubleClick={(e) => { e.stopPropagation(); onRemove(mass.id) }}
      onPointerOver={() => { gl.domElement.style.cursor = 'grab' }}
      onPointerOut={() => { if (!dragging.current) gl.domElement.style.cursor = '' }}
    >
      <sphereGeometry args={[MASS_RADIUS, 32, 32]} />
      <meshStandardMaterial
        color="#03070d"
        emissive="#071522"
        emissiveIntensity={0.45}
        roughness={0.28}
        metalness={0.55}
      />
    </mesh>
  )
}

// ── Subtle stars ──

function Stars() {
  const count = 220
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12 + 3
      arr[i * 3 + 2] = (Math.random() - 0.5) * 24
    }
    return arr
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#b6e3ff" size={0.025} transparent opacity={0.45} sizeAttenuation />
    </points>
  )
}

function HorizonGlow() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = state.clock.elapsedTime * 0.045
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <ringGeometry args={[2.75, 3.05, 128]} />
      <meshBasicMaterial color="#2da8ff" transparent opacity={0.18} depthWrite={false} />
    </mesh>
  )
}

// ── Click-to-add ──

function ClickPlane({ onAdd }: { onAdd: (x: number, z: number) => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      onClick={(e) => {
        e.stopPropagation()
        const half = GRID_SIZE / 2 - 0.6
        if (Math.abs(e.point.x) < half && Math.abs(e.point.z) < half) {
          onAdd(e.point.x, e.point.z)
        }
      }}
    >
      <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

// ── Test Particle — rolls along curved spacetime ──

const TRAIL_MAX = 50

function TestParticle({ masses }: { masses: Mass[] }) {
  const ref = useRef<THREE.Mesh>(null!)
  const vel = useRef({ x: 0, z: 0 })
  const pos = useRef({ x: 0, z: 0 })
  const trailRef = useRef<THREE.Line>(null!)
  const trailCount = useRef(0)
  const trailBuffer = useMemo(() => new Float32Array(TRAIL_MAX * 3), [])
  const trailLine = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(trailBuffer, 3))
    const mat = new THREE.LineBasicMaterial({ color: '#8edbff', transparent: true, opacity: 0.45 })
    return new THREE.Line(geo, mat)
  }, [trailBuffer])
  // Dispose geometry+material on unmount to free VRAM
  useEffect(() => () => { trailLine.geometry.dispose(); (trailLine.material as THREE.Material).dispose() }, [trailLine])
  const trailPositions = useRef<{ x: number; y: number; z: number }[]>([])
  const absorbed = useRef(false)
  const respawnTimer = useRef(0)

  const spawn = useCallback(() => {
    const side = Math.floor(Math.random() * 4)
    const half = GRID_SIZE / 2 - 0.5
    const r = (Math.random() - 0.5) * GRID_SIZE * 0.6
    let px: number, pz: number
    if (side === 0) { px = -half; pz = r }
    else if (side === 1) { px = half; pz = r }
    else if (side === 2) { px = r; pz = -half }
    else { px = r; pz = half }

    let tx = 0, tz = 0
    if (masses.length > 0) {
      tx = masses.reduce((s, m) => s + m.x, 0) / masses.length
      tz = masses.reduce((s, m) => s + m.z, 0) / masses.length
    }
    const dx = tx - px, dz = tz - pz
    const d = Math.sqrt(dx * dx + dz * dz) || 1
    const speed = 0.2 + Math.random() * 0.15
    vel.current = { x: (dx / d) * speed, z: (dz / d) * speed }

    pos.current = { x: px, z: pz }
    trailPositions.current = []
    trailCount.current = 0
    absorbed.current = false
  }, [masses])

  useEffect(() => { spawn() }, [spawn])

  useFrame((_, rawDt) => {
    if (!ref.current) return
    const dt = Math.min(rawDt, 0.05)
    const p = pos.current
    const v = vel.current

    if (absorbed.current) {
      respawnTimer.current -= dt
      if (respawnTimer.current <= 0) spawn()
      ref.current.visible = false
      return
    }
    ref.current.visible = true

    let ax = 0, az = 0
    for (const mass of masses) {
      const dx = mass.x - p.x
      const dz = mass.z - p.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < 0.35) {
        absorbed.current = true
        respawnTimer.current = 1.5
        return
      }
      const force = mass.strength / (dist * dist + 0.4)
      ax += force * dx / (dist + 0.01)
      az += force * dz / (dist + 0.01)
    }

    v.x += ax * dt * 2
    v.z += az * dt * 2
    const damp = Math.exp(-0.3 * dt * 60)
    v.x *= damp
    v.z *= damp

    const speed = Math.sqrt(v.x * v.x + v.z * v.z)
    if (speed > 2) { v.x *= 2 / speed; v.z *= 2 / speed }

    p.x += v.x * dt
    p.z += v.z * dt

    const half = GRID_SIZE / 2 - 0.2
    if (Math.abs(p.x) > half) { p.x = Math.sign(p.x) * half; v.x *= -0.5 }
    if (Math.abs(p.z) > half) { p.z = Math.sign(p.z) * half; v.z *= -0.5 }

    const y = computeGravityY(p.x, p.z, masses)
    ref.current.position.set(p.x, y + 0.05, p.z)

    const tp = trailPositions.current
    tp.push({ x: p.x, y: y + 0.05, z: p.z })
    if (tp.length > TRAIL_MAX) tp.shift()

    if (trailRef.current) {
      const geo = trailRef.current.geometry
      for (let i = 0; i < tp.length; i++) {
        trailBuffer[i * 3] = tp[i].x
        trailBuffer[i * 3 + 1] = tp[i].y
        trailBuffer[i * 3 + 2] = tp[i].z
      }
      const attr = geo.attributes.position as THREE.BufferAttribute
      attr.needsUpdate = true
      geo.setDrawRange(0, tp.length)
    }
  })

  return (
    <>
      {/* Small white particle — represents a photon/small mass */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial
          color="#dff6ff"
          emissive="#7dd3fc"
          emissiveIntensity={1.7}
        />
      </mesh>
      {/* Fading trail */}
      <primitive object={trailLine} ref={trailRef} />
    </>
  )
}

// ── Grid edge frame — thin border around the fabric ──

function GridFrame() {
  const half = GRID_SIZE / 2
  const frameLine = useMemo(() => {
    const points = [
      new THREE.Vector3(-half, 0, -half),
      new THREE.Vector3(half, 0, -half),
      new THREE.Vector3(half, 0, half),
      new THREE.Vector3(-half, 0, half),
      new THREE.Vector3(-half, 0, -half),
    ]
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    const mat = new THREE.LineBasicMaterial({ color: '#8edbff', transparent: true, opacity: 0.22 })
    return new THREE.Line(geo, mat)
  }, [half])

  useEffect(() => () => { frameLine.geometry.dispose(); (frameLine.material as THREE.Material).dispose() }, [frameLine])

  return <primitive object={frameLine} />
}

// ── Main scene ──

function GravityScene({ masses, onDrag, onRemove, onAdd }: {
  masses: Mass[]
  onDrag: (id: number, x: number, z: number) => void
  onRemove: (id: number) => void
  onAdd: (x: number, z: number) => void
}) {
  return (
    <>
      {/* Lighting: subtle, top-down, slightly warm */}
      <ambientLight intensity={0.16} />
      <directionalLight position={[0, 8, 2]} intensity={0.58} color="#dff3ff" />
      <directionalLight position={[-3, 5, -2]} intensity={0.22} color="#8edbff" />
      <pointLight position={[0, 2.2, 0]} intensity={1.4} color="#2da8ff" distance={6} />

      <Stars />

      <group>
        <HorizonGlow />
        <FabricGrid masses={masses} />
        <GridFrame />
        <ClickPlane onAdd={onAdd} />
        {masses.map(m => <MassWell key={`well-${m.id}`} mass={m} />)}
        {masses.map(m => (
          <MassSphere key={m.id} mass={m} masses={masses} onDrag={onDrag} onRemove={onRemove} />
        ))}
        <TestParticle masses={masses} />
      </group>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════

export default function SpacetimeFabricScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const webglOk = useWebGLAvailable()
  const performanceDegraded = usePerformanceDegraded()
  const [inView, setInView] = useState(false)
  const [masses, setMasses] = useState<Mass[]>([
    { id: 1, x: 0, z: 0, strength: 1.4 },
  ])
  const nextId = useRef(2)

  const handleDrag = useCallback((id: number, x: number, z: number) => {
    setMasses(prev => prev.map(m => m.id === id ? { ...m, x, z } : m))
  }, [])

  const handleRemove = useCallback((id: number) => {
    setMasses(prev => prev.length > 1 ? prev.filter(m => m.id !== id) : prev)
  }, [])

  const handleAdd = useCallback((x: number, z: number) => {
    setMasses(prev => {
      if (prev.length >= MAX_MASSES) return prev
      const id = nextId.current++
      return [...prev, { id, x, z, strength: 0.9 + Math.random() * 0.5 }]
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!webglOk) {
    return (
      <div
        style={{
          width: '100%', aspectRatio: '16 / 10',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          background: '#050508',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '2rem',
          color: 'rgba(255,255,255,0.76)', fontSize: '1rem', lineHeight: 1.6,
        }}
      >
        This interactive spacetime simulation needs WebGL, which isn’t
        available in your browser. The rest of the case study works fine.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', aspectRatio: '16 / 10',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        border: '1px solid rgba(81,174,255,0.42)',
        boxShadow: '0 20px 70px rgba(11,92,160,0.22), 0 0 0 1px rgba(255,255,255,0.04) inset',
        background: 'radial-gradient(circle at 50% 70%, #07345d 0%, #04172b 45%, #020711 100%)',
        position: 'relative',
      }}
    >
      <Canvas events={safeCanvasEvents}
        dpr={performanceDegraded ? 1 : [1, 1.5]}
        camera={{ position: [0, 4.4, 5.3], fov: 44 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'radial-gradient(circle at 50% 70%, #07345d 0%, #04172b 45%, #020711 100%)' }}
        frameloop={inView && !performanceDegraded ? 'always' : 'demand'}
      >
        <Suspense fallback={null}>
          <GravityScene
            masses={masses}
            onDrag={handleDrag}
            onRemove={handleRemove}
            onAdd={handleAdd}
          />
        </Suspense>
      </Canvas>

      {/* Hint overlay */}
      <div style={{
        position: 'absolute', top: 14, left: 14, right: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12,
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '16px',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(226,244,255,0.8)',
          padding: '7px 10px', borderRadius: '999px',
          border: '1px solid rgba(142,219,255,0.22)',
          background: 'rgba(4,18,34,0.68)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(10px)',
        }}>
          Drag masses
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '16px',
          maxWidth: 'min(100%, 26rem)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(226,244,255,0.72)',
          padding: '7px 10px', borderRadius: '999px',
          border: '1px solid rgba(142,219,255,0.18)',
          background: 'rgba(4,18,34,0.58)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
          backdropFilter: 'blur(10px)',
        }}>
          Click to add {masses.length}/{MAX_MASSES} · Double-click removes
        </span>
      </div>
    </div>
  )
}
import { safeCanvasEvents } from '../utils/canvasEvents';
