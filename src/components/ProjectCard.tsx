import { observeVisible } from '../utils/visibleActivity'
import { lazy, Suspense, memo, useCallback, useEffect, useRef, useState } from 'react'
// Shared cards must not depend on a previous visit to the Work route.
import '../styles/work-page.css'
import { Link } from 'react-router-dom'
import TiltCard from './TiltCard'
import FigmaSelect from './FigmaSelect'
import { getImageBrightness } from '../utils/imageBrightness'
import { normalizeCopy } from '../utils/normalizeCopy'
import { isRequestAccessProject, visibleProjects as projects } from '../data/projects'
import { coverPreviews } from '../data/coverPreviews'
import ExperienceBoundary from './ExperienceBoundary'

const CoverPreview = lazy(() => import('./CoverPreview'))

interface ProjectCardProps {
  slug: string
  name: string
  image: string
  hoverMediaSrc?: string
  hoverMediaKind?: 'image' | 'video'
  hoverMediaAlt?: string
  tag?: string
  year?: string
  desc?: string
  marqueeText?: string
  marqueeSpeed?: number
  loading?: 'eager' | 'lazy'
  /** Keep offscreen homepage media out of the hero’s request queue. */
  deferUntilNearView?: boolean
  preloadMargin?: string
  featured?: boolean
  coverShape?: 'portrait' | 'square' | 'wide'
  /** Force the wide 16:9 cover (for landscape card slots). */
  preferWide?: boolean
  /** Keep the image supplied by the caller instead of substituting a registry cover. */
  useProvidedImage?: boolean
  tilt?: boolean
  tiltIntensity?: number
  nda?: boolean
}

