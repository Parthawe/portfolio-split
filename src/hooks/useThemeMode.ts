import { useState, useEffect } from 'react'

/** Read-only hook that reactively tracks the current theme (light/dark). */
export function useThemeMode() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark',
  )
  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === 'dark')
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    // A sibling theme control may have initialized the document before this effect.
    sync()
    return () => obs.disconnect()
  }, [])
  return dark
}
