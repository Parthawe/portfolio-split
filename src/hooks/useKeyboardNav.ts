import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { visibleProjects as projects } from '../data/projects'
import { useProjectReturn } from '../components/ProjectReturnContext'

/**
 * Keyboard shortcuts for portfolio navigation:
 * - Esc on project pages → return to the originating collection
 * - ? → show shortcut hint (console only for now)
 */
const PROJECT_PATHS = new Set(projects.map(project => `/${project.slug}`))

export function useKeyboardNav(enabled = true) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const projectReturn = useProjectReturn()

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      // Don't capture when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable) return

      const overlayOpen =
        !!document.querySelector('.lightbox-overlay.active') ||
        !!document.querySelector('.mobile-overlay.open') ||
        !!document.querySelector('.agent-floating') ||
        !!document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]') ||
        !!document.fullscreenElement

      // Esc → go back to /work from project pages
      if (e.key === 'Escape' && PROJECT_PATHS.has(pathname) && !overlayOpen) {
        e.preventDefault()
        navigate(projectReturn.href)
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [enabled, navigate, pathname, projectReturn.href])
}
