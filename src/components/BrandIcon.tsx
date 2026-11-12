/* Inline SVG brand icons, keeps bundle small, no external deps */
import { memo } from 'react'
import type { ReactNode } from 'react'

const icons: Record<string, (size: number) => ReactNode> = {
  figma: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83"/>
      <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF"/>
      <path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z" fill="#F24E1E"/>
      <path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z" fill="#FF7262"/>
      <path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z" fill="#1ABCFE"/>
    </svg>
  ),
  protopie: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
  blender: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12.5 17.5c3.04 0 5.5-2.46 5.5-5.5S15.54 6.5 12.5 6.5c-1.33 0-2.55.47-3.5 1.26L3 3v5.5l3.66 2.82A5.48 5.48 0 0012.5 17.5z" fill="#F5792A"/>
      <ellipse cx="13" cy="12" rx="2.5" ry="2.5" fill="#fff"/>
      <ellipse cx="13" cy="12" rx="1" ry="1" fill="#265787"/>
    </svg>
  ),
  'after effects': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="3" width="22" height="18" rx="3" fill="#00005B"/>
      <path d="M6 16l2.5-8h2L13 16h-2l-.5-2H8.5L8 16H6zm2.8-3.5h1.4L9.5 9.5l-.7 3z" fill="#99F"/>
      <path d="M14 13.5c.3.5.8.8 1.5.8.6 0 1-.3 1-.7 0-1.2-3-1-3-3 0-1.1.9-1.8 2.2-1.8.8 0 1.5.3 2 .8l-.8 1c-.3-.3-.7-.5-1.2-.5-.5 0-.8.2-.8.6 0 1.1 3 .8 3 2.9 0 1.2-1 2-2.4 2-.9 0-1.8-.4-2.3-1l.8-1.1z" fill="#99F"/>
    </svg>
  ),
  react: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2.2" fill="#61DAFB"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(120 12 12)"/>
    </svg>
  ),
  swift: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#F05138"/>
      <path d="M16.5 17.2c-.5.5-1.5 1-3 .8-2-.3-4-1.8-5.3-3.7 0 0 3.2 2.2 5.5 1.2C11 14 7.8 10.5 6.5 8c1.3 1 4.5 3.5 6 4-.8-1-3.5-4.5-3.5-4.5 2.3 1.5 4.5 3.8 5 4.5 1-1 1.5-3 1.2-4.8 1.5 2 2 4.5 1.5 6.3-.2.5-.5 1.5-.2 1.8.5.5 2-.3 2-.3-.3 1-1.2 1.7-2 2.2z" fill="#fff"/>
    </svg>
  ),
  python: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M11.9 1C6.4 1 6.8 3.4 6.8 3.4l.01 2.5h5.2v.7H4.7S1 6.1 1 11.9c0 5.8 3.2 5.6 3.2 5.6h1.9v-2.7s-.1-3.2 3.2-3.2h5.4s3-.05 3-2.95V3.9S18.3 1 11.9 1zm-3 1.7c.5 0 1 .4 1 1 0 .5-.4.9-1 .9-.5 0-.9-.4-.9-1 0-.5.4-.9 1-.9z" fill="#3776AB"/>
      <path d="M12.1 23c5.5 0 5.1-2.4 5.1-2.4l-.01-2.5h-5.2v-.7h7.3S23 17.9 23 12.1c0-5.8-3.2-5.6-3.2-5.6h-1.9v2.7s.1 3.2-3.2 3.2H9.3s-3 .05-3 2.95v4.7S5.7 23 12.1 23zm3-1.7c-.5 0-1-.4-1-1 0-.5.4-.9 1-.9.5 0 .9.4.9 1 0 .5-.4.9-1 .9z" fill="#FFD43B"/>
    </svg>
  ),
  arduino: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M7 7C3.7 7 1 9.7 1 13s2.7 6 6 6c2 0 3.7-1 4.8-2.5h.4C13.3 18 15 19 17 19c3.3 0 6-2.7 6-6s-2.7-6-6-6c-2 0-3.7 1-4.8 2.5h-.4C10.7 8 9 7 7 7zm0 2c1.3 0 2.4.7 3.1 1.7h3.8c.7-1 1.8-1.7 3.1-1.7 2.2 0 4 1.8 4 4s-1.8 4-4 4c-1.3 0-2.4-.7-3.1-1.7h-3.8C9.4 16.3 8.3 17 7 17c-2.2 0-4-1.8-4-4s1.8-4 4-4z" fill="#00979D"/>
      <path d="M5 12.5h4v1H5v-1zM15 12.5h4v1h-4v-1zM16.5 11v3h1v-3h-1z" fill="#00979D"/>
    </svg>
  ),
  'p5.js': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M4 2l4 20L20 12 4 2z" fill="#ED225D" opacity="0.8"/>
      <path d="M4 2l8 10-4 10" fill="#ED225D"/>
    </svg>
  ),
  touchdesigner: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.6"/>
    </svg>
  ),
  'laser cutting': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2v14M8 20l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      <circle cx="12" cy="2" r="1.5" fill="#FF4444" opacity="0.7"/>
    </svg>
  ),
  '3d printing': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M1 8l11-6 11 6v8l-11 6L1 16V8z" stroke="currentColor" strokeWidth="1.2" opacity="0.4" fill="none"/>
      <path d="M1 8l11 6 11-6M12 14v8" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
    </svg>
  ),
  linkedin: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="22" height="22" rx="4" fill="#0A66C2"/>
      <path d="M6 10v8h3v-8H6zM7.5 6C6.7 6 6 6.7 6 7.5S6.7 9 7.5 9 9 8.3 9 7.5 8.3 6 7.5 6zM17 10c-1.4 0-2.3.7-2.7 1.4h0V10h-2.8v8h3v-4.2c0-1.1.2-2.2 1.6-2.2 1.3 0 1.4 1.3 1.4 2.3V18h3v-4.8C19.5 11 18.6 10 17 10z" fill="#fff"/>
    </svg>
  ),
  github: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1C5.9 1 1 5.9 1 12c0 4.9 3.2 9 7.6 10.4.6.1.8-.2.8-.5v-2c-3.1.7-3.7-1.3-3.7-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-3 0 0 .9-.3 3 1.1.9-.2 1.8-.4 2.7-.4.9 0 1.8.1 2.7.4 2.1-1.4 3-1.1 3-1.1.6 1.6.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.3.8 1 .8 2.1v3.1c0 .3.2.6.8.5C19.8 21 23 16.9 23 12c0-6.1-4.9-11-11-11z"/>
    </svg>
  ),
  instagram: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig)" strokeWidth="2"/>
      <circle cx="12" cy="12" r="5" stroke="url(#ig)" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig)"/>
      <defs><linearGradient id="ig" x1="2" y1="22" x2="22" y2="2"><stop stopColor="#FD5"/><stop offset=".5" stopColor="#FF543E"/><stop offset="1" stopColor="#C837AB"/></linearGradient></defs>
    </svg>
  ),
  nyu: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#57068C"/>
      <path d="M5 7h2l2.5 5V7H12v10H9.5L7 12v5H5V7zM14 7h2l1.5 4L19 7h2v10h-2v-6l-1.5 4-1.5-4v6h-2V7z" fill="#fff"/>
    </svg>
  ),
  ibm: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#054ADA"/>
      <path d="M3 7h6v1.5H3V7zM3 10h6v1.5H3V10zM3 13h6v1.5H3V13zM3 16h6v1.5H3V16zM9.5 7h5c1.7 0 3 1 3 2.5 0 .8-.4 1.5-1 2 .8.4 1.3 1.3 1.3 2.3 0 1.6-1.3 2.7-3.1 2.7h-5.2V7zm2 2v2h2.8c.6 0 1-.4 1-1s-.4-1-1-1h-2.8zm0 3.5v2h3c.6 0 1.1-.4 1.1-1s-.5-1-1.1-1h-3zM19 7h2v10h-2V7z" fill="#fff"/>
    </svg>
  ),
  cargo: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#111"/>
      <path d="M5 8h2v8H5V8zM9 8h6c2.2 0 4 1.8 4 4s-1.8 4-4 4H9V8zm2 2v4h4c1.1 0 2-.9 2-2s-.9-2-2-2h-4z" fill="#fff"/>
    </svg>
  ),
  webflow: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#4353FF"/>
      <path d="M17 8s-1.5 5-1.6 5.3C15.3 12.4 14 7 14 7c-1.8 0-2.7 1.2-3.2 2.5 0 0-1.3 3.5-1.3 3.7-.1-.3-.5-3.5-.5-3.5C8.7 8 7.1 7 5.5 7L8 17c1.8 0 2.8-1.2 3.3-2.5l1.2-3.3L13.8 14.5c.5 1.3 1.5 2.5 3.2 2.5l2.5-9c-1.5 0-2.5 1-2.5 1z" fill="#fff"/>
    </svg>
  ),
  behance: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#1769FF"/>
      <path d="M3 7h5c1.7 0 3 .8 3 2.3 0 1-.5 1.7-1.3 2 1 .3 1.7 1.2 1.7 2.3 0 1.7-1.4 2.9-3.3 2.9H3V7zm2 2v2.2h2.7c.7 0 1.1-.4 1.1-1.1 0-.7-.4-1.1-1.1-1.1H5zm0 4v2.5h3c.8 0 1.2-.5 1.2-1.2 0-.8-.5-1.3-1.2-1.3H5zM14 8.5h5v1.3h-5V8.5zM16.5 11c1.9 0 3.5 1.3 3.5 3.3 0 .2 0 .5-.1.7h-5.3c.2.9.9 1.4 1.8 1.4.7 0 1.3-.3 1.7-.8l1.3 1c-.6.8-1.7 1.4-3 1.4-2.2 0-3.8-1.5-3.8-3.5S14.4 11 16.5 11zm-1.8 2.7h3.5c-.1-.8-.8-1.4-1.7-1.4-.9 0-1.6.6-1.8 1.4z" fill="#fff"/>
    </svg>
  ),
  typescript: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="3" fill="#3178C6"/>
      <path d="M5 11h8v1.5H10v6H8v-6H5V11zM14.5 17.5c.5.3 1.2.5 1.8.5.7 0 1.1-.3 1.1-.7 0-.4-.3-.6-1.1-.9-1.3-.4-2.1-1-2.1-2.2 0-1.3 1-2.2 2.6-2.2.8 0 1.4.2 1.8.4l-.4 1.3c-.3-.2-.8-.3-1.4-.3-.6 0-1 .3-1 .6 0 .4.4.6 1.2.9 1.3.5 2 1.1 2 2.3 0 1.3-1 2.2-2.8 2.2-.8 0-1.6-.2-2-.5l.3-1.4z" fill="#fff"/>
    </svg>
  ),
  threejs: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 3-3 15L3 3z" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
      <path d="M7.5 6l9 1.5-1.5 7.5L7.5 6z" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <path d="M10 8l4.5.75-.75 3.75L10 8z" stroke="currentColor" strokeWidth="0.8" opacity="0.3"/>
    </svg>
  ),
  vite: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M21 3l-9 18L3 3l9 3 9-3z" fill="url(#vg)"/>
      <path d="M14 1l-2 10 6-8-4-2z" fill="url(#vy)"/>
      <defs>
        <linearGradient id="vg" x1="3" y1="3" x2="12" y2="21"><stop stopColor="#41D1FF"/><stop offset="1" stopColor="#BD34FE"/></linearGradient>
        <linearGradient id="vy" x1="14" y1="1" x2="12" y2="11"><stop stopColor="#FFBD4F"/><stop offset="1" stopColor="#FF9A00"/></linearGradient>
      </defs>
    </svg>
  ),
  bun: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="14" rx="9" ry="8" fill="#FBF0DF"/>
      <ellipse cx="12" cy="14" rx="9" ry="8" stroke="#B5956B" strokeWidth="0.8"/>
      <circle cx="9" cy="14" r="1" fill="#3B2314"/>
      <circle cx="15" cy="14" r="1" fill="#3B2314"/>
      <path d="M10 16.5c.6.5 1.2.7 2 .7s1.4-.2 2-.7" stroke="#3B2314" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  illustrator: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="3" width="22" height="18" rx="3" fill="#330000"/>
      <path d="M7 16l2.5-8h2L14 16h-2l-.6-2H9.6L9 16H7zm2.8-3.5h1.4L10.5 9.5l-.7 3z" fill="#FF9A00"/>
      <path d="M15 9h2v7h-2V9zM15.5 7.5c0-.5.4-1 1-1s1 .5 1 1-.4.9-1 .9-.9-.4-1-.9z" fill="#FF9A00"/>
    </svg>
  ),
  'premiere pro': (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="3" width="22" height="18" rx="3" fill="#00005B"/>
      <path d="M7 8h3.5c1.8 0 3 1 3 2.7 0 1.8-1.3 2.8-3.1 2.8H9V16H7V8zm2 1.5v2.5h1.3c.8 0 1.2-.5 1.2-1.2 0-.8-.5-1.3-1.2-1.3H9z" fill="#99F"/>
      <path d="M15 11v5h-2v-5.5c0-.8.3-1.5.8-1.5.5 0 .8.5 1 1h.2z" fill="#99F"/>
    </svg>
  ),
  maze: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#4D12E0" opacity="0.8"/>
      <path d="M12 2v10l10-5L12 2z" fill="#7B3AED" opacity="0.6"/>
    </svg>
  ),
  hotjar: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M16 2c0 4-3 5-3 9h-2c0-4 3-5 3-9h2z" fill="#FF3C00"/>
      <path d="M14 13c0 3-2 4-2 7h-2c0-3 2-4 2-7h2z" fill="#FF3C00" opacity="0.6"/>
      <path d="M10 2c0 3-2 4-2 7h-2c0-3 2-4 2-7h2z" fill="#FF3C00" opacity="0.6"/>
    </svg>
  ),
  d3: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5 3h6c3.3 0 6 2.7 6 6 0 1.5-.5 2.8-1.4 3.9.9 1 1.4 2.3 1.4 3.8 0 3.3-2.7 6-6 6H5v-3h6c1.7 0 3-1.3 3-3s-1.3-3-3-3H8v-3h3c1.7 0 3-1.3 3-3s-1.3-3-3-3H5V3z" fill="#F9A03C"/>
    </svg>
  ),
  tailwind: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 6c-2.7 0-4.4 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.7.2 1.2.7 1.8 1.3.9 1 2 2.2 4.2 2.2 2.7 0 4.4-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.7-.2-1.2-.7-1.8-1.3C15.3 7.2 14.2 6 12 6zM7 12c-2.7 0-4.4 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.7.2 1.2.7 1.8 1.3.9 1 2 2.2 4.2 2.2 2.7 0 4.4-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.7-.2-1.2-.7-1.8-1.3C10.3 13.2 9.2 12 7 12z" fill="#06B6D4"/>
    </svg>
  ),
}

// Normalize lookup: lowercase, strip dots/spaces for matching
function normalize(name: string): string {
  const n = name.toLowerCase().trim()
  // Special mappings
  if (n === 'three.js' || n === '3js') return 'threejs'
  if (n === 'd3.js') return 'd3'
  if (n === 'tailwind css' || n === 'tailwindcss') return 'tailwind'
  return n
}

interface BrandIconProps {
  name: string
  size?: number
  className?: string
}

export default memo(function BrandIcon({ name, size = 16, className }: BrandIconProps) {
  const key = normalize(name)
  const render = icons[key]
  if (!render) return null
  return (
    <span className={`brand-icon ${className || ''}`} aria-hidden="true">
      {render(size)}
    </span>
  )
})

export function hasBrandIcon(name: string): boolean {
  return !!icons[normalize(name)]
}
