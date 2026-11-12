import { addInstanceEmissive, updateMorphingPixels } from '../utils/morphingPixelInstances';
import { prepareSceneShaders } from '../utils/prepareSceneShaders';
import { getHeroEnvironmentURL } from '../data/heroAssets';
import { HeroEnvironmentLoader } from '../utils/HeroEnvironmentLoader';
import { createSceneActivity } from '../utils/sceneActivity';
import { useRef, useMemo, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeMode } from '../hooks/useThemeMode';
import { usePrefersReduced } from '../hooks/usePrefersReduced';
import { useWebGLAvailable } from '../hooks/useWebGLAvailable';
import { usePerformanceDegraded } from '../hooks/usePerformanceDegraded';
import { layoutHeroWeb, type WebNode, type WebEdge } from '../data/heroWeb';
import SuperwhiteHighlight from './SuperwhiteHighlight';

/* ─── Node config ─── */

interface NodeConfig {
  position: [number, number, number];
  label: string;
  labelOffset: [number, number, number];
  route: string;
}

const NODES: NodeConfig[] = [
  { position: [0, 1.9, 0], label: 'Installations', labelOffset: [0, 1.16, 0.1], route: '/installations' },
  { position: [2.05, 0.6, -0.2], label: 'Design for Good', labelOffset: [0.45, 1.08, 0.12], route: '/design-for-good' },
  { position: [0, 0.15, 0.3], label: 'Product Design', labelOffset: [0, -1.12, 0.12], route: '/ux-design' },
  { position: [-2.15, 0.1, 0.3], label: 'Brand & Visual', labelOffset: [-0.36, -0.92, 0.12], route: '/brand-visual' },
  { position: [-1.3, -1.6, 0.3], label: 'AI & Wearables', labelOffset: [-0.34, -0.66, 0.12], route: '/ai' },
  { position: [1.55, -1.4, 0.2], label: 'Design Engineering', labelOffset: [0.36, -1.06, 0.12], route: '/design-engineering' },
];

const SAFE_DESKTOP_NODES: NodeConfig[] = [
  { position: [0.05, 1.78, 0], label: 'Installations', labelOffset: [0.02, 1.08, 0.1], route: '/installations' },
  { position: [2.05, 0.72, -0.2], label: 'Design for Good', labelOffset: [0.42, 1.0, 0.12], route: '/design-for-good' },
  { position: [0.45, 0.04, 0.3], label: 'Product Design', labelOffset: [0.04, -1.02, 0.12], route: '/ux-design' },
  { position: [-1.15, -0.1, 0.3], label: 'Brand & Visual', labelOffset: [-0.36, -0.88, 0.12], route: '/brand-visual' },
  { position: [-0.08, -1.66, 0.3], label: 'AI & Wearables', labelOffset: [-0.08, -0.6, 0.12], route: '/ai' },
  { position: [1.55, -1.28, 0.2], label: 'Design Engineering', labelOffset: [0.28, -0.98, 0.12], route: '/design-engineering' },
];

/* ─── Constellation threads, invisible curves that glow as energy passes ─── */

