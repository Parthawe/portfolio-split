import { WebGLRenderer } from 'three'
import type { WebGPURenderer } from 'three/webgpu'

export type ProjectRenderer = WebGLRenderer | WebGPURenderer
/** Opt-in comparison lane. Keep the proven renderer as the default until hardware QA. */
export async function createProjectRenderer(signal: AbortSignal): Promise<ProjectRenderer> {
  const requested = new URLSearchParams(location.search).get('renderer') === 'webgpu'
  if (requested && window.isSecureContext && Boolean((navigator as Navigator & { gpu?: unknown }).gpu) && !signal.aborted) {
    let candidate: WebGPURenderer | undefined
    let expired = false
    let timer = 0
    const attempt = (async () => {
      const { WebGPURenderer } = await import('three/webgpu')
      if (signal.aborted || expired) return undefined
      candidate = new WebGPURenderer({ antialias: true, alpha: false })
      await candidate.init()
      if (signal.aborted || expired) { candidate.dispose(); return undefined }
      // Three can internally choose its WebGL backend; report what actually ran.
      candidate.domElement.dataset.renderer = (candidate.backend as unknown as { isWebGPUBackend?: boolean }).isWebGPUBackend ? 'webgpu' : 'webgl2'
      return candidate
    })().catch(() => { try { candidate?.dispose() } catch { /* Partial initialization. */ } return undefined })
    const renderer = await Promise.race([
      attempt,
      new Promise<undefined>(resolve => { timer = window.setTimeout(() => { expired = true; resolve(undefined) }, 3500) }),
    ])
    clearTimeout(timer)
    if (renderer) return renderer
  }
  if (signal.aborted) throw new DOMException('Scene unmounted', 'AbortError')
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
  renderer.domElement.dataset.renderer = 'webgl'
  return renderer
}
