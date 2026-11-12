import { useEffect, useState } from 'react'

function getMatch(query: string, fallback: boolean) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return fallback
  }
  return window.matchMedia(query).matches
}

export function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(() => getMatch(query, fallback))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const media = window.matchMedia(query)
    const sync = () => setMatches(media.matches)
    sync()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync)
      return () => media.removeEventListener('change', sync)
    }

    media.addListener(sync)
    return () => media.removeListener(sync)
  }, [query])

  return matches
}