const THREADS_PER_LINK = 18;
const TUBE_SEGMENTS = 64;
const RADIAL_SEGMENTS = 3;
const PRODUCT_DESIGN_IDX = 2;
const GLOW_WIDTH = 0.09;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function seededRand(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Custom shader: thread is invisible except where the glow window passes
const threadVertexShader = /* glsl */ `
  attribute float curveProgress;
  varying float vProgress;
  void main() {
    vProgress = curveProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const threadFragmentShader = /* glsl */ `
  uniform float uGlowCenter;
  uniform float uGlowWidth;
  uniform vec3 uColor;
  uniform float uBaseAlpha;
  uniform float uGlowAlpha;
  uniform float uTintLift;
  uniform float uWhiteMixMax;
  uniform float uFade;
  varying float vProgress;
  void main() {
    float d = abs(vProgress - uGlowCenter);
    d = min(d, 1.0 - d);
    // Premium glass thread: always faintly visible, bright traveling glow
    float glow = smoothstep(uGlowWidth, 0.0, d);
    float core = pow(glow, 3.0);          // tight bright center
    float halo = pow(glow, 0.6) * 0.3;    // wide soft aura
    float combined = core + halo;
    // Theme-tuned tint: light mode keeps more thread color instead of bleaching out
    vec3 white = vec3(1.0);
    vec3 tintBase = mix(uColor, white, uTintLift);
    vec3 tint = mix(tintBase, white, combined * uWhiteMixMax);
    // Base visibility higher in light mode so the resting thread remains readable
    float alpha = (combined * uGlowAlpha + uBaseAlpha) * uFade;
    if (alpha < 0.001) discard;
    gl_FragColor = vec4(tint, alpha);
  }
`;

interface ThreadInfo {
  tubeGeo: THREE.TubeGeometry;
  material: THREE.ShaderMaterial;
  speed: number;
  phase: number;
  glowCenter: number;
  fade: number;
}

function collapsedThreadAppearance(dark: boolean) { return dark
      ? {
          color: new THREE.Color('#f0f4ff'),
          baseAlpha: 0.04,
          glowAlpha: 0.7,
          tintLift: 0.5,
          whiteMixMax: 0.85,
        }
      : {
          color: new THREE.Color('#8b97aa'),
          baseAlpha: 0.085,
          glowAlpha: 0.64,
          tintLift: 0.2,
          whiteMixMax: 0.58,
        }; }

function createThreadMaterial(appearance: ReturnType<typeof collapsedThreadAppearance>) {
  return new THREE.ShaderMaterial({
          vertexShader: threadVertexShader,
          fragmentShader: threadFragmentShader,
          uniforms: {
            uGlowCenter: { value: 0 },
            uGlowWidth: { value: GLOW_WIDTH },
            uColor: { value: appearance.color },
            uBaseAlpha: { value: appearance.baseAlpha },
            uGlowAlpha: { value: appearance.glowAlpha },
            uTintLift: { value: appearance.tintLift },
            uWhiteMixMax: { value: appearance.whiteMixMax },
            uFade: { value: 1 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
}

function ConstellationLines({ positions, dark, fadeRef }: { positions: [number, number, number][]; dark: boolean; fadeRef?: React.RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null!);

  const shareMaterial = useThree(state => state.gl instanceof THREE.WebGLRenderer);
  const threadData = useMemo(() => {
    const result: ThreadInfo[] = [];
    const appearance = collapsedThreadAppearance(dark);
    const sharedMaterial = shareMaterial ? createThreadMaterial(appearance) : null;

    // Build connection pairs, nearest 2 neighbors per node (no full mesh)
    const vecs = positions.map(p => new THREE.Vector3(...p));
    const pairSet = new Set<string>();
    const pairs: [number, number][] = [];

    for (let i = 0; i < positions.length; i++) {
      // Find 2 nearest neighbors for each node (3 for non-PD nodes)
      const maxNeighbors = i === PRODUCT_DESIGN_IDX ? 2 : 3;
      const dists = positions.map((_, j) => ({
        idx: j,
        dist: i === j ? Infinity : vecs[i].distanceTo(vecs[j]),
      })).sort((a, b) => a.dist - b.dist);

      for (let k = 0; k < maxNeighbors && k < dists.length; k++) {
        const j = dists[k].idx;
        const key = Math.min(i, j) + '-' + Math.max(i, j);
        if (!pairSet.has(key)) {
          pairSet.add(key);
          pairs.push([Math.min(i, j), Math.max(i, j)]);
        }
      }
    }

    for (const [i, j] of pairs) {
      const a = new THREE.Vector3(...positions[i]);
      const b = new THREE.Vector3(...positions[j]);
      const pairIdx = i * 10 + j;

      const ab = new THREE.Vector3().subVectors(b, a).normalize();
      const up = Math.abs(ab.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const perp1 = new THREE.Vector3().crossVectors(ab, up).normalize();
      const perp2 = new THREE.Vector3().crossVectors(ab, perp1).normalize();

      for (let t = 0; t < THREADS_PER_LINK; t++) {
        const r1 = seededRand(pairIdx * 31 + t * 17);
        const r2 = seededRand(pairIdx * 47 + t * 23);
        const r3 = seededRand(pairIdx * 59 + t * 37);

        const angle = (t / THREADS_PER_LINK) * Math.PI * 2 + r1 * 1.2;
        const bowAmount = 0.15 + r2 * 0.25;

        const mid = new THREE.Vector3().lerpVectors(a, b, 0.35 + r3 * 0.3);
        mid.add(perp1.clone().multiplyScalar(Math.cos(angle) * bowAmount));
        mid.add(perp2.clone().multiplyScalar(Math.sin(angle) * bowAmount));

        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        const tubeGeo = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.0012, RADIAL_SEGMENTS, false);

        // Add curveProgress attribute, 0 at start, 1 at end
        const count = tubeGeo.attributes.position.count;
        const progressArr = new Float32Array(count);
        const vertsPerRing = RADIAL_SEGMENTS + 1;
        for (let v = 0; v < count; v++) {
          const ring = Math.floor(v / vertsPerRing);
          progressArr[v] = ring / TUBE_SEGMENTS;
        }
        tubeGeo.setAttribute('curveProgress', new THREE.BufferAttribute(progressArr, 1));
        // These custom shaders read only position and curveProgress. Three
        // uploads every geometry attribute, even attributes absent in the shader.
        tubeGeo.deleteAttribute('normal');
        tubeGeo.deleteAttribute('uv');

        const material = sharedMaterial ?? createThreadMaterial(appearance);

        result.push({
          tubeGeo,
          material,
          glowCenter: 0,
          fade: 1,
          speed: 0.03 + r1 * 0.12 + r3 * 0.06, // wider speed range for organic feel
          phase: r2 * 6.28 + t * 1.2 + pairIdx * 0.7, // more phase spread
        });
      }
    }
    return result;
  }, [positions, shareMaterial]);
  useLayoutEffect(() => {
    const appearance = collapsedThreadAppearance(dark);
    for (const material of new Set(threadData.map(thread => thread.material))) {
      for (const [key, value] of Object.entries(appearance)) {
        const uniform = material.uniforms[`u${key[0].toUpperCase()}${key.slice(1)}`];
        if (value instanceof THREE.Color) uniform.value.copy(value);
        else uniform.value = value;
      }
    }
  }, [dark, threadData]);
  useEffect(() => () => {
    threadData.forEach(thread => thread.tubeGeo.dispose());
    new Set(threadData.map(thread => thread.material)).forEach(material => material.dispose());
  }, [threadData]);

  // Animate: move the glow window along each thread
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();
    // Collapsed threads fade out as the expanded web takes over.
    const fade = fadeRef ? fadeRef.current ?? 1 : 1;

    for (let idx = 0; idx < threadData.length; idx++) {
      const thread = threadData[idx];
      // Glow center travels 0→1→0 (ping pong)
      const raw = (time * thread.speed + thread.phase) % 2;
      const center = raw < 1 ? raw : 2 - raw;
      thread.glowCenter = center;
      thread.fade = fade;
      if (!shareMaterial) {
        thread.material.uniforms.uGlowCenter.value = center;
        thread.material.uniforms.uFade.value = fade;
      }
    }
  });

  // Disable raycasting so threads never block clicks on objects
  const noRaycast = useCallback(() => null, []);

  return (
    <group ref={groupRef}>
      {threadData.map((td, i) => (
        <mesh key={i} matrixAutoUpdate={false} geometry={td.tubeGeo} material={td.material} onBeforeRender={shareMaterial ? () => {
          // Share renderer/material state, not geometry: independent meshes
          // retain their original transparent depth sorting and glow values.
          td.material.uniforms.uGlowCenter.value = td.glowCenter;
          td.material.uniforms.uFade.value = td.fade;
          td.material.uniformsNeedUpdate = true;
        } : undefined} raycast={noRaycast} />
      ))}
    </group>
  );
}

/* ─── Global navigate ref, set by parent via onNavigate prop ─── */
let _navigate: ((path: string) => void) | null = null;
export function setHeroNavigate(fn: (path: string) => void) { _navigate = fn; }
// Set true once a canvas drag (orbit/pan) has moved, so releasing over a node
// doesn't fire an unwanted navigation. Reset on each fresh press.
let _webDragMoved = false;

/* ─── Clickable wrapper, passes hovered state to children via render prop ─── */
/* Also handles drag-to-spin: dragging on an object spins it in that direction */

function ClickableObject({
  route,
  children,
  position,
  active,
  onActiveChange,
}: {
  route: string;
  children: (hovered: boolean) => React.ReactNode;
  position: [number, number, number];
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const spinGroupRef = useRef<THREE.Group>(null!);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const revealOnlyClick = useRef(false);
  const spinVel = useRef({ x: 0, y: 0 });

  // Apply spin velocity with momentum decay each frame
  useFrame((_, delta) => {
    if (!spinGroupRef.current) return;
    const sv = spinVel.current;
    if (Math.abs(sv.x) > 0.001 || Math.abs(sv.y) > 0.001) {
      spinGroupRef.current.rotation.x += sv.x * delta;
      spinGroupRef.current.rotation.y += sv.y * delta;
      // Momentum decay, slows down naturally
      sv.x *= 0.96;
      sv.y *= 0.96;
    }
  });

  const handlePointerDown = useCallback((e: { stopPropagation: () => void; nativeEvent: PointerEvent }) => {
    e.stopPropagation();
    revealOnlyClick.current = e.nativeEvent.pointerType !== 'mouse' && !active;
    onActiveChange?.(true);
    isDragging.current = true;
    dragMoved.current = false;

    const onMove = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = ev.movementX;
      const dy = ev.movementY;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) dragMoved.current = true;
      // Horizontal drag → Y spin, vertical drag → X spin
      spinVel.current.y += dx * 0.4;
      spinVel.current.x += dy * 0.4;
    };

    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [active, onActiveChange]);

  const handleClick = useCallback(() => {
    const revealOnly = revealOnlyClick.current;
    revealOnlyClick.current = false;
    // Only navigate if it wasn't a drag
    if (!dragMoved.current && _navigate) {
      if (revealOnly) return;
      _navigate(route);
    }
  }, [route]);

  return (
    <group
      position={position}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onActiveChange?.(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        onActiveChange?.(false);
        document.body.style.cursor = '';
      }}
    >
      <group ref={spinGroupRef}>
        {/* Invisible hit area, ensures all objects are draggable */}
        <mesh visible={false}>
          <sphereGeometry args={[0.55, 8, 8]} />
          <meshBasicMaterial />
        </mesh>
        {children(hovered)}
      </group>
    </group>
  );
}

/* ─── Smooth hover lerp hook, intentionally slow for elegance ─── */
function useHoverLerp(hovered: boolean, speed = 3) {
  const t = useRef(0);
  useFrame((_, delta) => {
    const target = hovered ? 1 : 0;
    t.current += (target - t.current) * Math.min(delta * speed, 1);
  });
  return t;
}

/* ─── Lerp helper ─── */
function mix(a: number, b: number, t: number) { return a + (b - a) * t; }

/* ─── Interactive Label, revealed by object hover or first touch ─── */

function InteractiveLabel({ position, text, offset, dark, route, parentRef, active }: {
  position: [number, number, number];
  text: string;
  offset: [number, number, number];
  dark: boolean;
  route: string;
  parentRef: React.RefObject<THREE.Group>;
  active: boolean;
}) {
  const textRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const lerp = useRef(0);
  const padWidth = Math.min(1.68, Math.max(0.92, text.length * 0.082));
  const padHeight = text.includes('&') || text.includes(' ') ? 0.42 : 0.3;

  const handleClick = useCallback(() => {
    if (_navigate) _navigate(route);
  }, [route]);

  useFrame((_, delta) => {
    const target = active ? 1 : 0;
    lerp.current += (target - lerp.current) * Math.min(delta * 8, 1);

    // Labels stay quiet until the corresponding object is engaged.
    if (textRef.current) {
      const textScale = 0.82 + lerp.current * 0.18;
      textRef.current.scale.set(textScale, textScale, textScale);
      (textRef.current as any).fillOpacity = (dark ? 0.98 : 0.9) * lerp.current;
      // Soft glow halo (blurred outline) carries the legibility now — no plate.
      (textRef.current as any).outlineOpacity = (dark ? 0.85 : 0.92) * lerp.current;
      const mat = (textRef.current as any).material;
      if (mat && mat.depthTest !== false) {
        mat.depthTest = false;
        mat.depthWrite = false;
        mat.needsUpdate = true;
      }
    }

    // Counter-rotate Z so labels always stay upright/readable
    if (groupRef.current && parentRef?.current) {
      groupRef.current.rotation.z = -parentRef.current.rotation.z;
    }
  });

  const lx = position[0] + offset[0];
  const ly = position[1] + offset[1];
  const lz = position[2] + offset[2];
  return (
    <group ref={groupRef} position={[lx, ly, lz]}>
      <group
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        {/* Invisible pad — keeps a comfortable click target, renders nothing. */}
        <mesh renderOrder={997} position={[0, offset[1] > 0 ? -0.06 : 0.06, -0.02]}>
          <planeGeometry args={[padWidth, padHeight]} />
          <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
        </mesh>
      <Text
        ref={textRef}
        fontSize={0.15}
        color={dark ? '#e8e4df' : '#1a1a1a'}
        anchorX="center"
        anchorY={offset[1] > 0 ? 'bottom' : 'top'}
        letterSpacing={0.12}
        fillOpacity={0}
        outlineWidth={0.018}
        outlineBlur={0.09}
        outlineColor={dark ? '#000000' : '#faf9f6'}
        outlineOpacity={0}
        renderOrder={999}
        material-depthTest={false}
        material-depthWrite={false}
        textAlign="center"
        maxWidth={1.35}
        lineHeight={1.05}
      >
        {text.toUpperCase()}
      </Text>
      </group>
    </group>
  );
}

/* ─── Virtual time that freezes on hover, rotation stops in place, no jump ─── */
function useVirtualTime(ht: React.RefObject<number>) {
  const vt = useRef(0);
  useFrame((_, delta) => {
    vt.current += delta * (1 - ht.current);
  });
  return vt;
}

/* ═══════════════════════════════════════════════════
   INSTALLATIONS, metallic rod truss (KEEP, user likes this)
   ═══════════════════════════════════════════════════ */

function TrussStructure({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);
  const jointRefs = useRef<THREE.Mesh[]>([]);
  const rodRefs = useRef<THREE.Mesh[]>([]);

  const corners = useMemo(() => {
    const s = 0.5;
    return [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
    ] as [number, number, number][];
  }, []);

  // Pre-compute normalized directions for each corner (avoid allocation in useFrame)
  const cornerDirs = useMemo(() =>
    corners.map(c => new THREE.Vector3(...c).normalize()),
  [corners]);

  const rods = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const c = corners.map(p => new THREE.Vector3(...p));
    const edges: [number, number][] = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    const diags: [number, number][] = [[0,2],[1,3],[4,6],[5,7],[0,5],[1,4],[2,7],[3,6],[0,7],[1,6],[2,5],[3,4]];
    for (const [a, b] of [...edges, ...diags]) {
      result.push({ start: c[a], end: c[b] });
    }
    return result;
  }, [corners]);

  useFrame(() => {
    if (!ref.current) return;
    const v = vt.current;
    const h = ht.current;
    ref.current.rotation.y = v * 0.06;
    ref.current.rotation.x = Math.sin(v * 0.04) * 0.06;
    ref.current.rotation.z = Math.cos(v * 0.03) * 0.04;
    // Joints expand outward on hover
    jointRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const base = corners[i];
      const dir = cornerDirs[i];
      const expand = h * 0.35;
      mesh.position.set(base[0] + dir.x * expand, base[1] + dir.y * expand, base[2] + dir.z * expand);
      const s = mix(0.035, 0.06, h);
      mesh.scale.setScalar(s / 0.035);
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = mix(0, 0.6, h);
    });
    // Rods fade on hover (they'd break with expanded joints, becoming wireframe ghost)
    rodRefs.current.forEach((mesh) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      mat.opacity = mix(1, 0.15, h);
      mat.transparent = h > 0.01;
    });
  });

  const rodTransforms = useMemo(() => rods.map((rod, i) => ({
    mid: new THREE.Vector3().addVectors(rod.start, rod.end).multiplyScalar(0.5),
    len: rod.start.distanceTo(rod.end),
    quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(rod.end, rod.start).normalize()),
    isEdge: i < 12,
  })), [rods]);

  return (
    <Float speed={0.7} floatIntensity={0.5} rotationIntensity={0.15}>
      <group rotation={[0.4, 0.3, 0.15]} ref={ref}>
        {rodTransforms.map((rt, i) => {
          return (
            <mesh key={i} position={rt.mid} quaternion={rt.quat} ref={(el) => { if (el) rodRefs.current[i] = el; }}>
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
          );
        })}
        {corners.map((p, i) => (
          <mesh key={`j${i}`} position={p} ref={(el) => { if (el) jointRefs.current[i] = el; }}>
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
  );
}

/* ═══════════════════════════════════════════════════
   DESIGN FOR GOOD, chrome torus knot with glass shell
   ═══════════════════════════════════════════════════ */

function PetalRose({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const shellRef = useRef<THREE.Mesh>(null!);
  const knotRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);

  useFrame(() => {
    if (!ref.current) return;
    const v = vt.current;
    const h = ht.current;
    ref.current.rotation.y = v * 0.07;
    ref.current.rotation.x = Math.sin(v * 0.03) * 0.05;
    ref.current.rotation.z = Math.cos(v * 0.025) * 0.03;
    if (knotRef.current) {
      knotRef.current.scale.set(mix(1, 1.3, h), mix(1, 0.3, h), mix(1, 1.3, h));
    }
    if (shellRef.current) {
      const s = mix(1, 1.5, h) + Math.sin(v * 0.5) * 0.04;
      shellRef.current.scale.set(s, s, s);
      const mat = shellRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = mix(0.08, 0.25, h);
      mat.ior = mix(1.3, 2.2, h);
    }
    if (coreRef.current) {
      const s = mix(1, 1.8, h);
      coreRef.current.scale.setScalar(s);
      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = mix(dark ? 0.8 : 0.4, dark ? 1.4 : 1.0, h);
    }
  });

  return (
    <Float speed={0.6} floatIntensity={0.4} rotationIntensity={0.12}>
      <group ref={ref}>
        <mesh ref={knotRef}>
          <torusKnotGeometry args={[0.3, 0.065, 200, 32, 2, 3]} />
          <meshPhysicalMaterial
            color={dark ? '#e0e0f0' : '#c8c8d8'}
            metalness={1} roughness={0.03} clearcoat={1} clearcoatRoughness={0.02}
            envMapIntensity={dark ? 3 : 3.5} reflectivity={1}
          />
        </mesh>
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.48, 64, 64]} />
          <meshPhysicalMaterial
            color={dark ? '#d8e0f0' : '#e0e8f8'}
            metalness={0} roughness={0.02} transmission={0.92} transparent opacity={0.12}
            ior={1.5} thickness={1.2} envMapIntensity={dark ? 2 : 2.5}
            specularIntensity={2} specularColor={dark ? '#ddeeff' : '#bbccee'}
          />
        </mesh>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshPhysicalMaterial
            color="#ffffff" emissive={dark ? '#8899cc' : '#6677aa'}
            emissiveIntensity={dark ? 0.8 : 0.4} metalness={0.3} roughness={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ═══════════════════════════════════════════════════
   PRODUCT DESIGN, Morphing chrome sculpture

   Cycles between 3 abstract forms:
   Form 0 (Layers):  Discs stacked horizontally, layered interfaces
   Form 1 (Orrery):  Discs tilted at angles around center, interconnected systems
   Form 2 (Column):  Discs vertical, spread along Y, information architecture

   On hover: layers separate, ring expands, core brightens
   Same visual language as every other object.
   ═══════════════════════════════════════════════════ */

// Multicolor iridescent gradient — deep navy center, rainbow edges
function cubeGradientColor(x: number, z: number, radius: number, _dark: boolean): string {
  const angle = (Math.atan2(z, x) + Math.PI) / (Math.PI * 2)
  const d = Math.min(1, Math.sqrt(x * x + z * z) / radius)
  const coreMix = Math.max(0, 1 - d * 1.8)

  let er: number, eg: number, eb: number
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

function MorphingScreens({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);

  const ringRef = useRef<THREE.Mesh>(null!);
  const shellRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const crossRef = useRef<THREE.Group>(null!);
  const nodeRefs = useRef<THREE.Mesh[]>([]);
  const pixelsRef = useRef<THREE.InstancedMesh>(null!);
  const pixelScratch = useMemo(() => new THREE.Object3D(), []);

  // Build cubes that fill 3 disc shapes — each cube has a "solid" position (forming the disc)
  // and a "scattered" position (exploded outward like the flower reference)
  const pixelData = useMemo(() => {
    const cubeSize = 0.04;
    const gap = 0.003;
    const step = cubeSize + gap;
    const data: { solidPos: [number, number, number]; scatterPos: [number, number, number]; color: string; delay: number }[] = [];

    // 3 discs: bottom, middle, top — fill each with cubes in a circular pattern
    const discs = [
      { y: -0.08, radius: 0.28 },
      { y: 0.0,   radius: 0.35 },
      { y: 0.08,  radius: 0.22 },
    ];

    for (const disc of discs) {
      const gridR = Math.ceil(disc.radius / step);
      for (let gx = -gridR; gx <= gridR; gx++) {
        for (let gz = -gridR; gz <= gridR; gz++) {
          const x = gx * step;
          const z = gz * step;
          if (Math.sqrt(x * x + z * z) > disc.radius - cubeSize * 0.5) continue;

          const idx = data.length;
          const angle = Math.atan2(z, x);
          const d = Math.sqrt(x * x + z * z);
          const r1 = seededRand(idx * 17 + 3);
          const r2 = seededRand(idx * 31 + 7);
          const r3 = seededRand(idx * 47 + 11);
          const scatter = 0.4 + r1 * 0.6;

          data.push({
            solidPos: [x, disc.y, z],
            scatterPos: [
              x + Math.cos(angle + r2 * 2) * scatter,
              disc.y + (r3 - 0.5) * 0.8,
              z + Math.sin(angle + r2 * 2) * scatter,
            ],
            color: cubeGradientColor(x, z, disc.radius, dark),
            delay: d / disc.radius,
          });
        }
      }
    }
    return data;
  }, [dark]);

  const pixelGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(0.038, 0.015, 0.038);
    geometry.setAttribute('instanceEmissive', new THREE.InstancedBufferAttribute(new Float32Array(pixelData.length), 1).setUsage(THREE.DynamicDrawUsage));
    return geometry;
  }, [pixelData.length]);
  useLayoutEffect(() => {
    const mesh = pixelsRef.current;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    let radius = 0;
    pixelData.forEach((pixel, index) => {
      mesh.setColorAt(index, new THREE.Color(pixel.color));
      radius = Math.max(radius, Math.hypot(...pixel.solidPos), Math.hypot(...pixel.scatterPos));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // Cover both ends of every trajectory, breathing, and the largest spun cube.
    mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius + 0.008 + Math.hypot(0.038, 0.015, 0.038) * 0.65);
    updateMorphingPixels(mesh, pixelData, ht.current, vt.current, dark, pixelScratch);
  }, [pixelData, dark, pixelScratch, ht, vt]);
  useEffect(() => () => pixelGeometry.dispose(), [pixelGeometry]);

  useFrame(() => {
    if (!ref.current) return;
    const v = vt.current;
    const h = ht.current;
    ref.current.rotation.y = v * 0.06;
    ref.current.rotation.x = Math.sin(v * 0.035) * 0.06;
    ref.current.rotation.z = Math.cos(v * 0.03) * 0.03;

    updateMorphingPixels(pixelsRef.current, pixelData, h, v, dark, pixelScratch);

    // Ring expands and spins faster on hover
    if (ringRef.current) {
      ringRef.current.rotation.x = 0.8 + v * mix(0.1, 0.25, h);
      ringRef.current.rotation.z = 0.5 + v * mix(0.07, 0.15, h);
      ringRef.current.scale.setScalar(mix(1, 1.5, h));
    }
    // Nodes orbit wider on hover
    nodeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle = (i / 4) * Math.PI * 2 + 0.4 + v * mix(0.04, 0.1, h);
      const r = mix(0.32, 0.5, h);
      mesh.position.set(Math.cos(angle) * r, Math.sin(v * 0.3 + i) * h * 0.1, Math.sin(angle) * r);
      const s = mix(1, 1.3, h);
      mesh.scale.setScalar(s);
    });
    // Shell breathes
    if (shellRef.current) {
      const breathe = 1 + Math.sin(v * 0.8) * 0.02;
      shellRef.current.scale.setScalar(mix(breathe, 1.4, h));
      const mat = shellRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = mix(0.06, 0.15, h);
    }
    // Core pulses
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial;
      const pulse = 1 + Math.sin(v * 2) * 0.15 * h;
      mat.emissiveIntensity = mix(dark ? 0.8 : 0.4, dark ? 2 : 1.2, h) * pulse;
      coreRef.current.scale.setScalar(mix(1, 1.6, h));
    }
    // Cross spins
    if (crossRef.current) {
      crossRef.current.rotation.y = -v * mix(0.04, 0.12, h);
      crossRef.current.scale.setScalar(mix(1, 1.15, h));
    }
  });

  const iriChrome = { metalness: 1, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: dark ? 4 : 5, reflectivity: 1, iridescence: 0.8, iridescenceIOR: 1.6 };

  return (
    <Float speed={0.6} floatIntensity={0.4} rotationIntensity={0.12}>
      <group ref={ref}>
        {/* The discs ARE made of cubes — iridescent metallic */}
        <instancedMesh ref={pixelsRef} args={[pixelGeometry, undefined, pixelData.length]}>
          <meshPhysicalMaterial
            color="#ffffff"
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
            emissiveIntensity={1}
            onBeforeCompile={addInstanceEmissive}
            customProgramCacheKey={() => 'morphing-pixels-emissive-v1'}
          />
        </instancedMesh>
        {/* Cross bars — iridescent */}
        <group ref={crossRef}>
          <mesh><cylinderGeometry args={[0.012, 0.012, 0.55, 8]} /><meshPhysicalMaterial color={dark ? '#5060b0' : '#4050a0'} {...iriChrome} /></mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.008, 0.008, 0.4, 8]} /><meshPhysicalMaterial color={dark ? '#4050a0' : '#304090'} {...iriChrome} /></mesh>
        </group>
        {/* Ring — iridescent blue */}
        <mesh ref={ringRef}><torusGeometry args={[0.42, 0.014, 16, 64]} /><meshPhysicalMaterial color={dark ? '#6070c0' : '#5060b0'} {...iriChrome} iridescence={1} /></mesh>
        {/* Glass shell — blue-tinted */}
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.46, 48, 48]} />
          <meshPhysicalMaterial color={dark ? '#4060c0' : '#5070d0'} metalness={0} roughness={0} transmission={0.94} transparent opacity={0.06} ior={1.5} thickness={1.0} envMapIntensity={dark ? 2 : 2.5} specularIntensity={2} specularColor={dark ? '#aabbff' : '#8899ee'} />
        </mesh>
        {/* Core glow — bright blue/purple */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshPhysicalMaterial color="#ffffff" emissive={dark ? '#4466dd' : '#3355cc'} emissiveIntensity={dark ? 0.8 : 0.4} metalness={0.3} roughness={0.1} />
        </mesh>
        {/* Orbiting nodes — iridescent */}
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2 + 0.4;
          return (
            <mesh key={`node${i}`} ref={(el) => { if (el) nodeRefs.current[i] = el; }} position={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}>
              <sphereGeometry args={[0.025, 12, 12]} />
              <meshPhysicalMaterial color={dark ? '#5568cc' : '#4458bb'} {...iriChrome} iridescence={1} emissive={dark ? '#3350aa' : '#2240aa'} emissiveIntensity={0.15} />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

/* ═══════════════════════════════════════════════════
   BRAND & VISUAL, Bauhaus composition: chrome primitives
   ═══════════════════════════════════════════════════ */

function StackedPlates({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const cubeRef = useRef<THREE.Mesh>(null!);
  const discRef = useRef<THREE.Mesh>(null!);
  const slabRef = useRef<THREE.Mesh>(null!);
  const sphereRef = useRef<THREE.Mesh>(null!);
  const coneRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);

  useFrame(() => {
    if (!ref.current) return;
    const v = vt.current;
    const h = ht.current;
    ref.current.rotation.y = v * 0.05;
    ref.current.rotation.x = Math.sin(v * 0.03) * 0.06;
    ref.current.rotation.z = Math.cos(v * 0.035) * 0.04;
    // Ring expands gently
    if (ringRef.current) {
      ringRef.current.rotation.x = v * 0.1;
      ringRef.current.rotation.z = v * 0.12;
      const rs = mix(1, 1.4, h);
      ringRef.current.scale.set(rs, rs, rs);
    }
    // Cube drifts outward
    if (cubeRef.current) {
      cubeRef.current.rotation.x = v * 0.08;
      cubeRef.current.rotation.y = v * 0.1;
      cubeRef.current.position.set(mix(-0.2, -0.35, h), mix(0.22, 0.3, h), mix(-0.08, -0.2, h));
    }
    // Disc tilts and rises
    if (discRef.current) {
      discRef.current.rotation.x = mix(0, 0.5, h);
      discRef.current.position.y = mix(0, 0.15, h);
    }
    // Slab floats away
    if (slabRef.current) {
      slabRef.current.position.set(mix(-0.12, -0.3, h), mix(-0.06, -0.2, h), mix(0.08, 0.25, h));
    }
    // Sphere glows
    if (sphereRef.current) {
      const mat = sphereRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = mix(0, dark ? 1.5 : 1, h);
      sphereRef.current.position.set(mix(0.17, 0.28, h), mix(0.12, 0.25, h), mix(0.06, 0.15, h));
    }
    // Cone rises
    if (coneRef.current) {
      coneRef.current.position.y = mix(0.38, 0.55, h);
    }
  });

  const chrome = {
    metalness: 1,
    roughness: 0.03,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: dark ? 2.5 : 3,
    reflectivity: 1,
  };

  const darkChrome = {
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: dark ? 2 : 2.5,
    reflectivity: 1,
  };

  return (
    <Float speed={0.5} floatIntensity={0.35} rotationIntensity={0.12}>
      <group ref={ref}>
        {/* Central chrome cylinder, pillar */}
        <mesh>
          <cylinderGeometry args={[0.055, 0.055, 0.65, 32]} />
          <meshPhysicalMaterial color={dark ? '#d0d0d8' : '#b8b8c0'} {...chrome} />
        </mesh>

        {/* Horizontal disc, dark mirror */}
        <mesh ref={discRef} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.018, 48]} />
          <meshPhysicalMaterial color={dark ? '#404048' : '#606068'} {...darkChrome} />
        </mesh>

        {/* Orbiting chrome ring */}
        <mesh ref={ringRef} position={[0, 0.05, 0]}>
          <torusGeometry args={[0.38, 0.016, 16, 64]} />
          <meshPhysicalMaterial color={dark ? '#e0e0f0' : '#d0d0e0'} {...chrome} />
        </mesh>

        {/* Glass sphere, sitting on disc */}
        <mesh ref={sphereRef} position={[0.17, 0.12, 0.06]}>
          <sphereGeometry args={[0.1, 48, 48]} />
          <meshPhysicalMaterial
            color={dark ? '#c8d8f0' : '#d0e0ff'}
            metalness={0} roughness={0} transmission={0.97} transparent opacity={0.1}
            ior={2.0} thickness={0.8} envMapIntensity={dark ? 1.5 : 1.8}
            specularIntensity={1.5} specularColor="#ffffff" clearcoat={0.5} clearcoatRoughness={0.02}
            emissive={dark ? '#6688bb' : '#4466aa'} emissiveIntensity={0}
          />
        </mesh>

        {/* Angled chrome slab */}
        <mesh ref={slabRef} position={[-0.12, -0.06, 0.08]} rotation={[0.15, 0.35, 0.55]}>
          <boxGeometry args={[0.24, 0.34, 0.012]} />
          <meshPhysicalMaterial color={dark ? '#555565' : '#808090'} {...darkChrome} />
        </mesh>

        {/* Small tumbling cube */}
        <mesh ref={cubeRef} position={[-0.2, 0.22, -0.08]}>
          <boxGeometry args={[0.075, 0.075, 0.075]} />
          <meshPhysicalMaterial color={dark ? '#e8e8f0' : '#d0d0d8'} {...chrome} />
        </mesh>

        {/* Cone cap */}
        <mesh ref={coneRef} position={[0, 0.38, 0]}>
          <coneGeometry args={[0.04, 0.09, 24]} />
          <meshPhysicalMaterial color={dark ? '#2a2a34' : '#505058'} {...darkChrome} />
        </mesh>
      </group>
    </Float>
  );
}

/* ═══════════════════════════════════════════════════
   AI & WEARABLES, camera lens with chrome barrel and glass optics
   ═══════════════════════════════════════════════════ */

function LensAssembly({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const apertureRef = useRef<THREE.Group>(null!);
  const frontLensRef = useRef<THREE.Mesh>(null!);
  const rearLensRef = useRef<THREE.Mesh>(null!);
  const frontBezelRef = useRef<THREE.Mesh>(null!);
  const rearRingRef = useRef<THREE.Mesh>(null!);
  const centerRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);

  useFrame(() => {
    if (!ref.current) return;
    const v = vt.current;
    const h = ht.current;
    ref.current.rotation.y = v * 0.05;
    ref.current.rotation.x = Math.sin(v * 0.03) * 0.08;
    ref.current.rotation.z = Math.cos(v * 0.025) * 0.04;
    // Aperture opens on hover
    if (apertureRef.current) {
      const base = 0.9 + Math.sin(v * 0.4) * 0.15;
      const scale = mix(base, 1.8, h);
      apertureRef.current.scale.set(scale, scale, 1);
    }
    // Lens elements separate, exploded view
    if (frontLensRef.current) frontLensRef.current.position.z = mix(0.08, 0.25, h);
    if (rearLensRef.current) rearLensRef.current.position.z = mix(-0.06, -0.25, h);
    if (frontBezelRef.current) frontBezelRef.current.position.z = mix(0.14, 0.35, h);
    if (rearRingRef.current) rearRingRef.current.position.z = mix(-0.14, -0.35, h);
    // Center brightens gently
    if (centerRef.current) {
      const mat = centerRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = mix(dark ? 1 : 0.5, dark ? 1.8 : 1.2, h);
      const s = mix(1, 1.5, h);
      centerRef.current.scale.setScalar(s);
    }
  });

  const chrome = {
    metalness: 1,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: dark ? 2.5 : 3,
    reflectivity: 1,
  };

  return (
    <Float speed={0.5} floatIntensity={0.3} rotationIntensity={0.1}>
      <group ref={ref}>
        {/* Outer barrel, chrome cylinder */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.46, 0.28, 48, 1, true]} />
          <meshPhysicalMaterial
            color={dark ? '#d0d0d8' : '#b8b8c0'}
            {...chrome}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Front bezel ring */}
        <mesh ref={frontBezelRef} position={[0, 0, 0.14]}>
          <torusGeometry args={[0.48, 0.035, 24, 64]} />
          <meshPhysicalMaterial color={dark ? '#e0e0e8' : '#d0d0d8'} {...chrome} />
        </mesh>

        {/* Rear ring */}
        <mesh ref={rearRingRef} position={[0, 0, -0.14]}>
          <torusGeometry args={[0.44, 0.025, 20, 64]} />
          <meshPhysicalMaterial
            color={dark ? '#3a3a44' : '#606068'} metalness={0.95} roughness={0.1}
            clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={dark ? 2 : 2.5}
          />
        </mesh>

        {/* Front glass element, convex lens */}
        <mesh ref={frontLensRef} position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.32, 48, 48, 0, Math.PI * 2, 0, Math.PI / 3.5]} />
          <meshPhysicalMaterial
            color={dark ? '#80a0d0' : '#90b0e0'} metalness={0} roughness={0}
            transmission={0.96} transparent opacity={0.08} ior={2.2} thickness={1.0}
            envMapIntensity={dark ? 1.5 : 2} specularIntensity={1.5} specularColor={dark ? '#ccddff' : '#aabbdd'}
          />
        </mesh>

        {/* Rear glass, concave */}
        <mesh ref={rearLensRef} position={[0, 0, -0.06]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.24, 32, 32, 0, Math.PI * 2, 0, Math.PI / 4]} />
          <meshPhysicalMaterial
            color={dark ? '#8899cc' : '#99aadd'} metalness={0} roughness={0}
            transmission={0.95} transparent opacity={0.06} ior={1.9} thickness={0.7}
            specularIntensity={1.2} specularColor={dark ? '#bbccee' : '#99aacc'}
          />
        </mesh>

        {/* Aperture blades, chrome */}
        <group ref={apertureRef}>
          {Array.from({ length: 9 }, (_, i) => {
            const angle = (i / 9) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, 0]} rotation={[0, 0, angle + 0.35]}>
                <boxGeometry args={[0.1, 0.025, 0.004]} />
                <meshPhysicalMaterial
                  color={dark ? '#2a2a32' : '#484850'}
                  metalness={0.9}
                  roughness={0.15}
                  clearcoat={0.8}
                  clearcoatRoughness={0.1}
                  envMapIntensity={dark ? 1.5 : 2}
                />
              </mesh>
            );
          })}
        </group>

        {/* Center bright point, sensor indicator */}
        <mesh ref={centerRef} position={[0, 0, 0.01]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshPhysicalMaterial
            color="#ffffff" emissive={dark ? '#aaccff' : '#6688bb'}
            emissiveIntensity={dark ? 1 : 0.5} metalness={0.3} roughness={0.05}
          />
        </mesh>

        {/* Focus ring grooves, detail rings on barrel */}
        {[-0.04, 0.04].map((z, i) => (
          <mesh key={`gr${i}`} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.505, 0.006, 8, 48]} />
            <meshPhysicalMaterial
              color={dark ? '#888890' : '#707078'}
              metalness={0.9}
              roughness={0.2}
              clearcoat={0.5}
              envMapIntensity={dark ? 1.5 : 2}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/* ═══════════════════════════════════════════════════
   CREATIVE TECHNOLOGY, geodesic wireframe + chrome octahedron core
   ═══════════════════════════════════════════════════ */

function GlassCrystal({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const orbitRef = useRef<THREE.Group>(null!);
  const shellRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.LineSegments>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);
  // Inner octahedron keeps its own time, it spins gently even on hover
  const innerTime = useRef(0);

  const outerEdges = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.55, 1);
    return new THREE.EdgesGeometry(geo);
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const v = vt.current;
    const h = ht.current;
    innerTime.current += delta * mix(0.5, 1, h);
    ref.current.rotation.y = v * 0.06;
    ref.current.rotation.x = Math.sin(v * 0.035) * 0.05;
    ref.current.rotation.z = Math.cos(v * 0.03) * 0.04;
    // Inner octahedron: gentle spin, slightly faster on hover
    const it = innerTime.current;
    if (innerRef.current) {
      innerRef.current.rotation.x = -it * 0.08;
      innerRef.current.rotation.y = it * 0.1;
      innerRef.current.rotation.z = Math.cos(it * 0.06) * 0.05;
      const s = mix(1, 1.6, h);
      innerRef.current.scale.setScalar(s);
      const mat = innerRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = mix(0, dark ? 0.8 : 0.5, h);
    }
    // Wireframe expands
    if (wireRef.current) {
      const ws = mix(1, 1.4, h);
      wireRef.current.scale.setScalar(ws);
      const mat = wireRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = mix(dark ? 0.35 : 0.3, dark ? 0.6 : 0.5, h);
    }
    // Glass shell expands
    if (shellRef.current) {
      const ss = mix(1, 1.4, h);
      shellRef.current.scale.setScalar(ss);
    }
    // Orbit particles drift wider gently
    if (orbitRef.current) {
      orbitRef.current.rotation.y = v * 0.1;
      orbitRef.current.rotation.x = Math.sin(v * 0.06) * 0.15;
      const os = mix(1, 1.35, h);
      orbitRef.current.scale.setScalar(os);
    }
    // Core gently brightens
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = mix(dark ? 0.8 : 0.4, dark ? 1.6 : 1.2, h);
      const cs = mix(1, 1.4, h);
      coreRef.current.scale.setScalar(cs);
    }
  });

  return (
    <Float speed={0.8} floatIntensity={0.45} rotationIntensity={0.15}>
      <group ref={ref}>
        {/* Outer wireframe, silver */}
        <lineSegments ref={wireRef} geometry={outerEdges}>
          <lineBasicMaterial color={dark ? '#b8c8e0' : '#8899aa'} transparent opacity={dark ? 0.5 : 0.4} />
        </lineSegments>

        {/* Glass shell, translucent refraction */}
        <mesh ref={shellRef}>
          <icosahedronGeometry args={[0.53, 1]} />
          <meshPhysicalMaterial
            color={dark ? '#c0d0e8' : '#d0ddf0'} metalness={0} roughness={0}
            transmission={0.96} transparent opacity={0.08} ior={1.4} thickness={0.6}
            envMapIntensity={dark ? 1.0 : 1.2} specularIntensity={1.2}
            specularColor={dark ? '#ccddff' : '#aabbdd'}
          />
        </mesh>

        {/* Inner chrome octahedron */}
        <mesh ref={innerRef}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshPhysicalMaterial
            color={dark ? '#d0d0e0' : '#b8b8c8'} metalness={1} roughness={0.02}
            clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={dark ? 3 : 3.5} reflectivity={1}
            emissive={dark ? '#6688bb' : '#4466aa'} emissiveIntensity={0}
          />
        </mesh>

        {/* Core glow */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshPhysicalMaterial
            color="#ffffff" emissive={dark ? '#99bbff' : '#6688bb'}
            emissiveIntensity={dark ? 0.8 : 0.4} metalness={0.2} roughness={0.05} clearcoat={1}
          />
        </mesh>

        {/* Orbiting chrome spheres */}
        <group ref={orbitRef}>
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const r = 0.4;
            return (
              <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle * 0.7) * 0.12, Math.sin(angle) * r]}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshPhysicalMaterial
                  color={dark ? '#e0e0f0' : '#d0d0e0'}
                  metalness={1}
                  roughness={0.02}
                  clearcoat={1}
                  clearcoatRoughness={0.02}
                  envMapIntensity={dark ? 3 : 3.5}
                  reflectivity={1}
                />
              </mesh>
            );
          })}
        </group>
      </group>
    </Float>
  );
}

/* ─── Particle dust ─── */

function ParticleDust({ count, reduced, dark }: { count: number; reduced: boolean; dark: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.006;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={dark ? '#ffffff' : '#333333'}
        size={0.015}
        transparent
        opacity={dark ? 0.25 : 0.18}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════
   EXPANDED WEB — the "see how it connects" constellation.
   Skills + flagship projects bloom around the 6 hubs, woven by
   shared-skill threads. Driven by an intro lerp (0 collapsed → 1 expanded)
   and a hover-focus id that brightens a node's neighborhood.
   ═══════════════════════════════════════════════════ */

// Fine multi-strand glowing threads per edge — the SAME glass-thread language
// as the collapsed constellation, just spanning the wider web. Monochrome pale
// (not accent-tinted), organic strands, so it reads like the reference. Fewer
// strands here since the neighbour-mesh has many more edges.
const WEB_STRANDS_PER_EDGE = 3;

function expandedThreadAppearance(dark: boolean) { return dark
      ? { color: new THREE.Color('#dce6ff'), baseAlpha: 0.16, glowAlpha: 0.92, tintLift: 0.5, whiteMixMax: 0.85 }
      : { color: new THREE.Color('#7d8da0'), baseAlpha: 0.24, glowAlpha: 0.8, tintLift: 0.2, whiteMixMax: 0.58 }; }

function WebEdges({
  edges,
  nodeById,
  introRef,
  focusEdgeRef,
  dark,
}: {
  edges: WebEdge[];
  nodeById: Map<string, WebNode>;
  introRef: React.RefObject<number>;
  focusEdgeRef: React.RefObject<(edgeKey: string) => number>;
  dark: boolean;
}) {
  const built = useMemo(() => {
    const appearance = expandedThreadAppearance(dark);

    interface Strand {
      tubeGeo: THREE.TubeGeometry;
      material: THREE.ShaderMaterial;
      key: string;
      edgeKey: string;
      speed: number;
      phase: number;
      mesh?: THREE.Mesh | null;
      segMid: THREE.Vector3; // local midpoint, for the screen-edge fade
    }
    const strands: Strand[] = [];

    edges.forEach((edge, ei) => {
      const a = new THREE.Vector3(...(nodeById.get(edge.a)?.position ?? [0, 0, 0]));
      const b = new THREE.Vector3(...(nodeById.get(edge.b)?.position ?? [0, 0, 0]));
      const ab = new THREE.Vector3().subVectors(b, a).normalize();
      const up = Math.abs(ab.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const perp1 = new THREE.Vector3().crossVectors(ab, up).normalize();
      const perp2 = new THREE.Vector3().crossVectors(ab, perp1).normalize();
      const key = `${edge.a}|${edge.b}`;

      for (let t = 0; t < WEB_STRANDS_PER_EDGE; t++) {
        const r1 = seededRand(ei * 31 + t * 17);
        const r2 = seededRand(ei * 47 + t * 23);
        const r3 = seededRand(ei * 59 + t * 37);
        const angle = (t / WEB_STRANDS_PER_EDGE) * Math.PI * 2 + r1 * 1.2;
        const bow = 0.18 + r2 * 0.32;
        const mid = new THREE.Vector3().lerpVectors(a, b, 0.35 + r3 * 0.3);
        mid.add(perp1.clone().multiplyScalar(Math.cos(angle) * bow));
        mid.add(perp2.clone().multiplyScalar(Math.sin(angle) * bow));

        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.0044, 3, false);
        const count = tubeGeo.attributes.position.count;
        const progressArr = new Float32Array(count);
        const vertsPerRing = 4;
        for (let v = 0; v < count; v++) progressArr[v] = Math.floor(v / vertsPerRing) / 48;
        tubeGeo.setAttribute('curveProgress', new THREE.BufferAttribute(progressArr, 1));
        // These custom shaders read only position and curveProgress. Three
        // uploads every geometry attribute, even attributes absent in the shader.
        tubeGeo.deleteAttribute('normal');
        tubeGeo.deleteAttribute('uv');

        const material = new THREE.ShaderMaterial({
          vertexShader: threadVertexShader,
          fragmentShader: threadFragmentShader,
          uniforms: {
            uGlowCenter: { value: 0 },
            uGlowWidth: { value: GLOW_WIDTH },
            uColor: { value: appearance.color },
            uBaseAlpha: { value: appearance.baseAlpha },
            uGlowAlpha: { value: appearance.glowAlpha },
            uTintLift: { value: appearance.tintLift },
            uWhiteMixMax: { value: appearance.whiteMixMax },
            uFade: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        strands.push({
          tubeGeo,
          material,
          key: `${key}#${t}`,
          edgeKey: key,
          speed: 0.03 + r1 * 0.12 + r3 * 0.06,
          phase: r2 * 6.28 + t * 1.2 + ei * 0.7,
          segMid: new THREE.Vector3().lerpVectors(a, b, 0.5),
        });
      }
    });
    return strands;
  }, [edges, nodeById]);
  useLayoutEffect(() => {
    const appearance = expandedThreadAppearance(dark);
    for (const thread of built) {
      for (const [key, value] of Object.entries(appearance)) {
        const uniform = thread.material.uniforms[`u${key[0].toUpperCase()}${key.slice(1)}`];
        if (value instanceof THREE.Color) uniform.value.copy(value);
        else uniform.value = value;
      }
    }
  }, [dark, built]);
  useEffect(() => () => { for (const thread of built) { thread.tubeGeo.dispose(); thread.material.dispose(); } }, [built]);

  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null!);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const intro = introRef.current ?? 0;
    const focusFn = focusEdgeRef.current;
    const mw = groupRef.current?.matrixWorld;
    for (const e of built) {
      const raw = (t * e.speed + e.phase) % 2;
      e.material.uniforms.uGlowCenter.value = raw < 1 ? raw : 2 - raw;
      const focus = focusFn ? focusFn(e.edgeKey) : 1;
      // Same screen-edge fade as the objects, so threads dissolve in step.
      let edgeFade = 1;
      if (mw) {
        scratch.copy(e.segMid).applyMatrix4(mw).project(camera);
        const rad = Math.hypot(scratch.x, scratch.y);
        let f = clamp((1.3 - rad) / (1.3 - 0.62), 0, 1);
        edgeFade = f * f * (3 - 2 * f);
      }
      e.material.uniforms.uFade.value = intro * focus * edgeFade;
      // Zero fade already discards every fragment; omit the draw entirely.
      if (e.mesh) e.mesh.visible = e.material.uniforms.uFade.value !== 0;
    }
  });

  const noRaycast = useCallback(() => null, []);
  return (
    <group ref={groupRef}>
      {built.map((e) => (
        <mesh key={e.key} ref={mesh => { e.mesh = mesh; }} matrixAutoUpdate={false} geometry={e.tubeGeo} material={e.material} raycast={noRaycast} />
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FIELD OBJECTS — remixes, not copies.

   The hub six stay exactly as designed. The field is a NEW set of objects that
   borrow the principals' vocabulary — the glass shells + wireframes of the
   crystal, the torus-knot of the rose, the barrel + bezels + aperture of the
   lens, the spindle + disc + ring of the plates, the iridescent rings of the
   screens, the rod cage + corner beads of the truss — and recombine those
   elements into fresh silhouettes. Same material recipes, so they read just as
   polished; different assemblies, so none is a direct clone.
   ───────────────────────────────────────────────────────────────────────── */

const matChrome = (dark: boolean) => ({ metalness: 1, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: dark ? 3 : 3.4, reflectivity: 1 });
const matChromeIri = (dark: boolean) => ({ metalness: 1, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: dark ? 4 : 5, reflectivity: 1, iridescence: 0.9, iridescenceIOR: 1.7 });
const matDarkChrome = (dark: boolean) => ({ metalness: 0.95, roughness: 0.09, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: dark ? 2 : 2.5, reflectivity: 1 });
const matGlass = (dark: boolean) => ({ metalness: 0, roughness: 0, transmission: 0.95, transparent: true, opacity: 0.1, ior: 1.5, thickness: 0.7, envMapIntensity: dark ? 1.2 : 1.5, specularIntensity: 1.4, specularColor: dark ? '#ccddff' : '#aabbdd' });
const wireColor = (dark: boolean) => (dark ? '#b8c8e0' : '#8899aa');

/* 1 · GEODE-KNOT — crystal's glass icosa shell + wire, but with the rose's
   chrome torus-knot spinning at its heart instead of the octahedron. */
function GeodeKnot({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const knotRef = useRef<THREE.Mesh>(null!);
  const shellRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.5, 0)), []);
  useFrame(() => {
    const v = vt.current, h = ht.current;
    if (ref.current) { ref.current.rotation.y = v * 0.06; ref.current.rotation.x = Math.sin(v * 0.035) * 0.05; }
    if (knotRef.current) { knotRef.current.rotation.y = -v * 0.14; knotRef.current.rotation.x = v * 0.09; knotRef.current.scale.setScalar(mix(1, 1.3, h)); }
    if (shellRef.current) shellRef.current.scale.setScalar(mix(1, 1.4, h));
    if (coreRef.current) (coreRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = mix(dark ? 0.55 : 0.3, dark ? 1.4 : 1, h);
  });
  return (
    <Float speed={0.75} floatIntensity={0.45} rotationIntensity={0.14}>
      <group ref={ref}>
        <lineSegments geometry={edges}><lineBasicMaterial color={wireColor(dark)} transparent opacity={dark ? 0.5 : 0.42} /></lineSegments>
        <mesh ref={shellRef}><icosahedronGeometry args={[0.48, 1]} /><meshPhysicalMaterial {...matGlass(dark)} opacity={0.08} /></mesh>
        <mesh ref={knotRef}><torusKnotGeometry args={[0.17, 0.045, 120, 12, 2, 3]} /><meshPhysicalMaterial color={dark ? '#d0d0e0' : '#b8b8c8'} {...matChrome(dark)} /></mesh>
        <mesh ref={coreRef}><sphereGeometry args={[0.05, 16, 16]} /><meshPhysicalMaterial color="#ffffff" emissive={dark ? '#99bbff' : '#6688bb'} emissiveIntensity={dark ? 0.55 : 0.3} metalness={0.2} roughness={0.05} /></mesh>
      </group>
    </Float>
  );
}

/* 2 · CAGED-KNOT — the rose's knot inside an OPEN dodecahedron wire cage
   (no shell), ringed by three orbiting chrome beads from the crystal. */
function CagedKnot({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const knotRef = useRef<THREE.Mesh>(null!);
  const orbitRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(0.52, 0)), []);
  useFrame(() => {
    const v = vt.current, h = ht.current;
    if (ref.current) { ref.current.rotation.y = v * 0.05; ref.current.rotation.z = Math.cos(v * 0.03) * 0.05; }
    if (knotRef.current) { knotRef.current.rotation.x = v * 0.12; knotRef.current.rotation.y = v * 0.1; }
    if (orbitRef.current) { orbitRef.current.rotation.y = v * 0.16; orbitRef.current.rotation.x = Math.sin(v * 0.06) * 0.2; orbitRef.current.scale.setScalar(mix(1, 1.3, h)); }
    if (coreRef.current) (coreRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = mix(dark ? 0.6 : 0.35, dark ? 1.5 : 1.1, h);
  });
  return (
    <Float speed={0.65} floatIntensity={0.4} rotationIntensity={0.12}>
      <group ref={ref}>
        <lineSegments geometry={edges}><lineBasicMaterial color={wireColor(dark)} transparent opacity={dark ? 0.55 : 0.46} /></lineSegments>
        <mesh ref={knotRef}><torusKnotGeometry args={[0.19, 0.05, 130, 12, 3, 4]} /><meshPhysicalMaterial color={dark ? '#e0e0f0' : '#c8c8d8'} {...matChrome(dark)} /></mesh>
        <mesh ref={coreRef}><sphereGeometry args={[0.05, 16, 16]} /><meshPhysicalMaterial color="#ffffff" emissive={dark ? '#aaccff' : '#6688bb'} emissiveIntensity={dark ? 0.6 : 0.35} metalness={0.25} roughness={0.05} /></mesh>
        <group ref={orbitRef}>
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.5, Math.sin(a * 0.7) * 0.1, Math.sin(a) * 0.5]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshPhysicalMaterial color={dark ? '#e0e0f0' : '#d0d0e0'} {...matChrome(dark)} />
              </mesh>
            );
          })}
        </group>
      </group>
    </Float>
  );
}

