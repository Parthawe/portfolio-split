import { useEffect, useState } from 'react'
import { isPerformanceDegraded, PERFORMANCE_MODE_EVENT } from '../utils/performance'

export function usePerformanceDegraded(isDegraded = isPerformanceDegraded) {
  const [degraded, setDegraded] = useState(isDegraded)

  useEffect(() => {
    const sync = () => setDegraded(isDegraded())
    window.addEventListener(PERFORMANCE_MODE_EVENT, sync)
    return () => window.removeEventListener(PERFORMANCE_MODE_EVENT, sync)
  }, [isDegraded])

  return degraded
}
