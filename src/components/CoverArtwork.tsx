import { lazy, Suspense, useRef } from 'react'
import { coverPreviews } from '../data/coverPreviews'
import ExperienceBoundary from './ExperienceBoundary'
import '../styles/cover-artwork.css'

const CoverPreview = lazy(() => import('./CoverPreview'))

/** Large Index/Arc artwork shares the card player; small list thumbnails stay still. */
export default function CoverArtwork({ slug, src, alt, loading = 'lazy' }: {
  slug: string; src: string; alt: string; loading?: 'eager' | 'lazy'
}) {
  const host = useRef<HTMLSpanElement>(null)
  const preview = coverPreviews[slug]
  if (!preview) return <img src={src} alt={alt} loading={loading} decoding="async" />
  return <span className="cover-art" ref={host} data-cover-tone={preview.tone} data-cover-preview-kind={preview.kind}>
    <img src={src} alt={alt} loading={loading} decoding="async" />
    <ExperienceBoundary fallback={null}><Suspense fallback={null}><CoverPreview cardRef={host} preview={preview} /></Suspense></ExperienceBoundary>
  </span>
}