/* 3 · LENS-POD — the camera lens distilled: barrel + front bezel + a glass
   dome cap over a glowing centre, with two knurled grip rings. */
function LensPod({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const domeRef = useRef<THREE.Mesh>(null!);
  const centerRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);
  useFrame(() => {
    const v = vt.current, h = ht.current;
    if (ref.current) { ref.current.rotation.y = v * 0.05; ref.current.rotation.x = Math.sin(v * 0.03) * 0.06; }
    if (domeRef.current) domeRef.current.position.z = mix(0.06, 0.2, h);
    if (centerRef.current) { (centerRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = mix(dark ? 0.9 : 0.5, dark ? 1.8 : 1.2, h); centerRef.current.scale.setScalar(mix(1, 1.5, h)); }
  });
  return (
    <Float speed={0.55} floatIntensity={0.35} rotationIntensity={0.1}>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.42, 0.4, 0.34, 40, 1, true]} /><meshPhysicalMaterial color={dark ? '#d0d0d8' : '#b8b8c0'} {...matChrome(dark)} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0, 0.16]}><torusGeometry args={[0.41, 0.03, 20, 56]} /><meshPhysicalMaterial color={dark ? '#e0e0e8' : '#d0d0d8'} {...matChrome(dark)} /></mesh>
        <mesh position={[0, 0, -0.16]}><torusGeometry args={[0.38, 0.022, 18, 56]} /><meshPhysicalMaterial color={dark ? '#3a3a44' : '#606068'} {...matDarkChrome(dark)} /></mesh>
        <mesh ref={domeRef} position={[0, 0, 0.06]}><sphereGeometry args={[0.3, 40, 40, 0, Math.PI * 2, 0, Math.PI / 3.4]} /><meshPhysicalMaterial {...matGlass(dark)} color={dark ? '#80a0d0' : '#90b0e0'} opacity={0.08} ior={2.1} /></mesh>
        <mesh ref={centerRef} position={[0, 0, 0.02]}><sphereGeometry args={[0.03, 16, 16]} /><meshPhysicalMaterial color="#ffffff" emissive={dark ? '#aaccff' : '#6688bb'} emissiveIntensity={dark ? 0.9 : 0.5} metalness={0.3} roughness={0.05} /></mesh>
        {[-0.05, 0.05].map((z, i) => (
          <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.425, 0.006, 8, 44]} /><meshPhysicalMaterial color={dark ? '#888890' : '#707078'} metalness={0.9} roughness={0.2} envMapIntensity={dark ? 1.5 : 2} /></mesh>
        ))}
      </group>
    </Float>
  );
}

