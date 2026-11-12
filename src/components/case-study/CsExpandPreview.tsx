import { Children, isValidElement, useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { useLocation } from 'react-router-dom'
import { getProject } from '../../data/projects'
import { trackEvent } from '../../utils/analytics'

interface CsExpandPreviewProps {
  expanded?: boolean
  onExpand?: () => void
  children: React.ReactNode
  cta?: string
  ctaLabel?: string
  note?: string
  preview?: React.ReactNode
  /** Public sections rendered by child components rather than direct JSX. */
  sectionIds?: string[]
  previewImage?: string
}

function containsSection(children: ReactNode, id: string): boolean {
  return Children.toArray(children).some(child => {
    if (!isValidElement<{ id?: string; children?: ReactNode }>(child)) return false
    return child.props.id === id || containsSection(child.props.children, id)
  })
}

/** Keep the summary short; mount the full story when the reader opens it. */
export default function CsExpandPreview({
  expanded,
  onExpand,
  children,
  cta,
  ctaLabel = 'Read the full story',
  note = 'Explore the process, decisions, and details.',
  preview,
  previewImage,
  sectionIds,
}: CsExpandPreviewProps) {
  const { pathname } = useLocation()
  const project = getProject(pathname.split('/').filter(Boolean).pop() ?? '')
  // Use only already-public registry imagery; never mount deferred story media here.
  const resolvedPreviewImage = previewImage || (!preview ? (
    project?.access?.publicPreviewImage || project?.summaryImage ||
    project?.cover16x9 || project?.cardMockup || project?.image
  ) : undefined)
  const [failedPreview, setFailedPreview] = useState<string | null>(null)
  const showImage = Boolean(resolvedPreviewImage && failedPreview !== resolvedPreviewImage)
  const [internalExpanded, setInternalExpanded] = useState(false)
  const isExpanded = expanded ?? internalExpanded
  const contentId = useId()
  const content = useRef<HTMLDivElement>(null)
  const requested = useRef(false)
  const linkedSection = useRef<string | null>(null)
  const entryLinkRead = useRef(false)

  useEffect(() => {
    const followSectionLink = () => {
      let id: string
      try { id = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
      if (!id || !(containsSection(children, id) || sectionIds?.includes(id))) return
      if (isExpanded) {
        const target = document.getElementById(id)
        target?.setAttribute('tabindex', '-1')
        target?.focus({ preventScroll: true })
        target?.scrollIntoView({ block: 'start', behavior: 'instant' })
      } else {
        linkedSection.current = id
        requested.current = true
        if (onExpand) onExpand()
        else setInternalExpanded(true)
      }
    }
    // Follow the entry link once. A later reading-mode change is explicit user intent.
    if (!entryLinkRead.current) {
      entryLinkRead.current = true
      if (!isExpanded) followSectionLink()
    }
    window.addEventListener('hashchange', followSectionLink)
    return () => window.removeEventListener('hashchange', followSectionLink)
  }, [children, isExpanded, onExpand, sectionIds])

  useEffect(() => {
    if (isExpanded && requested.current) {
      trackEvent('story_open', pathname)
      const target = (linkedSection.current && document.getElementById(linkedSection.current)) || content.current
      target?.setAttribute('tabindex', '-1')
      target?.focus({ preventScroll: true })
      target?.scrollIntoView({ block: 'start', behavior: 'instant' })
      linkedSection.current = null
      requested.current = false
    }
  }, [isExpanded])

  return (
    <div className="project-story">
      {!isExpanded && <div className={`cs-expand-preview project-story__prompt${showImage ? ' project-story__prompt--image' : ''}`}>
        {showImage && <img className="project-story__preview-image" src={resolvedPreviewImage} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={() => setFailedPreview(resolvedPreviewImage ?? null)} />}
        {!showImage && <div className="project-story__copy">
          {preview ?? <h2>Explore the project</h2>}
          <p>{note}</p>
        </div>}
        <button type="button" className="cs-expand-preview-btn" aria-expanded={false} aria-controls={contentId} onClick={() => {
          requested.current = true
          if (onExpand) onExpand()
          else setInternalExpanded(true)
        }}>
          {cta ?? ctaLabel}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 14 7 7 7-7M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>}
      <div id={contentId} ref={content} tabIndex={-1} hidden={!isExpanded} className="project-story__content">
        {isExpanded ? children : null}
      </div>
    </div>
  )
}
