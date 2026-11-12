import { useEffect, useState } from 'react'
import { isPerformanceDegraded, PERFORMANCE_MODE_EVENT } from '../utils/performance'

export function usePerformanceDegraded() {
  const [degraded, setDegraded] = useState(isPerformanceDegraded)

  useEffect(() => {
    const sync = () => setDegraded(isPerformanceDegraded())
    window.addEventListener(PERFORMANCE_MODE_EVENT, sync)
    return () => window.removeEventListener(PERFORMANCE_MODE_EVENT, sync)
  }, [])

  return degraded
}
