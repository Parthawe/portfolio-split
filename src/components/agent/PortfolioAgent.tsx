import { useState, useCallback, useEffect, useRef, useMemo, lazy, Suspense } from 'react'
import AgentCharacter from './AgentCharacter'
import FigmaSelect from '../FigmaSelect'
import { useAgentBehavior } from '../../hooks/useAgentBehavior'
import { usePageTracking } from '../../hooks/usePageTracking'
import type { AgentState } from './AgentCharacter'

const AgentChat = lazy(() => import('./AgentChat'))
const PresentationBar = lazy(() => import('./PresentationBar'))

const PLATFORM_HINTS: Record<string, string> = {
  '/': 'Ask for the flagship projects.',
  '/work': 'Open Index view.',
  '/about': 'Ask about roles that fit.',
  '/playbook': 'Ask how a value shows up in real work.',
}

function getPlatformHint(route: string) {
  return PLATFORM_HINTS[route] || 'Tour this page.'
}

export default function PortfolioAgent() {
  const { state, entered, dockVisible, dragging, didDrag, wrapRef, setAgentState, wake, route } = useAgentBehavior()
  const pageTracking = usePageTracking(route)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatLoaded, setChatLoaded] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [presenting, setPresenting] = useState(false)
  const [homeHintVisible, setHomeHintVisible] = useState(route !== '/')
  const [toolsOpen, setToolsOpen] = useState(() => typeof document !== 'undefined' && document.body.classList.contains('site-tools-open'))
  const platformRef = useRef<HTMLDivElement>(null)
  const hint = useMemo(() => getPlatformHint(route), [route])

  const platformVisible =
    entered &&
    dockVisible &&
    !presenting &&
    (minimized || route !== '/' || homeHintVisible)
  const showChar = entered && dockVisible && !presenting

  useEffect(() => {
    if (route !== '/') {
      setHomeHintVisible(true)
      return
    }

    setHomeHintVisible(false)
    const timer = window.setTimeout(() => setHomeHintVisible(true), 8000)
    const onScroll = () => {
      const hero = document.getElementById('hero')
      if (!hero) return
      const threshold = Math.max(hero.offsetHeight * 0.55, 320)
      if (window.scrollY > threshold) {
        setHomeHintVisible(true)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [route])

  useEffect(() => {
    document.body.classList.toggle('agent-presenting', presenting)
    return () => document.body.classList.remove('agent-presenting')
  }, [presenting])

  // When Folio (the AI) is open, glow the viewport corners in the page's own
  // accent colour (project colour on case studies, category accent on landing
  // pages, site accent elsewhere).
  useEffect(() => {
    const active = chatOpen && !minimized
    document.body.classList.toggle('folio-active', active)
    if (active) {
      const accentSource =
        document.querySelector('.project-main') ||
        document.querySelector('[style*="--lp-accent"]')
      let accent = ''
      if (accentSource) {
        const cs = getComputedStyle(accentSource)
        accent = cs.getPropertyValue('--project-color').trim() || cs.getPropertyValue('--lp-accent').trim()
      }
      document.body.style.setProperty('--folio-glow-color', accent || 'var(--accent-hi)')
    }
    return () => document.body.classList.remove('folio-active')
  }, [chatOpen, minimized, route])

  // Bridge for the Figma panel: opens Folio while the agent chip is hidden.
  useEffect(() => {
    const onOpen = () => {
      if (state === 'sleeping') wake()
      setChatLoaded(true)
      setPresenting(false)
      if (minimized) {
        // A minimized chat is invisible in Figma mode (the platform pill is
        // hidden there), so the toggle restores it instead of closing it.
        setMinimized(false)
        setChatOpen(true)
        return
      }
      setChatOpen(prev => !prev)
    }
    window.addEventListener('folio:toggle', onOpen)
    return () => window.removeEventListener('folio:toggle', onOpen)
  }, [state, wake, minimized])

  // Let the Figma panel mirror whether Folio is open (active state on its ✦ buttons).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('folio:state', { detail: { open: chatOpen && !minimized } }))
  }, [chatOpen, minimized])

  // ── Click: toggle chat ──────────────────────────────
  const handleClick = useCallback(() => {
    if (didDrag.current) return
    if (state === 'sleeping') wake()

    // If minimized, restore (and exit presentation if active)
    if (minimized) {
      setMinimized(false)
      setPresenting(false)
      return
    }

    if (!chatLoaded) setChatLoaded(true)
    setChatOpen(prev => !prev)
  }, [state, chatLoaded, wake, didDrag, minimized])

  // ── Close chat (full close, clears conversation) ───
  const handleClose = useCallback(() => {
    setChatOpen(false)
    setMinimized(false)
    setPresenting(false)
    setAgentState('idle')
  }, [setAgentState])

  // ── Minimize chat (collapse to pill, preserve state) ──
  const handleMinimize = useCallback(() => {
    setMinimized(true)
  }, [])

  // ── Presentation mode ────────────────────────────────
  const handlePresent = useCallback(() => {
    setPresenting(true)
    setMinimized(true)
  }, [])

  const handleExitPresent = useCallback(() => {
    setPresenting(false)
  }, [])

  // ── Chat state bridge ───────────────────────────────
  const handleAgentState = useCallback((s: AgentState) => {
    setAgentState(s)
  }, [setAgentState])

  // Track Figma mode: its panels replace the agent chrome, so dock
  // visibility must not drive the chat there.
  useEffect(() => {
    const onTools = (e: Event) => setToolsOpen(Boolean((e as CustomEvent<{ open?: boolean }>).detail?.open))
    window.addEventListener('site-tools:state', onTools)
    return () => window.removeEventListener('site-tools:state', onTools)
  }, [])

  // Close chat + reset state when dock hides (footer) — except in Figma
  // mode, where the chat is opened from the panel and there is no dock.
  useEffect(() => {
    if (!dockVisible && chatOpen && !toolsOpen) {
      setChatOpen(false)
      setAgentState('idle')
    }
  }, [dockVisible, chatOpen, toolsOpen, setAgentState])

  return (
    <>
    {/* Gemini-style glow ring that wraps the whole site while Folio is open */}
    <div className="folio-glow" aria-hidden="true" />

    {/* Platform bar — bottom of viewport, character walks on it */}
    <div className={`agent-platform surface-glass ${platformVisible ? 'agent-platform--in' : 'agent-platform--out'}${minimized ? ' agent-platform--minimized' : ''}`} ref={platformRef}>
      <button
        className="agent-platform-tip figma-hover"
        onClick={handleClick}
        type="button"
        aria-label={minimized ? 'Resume chat' : 'Chat with Folio'}
        aria-haspopup="dialog"
        aria-expanded={chatOpen && !minimized}
      >
        <span className="agent-platform-dot" />
        <span className="agent-platform-text" key={minimized ? 'resume' : route}>
          {minimized ? 'Resume chat' : hint}
        </span>
        <FigmaSelect />
      </button>
    </div>

    <div
      ref={wrapRef}
      className={`agent-root ${showChar ? 'agent-root--in' : 'agent-root--out'} ${dragging ? 'agent-root--dragging' : ''}`}
    >
      <div className="agent-char-wrap">
        <AgentCharacter
          state={state}
          onClick={handleClick}
          chatOpen={chatOpen}
        />
      </div>
    </div>

    {chatLoaded && (
      <Suspense fallback={null}>
        <AgentChat
          open={chatOpen && !minimized}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onPresent={handlePresent}
          route={route}
          onAgentState={handleAgentState}
          pageTracking={pageTracking}
        />
      </Suspense>
    )}

    {presenting && (
      <Suspense fallback={null}>
        <PresentationBar route={route} onExit={handleExitPresent} />
      </Suspense>
    )}
    </>
  )
}
