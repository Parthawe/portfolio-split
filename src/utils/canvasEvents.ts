import { events, type RootState } from '@react-three/fiber'

// Async canvas setup can complete after its host has unmounted.
export function safeCanvasEvents(store: Parameters<typeof events>[0]) {
  const manager = events(store)
  const connect = manager.connect
  manager.connect = (target: RootState['events']['connected']) => {
    if (target && 'addEventListener' in target) connect?.(target)
  }
  return manager
}
