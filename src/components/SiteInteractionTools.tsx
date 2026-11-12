import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CATEGORIES, visibleProjects } from '../data/projects'
import {
  createPortfolioComment,
  getCommentStoreMode,
  listPortfolioComments,
  normalizeCommentRoute,
  type PortfolioComment,
} from '../lib/commentStore'
import ThemeToggle from './ThemeToggle'
import { CONTACT_EMAIL } from '../config/site'
import { setCanvasChromePreference } from '../utils/performance'

type ToolMode = 'select' | 'paint' | 'comment' | null
type ExportTarget = 'selection' | 'page'
type StrokePresetKey = 'designer' | 'pencil' | 'marker' | 'highlighter' | 'charcoal'

type Point = {
  x: number
  y: number
}

type SelectionRect = {
  x: number
  y: number
  w: number
  h: number
}

type CommentDraft = {
  route: string
  xPercent: number
  yPercent: number
  selector: string | null
}

type InspectInfo = {
  rect: { x: number; y: number; w: number; h: number }
  name: string
  size: string
  font: string
  color: string
  background: string
  radius: string
  pinned: boolean
}

type SitePageItem = {
  label: string
  to: string
  group: 'Pages' | 'Categories' | 'Projects'
}

type LayerItem = {
  label: string
  icon: string
  target?: string
  info?: string
  depth?: number
  active?: boolean
  muted?: boolean
  accent?: boolean
}

type ToolIconName =
  | 'align'
  | 'branch'
  | 'chevron-down'
  | 'chevron-right'
  | 'close-panel'
  | 'command'
  | 'comment'
  | 'component'
  | 'cursor'
  | 'dots'
  | 'eraser'
  | 'export'
  | 'eye'
  | 'frame'
  | 'grid'
  | 'hash'
  | 'image'
  | 'ink'
  | 'layout'
  | 'link'
  | 'list'
  | 'opacity'
  | 'page'
  | 'panel'
  | 'plus'
  | 'refresh'
  | 'ruler'
  | 'stroke-weight'
  | 'zoom'
  | 'search'
  | 'text'
  | 'warning'

function iconName(icon: string): ToolIconName {
  const map: Record<string, ToolIconName> = {
    '▣': 'frame',
    T: 'text',
    '◇': 'component',
    '▦': 'grid',
    '▤': 'layout',
    '⌘': 'command',
    '↳': 'branch',
    '#': 'hash',
    '▧': 'image',
    '↗': 'link',
    '!': 'warning',
    '⠿': 'dots',
    '⌗': 'hash',
    '⋈': 'ruler',
    '✎': 'ink',
  }
  return map[icon] ?? 'frame'
}

function ToolIcon({ name, className }: { name: ToolIconName; className?: string }) {
  const shared = {
    className: className ? `site-ui-icon ${className}` : 'site-ui-icon',
    viewBox: '0 0 16 16',
    fill: 'none',
    'aria-hidden': true,
  }

  switch (name) {
    case 'align':
      return <svg {...shared}><path d="M8 2v12" /><path d="M5 4h6M4 8h8M6 12h4" /></svg>
    case 'branch':
      return <svg {...shared}><path d="M4 3v7a3 3 0 0 0 3 3h5" /><path d="M10 10l3 3-3 3" /></svg>
    case 'chevron-down':
      return <svg {...shared}><path d="M4.5 6.5 8 10l3.5-3.5" /></svg>
    case 'chevron-right':
      return <svg {...shared}><path d="m6.5 4.5 3.5 3.5-3.5 3.5" /></svg>
    case 'close-panel':
      return <svg {...shared}><path d="M5 3h6v10H5z" /><path d="M8 3v10" /></svg>
    case 'command':
      return <svg {...shared}><path d="M6 6H4.75a1.75 1.75 0 1 1 1.75-1.75V6Zm0 0h4m-4 0v4m4-4h1.25A1.75 1.75 0 1 0 9.5 4.25V6Zm.5 4H6m4 0v1.25A1.75 1.75 0 1 1 8.25 9.5H10Zm-4 0H4.75A1.75 1.75 0 1 0 6.5 11.25V10Z" /></svg>
    case 'comment':
      return <svg {...shared}><path d="M3 4.25A1.75 1.75 0 0 1 4.75 2.5h6.5A1.75 1.75 0 0 1 13 4.25v4.5a1.75 1.75 0 0 1-1.75 1.75H8.4L5 13.35V10.5h-.25A1.75 1.75 0 0 1 3 8.75v-4.5Z" /><path d="M5.6 5.8h4.8M5.6 8h3.2" /></svg>
    case 'component':
      return <svg {...shared}><path d="m8 2.5 5.5 5.5L8 13.5 2.5 8 8 2.5Z" /></svg>
    case 'cursor':
      return <svg {...shared}><path d="M4.6 2.8 12 9.2l-4.1.5-2.2 3.5L4.6 2.8Z" /></svg>
    case 'dots':
      return <svg {...shared}><circle cx="5" cy="4" r=".8" fill="currentColor" stroke="none" /><circle cx="11" cy="4" r=".8" fill="currentColor" stroke="none" /><circle cx="5" cy="8" r=".8" fill="currentColor" stroke="none" /><circle cx="11" cy="8" r=".8" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r=".8" fill="currentColor" stroke="none" /><circle cx="11" cy="12" r=".8" fill="currentColor" stroke="none" /></svg>
    case 'eraser':
      return <svg {...shared}><path d="M8.8 3.1a1.3 1.3 0 0 1 1.9 0l2.2 2.2a1.3 1.3 0 0 1 0 1.9l-5.4 5.4H5L2.9 10.5a1.3 1.3 0 0 1 0-1.9l5.9-5.5Z" /><path d="m6.3 5.6 4.1 4.1" /><path d="M7.5 12.6H13" /></svg>
    case 'export':
      return <svg {...shared}><path d="M8 2v8" /><path d="M5 5l3-3 3 3" /><path d="M3 10v3h10v-3" /></svg>
    case 'eye':
      return <svg {...shared}><path d="M2.2 8S4.4 4.4 8 4.4 13.8 8 13.8 8 11.6 11.6 8 11.6 2.2 8 2.2 8Z" /><circle cx="8" cy="8" r="1.6" /></svg>
    case 'frame':
      return <svg {...shared}><rect x="3" y="3" width="10" height="10" rx="1" /><path d="M5 5h6v6H5z" /></svg>
    case 'grid':
      return <svg {...shared}><path d="M3 3h10v10H3z" /><path d="M6.33 3v10M9.67 3v10M3 6.33h10M3 9.67h10" /></svg>
    case 'hash':
      return <svg {...shared}><path d="M6 3 4.8 13M11.2 3 10 13M3.5 6h10M2.8 10h10" /></svg>
    case 'image':
      return <svg {...shared}><rect x="2.5" y="3" width="11" height="10" rx="1.2" /><path d="m4.5 11 2.6-3 2 2 1.2-1.35L12.5 11" /><circle cx="10.8" cy="5.8" r=".85" fill="currentColor" stroke="none" /></svg>
    case 'ink':
      return <svg {...shared}><path d="m11.8 2.8 1.4 1.4-7.6 7.6-2.2.8.8-2.2 7.6-7.6Z" /><path d="m10.4 4.2 1.4 1.4" /></svg>
    case 'layout':
      return <svg {...shared}><rect x="2.5" y="3" width="11" height="10" rx="1.2" /><path d="M2.5 6.5h11M6 6.5V13" /></svg>
    case 'link':
      return <svg {...shared}><path d="M6.7 5.2 8 3.9a3 3 0 0 1 4.2 4.2l-1.3 1.3" /><path d="m9.3 10.8-1.3 1.3A3 3 0 0 1 3.8 7.9l1.3-1.3" /><path d="M6.4 9.6 9.6 6.4" /></svg>
    case 'list':
      return <svg {...shared}><path d="M5 4h8M5 8h8M5 12h8" /><path d="M2.8 4h.1M2.8 8h.1M2.8 12h.1" /></svg>
    case 'opacity':
      return <svg {...shared}><circle cx="8" cy="8" r="5" /><path d="M8 3a5 5 0 0 1 0 10V3Z" fill="currentColor" stroke="none" /></svg>
    case 'page':
      return <svg {...shared}><path d="M4 2.5h5l3 3v8H4z" /><path d="M9 2.5v3h3" /></svg>
    case 'panel':
      return <svg {...shared}><rect x="2.5" y="3" width="11" height="10" rx="1.2" /><path d="M6 3v10" /></svg>
    case 'plus':
      return <svg {...shared}><path d="M8 3v10M3 8h10" /></svg>
    case 'refresh':
      return <svg {...shared}><path d="M12.9 6.6A5 5 0 1 0 13 9" /><path d="M13 2.9v3.7H9.3" /></svg>
    case 'ruler':
      return <svg {...shared}><path d="M4 2.5h8v11H4z" /><path d="M8 2.5v2M8 6v1.5M8 9v1.5M4 5h2M4 8h2M4 11h2" /></svg>
    case 'search':
      return <svg {...shared}><circle cx="7" cy="7" r="3.5" /><path d="m9.8 9.8 3.2 3.2" /></svg>
    case 'stroke-weight':
      return <svg {...shared}><rect x="3" y="3.2" width="10" height="1" rx="0.5" fill="currentColor" stroke="none" /><rect x="3" y="6.9" width="10" height="1.7" rx="0.7" fill="currentColor" stroke="none" /><rect x="3" y="10.4" width="10" height="2.5" rx="0.9" fill="currentColor" stroke="none" /></svg>
    case 'zoom':
      return <svg {...shared}><circle cx="7" cy="7" r="3.5" /><path d="m9.8 9.8 3.2 3.2" /><path d="M7 5.6v2.8M5.6 7h2.8" /></svg>
    case 'text':
      return <svg {...shared}><path d="M3 4V2.8h10V4M8 3v10M5.5 13h5" /></svg>
    case 'warning':
      return <svg {...shared}><path d="m8 2.5 6 11H2l6-11Z" /><path d="M8 6v3.2" /><path d="M8 11.8h.01" /></svg>
    default:
      return <svg {...shared}><rect x="3" y="3" width="10" height="10" rx="1" /></svg>
  }
}

function StrokePresetPreview({ preset, compact = false }: { preset: (typeof strokePresets)[number]; compact?: boolean }) {
  const width = compact ? 24 : 44
  const height = compact ? 16 : 24

  return (
    <svg className={`site-stroke-preview${compact ? ' site-stroke-preview--compact' : ''}`} viewBox="0 0 16 16" width={width} height={height} fill="none" aria-hidden="true">
      <path
        d={strokePresetPath(preset.key)}
        stroke="currentColor"
        strokeWidth={Math.max(1.2, 2.2 * preset.width)}
        strokeLinecap={preset.cap}
        strokeLinejoin="round"
        strokeDasharray={preset.dash?.join(' ')}
        opacity={preset.alpha}
      />
      {preset.texture === 'pencil' && (
        <path d="M3.5 12.2 C6 7.5 8 11.2 11.7 5.4" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeDasharray="1 2.2" opacity="0.55" />
      )}
      {preset.texture === 'charcoal' && (
        <>
          <circle cx="4.4" cy="10.1" r="0.55" fill="currentColor" opacity="0.55" />
          <circle cx="8.2" cy="8.9" r="0.45" fill="currentColor" opacity="0.38" />
          <circle cx="11.6" cy="6.9" r="0.62" fill="currentColor" opacity="0.46" />
        </>
      )}
    </svg>
  )
}

