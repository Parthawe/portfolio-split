import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { getProjectNarrative } from '../data/agentKnowledge'
import type { ChatHistory } from '../services/agentAI'
import { getCursorThinkingLine } from '../services/parthCursorVoice'
import PointerCursorGlyph from './PointerCursorGlyph'

type ParthStep = {
  selectors: string[]
  note: string
  label: string
  quiet?: boolean
  avoidDenseMedia?: boolean
}

type ResolvedStep = ParthStep & {
  element: HTMLElement
  anchor: HTMLElement
}

type ParthRevealDetail = {
  element: HTMLElement
  message: string
}

const CATEGORY_ROUTES = new Set([
  '/ai',
  '/ux',
  '/ux-design',
  '/ux-research',
  '/ui',
  '/design-engineer',
  '/creative-tech',
  '/design-engineering',
  '/installations',
  '/brand',
  '/brand-visual',
  '/healthcare',
  '/fintech',
  '/design-for-good',
  '/crypto',
  '/ai-wearables',
])

const UI_EXCLUSION_SELECTOR = [
  'nav',
  '.nav',
  '.figma-chrome',
  '.site-tools',
  '.lightbox',
  '[role="dialog"]',
  '[data-cursor-exclude]',
].join(',')

const ANCHOR_SELECTOR = [
  '[data-parth-anchor]',
  'h1',
  'h2',
  'h3',
  '.cs-section-title',
  '.work-group-head',
  '.lp-section-label',
  '.pcard',
  '.project-card',
  'a',
].join(',')

const LABEL_AVOID_SELECTOR = [
  'a',
  'button',
  'input',
  '[role="button"]',
  '[data-parth-anchor]',
  '.pcard',
  '.project-card',
  '.hero-cta',
  '.wr-cta',
  '.lp-hero a',
].join(',')

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const YOU_CURSOR_TIP_OFFSET = { x: 2, y: 4 }
const TOUR_SLIDE_HOLD_MS = 5_000
const WELCOME_DELAY_MS = 1_600
const WELCOME_HOLD_MS = 4_500
const WELCOMED_ROUTES = new Set<string>()

const CATEGORY_CUES: Record<string, Partial<Record<string, string>>> = {
  '/ai': { 'how I see it': 'AI gets interesting when the human still has the last word.', 'start here': 'I would start with the AI work that escaped the chat box.' },
  '/ai-wearables': { 'how I see it': 'A tiny display is a ruthless design critic. I like that.', 'start here': 'This is the platform story I would open first.' },
  '/ux': { 'how I see it': 'Pretty screens are the receipt. The decisions are the work.', 'start here': 'Start where research actually changed the product.' },
  '/ux-design': { 'how I see it': 'Pretty screens are the receipt. The decisions are the work.', 'start here': 'Start where research actually changed the product.' },
  '/ux-research': { 'how I see it': 'Research matters when it changes the decision, not just the deck.', 'start here': 'Start with the twenty interviews behind the healthcare story.' },
  '/ui': { 'how I see it': 'Good UI makes trust visible before anyone has to ask.', 'start here': 'This is my most complete product system.' },
  '/design-engineer': { 'how I see it': 'If I can prototype it, we can argue with evidence.', 'start here': 'Start where the design became working behavior.' },
  '/design-engineering': { 'how I see it': 'If I can prototype it, we can argue with evidence.', 'start here': 'Start where the design became working behavior.' },
  '/creative-tech': { 'how I see it': 'If I can prototype it, we can argue with evidence.', 'start here': 'Start where the design became working behavior.' },
  '/installations': { 'how I see it': 'Here, the room is part of the interface. No viewport required.', 'start here': 'Start with the piece people could inhabit.' },
  '/fintech': { 'how I see it': 'Money is stressful enough. The interface should not add suspense.', 'start here': 'I would start with the highest-risk flow.' },
  '/crypto': { 'how I see it': 'Complex rails are fine. Confusing decisions are not.', 'start here': 'Start where transaction risk becomes legible.' },
  '/brand': { 'how I see it': 'A logo is a moment. I care more about the system after it.', 'start here': 'I would start with the broadest visual system.' },
  '/brand-visual': { 'how I see it': 'A logo is a moment. I care more about the system after it.', 'start here': 'I would start with the broadest visual system.' },
  '/healthcare': { 'how I see it': 'When the stakes rise, clarity stops being cosmetic.', 'start here': 'Start with the decision-support work.' },
  '/design-for-good': { 'how I see it': 'Access is part of the system, not the paragraph at the end.', 'start here': 'Start where service and interface meet.' },
}

function compactWords(value: string | undefined, fallback: string, limit = 10) {
  if (!value) return fallback
  const firstSentence = (value.match(/^[^.!?]+[.!?]?/)?.[0] ?? value).replace(/[.!?]+$/, '')
  const words = firstSentence.split(/\s+/).filter(Boolean)
  const compact = words.length > limit ? `${words.slice(0, limit).join(' ')}...` : firstSentence
  return compact.charAt(0).toUpperCase() + compact.slice(1)
}

