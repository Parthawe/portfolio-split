import { createSceneActivity } from '../utils/sceneActivity'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createAsciiModel, modelNames } from './asciiCategoryModels'
import '../styles/ascii-hero-image.css'

type Props = { src?: string; className: string; model?: string; motionEnabled?: boolean }

/** Shared interactive category sculpture rendered with the Three.js ASCII addon. */
export default function AsciiHeroImage({ src, className, model: defaultModel = 'knot', motionEnabled = true }: Props) {
  const host = useRef<HTMLSpanElement>(null)
  const [ready, setReady] = useState(false)
  const pausedRef = useRef(false)
  const requestedModel = new URLSearchParams(window.location.search).get('model')
  const model = requestedModel && modelNames[requestedModel] ? requestedModel : defaultModel
  useEffect(() => {
    const element = host.current
    if (!element) return
    let activity: ReturnType<typeof createSceneActivity> | undefined
    let dirty = true
    let dragging = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }) }
    catch { return }
    renderer.setClearColor(0xffffff, 0)
    renderer.setPixelRatio(1)
    const resolution = .42 // Finer glyphs, with the same object framing.
    const effect = new AsciiEffect(renderer, ' .,:;i1tfLCG08@', { resolution, color: true, alpha: true })
    effect.domElement.className = 'ascii-hero-image__live'
    effect.domElement.setAttribute('aria-hidden', 'true')
    element.appendChild(effect.domElement)
    const sizeEffect = (width: number, height: number) => {
      effect.setSize(width, height)
      const table = effect.domElement.querySelector('table')
      if (table) table.style.letterSpacing = `${-.2 / resolution}px`
    }
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 20)
    camera.position.set(0, .25, 5.8)
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .45, metalness: .12, side: THREE.DoubleSide })
    const mesh = createAsciiModel(model, material)
    mesh.rotation.set(.3, -.3, model === 'knot' ? -.3 : 0)
    scene.add(mesh)
    scene.add(new THREE.AmbientLight(0xffffff, .3))
    const key = new THREE.DirectionalLight(0xffffff, 1.8)
    key.position.set(-3, 4, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffffff, 1)
    rim.position.set(4, -1, -3)
    scene.add(rim)
    const controls = new OrbitControls(camera, effect.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = .075
    controls.rotateSpeed = .65
    controls.autoRotateSpeed = .5 // One turn in about two minutes.
    controls.addEventListener('start', () => { dragging = true; element.dataset.dragging = 'true' })
    controls.addEventListener('end', () => { dragging = false; delete element.dataset.dragging })
    controls.addEventListener('change', () => { dirty = true })
    const resize = new ResizeObserver(() => {
      const width = element.clientWidth
      const height = element.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      sizeEffect(width, height)
      dirty = true
      activity?.wake()
    })
    resize.observe(element)
    sizeEffect(element.clientWidth || 320, element.clientHeight || 320)
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        pausedRef.current = !pausedRef.current
        return
      }
      const axis = event.key === 'ArrowLeft' || event.key === 'ArrowRight' ? 'y' : 'x'
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
      event.preventDefault()
      mesh.rotation[axis] += ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -.18 : .18
      dirty = true
    }
    element.addEventListener('keydown', onKey)
    activity = createSceneActivity(element, delta => {
      controls.autoRotate = motionEnabled && !reducedMotion.matches && !pausedRef.current && !dragging
      controls.enableDamping = !pausedRef.current && !reducedMotion.matches
      if (!pausedRef.current && !reducedMotion.matches) controls.update(delta)
      if (!dirty && !controls.autoRotate) return
      effect.render(scene, camera)
      dirty = false
      setReady(true)
    }, { introMs: 1200, idleMs: 800, fps: 18, interactionFps: 30, wakeOnWheel: false })
    return () => {
      activity?.dispose()
      resize.disconnect()
      controls.dispose()
      element.removeEventListener('keydown', onKey)
      mesh.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose() })
      material.dispose()
      renderer.dispose()
      effect.domElement.remove()
    }
  }, [model, motionEnabled])
  return <span ref={host} className={`${className} ascii-hero-image`} data-ascii-ready={ready} tabIndex={0}
    role="group" aria-label={`Interactive ASCII ${modelNames[model]}. Drag or use arrow keys to rotate. Press Space to pause or resume.`}>
    {src ? <img src={src} alt="" draggable={false} fetchPriority="high" className="ascii-hero-image__fallback" /> : !ready && <span className="ascii-hero-image__unavailable">3D {modelNames[model]}</span>}

  </span>
}