const tintOptions = [
  { label: 'blue', value: 'oklch(63% 0.19 258)' },
  { label: 'iris', value: 'oklch(62% 0.18 288)' },
  { label: 'cyan', value: 'oklch(72% 0.14 210)' },
  { label: 'coral', value: 'oklch(66% 0.19 28)' },
  { label: 'rose', value: 'oklch(67% 0.18 355)' },
  { label: 'moss', value: 'oklch(66% 0.16 148)' },
  { label: 'amber', value: 'oklch(76% 0.16 82)' },
  { label: 'graphite', value: 'oklch(32% 0.02 265)' },
]

const cursorAccentOptions = [
  { label: 'blue', value: 'oklch(63% 0.19 258)' },
  { label: 'iris', value: 'oklch(62% 0.18 288)' },
  { label: 'cyan', value: 'oklch(72% 0.14 210)' },
  { label: 'coral', value: 'oklch(66% 0.19 28)' },
  { label: 'moss', value: 'oklch(66% 0.16 148)' },
  { label: 'amber', value: 'oklch(76% 0.16 82)' },
]

const strokePresets: Array<{
  key: StrokePresetKey
  label: string
  note: string
  width: number
  alpha: number
  cap: CanvasLineCap
  dash?: number[]
  texture?: 'pencil' | 'charcoal'
}> = [
  { key: 'designer', label: 'Designer', note: 'clean vector line', width: 1, alpha: 1, cap: 'round' },
  { key: 'pencil', label: 'Pencil', note: 'light sketch grain', width: 0.62, alpha: 0.78, cap: 'round', texture: 'pencil' },
  { key: 'marker', label: 'Marker', note: 'bold presentation', width: 1.75, alpha: 0.86, cap: 'round' },
  { key: 'highlighter', label: 'Highlighter', note: 'transparent chisel', width: 2.45, alpha: 0.34, cap: 'butt' },
  { key: 'charcoal', label: 'Charcoal', note: 'artist edge', width: 1.25, alpha: 0.7, cap: 'round', dash: [1, 7], texture: 'charcoal' },
]

const contentAlignOptions = [
  { value: 'left', label: 'Left', lines: [0.62, 0.42, 0.74] },
  { value: 'center', label: 'Center', lines: [0.52, 0.76, 0.42] },
  { value: 'right', label: 'Right', lines: [0.68, 0.46, 0.6] },
] as const

function strokePresetPath(key: StrokePresetKey) {
  switch (key) {
    case 'pencil':
      return 'M3 13 C5 7 7 12 9 6 S12 3 14 7'
    case 'marker':
      return 'M2.5 10.5 C5 5 8.5 12 13.5 4.5'
    case 'highlighter':
      return 'M2 9 L14 5'
    case 'charcoal':
      return 'M2.5 11 C5 3.5 8.5 13.5 13.5 6'
    case 'designer':
    default:
      return 'M2.5 10 C5 6 8.5 12 13.5 4.5'
  }
}

const categoryPaths: Record<string, string> = {
  all: '/work',
  ux: '/ux-design',
  research: '/ux-research',
  good: '/design-for-good',
  ai: '/ai-wearables',
  creative: '/design-engineering',
  install: '/installations',
  brand: '/brand-visual',
}

const corePages: SitePageItem[] = [
  { label: 'Home', to: '/', group: 'Pages' },
  { label: 'Work', to: '/work', group: 'Pages' },
  { label: 'About', to: '/about', group: 'Pages' },
  { label: 'Accessibility', to: '/accessibility', group: 'Pages' },
]

const categoryPages: SitePageItem[] = CATEGORIES
  .filter(category => category.key !== 'all')
  .map(category => ({
    label: category.label,
    to: categoryPaths[category.key] || '/work',
    group: 'Categories' as const,
  }))

const projectPages: SitePageItem[] = visibleProjects.map(project => ({
  label: project.name,
  to: `/${project.slug}`,
  group: 'Projects' as const,
}))

const sitePageItems = [...corePages, ...categoryPages, ...projectPages]
const sitePageGroups = ['Pages', 'Categories', 'Projects'] as const

function rectFromPoints(start: Point, end: Point): SelectionRect {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
  }
}

function pagePointFromPointer(event: React.PointerEvent): Point {
  return {
    x: event.clientX + window.scrollX,
    y: event.clientY + window.scrollY,
  }
}

