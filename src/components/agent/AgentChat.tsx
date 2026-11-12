import { useState, useRef, useEffect, useCallback, useId, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  sendMessage,
  getChips,
  getGreeting,
  createChatHistory,
  getTourSteps,
  getResponseAction,
  type ChatHistory,
  type ResponseAction,
  type TourStep,
} from '../../services/agentAI'
import { useTypewriter } from '../../hooks/useTypewriter'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useTTS } from '../../hooks/useTTS'
import { getReferrerInfo } from '../../utils/referrerDetection'
import { inferPersona, updatePersonaFromMessage } from '../../services/personaInference'
import FigmaSelect from '../FigmaSelect'

interface Message {
  id: number
  sender: 'agent' | 'user'
  raw: string
  typing?: boolean
}

interface PageTrackingData {
  scrollDepth: number
  timeOnPage: number
  visitHistory: string[]
}

interface Props {
  open: boolean
  onClose: () => void
  onMinimize: () => void
  onPresent?: () => void
  route: string
  onAgentState: (state: 'thinking' | 'talking' | 'idle' | 'waving' | 'pointing') => void
  pageTracking: PageTrackingData
}

const RICHTEXT_REGEX = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
const VOICE_START_RE = /^(start (a )?(voice guide|voice)|voice on|talk to me|enable voice)$/i
const VOICE_STOP_RE = /^(stop (the )?(voice guide|voice)|voice off|disable voice|text only)$/i
const TOUR_RE = /^(take me on a tour|give me a tour|tour|tour this page|show me around)$/i
const PRESENT_RE = /^(presentation mode|present|presenter|teleprompter|demo mode|speaker notes)$/i
const TOUR_KEYWORD_RE = /\btour\b/i
const GUIDED_RE = /(show me|take me to|go to|tell me about|walk me through|explain)/i
const NAVIGATE_RE = /^(go|open|visit|navigate|take|bring)\b/i
const WORK_FILTER_EVENT = 'folio:set-work-filter'