/* 4 · SPINDLE-TOTEM — the plates' vocabulary restacked: a chrome spindle
   threading a disc + tilted ring, a glass bead, a cube, and a cone tip. */
function SpindleTotem({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const beadRef = useRef<THREE.Mesh>(null!);
  const cubeRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);
  useFrame(() => {
    const v = vt.current, h = ht.current;
    if (ref.current) { ref.current.rotation.y = v * 0.05; ref.current.rotation.z = Math.cos(v * 0.03) * 0.05; }
    if (ringRef.current) { ringRef.current.rotation.x = 0.6 + v * 0.14; ringRef.current.scale.setScalar(mix(1, 1.35, h)); }
    if (beadRef.current) { (beadRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = mix(0, dark ? 1.2 : 0.8, h); beadRef.current.position.y = mix(0.14, 0.24, h); }
    if (cubeRef.current) { cubeRef.current.rotation.x = v * 0.1; cubeRef.current.rotation.y = v * 0.12; }
  });
  return (
    <Float speed={0.5} floatIntensity={0.35} rotationIntensity={0.12}>
      <group ref={ref}>
        <mesh><cylinderGeometry args={[0.05, 0.05, 0.62, 28]} /><meshPhysicalMaterial color={dark ? '#d0d0d8' : '#b8b8c0'} {...matChrome(dark)} /></mesh>
        <mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.3, 0.3, 0.016, 40]} /><meshPhysicalMaterial color={dark ? '#404048' : '#606068'} {...matDarkChrome(dark)} /></mesh>
        <mesh ref={ringRef} position={[0, 0.02, 0]}><torusGeometry args={[0.34, 0.015, 16, 56]} /><meshPhysicalMaterial color={dark ? '#e0e0f0' : '#d0d0e0'} {...matChrome(dark)} /></mesh>
        <mesh ref={beadRef} position={[0.14, 0.14, 0.05]}><sphereGeometry args={[0.09, 40, 40]} /><meshPhysicalMaterial {...matGlass(dark)} color={dark ? '#c8d8f0' : '#d0e0ff'} opacity={0.1} ior={2.0} emissive={dark ? '#6688bb' : '#4466aa'} emissiveIntensity={0} /></mesh>
        <mesh ref={cubeRef} position={[-0.16, 0.2, -0.06]}><boxGeometry args={[0.08, 0.08, 0.08]} /><meshPhysicalMaterial color={dark ? '#e8e8f0' : '#d0d0d8'} {...matChrome(dark)} /></mesh>
        <mesh position={[0, 0.36, 0]}><coneGeometry args={[0.045, 0.1, 24]} /><meshPhysicalMaterial color={dark ? '#2a2a34' : '#505058'} {...matDarkChrome(dark)} /></mesh>
      </group>
    </Float>
  );
}

