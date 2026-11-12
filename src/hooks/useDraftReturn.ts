import { useLocation } from 'react-router-dom'

/** Keep collection context on internal draft navigation without accepting a return URL. */
export function useDraftReturn() {
  const { state } = useLocation()
  const saved = typeof state?.draftSearch === 'string' ? state.draftSearch : ''
  const source = new URLSearchParams(saved), clean = new URLSearchParams()
  for (const key of ['kind', 'q', 'source']) { const value = source.get(key); if (value) clean.set(key, value) }
  const search = clean.size ? `?${clean}` : ''
  return { href: `/experience-preview${search}`, state: { draftSearch: search } }
}
