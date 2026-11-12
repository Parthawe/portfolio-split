import { useState, useEffect } from 'react'

/**
 * Detects whether the browser can create a WebGL context.
 * Result is cached for the page lifetime since GPU capability does not
 * change between renders. SSR-safe (assumes available until mounted).
 */
let cached: boolean | null = null

export function canUseWebGL(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return true
  const earlyProbe = (window as Window & { __portfolioWebGLAvailable?: boolean }).__portfolioWebGLAvailable
  if (typeof earlyProbe === 'boolean') { cached = earlyProbe; return cached }
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    cached = !!gl
    // This canvas only probes capability. Release it before the real scene
    // claims a context, particularly on browsers with a small GPU-context limit.
    if (gl) {
      try { (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext() } catch { /* Capability is already known. */ }
    }
  } catch {
    cached = false
  }
  return cached
}

export function useWebGLAvailable() {
  // Start optimistic so SSR/first paint matches the interactive path,
  // then correct on mount if WebGL is genuinely unavailable.
  const [available, setAvailable] = useState(true)
  useEffect(() => {
    setAvailable(canUseWebGL())
  }, [])
  return available
}