/* 5 · GYRO-RINGS — the screens' iridescent rings become a gyroscope: three
   rings on different axes around an inner chrome octahedron + glass halo. */
function GyroRings({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);
  const octaRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);
  useFrame(() => {
    const v = vt.current, h = ht.current;
    if (ref.current) ref.current.rotation.y = v * 0.04;
    if (r1.current) r1.current.rotation.z = v * 0.2;
    if (r2.current) r2.current.rotation.x = v * 0.17;
    if (r3.current) r3.current.rotation.y = v * 0.23;
    const spread = mix(1, 1.3, h);
    if (r1.current) r1.current.scale.setScalar(spread);
    if (r2.current) r2.current.scale.setScalar(spread * 0.82);
    if (r3.current) r3.current.scale.setScalar(spread * 0.64);
    if (octaRef.current) { octaRef.current.rotation.x = -v * 0.1; octaRef.current.rotation.y = v * 0.13; }
    if (coreRef.current) (coreRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = mix(dark ? 0.6 : 0.35, dark ? 1.6 : 1.1, h);
  });
  const iri = matChromeIri(dark);
  return (
    <Float speed={0.7} floatIntensity={0.4} rotationIntensity={0.14}>
      <group ref={ref}>
        <mesh ref={r1}><torusGeometry args={[0.46, 0.014, 14, 56]} /><meshPhysicalMaterial color={dark ? '#6070c0' : '#5060b0'} {...iri} /></mesh>
        <mesh ref={r2} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.46, 0.014, 14, 56]} /><meshPhysicalMaterial color={dark ? '#5568cc' : '#4458bb'} {...iri} /></mesh>
        <mesh ref={r3} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.46, 0.012, 14, 56]} /><meshPhysicalMaterial color={dark ? '#7080d0' : '#5868c0'} {...iri} /></mesh>
        <mesh><sphereGeometry args={[0.34, 40, 40]} /><meshPhysicalMaterial {...matGlass(dark)} color={dark ? '#4060c0' : '#5070d0'} opacity={0.06} /></mesh>
        <mesh ref={octaRef}><octahedronGeometry args={[0.16, 0]} /><meshPhysicalMaterial color={dark ? '#d0d0e0' : '#b8b8c8'} {...matChrome(dark)} /></mesh>
        <mesh ref={coreRef}><sphereGeometry args={[0.045, 16, 16]} /><meshPhysicalMaterial color="#ffffff" emissive={dark ? '#4466dd' : '#3355cc'} emissiveIntensity={dark ? 0.6 : 0.35} metalness={0.3} roughness={0.1} /></mesh>
      </group>
    </Float>
  );
}

