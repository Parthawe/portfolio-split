import { getHeroEnvironmentURL } from '../data/heroAssets'
import { canUseWebGL } from '../hooks/useWebGLAvailable'
import { isExperimental } from '../config/portfolio'
import { isHeroScenePerformanceDegraded } from './performance'

let moduleRequested = false
function warmHeroModule() {
  if (moduleRequested) return
  moduleRequested = true
  void import('../components/HeroScene').catch(() => {})
}

/** Start the unchanged lighting download early after the initial paint. */
export function preloadHeroEnvironmentAsset() {
  const trimSlash = (path: string) => path.replace(/\/$/, '')
  if (typeof document === 'undefined' || isExperimental ||
      trimSlash(window.location.pathname) !== trimSlash(import.meta.env.BASE_URL) ||
      isHeroScenePerformanceDegraded() || !canUseWebGL()) return null
  const existing = document.querySelector<HTMLLinkElement>('link[data-hero-environment]')
  if (existing) {
    warmHeroModule()
    return existing
  }
  const link = document.createElement('link')
  link.dataset.heroEnvironment = ''
  link.rel = 'preload'
  link.as = 'fetch'
  link.href = getHeroEnvironmentURL()
  link.crossOrigin = 'anonymous'
  link.fetchPriority = 'low'
  document.head.append(link)
  // Warm the existing module graph, without constructing a renderer. The page
  // owns user-facing recovery if an optional preload fails.
  warmHeroModule()
  return link
}
