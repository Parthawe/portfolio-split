import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import {
  siBitcoin,
  siCircle,
  siDogecoin,
  siEthereum,
  siPolygon,
  siRipple,
  siSolana,
  siTether,
  type SimpleIcon,
} from 'simple-icons'
import { usePerformanceDegraded } from '../hooks/usePerformanceDegraded'
import { useWebGLAvailable } from '../hooks/useWebGLAvailable'

const FALLBACK_IMAGE = '/Assets/Projects/Crypto/crypto-coin-orbit-v2.webp'
// Decorative coins do not need a pointer event layer. This also avoids connecting
// listeners to a detached canvas when performance fallback replaces the scene.
const decorativeEvents = () => ({ enabled: false, priority: 1 })

type CoinVisual = {
  ticker: string
  icon: SimpleIcon
  face: string
  edge: string
  mark: string
  angle: number
  phase: number
  speed: number
  tilt: [number, number, number]
  z: number
}

const COINS: CoinVisual[] = [
  { ticker: 'BTC', icon: siBitcoin, face: '#d9aa37', edge: '#87520d', mark: '#fff1b8', angle: Math.PI / 2, phase: 0.22, speed: 0.48, tilt: [-0.08, 0.08, -0.08], z: 0.08 },
  { ticker: 'SOL', icon: siSolana, face: '#15151d', edge: '#513064', mark: '#75f2d2', angle: Math.PI / 4, phase: 0.68, speed: 0.42, tilt: [0.06, -0.12, 0.1], z: -0.08 },
  { ticker: 'USDC', icon: siCircle, face: '#e8aa98', edge: '#a85d4b', mark: '#fff3ed', angle: 0, phase: 0.38, speed: 0.52, tilt: [-0.05, 0.14, -0.04], z: 0.04 },
  { ticker: 'USDT', icon: siTether, face: '#f58b20', edge: '#a94b08', mark: '#fff0d5', angle: -Math.PI / 4, phase: 0.9, speed: 0.46, tilt: [0.08, -0.08, 0.08], z: -0.04 },
  { ticker: 'MATIC', icon: siPolygon, face: '#845bc7', edge: '#4c268c', mark: '#f2e9ff', angle: -Math.PI / 2, phase: 0.5, speed: 0.56, tilt: [-0.04, 0.12, -0.06], z: 0.09 },
  { ticker: 'XRP', icon: siRipple, face: '#91cce9', edge: '#3e79a4', mark: '#f7fdff', angle: -3 * Math.PI / 4, phase: 1.04, speed: 0.44, tilt: [0.05, -0.14, 0.06], z: -0.08 },
  { ticker: 'DOGE', icon: siDogecoin, face: '#c8dd79', edge: '#718f1f', mark: '#f8ffe1', angle: Math.PI, phase: 0.76, speed: 0.5, tilt: [-0.07, 0.1, -0.1], z: 0.02 },
  { ticker: 'ETH', icon: siEthereum, face: '#b99cda', edge: '#67488f', mark: '#fcf7ff', angle: 3 * Math.PI / 4, phase: 0.14, speed: 0.54, tilt: [0.06, -0.1, 0.04], z: -0.02 },
]

function makeMarkTexture(icon: SimpleIcon, color: string, ticker: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return null

  context.clearRect(0, 0, 256, 256)
  context.fillStyle = color
  context.strokeStyle = color
  context.shadowColor = 'rgba(20, 14, 35, 0.24)'
  context.shadowBlur = 8
  context.shadowOffsetY = 3

  if (ticker === 'USDC') {
    context.lineWidth = 11
    context.lineCap = 'round'
    context.beginPath()
    context.arc(128, 128, 77, -1.18, 1.18)
    context.stroke()
    context.beginPath()
    context.arc(128, 128, 77, Math.PI - 1.18, Math.PI + 1.18)
    context.stroke()
    context.font = '700 112px Arial, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('$', 128, 134)
  } else {
    context.save()
    context.translate(48, 48)
    context.scale(160 / 24, 160 / 24)
    context.fill(new Path2D(icon.path))
    context.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

function Coin({ coin, reducedMotion }: { coin: CoinVisual; reducedMotion: boolean }) {
  const spinner = useRef<THREE.Group>(null)
  const texture = useMemo(() => makeMarkTexture(coin.icon, coin.mark, coin.ticker), [coin.icon, coin.mark, coin.ticker])
  const radius = 0.53
  const depth = 0.16
  const orbitRadius = 1.43

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
          <cylinderGeometry args={[radius, radius, depth, 72, 1, false]} />
          <meshStandardMaterial attach="material-0" color={coin.edge} metalness={0.72} roughness={0.2} />
          <meshPhysicalMaterial attach="material-1" color={coin.face} metalness={0.22} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} sheen={0.35} sheenColor={coin.mark} />
          <meshPhysicalMaterial attach="material-2" color={coin.face} metalness={0.22} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} sheen={0.35} sheenColor={coin.mark} />
        </mesh>

        <mesh position={[0, 0, depth / 2 + 0.012]}>
          <torusGeometry args={[radius * 0.86, 0.028, 10, 72]} />
          <meshStandardMaterial color={coin.face} metalness={0.5} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0, -(depth / 2 + 0.012)]} rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[radius * 0.86, 0.028, 10, 72]} />
          <meshStandardMaterial color={coin.face} metalness={0.5} roughness={0.18} />
        </mesh>

        {texture && (
          <>
            <mesh position={[0, 0, depth / 2 + 0.018]}>
              <planeGeometry args={[radius * 1.18, radius * 1.18]} />
              <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -(depth / 2 + 0.018)]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[radius * 1.18, radius * 1.18]} />
              <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          </>
        )}
      </group>
    </group>
  )
}

function CoinRing({ reducedMotion }: { reducedMotion: boolean }) {
  const ring = useRef<THREE.Group>(null)

  useFrame(({ clock }, delta) => {
    if (!ring.current || reducedMotion) return
    ring.current.rotation.z += Math.min(delta, 0.05) * 0.035
    ring.current.position.y = Math.sin(clock.elapsedTime * 0.55) * 0.025
    ring.current.rotation.x = Math.sin(clock.elapsedTime * 0.36) * 0.018
  })

  return (
    <group ref={ring} scale={0.86}>
      {COINS.map((coin) => <Coin coin={coin} reducedMotion={reducedMotion} key={coin.ticker} />)}
    </group>
  )
}

export default function CryptoCoinOrbit3D({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const webglAvailable = useWebGLAvailable()
  const performanceDegraded = usePerformanceDegraded()

  if (!webglAvailable || performanceDegraded) {
    return <img className="crypto-coin-orbit__fallback" src={FALLBACK_IMAGE} alt="" width="1254" height="1254" />
  }

  return (
    <div className="crypto-coin-orbit__canvas" aria-hidden="true">
      <Canvas
        events={decorativeEvents}
        camera={{ position: [0, 0, 6.5], fov: 31 }}
        dpr={[1, 1.65]}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
      >
        <ambientLight intensity={0.48} />
        <directionalLight position={[4, 6, 7]} intensity={1.9} color="#fff7ef" />
        <directionalLight position={[-5, 2, 4]} intensity={1.05} color="#b9cfff" />
        <pointLight position={[0, -3, 3]} intensity={9} distance={8} color="#8f68ff" />
        <Environment files="/Assets/hdri/studio_small_03_1k.hdr" environmentIntensity={0.72} />
        <CoinRing reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