/* 6 · BEAD-CAGE — the truss reduced to a lantern: a chrome rod cube whose
   eight corners are glass-metal beads, lit from a glowing centre. */
function BeadCage({ dark, hovered }: { dark: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const beadRefs = useRef<THREE.Mesh[]>([]);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ht = useHoverLerp(hovered);
  const vt = useVirtualTime(ht);
  const corners = useMemo(() => {
    const s = 0.34;
    return [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
    ] as [number, number, number][];
  }, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.68, 0.68, 0.68)), []);
  useFrame(() => {
    const v = vt.current, h = ht.current;
    if (ref.current) { ref.current.rotation.y = v * 0.05; ref.current.rotation.x = Math.sin(v * 0.04) * 0.06; }
    beadRefs.current.forEach((m, i) => {
      if (!m) return;
      const dir = corners[i];
      const e = h * 0.14;
      m.position.set(dir[0] * (1 + e / 0.34), dir[1] * (1 + e / 0.34), dir[2] * (1 + e / 0.34));
      m.scale.setScalar(mix(1, 1.4, h));
    });
    if (coreRef.current) (coreRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = mix(dark ? 0.5 : 0.3, dark ? 1.6 : 1.1, h);
  });
  return (
    <Float speed={0.7} floatIntensity={0.5} rotationIntensity={0.15}>
      <group ref={ref}>
        <lineSegments geometry={edges}><lineBasicMaterial color={wireColor(dark)} transparent opacity={dark ? 0.5 : 0.42} /></lineSegments>
        {corners.map((p, i) => (
          <mesh key={i} position={p} ref={(el) => { if (el) beadRefs.current[i] = el; }}>
            <sphereGeometry args={[0.05, 20, 20]} />
            <meshPhysicalMaterial color={dark ? '#f0f0f8' : '#e0e0e8'} metalness={0.6} roughness={0.02} clearcoat={1} clearcoatRoughness={0.01} envMapIntensity={dark ? 3 : 3.5} reflectivity={1} transmission={0.35} transparent opacity={0.92} ior={1.7} />
          </mesh>
        ))}
        <mesh ref={coreRef}><sphereGeometry args={[0.06, 20, 20]} /><meshPhysicalMaterial color="#ffffff" emissive={dark ? '#99bbff' : '#6688bb'} emissiveIntensity={dark ? 0.5 : 0.3} metalness={0.2} roughness={0.05} /></mesh>
      </group>
    </Float>
  );
}

/* Six remixed silhouettes, cycled across the field. Each echoes a principal but
   is a new assembly — related DNA, not a clone. */
const FIELD_COMPONENTS: React.FC<{ dark: boolean; hovered: boolean }>[] = [
  GeodeKnot,
  CagedKnot,
  LensPod,
  SpindleTotem,
  GyroRings,
  BeadCage,
];

/* Discipline label — replicates InteractiveLabel: a plate + upright text that
   fades in only on hover and never spins with the object (it lives OUTSIDE the
   object's own rotating group), so names stay readable exactly like the six. */
function FieldLabel({
  text,
  dark,
  active,
  compact = false,
  fadeRef,
}: {
  text: string;
  dark: boolean;
  active: boolean;
  compact?: boolean;
  fadeRef?: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const textRef = useRef<THREE.Mesh>(null!);
  const lerp = useRef(0);
  const { camera } = useThree();
  const billboardQ = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    const target = active ? 1 : 0;
    lerp.current += (target - lerp.current) * Math.min(delta * 8, 1);
    const l = lerp.current * (fadeRef?.current ?? 1);
    // Billboard: face the camera regardless of how the field is orbited, so the
    // name is always readable. Compensate for the parent's world rotation.
    if (groupRef.current) {
      groupRef.current.parent?.getWorldQuaternion(billboardQ);
      billboardQ.invert().multiply(camera.quaternion);
      groupRef.current.quaternion.copy(billboardQ);
    }
    if (textRef.current) {
      const ts = 0.82 + l * 0.18;
      textRef.current.scale.set(ts, ts, ts);
      (textRef.current as unknown as { fillOpacity: number }).fillOpacity = (dark ? 0.98 : 0.9) * l;
      // Soft glow halo replaces the plate — keeps names legible without a box.
      (textRef.current as unknown as { outlineOpacity: number }).outlineOpacity = (dark ? 0.85 : 0.92) * l;
    }
  });

  return (
    <group ref={groupRef} position={[0, compact ? -0.6 : -0.74, 0.05]}>
      <Text
        ref={textRef}
        fontSize={compact ? 0.104 : 0.125}
        color={dark ? '#e8e4df' : '#1a1a1a'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={compact ? 0.07 : 0.1}
        fillOpacity={0}
        outlineWidth={0.016}
        outlineBlur={0.075}
        outlineColor={dark ? '#000000' : '#faf9f6'}
        outlineOpacity={0}
        renderOrder={999}
        material-depthTest={false}
        material-depthWrite={false}
        maxWidth={compact ? 1.45 : 1.9}
        textAlign="center"
      >
        {text.toUpperCase()}
      </Text>
    </group>
  );
}

/* Screen-space distance fade — the object dissolves toward the edges/corners of
   the view so the field reads as endless: you can see more out there, but it's
   always just past reach. Records each material's resting opacity once, then
   scales it by how far the object sits from screen centre. Runs AFTER the
   object's own animation (it's the last child) so it always wins. */
function FieldFade({ groupRef, fadeRef }: { groupRef: React.RefObject<THREE.Group>; fadeRef: React.RefObject<number> }) {
  const { camera } = useThree();
  const bases = useRef<{ mat: THREE.Material & { opacity: number; transparent: boolean }; base: number }[] | null>(null);
  const wp = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    if (!bases.current) {
      const list: { mat: THREE.Material & { opacity: number; transparent: boolean }; base: number }[] = [];
      g.traverse((o: THREE.Object3D) => {
        const m = (o as THREE.Mesh | THREE.LineSegments).material as THREE.Material | THREE.Material[] | undefined;
        if (!m) return;
        (Array.isArray(m) ? m : [m]).forEach((mm) => {
          const anyMat = mm as THREE.Material & { opacity?: number; transparent: boolean };
          if (typeof anyMat.opacity !== 'number') return;
          anyMat.transparent = true;
          list.push({ mat: anyMat as THREE.Material & { opacity: number; transparent: boolean }, base: anyMat.opacity });
        });
      });
      bases.current = list;
    }
    g.getWorldPosition(wp);
    wp.project(camera);
    const rad = Math.hypot(wp.x, wp.y);      // 0 centre → ~1.4 corner
    let f = clamp((1.3 - rad) / (1.3 - 0.62), 0, 1);
    f = f * f * (3 - 2 * f);                  // smoothstep
    if (fadeRef) (fadeRef as React.MutableRefObject<number>).current = f;
    for (const b of bases.current) b.mat.opacity = b.base * f;
  });
  return null;
}