function intelligentNote(pathname: string, step: ParthStep) {
  const categoryCue = CATEGORY_CUES[pathname]?.[step.label]
  if (categoryCue) return categoryCue

  const project = getProjectNarrative(pathname.replace(/^\//, ''))
  if (!project?.deep) return step.note

  if (step.label === 'what shipped') return `${compactWords(project.deep.outcome, step.note, 9)} That is the headline.`
  if (step.label === 'quick version') return `${project.name}, minus the case-study homework.`
  if (step.label === 'why') return `${compactWords(project.deep.challenge, step.note, 10)} That was the real knot.`
  if (step.label === 'what I chose') return `${compactWords(project.deep.insight, step.note, 10)} That is the bet I would make again.`
  if (step.label === 'what changed') return `${compactWords(project.deep.outcome, step.note, 9)} Proof beats polish.`
  return step.note
}

function tourPrompt(pathname: string) {
  if (pathname === '/work') return 'Help me choose'
  if (pathname === '/' || pathname === '/about' || CATEGORY_ROUTES.has(pathname)) return 'Show me around'
  return 'Tour this project'
}

function pageWelcome(pathname: string) {
  if (pathname === '/') return 'Welcome. Take your time — click me if you want help choosing where to start.'
  if (pathname === '/work') return 'Welcome to the work. Click me if you want a shorter path through it.'
  if (pathname === '/about') return 'Welcome. This is the person behind the work — ask me anything along the way.'
  if (CATEGORY_ROUTES.has(pathname)) return 'Welcome. Click me if you want a guided path through this collection.'
  return 'Welcome in. Click me if you want the decisions behind this project.'
}

function conversationPrompts(pathname: string) {
  if (pathname === '/') return [tourPrompt(pathname), 'Where should I start?', 'What should I hire you for?']
  if (pathname === '/work') return [tourPrompt(pathname), 'Best three?', 'Show me range']
  if (pathname === '/about') return [tourPrompt(pathname), 'What roles fit?', 'What drives the work?']
  if (CATEGORY_ROUTES.has(pathname)) return [tourPrompt(pathname), 'Where should I start?', 'What connects these?']
  return [tourPrompt(pathname), 'Why this?', 'What did I own?']
}

function contextualQuestion(pathname: string, question: string) {
  const project = getProjectNarrative(pathname.replace(/^\//, ''))
  if (!project) return question

  const normalized = question.toLowerCase().replace(/[?.!]+$/, '').trim()
  if (normalized === 'why this') return `What was the challenge in ${project.name}, and why did it matter?`
  if (normalized === 'why') return `Why did that decision matter in ${project.name}?`
  if (normalized === 'what did i own') return `What did Parth own on ${project.name}?`
  if (normalized === 'what changed') return `What was the outcome of ${project.name}?`
  return `On the current ${project.name} project page, ${question}`
}

function pageSteps(pathname: string): ParthStep[] {
  if (pathname === '/') {
    return [
      { selectors: ['#hero'], label: 'welcome', note: 'You made it. I have opinions about where to start.' },
      { selectors: ['.wr-featured-v2 [data-project]:first-of-type', '.wr-featured-v2'], label: 'start here', note: 'Short on time? These are the projects I would defend first.' },
      { selectors: ['.wr-identity'], label: 'about me', note: 'Context behind the pixels. I promise to keep it brief.' },
      { selectors: ['.wr-disciplines'], label: 'what I do', note: 'Products, code, and physical interaction. I dislike staying in one lane.' },
      { selectors: ['.wr-archive'], label: 'more work', note: 'The smaller experiments are where I let the edges get weird.' },
      {
        selectors: ['[data-parth-comment-target]', '.ft-canvas-hint-btn'],
        label: 'your turn',
        note: 'Leave me a note before you go.',
      },
    ]
  }

  if (pathname === '/work') {
    return [
      { selectors: ['.work-page-header'], label: 'welcome', note: 'The whole shelf. I would still only make you open three.' },
      { selectors: ['#work-project-results .pcard:first-of-type', '#work-project-results .work-library-row:first-of-type', '#work-project-results .work-timeline-feature'], label: 'start here', note: 'I would open this first. It makes the clearest argument.' },
      { selectors: ['.work-group--archive', '.work-library-shelves', '.work-timeline-main'], label: 'more work', note: 'Range matters, but not at the cost of a point of view.', quiet: true },
      { selectors: ['[data-parth-comment-target]', '.ft-canvas-hint-btn', 'footer'], label: 'your turn', note: 'Leave me a note if something stood out.' },
    ]
  }

  if (pathname === '/about') {
    return [
      { selectors: ['.abt-photo-hero'], label: 'hello', note: 'I design products, then keep making when nobody asked.' },
      { selectors: ['.abt-table-wrap'], label: 'the path', note: 'The path looks messy. The throughline is not.' },
      { selectors: ['.abt-recognition'], label: 'proof', note: 'Nice signals. I care more about what survived contact with users.' },
      { selectors: ['.abt-vibe'], label: 'code + design', note: 'Code lets me argue with working behavior, not slides.' },
      { selectors: ['.abt-codex'], label: 'agent practice', note: 'Context, tight loops, verification. The token count is only the exhaust.' },
      { selectors: ['.abt-beyond'], label: 'off the clock', note: 'Apparently I do not know how to stop making things.' },
      { selectors: ['[data-parth-comment-target]', '.ft-canvas-hint-btn', 'footer'], label: 'your turn', note: 'Leave me a note before you go.' },
    ]
  }

  if (CATEGORY_ROUTES.has(pathname)) {
    return [
      { selectors: ['.ch--landing', '.lp-hero'], label: 'how I see it', note: 'This is how I think about the practice.' },
      { selectors: ['#lp-work .pcard:first-of-type', '#lp-work .project-card:first-of-type'], label: 'start here', note: 'I would open this project first.' },
      { selectors: ['#lp-work .pcard-masonry', '#lp-work .pcard-grid'], label: 'more work', note: 'There is more in the same lane below.', quiet: true },
      { selectors: ['.lp-impact-strip'], label: 'in the world', note: 'This is where the work met real people.' },
      { selectors: ['.lp-parth-does', '.wr-about-card'], label: 'how it connects', note: 'This practice is one part of how I work.', quiet: true },
      { selectors: ['[data-parth-comment-target]', '.ft-canvas-hint-btn', 'footer'], label: 'your turn', note: 'Leave me a note if this work connects.' },
    ]
  }

  return [
    { selectors: ['.proj-visual-hero', '.proj-hero', '.project-hero', '#main-content > section:first-of-type'], label: 'what shipped', note: 'Outcome first. Process has to earn your attention.' },
    { selectors: ['.cs-expand-preview', '#cs-summary', '.cs-quick-summary-shell'], label: 'quick version', note: 'No homework. Here is the useful version.' },
    { selectors: ['#cs-context', '#cs-problem', '#cs-background', '#cs-overview'], label: 'why', note: 'This was the tension I could not leave alone.' },
    { selectors: ['#cs-bet', '#cs-process', '#cs-design', '#cs-concept', '#cs-research', '#cs-challenges', '#cs-discover', '#cs-define', '#cs-develop'], label: 'what I chose', note: 'Here is the bet, including the uncomfortable tradeoff.', avoidDenseMedia: true },
    { selectors: ['#cs-impact', '#cs-results', '#cs-result', '#cs-outcome', '#cs-reflections', '#cs-learning'], label: 'what changed', note: 'If nothing changed, the case study is decoration.' },
    { selectors: ['.next-project', '.cs-next-project', '[class*="next-project"]'], label: 'next one', note: 'I would pair this with the project below.', quiet: true },
    { selectors: ['[data-parth-comment-target]', '.ft-canvas-hint-btn', 'footer'], label: 'your turn', note: 'Tell me what stood out.' },
  ]
}

function queryFirst(selectors: string[]) {
  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector)
    if (element) return element
  }
  return null
}

function mediaDensity(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const area = Math.max(rect.width * rect.height, 1)
  let mediaArea = 0

  element.querySelectorAll<HTMLElement>('img,picture,video,canvas,figure').forEach(media => {
    const mediaRect = media.getBoundingClientRect()
    mediaArea += Math.max(0, mediaRect.width) * Math.max(0, mediaRect.height)
  })

  return Math.min(mediaArea / area, 1)
}

function resolveSteps(pathname: string): ResolvedStep[] {
  return pageSteps(pathname).flatMap(step => {
    const element = queryFirst(step.selectors)
    if (!element || element.closest(UI_EXCLUSION_SELECTOR)) return []
    if (step.avoidDenseMedia && mediaDensity(element) > 0.58) return []

    const anchor = element.matches(ANCHOR_SELECTOR)
      ? element
      : element.querySelector<HTMLElement>(ANCHOR_SELECTOR) ?? element

    return [{ ...step, element, anchor }]
  })
}

function tourStepsFrom(resolved: ResolvedStep[]) {
  return resolved
    .filter(step => step.label !== 'your turn' && step.label !== 'next one')
    .slice(0, 5)
}

function visibleScore(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const viewportTop = 86
  const viewportBottom = window.innerHeight - 72
  const overlap = Math.max(0, Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop))
  const visibleRatio = overlap / Math.max(Math.min(rect.height, viewportBottom - viewportTop), 1)
  const centerDistance = Math.abs(rect.top + rect.height * 0.5 - window.innerHeight * 0.48) / window.innerHeight
  return visibleRatio * 2.25 - centerDistance
}

function cursorCoordinates(x: number, y: number) {
  const xPercent = clamp(Math.round((x / Math.max(window.innerWidth, 1)) * 100), 0, 99)
  const yPercent = clamp(Math.round((y / Math.max(window.innerHeight, 1)) * 100), 0, 99)
  return `${String(xPercent).padStart(2, '0')},${String(yPercent).padStart(2, '0')}`
}

export default function CollaboratorCursor() {
  const { pathname, search } = useLocation()
  const normalizedPathname = pathname === '/' ? pathname : pathname.replace(/\/+$/, '')
  const routeKey = `${normalizedPathname}${search}`
  const [conversationOpen, setConversationOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [reply, setReply] = useState('')
  const [asking, setAsking] = useState(false)
  const [thinkingLine, setThinkingLine] = useState('Let me think.')
  const [tourActive, setTourActive] = useState(false)
  const [tourPaused, setTourPaused] = useState(false)
  const [tourIndex, setTourIndex] = useState(0)
  const [tourTotal, setTourTotal] = useState(0)
  const layerRef = useRef<HTMLDivElement>(null)
  const parthRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const youRef = useRef<HTMLDivElement>(null)
  const parthCoordinatesRef = useRef<HTMLSpanElement>(null)
  const youCoordinatesRef = useRef<HTMLSpanElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const pointer = useRef({ x: -160, y: -160, seen: false })
  const hoveredLabelTarget = useRef<HTMLElement | null>(null)
  const steps = useRef<ResolvedStep[]>([])
  const activeIndex = useRef(-1)
  const frame = useRef<number | null>(null)
  const settleTimer = useRef<number | null>(null)
  const refreshTimer = useRef<number | null>(null)
  const thinkingTimer = useRef<number | null>(null)
  const typeTimer = useRef<number | null>(null)
  const parkTimer = useRef<number | null>(null)
  const actionTimer = useRef<number | null>(null)
  const tourStartTimer = useRef<number | null>(null)
  const tourAdvanceTimer = useRef<number | null>(null)
  const welcomeTimer = useRef<number | null>(null)
  const typingStep = useRef<number | null>(null)
  const parkedRef = useRef(false)
  const spokenSteps = useRef(new Set<number>())
  const ambientCountRef = useRef(0)
  const lastAmbientAtRef = useRef(0)
  const conversationOpenRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<ChatHistory | null>(null)
  const requestIdRef = useRef(0)
  const tourStepsRef = useRef<ResolvedStep[]>([])
  const tourActiveRef = useRef(false)
  const tourPausedRef = useRef(false)
  const tourIndexRef = useRef(0)
  const programmaticScrollUntilRef = useRef(0)
  const revealTargetRef = useRef<HTMLElement | null>(null)
  const welcomeActiveRef = useRef(false)
  const tourGoRef = useRef<(index: number) => void>(() => {})
  const tourFinishRef = useRef<(message?: string) => void>(() => {})

  const setConversation = (open: boolean) => {
    if (open) { window.dispatchEvent(new Event('portfolio-chat:open')); return }
    if (open && tourAdvanceTimer.current !== null) {
      window.clearTimeout(tourAdvanceTimer.current)
      tourAdvanceTimer.current = null
    }
    const parth = parthRef.current
    if (parth) {
      parth.classList.remove('is-nearby')
      if (open) {
        welcomeActiveRef.current = false
        if (welcomeTimer.current !== null) {
          window.clearTimeout(welcomeTimer.current)
          welcomeTimer.current = null
        }
        if (parkTimer.current !== null) {
          window.clearTimeout(parkTimer.current)
          parkTimer.current = null
        }
        parth.classList.remove('is-welcoming', 'is-speaking')
        if (noteRef.current) noteRef.current.textContent = ''
        const trigger = triggerRef.current
        const rect = trigger?.getBoundingClientRect() ?? parth.getBoundingClientRect()
        let projectedRight = rect.right
        let projectedBottom = rect.bottom
        if (trigger && parth.style.transform) {
          try {
            const targetTransform = new DOMMatrixReadOnly(parth.style.transform)
            projectedRight = targetTransform.m41 + trigger.offsetLeft + trigger.offsetWidth
            projectedBottom = targetTransform.m42 + trigger.offsetTop + trigger.offsetHeight
          } catch {
            // The rendered rect remains a safe fallback for unsupported transform parsing.
          }
        }
        const panelWidth = Math.min(304, window.innerWidth - 44)
        const panelHeight = Math.min(360, window.innerHeight - 44)
        parth.dataset.side = projectedRight + panelWidth > window.innerWidth - 18 ? 'left' : 'right'
        parth.dataset.vertical = projectedBottom + panelHeight > window.innerHeight - 18 ? 'above' : 'below'
      }
    }
    conversationOpenRef.current = open
    setConversationOpen(open)
    if (open) {
      if (tourActiveRef.current) {
        tourPausedRef.current = true
        setTourPaused(true)
      }
      window.requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  const finishTour = (message?: string) => {
    if (tourAdvanceTimer.current !== null) {
      window.clearTimeout(tourAdvanceTimer.current)
      tourAdvanceTimer.current = null
    }
    tourActiveRef.current = false
    tourPausedRef.current = false
    tourStepsRef.current = []
    setTourActive(false)
    setTourPaused(false)
    setTourTotal(0)
    tourFinishRef.current(message)
  }

  useEffect(() => {
    // Opening the separate chat must stop the cursor tour from scrolling the page.
    const onChatOpen = () => {
      finishTour()
      for (const timer of [tourStartTimer, welcomeTimer, parkTimer]) {
        if (timer.current !== null) window.clearTimeout(timer.current)
        timer.current = null
      }
      welcomeActiveRef.current = false
      parthRef.current?.classList.remove('is-welcoming', 'is-speaking', 'is-nearby')
    }
    window.addEventListener('portfolio-chat:open', onChatOpen)
    return () => window.removeEventListener('portfolio-chat:open', onChatOpen)
  }, [])

  const goToTourStep = (index: number) => {
    if (!tourActiveRef.current) return
    if (tourAdvanceTimer.current !== null) {
      window.clearTimeout(tourAdvanceTimer.current)
      tourAdvanceTimer.current = null
    }
    tourPausedRef.current = false
    setTourPaused(false)
    tourGoRef.current(index)
  }

  const startTour = () => {
    if (tourStartTimer.current !== null) window.clearTimeout(tourStartTimer.current)
    const fullCaseStudyButton = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.cs-quick-summary-toggle-btn'),
    ).find(button => ['Full story', 'Full case study'].includes(button.textContent?.trim() ?? '')
      && button.getAttribute('aria-pressed') !== 'true')

    const beginTour = (attempt = 0) => {
      const waitingForExpansion = fullCaseStudyButton
        && fullCaseStudyButton.getAttribute('aria-pressed') !== 'true'
      if (waitingForExpansion && attempt < 8) {
        tourStartTimer.current = window.setTimeout(() => beginTour(attempt + 1), 100 + attempt * 25)
        return
      }

      tourStartTimer.current = null
      const resolved = resolveSteps(normalizedPathname)
      steps.current = resolved
      const available = tourStepsFrom(resolved)
      if (available.length === 0) {
        setReply('No clean tour here yet. Ask me where to start.')
        setConversation(true)
        return
      }

      tourStepsRef.current = available
      tourActiveRef.current = true
      tourPausedRef.current = false
      tourIndexRef.current = 0
      setTourActive(true)
      setTourPaused(false)
      setTourIndex(0)
      setTourTotal(available.length)
      setConversation(false)
      window.requestAnimationFrame(() => tourGoRef.current(0))
    }

    if (fullCaseStudyButton) {
      setConversation(false)
      fullCaseStudyButton.click()
      tourStartTimer.current = window.setTimeout(() => beginTour(), 80)
      return
    }

    beginTour(8)
  }

  const askParth = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed || asking) return

    setQuestion('')
    setReply('')
    setAsking(true)
    setThinkingLine(getCursorThinkingLine(trimmed, normalizedPathname))
    const requestId = ++requestIdRef.current

    try {
      const { createChatHistory, sendMessage } = await import('../services/agentAI')
      if (requestId !== requestIdRef.current) return
      const history = historyRef.current ?? createChatHistory(normalizedPathname)
      history.route = normalizedPathname
      historyRef.current = history
      const currentTourStep = tourStepsRef.current[tourIndexRef.current]
      const answer = await sendMessage(
        contextualQuestion(normalizedPathname, trimmed),
        history,
        undefined,
        {
          surface: 'cursor',
          cursorContext: tourActiveRef.current && currentTourStep
            ? {
                section: currentTourStep.label,
                note: intelligentNote(normalizedPathname, currentTourStep),
                step: tourIndexRef.current + 1,
                total: tourStepsRef.current.length,
              }
            : undefined,
        },
      )
      if (requestId === requestIdRef.current) setReply(answer)
    } catch {
      if (requestId === requestIdRef.current) {
        setReply('I dropped the thread. Try that once more?')
      }
    } finally {
      if (requestId === requestIdRef.current) setAsking(false)
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void askParth(question)
  }

  useEffect(() => {
    historyRef.current = null
    requestIdRef.current += 1
    conversationOpenRef.current = false
    setConversationOpen(false)
    setQuestion('')
    setReply('')
    setAsking(false)
    tourActiveRef.current = false
    tourPausedRef.current = false
    tourStepsRef.current = []
    if (tourStartTimer.current !== null) {
      window.clearTimeout(tourStartTimer.current)
      tourStartTimer.current = null
    }
    setTourActive(false)
    setTourPaused(false)
    setTourIndex(0)
    setTourTotal(0)
    ambientCountRef.current = 0
    lastAmbientAtRef.current = 0
  }, [routeKey])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && conversationOpenRef.current) {
        setConversation(false)
        window.requestAnimationFrame(() => triggerRef.current?.focus())
      } else if (event.key === 'Escape' && tourActiveRef.current) {
        finishTour()
      } else if (tourActiveRef.current && !conversationOpenRef.current && event.key === 'ArrowRight') {
        event.preventDefault()
        if (tourIndexRef.current >= tourStepsRef.current.length - 1) {
          finishTour('Tour complete. Ask me where the risky decision was.')
        }
        else goToTourStep(tourIndexRef.current + 1)
      } else if (tourActiveRef.current && !conversationOpenRef.current && event.key === 'ArrowLeft') {
        event.preventDefault()
        goToTourStep(Math.max(0, tourIndexRef.current - 1))
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const advanceToNextSection = () => {
    if (tourActiveRef.current) {
      setConversation(false)
      if (tourIndexRef.current >= tourStepsRef.current.length - 1) {
        finishTour('Tour complete. Ask me where the risky decision was.')
      }
      else goToTourStep(tourIndexRef.current + 1)
      return
    }

    const parth = parthRef.current
    const available = steps.current
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => document.documentElement.contains(step.element))
    if (!parth || available.length === 0) return

    setConversation(false)

    const next = available.find(({ index }) => index > activeIndex.current) ?? available[0]
    if (actionTimer.current !== null) window.clearTimeout(actionTimer.current)
    parth.classList.add('is-thinking')
    actionTimer.current = window.setTimeout(() => {
      parth.classList.remove('is-thinking')
      parkedRef.current = false
      next.step.element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
      actionTimer.current = null
    }, 360)
  }

  useEffect(() => {
    const parth = parthRef.current
    const you = youRef.current
    if (!parth || !you) return

    steps.current = []
    activeIndex.current = -1
    spokenSteps.current.clear()
    if (statusRef.current) statusRef.current.textContent = ''
    parkedRef.current = false
    document.body.classList.add('collaborator-cursor-active')

    const setPosition = (element: HTMLElement, x: number, y: number, visible: boolean) => {
      element.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
      element.classList.toggle('is-visible', visible)
    }

    const setSpeaking = (speaking: boolean) => {
      parth.classList.toggle('is-speaking', speaking)
    }

    const clearTyping = () => {
      parth.classList.remove('is-typing')
      typingStep.current = null
      if (typeTimer.current !== null) {
        window.clearTimeout(typeTimer.current)
        typeTimer.current = null
      }
      if (tourAdvanceTimer.current !== null) {
        window.clearTimeout(tourAdvanceTimer.current)
        tourAdvanceTimer.current = null
      }
    }

    const clearParkTimer = () => {
      if (parkTimer.current !== null) {
        window.clearTimeout(parkTimer.current)
        parkTimer.current = null
      }
    }

    const clearTarget = () => {
      document.querySelectorAll('.is-parth-target').forEach(element => element.classList.remove('is-parth-target'))
    }

    const parkCursor = () => {
      if (conversationOpenRef.current || tourActiveRef.current) return
      welcomeActiveRef.current = false
      parkedRef.current = true
      clearParkTimer()
      clearTyping()
      clearTarget()
      setSpeaking(false)
      parth.classList.remove('is-thinking')
      parth.classList.remove('is-revealing')
      parth.classList.remove('is-welcoming')
      parth.classList.add('is-parked')
      if (noteRef.current) noteRef.current.textContent = ''
      if (labelRef.current) labelRef.current.textContent = 'parth'

      // Keep the idle collaborator in one calm, predictable place across the site.
      // It only leaves this resting position during an explicitly started tour.
      const x = 8
      const y = Math.max(124, window.innerHeight - 144)
      parth.dataset.side = 'right'
      parth.dataset.vertical = y > window.innerHeight - 285 ? 'above' : 'below'
      setPosition(parth, x, y, true)
      if (parthCoordinatesRef.current) parthCoordinatesRef.current.textContent = cursorCoordinates(x, y)
    }

    const updateProximity = (x: number, y: number) => {
      const trigger = triggerRef.current
      if (!trigger || conversationOpenRef.current || !parth.classList.contains('is-visible')) {
        parth.classList.remove('is-nearby')
        return
      }

      const rect = trigger.getBoundingClientRect()
      const distanceX = Math.max(rect.left - x, 0, x - rect.right)
      const distanceY = Math.max(rect.top - y, 0, y - rect.bottom)
      parth.classList.toggle('is-nearby', Math.hypot(distanceX, distanceY) <= 96)
    }

    const schedulePark = (delay = 4200) => {
      clearParkTimer()
      parkTimer.current = window.setTimeout(parkCursor, delay)
    }

    const typeNote = (message: string, stepIndex: number, force = false, tourSlide = false) => {
      const note = noteRef.current
      if (!note || !message || conversationOpenRef.current) return
      const now = Date.now()
      if (
        !force
        && (
          ambientCountRef.current >= 3
          || (lastAmbientAtRef.current > 0 && now - lastAmbientAtRef.current < 9_000)
        )
      ) {
        schedulePark(1800)
        return
      }
      clearTyping()
      note.textContent = ''
      if (statusRef.current) statusRef.current.textContent = message
      setSpeaking(true)

      if (tourSlide) {
        note.textContent = message
        spokenSteps.current.add(stepIndex)
        const scheduledTourIndex = tourIndexRef.current
        tourAdvanceTimer.current = window.setTimeout(() => {
          tourAdvanceTimer.current = null
          if (!tourActiveRef.current || tourPausedRef.current) return
          const currentIndex = tourIndexRef.current
          if (currentIndex !== scheduledTourIndex || !tourStepsRef.current[currentIndex]) return
          if (currentIndex >= tourStepsRef.current.length - 1) finishTour()
          else goToTourStep(currentIndex + 1)
        }, TOUR_SLIDE_HOLD_MS)
        return
      }

      parth.classList.add('is-typing')
      typingStep.current = stepIndex
      let index = 0

      const tick = () => {
        if (!noteRef.current) return
        index += 1
        noteRef.current.textContent = message.slice(0, index)
        if (index < message.length) {
          typeTimer.current = window.setTimeout(tick, 24)
        } else {
          parth.classList.remove('is-typing')
          typeTimer.current = null
          typingStep.current = null
          spokenSteps.current.add(stepIndex)
          ambientCountRef.current += 1
          lastAmbientAtRef.current = Date.now()
          schedulePark()
        }
      }

      typeTimer.current = window.setTimeout(tick, 80)
    }

    tourGoRef.current = requestedIndex => {
      const available = tourStepsRef.current.filter(step => document.documentElement.contains(step.element))
      if (!tourActiveRef.current) return
      if (available.length === 0) {
        finishTour('That section moved. I reset the tour.')
        return
      }

      tourStepsRef.current = available
      const nextIndex = clamp(requestedIndex, 0, available.length - 1)
      const next = available[nextIndex]
      tourIndexRef.current = nextIndex
      tourPausedRef.current = false
      programmaticScrollUntilRef.current = Date.now() + 1_400
      setTourIndex(nextIndex)
      setTourPaused(false)
      setTourTotal(available.length)
      activeIndex.current = -1
      parkedRef.current = false
      clearParkTimer()
      clearTyping()
      parth.classList.remove('is-parked')
      next.element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
      schedule()
    }

    tourFinishRef.current = message => {
      parth.classList.remove('is-touring')
      clearTyping()
      if (message) typeNote(message, -2, true)
      else {
        setSpeaking(false)
        if (noteRef.current) noteRef.current.textContent = ''
        schedulePark(800)
      }
    }

    const refreshSteps = () => {
      const suppressed = Boolean(document.querySelector('#main-content.not-found'))
      if (layerRef.current) layerRef.current.hidden = suppressed
      document.body.classList.toggle('collaborator-cursor-active', !suppressed)
      if (suppressed) {
        steps.current = []
        activeIndex.current = -1
        if (tourActiveRef.current) finishTour()
        return
      }

      const hadSteps = steps.current.length > 0
      const previousActiveLabel = steps.current[activeIndex.current]?.label
      const previousTourLabel = tourStepsRef.current[tourIndexRef.current]?.label
      const refreshedSteps = resolveSteps(normalizedPathname)
      steps.current = refreshedSteps
      if (tourActiveRef.current) {
        const refreshedTour = tourStepsFrom(refreshedSteps)
        if (refreshedTour.length === 0) {
          finishTour('This page changed under me. Tour reset.')
          return
        }

        const matchingIndex = previousTourLabel
          ? refreshedTour.findIndex(step => step.label === previousTourLabel)
          : -1
        const refreshedIndex = matchingIndex >= 0
          ? matchingIndex
          : clamp(tourIndexRef.current, 0, refreshedTour.length - 1)
        tourStepsRef.current = refreshedTour
        tourIndexRef.current = refreshedIndex
        setTourIndex(refreshedIndex)
        setTourTotal(refreshedTour.length)
        activeIndex.current = previousActiveLabel
          ? refreshedSteps.findIndex(step => step.label === previousActiveLabel)
          : -1
      }
      if (!hadSteps && steps.current.length > 0) {
        activeIndex.current = -1
        parkedRef.current = false
        parth.classList.remove('is-parked')
      } else if (activeIndex.current >= steps.current.length) {
        activeIndex.current = -1
      }
      paint()
    }

    const chooseStep = () => {
      let bestIndex = -1
      let bestScore = -Infinity

      steps.current.forEach((step, index) => {
        if (!document.documentElement.contains(step.element)) return
        const rect = step.element.getBoundingClientRect()
        if (rect.bottom < 72 || rect.top > window.innerHeight - 40) return
        const score = visibleScore(step.element)
        if (score > bestScore) {
          bestIndex = index
          bestScore = score
        }
      })

      return bestIndex
    }

    const positionParth = (step: ResolvedStep, index: number) => {
      if (parkedRef.current && index === activeIndex.current) return

      parkedRef.current = false
      parth.classList.remove('is-parked')
      const anchorRect = step.anchor.getBoundingClientRect()
      const elementRect = step.element.getBoundingClientRect()
      const viewportInset = 18
      const cursorWidth = Math.max(parth.offsetWidth, 190)
      const rightX = anchorRect.right + 4
      const leftX = anchorRect.left - cursorWidth + 26
      const rightFits = rightX + cursorWidth <= window.innerWidth - viewportInset
      let x = rightFits ? rightX : leftX
      let side = rightFits ? 'right' : 'left'
      const isProjectHeroStep = step.label === 'what shipped'

      if (isProjectHeroStep) {
        x = window.innerWidth - cursorWidth - 34
        side = 'left'
      } else if (x < viewportInset) {
        x = elementRect.right - cursorWidth + 26
        side = 'inside'
      }

      x = clamp(x, viewportInset, Math.max(viewportInset, window.innerWidth - cursorWidth - viewportInset))
      const y = isProjectHeroStep
        ? clamp(elementRect.top + Math.min(210, elementRect.height * 0.42), 96, window.innerHeight - 104)
        : clamp(anchorRect.bottom - 10, 96, window.innerHeight - 104)
      setPosition(parth, x, y, true)
      parth.dataset.side = side
      parth.dataset.vertical = y > window.innerHeight - 285 ? 'above' : 'below'
      if (parthCoordinatesRef.current) parthCoordinatesRef.current.textContent = cursorCoordinates(x, y)

      if (index !== activeIndex.current) {
        activeIndex.current = index
        clearTarget()
        step.anchor.classList.add('is-parth-target')
        parth.classList.remove('is-thinking')
        if (labelRef.current) labelRef.current.textContent = 'parth'
        const message = intelligentNote(normalizedPathname, step)
        if (noteRef.current) noteRef.current.textContent = ''
        schedule()
        setSpeaking(false)
        clearTyping()
        if (settleTimer.current !== null) window.clearTimeout(settleTimer.current)
        if (thinkingTimer.current !== null) window.clearTimeout(thinkingTimer.current)
        const ambientDelay = ambientCountRef.current === 0 ? 700 : 320
        thinkingTimer.current = window.setTimeout(() => {
          thinkingTimer.current = null
          schedule()
          const isCurrentTourStop = tourActiveRef.current
            && !tourPausedRef.current
            && tourStepsRef.current[tourIndexRef.current] === step
          if (isCurrentTourStop) typeNote(message, index, true, true)
          else if (!step.quiet && !spokenSteps.current.has(index)) typeNote(message, index)
          else schedulePark(2600)
        }, tourActiveRef.current ? 220 : ambientDelay)
      }
    }

    const showReveal = (element: HTMLElement, message: string) => {
      if (conversationOpenRef.current || tourActiveRef.current || !document.documentElement.contains(element)) return
      welcomeActiveRef.current = false
      revealTargetRef.current = element
      parkedRef.current = false
      clearParkTimer()
      clearTyping()
      clearTarget()
      parth.classList.remove('is-parked', 'is-thinking', 'is-welcoming')
      parth.classList.add('is-revealing')
      element.classList.add('is-parth-target')
      if (labelRef.current) labelRef.current.textContent = 'parth'
      if (noteRef.current) noteRef.current.textContent = message
      if (statusRef.current) statusRef.current.textContent = message
      setSpeaking(true)

      const rect = element.getBoundingClientRect()
      const x = clamp(rect.left + 12, 18, Math.max(18, window.innerWidth - 310))
      const y = clamp(rect.top + rect.height * 0.55, 96, window.innerHeight - 132)
      parth.dataset.side = 'right'
      parth.dataset.vertical = y > window.innerHeight - 285 ? 'above' : 'below'
      setPosition(parth, x, y, true)
      if (parthCoordinatesRef.current) parthCoordinatesRef.current.textContent = cursorCoordinates(x, y)
    }

    const hideReveal = (element?: HTMLElement) => {
      if (element && revealTargetRef.current !== element) return
      revealTargetRef.current = null
      clearTarget()
      setSpeaking(false)
      parth.classList.remove('is-revealing')
      if (noteRef.current) noteRef.current.textContent = ''
      parkCursor()
    }

    const cancelWelcome = () => {
      WELCOMED_ROUTES.add(routeKey)
      if (welcomeTimer.current !== null) {
        window.clearTimeout(welcomeTimer.current)
        welcomeTimer.current = null
      }
    }

    const dismissWelcome = () => {
      const wasWelcoming = welcomeActiveRef.current
      cancelWelcome()
      if (!wasWelcoming) return

      welcomeActiveRef.current = false
      parth.classList.remove('is-welcoming', 'is-speaking')
      if (noteRef.current) noteRef.current.textContent = ''
      if (statusRef.current) statusRef.current.textContent = ''
      parkCursor()
    }

    const showWelcome = () => {
      welcomeTimer.current = null
      if (
        WELCOMED_ROUTES.has(routeKey)
        || document.hidden
        || conversationOpenRef.current
        || tourActiveRef.current
        || revealTargetRef.current
      ) return

      WELCOMED_ROUTES.add(routeKey)
      parkCursor()
      welcomeActiveRef.current = true
      parkedRef.current = false
      parth.classList.remove('is-parked')
      parth.classList.add('is-welcoming')
      const message = pageWelcome(normalizedPathname)
      if (noteRef.current) noteRef.current.textContent = message
      if (statusRef.current) statusRef.current.textContent = message
      setSpeaking(true)
      schedulePark(WELCOME_HOLD_MS)
    }

    const paint = () => {
      frame.current = null
      if (!conversationOpenRef.current) {
        if (revealTargetRef.current || welcomeActiveRef.current) {
          // A short welcome or explicit hidden-message interaction owns Parth until it ends.
        } else if (tourActiveRef.current) {
          const selectedTourStep = tourStepsRef.current[tourIndexRef.current]
          const index = selectedTourStep ? steps.current.indexOf(selectedTourStep) : chooseStep()
          const step = selectedTourStep || (index >= 0 ? steps.current[index] : null)

          if (step) positionParth(step, index)
          else parkCursor()
        } else {
          parkCursor()
        }
      }

      // Keep the glyph tip under the real pointer; only the label avoids edges.
      const youX = pointer.current.x - YOU_CURSOR_TIP_OFFSET.x
      const youY = pointer.current.y - YOU_CURSOR_TIP_OFFSET.y
      const identityWidth = you.querySelector<HTMLElement>('.reading-cursor__identity')?.offsetWidth ?? 84
      you.dataset.labelAlign = pointer.current.x + identityWidth + 36 > window.innerWidth ? 'left' : 'right'
      const hoveredRect = hoveredLabelTarget.current?.getBoundingClientRect()
      const shouldLiftLabel = pointer.current.y > window.innerHeight - 48 || parth.classList.contains('is-nearby') || Boolean(
        hoveredRect &&
          hoveredRect.width > 0 &&
          hoveredRect.height > 0 &&
          pointer.current.x >= hoveredRect.left - 12 &&
          pointer.current.x <= hoveredRect.right + 12 &&
          pointer.current.y >= hoveredRect.top - 12 &&
          pointer.current.y <= hoveredRect.bottom + 12 &&
          hoveredRect.top > 56,
      )
      you.dataset.labelSide = shouldLiftLabel ? 'above' : 'below'
      setPosition(you, youX, youY, pointer.current.seen)
      if (youCoordinatesRef.current) {
        youCoordinatesRef.current.textContent = cursorCoordinates(pointer.current.x, pointer.current.y)
      }
    }

    function schedule() {
      if (frame.current === null) frame.current = window.requestAnimationFrame(paint)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY, seen: true }
      updateProximity(event.clientX, event.clientY)
      const hoverElement = document.elementFromPoint(event.clientX, event.clientY)
      hoveredLabelTarget.current = hoverElement instanceof HTMLElement
        ? hoverElement.closest<HTMLElement>(LABEL_AVOID_SELECTOR)
        : null
      schedule()
    }

    const onScroll = () => {
      if (welcomeTimer.current !== null || welcomeActiveRef.current) dismissWelcome()
      if (conversationOpenRef.current) {
        schedule()
        return
      }
      if (!tourActiveRef.current) {
        if (revealTargetRef.current) hideReveal()
        // Idle Parth is viewport-fixed; scrolling should not wake or reposition him.
        if (!parkedRef.current) parkCursor()
        return
      }
      if (tourActiveRef.current && Date.now() > programmaticScrollUntilRef.current) {
        tourPausedRef.current = true
        setTourPaused(true)
        if (tourAdvanceTimer.current !== null) {
          window.clearTimeout(tourAdvanceTimer.current)
          tourAdvanceTimer.current = null
        }
      }
      parkedRef.current = false
      clearParkTimer()
      if (thinkingTimer.current !== null) {
        window.clearTimeout(thinkingTimer.current)
        thinkingTimer.current = null
      }
      parth.classList.remove('is-parked')
      paint()
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current)
      settleTimer.current = window.setTimeout(() => {
        settleTimer.current = null
        if (tourActiveRef.current && !tourPausedRef.current) {
          const tourStep = tourStepsRef.current[tourIndexRef.current]
          const tourStepIndex = tourStep ? steps.current.indexOf(tourStep) : -1
          if (tourStep && tourStepIndex >= 0) {
            typeNote(intelligentNote(normalizedPathname, tourStep), tourStepIndex, true, true)
          }
          return
        }
        const index = activeIndex.current
        const step = steps.current[index]
        if (step && !step.quiet && !spokenSteps.current.has(index) && typingStep.current !== index) {
          typeNote(intelligentNote(normalizedPathname, step), index)
        } else if (!step || step.quiet || spokenSteps.current.has(index)) {
          schedulePark(1800)
        }
      }, 480)
    }

    const onVisibilityChange = () => {
      parth.classList.toggle('is-page-hidden', document.hidden)
      if (document.hidden && (welcomeTimer.current !== null || welcomeActiveRef.current)) dismissWelcome()
    }

    const onDirectUserIntent = () => {
      if (welcomeTimer.current !== null || welcomeActiveRef.current) dismissWelcome()
    }

    const onParthReveal = (event: Event) => {
      const detail = (event as CustomEvent<ParthRevealDetail>).detail
      if (detail?.element && detail.message) showReveal(detail.element, detail.message)
    }

    const onParthRevealEnd = (event: Event) => {
      const detail = (event as CustomEvent<Pick<ParthRevealDetail, 'element'>>).detail
      hideReveal(detail?.element)
    }

    const routeObserver = new MutationObserver(mutations => {
      const hasPageMutation = mutations.some(mutation => !layerRef.current?.contains(mutation.target))
      if (!hasPageMutation || (!tourActiveRef.current && steps.current.length > 0)) return
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current)
      refreshTimer.current = window.setTimeout(refreshSteps, 120)
    })
    routeObserver.observe(document.body, { childList: true, subtree: true })

    refreshSteps()
    refreshTimer.current = window.setTimeout(refreshSteps, 900)
    welcomeTimer.current = window.setTimeout(showWelcome, WELCOME_DELAY_MS)
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerdown', onDirectUserIntent, { passive: true })
    document.addEventListener('keydown', onDirectUserIntent)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('parth-cursor:reveal', onParthReveal)
    window.addEventListener('parth-cursor:reveal-end', onParthRevealEnd)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', refreshSteps)

    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerdown', onDirectUserIntent)
      document.removeEventListener('keydown', onDirectUserIntent)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('parth-cursor:reveal', onParthReveal)
      window.removeEventListener('parth-cursor:reveal-end', onParthRevealEnd)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', refreshSteps)
      routeObserver.disconnect()
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current)
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current)
      if (thinkingTimer.current !== null) window.clearTimeout(thinkingTimer.current)
      if (actionTimer.current !== null) window.clearTimeout(actionTimer.current)
      if (tourStartTimer.current !== null) window.clearTimeout(tourStartTimer.current)
      if (tourAdvanceTimer.current !== null) window.clearTimeout(tourAdvanceTimer.current)
      if (welcomeTimer.current !== null) window.clearTimeout(welcomeTimer.current)
      tourGoRef.current = () => {}
      tourFinishRef.current = () => {}
      clearParkTimer()
      clearTyping()
      clearTarget()
      revealTargetRef.current = null
      welcomeActiveRef.current = false
      document.body.classList.remove('collaborator-cursor-active')
    }
  }, [routeKey])

  const currentTourStep = tourStepsRef.current[tourIndex]

  return (
    <div ref={layerRef} className={`reading-cursor-layer${conversationOpen ? ' is-conversing' : ''}`}>
      <div
        ref={parthRef}
        className={`reading-cursor reading-cursor--parth${conversationOpen ? ' is-conversing' : ''}${tourActive ? ' is-touring' : ''}`}
      >
        <button
          ref={triggerRef}
          type="button"
          className="reading-cursor__trigger"
          aria-label={conversationOpen ? 'Close Ask Parth' : 'Ask Parth about this work'}
          aria-expanded={conversationOpen}
          onClick={() => setConversation(!conversationOpen)}
        >
          <PointerCursorGlyph className="reading-cursor__glyph" />
          <span className="reading-cursor__identity">
            <span ref={labelRef} className="reading-cursor__tag">parth</span>
            <span ref={parthCoordinatesRef} className="reading-cursor__coordinates">00,00</span>
          </span>
        </button>
        <div className="reading-cursor__invite" aria-hidden="true">
          Click to ask Parth
        </div>
        <div ref={noteRef} className="reading-cursor__note" aria-hidden="true" />
        {tourActive && (
          <div className="reading-cursor__tour" aria-label="Portfolio tour controls">
            <button
              type="button"
              onClick={() => goToTourStep(Math.max(0, tourIndex - 1))}
              disabled={tourIndex === 0}
              aria-label="Previous tour stop"
              title="Previous"
            >&#8592;</button>
            <span title={tourPaused ? 'Tour paused. Use an arrow to continue.' : currentTourStep?.label}>
              {tourIndex + 1}/{tourTotal}
            </span>
            <button
              type="button"
              onClick={() => {
                if (tourIndex >= tourTotal - 1) {
                  finishTour('Tour complete. Ask me where the risky decision was.')
                }
                else goToTourStep(tourIndex + 1)
              }}
              aria-label={tourIndex >= tourTotal - 1 ? 'Finish tour' : 'Next tour stop'}
              title={tourIndex >= tourTotal - 1 ? 'Finish' : 'Next'}
            >{tourIndex >= tourTotal - 1 ? '\u2713' : '\u2192'}</button>
            <button type="button" onClick={() => finishTour()} aria-label="Exit tour" title="Exit">&#215;</button>
          </div>
        )}
        <span ref={statusRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
        {conversationOpen && (
          <div className="reading-cursor__conversation surface-glass surface-glass--strong" role="dialog" aria-label="Ask Parth about the portfolio">
            <div className="reading-cursor__conversation-head">
              <span>{tourActive && currentTourStep ? `Ask about: ${currentTourStep.label}` : 'Ask me about this work'}</span>
              <div className="reading-cursor__conversation-actions">
                <button type="button" onClick={advanceToNextSection} aria-label="Go to the next section" title="Next section">&#8595;</button>
                <button type="button" onClick={() => setConversation(false)} aria-label="Close Ask Parth" title="Close">&#215;</button>
              </div>
            </div>
            {(asking || reply) && (
              <div className={`reading-cursor__reply${asking ? ' is-thinking' : ''}`} role="status" aria-live="polite">
                {asking ? thinkingLine : reply}
              </div>
            )}
            {!asking && !reply && (
              <div className="reading-cursor__prompts" aria-label="Suggested questions">
                {conversationPrompts(normalizedPathname).map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      if (prompt === tourPrompt(normalizedPathname)) startTour()
                      else void askParth(prompt)
                    }}
                  >{prompt}</button>
                ))}
              </div>
            )}
            <form className="reading-cursor__form" onSubmit={onSubmit}>
              <input
                ref={inputRef}
                value={question}
                onChange={event => setQuestion(event.target.value)}
                maxLength={500}
                placeholder={reply ? 'Ask a follow-up' : 'Ask one good question'}
                aria-label="Question for Parth"
                disabled={asking}
              />
              <button type="submit" disabled={asking || !question.trim()} aria-label="Send question">Send</button>
            </form>
          </div>
        )}
      </div>
      <div ref={youRef} className="reading-cursor reading-cursor--you" aria-hidden="true">
        <PointerCursorGlyph className="reading-cursor__glyph" />
        <div className="reading-cursor__identity">
          <span className="reading-cursor__tag">you</span>
          <span ref={youCoordinatesRef} className="reading-cursor__coordinates">00,00</span>
        </div>
      </div>
    </div>
  )
}