function titleFromPath(pathname: string) {
  const pathParts = pathname.split('/').filter(Boolean)
  const slug = pathParts[pathParts.length - 1] || 'home'
  if (slug === 'Portfolio.github.io') return 'Home'
  if (slug === 'work') return 'Work'
  if (slug === 'about') return 'About'
  if (slug === 'accessibility') return 'Accessibility'
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function currentProjectLabel(pathname: string) {
  if (pathname === '/' || pathname.endsWith('/')) return 'Home scroll'
  if (pathname.endsWith('/about')) return 'Bio scroll'
  if (pathname.endsWith('/accessibility')) return 'Audit stack'
  return 'Case study'
}

function isActivePage(pathname: string, to: string) {
  if (to === '/') return pathname === '/' || pathname.endsWith('/')
  return pathname === to || pathname.endsWith(to)
}

function groupCount(group: SitePageItem['group']) {
  return sitePageItems.filter(page => page.group === group).length
}

function filenameFromLabel(label: string, extension: string) {
  return `${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'portfolio-export'}.${extension}`
}

function firstElementForTarget(target?: string) {
  const selectorList = target?.split(',').map(selector => selector.trim()).filter(Boolean) ?? []
  return selectorList
    .map(selector => document.querySelector<HTMLElement>(selector))
    .find((element): element is HTMLElement => Boolean(element))
}

// Selectors the inspector must never highlight — its own chrome and the
// design-tool overlays sitting above the page.
const INSPECT_IGNORE = [
  '.site-tools',
  '.site-layers-panel',
  '.site-figbar',
  '.site-comment-layer',
  '.site-comment-card',
  '.site-inspect-outline',
  '.site-tool-overlay',
  '.figma-ruler',
  '.figma-ruler-top',
  '.figma-ruler-corner',
  '.figma-cursor-label',
].join(', ')

function shortColor(value: string) {
  // Collapse fully transparent fills to a readable token.
  if (!value || value === 'rgba(0, 0, 0, 0)' || value === 'transparent') return 'None'
  return value.replace(/\s+/g, ' ').trim()
}

// Read the real, on-screen properties of an element so the panel can show
// Figma-style inspect data instead of static placeholders.
function describeElement(element: HTMLElement, pinned = false): InspectInfo {
  const rect = element.getBoundingClientRect()
  const styles = getComputedStyle(element)
  const classes = typeof element.className === 'string' ? element.className.trim() : ''
  const classSuffix = classes
    ? '.' + classes.split(/\s+/).filter(name => !name.startsWith('site-') && !name.startsWith('figma-')).slice(0, 2).join('.')
    : ''
  const name = element.id
    ? `#${element.id}`
    : `${element.tagName.toLowerCase()}${classSuffix === '.' ? '' : classSuffix}`
  const fontFamily = styles.fontFamily.split(',')[0].replace(/["']/g, '').trim()

  return {
    rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
    name,
    size: `${Math.round(rect.width)} × ${Math.round(rect.height)}`,
    font: `${Math.round(Number.parseFloat(styles.fontSize) || 0)}px ${fontFamily}`,
    color: shortColor(styles.color),
    background: shortColor(styles.backgroundColor),
    radius: styles.borderRadius === '0px' ? '0' : styles.borderRadius,
    pinned,
  }
}

function collectExportCss() {
  return Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n')
      } catch {
        return ''
      }
    })
    .filter(Boolean)
    .join('\n')
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function commentPositionFromViewportPoint(clientX: number, clientY: number, route: string): CommentDraft {
  const documentElement = document.documentElement
  return {
    route,
    xPercent: ((clientX + window.scrollX) / Math.max(documentElement.scrollWidth, 1)) * 100,
    yPercent: ((clientY + window.scrollY) / Math.max(documentElement.scrollHeight, 1)) * 100,
    selector: null,
  }
}

function commentPositionFromPointer(event: React.PointerEvent<HTMLElement>, route: string): CommentDraft {
  return commentPositionFromViewportPoint(event.clientX, event.clientY, route)
}

function commentViewportPoint(comment: Pick<PortfolioComment | CommentDraft, 'xPercent' | 'yPercent'>) {
  const documentElement = document.documentElement
  return {
    x: (comment.xPercent / 100) * documentElement.scrollWidth - window.scrollX,
    y: (comment.yPercent / 100) * documentElement.scrollHeight - window.scrollY,
  }
}

function commentPinStyle(comment: Pick<PortfolioComment | CommentDraft, 'xPercent' | 'yPercent'>): CSSProperties {
  const point = commentViewportPoint(comment)
  return {
    left: point.x,
    top: point.y,
  }
}

function commentCardStyle(comment: Pick<PortfolioComment | CommentDraft, 'xPercent' | 'yPercent'>): CSSProperties {
  const point = commentViewportPoint(comment)
  return {
    left: Math.min(Math.max(point.x + 18, 12), Math.max(window.innerWidth - 340, 12)),
    top: Math.min(Math.max(point.y - 10, 76), Math.max(window.innerHeight - 260, 76)),
  }
}

function replaceCanvasClones(sourceElement: HTMLElement, clone: HTMLElement) {
  const sourceCanvases = Array.from(sourceElement.querySelectorAll('canvas'))
  const clonedCanvases = Array.from(clone.querySelectorAll('canvas'))

  sourceCanvases.forEach((canvas, index) => {
    const clonedCanvas = clonedCanvases[index]
    if (!clonedCanvas) return

    try {
      const image = document.createElement('img')
      image.src = canvas.toDataURL('image/png')
      image.alt = ''
      image.width = canvas.clientWidth || canvas.width
      image.height = canvas.clientHeight || canvas.height
      image.style.cssText = (clonedCanvas as HTMLElement).style.cssText
      image.style.display = 'block'
      image.style.width = `${canvas.clientWidth || canvas.width}px`
      image.style.height = `${canvas.clientHeight || canvas.height}px`
      clonedCanvas.replaceWith(image)
    } catch {
      clonedCanvas.remove()
    }
  })
}

function layersForPath(pathname: string): LayerItem[] {
  const pathParts = pathname.split('/').filter(Boolean)
  const slug = pathParts[pathParts.length - 1] || ''
  const currentProject = visibleProjects.find(project => project.slug === slug)

  if (currentProject) {
    return [
      { label: currentProject.name, icon: '▣', target: '#main-content, .project-main', info: currentProject.nda ? 'Request-access project' : 'Public project', active: true },
      { label: 'Case hero', icon: 'T', target: '.proj-hero-system, .proj-visual-hero, .tf-hero', info: 'Opening narrative', depth: 1 },
      { label: currentProject.nda ? 'NDA public preview' : 'Project proof', icon: '◇', target: '#cs-public-story, .cs-quick-summary-shell, .proj-fastread', info: currentProject.nda ? 'Safe public preview' : 'Evidence summary', depth: 1, accent: currentProject.nda },
      { label: 'Role / Scope / Duration', icon: '▦', target: '.proj-info-row, .proj-fastread, .cs-stat-grid', info: 'Project metadata', depth: 1 },
      { label: 'Media spotlight', icon: '▤', target: '.cs-media-spotlight, .cs-media, .proj-hero-img, video, iframe', info: 'Visual proof', depth: 1 },
      { label: 'Problem', icon: 'T', target: '[id*="problem"], .cs-section:nth-of-type(2)', info: 'Context', depth: 2 },
      { label: 'Move', icon: 'T', target: '[id*="move"], [id*="process"], .cs-section:nth-of-type(3)', info: 'Design action', depth: 2 },
      { label: 'Outcome', icon: 'T', target: '[id*="outcome"], [id*="result"], .cs-section:nth-of-type(4)', info: 'Result', depth: 2 },
      { label: 'Case controls', icon: '⌘', target: '.cs-bottom-nav, .cs-quick-summary-toggle', info: 'Navigation', depth: 1 },
      { label: 'Next project', icon: '↳', target: '.next-project', info: 'Next frame', depth: 1 },
    ]
  }

  if (pathname.endsWith('/work')) {
    return [
      { label: 'Work', icon: '▣', target: '#main-content', info: 'Project index', active: true },
      { label: 'Navigation chrome', icon: '▤', target: '.nav', info: 'Persistent shell', depth: 1 },
      { label: 'Category filter bar', icon: '⌘', target: '.work-filter-inline, .work-bottom-nav', info: 'Browse controls', depth: 1 },
      { label: 'Intro copy', icon: 'T', target: '.work-page-intro, .work-page-header', info: 'Recruiter framing', depth: 1 },
      { label: 'Project counts', icon: '#', target: '.work-page-intro-meta, .work-filter-inline', info: 'Selected/archive totals', depth: 1 },
      { label: 'View switcher', icon: '▦', target: '.work-view-switch', info: 'Editorial / index / arc', depth: 1 },
      { label: 'Selected work grid', icon: '▣', target: '.work-group--selected, #work-project-results', info: 'Flagship proof', depth: 1 },
      { label: 'NDA preview tags', icon: '◇', target: '.pcard-tag--nda', info: 'Access disclosure', depth: 2, accent: true },
      { label: 'Archive grid', icon: '▧', target: '.work-group--archive', info: 'Older experiments', depth: 1 },
      { label: 'Bottom category controller', icon: '⌘', target: '.work-bottom-nav', info: 'Mobile filter', depth: 1 },
    ]
  }

  if (pathname.endsWith('/about')) {
    return [
      { label: 'About', icon: '▣', target: '#main-content', info: 'Profile page', active: true },
      { label: 'Profile statement', icon: 'T', target: '.abt-photo-hero, .abt-paper', info: 'Positioning', depth: 1 },
      { label: 'Experience timeline', icon: '▦', target: '.abt-table-wrap', info: 'Career proof', depth: 1 },
      { label: 'Practice & beliefs', icon: '◇', target: '.abt-practice, .abt-beyond', info: 'Design beliefs', depth: 1 },
      { label: 'Contact block', icon: '↗', target: '.abt-cta, .footer', info: 'Reach out', depth: 1 },
    ]
  }

  if (pathname.endsWith('/accessibility')) {
    return [
      { label: 'Accessibility', icon: '▣', target: '#main-content', info: 'Document page', active: true },
      { label: 'Intent', icon: '◇', target: '#intent', info: 'Why this exists', depth: 1 },
      { label: 'Current state', icon: '▤', target: '#current-state', info: 'What is handled', depth: 1 },
      { label: 'Known gaps', icon: '!', target: '#known-gaps', info: 'Remaining concerns', depth: 1 },
    ]
  }

  if (categoryPages.some(page => isActivePage(pathname, page.to))) {
    return [
      { label: titleFromPath(pathname), icon: '▣', target: '#main-content', info: 'Category page', active: true },
      { label: 'Category hero', icon: 'T', target: '.ch', info: 'Category framing', depth: 1 },
      { label: 'Project collection', icon: '▦', target: '.pcard, .lp-section-label', info: 'Filtered projects', depth: 1 },
      { label: 'Related work', icon: '↳', target: '.wr-reveal-section, .lp-approach', info: 'More routes', depth: 1 },
      { label: 'Footer', icon: '▤', target: '.footer', info: 'Contact frame', depth: 1 },
    ]
  }

  return [
    { label: 'Home', icon: '▣', target: '#main-content', info: 'Landing canvas', active: true },
    { label: 'Hero system', icon: 'T', target: '.wr-hero', info: 'Opening position', depth: 1 },
    { label: '3D object field', icon: '◇', target: '.wr-hero-3d, canvas', info: 'Interactive identity', depth: 1, accent: true },
    { label: 'Flagship work', icon: '▦', target: '.wr-featured-v2', info: 'Recruiter proof', depth: 1 },
    { label: 'Who I am tabs', icon: '▤', target: '.wr-identity', info: 'About preview', depth: 1 },
    { label: 'Discipline range', icon: '↳', target: '.wr-disciplines', info: 'Ways of working', depth: 1 },
    { label: 'Selected archive', icon: '▧', target: '.wr-archive', info: 'Archive preview', depth: 1 },
    { label: 'Footer', icon: '▤', target: '.footer', info: 'Contact frame', depth: 1 },
  ]
}

function hasLayerChildren(layers: LayerItem[], index: number) {
  const depth = layers[index]?.depth ?? 0
  return (layers[index + 1]?.depth ?? 0) > depth
}

function layerKey(pathname: string, layer: LayerItem, index: number) {
  return `${pathname}:${index}:${layer.label}`
}

function visibleLayerEntries(layers: LayerItem[], pathname: string, collapsedKeys: Set<string>) {
  const hiddenDepths: number[] = []

  return layers
    .map((layer, index) => ({ layer, index, key: layerKey(pathname, layer, index), hasChildren: hasLayerChildren(layers, index) }))
    .filter(entry => {
      const depth = entry.layer.depth ?? 0
      while (hiddenDepths.length && depth <= hiddenDepths[hiddenDepths.length - 1]) {
        hiddenDepths.pop()
      }
      const hidden = hiddenDepths.length > 0
      if (!hidden && entry.hasChildren && collapsedKeys.has(entry.key)) {
        hiddenDepths.push(depth)
      }
      return !hidden
    })
}

export default function SiteInteractionTools() {
  const { pathname } = useLocation()
  // Figma mode is an opt-in easter egg: every visit starts on the plain
  // portfolio, never restored from a previous session.
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ToolMode>(null)
  const [selection, setSelection] = useState<SelectionRect | null>(null)
  const [lastSelection, setLastSelection] = useState<SelectionRect | null>(null)
  const [activeTint, setActiveTint] = useState(tintOptions[0].label)
  const [activeCursorAccent, setActiveCursorAccent] = useState(cursorAccentOptions[0].label)
  const [brushSize, setBrushSize] = useState(5)
  const [strokePreset, setStrokePreset] = useState<StrokePresetKey>('designer')
  const [paintOpacity, setPaintOpacity] = useState(72)
  const [tintStrength, setTintStrength] = useState(38)
  const [overlayOpacity, setOverlayOpacity] = useState(14)
  const [zoomScale, setZoomScale] = useState(100)
  const [inkHidden, setInkHidden] = useState(false)
  const [gridEnabled, setGridEnabled] = useState(false)
  const [dotsEnabled, setDotsEnabled] = useState(false)
  const [rulersEnabled, setRulersEnabled] = useState(false)
  const [strokeEnabled, setStrokeEnabled] = useState(false)
  const [contentAlign, setContentAlign] = useState<'left' | 'center' | 'right'>('center')
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0)
  const [collapsedPageGroups, setCollapsedPageGroups] = useState<Set<SitePageItem['group']>>(() => new Set(['Projects']))
  const [collapsedLayerKeys, setCollapsedLayerKeys] = useState<Set<string>>(() => new Set())
  const [exportTarget, setExportTarget] = useState<ExportTarget>('selection')
  const [exportStatus, setExportStatus] = useState<'ready' | 'exporting' | 'done' | 'fallback'>('ready')
  const [comments, setComments] = useState<PortfolioComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [commentNotice, setCommentNotice] = useState('')
  const [draftComment, setDraftComment] = useState<CommentDraft | null>(null)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  const [commentBody, setCommentBody] = useState('')
  const [commentSaving, setCommentSaving] = useState(false)
  const [viewportVersion, setViewportVersion] = useState(0)
  const [inspect, setInspect] = useState<InspectInfo | null>(null)
  const inspectRafRef = useRef(0)
  const [commentAuthor, setCommentAuthor] = useState(() => {
    try {
      return window.localStorage.getItem('portfolio-comment-author') || ''
    } catch {
      return ''
    }
  })
  const [commentEmail, setCommentEmail] = useState(() => {
    try {
      return window.localStorage.getItem('portfolio-comment-email') || ''
    } catch {
      return ''
    }
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const selectingRef = useRef(false)
  const startRef = useRef<Point | null>(null)
  const lastPaintRef = useRef<Point | null>(null)
  const currentCommentRoute = normalizeCommentRoute(pathname)
  const commentStoreMode = getCommentStoreMode()
  const publishedComments = comments.filter(comment => comment.status === 'open')
  const pendingComments = comments.filter(comment => comment.status === 'pending')
  const activeStrokePreset = strokePresets.find(option => option.key === strokePreset) ?? strokePresets[0]

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('site-tools:ready'))
  }, [])

  const configurePaintContext = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = activeStrokePreset.cap
    ctx.lineJoin = 'round'
    ctx.lineWidth = Math.max(1, brushSize * activeStrokePreset.width)
    ctx.globalAlpha = Math.min(1, (paintOpacity / 100) * activeStrokePreset.alpha)
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--site-tool-ink').trim() || 'oklch(63% 0.19 258)'
    ctx.setLineDash(activeStrokePreset.dash ?? [])
  }, [activeStrokePreset, brushSize, paintOpacity])

  const drawPaintSegment = useCallback((ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
    const ink = getComputedStyle(document.body).getPropertyValue('--site-tool-ink').trim() || 'oklch(63% 0.19 258)'
    const dx = to.x - from.x
    const dy = to.y - from.y
    const distance = Math.hypot(dx, dy)

    ctx.save()
    configurePaintContext(ctx)

    if (activeStrokePreset.key === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply'
    }

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()

    if (activeStrokePreset.texture === 'pencil') {
      ctx.globalAlpha = Math.min(0.42, (paintOpacity / 100) * 0.38)
      ctx.lineWidth = Math.max(0.75, brushSize * 0.28)
      ctx.setLineDash([1, 4])
      ctx.beginPath()
      ctx.moveTo(from.x + 0.65, from.y - 0.55)
      ctx.lineTo(to.x + 0.65, to.y - 0.55)
      ctx.stroke()
    }

    if (activeStrokePreset.texture === 'charcoal' && distance > 0) {
      ctx.setLineDash([])
      ctx.fillStyle = ink
      const steps = Math.max(1, Math.min(7, Math.floor(distance / 9)))
      for (let i = 0; i < steps; i += 1) {
        const t = (i + 0.5) / steps
        const wobble = Math.sin((from.x + from.y + i * 17) * 0.035) * brushSize * 0.38
        ctx.globalAlpha = Math.min(0.32, (paintOpacity / 100) * 0.28)
        ctx.beginPath()
        ctx.arc(from.x + dx * t - dy * 0.012 + wobble, from.y + dy * t + dx * 0.012 - wobble, Math.max(0.65, brushSize * 0.12), 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.restore()
  }, [activeStrokePreset, brushSize, configurePaintContext, paintOpacity])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const snapshot = document.createElement('canvas')
    snapshot.width = canvas.width
    snapshot.height = canvas.height
    const snapshotCtx = snapshot.getContext('2d')
    if (snapshotCtx && canvas.width && canvas.height) {
      snapshotCtx.drawImage(canvas, 0, 0)
    }

    const doc = document.documentElement
    const appRoot = document.getElementById('root') ?? document.body
    const appBounds = appRoot.getBoundingClientRect()
    const docWidth = Math.max(window.innerWidth, appRoot.scrollWidth, appRoot.offsetWidth, doc.clientWidth)
    const docHeight = Math.max(
      window.innerHeight,
      Math.ceil(appBounds.bottom + window.scrollY),
      appRoot.scrollHeight,
      appRoot.offsetHeight,
      document.body?.offsetHeight ?? 0,
    )

    canvas.width = Math.round(docWidth * dpr)
    canvas.height = Math.round(docHeight * dpr)
    canvas.style.width = `${docWidth}px`
    canvas.style.height = `${docHeight}px`

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    configurePaintContext(ctx)

    if (snapshotCtx && snapshot.width && snapshot.height) {
      ctx.drawImage(snapshot, 0, 0, snapshot.width / dpr, snapshot.height / dpr)
    }
  }, [configurePaintContext])

  const clearZoom = useCallback(() => {
    const stage = document.getElementById('site-zoom-stage')
    if (!stage) return
    stage.style.transform = ''
    stage.style.transformOrigin = ''
    document.body.classList.remove('site-area-zoomed')
    setZoomScale(100)
  }, [])

  // The panel and FigmaZoom own two separate zoom transforms (crop-zoom on the
  // stage, page-zoom on #root). Reset both so "100%" always means 100%.
  const resetZoom = useCallback(() => {
    clearZoom()
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: '0',
      metaKey: true,
      bubbles: true,
      cancelable: true,
    }))
  }, [clearZoom])

  const clearPaint = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const loadComments = useCallback(async () => {
    setCommentsLoading(true)
    setCommentsError('')
    try {
      setComments(await listPortfolioComments(currentCommentRoute))
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : 'Could not load comments')
    } finally {
      setCommentsLoading(false)
    }
  }, [currentCommentRoute])

  const submitComment = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draftComment || !commentBody.trim()) return

    setCommentSaving(true)
    setCommentsError('')
    setCommentNotice('')
    try {
      const authorName = commentAuthor.trim() || 'Guest'
      const authorEmail = commentEmail.trim() || null
      const saved = await createPortfolioComment({
        route: draftComment.route,
        xPercent: draftComment.xPercent,
        yPercent: draftComment.yPercent,
        selector: draftComment.selector,
        authorName,
        authorEmail,
        body: commentBody.trim(),
      })

      setComments(current => [...current, saved].sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
      setDraftComment(null)
      setActiveCommentId(saved.id)
      setCommentBody('')
      setCommentNotice(
        commentStoreMode === 'database'
          ? 'Your note was sent for review. It will appear publicly only after approval.'
          : 'Your note is saved in this browser preview only.',
      )

      try {
        window.localStorage.setItem('portfolio-comment-author', authorName)
        if (authorEmail) {
          window.localStorage.setItem('portfolio-comment-email', authorEmail)
        }
      } catch {
        // Remembering author details is optional.
      }
    } catch (error) {
      setCommentsError(error instanceof Error ? error.message : 'Could not save comment')
    } finally {
      setCommentSaving(false)
    }
  }, [commentAuthor, commentBody, commentEmail, commentStoreMode, draftComment])

  const resetAll = useCallback(() => {
    setMode(null)
    setSelection(null)
    setLastSelection(null)
    resetZoom()
    clearPaint()
    document.body.classList.remove('site-tinted')
    document.body.style.removeProperty('--site-tint')
    document.body.style.removeProperty('--site-tint-soft')
    document.body.style.removeProperty('--site-tint-faint')
    document.body.style.removeProperty('--site-tint-border')
    document.body.style.removeProperty('--site-tint-strong')
    document.body.style.removeProperty('--site-tool-ink')
    document.body.style.removeProperty('--select-blue')
    document.body.style.removeProperty('--project-color')
    document.body.style.removeProperty('--accent-hi')
    document.body.style.removeProperty('--accent-hi-70')
    document.body.style.removeProperty('--accent-hi-50')
    document.body.style.removeProperty('--accent-hi-30')
    document.body.style.removeProperty('--accent-hi-15')
    document.body.style.removeProperty('--accent-hi-08')
    document.body.style.removeProperty('--accent-hi-05')
    document.body.style.removeProperty('--site-tint-opacity')
    document.body.style.removeProperty('--site-tool-grid-opacity')
    setTintStrength(38)
    setOverlayOpacity(14)
    setZoomScale(100)
  }, [clearPaint, resetZoom])

  const closeTools = useCallback(() => {
    setOpen(false)
    setMode(null)
    setSelection(null)
  }, [])

  const copyCurrentUrl = useCallback(async () => {
    if (!navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // clipboard unavailable — nothing to signal
    }
  }, [])

  const applyTint = useCallback((label: string, value: string) => {
    setActiveTint(label)
    document.body.classList.add('site-tinted')
    document.body.style.setProperty('--site-tint', value)
    document.body.style.setProperty('--site-tint-soft', `color-mix(in srgb, ${value} 18%, transparent)`)
    document.body.style.setProperty('--site-tint-faint', `color-mix(in srgb, ${value} 8%, transparent)`)
    document.body.style.setProperty('--site-tint-border', `color-mix(in srgb, ${value} 30%, transparent)`)
    document.body.style.setProperty('--site-tint-strong', `color-mix(in srgb, ${value} 82%, var(--ink) 18%)`)
    document.body.style.setProperty('--site-tool-ink', value)
    document.body.style.setProperty('--select-blue', value)
    document.body.style.setProperty('--project-color', value)
    document.body.style.setProperty('--accent-hi', value)
    document.body.style.setProperty('--accent-hi-70', `color-mix(in srgb, ${value} 70%, transparent)`)
    document.body.style.setProperty('--accent-hi-50', `color-mix(in srgb, ${value} 50%, transparent)`)
    document.body.style.setProperty('--accent-hi-30', `color-mix(in srgb, ${value} 30%, transparent)`)
    document.body.style.setProperty('--accent-hi-15', `color-mix(in srgb, ${value} 15%, transparent)`)
    document.body.style.setProperty('--accent-hi-08', `color-mix(in srgb, ${value} 8%, transparent)`)
    document.body.style.setProperty('--accent-hi-05', `color-mix(in srgb, ${value} 5%, transparent)`)
    resizeCanvas()
  }, [resizeCanvas])

  const applyCursorAccent = useCallback((label: string, value: string) => {
    setActiveCursorAccent(label)
    document.documentElement.style.setProperty('--figma-cursor-accent', value)
  }, [])

  const clearTint = useCallback(() => {
    setActiveTint(tintOptions[0].label)
    document.body.classList.remove('site-tinted')
    ;[
      '--site-tint', '--site-tint-soft', '--site-tint-faint', '--site-tint-border', '--site-tint-strong',
      '--site-tool-ink', '--select-blue', '--project-color',
      '--accent-hi', '--accent-hi-70', '--accent-hi-50', '--accent-hi-30', '--accent-hi-15', '--accent-hi-08', '--accent-hi-05',
    ].forEach(property => document.body.style.removeProperty(property))
  }, [])

  const zoomToSelection = useCallback((rect: SelectionRect) => {
    if (rect.w < 34 || rect.h < 34) return

    const stage = document.getElementById('site-zoom-stage')
    if (!stage) return

    const stageRect = stage.getBoundingClientRect()
    const scale = Math.min(2.8, Math.max(1.25, Math.min(window.innerWidth / rect.w, window.innerHeight / rect.h) * 0.64))
    const localCenterX = rect.x + rect.w / 2 - stageRect.left
    const localCenterY = rect.y + rect.h / 2 - stageRect.top
    const translateX = window.innerWidth / 2 - localCenterX * scale
    const translateY = window.innerHeight / 2 - localCenterY * scale

    stage.style.transformOrigin = '0 0'
    stage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
    document.body.classList.add('site-area-zoomed')
    setZoomScale(Math.round(scale * 100))
  }, [])

  const beginMode = useCallback((nextMode: ToolMode) => {
    setOpen(true)
    setSelection(null)
    setMode(current => (current === nextMode ? null : nextMode))
  }, [])

  const beginCommentMode = useCallback(() => {
    setOpen(true)
    setSelection(null)
    setDraftComment(null)
    setActiveCommentId(null)
    setCommentBody('')
    setCommentNotice('')
    setMode(current => (current === 'comment' ? null : 'comment'))
  }, [])

  // The eye in Appearance: show/hide the visitor's ink layer, Figma-style.
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) canvas.style.visibility = inkHidden ? 'hidden' : ''
  }, [inkHidden])

  // Live inspect: while the default (cursor) tool is active, hovering the page
  // outlines the element under the pointer and reads its real properties —
  // passively, without stealing clicks so the portfolio stays browsable.
  useEffect(() => {
    if (!open || mode !== null) {
      setInspect(null)
      return
    }

    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(inspectRafRef.current)
      inspectRafRef.current = requestAnimationFrame(() => {
        const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
        if (!element || element.closest(INSPECT_IGNORE)) {
          setInspect(current => (current?.pinned ? current : null))
          return
        }
        setInspect(describeElement(element))
      })
    }
    const onLeave = () => setInspect(current => (current?.pinned ? current : null))

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(inspectRafRef.current)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [open, mode])

  const toggleGrid = useCallback(() => {
    const enabled = document.body.classList.toggle('figma-grid-on')
    if (enabled) setCanvasChromePreference(true)
    if (!enabled && document.body.classList.contains('figma-rulers-off')) setCanvasChromePreference(false)
  }, [])

  const toggleStroke = useCallback(() => {
    document.body.classList.toggle('figma-stroke-on')
  }, [])

  // Push the page's centered containers to the left / center / right edge of
  // the stage; the CSS is scoped to Figma mode so closing the panels resets it.
  useEffect(() => {
    document.body.classList.toggle('figma-align-left', contentAlign === 'left')
    document.body.classList.toggle('figma-align-right', contentAlign === 'right')
  }, [contentAlign])

  const toggleDots = useCallback(() => {
    document.body.classList.toggle('figma-dots-on')
  }, [])

  const toggleRulers = useCallback(() => {
    const rulersOff = document.body.classList.toggle('figma-rulers-off')
    setCanvasChromePreference(!rulersOff || document.body.classList.contains('figma-grid-on'))
  }, [])

  const scrollToLayer = useCallback((layer: LayerItem, index: number) => {
    setMode(null)
    setSelectedLayerIndex(index)
    setExportTarget('selection')
    const target = firstElementForTarget(layer.target)

    if (!target) {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      setInspect(null)
      return
    }

    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start', inline: 'nearest' })
    // Pin the picked layer so its real geometry + styles stay in the panel
    // until the visitor hovers something else.
    setInspect({ ...describeElement(target, true), name: layer.label })
  }, [])

  const togglePageGroup = useCallback((group: SitePageItem['group']) => {
    setCollapsedPageGroups(current => {
      const next = new Set(current)
      if (next.has(group)) {
        next.delete(group)
      } else {
        next.add(group)
      }
      return next
    })
  }, [])

  const toggleLayerGroup = useCallback((key: string) => {
    setCollapsedLayerKeys(current => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const containPanelScroll = useCallback((event: React.SyntheticEvent<HTMLElement>) => {
    event.stopPropagation()
  }, [])

  const exportCurrentTarget = useCallback(async () => {
    setExportStatus('exporting')
    const layers = layersForPath(pathname)
    const selectedLayer = layers[selectedLayerIndex] ?? layers.find(layer => layer.active) ?? layers[0]
    const sectionElement = exportTarget === 'selection'
      ? firstElementForTarget(selectedLayer?.target)
      : null
    const pageElement = document.querySelector<HTMLElement>('#site-zoom-stage')
      ?? document.querySelector<HTMLElement>('#main-content')
    const sourceElement = sectionElement ?? pageElement ?? document.body
    const sourceRect = sourceElement.getBoundingClientRect()
    const isPageScreenshot = exportTarget === 'page'
    const width = Math.max(320, Math.ceil(isPageScreenshot ? sourceRect.width : sourceElement.scrollWidth || sourceRect.width || window.innerWidth))
    const height = Math.max(240, Math.ceil(isPageScreenshot ? Math.min(sourceRect.height || window.innerHeight, window.innerHeight) : sourceElement.scrollHeight || sourceRect.height || window.innerHeight))
    const exportWidth = Math.min(width, 4096)
    const exportHeight = Math.min(height, 4096)
    const clone = sourceElement.cloneNode(true) as HTMLElement
    clone.querySelectorAll('.site-tools, .site-layers-panel, .site-tool-overlay, .site-paint-canvas, .site-tint-wash').forEach(node => node.remove())
    replaceCanvasClones(sourceElement, clone)
    clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
    if (isPageScreenshot) {
      clone.style.width = `${exportWidth}px`
      clone.style.height = `${exportHeight}px`
      clone.style.minHeight = `${exportHeight}px`
      clone.style.maxWidth = `${exportWidth}px`
      clone.style.overflow = 'hidden'
      clone.style.transform = 'none'
      clone.style.transformOrigin = '0 0'
    }

    const styles = collectExportCss()
    const title = exportTarget === 'selection' && sectionElement ? selectedLayer.label : `${titleFromPath(pathname)} current view`
    const serialized = new XMLSerializer().serializeToString(clone)
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${exportWidth} ${exportHeight}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" class="portfolio-export-root">
      <style>
        ${styles}
        html, body, .portfolio-export-root { margin: 0; width: ${exportWidth}px; min-height: ${exportHeight}px; background: var(--bg, #f8f7f2); overflow: hidden; }
        .portfolio-export-root * { animation: none !important; transition: none !important; }
      </style>
      ${serialized}
    </div>
  </foreignObject>
</svg>`

    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    try {
      const image = new Image()
      image.decoding = 'async'
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('SVG image export failed'))
        image.src = svgUrl
      })

      const canvas = document.createElement('canvas')
      const scale = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(exportWidth * scale)
      canvas.height = Math.round(exportHeight * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas export unavailable')
      ctx.scale(scale, scale)
      ctx.drawImage(image, 0, 0, exportWidth, exportHeight)
      const pngBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!pngBlob) throw new Error('PNG export unavailable')
      downloadBlob(pngBlob, filenameFromLabel(title, 'png'))
      setExportStatus('done')
    } catch {
      downloadBlob(svgBlob, filenameFromLabel(title, 'svg'))
      setExportStatus('fallback')
    } finally {
      URL.revokeObjectURL(svgUrl)
      window.setTimeout(() => setExportStatus('ready'), 1800)
    }
  }, [exportTarget, pathname, selectedLayerIndex])

  const onOverlayPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (mode === 'comment') {
      setDraftComment(commentPositionFromPointer(event, currentCommentRoute))
      setActiveCommentId(null)
      setOpen(true)
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }

    if (mode === 'select') {
      selectingRef.current = true
      const point = { x: event.clientX, y: event.clientY }
      startRef.current = point
      setSelection({ x: point.x, y: point.y, w: 0, h: 0 })
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }

    if (mode === 'paint') {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      configurePaintContext(ctx)
      drawingRef.current = true
      const point = pagePointFromPointer(event)
      lastPaintRef.current = point
      drawPaintSegment(ctx, point, { x: point.x + 0.01, y: point.y + 0.01 })
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }, [configurePaintContext, currentCommentRoute, drawPaintSegment, mode])

  const onOverlayPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (mode === 'select' && selectingRef.current && startRef.current) {
      setSelection(rectFromPoints(startRef.current, { x: event.clientX, y: event.clientY }))
      return
    }

    if (mode === 'paint' && drawingRef.current) {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const point = pagePointFromPointer(event)
      drawPaintSegment(ctx, lastPaintRef.current ?? point, point)
      lastPaintRef.current = point
    }
  }, [drawPaintSegment, mode])

  const onOverlayPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (mode === 'select' && selectingRef.current) {
      selectingRef.current = false
      startRef.current = null
      if (selection) {
        setLastSelection(selection)
        zoomToSelection(selection)
      }
      window.setTimeout(() => setSelection(null), 220)
    }

    if (mode === 'paint' && drawingRef.current) {
      drawingRef.current = false
      lastPaintRef.current = null
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [mode, selection, zoomToSelection])

  useEffect(() => {
    resizeCanvas()
    const syncViewport = () => setViewportVersion(version => version + 1)
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('resize', syncViewport)
    window.addEventListener('scroll', syncViewport, { passive: true })
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('resize', syncViewport)
      window.removeEventListener('scroll', syncViewport)
    }
  }, [resizeCanvas])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) configurePaintContext(ctx)
  }, [configurePaintContext])

  useEffect(() => {
    document.body.style.setProperty('--site-tint-opacity', String(tintStrength / 100))
    document.body.style.setProperty('--site-tool-grid-opacity', String(overlayOpacity / 100))

    return () => {
      document.body.style.removeProperty('--site-tint-opacity')
      document.body.style.removeProperty('--site-tool-grid-opacity')
    }
  }, [overlayOpacity, tintStrength])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Step out one level at a time, like Figma: draft → active tool → panels.
        if (draftComment) {
          setDraftComment(null)
        } else if (mode) {
          setMode(null)
          setSelection(null)
        } else {
          closeTools()
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'x') {
        event.preventDefault()
        setOpen(current => !current)
      }

      // Single-key tool shortcuts, Figma-style — only while the panel is open
      // and the visitor isn't typing into a field.
      if (!open || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]')) return

      const key = event.key.toLowerCase()
      if (event.shiftKey) {
        if (key === 'g') { event.preventDefault(); toggleGrid() }
        else if (key === 'r') { event.preventDefault(); toggleRulers() }
        return
      }
      if (key === 'v') { event.preventDefault(); setMode(null); setSelection(null) }
      else if (key === 'k') { event.preventDefault(); setMode('select'); setSelection(null) }
      else if (key === 'p' || key === 'b') { event.preventDefault(); setMode('paint') }
      else if (key === 'c') { event.preventDefault(); beginCommentMode() }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [beginCommentMode, closeTools, draftComment, mode, open, toggleGrid, toggleRulers])

  useEffect(() => {
    const onToggle = () => {
      setCanvasChromePreference(true)
      setOpen(current => !current)
    }
    const onOpen = () => {
      setCanvasChromePreference(true)
      setOpen(true)
    }
    const onClose = () => closeTools()

    window.addEventListener('site-tools:toggle', onToggle)
    window.addEventListener('site-tools:open', onOpen)
    window.addEventListener('site-tools:close', onClose)
    return () => {
      window.removeEventListener('site-tools:toggle', onToggle)
      window.removeEventListener('site-tools:open', onOpen)
      window.removeEventListener('site-tools:close', onClose)
    }
  }, [closeTools])

  // While Figma mode owns the whole screen (nav + chips hidden), the panel
  // hosts music and hand-tracking. State mirrors arrive via window events.
  const [ambientPlaying, setAmbientPlaying] = useState(false)
  const [handActive, setHandActive] = useState(false)
  useEffect(() => {
    const onAmbient = (e: Event) => setAmbientPlaying(Boolean((e as CustomEvent<{ playing?: boolean }>).detail?.playing))
    const onHand = (e: Event) => setHandActive(Boolean((e as CustomEvent<{ active?: boolean }>).detail?.active))
    window.addEventListener('ambient:state', onAmbient)
    window.addEventListener('hand-tracker:state', onHand)
    return () => {
      window.removeEventListener('ambient:state', onAmbient)
      window.removeEventListener('hand-tracker:state', onHand)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('site-tools-open', open)
    window.dispatchEvent(new CustomEvent('site-tools:state', { detail: { open, mode } }))
    try {
      // Drop the legacy persisted flag so older sessions can't re-open it.
      window.localStorage.removeItem('portfolio-site-tools-open')
    } catch {
      // localStorage is optional; the shell still works without persistence.
    }
    return () => {
      document.body.classList.remove('site-tools-open')
    }
  }, [open, mode])

  useEffect(() => {
    const syncChromeState = () => {
      setGridEnabled(document.body.classList.contains('figma-grid-on'))
      setDotsEnabled(document.body.classList.contains('figma-dots-on'))
      setRulersEnabled(!document.body.classList.contains('figma-rulers-off'))
      setStrokeEnabled(document.body.classList.contains('figma-stroke-on'))
    }

    syncChromeState()
    const observer = new MutationObserver(syncChromeState)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    clearZoom()
    clearPaint()
    setMode(null)
    setSelection(null)
    setLastSelection(null)
    setDraftComment(null)
    setActiveCommentId(null)
    setCommentBody('')
    setCommentNotice('')
    setSelectedLayerIndex(0)
    setCollapsedLayerKeys(new Set())
    setExportTarget('selection')
    setExportStatus('ready')
    setInspect(null)
  }, [pathname, clearPaint, clearZoom])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  useEffect(() => {
    const onContextComment = (event: Event) => {
      const detail = (event as CustomEvent<{ clientX?: number; clientY?: number }>).detail
      if (typeof detail?.clientX !== 'number' || typeof detail.clientY !== 'number') return

      setOpen(true)
      setMode('comment')
      setDraftComment(commentPositionFromViewportPoint(detail.clientX, detail.clientY, currentCommentRoute))
      setActiveCommentId(null)
      setCommentBody('')
    }

    window.addEventListener('portfolio:add-comment', onContextComment)
    return () => window.removeEventListener('portfolio:add-comment', onContextComment)
  }, [currentCommentRoute])

  useEffect(() => {
    const activeGroup = sitePageItems.find(page => isActivePage(pathname, page.to))?.group
    if (!activeGroup) return
    setCollapsedPageGroups(current => {
      if (!current.has(activeGroup)) return current
      const next = new Set(current)
      next.delete(activeGroup)
      return next
    })
  }, [pathname])

  const overlayActive = mode === 'select' || mode === 'paint' || mode === 'comment'
  const selectedRect = selection ?? lastSelection
  const frameWidthLabel = selectedRect
    ? String(Math.round(selectedRect.w))
    : inspect
      ? String(Math.round(inspect.rect.w))
      : String(window.innerWidth)
  const frameHeightLabel = selectedRect
    ? String(Math.round(selectedRect.h))
    : inspect
      ? String(Math.round(inspect.rect.h))
      : String(window.innerHeight)
  const layerItems = layersForPath(pathname)
  const visibleLayers = visibleLayerEntries(layerItems, pathname, collapsedLayerKeys)
  const activeLayer = layerItems[selectedLayerIndex] ?? layerItems.find(layer => layer.active) ?? layerItems[0]
  const selectedLayerLabel = selectedRect
    ? 'Crop region'
    : mode === 'paint'
      ? 'Ink layer'
      : mode === 'comment'
        ? 'Comment pin'
        : inspect
          ? inspect.name
          : activeLayer?.label ?? titleFromPath(pathname)
  const flowLabel = pathname.endsWith('/work') ? 'Project index' : categoryPages.some(page => isActivePage(pathname, page.to)) ? 'Category stack' : currentProjectLabel(pathname)
  const exportLabel = exportStatus === 'exporting'
    ? 'Rendering...'
    : exportStatus === 'done'
      ? 'Downloaded PNG'
      : exportStatus === 'fallback'
        ? 'Downloaded SVG'
        : exportTarget === 'selection'
          ? `Export ${activeLayer?.label ?? 'Layer'}`
          : 'Save current view'
  const activeComment = comments.find(comment => comment.id === activeCommentId) ?? null

  return (
    <>
      <div className={`site-tint-wash${activeTint ? ` site-tint-wash--${activeTint}` : ''}`} aria-hidden="true" />
      <canvas ref={canvasRef} className="site-paint-canvas" aria-hidden="true" />
      {open && (
        <button
          type="button"
          className={`site-comment-mobile-launcher${mode === 'comment' ? ' is-active' : ''}`}
          onClick={beginCommentMode}
          aria-label={mode === 'comment' ? 'Stop adding comments' : 'Add a comment anywhere on the page'}
          aria-pressed={mode === 'comment'}
          title={mode === 'comment' ? 'Stop adding comments' : 'Add comment anywhere'}
        >
          <ToolIcon name="comment" />
        </button>
      )}
      <div
        className={`site-tool-overlay${overlayActive ? ' is-active' : ''}${mode === 'paint' ? ' is-painting' : ''}${mode === 'comment' ? ' is-commenting' : ''}`}
        onPointerDown={onOverlayPointerDown}
        onPointerMove={onOverlayPointerMove}
        onPointerUp={onOverlayPointerUp}
        onPointerCancel={onOverlayPointerUp}
        aria-hidden={!overlayActive}
      >
        {selection && mode === 'select' && (
          <div
            className="site-selection-rect"
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.w,
              height: selection.h,
            }}
          >
            <span>{Math.round(selection.w)} x {Math.round(selection.h)}</span>
          </div>
        )}
      </div>

      {open && mode === null && inspect && (
        <div
          className={`site-inspect-outline${inspect.pinned ? ' is-pinned' : ''}`}
          data-viewport-version={viewportVersion}
          style={{ left: inspect.rect.x, top: inspect.rect.y, width: inspect.rect.w, height: inspect.rect.h }}
          aria-hidden="true"
        >
          <span className="site-inspect-outline__tag">{inspect.name}</span>
          <span className="site-inspect-outline__dim">{inspect.size}</span>
        </div>
      )}

      <div className={`site-comment-layer${open ? ' is-open' : ''}${mode === 'comment' ? ' is-commenting' : ''}`} data-viewport-version={viewportVersion} aria-label="Page comments">
        {comments.map((comment, index) => (
          <button
            key={comment.id}
            type="button"
            className={`site-comment-pin${activeCommentId === comment.id ? ' is-active' : ''}`}
            style={commentPinStyle(comment)}
            onClick={() => {
              setOpen(true)
              setDraftComment(null)
              setActiveCommentId(comment.id)
              setMode(null)
            }}
            aria-label={`Open comment ${index + 1} by ${comment.authorName}`}
          >
            {index + 1}
          </button>
        ))}

        {draftComment && (
          <span className="site-comment-pin site-comment-pin--draft" style={commentPinStyle(draftComment)} aria-hidden="true">
            <ToolIcon name="comment" />
          </span>
        )}

        {activeComment && (
          <article className="site-comment-card" style={commentCardStyle(activeComment)} aria-label="Comment">
            <header>
              <strong>{activeComment.authorName}</strong>
              <span className={`site-comment-card__state is-${activeComment.status}`}>
                {activeComment.status === 'pending' ? 'Awaiting review' : 'Published'}
              </span>
              <button type="button" onClick={() => setActiveCommentId(null)} aria-label="Close comment">
                <ToolIcon name="close-panel" />
              </button>
            </header>
            <p>{activeComment.body}</p>
            {activeComment.status === 'pending' && (
              <p className="site-comment-card__note">Visible only to you until it is reviewed.</p>
            )}
          </article>
        )}

        {draftComment && (
          <form className="site-comment-card site-comment-card--draft" style={commentCardStyle(draftComment)} onSubmit={submitComment}>
            <header>
              <strong>New note</strong>
              <span>{commentStoreMode === 'database' ? 'Review required' : 'Browser preview'}</span>
              <button type="button" onClick={() => setDraftComment(null)} aria-label="Cancel comment">
                <ToolIcon name="close-panel" />
              </button>
            </header>
            <textarea
              value={commentBody}
              onChange={event => setCommentBody(event.currentTarget.value)}
              placeholder="Leave a note for this exact spot."
              aria-label="Comment message"
              autoFocus
            />
            <div className="site-comment-card__identity">
              <input value={commentAuthor} onChange={event => setCommentAuthor(event.currentTarget.value)} placeholder="Name" aria-label="Your name" />
              <input value={commentEmail} onChange={event => setCommentEmail(event.currentTarget.value)} placeholder="Email optional" aria-label="Your email" />
            </div>
            <p className="site-comment-card__note">
              {commentStoreMode === 'database'
                ? 'Only approved notes are visible to other visitors.'
                : 'This preview is stored only in this browser.'}
            </p>
            {commentsError && <p className="site-comment-card__error">{commentsError}</p>}
            <button type="submit" disabled={commentSaving || !commentBody.trim()}>
              {commentSaving ? 'Sending...' : commentStoreMode === 'database' ? 'Submit for review' : 'Save browser preview'}
            </button>
          </form>
        )}
      </div>

      {open && (
      <>
      <aside
        className="site-layers-panel"
        aria-label="Portfolio pages and current page layers"
        onWheel={containPanelScroll}
        onTouchMove={containPanelScroll}
      >
        <header className="site-layers-panel__top">
          <div>
            <h2>Portfolio System</h2>
            <p>{titleFromPath(pathname)}</p>
          </div>
          <button type="button" aria-label="Close portfolio system panels" onClick={closeTools}>
            <ToolIcon name="close-panel" />
          </button>
        </header>

        <section className="site-layers-panel__pages" aria-labelledby="site-pages-title">
          <div className="site-layers-panel__section-head">
            <h3 id="site-pages-title">Pages</h3>
            <div>
              <button type="button" aria-label="Search pages">
                <ToolIcon name="search" />
              </button>
              <button type="button" aria-label="Create page marker">
                <ToolIcon name="plus" />
              </button>
            </div>
          </div>

          <nav className="site-pages-list" aria-label="Portfolio pages">
            {sitePageGroups.map(group => {
              const groupOpen = !collapsedPageGroups.has(group)
              const groupItems = sitePageItems.filter(page => page.group === group)

              return (
              <div key={group} className={`site-pages-list__group${groupOpen ? ' is-open' : ' is-closed'}`}>
                {group !== 'Pages' && <span className="site-pages-list__divider" aria-hidden="true" />}
                <button
                  type="button"
                  className="site-pages-list__group-toggle"
                  onClick={() => togglePageGroup(group)}
                  aria-expanded={groupOpen}
                >
                  <span aria-hidden="true">
                    <ToolIcon name={groupOpen ? 'chevron-down' : 'chevron-right'} />
                  </span>
                  <small>{group}</small>
                  <em>{groupCount(group)}</em>
                </button>
                {groupOpen && groupItems.map(page => {
                  const isCurrent = isActivePage(pathname, page.to)
                  const ndaProject = page.group === 'Projects' && visibleProjects.find(project => `/${project.slug}` === page.to)?.nda

                  return (
                  <Link
                    key={`${page.group}-${page.to}`}
                    to={page.to}
                    className={`site-pages-list__item${isCurrent ? ' is-active' : ''}`}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    <span>
                      <strong>{page.label}</strong>
                    </span>
                    {ndaProject && <em>NDA</em>}
                  </Link>
                  )
                })}
              </div>
              )
            })}
          </nav>
        </section>

        <section className="site-layers-panel__layers" aria-labelledby="site-layers-title">
          <div className="site-layers-panel__section-head">
            <h3 id="site-layers-title">Layers</h3>
            <div>
              <button type="button" aria-label="Layer display options">
                <ToolIcon name="list" />
              </button>
              <button type="button" aria-label="Collapse layers">
                <ToolIcon name="chevron-down" />
              </button>
            </div>
          </div>

          <ol className="site-layer-tree" aria-label="Current page layers">
            {visibleLayers.map(({ layer, index, key, hasChildren }) => {
              const isOpen = !collapsedLayerKeys.has(key)

              return (
              <li
                key={key}
                className={`site-layer-tree__item${index === selectedLayerIndex ? ' is-active' : ''}${layer.muted ? ' is-muted' : ''}${layer.accent ? ' is-accent' : ''}`}
                data-layer-active={index === selectedLayerIndex ? 'true' : 'false'}
                style={{ '--layer-depth': layer.depth ?? 0 } as CSSProperties}
              >
                <button
                  type="button"
                  className="site-layer-tree__disclosure"
                  onClick={() => hasChildren && toggleLayerGroup(key)}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${layer.label}`}
                  aria-expanded={hasChildren ? isOpen : undefined}
                  disabled={!hasChildren}
                >
                  {hasChildren ? (
                    <ToolIcon name={isOpen ? 'chevron-down' : 'chevron-right'} className="site-layer-tree__chevron" />
                  ) : null}
                </button>
                <button
                  type="button"
                  className="site-layer-tree__target"
                  data-layer-label={layer.label}
                  onPointerDown={() => {
                    setSelectedLayerIndex(index)
                    setExportTarget('selection')
                  }}
                  onClick={() => scrollToLayer(layer, index)}
                >
                  <span className="site-layer-tree__icon" aria-hidden="true">
                    <ToolIcon name={iconName(layer.icon)} />
                  </span>
                  <span className="site-layer-tree__copy">
                    <span className="site-layer-tree__label">{layer.label}</span>
                    <small>{layer.info ?? (layer.target ? 'Scroll target' : 'Frame')}</small>
                  </span>
                </button>
              </li>
              )
            })}
          </ol>
        </section>
      </aside>

      <aside
        id="site-interaction-tools"
        className={`site-tools surface-glass surface-glass--subtle is-open${mode ? ' has-active-mode' : ''}`}
        aria-label="Site interaction tools"
        onWheel={containPanelScroll}
        onTouchMove={containPanelScroll}
      >
        <div className="site-tools__figma-top">
          <button type="button" className="site-tools__avatar" aria-label="Portfolio account">
            <span aria-hidden="true">
              <img src="/Assets/images/parth.jpg" alt="" />
            </span>
            <small aria-hidden="true"><ToolIcon name="chevron-down" /></small>
          </button>
          <button
            type="button"
            className={`site-tools__chrome-btn${ambientPlaying ? ' is-active' : ''}`}
            onClick={() => window.dispatchEvent(new CustomEvent('ambient:toggle'))}
            aria-pressed={ambientPlaying}
            aria-label={ambientPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
            title="Ambient sound"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="16.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>
          </button>
          <ThemeToggle className="site-tools__theme" />
          <button
            type="button"
            className={`site-tools__chrome-btn${handActive ? ' is-active' : ''}`}
            onClick={() => window.dispatchEvent(new CustomEvent('hand-tracker:toggle'))}
            aria-pressed={handActive}
            aria-label={handActive ? 'Stop hand tracking' : 'Use your hands'}
            title="Use your hands"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 12.5V9a1.5 1.5 0 0 1 3 0v-2a1.5 1.5 0 0 1 3 0V6a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0v6.5a5.5 5.5 0 0 1-5.5 5.5h-1A5.5 5.5 0 0 1 6.5 13.5v-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <a className="site-tools__share" href={`mailto:${CONTACT_EMAIL}?subject=Let%27s%20work%20together`}>
            Let&rsquo;s Talk
          </a>
          <button
            type="button"
            className="site-tools__chrome-btn site-tools__exit"
            onClick={closeTools}
            aria-label="Exit Figma mode"
            title="Exit Figma mode (Esc)"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="site-tools__figma-tabs" aria-label="Panel sections">
          <button type="button" className="is-active">Design</button>
          <button
            type="button"
            className="site-tools__zoom-menu"
            onClick={resetZoom}
            disabled={zoomScale === 100}
            title={zoomScale === 100 ? 'Zoom (drag with the crop tool to zoom in)' : 'Reset zoom to 100%'}
            aria-label={zoomScale === 100 ? 'Zoom level' : 'Reset zoom to 100%'}
          >
            {zoomScale}%{zoomScale !== 100 && <ToolIcon name="refresh" />}
          </button>
        </div>

        <div className="site-tools__panel">
          <section className="site-tools__section site-tools__section--compact" aria-labelledby="site-tool-selection-title">
            <h3 id="site-tool-selection-title" className="site-tools__quiet-label">Selection</h3>
            <div className="site-tools__rotation-row" aria-label="Rotation controls">
              <label className="site-tools__field site-tools__field--wide">
                <span aria-hidden="true"><ToolIcon name="frame" /></span>
                <input value={selectedLayerLabel} readOnly aria-label="Selected portfolio layer" />
              </label>
              <button type="button" className={mode === 'select' ? 'is-active' : ''} onClick={() => beginMode('select')} aria-label="Crop zoom">
                <ToolIcon name="zoom" />
              </button>
              <button type="button" className={dotsEnabled ? 'is-active' : ''} onClick={toggleDots} aria-label="Toggle dots">
                <ToolIcon name="dots" />
              </button>
              <button type="button" className={rulersEnabled ? 'is-active' : ''} onClick={toggleRulers} aria-label="Toggle rulers">
                <ToolIcon name="ruler" />
              </button>
            </div>
          </section>

          <section className="site-tools__section site-tools__section--canvas" aria-labelledby="site-tool-layout-title">
            <div className="site-tools__section-head">
              <h3 id="site-tool-layout-title">Canvas tools</h3>
              <button type="button" className="site-tools__mini-blue" onClick={toggleGrid} aria-pressed={gridEnabled} aria-label="Toggle layout guide">
                <ToolIcon name="layout" />
              </button>
            </div>

            <div className="site-tools__control-group" aria-label="Flow direction">
              <span>Tool</span>
              <div className="site-tools__icon-strip">
                <button type="button" onClick={() => setMode(null)} className={mode === null ? 'is-active' : ''} aria-label="Inspect page"><ToolIcon name="cursor" /></button>
                <button type="button" onClick={() => beginMode('select')} className={mode === 'select' ? 'is-active' : ''} aria-label="Crop zoom area"><ToolIcon name="zoom" /></button>
                <button type="button" onClick={() => beginMode('paint')} className={mode === 'paint' ? 'is-active' : ''} aria-label="Paint on page"><ToolIcon name="ink" /></button>
                <button type="button" onClick={toggleGrid} className={gridEnabled ? 'is-active' : ''} aria-label="Toggle grid"><ToolIcon name="grid" /></button>
                <button type="button" onClick={toggleDots} className={dotsEnabled ? 'is-active' : ''} aria-label="Toggle dots"><ToolIcon name="dots" /></button>
              </div>
            </div>

            <div className="site-tools__control-group">
              <span>Frame</span>
              <div className="site-tools__field-grid">
                <label className="site-tools__field">
                  <span>W</span>
                  <input value={frameWidthLabel} readOnly aria-label="Frame width" />
                </label>
                <label className="site-tools__field">
                  <span>H</span>
                  <input value={frameHeightLabel} readOnly aria-label="Frame height" />
                </label>
              </div>
            </div>

            <div className="site-tools__layout-pair">
              <div className="site-tools__control-group">
                <span>Alignment</span>
                <div className="site-tools__alignment" role="radiogroup" aria-label="Push page content left, center, or right">
                  {contentAlignOptions.map(option => {
                    const active = contentAlign === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={active ? 'is-active' : ''}
                        onClick={() => setContentAlign(option.value)}
                        role="radio"
                        aria-label={`Align content ${option.label.toLowerCase()}`}
                        aria-checked={active}
                        title={`Align content ${option.label.toLowerCase()}`}
                      >
                        <span className="site-tools__alignment-dots" aria-hidden="true">
                          <i /><i /><i /><i /><i /><i />
                        </span>
                        <span className="site-tools__alignment-frame" aria-hidden="true">
                          {option.lines.map((scale, lineIndex) => (
                            <i
                              key={`${option.value}-${lineIndex}`}
                              style={{ '--line-scale': scale } as CSSProperties}
                            />
                          ))}
                        </span>
                        <span className="site-tools__alignment-label">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="site-tools__control-group">
                <span>Flow</span>
                <div className="site-tools__field-grid site-tools__field-grid--single">
                <label className="site-tools__field">
                  <span><ToolIcon name="branch" /></span>
                  <input value={flowLabel} readOnly aria-label="Page flow" />
                </label>
                </div>
              </div>
            </div>

            <div className="site-tools__control-group">
              <span>Guides</span>
              <div className="site-tools__field-grid">
                <button type="button" className={`site-tools__field site-tools__field--toggle${gridEnabled ? ' is-active' : ''}`} onClick={toggleGrid} aria-pressed={gridEnabled}>
                  <span aria-hidden="true"><ToolIcon name="grid" /></span>
                  {gridEnabled ? 'Grid on' : 'Grid off'}
                </button>
                <button type="button" className={`site-tools__field site-tools__field--toggle${dotsEnabled ? ' is-active' : ''}`} onClick={toggleDots} aria-pressed={dotsEnabled}>
                  <span aria-hidden="true"><ToolIcon name="dots" /></span>
                  {dotsEnabled ? 'Dots on' : 'Dots off'}
                </button>
                <button type="button" className={`site-tools__field site-tools__field--toggle${rulersEnabled ? ' is-active' : ''}`} onClick={toggleRulers} aria-pressed={rulersEnabled}>
                  <span aria-hidden="true"><ToolIcon name="ruler" /></span>
                  {rulersEnabled ? 'Rulers on' : 'Rulers off'}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="site-tools__check-row"
              onClick={() => {
                resetZoom()
                clearPaint()
                clearTint()
                setMode(null)
                setContentAlign('center')
                setInkHidden(false)
              }}
              title="Reset zoom, ink, tint, and alignment"
            >
              <span aria-hidden="true">✓</span>
              Keep portfolio readable
            </button>
          </section>

          <section className="site-tools__section site-tools__section--comments" aria-labelledby="site-tool-comments-title">
            <div className="site-tools__section-head">
              <h3 id="site-tool-comments-title">Comments</h3>
              <button
                type="button"
                className={mode === 'comment' ? 'is-active' : ''}
                onClick={beginCommentMode}
                aria-label={mode === 'comment' ? 'Stop adding comments' : 'Add a comment anywhere on the page'}
                aria-pressed={mode === 'comment'}
                title={mode === 'comment' ? 'Stop adding comments' : 'Add comment anywhere (C)'}
              >
                <ToolIcon name="comment" />
              </button>
            </div>

            <button
              type="button"
              className={`site-comments-add${mode === 'comment' ? ' is-active' : ''}`}
              onClick={beginCommentMode}
              aria-pressed={mode === 'comment'}
            >
              <ToolIcon name="comment" />
              {mode === 'comment' ? 'Click the page to place your note' : 'Add a note'}
            </button>

            <p className="site-comments-help">
              {mode === 'comment'
                ? 'Choose the exact spot that needs feedback.'
                : commentStoreMode === 'database'
                  ? 'Every note is reviewed before it becomes public.'
                  : 'Notes are saved only in this browser until comments are connected.'}
            </p>

            <div className="site-comments-status" aria-live="polite">
              <span>{commentsLoading ? 'Loading...' : `${publishedComments.length} published`}</span>
              <span>{commentStoreMode === 'database' ? 'Review before public' : 'Browser preview'}</span>
            </div>

            {commentsError && <p className="site-comments-error" role="alert">{commentsError}</p>}
            {commentNotice && <p className="site-comments-notice" role="status">{commentNotice}</p>}
            {pendingComments.length > 0 && (
              <p className="site-comments-pending" role="status">
                {pendingComments.length} note{pendingComments.length === 1 ? '' : 's'} awaiting review in this browser.
              </p>
            )}

            {publishedComments.length > 0 ? (
              <div className="site-comments-list" aria-label="Comments on this page">
                {publishedComments.map((comment, index) => (
                  <button
                    key={comment.id}
                    type="button"
                    className={activeCommentId === comment.id ? 'is-active' : ''}
                    onClick={() => {
                      setDraftComment(null)
                      setActiveCommentId(comment.id)
                      setMode(null)
                    }}
                  >
                    <span>{index + 1}</span>
                    <strong>{comment.authorName}</strong>
                    <em>{comment.body}</em>
                  </button>
                ))}
              </div>
            ) : (
              <p className="site-comments-muted">No approved notes on this page yet.</p>
            )}
          </section>

          <section className="site-tools__section site-tools__section--inspect" aria-labelledby="site-tool-inspect-title">
            <div className="site-tools__section-head">
              <h3 id="site-tool-inspect-title">Inspect</h3>
              <span className={`site-tools__inspect-state${inspect ? ' is-live' : ''}`}>
                {inspect?.pinned ? 'Pinned' : inspect ? 'Live' : 'Hover'}
              </span>
            </div>
            <dl className="site-tools__inspect-grid">
              <div>
                <dt>Element</dt>
                <dd title={inspect?.name}>{inspect?.name ?? '—'}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{inspect?.size ?? '—'}</dd>
              </div>
              <div>
                <dt>Font</dt>
                <dd title={inspect?.font}>{inspect?.font ?? '—'}</dd>
              </div>
              <div>
                <dt>Radius</dt>
                <dd>{inspect?.radius ?? '—'}</dd>
              </div>
              <div>
                <dt>Text</dt>
                <dd className="site-tools__inspect-color">
                  {inspect && inspect.color !== 'None' && (
                    <i style={{ background: inspect.color } as CSSProperties} aria-hidden="true" />
                  )}
                  <span title={inspect?.color}>{inspect?.color ?? '—'}</span>
                </dd>
              </div>
              <div>
                <dt>Fill</dt>
                <dd className="site-tools__inspect-color">
                  {inspect && inspect.background !== 'None' && (
                    <i style={{ background: inspect.background } as CSSProperties} aria-hidden="true" />
                  )}
                  <span title={inspect?.background}>{inspect?.background ?? '—'}</span>
                </dd>
              </div>
            </dl>
            <p className="site-tools__inspect-hint">Hover the page to read any element · pick a layer to pin it.</p>
          </section>

          <section className="site-tools__section" aria-labelledby="site-tool-appearance-title">
            <div className="site-tools__section-head">
              <h3 id="site-tool-appearance-title">Appearance</h3>
              <div className="site-tools__section-icons" aria-label="Appearance actions">
                <button type="button" onClick={clearPaint} aria-label="Clear ink" title="Clear ink"><ToolIcon name="eraser" /></button>
                <button
                  type="button"
                  className={inkHidden ? 'is-active' : ''}
                  onClick={() => setInkHidden(current => !current)}
                  aria-pressed={inkHidden}
                  aria-label={inkHidden ? 'Show ink layer' : 'Hide ink layer'}
                  title={inkHidden ? 'Show ink layer' : 'Hide ink layer'}
                >
                  <ToolIcon name="eye" />
                </button>
                <button type="button" onClick={clearTint} aria-label="Remove tint" title="Remove tint"><ToolIcon name="component" /></button>
              </div>
            </div>

            <div className="site-tools__field-grid">
              <label className="site-tools__field">
                <span><ToolIcon name="opacity" /></span>
                <input
                  value={`${paintOpacity}%`}
                  onChange={event => {
                    const nextOpacity = Number(event.currentTarget.value.replace(/\D/g, ''))
                    if (Number.isFinite(nextOpacity)) {
                      setPaintOpacity(Math.max(20, Math.min(100, nextOpacity || 20)))
                    }
                  }}
                  aria-label="Opacity"
                />
              </label>
              <label className="site-tools__field">
                <span><ToolIcon name="stroke-weight" /></span>
                <input
                  value={brushSize}
                  onChange={event => {
                    const nextSize = Number(event.currentTarget.value.replace(/\D/g, ''))
                    if (Number.isFinite(nextSize)) {
                      setBrushSize(Math.max(2, Math.min(18, nextSize || 2)))
                    }
                  }}
                  aria-label="Ink brush size"
                />
              </label>
            </div>

            <div className="site-tools__stroke-picker" role="radiogroup" aria-label="Brush stroke style">
              <span className="site-tools__stroke-picker-label">Stroke</span>
              <div className="site-tools__stroke-options">
                {strokePresets.map(preset => (
                  <button
                    key={preset.key}
                    type="button"
                    className={`site-tools__stroke-option${strokePreset === preset.key ? ' is-active' : ''}`}
                    onClick={() => {
                      setStrokePreset(preset.key)
                      beginMode('paint')
                    }}
                    role="radio"
                    aria-checked={strokePreset === preset.key}
                    title={`${preset.label}: ${preset.note}`}
                  >
                    <StrokePresetPreview preset={preset} />
                    <strong>{preset.label}</strong>
                    <small>{preset.note}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="site-tools__section site-tools__section--colors" aria-labelledby="site-tool-fill-title">
            <div>
              <h3 id="site-tool-fill-title">Fill</h3>
              <p>{activeTint}</p>
            </div>
            <div className="site-tools__color-dots" role="group" aria-label="Change site tint">
              {tintOptions.map(option => (
                <button
                  key={option.label}
                  type="button"
                  className={`site-tools__color-dot${activeTint === option.label ? ' is-active' : ''}`}
                  style={{ '--swatch': option.value } as CSSProperties}
                  onClick={() => applyTint(option.label, option.value)}
                  aria-label={`Tint site ${option.label}`}
                  aria-pressed={activeTint === option.label}
                />
              ))}
            </div>
          </section>

          <section className="site-tools__section site-tools__section--colors" aria-labelledby="site-tool-cursor-title">
            <div>
              <h3 id="site-tool-cursor-title">Cursor</h3>
              <p>{activeCursorAccent}</p>
            </div>
            <div className="site-tools__color-dots" role="group" aria-label="Change Parth cursor color">
              {cursorAccentOptions.map(option => (
                <button
                  key={option.label}
                  type="button"
                  className={`site-tools__color-dot${activeCursorAccent === option.label ? ' is-active' : ''}`}
                  style={{ '--swatch': option.value } as CSSProperties}
                  onClick={() => applyCursorAccent(option.label, option.value)}
                  aria-label={`Set Parth cursor ${option.label}`}
                  aria-pressed={activeCursorAccent === option.label}
                />
              ))}
            </div>
          </section>

          <button
            type="button"
            className={`site-tools__collapse-row${strokeEnabled ? ' is-active' : ''}`}
            onClick={toggleStroke}
            aria-pressed={strokeEnabled}
          >
            <span>Stroke</span>
            <strong>{strokeEnabled ? 'On' : <ToolIcon name="plus" />}</strong>
          </button>

          <button type="button" className="site-tools__collapse-row" onClick={() => beginMode('paint')}>
            <span>Effects</span>
            <strong><ToolIcon name="plus" /></strong>
          </button>

          <button type="button" className="site-tools__collapse-row" onClick={toggleGrid}>
            <span>Layout guide</span>
            <strong><ToolIcon name={gridEnabled ? 'chevron-down' : 'plus'} /></strong>
          </button>

          <button type="button" className="site-tools__collapse-row" onClick={toggleDots}>
            <span>Dot guide</span>
            <strong><ToolIcon name={dotsEnabled ? 'chevron-down' : 'plus'} /></strong>
          </button>

          <section className="site-tools__section site-tools__section--export" aria-labelledby="site-tool-export-title">
            <div className="site-tools__section-head">
              <h3 id="site-tool-export-title">Export</h3>
              <button type="button" onClick={copyCurrentUrl} aria-label="Copy page link"><ToolIcon name="link" /></button>
            </div>
            <div className="site-tools__export-controls">
              <button type="button" className={exportTarget === 'selection' ? 'is-active' : ''} onClick={() => setExportTarget('selection')}>Layer</button>
              <button type="button" className={exportTarget === 'page' ? 'is-active' : ''} onClick={() => setExportTarget('page')}>Page</button>
              <button type="button" onClick={copyCurrentUrl} aria-label="Copy current page link"><ToolIcon name="link" /></button>
              <button type="button" onClick={resetAll} aria-label="Reset session"><ToolIcon name="refresh" /></button>
            </div>
            <button type="button" className="site-tools__export-main" onClick={exportCurrentTarget} disabled={exportStatus === 'exporting'}>
              <ToolIcon name="export" />
              {exportLabel}
            </button>
          </section>
        </div>
      </aside>

      {/* Bottom-center floating toolbar — the Figma UI3 pattern: the essential
          canvas tools live in one pill at the centre-bottom of the canvas. */}
      <div className="site-figbar surface-glass" role="toolbar" aria-label="Canvas tools">
        <button
          type="button"
          className={`site-figbar__btn${mode === null ? ' is-active' : ''}`}
          onClick={() => setMode(null)}
          aria-label="Inspect (default tool)"
          title="Inspect — hover to read any element (V)"
        >
          <ToolIcon name="cursor" />
        </button>
        <button
          type="button"
          className={`site-figbar__btn${mode === 'select' ? ' is-active' : ''}`}
          onClick={() => beginMode('select')}
          aria-label="Crop zoom area"
          title="Crop zoom (K)"
        >
          <ToolIcon name="zoom" />
        </button>
        <div className="site-figbar__paint-wrap">
          <button
            type="button"
            className={`site-figbar__btn${mode === 'paint' ? ' is-active' : ''}`}
            onClick={() => beginMode('paint')}
            aria-label={`Paint on the page with ${activeStrokePreset.label}`}
            title={`Paint (${activeStrokePreset.label})`}
          >
            <ToolIcon name="ink" />
          </button>
          {mode === 'paint' && (
            <div className="site-figbar__stroke-popover" role="radiogroup" aria-label="Choose brush stroke">
              {strokePresets.map(preset => (
                <button
                  key={preset.key}
                  type="button"
                  className={`site-figbar__stroke-btn${strokePreset === preset.key ? ' is-active' : ''}`}
                  onClick={() => setStrokePreset(preset.key)}
                  role="radio"
                  aria-checked={strokePreset === preset.key}
                  aria-label={`${preset.label} stroke`}
                  title={`${preset.label}: ${preset.note}`}
                >
                  <StrokePresetPreview preset={preset} compact />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          className={`site-figbar__btn${gridEnabled ? ' is-active' : ''}`}
          onClick={toggleGrid}
          aria-pressed={gridEnabled}
          aria-label="Toggle grid"
          title="Grid (⇧G)"
        >
          <ToolIcon name="grid" />
        </button>
        <button
          type="button"
          className={`site-figbar__btn${rulersEnabled ? ' is-active' : ''}`}
          onClick={toggleRulers}
          aria-pressed={rulersEnabled}
          aria-label="Toggle rulers"
          title="Rulers (⇧R)"
        >
          <ToolIcon name="ruler" />
        </button>

      </div>
      </>
      )}
    </>
  )
}
