import { DataTexture, EquirectangularReflectionMapping, FileLoader, HalfFloatType, LinearFilter, LinearSRGBColorSpace } from 'three'
import { RGBELoader } from 'three-stdlib'
import { HERO_ENVIRONMENT_URL } from '../data/heroAssets'
import { decodeHeroEnvironment } from './decodeHeroEnvironment'

/** Faster representation of the same lighting, with the original HDR as recovery. */
export class HeroEnvironmentLoader extends RGBELoader {
  override load(url: string, onLoad: (texture: DataTexture) => void, onProgress?: (event: ProgressEvent) => void, onError?: (error: unknown) => void): DataTexture {
    const loaded = (result: DataTexture) => { result.mapping = EquirectangularReflectionMapping; onLoad(result) }
    if (!url.endsWith('.rgbe.gz')) return super.load(url, loaded, onProgress, onError)
    const texture = new DataTexture()
    const fallback = () => { texture.dispose(); super.load(HERO_ENVIRONMENT_URL, loaded, onProgress, onError) }
    new FileLoader(this.manager).setPath(this.path).setRequestHeader(this.requestHeader).setWithCredentials(this.withCredentials).setResponseType('arraybuffer').load(url, async compressed => {
      try {
        let buffer = compressed as ArrayBuffer
        const bytes = new Uint8Array(buffer)
        // Some static servers send .gz with Content-Encoding; fetch has already
        // decompressed those responses. Others serve the gzip bytes unchanged.
        if (bytes[0] === 31 && bytes[1] === 139) {
          const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))
          buffer = await new Response(stream).arrayBuffer()
        }
        const result = decodeHeroEnvironment(buffer)
        texture.image = result
        texture.type = HalfFloatType
        texture.colorSpace = LinearSRGBColorSpace
        texture.minFilter = texture.magFilter = LinearFilter
        texture.generateMipmaps = false
        texture.flipY = true
        texture.mapping = EquirectangularReflectionMapping
        texture.needsUpdate = true
        onLoad(texture)
      } catch { fallback() }
    }, onProgress, fallback)
    return texture
  }
}