function wait(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function getRouteLabel(route: string): string {
  if (route === '/') return 'Home'
  if (route === '/work') return 'Work'
  if (route === '/about') return 'About'
  const slug = route.replace(/^\//, '')
  return slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : 'Portfolio'
}

function getPlaceholder(route: string, voiceMode: boolean): string {
  if (voiceMode) return 'Type or tap the mic...'
  if (route === '/' || route === '/work' || route === '/about') return 'Ask about the work...'
  return 'Ask about this project...'
}

function getRouteIntro(route: string, voiceMode: boolean): string {
  const base =
    route === '/'
      ? 'Use this like a guide. I can shortlist the work, open a project, or walk the page.'
      : route === '/work'
        ? 'I can switch between Editorial, Index, and Arc, filter the archive, point to the flagship work, or open any case study.'
        : route === '/about'
          ? 'Ask about roles, working style, or how the design and engineering work connect.'
          : 'Ask for the challenge, the key decision, or why this project matters.'

  return voiceMode ? `${base} Voice replies are on.` : base
}

function getArrivalPrompt(route: string): string {
  if (route === '/') return 'Home. Ask for the flagship work, or say tour.'
  if (route === '/work') return 'The work index. Want a shortlist?'
  if (route === '/about') return 'About Parth. Ask about roles or practice.'
  return `${getRouteLabel(route)}. Ask why this project matters.`
}

function getUtilityChips(route: string, voiceMode: boolean): string[] {
  const voiceChip = voiceMode ? 'Voice off' : 'Voice on'

  if (route === '/') return [voiceChip, 'Tour this page', 'Open Mentra']
  if (route === '/work') return [voiceChip, 'Index view', 'Arc view']
  if (route === '/about') return [voiceChip, 'Tour this page', 'Role fit']

  return [voiceChip, 'Tour this page']
}

function dispatchWorkFilter(filterKey: NonNullable<ResponseAction['filterKey']>) {
  window.dispatchEvent(new CustomEvent(WORK_FILTER_EVENT, { detail: { filterKey } }))
}

function resolveElement(selectors?: string[], existing?: HTMLElement | null) {
  if (existing) return existing
  if (!selectors?.length) return null

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement | null
    if (element) return element
  }

  return null
}

function highlightElement(element: HTMLElement | null) {
  if (!element) return
  element.style.scrollMarginTop = 'calc(var(--nav-h, 56px) + 1.5rem)'
  element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  element.style.outline = '2px solid var(--select-blue)'
  element.style.outlineOffset = '4px'
  element.style.transition = 'outline 0.25s ease, outline-offset 0.25s ease'
  window.setTimeout(() => {
    element.style.outline = ''
    element.style.outlineOffset = ''
  }, 2200)
}

function ExportActions({ text }: { text: string }) {
  const clean = text.replace(/^\[EXPORT\]\n?/, '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(clean).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }
  const handleEmail = () => {
    const subject = encodeURIComponent('Parth Pawar, Portfolio Summary')
    const body = encodeURIComponent(clean)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }
  return (
    <div className="agent-export-actions">
      <button type="button" className="agent-export-btn figma-hover" onClick={handleCopy} aria-label="Copy portfolio summary">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" strokeWidth="1.3" /></svg>
        {copied ? 'Copied' : 'Copy'}
        <FigmaSelect />
      </button>
      <button type="button" className="agent-export-btn figma-hover" onClick={handleEmail} aria-label="Email portfolio summary">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1.5 4.5L8 9l6.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
        Email
        <FigmaSelect />
      </button>
    </div>
  )
}

function RichText({ text, onNavigate }: { text: string; onNavigate: (path: string) => void }) {
  const parts: ReactNode[] = []
  const regex = new RegExp(RICHTEXT_REGEX.source, RICHTEXT_REGEX.flags)
  let lastIdx = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index))
    const segment = match[0]
    if (segment.startsWith('**')) {
      parts.push(<strong key={key++} className="font-semibold text-[var(--ink)]">{segment.slice(2, -2)}</strong>)
    } else {
      const linkMatch = segment.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        const [, label, href] = linkMatch
        parts.push(
          href.startsWith('/') ? (
            <button
              key={key++}
              className="inline bg-transparent border-none p-0 font-inherit text-[var(--ink)] underline decoration-[var(--ink-15)] underline-offset-2 hover:decoration-[var(--ink)] cursor-pointer"
              onClick={() => onNavigate(href)}
              type="button"
            >
              {label}
            </button>
          ) : (
            <a
              key={key++}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline text-[var(--ink)] underline decoration-[var(--ink-15)] underline-offset-2 hover:decoration-[var(--ink)]"
            >
              {label}
            </a>
          )
        )
      }
    }
    lastIdx = match.index + segment.length
  }

  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return <>{parts}</>
}

function TypewriterBubble({
  text,
  onNavigate,
  onDone,
}: {
  text: string
  onNavigate: (path: string) => void
  onDone: () => void
}) {
  const { displayed, isTyping, skip } = useTypewriter({ text, speed: 28 })

  useEffect(() => {
    if (!isTyping) onDone()
  }, [isTyping, onDone])

  return (
    <span onClick={isTyping ? skip : undefined} onKeyDown={isTyping ? (e) => { if (e.key === 'Enter' || e.key === ' ') skip(); } : undefined} role={isTyping ? 'button' : undefined} tabIndex={isTyping ? 0 : undefined} className={isTyping ? 'cursor-pointer' : ''}>
      <RichText text={displayed} onNavigate={onNavigate} />
      {isTyping && <span className="agent-typing-cursor">|</span>}
    </span>
  )
}

