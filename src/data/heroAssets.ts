/** Retain the source HDR for compatibility and recovery. */
export const HERO_ENVIRONMENT_URL = '/Assets/hdri/potsdamer_platz_1k.hdr'
export const HERO_ENVIRONMENT_PACKED_URL = '/Assets/hdri/potsdamer_platz_1k.rgbe.gz'
const HERO_ENVIRONMENT_MOBILE_URL = '/Assets/hdri/potsdamer_platz_512.rgbe.gz'
let heroEnvironmentURL: string | undefined

export function getHeroEnvironmentURL() {
  // Use the same texture for preload and render even if the viewport rotates.
  heroEnvironmentURL ??= typeof DecompressionStream !== 'function' ? HERO_ENVIRONMENT_URL
    : matchMedia('(max-width: 768px)').matches ? HERO_ENVIRONMENT_MOBILE_URL : HERO_ENVIRONMENT_PACKED_URL
  return heroEnvironmentURL
}
