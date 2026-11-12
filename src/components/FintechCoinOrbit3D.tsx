import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { usePerformanceDegraded } from '../hooks/usePerformanceDegraded'
import { useWebGLAvailable } from '../hooks/useWebGLAvailable'

type FiatCoin = {
  code: string
  symbol: string
  face: string
  edge: string
  mark: string
  angle: number
  phase: number
  speed: number
  tilt: [number, number, number]
  z: number
}

const FIAT_COINS: FiatCoin[] = [
  { code: 'EUR', symbol: '€', face: '#e7aa22', edge: '#8a4b05', mark: '#fff0a6', angle: Math.PI / 2, phase: 0.18, speed: 0.48, tilt: [-0.07, 0.08, -0.06], z: 0.07 },
  { code: 'JPY', symbol: '¥', face: '#c9830e', edge: '#6d3702', mark: '#ffe69a', angle: Math.PI / 4, phase: 0.68, speed: 0.42, tilt: [0.06, -0.12, 0.08], z: -0.06 },
  { code: 'USD', symbol: '$', face: '#f0bd3c', edge: '#9a5908', mark: '#fff2b8', angle: 0, phase: 0.36, speed: 0.54, tilt: [-0.05, 0.14, -0.04], z: 0.04 },
  { code: 'INR', symbol: '₹', face: '#b96b08', edge: '#633102', mark: '#ffe09a', angle: -Math.PI / 4, phase: 0.88, speed: 0.46, tilt: [0.08, -0.08, 0.08], z: -0.04 },
  { code: 'GBP', symbol: '£', face: '#e1a224', edge: '#814500', mark: '#ffedaa', angle: -Math.PI / 2, phase: 0.48, speed: 0.56, tilt: [-0.04, 0.12, -0.06], z: 0.08 },
  { code: 'KRW', symbol: '₩', face: '#f2c552', edge: '#9f6711', mark: '#fff5c8', angle: -3 * Math.PI / 4, phase: 1.02, speed: 0.44, tilt: [0.05, -0.14, 0.06], z: -0.07 },
  { code: 'CHF', symbol: '₣', face: '#ce8614', edge: '#713800', mark: '#ffe6a1', angle: Math.PI, phase: 0.74, speed: 0.5, tilt: [-0.07, 0.1, -0.1], z: 0.02 },
  { code: 'TRY', symbol: '₺', face: '#e7ae35', edge: '#8b5008', mark: '#fff0b2', angle: 3 * Math.PI / 4, phase: 0.12, speed: 0.52, tilt: [0.06, -0.1, 0.04], z: -0.02 },
]

function makeSymbolTexture(symbol: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return null

  context.clearRect(0, 0, 256, 256)
  context.fillStyle = color
  context.shadowColor = 'rgba(69, 34, 0, 0.28)'
  context.shadowBlur = 8
  context.shadowOffsetY = 4
  context.font = '700 126px "Arial Unicode MS", "Noto Sans Symbols 2", Arial, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(symbol, 128, 136)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

function Coin({ coin, reducedMotion }: { coin: FiatCoin; reducedMotion: boolean }) {
  const spinner = useRef<THREE.Group>(null)
  const texture = useMemo(() => makeSymbolTexture(coin.symbol, coin.mark), [coin.symbol, coin.mark])
  const radius = 0.56
  const depth = 0.18
  const orbitRadius = 1.38

  useEffect(() => () => texture?.dispose(), [texture])

  useFrame((_, delta) => {
    if (!spinner.current || reducedMotion) return
    spinner.current.rotation.y += Math.min(delta, 0.05) * coin.speed
  })

  return (
    <group
      position={[Math.cos(coin.angle) * orbitRadius, Math.sin(coin.angle) * orbitRadius, coin.z]}
      rotation={coin.tilt}
    >
      <group ref={spinner} rotation={[0, reducedMotion ? 0.12 : coin.phase, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, depth, 80, 1, false]} />
          <meshStandardMaterial attach="material-0" color={coin.edge} metalness={0.9} roughness={0.16} />
          <meshPhysicalMaterial attach="material-1" color={coin.face} metalness={0.74} roughness={0.15} clearcoat={1} clearcoatRoughness={0.07} />
          <meshPhysicalMaterial attach="material-2" color={coin.face} metalness={0.74} roughness={0.15} clearcoat={1} clearcoatRoughness={0.07} />
        </mesh>

        <mesh position={[0, 0, depth / 2 + 0.012]}>
          <torusGeometry args={[radius * 0.86, 0.029, 10, 80]} />
          <meshStandardMaterial color={coin.mark} metalness={0.82} roughness={0.13} />
        </mesh>
        <mesh position={[0, 0, -(depth / 2 + 0.012)]} rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[radius * 0.86, 0.029, 10, 80]} />
          <meshStandardMaterial color={coin.mark} metalness={0.82} roughness={0.13} />
        </mesh>

        {texture && (
          <>
            <mesh position={[0, 0, depth / 2 + 0.019]}>
              <planeGeometry args={[radius * 1.22, radius * 1.22]} />
              <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -(depth / 2 + 0.019)]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[radius * 1.22, radius * 1.22]} />
              <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          </>
        )}
      </group>
    </group>
  )
}

function FiatRing({ reducedMotion }: { reducedMotion: boolean }) {
  const ring = useRef<THREE.Group>(null)

  useFrame(({ clock }, delta) => {
    if (!ring.current || reducedMotion) return
    ring.current.rotation.z += Math.min(delta, 0.05) * 0.03
    ring.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.026
    ring.current.rotation.x = Math.sin(clock.elapsedTime * 0.34) * 0.018
  })

  return (
    <group ref={ring} scale={0.87}>
      {FIAT_COINS.map((coin) => <Coin coin={coin} reducedMotion={reducedMotion} key={coin.code} />)}
    </group>
  )
}

function FiatFallback() {
  return (
    <div className="fintech-coin-fallback" aria-hidden="true">
      {FIAT_COINS.map((coin, index) => (
        <span
          className="fintech-coin-fallback__coin"
          style={{ '--fiat-angle': `${index * 45}deg` } as CSSProperties}
          key={coin.code}
        >
          <b>{coin.symbol}</b>
        </span>
      ))}
    </div>
  )
}

export default function FintechCoinOrbit3D({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const webglAvailable = useWebGLAvailable()
  const performanceDegraded = usePerformanceDegraded()

  if (!webglAvailable || performanceDegraded) return <FiatFallback />

  return (
    <div className="fintech-coin-orbit__canvas" aria-hidden="true">
      <Canvas events={safeCanvasEvents}
        camera={{ position: [0, 0, 6.5], fov: 31 }}
        dpr={[1, 1.65]}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <ambientLight intensity={0.42} />
        <directionalLight position={[4, 6, 7]} intensity={2.15} color="#fff1c6" />
        <directionalLight position={[-5, 2, 4]} intensity={1.15} color="#ffd58a" />
        <pointLight position={[0, -3, 3]} intensity={10} distance={8} color="#f0a51c" />
        <Environment files="/Assets/hdri/studio_small_03_1k.hdr" environmentIntensity={0.82} />
        <FiatRing reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
import { safeCanvasEvents } from '../utils/canvasEvents';