export default memo(function ProjectCard({
  slug, name, image, hoverMediaSrc, hoverMediaKind = 'image',
  tag, year, desc, marqueeText, marqueeSpeed = 20,
  loading = 'lazy', deferUntilNearView = false, preloadMargin = '600px 0px', featured = false, coverShape, preferWide = false, useProvidedImage = false, tilt = false, tiltIntensity = 4, nda = false,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [mediaReady, setMediaReady] = useState(!deferUntilNearView)
  useEffect(() => {
    if (!deferUntilNearView || mediaReady) return
    const card = cardRef.current
    if (!card || typeof IntersectionObserver === 'undefined') { setMediaReady(true); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setMediaReady(true); observer.disconnect() }
    }, { rootMargin: preloadMargin })
    observer.observe(card)
    return () => observer.disconnect()
  }, [deferUntilNearView, mediaReady, preloadMargin])
  const project = projects.find(p => p.slug === slug)
  const coverPreview = useProvidedImage ? undefined : coverPreviews[slug]
  const legacyHoverMedia = coverPreview ? undefined : hoverMediaSrc
  // Wide covers are for featured/highlight slots. Work grid cards use either
  // square or portrait covers to avoid hiding important composition.
  const resolvedCoverShape = coverShape ?? ((featured || preferWide) ? 'wide' : 'portrait')
  const resolvedImage = useProvidedImage
    ? image
    : (resolvedCoverShape === 'square' && project?.cardMockupSquare) ||
      (resolvedCoverShape === 'wide' && project?.cover16x9) ||
      project?.cardMockup ||
      image
  const resolvedAlt = useProvidedImage ? name : project?.cardMockupAlt || name
  const requestAccess = isRequestAccessProject(project) || nda
  const safeTag = tag ? normalizeCopy(tag) : ''
  const safeYear = year ? normalizeCopy(year) : ''
  const safeDesc = desc ? normalizeCopy(desc) : ''
  const safeMarqueeText = marqueeText ? normalizeCopy(marqueeText) : safeDesc
  const marqueeRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (deferUntilNearView && mediaReady) videoRef.current?.load()
  }, [deferUntilNearView, mediaReady])

  useEffect(() => {
    const video = videoRef.current
    const card = video?.closest<HTMLElement>('.pcard')
    if (!video || !card) return
    let visible = false, disposed = false
    const wanted = () => !disposed && visible && (card.matches(':hover') || card.contains(document.activeElement))
    const sync = () => {
      if (wanted()) void video.play().then(() => { if (!wanted()) video.pause() }).catch(() => {})
      else video.pause()
    }
    const stop = observeVisible(card, value => { visible = value; sync() })
    const events = ['pointerenter', 'pointerleave', 'focusin', 'focusout'] as const
    const onIntent = () => queueMicrotask(sync)
    events.forEach(event => card.addEventListener(event, onIntent))
    return () => { disposed = true; stop(); events.forEach(event => card.removeEventListener(event, onIntent)); video.pause() }
  }, [legacyHoverMedia, hoverMediaKind])

  useEffect(() => {
    const track = marqueeRef.current
    const copy = track?.firstElementChild
    if (!track || !copy) return
    // Keep reading speed independent of copy length, font, and breakpoint.
    const measure = (entries: ResizeObserverEntry[]) => {
      // Observer measurements are already batched by layout. Reading offsetWidth
      // here (and during every card's mount) forces deferred sections to render.
      const entry = entries[0]
      const distance = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
      if (distance > 0) track.style.setProperty('--pcard-scroll-duration', `${distance / Math.max(1, marqueeSpeed)}s`)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(copy)
    return () => observer.disconnect()
  }, [safeMarqueeText, marqueeSpeed])

  const handleImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const visual = img.closest('.pcard-visual')
    if (visual) visual.classList.add('loaded')
    const card = img.closest('.pcard')
    if (!card) return

    // Sample the tiny thumbnail before paint so pale covers never flash white text.
    try {
      card.classList.toggle('pcard--light', getImageBrightness(img) > 140)
    } catch {
      // Cross-origin covers cannot be sampled; retain the default treatment.
    }
  }, [])

  const handleImgError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const visual = e.currentTarget.closest('.pcard-visual')
    if (visual) visual.classList.add('loaded') // hide shimmer
    const currentSrc = e.currentTarget.getAttribute('src') || ''
    if (currentSrc !== image) {
      e.currentTarget.setAttribute('src', image)
      return
    }
    e.currentTarget.style.display = 'none'
  }, [image])

  // Prefetch the page chunk on hover so navigation is instant
  const handlePrefetch = useCallback(() => {
    // A cancelled optional preload must not become a page-level error.
    if (project?.page) void project.page().catch(() => {})
  }, [project])

  const card = (
    <Link
      ref={cardRef}
      data-cover-shape={resolvedCoverShape}
      data-cover-preview-kind={coverPreview?.kind}
      data-cover-tone={coverPreview?.tone}
      className={`pcard figma-hover${featured ? ' pcard--featured' : ''}${legacyHoverMedia ? ' pcard--has-hover-media' : ''}${requestAccess ? ' pcard--request-access' : ''}`}
      to={`/${slug}`}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <div className="pcard-inner">
        <div className="pcard-top-row">
          <span className="pcard-tag-stack">
            {safeTag ? <span className="pcard-tag">{safeTag}</span> : null}
            {requestAccess ? (
              <span className="pcard-tag pcard-tag--nda" aria-label="NDA project">
                <svg className="pcard-tag-lock" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                  <path d="M3.35 5.1V4a2.65 2.65 0 0 1 5.3 0v1.1" />
                  <rect x="2.35" y="5" width="7.3" height="5.25" rx="1.15" />
                </svg>
                <span>NDA</span>
              </span>
            ) : null}
          </span>
          <span className="pcard-year">{safeYear}</span>
        </div>
        <div className="pcard-visual">
          <img
            src={mediaReady ? resolvedImage : undefined}
            alt={resolvedAlt}
            loading={loading}
            decoding="async"
            fetchPriority={loading === 'eager' ? 'high' : 'auto'}
            onLoad={handleImgLoad}
            onError={handleImgError}
          />
          {mediaReady && coverPreview ? <ExperienceBoundary fallback={null}><Suspense fallback={null}><CoverPreview preview={coverPreview} cardRef={cardRef} /></Suspense></ExperienceBoundary> : null}
          {legacyHoverMedia ? (
            hoverMediaKind === 'video' ? (
              <video
                ref={videoRef}
                className="pcard-hover-media"
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
              >
                <source src={mediaReady ? legacyHoverMedia : undefined} />
              </video>
            ) : (
              <img
                className="pcard-hover-media"
                src={mediaReady ? legacyHoverMedia : undefined}
                alt=""
                loading={loading}
                decoding="async"
                aria-hidden="true"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )
          ) : null}
        </div>
        <h2 className="pcard-name">{name}</h2>
        {safeMarqueeText && (
          <div className="pcard-marquee" aria-hidden="true">
            <div className="pcard-marquee-track" ref={marqueeRef}>
              <span>{safeMarqueeText}, {safeMarqueeText}, {safeMarqueeText}, </span>
              <span>{safeMarqueeText}, {safeMarqueeText}, {safeMarqueeText}, </span>
            </div>
          </div>
        )}
        <span className="sr-only">
          {safeDesc || safeMarqueeText}{' '}
          {requestAccess ? 'Public preview. Full case study available by request.' : 'View project.'}
        </span>
      </div>
      <FigmaSelect />
    </Link>
  )

  if (!tilt) return card
  return <TiltCard intensity={tiltIntensity}>{card}</TiltCard>
})
