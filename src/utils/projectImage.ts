import metadata from '../data/projectImageMetadata.json'

type ImageMetadata = { width: number; height: number; srcSet?: string }

/** Keep the original src for lightbox access; let the browser choose its display size. */
export function projectImageProps(src?: string) {
  if (!src) return {}
  let key: string
  try { key = decodeURIComponent(src.split('?')[0]) } catch { return {} }
  const image = (metadata as Record<string, ImageMetadata>)[key]
  return image ? {
    'data-original-src': src,
    width: image.width,
    height: image.height,
    srcSet: image.srcSet,
    sizes: '(max-width: 640px) calc(100vw - 40px), (max-width: 1120px) calc(100vw - 80px), 1040px',
  } : {}
}