export default function AgentChat({ open, onClose, onMinimize, onPresent, route, onAgentState, pageTracking }: Props) {
  const navigate = useNavigate()
  const { speakAsync, cancel: cancelSpeech, muted, speaking, toggleMute } = useTTS()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [touring, setTouring] = useState(false)
  const [chips, setChips] = useState<string[]>([])
  const [voiceMode, setVoiceMode] = useState(() => {
    try { return localStorage.getItem('folio-voice-mode') === '1' } catch { return false }
  })
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)
  const historyRef = useRef<ChatHistory>(createChatHistory(route))
  const initializedRef = useRef(false)
  const currentRouteRef = useRef(route)
  const questionCount = useRef(0)
  const tourAbort = useRef(false)
  const pendingTourRoute = useRef<string | null>(null)
  const pendingWorkFilter = useRef<{ key: NonNullable<ResponseAction['filterKey']>; label: string } | null>(null)
  const pendingFocus = useRef<{ path: string; selectors?: string[]; label?: string; explanation?: string } | null>(null)
  const routeUpdateTimer = useRef<number | null>(null)
  const sendRef = useRef<(text: string, source?: 'voice' | 'text' | 'chip') => Promise<void>>(async () => {})
  const referrerInfoRef = useRef(getReferrerInfo())
  const titleId = useId()
  const introId = useId()

  /** Sync behavioral signals into ChatContext before every sendMessage */
  const syncContext = useCallback(() => {
    const ctx = historyRef.current.ctx
    ctx.scrollDepth = pageTracking.scrollDepth
    ctx.timeOnPage = pageTracking.timeOnPage
    ctx.visitHistory = pageTracking.visitHistory
    // Referrer: set once
    if (!ctx.referrer && referrerInfoRef.current.referrer) {
      ctx.referrer = referrerInfoRef.current.referrer
      ctx.utmSource = referrerInfoRef.current.utmSource
      ctx.utmMedium = referrerInfoRef.current.utmMedium
      ctx.utmCampaign = referrerInfoRef.current.utmCampaign
    }
    // Re-infer persona every 3 questions
    if (ctx.questionCount % 3 === 0 || ctx.persona === 'unknown') {
      ctx.persona = inferPersona(ctx)
    }
  }, [pageTracking])

  const {
    start: startListening,
    stop: stopListening,
    listening: micListening,
    supported: micSupported,
  } = useSpeechRecognition(
    useCallback((transcript: string) => {
      void sendRef.current(transcript, 'voice')
    }, [])
  )

  useEffect(() => {
    try { localStorage.setItem('folio-voice-mode', voiceMode ? '1' : '0') } catch {}
  }, [voiceMode])

  const composeChips = useCallback((nextRoute: string, count: number, lastQuestion?: string) => {
    const base = getChips(nextRoute, count, lastQuestion, historyRef.current.ctx).filter(Boolean)
    const utility = getUtilityChips(nextRoute, voiceMode)
    return [...utility, ...base].filter((chip, index, all) => all.indexOf(chip) === index).slice(0, 4)
  }, [voiceMode])

  const pushMessage = useCallback((sender: 'agent' | 'user', raw: string, typing = false) => {
    const id = ++idCounter.current
    setMessages(prev => [...prev, { id, sender, raw, typing }])
    return id
  }, [])

  const speakIfNeeded = useCallback(async (text: string, mode: 'reply' | 'tour' | 'confirm' = 'reply') => {
    if (!voiceMode) return
    await speakAsync(text, { mode })
  }, [voiceMode, speakAsync])

  const markDone = useCallback((id: number) => {
    setMessages(prev => prev.map(message => message.id === id ? { ...message, typing: false } : message))
    if (!touring && !thinking && !speaking) onAgentState('idle')
  }, [onAgentState, touring, thinking, speaking])

  const runTour = useCallback(async (steps: TourStep[]) => {
    setTouring(true)
    tourAbort.current = false
    stopListening()
    onAgentState('talking')

    for (const step of steps) {
      if (tourAbort.current) break

      pushMessage('agent', step.text, true)
      if (step.scrollTo) {
        highlightElement(document.querySelector(step.scrollTo) as HTMLElement | null)
      }

      if (voiceMode) {
        await speakAsync(step.text, { mode: 'tour' })
        if (tourAbort.current) break
        await wait(Math.max(250, step.delay))
      } else {
        await wait(Math.max(800, Math.min(1800, step.text.length * 18 + step.delay)))
      }
    }

    setTouring(false)
    onAgentState('idle')
    if (!tourAbort.current) {
      setChips(composeChips(route, questionCount.current))
    }
  }, [composeChips, onAgentState, pushMessage, route, speakAsync, stopListening, voiceMode])

  const stopTour = useCallback(async () => {
    tourAbort.current = true
    cancelSpeech()
    setTouring(false)
    onAgentState('idle')
    pushMessage('agent', 'Tour stopped. Ask for another section or project.', true)
    setChips(composeChips(route, questionCount.current))
    await wait(120)
  }, [cancelSpeech, composeChips, onAgentState, pushMessage, route])

  const interruptTour = useCallback(() => {
    if (!touring) return
    tourAbort.current = true
    cancelSpeech()
    setTouring(false)
    onAgentState('idle')
  }, [cancelSpeech, onAgentState, touring])

  useEffect(() => {
    if (!open) {
      cancelSpeech()
      stopListening()
      if (routeUpdateTimer.current) window.clearTimeout(routeUpdateTimer.current)
      onAgentState('idle')
      return
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [open, cancelSpeech, onAgentState, stopListening])

  useEffect(() => {
    if (!open) return

    historyRef.current.route = route
    historyRef.current.ctx.route = route

    if (!initializedRef.current) {
      initializedRef.current = true
      currentRouteRef.current = route
      // Sync behavioral context before first greeting so persona/chips reflect browsing history
      syncContext()
      setMessages([{ id: ++idCounter.current, sender: 'agent', raw: getGreeting(route), typing: true }])
      setChips(composeChips(route, 0))
      // Wave on first greeting
      onAgentState('waving')
      window.setTimeout(() => onAgentState('idle'), 1500)
      return
    }

    if (currentRouteRef.current !== route) {
      currentRouteRef.current = route
      const hasPendingFocus = pendingFocus.current?.path === route
      const hasPendingTour = pendingTourRoute.current === route
      const pendingFilterLabel = route === '/work' ? pendingWorkFilter.current?.label : null
      if (!hasPendingFocus && !hasPendingTour) {
        pushMessage('agent', pendingFilterLabel ? `Work ready. Showing **${pendingFilterLabel}**.` : getArrivalPrompt(route), true)
      }
      setChips(composeChips(route, questionCount.current))

      if (pendingWorkFilter.current && route === '/work') {
        const nextFilter = pendingWorkFilter.current
        pendingWorkFilter.current = null
        window.setTimeout(() => {
          dispatchWorkFilter(nextFilter.key)
          highlightElement(document.querySelector('.work-bottom-nav, .pcard-masonry') as HTMLElement | null)
        }, 280)
      }

      if (pendingFocus.current?.path === route) {
        const focus = pendingFocus.current
        pendingFocus.current = null

        if (routeUpdateTimer.current) window.clearTimeout(routeUpdateTimer.current)
        routeUpdateTimer.current = window.setTimeout(() => {
          const target = resolveElement(focus.selectors)
          if (target) highlightElement(target)

          if (focus.explanation) {
            pushMessage('agent', focus.explanation, true)
            void speakIfNeeded(focus.explanation, 'reply')
          }
        }, 620)
      }

      if (pendingTourRoute.current === route) {
        if (routeUpdateTimer.current) window.clearTimeout(routeUpdateTimer.current)
        routeUpdateTimer.current = window.setTimeout(() => {
          pendingTourRoute.current = null
          void runTour(getTourSteps(route))
        }, 650)
      }
    }
  }, [open, route, composeChips, pushMessage, runTour])

  useEffect(() => {
    const el = messagesEndRef.current
    if (!el) return
    const container = el.closest('.agent-float-msgs')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages, thinking, chips])

  useEffect(() => {
    const panel = wrapRef.current
    if (!panel || !open) return

    // Bottom is handled by CSS; no JS positioning needed
    return
  }, [open, route])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const handleNav = useCallback((path: string) => {
    navigate(path)
  }, [navigate])

  const enableVoiceMode = useCallback(async () => {
    setVoiceMode(true)
    stopListening()
    const text = 'Voice on. I’ll speak replies. Use the mic when you want to talk back.'
    pushMessage('agent', text, true)
    await speakAsync(text, { mode: 'confirm' })
  }, [pushMessage, speakAsync, stopListening])

  const disableVoiceMode = useCallback(() => {
    setVoiceMode(false)
    stopListening()
    cancelSpeech()
    pushMessage('agent', 'Voice off. Text stays on.', true)
  }, [cancelSpeech, pushMessage, stopListening])

  const handleSend = useCallback(async (text: string, source: 'voice' | 'text' | 'chip' = 'text') => {
    const trimmed = text.trim()
    if (!trimmed || thinking || streaming) return

    syncContext()
    updatePersonaFromMessage(historyRef.current.ctx, trimmed)
    stopListening()

    if (touring) {
      interruptTour()
    }

    pushMessage('user', trimmed)
    if (source !== 'voice') setInput('')

    const normalized = trimmed.toLowerCase().replace(/[?.!]+$/, '').trim()

    if (VOICE_START_RE.test(normalized)) {
      await enableVoiceMode()
      return
    }

    if (VOICE_STOP_RE.test(normalized)) {
      disableVoiceMode()
      return
    }

    if (PRESENT_RE.test(normalized) && onPresent) {
      pushMessage('agent', 'Entering presentation mode. Use arrow keys or the controls. ESC to exit.', true)
      window.setTimeout(() => onPresent(), 600)
      return
    }

    if (TOUR_RE.test(normalized)) {
      await runTour(getTourSteps(route))
      return
    }

    const action = getResponseAction(trimmed, route)
    const targetPath = action.path ?? (action.slug !== undefined ? (action.slug ? `/${action.slug}` : '/') : null)
    const targetRoute = action.routePath ?? (action.slug !== undefined ? (action.slug ? `/${action.slug}` : '/') : null)
    const isGuidedRequest = GUIDED_RE.test(normalized)
    const wantsNavigation = isGuidedRequest || NAVIGATE_RE.test(normalized)

    if (action.slug && action.selectors?.length) {
      const path = `/${action.slug}`

      if (route === path) {
        const target = resolveElement(action.selectors, action.element)
        if (target) highlightElement(target)

        const textResponse = action.explanation || `Here is${action.label ? ` **${action.label}**` : ' the right section'}.`
        pushMessage('agent', textResponse, true)
        await speakIfNeeded(textResponse, 'reply')
        setChips(composeChips(route, questionCount.current, trimmed))
      } else {
        const textResponse = `Opening${action.label ? ` **${action.label}**` : ' the right section'}.`
        pushMessage('agent', textResponse, true)
        await speakIfNeeded(textResponse, 'confirm')
        pendingFocus.current = {
          path,
          selectors: action.selectors,
          label: action.label,
          explanation: action.explanation,
        }
        navigate(path)
      }

      return
    }

    if (TOUR_KEYWORD_RE.test(normalized) && targetPath && targetRoute) {
      if (route === targetRoute) {
        await runTour(getTourSteps(route))
      } else {
        const textResponse = `Opening${action.label ? ` **${action.label}**` : ''}. I’ll give you the tour there.`
        pushMessage('agent', textResponse, true)
        await speakIfNeeded(textResponse, 'confirm')
        pendingTourRoute.current = targetRoute
        navigate(targetPath)
      }
      return
    }

    if (targetPath && targetRoute && isGuidedRequest && route !== targetRoute && (action.type === 'scroll' || action.type === 'navigate')) {
      const textResponse = `Opening${action.label ? ` **${action.label}**` : ''}. I’ll walk you through it once we land there.`
      pushMessage('agent', textResponse, true)
      await speakIfNeeded(textResponse, 'confirm')
      pendingTourRoute.current = targetRoute
      navigate(targetPath)
      return
    }

    if (action.type === 'scroll') {
      const target = resolveElement(action.selectors, action.element)
      if (!target) {
        const fallbackText = 'I know where that should be, but the section is not available on this page.'
        pushMessage('agent', fallbackText, true)
        await speakIfNeeded(fallbackText, 'confirm')
        return
      }

      onAgentState('pointing')
      window.setTimeout(() => onAgentState('idle'), 1200)
      highlightElement(target)
      const textResponse = action.explanation || `Here${action.label ? ` is **${action.label}**` : ''}. ${isGuidedRequest ? 'Ask for the next decision and I will keep going.' : 'Ask for the challenge, process, or why it matters.'}`
      pushMessage('agent', textResponse, true)
      await speakIfNeeded(textResponse, action.explanation ? 'reply' : 'confirm')
      setChips(composeChips(route, questionCount.current, trimmed))
      return
    }

    if (action.type === 'filter' && action.filterKey) {
      const textResponse = route === '/work'
        ? `Showing **${action.label || 'selected work'}**.`
        : `Opening Work and showing **${action.label || 'selected work'}**.`

      pushMessage('agent', textResponse, true)
      await speakIfNeeded(textResponse, 'confirm')

      if (route === '/work') {
        dispatchWorkFilter(action.filterKey)
        highlightElement(document.querySelector('.work-bottom-nav, .pcard-masonry') as HTMLElement | null)
      } else {
        pendingWorkFilter.current = {
          key: action.filterKey,
          label: action.label || 'Selected work',
        }
        navigate('/work')
      }

      setChips(composeChips('/work', questionCount.current, trimmed))
      return
    }

    if (action.type === 'navigate' && targetPath && targetRoute === route) {
      const textResponse = `Switching to${action.label ? ` **${action.label}**` : ' that view'}.`
      pushMessage('agent', textResponse, true)
      await speakIfNeeded(textResponse, 'confirm')
      navigate(targetPath)
      window.setTimeout(() => {
        const target = resolveElement(action.selectors)
        if (target) highlightElement(target)

        if (action.explanation) {
          pushMessage('agent', action.explanation, true)
          void speakIfNeeded(action.explanation, 'reply')
        }
      }, 360)
      setChips(composeChips(route, questionCount.current, trimmed))
      return
    }

    if (action.type === 'navigate' && targetPath && wantsNavigation) {
      const textResponse = `Opening${action.label ? ` **${action.label}**` : ''}.${isGuidedRequest ? ' I’ll guide it once we land there.' : ''}`
      pushMessage('agent', textResponse, true)
      await speakIfNeeded(textResponse, 'confirm')
      if (targetRoute && !isGuidedRequest && action.selectors?.length) {
        pendingFocus.current = {
          path: targetRoute,
          selectors: action.selectors,
          label: action.label,
          explanation: action.explanation,
        }
      }
      pendingTourRoute.current = isGuidedRequest ? (targetRoute || null) : null
      navigate(targetPath)
      return
    }

    questionCount.current += 1
    setThinking(true)
    setStreaming(true)
    onAgentState('thinking')
    const responseId = pushMessage('agent', '', true)

    try {
      const finalText = await sendMessage(trimmed, historyRef.current, partialText => {
        setMessages(prev => prev.map(message => (
          message.id === responseId ? { ...message, raw: partialText, typing: true } : message
        )))
      })

      setMessages(prev => prev.map(message => (
        message.id === responseId ? { ...message, raw: finalText, typing: true } : message
      )))
      setChips(composeChips(route, questionCount.current, trimmed))
      onAgentState('talking')
      await speakIfNeeded(finalText, 'reply')
    } catch {
      setMessages(prev => prev.map(message => (
        message.id === responseId ? { ...message, raw: 'Something went wrong. Ask for a project, a section, or a shortlist.', typing: false } : message
      )))
      onAgentState('idle')
    } finally {
      setThinking(false)
      setStreaming(false)
      if (!touring) onAgentState('idle')
    }
  }, [
    thinking,
    streaming,
    touring,
    route,
    navigate,
    pushMessage,
    stopListening,
    interruptTour,
    enableVoiceMode,
    disableVoiceMode,
    runTour,
    composeChips,
    onAgentState,
    speakIfNeeded,
    syncContext,
  ])

  sendRef.current = handleSend

  if (!open) return null

  const statusLabel = touring ? 'Touring' : micListening ? 'Listening' : speaking ? 'Speaking' : thinking ? 'Thinking' : voiceMode ? 'Voice on' : 'Ready'
  const anyTyping = messages.some(message => message.typing)

  return (
    <div
      ref={wrapRef}
      className="agent-floating"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={introId}
    >
      <div className={`agent-panel surface-glass surface-glass--strong${voiceMode ? ' agent-panel--voice' : ''}`} aria-busy={thinking || streaming}>
        <div className="agent-panel-head">
          <div className="agent-panel-id">
            <span
              className={`agent-orb${speaking ? ' agent-orb--speaking' : micListening ? ' agent-orb--listening' : thinking ? ' agent-orb--thinking' : ''}`}
              aria-hidden="true"
            />
            <div>
              <p className="agent-panel-kicker">Site guide</p>
              <h2 className="agent-panel-title" id={titleId}>Folio</h2>
            </div>
          </div>

          <div className="agent-panel-tools">
            <button
              type="button"
              className={`agent-panel-tool figma-hover${voiceMode ? ' is-active' : ''}`}
              onClick={() => { void (voiceMode ? disableVoiceMode() : enableVoiceMode()) }}
              aria-label={voiceMode ? 'Disable voice' : 'Enable voice'}
              aria-pressed={voiceMode}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 6v4h3l4 4V2L5 6H2z" fill="currentColor" />
                <path d="M12 4.5c1.3 1.2 1.3 5.8 0 7M14 2.5c2.5 2.5 2.5 8.5 0 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              </svg>
              <FigmaSelect />
            </button>
            {voiceMode && (
              <button
                type="button"
                className={`agent-panel-tool figma-hover${muted ? '' : ' is-active'}`}
                onClick={toggleMute}
                aria-label={muted ? 'Unmute Folio voice' : 'Mute Folio voice'}
                aria-pressed={!muted}
              >
                {muted ? (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 6v4h3l4 4V2L5 6H2z" fill="currentColor" />
                    <line x1="12" y1="5" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="16" y1="5" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 6v4h3l4 4V2L5 6H2z" fill="currentColor" />
                    <path d="M12 4.5c1.3 1.2 1.3 5.8 0 7M14 2.5c2.5 2.5 2.5 8.5 0 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  </svg>
                )}
                <FigmaSelect />
              </button>
            )}
            <button onClick={onMinimize} type="button" className="agent-panel-tool figma-hover" aria-label="Minimize chat">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <FigmaSelect />
            </button>
            <button onClick={touring ? () => { void stopTour() } : onClose} type="button" className="agent-panel-close figma-hover" aria-label="Close Folio">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <FigmaSelect />
            </button>
          </div>
        </div>

        {/* Status only surfaces while something is happening — an idle chat
            doesn't need a dashboard. */}
        {(thinking || speaking || touring || micListening) && (
          <div className="agent-panel-meta">
            <span
              className={`agent-panel-status is-active${micListening ? ' is-listening' : ''}`}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span
                className={`agent-ribbon${speaking ? ' agent-ribbon--speaking' : ''}${micListening ? ' agent-ribbon--listening' : ''}${thinking ? ' agent-ribbon--thinking' : ''}`}
                aria-hidden="true"
              >
                <i /><i /><i /><i /><i />
              </span>
              {statusLabel}
            </span>
          </div>
        )}

        {/* Kept for screen readers; visually the greeting bubble says it. */}
        <p className="agent-panel-intro sr-only" id={introId}>{getRouteIntro(route, voiceMode)}</p>

        {voiceMode && (
          <div className="agent-voice-stage" aria-hidden={false}>
            <span
              className={`agent-orb agent-orb--stage${speaking ? ' agent-orb--speaking' : micListening ? ' agent-orb--listening' : thinking ? ' agent-orb--thinking' : ''}`}
              aria-hidden="true"
            />
            <p className="agent-voice-line" aria-live="polite">
              {(() => {
                const lastAgent = [...messages].reverse().find(message => message.sender === 'agent')
                if (micListening) return 'Listening…'
                if (thinking) return 'Thinking…'
                if (!lastAgent) return 'Voice is on. Ask me anything about the work.'
                return lastAgent.raw
                  .replace(/^\[EXPORT\]\n?/, '')
                  .replace(/\*\*/g, '')
                  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
              })()}
            </p>
          </div>
        )}

        <div className="agent-float-msgs" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversation">
          {messages.map(message => (
            <div key={message.id} className={`agent-float-bubble ${message.sender === 'user' ? 'agent-float-bubble--user' : 'agent-float-bubble--agent'}`}>
              {message.sender === 'agent' && message.typing ? (
                <TypewriterBubble text={message.raw.replace(/^\[EXPORT\]\n?/, '')} onNavigate={handleNav} onDone={() => markDone(message.id)} />
              ) : (
                <RichText text={message.raw.replace(/^\[EXPORT\]\n?/, '')} onNavigate={handleNav} />
              )}
              {message.sender === 'agent' && message.raw.startsWith('[EXPORT]') && !message.typing && (
                <ExportActions text={message.raw} />
              )}
            </div>
          ))}

          {thinking && (
            <div className="agent-float-bubble agent-float-bubble--agent agent-float-dots" aria-hidden="true">
              <span /><span /><span />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {chips.length > 0 && !thinking && !anyTyping && (
          <div className="agent-float-chips" aria-label="Suggestions">
            {chips.map(chip => (
              <button key={chip} onClick={() => { void handleSend(chip, 'chip') }} type="button" className="agent-float-chip figma-hover">
                {chip}
                <FigmaSelect />
              </button>
            ))}
          </div>
        )}

        <form onSubmit={event => { event.preventDefault(); void handleSend(input, 'text') }} className="agent-float-input surface-glass surface-glass--subtle">
          {micSupported && (
            <button
              type="button"
              onClick={micListening ? stopListening : startListening}
              className={`agent-float-mic${micListening ? ' agent-float-mic--on' : ''}`}
              aria-label={micListening ? 'Stop listening' : 'Speak to Folio'}
              aria-pressed={micListening}
              title={micListening ? 'Stop listening' : 'Speak to Folio'}
            >
              <span className="agent-float-mic-ring" aria-hidden="true" />
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="5" y="1" width="6" height="9" rx="3" fill="currentColor" />
                <path d="M3 7v1a5 5 0 0010 0V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            placeholder={getPlaceholder(route, voiceMode)}
            aria-label="Ask Folio about Parth Pawar's portfolio"
            value={input}
            onChange={event => setInput(event.target.value)}
            autoComplete="off"
            disabled={thinking || streaming}
          />

          <button type="submit" disabled={!input.trim() || thinking || streaming} className="agent-float-send figma-hover" aria-label="Send message">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.5 8H13.5M9 3.5L13.5 8L9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <FigmaSelect />
          </button>
        </form>
      </div>
    </div>
  )
}