// A field object IS one of the principal designs, wrapped so it can ripple in
// on expand and respond to hover (which drives the design's own bloom). Each
// instance gets a seeded scale / rotation so repeats never read as clones.
function WebObject3D({
  node,
  index,
  introRef,
  dark,
  labelsAlwaysOn,
  onHover,
}: {
  node: WebNode;
  index: number;
  introRef: React.RefObject<number>;
  dark: boolean;
  labelsAlwaysOn: boolean;
  onHover: (id: string | null) => void;
}) {
  const wrapRef = useRef<THREE.Group>(null!);
  const fadeRef = useRef(1);
  const [hovered, setHovered] = useState(false);
  const Comp = FIELD_COMPONENTS[index % FIELD_COMPONENTS.length];

  const variant = useMemo(() => {
    const s = (n: number) => seededRand(node.position[0] * 3.1 + node.position[1] * 1.7 + node.position[2] * 0.9 + n * 5.3);
    return {
      // Same size class as the parents (~0.8–1.05), with gentle variety.
      scale: 0.8 + s(1) * 0.26,
      rot: [s(2) * Math.PI * 2, s(3) * Math.PI * 2, (s(4) - 0.5) * 0.7] as [number, number, number],
    };
  }, [node.position]);

  useFrame(() => {
    const intro = introRef.current ?? 0;
    // Ripple-out: outer nodes wait for the wave to reach them.
    const local = clamp((intro - node.delay * 0.55) / 0.45, 0, 1);
    const eased = 1 - Math.pow(1 - local, 2);
    if (wrapRef.current) {
      wrapRef.current.scale.setScalar(eased * variant.scale);
      // Cull once the edge fade has taken it to nothing (saves the draw).
      wrapRef.current.visible = eased > 0.02 && fadeRef.current > 0.015;
    }
  });

  return (
    <group position={node.position}>
      <group
        ref={wrapRef}
        rotation={variant.rot}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(node.id); }}
        onPointerOut={() => { setHovered(false); onHover(null); }}
        onClick={(e) => {
          e.stopPropagation();
          // Ignore the click that ends an orbit/pan drag.
          if (_webDragMoved || !node.route || !_navigate) return;
          _navigate(node.route);
        }}
      >
        <Comp dark={dark} hovered={hovered} />
        <FieldFade groupRef={wrapRef} fadeRef={fadeRef} />
      </group>
      <FieldLabel text={node.label ?? ''} dark={dark} active={labelsAlwaysOn || hovered} compact={labelsAlwaysOn} fadeRef={fadeRef} />
    </group>
  );
}

function ExpandedWeb({
  positions,
  introRef,
  dark,
  labelsAlwaysOn,
}: {
  positions: [number, number, number][];
  introRef: React.RefObject<number>;
  dark: boolean;
  labelsAlwaysOn: boolean;
}) {
  const { nodes, edges } = useMemo(() => layoutHeroWeb(positions), [positions]);
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Hovering an object lights up the threads that touch it.
  const hoverRef = useRef<string | null>(null);
  const setHover = useCallback((id: string | null) => {
    hoverRef.current = id;
    document.body.style.cursor = id ? 'pointer' : '';
  }, []);

  const edgeFocus = useRef((key: string) => {
    const h = hoverRef.current;
    if (!h) return 1;
    const [a, b] = key.split('|');
    return a === h || b === h ? 1 : 0.12;
  });

  const fieldNodes = useMemo(() => nodes.filter((n) => n.tier === 'field'), [nodes]);

  return (
    <group>
      <WebEdges edges={edges} nodeById={nodeById} introRef={introRef} focusEdgeRef={edgeFocus} dark={dark} />
      {fieldNodes.map((n, i) => (
        <WebObject3D key={n.id} node={n} index={i} introRef={introRef} dark={dark} labelsAlwaysOn={labelsAlwaysOn} onHover={setHover} />
      ))}
    </group>
  );
}

/* ─── Infinite grid backdrop ───────────────────────────────────────────────
   A single plane behind the whole field whose grid is drawn procedurally — so
   it tiles forever by construction. It scrolls as you pan and fades toward the
   screen edges (in clip space, so it works under any orbit/zoom), giving the
   web an endless graph-paper world to float on. One draw call, truly infinite. */
