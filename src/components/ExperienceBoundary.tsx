import { Component, type ReactNode } from 'react'

/** Optional experiences must not take their surrounding project page down. */
export default class ExperienceBoundary extends Component<{
  children: ReactNode; fallback?: ReactNode; onError?: () => void
}, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError?.() }
  render() { return this.state.failed ? this.props.fallback ?? null : this.props.children }
}
