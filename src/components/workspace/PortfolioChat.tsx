import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PointerCursorGlyph from '../PointerCursorGlyph'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { setCanvasChromePreference } from '../../utils/performance'
import { getChatPageContext, getChatSections, resolveChatScroll, type ChatScroll } from '../../services/chatPageContext'
import { MAX_CHAT_QUESTION_LENGTH } from '../../services/chatLimits'
import type { ChatHistory } from '../../services/agentAI'
import { chatProjectSlug } from '../../utils/chatProjectPath'
import { useChatPanelLayout } from './useChatPanelLayout'
import '../../styles/portfolio-chat.css'

type Message = { role: 'user' | 'assistant'; text: string; failed?: boolean; reload?: boolean; route?: string; source?: 'ai' | 'notes'; destination?: { path: string; label: string } }
const SESSION_KEY = 'portfolio-chat-session-v1'
const MODALS = 'dialog[open], .lightbox-overlay.active, .compact-sheet-backdrop, .arcade-overlay, .project-image-preview.active, [aria-modal="true"]:not(.portfolio-chat-panel)'
function restore(): { messages: Message[]; draft: string } {
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}')
    if (value.version === 1 && Array.isArray(value.messages)) return {
      messages: value.messages.filter((m: Message) => m && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string').slice(-100).map((m: Message) => ({ ...m, reload: false, text: m.text.slice(0, 8000) })),
      draft: typeof value.draft === 'string' ? value.draft.slice(0, MAX_CHAT_QUESTION_LENGTH) : '',
    }
  } catch { /* A conversation also works without browser storage. */ }
  return { messages: [], draft: '' }
}
function RichText({ text }: { text: string }) {
  const parts = text.replace(/^\[EXPORT\]\n?/, '').split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]]+\]\([^)]+\))/g)
  return <>{parts.map((part, i): ReactNode => {
    if (part.startsWith('**')) return <strong key={i}><RichText text={part.slice(2, -2)} /></strong>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}><RichText text={part.slice(1, -1)} /></em>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (match) {
      const [, label, url] = match
      if (url.startsWith('/') && !url.startsWith('//')) return <Link key={i} to={url}>{label}</Link>
      if (/^https?:\/\//.test(url)) return <a key={i} href={url} target="_blank" rel="noreferrer">{label}</a>
      return label
    }
    return part
  })}</>
}
function Answer({ text }: { text: string }) {
  // Render only text, links and simple lists. Never interpret assistant HTML.
  const lines = text.replace(/^\[EXPORT\]\n?/, '').replace(/([^\n])\s*•\s+/g, '$1\n• ').split('\n')
  const blocks: ReactNode[] = []
  let items: string[] = []
  let ordered = false
  const flush = () => {
    if (!items.length) return
    const children = items.map((item, i) => <li key={i}><RichText text={item} /></li>)
    blocks.push(ordered ? <ol key={blocks.length}>{children}</ol> : <ul key={blocks.length}>{children}</ul>)
    items = []
  }
  for (const line of lines) {
    const item = line.match(/^\s*(?:[•*-]|(\d+)[.)])\s+(.+)$/)
    if (item) {
      const nextOrdered = Boolean(item[1])
      if (items.length && ordered !== nextOrdered) flush()
      ordered = nextOrdered; items.push(item[2])
    } else {
      flush()
      if (line.trim()) blocks.push(<p key={blocks.length}><RichText text={line} /></p>)
    }
  }
  flush()
  return <>{blocks}</>
}
function CopyAnswer({ text }: { text: string }) {
  const [status, setStatus] = useState('Copy answer')
  useEffect(() => {
    if (status === 'Copy answer') return
    const timer = setTimeout(() => setStatus('Copy answer'), 2500)
    return () => clearTimeout(timer)
  }, [status])
  return <button type="button" className="portfolio-chat-copy" onClick={async () => {
    try { await navigator.clipboard.writeText(text); setStatus('Copied') }
    catch { setStatus('Couldn’t copy. Select the text.') }
  }} aria-live="polite">{status}</button>
}
function Icon({ close = false }: { close?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={close ? 'M6 6l12 12M18 6L6 18' : 'M4 4h16v13H9l-5 4V4Z'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export default function PortfolioChat({ cursorAvailable = false }: { cursorAvailable?: boolean }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const appearance = useChatPanelLayout()
  const [layoutOpen, setLayoutOpen] = useState(false)
  const layoutOpenRef = useRef(false)
  const layoutButton = useRef<HTMLButtonElement>(null)
  const [sections, setSections] = useState<ReturnType<typeof getChatSections>>([])
  const route = pathname.replace(/\/+$/, '') || '/'
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(restore)
  const [busy, setBusy] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [unread, setUnread] = useState(false)
  const [suspended, setSuspended] = useState(false)
  const wide = useMediaQuery('(min-width: 1200px)')
  const cursorAnimation = useMediaQuery('(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  const animatedCursor = cursorAvailable && cursorAnimation
  const panel = useRef<HTMLElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const history = useRef<ChatHistory | null>(null)
  const request = useRef(0)
  const busyRef = useRef(false)
  const pinned = useRef(true)
  const previousCount = useRef(session.messages.length)
  const activeReply = useRef<number | null>(null)
  const pageName = route === '/' ? 'Home' : route.slice(1).replace(/-/g, ' ').replace(/\b\w/g, s => s.toUpperCase())
  const close = useCallback(() => {
    setOpen(false)
    setLayoutOpen(false)
    requestAnimationFrame(() => {
      const previous = previousFocus.current
      const returnTo = previous?.isConnected && previous !== document.body && !panel.current?.contains(previous)
        ? previous
        : trigger.current || document.querySelector<HTMLButtonElement>('.reading-cursor__trigger')
      returnTo?.focus({ preventScroll: true })
    })
  }, [])
  const show = useCallback(() => {
    previousFocus.current = document.activeElement as HTMLElement
    window.dispatchEvent(new Event('site-tools:close'))
    setCanvasChromePreference(false)
    setOpen(true)
  }, [])

  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ version: 1, ...session })) } catch { /* Optional storage. */ }
  }, [session])
  useEffect(() => {
    const openFromTools = (event: Event) => {
      if ((event as CustomEvent<{ dock?: string }>).detail?.dock === 'left') appearance.dock('left')
      show()
    }
    window.addEventListener('portfolio-chat:open', openFromTools)
    // The original canvas UI keeps its own controls and layout. Chat steps away.
    const onTools = (event: Event) => { if ((event as CustomEvent).detail?.open) setOpen(false) }
    window.addEventListener('site-tools:state', onTools)
    return () => {
      window.removeEventListener('portfolio-chat:open', openFromTools)
      window.removeEventListener('site-tools:state', onTools)
    }
  }, [show, appearance.dock])
  useEffect(() => { layoutOpenRef.current = layoutOpen }, [layoutOpen])
  useEffect(() => {
    if (!open) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const update = () => setSections(previous => {
      const next = getChatSections()
      return next.length === previous.length && next.every((section, index) => section.title === previous[index].title && section.element === previous[index].element) ? previous : next
    })
    const observer = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(update, 100) })
    observer.observe(document.getElementById('site-zoom-stage') || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] })
    update()
    return () => { observer.disconnect(); clearTimeout(timer) }
  }, [open, pathname])
  useLayoutEffect(() => {
    document.body.classList.toggle('portfolio-chat-open', open)
    document.body.classList.toggle('portfolio-chat-wide', open && wide && appearance.layout.dock !== 'floating')
    document.body.classList.toggle('portfolio-chat-right', open && appearance.layout.dock === 'right')
    document.body.style.setProperty('--portfolio-chat-width', `${appearance.layout.width}px`)
    window.dispatchEvent(new Event('resize'))
    return () => {
      document.body.classList.remove('portfolio-chat-open', 'portfolio-chat-wide', 'portfolio-chat-right')
      document.body.style.removeProperty('--portfolio-chat-width')
    }
  }, [open, wide, appearance.layout.dock, appearance.layout.width])
  useEffect(() => {
    if (!open) return
    const update = () => {
      const active = Array.from(document.querySelectorAll<HTMLElement>(MODALS)).some(el => el.getClientRects().length > 0)
      setSuspended(active)
    }
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-modal', 'open', 'hidden'] })
    update()
    return () => observer.disconnect()
  }, [open])
  useEffect(() => {
    if (!open || suspended) return
    // Do not summon the software keyboard until a visitor taps the composer.
    if (matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (Array.from(document.querySelectorAll<HTMLElement>(MODALS)).some(el => el.getClientRects().length)) return
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopImmediatePropagation()
        if (layoutOpenRef.current) { setLayoutOpen(false); layoutButton.current?.focus() }
        else close()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, wide, suspended, close])
  useLayoutEffect(() => {
    const changed = previousCount.current !== session.messages.length
    previousCount.current = session.messages.length
    if (!open || !log.current) return
    if (!session.messages.length) { log.current.scrollTop = 0; setUnread(false); return }
    if (pinned.current) {
      const messages = log.current.querySelectorAll<HTMLElement>('.portfolio-chat-message')
      const latest = messages[activeReply.current ?? messages.length - 1]
      if (!busy && latest?.classList.contains('portfolio-chat-message--assistant') && latest.offsetHeight > log.current.clientHeight * .8) {
        log.current.scrollTop += latest.getBoundingClientRect().top - log.current.getBoundingClientRect().top - 8
      } else log.current.scrollTop = log.current.scrollHeight
    } else if (changed) setUnread(true)
  }, [session.messages, busy, open])
  useEffect(() => {
    if (pinned.current && log.current) log.current.scrollTop = session.messages.length ? log.current.scrollHeight : 0
  }, [appearance.layout.width, appearance.layout.height, appearance.layout.textSize, appearance.mobileHeight])
  useEffect(() => {
    if (!layoutOpen) return
    const outside = (event: PointerEvent) => {
      if (!(event.target as Element).closest('.portfolio-chat-layout, .portfolio-chat-layout-toggle')) setLayoutOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [layoutOpen])
  useEffect(() => {
    if (!open || !window.visualViewport) return
    const viewport = window.visualViewport
    const update = () => {
      panel.current?.style.setProperty('--chat-visible-height', `${viewport.height}px`)
      panel.current?.toggleAttribute('data-compact-view', viewport.height < 450)
      panel.current?.style.setProperty('--chat-keyboard-offset', `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`)
    }
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => { viewport.removeEventListener('resize', update); viewport.removeEventListener('scroll', update) }
  }, [open])
  useLayoutEffect(() => {
    const field = input.current
    if (!field || !open) return
    field.style.height = 'auto'
    field.style.height = `${Math.min(160, field.scrollHeight)}px`
  }, [session.draft, open])
  const send = async (value: string, retryIndex?: number, fromComposer = false) => {
    const text = value.trim()
    if (!text || text.length > MAX_CHAT_QUESTION_LENGTH || busyRef.current) return
    pinned.current = true; setUnread(false)
    input.current?.focus({ preventScroll: true })
    busyRef.current = true; setBusy(true)
    const id = ++request.current
    const snapshot = session.messages
    const retry = retryIndex !== undefined
    activeReply.current = retryIndex ?? null
    const questionRoute = retry ? snapshot[retryIndex]?.route || route : route
    const addAnswer = (message: Message) => setSession(s => ({ ...s, messages: (retry ? s.messages.map((previous, index) => index === retryIndex ? { ...message, route: questionRoute } : previous) : [...s.messages, { ...message, route: questionRoute }]).slice(-100) }))
    setSession(s => ({ draft: retry || !fromComposer ? s.draft : '', messages: retry ? s.messages : [...s.messages, { role: 'user' as const, text, route: questionRoute }].slice(-100) }))
    const applyScroll = (scroll: ChatScroll) => {
        const answer = `Showing ${scroll.label}.`
        history.current?.turns.push({ question: text, answer })
        addAnswer({ role: 'assistant', text: answer })

        window.setTimeout(() => {
          if (id !== request.current || (window.location.pathname.replace(/\/+$/, '') || '/') !== route) return
          const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
          if (scroll.top !== undefined) window.scrollTo({ top: scroll.top, behavior })
          else if (scroll.element?.isConnected) window.scrollTo({ top: window.scrollY + scroll.element.getBoundingClientRect().top - 100, behavior })
          else if (scroll.edge) window.scrollTo({ top: scroll.edge === 'top' ? 0 : document.documentElement.scrollHeight, behavior })
        }, 120)
    }
    let moduleReady = false
    try {
      const directScroll = questionRoute === route ? resolveChatScroll(text) : null
      if (directScroll) { applyScroll(directScroll); return }
      const ai = await import('../../services/agentAI')
      moduleReady = true
      if (id !== request.current) return
      if (!history.current) {
        history.current = ai.createChatHistory(questionRoute)
        for (let i = 0; i < snapshot.length - 1; i++) {
          if (snapshot[i].role === 'user' && snapshot[i + 1].role === 'assistant' && !snapshot[i + 1].failed) history.current.turns.push({ question: snapshot[i].text, answer: snapshot[i + 1].text })
        }
      }
      if (retry && history.current.turns.slice(-1)[0]?.question === text) history.current.turns.pop()
      if (history.current.route !== questionRoute) {
        history.current.ctx.lastProject = chatProjectSlug(questionRoute)
        history.current.ctx.lastTopic = undefined
      }
      history.current.route = questionRoute; history.current.ctx.route = questionRoute
      const command = text.replace(/^(?:(?:please\s+)?(?:can|could|would)\s+you\s+|please\s+)/i, '')
      const action = ai.getResponseAction(command, questionRoute)
      const explicitScroll = /^(scroll|show me|take me|go to|jump)/i.test(command)
      const scroll: ChatScroll | null = questionRoute !== route ? null : (explicitScroll && action.type === 'scroll' && action.element?.getClientRects().length ? { element: action.element, label: action.label || 'Section', edge: undefined, top: undefined } : null)
      if (scroll) { applyScroll(scroll); return }
      const destination = action.type === 'navigate' || action.slug
        ? { path: action.path || `/${action.slug || ''}`, label: action.label || 'Open project' }
        : undefined
      if (destination && /^(?:open|visit|go to|take me to|show(?: me)?|scroll to|jump to)\b/i.test(command) && !/\b(how|why|compare|explain)\b/i.test(command) && questionRoute === route) {
        addAnswer({ role: 'assistant', text: `Opening ${destination.label}.`, destination })
        navigate(destination.path)
        return
      }
      if (/^(?:scroll|jump)\b/i.test(command) && !destination) {
        addAnswer({ role: 'assistant', text: 'I couldn’t find that section here. Choose a section from the menu, or name the project you want to open.' })
        return
      }
      let source: 'ai' | 'notes' = 'notes'
      const answer = await ai.sendMessage(text, history.current, undefined, { surface: 'panel', pageContext: questionRoute === route ? getChatPageContext() : undefined, onSource: value => { source = value } })
      if (id === request.current) addAnswer({ role: 'assistant', text: answer, destination, source })
    } catch {
      if (id === request.current) addAnswer({ role: 'assistant', text: moduleReady ? 'The answer could not be loaded. Your question is saved. Try again.' : 'Chat files couldn’t load. Reload, then retry your saved question.', failed: true, reload: !moduleReady })
    } finally { if (id === request.current) { busyRef.current = false; setBusy(false) } }
  }
  const reloadChat = async (index: number) => {
    if (busyRef.current) return
    busyRef.current = true; setBusy(true); setReloading(true)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10_000)
    try {
      // WebKit can retain a failed module download across a plain reload.
      // Refresh only the same-origin chat chunk before reloading the document.
      const chatFile = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="modulepreload"]'))
        .map(link => new URL(link.href))
        .find(url => url.origin === window.location.origin && /\/agentAI-[^/]+\.js$/.test(url.pathname))
      if (chatFile) {
        const response = await fetch(chatFile.href, { cache: 'reload', signal: controller.signal })
        if (!response.ok) throw new Error('Chat download failed')
        await response.arrayBuffer()
      }
      window.location.reload()
    } catch {
      setSession(s => ({ ...s, messages: s.messages.map((message, position) => position === index
        ? { ...message, text: 'Chat files are still unavailable. Check your connection, then try Reload chat again.' }
        : message) }))
    } finally {
      window.clearTimeout(timeout)
      busyRef.current = false; setBusy(false); setReloading(false)
    }
  }
  const newChat = () => {
    request.current++; history.current = null; busyRef.current = false; setBusy(false)
    setSession({ messages: [], draft: '' }); activeReply.current = null; pinned.current = true; setUnread(false); input.current?.focus()
  }
  const suggestions = route === '/' || route === '/work' ? ['Where should I start?', 'What has Parth shipped?', 'How does Parth approach design?'] : route === '/about' ? ['What is Parth’s experience?', 'How does Parth work with engineers?', 'What kind of roles fit Parth?'] : ['What problem did this project solve?', 'What did Parth own?', 'What was the key decision?']

  return createPortal(<>
    {!open && !animatedCursor && <button ref={trigger} className="portfolio-chat-cursor" onClick={show} aria-label="Ask Parth about this work" aria-expanded={false}><PointerCursorGlyph className="portfolio-chat-cursor-glyph" /><span>parth</span></button>}
    <aside ref={panel} data-dock={appearance.layout.dock} style={{ '--chat-text-size': `${appearance.layout.textSize}px`, '--chat-width': `${appearance.layout.width}px`, '--chat-height': `${appearance.layout.height}px`, '--chat-x': `${appearance.layout.x}px`, '--chat-y': `${appearance.layout.y}px`, ...(appearance.mobileHeight !== null ? { '--chat-mobile-height': `${appearance.mobileHeight}px` } : {}) } as CSSProperties} className="portfolio-chat-panel" hidden={!open} inert={suspended} role="complementary" aria-label="Ask Parth chat" data-cursor-exclude>
      <header className="portfolio-chat-header" {...appearance.drag} tabIndex={appearance.layout.dock === 'floating' ? 0 : undefined} aria-label={appearance.layout.dock === 'floating' ? 'Move chat with arrow keys or drag the header' : undefined} onKeyDown={event => {
        if (event.target !== event.currentTarget) return
        const direction: Record<string, [number, number]> = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }
        if (direction[event.key]) { event.preventDefault(); appearance.moveBy(...direction[event.key]) }
      }}><div><h2>Ask Parth</h2><p>AI portfolio guide</p></div><button type="button" className="portfolio-chat-new-compact" disabled={reloading} onClick={newChat}>New chat</button><button ref={layoutButton} type="button" className="portfolio-chat-layout-toggle" aria-expanded={layoutOpen} aria-controls="portfolio-chat-layout" onClick={() => setLayoutOpen(value => !value)} aria-label="Layout" title="Panel layout and text size"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M5 17h14M9 4v6M15 14v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button><button type="button" className="portfolio-chat-icon" onClick={close} aria-label="Close panel"><Icon close /></button></header>
      {layoutOpen && <div id="portfolio-chat-layout" className="portfolio-chat-layout" role="group" aria-label="Chat layout and text size">
        <div className="portfolio-chat-dock-controls" role="group" aria-label="Panel position">{(['left', 'right', 'floating'] as const).map(dock => <button key={dock} aria-pressed={appearance.layout.dock === dock} onClick={() => { appearance.dock(dock); setLayoutOpen(false); requestAnimationFrame(() => dock === 'floating' ? panel.current?.querySelector<HTMLElement>('header')?.focus() : layoutButton.current?.focus()) }}>{dock === 'floating' ? 'Float' : dock === 'left' ? 'Dock left' : 'Dock right'}</button>)}</div>
        <div className="portfolio-chat-size-controls portfolio-chat-width-controls"><span>Width</span><button aria-label="Make chat narrower" onClick={() => appearance.resizeWidth(-40)}>Narrower</button><button aria-label="Make chat wider" onClick={() => appearance.resizeWidth(40)}>Wider</button></div>
        <div className="portfolio-chat-height-controls"><span>Height</span><button aria-label="Make chat shorter" onClick={() => appearance.resizeHeight(-60)}>Shorter</button><button aria-label="Make chat taller" onClick={() => appearance.resizeHeight(60)}>Taller</button></div>
        <div className="portfolio-chat-size-controls"><span>Text</span><button aria-label="Smaller chat text" disabled={appearance.layout.textSize <= 14} onClick={() => appearance.textSize(-1)}>Smaller</button><button aria-label="Larger chat text" disabled={appearance.layout.textSize >= 19} onClick={() => appearance.textSize(1)}>Larger</button></div>
        <button className="portfolio-chat-layout-reset" onClick={() => { appearance.reset(); setLayoutOpen(false); layoutButton.current?.focus() }}>Reset layout</button>
      </div>}
      <button type="button" className="portfolio-chat-resize" aria-label="Resize chat using drag or arrow keys" {...appearance.resize} onKeyDown={event => {
        if (!event.key.startsWith('Arrow')) return
        event.preventDefault()
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') appearance.resizeHeight((event.key === 'ArrowUp' ? 30 : -30) * (innerWidth < 600 ? 1 : -1))
        else appearance.resizeWidth((event.key === 'ArrowRight' ? 24 : -24) * (appearance.layout.dock === 'right' ? -1 : 1))
      }}><span aria-hidden="true" /></button>
      <div className="portfolio-chat-chat">
        <div className="portfolio-chat-context"><span title={`Viewing ${pageName}`}>Viewing {pageName}</span><button disabled={reloading} onClick={newChat}>New chat</button></div>
        <div className="portfolio-chat-messages" ref={log} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text" onScroll={e => { const el = e.currentTarget; pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60; if (pinned.current) setUnread(false) }}>
          {!session.messages.length && <div className="portfolio-chat-welcome"><h3>Ask about the work.</h3><p>Explore the decisions behind the projects, find relevant work, or ask about Parth’s role.</p><div className="portfolio-chat-suggestions">{suggestions.map(q => <button key={q} disabled={busy} onClick={() => void send(q)}><span>{q}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>)}</div></div>}
          {session.messages.map((m, i) => <div key={i} data-source={m.source} className={`portfolio-chat-message portfolio-chat-message--${m.role}`}><span className="portfolio-chat-speaker">{m.role === 'user' ? 'You' : 'Parth’s AI guide'}</span>{m.role === 'assistant' ? <><Answer text={m.text} />{m.source === 'notes' && <p className="portfolio-chat-source">From portfolio notes · live AI unavailable</p>}<div className="portfolio-chat-answer-actions">{!m.failed && <CopyAnswer text={m.text} />}{(m.failed || m.source === 'notes') && <button disabled={busy} className="portfolio-chat-retry" onClick={() => m.reload ? void reloadChat(i) : void send(session.messages.slice(0, i).reverse().find(x => x.role === 'user')?.text || '', i)}>{m.reload ? 'Reload chat' : m.failed ? 'Retry answer' : 'Try live AI again'}</button>}</div>{m.destination && !m.text.includes(`](${m.destination.path})`) && m.destination.path.startsWith('/') && !m.destination.path.startsWith('//') && <Link className="portfolio-chat-destination" to={m.destination.path}>{m.destination.label} ↗</Link>}</> : m.text}</div>)}
          {busy && <p role="status" className="portfolio-chat-thinking">{reloading ? 'Reloading chat files…' : 'Looking through the portfolio…'}</p>}
        </div>
        {unread && <button className="portfolio-chat-latest" onClick={() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; pinned.current = true; setUnread(false) }}>Jump to latest</button>}
        <details className="portfolio-chat-browse"><summary>Browse this page<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></summary><div className="portfolio-chat-browse-controls"><div className="portfolio-chat-jump"><label className="sr-only" htmlFor="portfolio-chat-section">Jump to a page section</label><select id="portfolio-chat-section" value="" onChange={event => { const section = sections[Number(event.target.value)]; if (section?.element.isConnected) { window.scrollTo({ top: window.scrollY + section.element.getBoundingClientRect().top - 100, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) } }}><option value="">Jump to a section…</option>{sections.map((section, index) => <option key={`${section.title}-${index}`} value={index}>{section.title}</option>)}</select></div>
        <div className="portfolio-chat-guidance" aria-label="Page navigation"><button disabled={busy} onClick={() => void send('Next section')}>Next section ↓</button><button disabled={busy} onClick={() => void send('Back to top')}>Back to top ↑</button></div></div></details>
        <form className="portfolio-chat-composer" onSubmit={e => { e.preventDefault(); void send(session.draft, undefined, true) }}><textarea ref={input} disabled={reloading} rows={1} maxLength={MAX_CHAT_QUESTION_LENGTH} value={session.draft} aria-label="Message Ask Parth" aria-describedby="portfolio-chat-input-help" placeholder="Ask about the work…" onChange={e => setSession(s => ({ ...s, draft: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(session.draft, undefined, true) } }} /><div><span>AI answers. Check the linked projects.</span><button disabled={busy || !session.draft.trim()} type="submit" aria-label="Send" title="Send message"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div></form><p className="portfolio-chat-input-help" id="portfolio-chat-input-help">Enter to send · Shift + Enter for a new line{session.draft.length >= 700 && ` · ${session.draft.length}/${MAX_CHAT_QUESTION_LENGTH}`}</p>
      </div>
    </aside>
  </>, document.body)
}