const gridVertexShader = /* glsl */ `
  varying vec2 vLocal;
  varying vec4 vClip;
  void main() {
    vLocal = position.xy;
    vClip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = vClip;
  }
`;
const gridFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vLocal;
  varying vec4 vClip;
  uniform vec2 uPan;
  uniform float uFade;
  uniform vec3 uColor;
  uniform float uAlpha;
  float gridLine(vec2 c, float cell) {
    vec2 g = abs(fract(c / cell - 0.5) - 0.5) / fwidth(c / cell);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    vec2 c = vLocal + uPan;
    vec2 ndc = vClip.xy / vClip.w;
    float r = length(ndc);
    float edge = 1.0 - smoothstep(0.42, 1.18, r);   // dissolve toward the corners
    float fine = gridLine(c, 1.0);
    float coarse = gridLine(c, 5.0);
    // Major lines carry the structure; fine lines whisper underneath.
    float a = (fine * 0.22 + coarse * 1.0) * edge * uFade * uAlpha;
    if (a < 0.002) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

function InfiniteGrid({ introRef, panRef, dark }: {
  introRef: React.RefObject<number>;
  panRef: React.RefObject<{ x: number; y: number }>;
  dark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({
    uPan: { value: new THREE.Vector2() },
    uFade: { value: 0 },
    uColor: { value: new THREE.Color(dark ? '#8ea2de' : '#6f7f9c') },
    uAlpha: { value: dark ? 0.8 : 0.85 },
  }), [dark]);
  useFrame(() => {
    uniforms.uFade.value = introRef.current ?? 0;
    // The collapsed grid discards every pixel. Avoid running a full-screen
    // derivative shader until its existing fade can actually contribute.
    if (meshRef.current) meshRef.current.visible = uniforms.uFade.value !== 0;
    const p = panRef.current;
    if (p) uniforms.uPan.value.set(-p.x, -p.y);
  });
  return (
    <mesh ref={meshRef} position={[0, 0, -3.5]} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[150, 110]} />
      <shaderMaterial vertexShader={gridVertexShader} fragmentShader={gridFragmentShader} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}

/* ─── Scene Content ─── */

function SceneContent({ reduced, isMobile, dark, expanded }: { reduced: boolean; isMobile: boolean; dark: boolean; expanded: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { camera, size, gl } = useThree();
  // Wheel / pinch zoom offset applied to the expanded camera distance.
  const zoomRef = useRef(0);
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;
  // Drag navigation for the expanded web: orbit (rotate) + pan (move), with
  // inertia. yaw/pitch rotate the whole field; pan slides it laterally.
  const yaw = useRef(0);
  const pitch = useRef(0);
  const yawVel = useRef(0);
  const pitchVel = useRef(0);
  const pan = useRef({ x: 0, y: 0 });
  const panVel = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const aspect = size.height > 0 ? size.width / size.height : 1;
  const useSafeDesktopLayout = !isMobile && (size.width < 1480 || aspect < 0.95);
  const nodes = useMemo(() => (useSafeDesktopLayout ? SAFE_DESKTOP_NODES : NODES), [useSafeDesktopLayout]);
  // Phone screens get a closer, more deliberate resting composition. The
  // desktop framing leaves too much empty air above the hero copy on portrait
  // viewports, so the scene owns the visual stage without entering that copy.
  const sceneScale = isMobile
    ? 0.84
    : useSafeDesktopLayout
      ? clamp(size.width / 760, 0.5, 0.76)
      : 0.76;
  const expandedSceneScale = isMobile ? 0.92 : sceneScale;
  const sceneOffsetX = useSafeDesktopLayout ? clamp((0.82 - aspect) * -0.55, -0.24, 0.16) : 0;
  const narrowCameraPush = !isMobile ? clamp((0.92 - aspect) * 4.8, 0, 2.7) : 0;

  // Expanded-web transition: 0 collapsed → 1 expanded.
  const introRef = useRef(0);
  const collapsedFadeRef = useRef(1);
  const baseCameraZ = isMobile ? 9 : useSafeDesktopLayout ? 7.65 + narrowCameraPush : 7.25;
  const baseCameraY = useSafeDesktopLayout ? 0.18 : 0.3;
  const expandedCameraZ = isMobile ? 11.85 : 12.6;

  const setNodeActive = useCallback((index: number, active: boolean) => {
    setActiveIndex((current) => (active ? index : current === index ? null : current));
  }, []);

  useEffect(() => {
    // Only seed the resting camera; the frame loop owns z/y while transitioning.
    camera.position.z = baseCameraZ;
    camera.position.y = baseCameraY;
    camera.updateProjectionMatrix();
  }, [baseCameraZ, baseCameraY, camera]);

  useEffect(() => {
    if (isMobile) return;
    const h = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    document.addEventListener('mousemove', h, { passive: true });
    return () => document.removeEventListener('mousemove', h);
  }, [isMobile]);

  // Zoom the expanded web with the wheel (desktop) or pinch (touch).
  useEffect(() => {
    const el = gl.domElement;
    const ZOOM_MIN = -5.5; // closer
    const ZOOM_MAX = 4.5;  // farther
    const onWheel = (e: WheelEvent) => {
      if (!expandedRef.current) return;
      e.preventDefault();
      zoomRef.current = clamp(zoomRef.current + e.deltaY * 0.006, ZOOM_MIN, ZOOM_MAX);
    };
    let pinchStart = 0;
    let pinchZoomStart = 0;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (!expandedRef.current || e.touches.length !== 2) return;
      pinchStart = dist(e.touches);
      pinchZoomStart = zoomRef.current;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!expandedRef.current || e.touches.length !== 2 || !pinchStart) return;
      e.preventDefault();
      const ratio = dist(e.touches) / pinchStart;
      zoomRef.current = clamp(pinchZoomStart - (ratio - 1) * 6, ZOOM_MIN, ZOOM_MAX);
    };
    const onTouchEnd = () => { pinchStart = 0; };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [gl]);

  // Drag to orbit (left) or pan (right / middle / shift / two-finger). Runs off
  // the raw canvas so it works no matter what object is under the cursor; the
  // hubs already suppress navigation once a drag has moved.
  useEffect(() => {
    const el = gl.domElement;
    const active = new Set<number>();
    let lastX = 0, lastY = 0;
    let moved = 0;
    let mode: 'orbit' | 'pan' = 'orbit';

    const onDown = (e: PointerEvent) => {
      if (!expandedRef.current) return;
      active.add(e.pointerId);
      if (active.size !== 1) { dragging.current = false; _webDragMoved = true; return; } // 2+ pointers → pinch owns it, block nav
      dragging.current = true;
      moved = 0;
      _webDragMoved = false; // fresh press: a click here should navigate…
      mode = (e.button === 1 || e.button === 2 || e.shiftKey) ? 'pan' : 'orbit';
      lastX = e.clientX; lastY = e.clientY;
      yawVel.current = 0; pitchVel.current = 0; panVel.current.x = 0; panVel.current.y = 0;
      el.style.cursor = mode === 'pan' ? 'move' : 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || active.size !== 1) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6) _webDragMoved = true; // …but a real drag suppresses it
      if (mode === 'orbit') {
        yaw.current += dx * 0.005;
        pitch.current = clamp(pitch.current + dy * 0.005, -0.95, 0.95);
        yawVel.current = dx * 0.005;
        pitchVel.current = dy * 0.005;
      } else {
        const k = 0.014 * (1 + Math.max(0, zoomRef.current) * 0.14);
        pan.current.x += dx * k;
        pan.current.y -= dy * k;
        panVel.current.x = dx * k;
        panVel.current.y = -dy * k;
      }
    };
    const onUp = (e: PointerEvent) => {
      active.delete(e.pointerId);
      if (active.size === 0) { dragging.current = false; el.style.cursor = ''; }
    };
    const onCtx = (e: Event) => { if (expandedRef.current) e.preventDefault(); };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    el.addEventListener('contextmenu', onCtx);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.removeEventListener('contextmenu', onCtx);
    };
  }, [gl]);

  // Reset zoom + camera pose whenever the web closes so reopening starts framed.
  useEffect(() => {
    if (expanded) return;
    zoomRef.current = 0;
    yaw.current = 0; pitch.current = 0; yawVel.current = 0; pitchVel.current = 0;
    pan.current.x = 0; pan.current.y = 0; panVel.current.x = 0; panVel.current.y = 0;
  }, [expanded]);

  useFrame(({ clock }, delta) => {
    // Ease intro toward the target even under reduced-motion (just faster).
    const introTarget = expanded ? 1 : 0;
    const introSpeed = reduced ? 12 : 2.6;
    introRef.current += (introTarget - introRef.current) * Math.min(delta * introSpeed, 1);
    const intro = introRef.current;
    collapsedFadeRef.current = 1 - intro;

    // Camera dollies back as the web opens; recenters vertically. Wheel/pinch
    // zoom only bites once expanded (scaled by intro so it doesn't fight the
    // opening transition).
    camera.position.z = mix(baseCameraZ, expandedCameraZ, intro) + zoomRef.current * intro;
    camera.position.y = mix(baseCameraY, isMobile ? 0.38 : 0.15, intro);

    if (reduced || !groupRef.current) return;
    const t = target.current;
    const m = mouse.current;
    t.x += (m.x - t.x) * 0.012;
    t.y += (m.y - t.y) * 0.012;

    // ── Expanded web: user-driven orbit + pan with inertia. ──
    if (!dragging.current) {
      // Coast on released momentum, then decay to rest.
      yaw.current += yawVel.current; yawVel.current *= 0.92;
      pitch.current = clamp(pitch.current + pitchVel.current, -0.95, 0.95); pitchVel.current *= 0.92;
      pan.current.x += panVel.current.x; panVel.current.x *= 0.9;
      pan.current.y += panVel.current.y; panVel.current.y *= 0.9;
      // Once everything settles, drift very slowly so the field always breathes.
      if (intro > 0.5 && Math.abs(yawVel.current) < 0.0004) yaw.current += 0.0009;
    }
    // Roam widely — the fade hides the true edge long before you reach it.
    pan.current.x = clamp(pan.current.x, -16, 16);
    pan.current.y = clamp(pan.current.y, -11, 11);

    // Collapsed: gentle mouse parallax. Expanded: full orbit/pan. Blend by intro.
    const parallaxY = t.x * 0.1;
    const parallaxX = -t.y * 0.05 + Math.cos(clock.getElapsedTime() * 0.03) * 0.02;
    groupRef.current.rotation.y = mix(parallaxY, yaw.current, intro);
    groupRef.current.rotation.x = mix(parallaxX, pitch.current, intro);
    groupRef.current.rotation.z = 0;
    groupRef.current.position.x = mix(sceneOffsetX, pan.current.x, intro);
    groupRef.current.position.y = mix(0, pan.current.y + (isMobile ? -0.38 : 0), intro);
    groupRef.current.scale.setScalar(mix(sceneScale, expandedSceneScale, intro));
  });

  const positions = useMemo(() => nodes.map(n => n.position), [nodes]);

  return (
    <>
      {/* Dramatic lighting for glass reflections + refractions */}
      <ambientLight intensity={dark ? 0.08 : 0.18} />
      {/* Key light — strong, creates primary glass highlights */}
      <directionalLight intensity={dark ? 2.0 : 1.5} position={[5, 8, 6]} color={dark ? '#eef0ff' : '#ffffff'} />
      {/* Fill light — opens up shadows on glass */}
      <directionalLight intensity={dark ? 0.7 : 0.5} position={[-6, 3, -4]} color={dark ? '#99aadd' : '#c0ccdd'} />
      {/* Rim light — glass edge highlights, critical for glass look */}
      <directionalLight intensity={dark ? 1.2 : 0.9} position={[0, -2, -8]} color={dark ? '#bbccee' : '#aabbcc'} />
      {/* Top accent — specular crown on glass */}
      <pointLight intensity={dark ? 1.5 : 0.9} color="#ffffff" distance={20} position={[0, 6, 4]} />
      {/* Bottom bounce */}
      <pointLight intensity={0.4} color={dark ? '#7788bb' : '#99aabb'} distance={15} position={[-3, -4, 3]} />
      {/* Side accent — catches glass transmission */}
      <pointLight intensity={dark ? 0.6 : 0.4} color={dark ? '#aabbee' : '#bbccdd'} distance={12} position={[4, -1, -2]} />

      {/* Environment reflections — city preset gives complex glass reflections */}
      <HeroEnvironment dark={dark} />

      {/* Endless grid backdrop — only bites once the web opens (uFade = intro). */}
      <InfiniteGrid introRef={introRef} panRef={pan} dark={dark} />

      <group ref={groupRef} scale={sceneScale} position={[sceneOffsetX, 0, 0]}>
        <ConstellationLines positions={positions} dark={dark} fadeRef={collapsedFadeRef} />
        {expanded ? (
          <ExpandedWeb positions={positions} introRef={introRef} dark={dark} labelsAlwaysOn={isMobile} />
        ) : null}

        {/* 0: Installations, Truss (top) */}
        <ClickableObject route={nodes[0].route} position={nodes[0].position} active={activeIndex === 0} onActiveChange={(active) => setNodeActive(0, active)}>
          {(hovered) => <TrussStructure dark={dark} hovered={hovered} />}
        </ClickableObject>

        {/* 1: Design for Good, Chrome knot (right) */}
        <ClickableObject route={nodes[1].route} position={nodes[1].position} active={activeIndex === 1} onActiveChange={(active) => setNodeActive(1, active)}>
          {(hovered) => <PetalRose dark={dark} hovered={hovered} />}
        </ClickableObject>

        {/* 2: Product Design, Morphing screens (center) */}
        <ClickableObject route={nodes[2].route} position={nodes[2].position} active={activeIndex === 2} onActiveChange={(active) => setNodeActive(2, active)}>
          {(hovered) => <MorphingScreens dark={dark} hovered={hovered} />}
        </ClickableObject>

        {/* 3: Brand & Visual, Bauhaus (left) */}
        <ClickableObject route={nodes[3].route} position={nodes[3].position} active={activeIndex === 3} onActiveChange={(active) => setNodeActive(3, active)}>
          {(hovered) => <StackedPlates dark={dark} hovered={hovered} />}
        </ClickableObject>

        {/* 4: AI & Wearables, Lens (bottom left) */}
        <ClickableObject route={nodes[4].route} position={nodes[4].position} active={activeIndex === 4} onActiveChange={(active) => setNodeActive(4, active)}>
          {(hovered) => <LensAssembly dark={dark} hovered={hovered} />}
        </ClickableObject>

        {/* 5: Creative Technology, Geodesic (bottom right) */}
        <ClickableObject route={nodes[5].route} position={nodes[5].position} active={activeIndex === 5} onActiveChange={(active) => setNodeActive(5, active)}>
          {(hovered) => <GlassCrystal dark={dark} hovered={hovered} />}
        </ClickableObject>

        {/* Interactive labels stay hidden until a 3D object is engaged. */}
        {nodes.map((n, i) => (
          <InteractiveLabel
            key={i}
            position={n.position}
            text={n.label}
            offset={n.labelOffset}
            dark={dark}
            route={n.route}
            parentRef={groupRef}
            active={(isMobile && expanded) || activeIndex === i}
          />
        ))}
      </group>

      <ParticleDust count={isMobile ? 100 : 280} reduced={reduced} dark={dark} />
    </>
  );
}

/* ─── Main Component ─── */

/* ─── Named exports for reuse on category/project pages ─── */
export { TrussStructure, PetalRose, MorphingScreens, StackedPlates, LensAssembly, GlassCrystal };
export { useHoverLerp, useVirtualTime, mix };

function HeroEnvironment({ dark }: { dark: boolean }) {
  const texture = useLoader(HeroEnvironmentLoader, getHeroEnvironmentURL());
  useEffect(() => () => texture.dispose(), [texture]);
  return <Environment map={texture} environmentIntensity={dark ? 1.0 : 1.2} />;
}

function SceneActivity({ expanded, dark, onReady }: { expanded: boolean; dark: boolean; onReady?: () => void }) {
  const { gl, scene, camera, advance, size } = useThree();
  const activity = useRef<ReturnType<typeof createSceneActivity> | null>(null);
  const elapsed = useRef(0);
  const reportedReady = useRef(false);
  const shadersPrepared = useRef(false);
  const readyCallback = useRef(onReady);
  readyCallback.current = onReady;
  useEffect(() => {
    const element = gl.domElement.closest<HTMLElement>('.wr-hero-3d') ?? gl.domElement;
    const start = () => {
      shadersPrepared.current = true;
      activity.current = createSceneActivity(element, delta => {
        elapsed.current += delta;
        advance(elapsed.current);
        if (!reportedReady.current) {
          reportedReady.current = true;
          readyCallback.current?.();
        }
      }, { introMs: 1800, idleMs: 1200, interactionFps: 30, wakeOnWheel: expanded });
    };
    let cancelPreparation = () => {};
    if (shadersPrepared.current) start();
    else cancelPreparation = prepareSceneShaders(gl, scene, camera, start);
    return () => { cancelPreparation(); activity.current?.dispose(); activity.current = null; };
  }, [gl, scene, camera, advance, expanded]);
  useEffect(() => { activity.current?.wake(); }, [expanded, dark, size.width, size.height]);
  return null;
}

export default function HeroScene({
  onNavigate,
  onExpandedChange,
  onReady,
}: {
  onNavigate?: (path: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  onReady?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReduced();
  const dark = useThemeMode();
  const webglOk = useWebGLAvailable();
  const performanceDegraded = usePerformanceDegraded();
  const [isMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false,
  );
  const [expanded, setExpanded] = useState(false);

  // Sync navigate callback to module-level ref for R3F access
  useEffect(() => {
    if (onNavigate) _navigate = onNavigate;
    return () => { _navigate = null; };
  }, [onNavigate]);


  // Notify the page so it can fade the hero copy + raise the scrim.
  useEffect(() => { onExpandedChange?.(expanded); }, [expanded, onExpandedChange]);

  // Esc collapses the web. The expanded web remains in the page flow, so the
  // hero can scroll away instead of behaving like a modal overlay.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [expanded]);

  const backButton = (
    <button
      type="button"
      className="hero-web-back figma-hover"
      onClick={() => setExpanded(false)}
      aria-label="Close the web and return to the hero"
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );

  // WebGL unavailable (older device, disabled GPU): keep the hero area's
  // layout intact but skip the 3D canvas (and the web affordance) instead of
  // crashing the page.
  if (!webglOk || performanceDegraded) {
    return <div ref={containerRef} className="hero-3d-canvas" aria-hidden="true" />;
  }

  return (
    <>
      <div ref={containerRef} className={`hero-3d-canvas${expanded ? ' hero-3d-canvas--web' : ''}`}>
      <Canvas events={safeCanvasEvents}
          frameloop="never"
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
          camera={{ fov: 40, near: 0.1, far: 100, position: [0, 0.3, 7.5] }}
          style={{ background: 'transparent' }}
        >
          <SceneActivity expanded={expanded} dark={dark} onReady={onReady} />
          <SceneContent reduced={reduced} isMobile={isMobile} dark={dark} expanded={expanded} />
        </Canvas>
      </div>

      {/* Collapsed: invite. Expanded: exit. The scene is aria-hidden decor, but
          these are real controls, so they carry labels. Keep controls outside
          the canvas wrapper so renderer visibility changes never hide them. */}
      {!expanded ? (
        <button
          type="button"
          className="hero-web-trigger figma-hover"
          onClick={() => setExpanded(true)}
          aria-label="Explore the skills and projects web"
        >
          <span className="hero-web-trigger-dot" aria-hidden="true">
            <SuperwhiteHighlight className="hero-web-trigger-superwhite" />
          </span>
          See how it connects
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : backButton}
    </>
  );
}
import { safeCanvasEvents } from '../utils/canvasEvents';
