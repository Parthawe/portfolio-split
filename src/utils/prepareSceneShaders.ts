import { DoubleSide, HalfFloatType, LinearSRGBColorSpace, Scene, WebGLRenderTarget, type Camera, type Mesh, type MeshPhysicalMaterial, type Material, type WebGLRenderer } from 'three'

/** Keep shader preparation off the rendering path where non-blocking status is available. */
export function prepareSceneShaders(renderer: WebGLRenderer, scene: Scene, camera: Camera, ready: () => void) {
  const context = renderer.getContext()
  const parallel = context.getExtension('KHR_parallel_shader_compile')
  let stopped = false
  let timer = 0
  const startedAt = performance.now()
  const finish = () => {
    if (stopped) return
    stopped = true
    if (parallel) performance.measure('hero:shader-preparation', { start: startedAt, end: performance.now() })
    ready()
  }
  if (!parallel) finish()
  else {
    try {
      renderer.compile(scene, camera)
      // Glass first renders opaque objects into a linear-color target. Those
      // programs differ from the final, tone-mapped screen programs.
      const transmissionScene = new Scene()
      const inTransmissionPass = (material: Material) => !material.transparent || ((material as MeshPhysicalMaterial).transmission > 0 && material.side === DoubleSide)
      scene.traverse(object => {
        const mesh = object as Mesh
        if (!mesh.isMesh) return
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        if (!materials.some(inTransmissionPass)) return
        const clone = mesh.clone(false)
        clone.material = Array.isArray(mesh.material) ? materials.filter(inTransmissionPass) : mesh.material
        transmissionScene.add(clone)
      })
      const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, colorSpace: LinearSRGBColorSpace })
      const previousTarget = renderer.getRenderTarget()
      const previousFace = renderer.getActiveCubeFace()
      const previousLevel = renderer.getActiveMipmapLevel()
      try {
        renderer.setRenderTarget(target)
        renderer.compile(transmissionScene, camera, scene)
      } finally {
        renderer.setRenderTarget(previousTarget, previousFace, previousLevel)
        target.dispose()
        transmissionScene.clear()
      }
      const programs = (renderer.info.programs ?? []).map(program => program.program)
      const check = () => {
        if (stopped) return
        if (context.isContextLost() || performance.now() - startedAt >= 8000 || programs.every(program => context.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR))) finish()
        else timer = window.setTimeout(check, 16)
      }
      check()
    } catch {
      finish()
    }
  }
  return () => { stopped = true; window.clearTimeout(timer) }
}
