/** Retain the source HDR for compatibility and recovery. */
export const HERO_ENVIRONMENT_URL = '/Assets/hdri/potsdamer_platz_1k.hdr'
export const HERO_ENVIRONMENT_PACKED_URL = '/Assets/hdri/potsdamer_platz_1k.rgbe.gz'

export function getHeroEnvironmentURL() {
  return typeof DecompressionStream === 'function' ? HERO_ENVIRONMENT_PACKED_URL : HERO_ENVIRONMENT_URL
}
