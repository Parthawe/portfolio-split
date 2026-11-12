import { observeVisible } from '../utils/visibleActivity';
import { useState, useRef, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import {
  TrussStructure,
  PetalRose,
  MorphingScreens,
  StackedPlates,
  LensAssembly,
} from './HeroObjects3D';
import { useThemeMode } from '../hooks/useThemeMode';
import { useWebGLAvailable } from '../hooks/useWebGLAvailable';
import { usePerformanceDegraded } from '../hooks/usePerformanceDegraded';

const CATEGORY_OBJECTS: Record<string, React.FC<{ dark: boolean; hovered: boolean }>> = {
  installations: TrussStructure,
  'design-for-good': PetalRose,
  'ux-design': MorphingScreens,
  'ux-research': MorphingScreens,
  fintech: MorphingScreens,
  crypto: MorphingScreens,
  'brand-visual': StackedPlates,
  ai: LensAssembly,
  'ai-wearables': LensAssembly,
  'design-engineering': MorphingScreens,
};

// The objects are modeled at slightly different world sizes (the truss cube's
// corners reach ~0.87 units where the others stay near ~0.5), so normalize
// per slug — every object should read the same size in the same slot.
const OBJECT_SCALE: Record<string, number> = {
  installations: 0.76,
  'design-engineering': 1.12,
  'design-for-good': 1.16,
  'ux-design': 1.12,
  'ux-research': 1.12,
  fintech: 1.12,
  crypto: 1.12,
  ai: 1.08,
  'ai-wearables': 1.08,
};

interface Props {
  slug: string;
  dark?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

function CursorTracker({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onLeave = () => { mouse.current.x = 0; mouse.current.y = 0; };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [gl, mouse]);
  return null;
}

function SceneInner({ slug, dark, mouse }: { slug: string; dark: boolean; mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null!);
  const spinVel = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const smoothMouse = useRef({ x: 0, y: 0 });
  const dragCleanup = useRef<(() => void) | null>(null);

  const Component = CATEGORY_OBJECTS[slug];
  if (!Component) return null;

  // Slow continuous orbit + cursor-reactive tilt + drag momentum
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth cursor follow (lerp toward mouse position)
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.05;
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.05;

    // Continuous gentle rotation
    const baseY = delta * 0.15;
    groupRef.current.rotation.y += baseY;

    // Cursor-reactive tilt (subtle, max ±0.25 radians)
    const targetTiltX = smoothMouse.current.y * 0.25;
    const targetTiltZ = -smoothMouse.current.x * 0.12;
    groupRef.current.rotation.x += (targetTiltX + Math.sin(groupRef.current.rotation.y * 0.3) * 0.1 - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.z += (targetTiltZ - groupRef.current.rotation.z) * 0.04;

    // Apply drag momentum
    const sv = spinVel.current;
    if (Math.abs(sv.x) > 0.001 || Math.abs(sv.y) > 0.001) {
      groupRef.current.rotation.x += sv.x * delta;
      groupRef.current.rotation.y += sv.y * delta;
      sv.x *= 0.95;
      sv.y *= 0.95;
    }
  });

  // Cleanup drag listeners on unmount to prevent leaks
  useEffect(() => () => { dragCleanup.current?.() }, []);

  const handlePointerDown = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    isDragging.current = true;

    const onMove = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      spinVel.current.y += ev.movementX * 0.3;
      spinVel.current.x += ev.movementY * 0.3;
    };

    const onUp = () => {
      isDragging.current = false;
      dragCleanup.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    dragCleanup.current = onUp;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  return (
    <Float speed={0.8} floatIntensity={0.4} rotationIntensity={0.1}>
      <group
        ref={groupRef}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'grab'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }}
        onPointerDown={handlePointerDown}
      >
        {/* Invisible hit area for easier drag */}
        <mesh visible={false}>
          <sphereGeometry args={[1.2, 8, 8]} />
          <meshBasicMaterial />
        </mesh>
        <group scale={OBJECT_SCALE[slug] ?? 1}>
          <Component dark={dark} hovered={hovered} />
        </group>
      </group>
    </Float>
  );
}

export default function CategoryObject3D({ slug, dark: darkProp, size = 200, className, style }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const themeDark = useThemeMode();
  const dark = darkProp ?? themeDark;
  const mouseRef = useRef({ x: 0, y: 0 });
  const webglOk = useWebGLAvailable();
  const performanceDegraded = usePerformanceDegraded();

  useEffect(() => {
    if (!host.current) return;
    return observeVisible(host.current, setVisible);
  }, [webglOk, performanceDegraded, slug]);

  if (!CATEGORY_OBJECTS[slug]) return null;

  // No WebGL: this is a decorative accent, so collapse it gracefully
  // rather than letting R3F throw and take down the page.
  if (!webglOk || performanceDegraded) return null;

  // Hover states scale parts of the objects up to ~1.6x, and Float/drag add
  // extra travel — so the canvas draws on a larger bleed area centered on the
  // layout slot. The camera backs off by the same factor, keeping the resting
  // on-screen size identical while animation never clips at the canvas edge.
  const BLEED = 1.35

  return (
    <div
      ref={host}
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <Canvas events={safeCanvasEvents}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 3.5 * BLEED], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: size * BLEED,
          height: size * BLEED,
          transform: 'translate(-50%, -50%)',
          background: 'transparent',
          pointerEvents: 'auto',
        }}
      >
        <ambientLight intensity={dark ? 0.1 : 0.2} />
        <directionalLight position={[5, 8, 6]} intensity={dark ? 1.2 : 1} color={dark ? '#e8e8ff' : '#ffffff'} />
        <directionalLight position={[-6, 3, -4]} intensity={dark ? 0.4 : 0.35} color={dark ? '#8899cc' : '#bbc8dd'} />
        <pointLight intensity={dark ? 0.6 : 0.4} color="#ffffff" distance={15} position={[0, 4, 3]} />
        <CursorTracker mouse={mouseRef} />
        <Suspense fallback={null}>
          <Environment files="/Assets/hdri/studio_small_03_1k.hdr" environmentIntensity={dark ? 0.6 : 0.8} />
          <SceneInner slug={slug} dark={dark} mouse={mouseRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export { CATEGORY_OBJECTS };
import { safeCanvasEvents } from '../utils/canvasEvents';
