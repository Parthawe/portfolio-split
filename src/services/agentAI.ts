import { projectChatEvidence, verifiedProjectAnswer } from '../data/projectChatEvidence'
import { chatProjectSlug } from '../utils/chatProjectPath'
import { categories } from '../data/categories'
import { PORTFOLIO_SCOPE_REPLY, isPortfolioQuestion } from '../data/portfolioKnowledgeBase'
import { CATEGORY_LABELS, visibleProjects as projects, type Project, type ProjectCategory } from '../data/projects'
import {
  createContext,
  getDynamicChips,
  getProjectNarrative,
  getResponse,
  getRouteGreeting,
  type ChatContext,
} from '../data/agentKnowledge'
import { normalizeCopy, normalizeCopyList } from '../utils/normalizeCopy'
import { getEdgeAIAnswer, getEdgeAIModel, isEdgeAIEnabled } from './edgeAI'
import { updatePersonaFromMessage } from './personaInference'
import {
  CURSOR_IDENTITY_REPLY,
  CURSOR_SCOPE_REPLY,
  isCursorAnswerUsable,
  isCursorIdentityQuestion,
  shapeCursorAnswer,
} from './parthCursorVoice'

export interface ChatHistory {
  route: string
  ctx: ChatContext
  turns: Array<{ question: string; answer: string }>
}

export interface TourStep {
  text: string
  scrollTo?: string
  delay: number
}

export interface ResponseAction {
  type: 'scroll' | 'navigate' | 'filter' | 'none'
  slug?: string
  path?: string
  routePath?: string
  label?: string
  image?: string
  element?: HTMLElement | null
  filterKey?: 'all' | ProjectCategory
  selectors?: string[]
  explanation?: string
}

type WorkViewMode = 'editorial' | 'library' | 'timeline'

const WORK_VIEW_CONFIG: Record<WorkViewMode, {
  aliases: string[]
  path: string
  label: string
  selectors: string[]
  explanation: string
}> = {
  editorial: {
    aliases: ['editorial', 'default view', 'default mode', 'grid view', 'main work view'],
    path: '/work',
    label: 'Editorial view',
    selectors: ['.work-group--selected', '.pcard-masonry', '.work-bottom-nav'],
    explanation: 'Editorial is the reading-first mode. It starts with flagship work, then selected work, then the deeper archive.',
  },
  library: {
    aliases: ['index', 'index view', 'library', 'library view', 'compact list', 'list view'],
    path: '/work?view=library',
    label: 'Index view',
    selectors: ['.work-library-shell', '.work-library-nav', '.work-library-shelves'],
    explanation: 'Index is the compact browse mode. It groups the work by discipline and makes the archive easier to scan without the large preview stage.',
  },
  timeline: {
    aliases: ['arc', 'arc view', 'timeline', 'timeline view', 'trajectory', 'career arc'],
    path: '/work?view=timeline',
    label: 'Arc view',
    selectors: ['.work-timeline-shell', '.work-timeline-rail', '.work-timeline-main'],
    explanation: 'Arc is the progression view. It shows one anchor project per period, then the supporting work around it.',
  },
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  ai: ['ai', 'ai wearables', 'ai and wearables', 'machine learning'],
  'ux-design': ['ux', 'ux design', 'product design'],
  'ux-research': ['ux research', 'user research', 'design research', 'research case studies'],
  'creative-tech': ['creative tech', 'creative technology', 'creative'],
  installations: ['installations', 'installation', 'physical work'],
  'brand-visual': ['brand', 'brand visual', 'visual design'],
  fintech: ['fintech', 'payments', 'crypto payments', 'web3'],
  crypto: ['crypto', 'web3', 'blockchain'],
  'ai-wearables': ['wearables', 'ai wearables', 'smart glasses'],
  'design-for-good': ['design for good', 'good', 'civic', 'community'],
}

const PROJECT_ALIASES: Record<string, string[]> = {
  mentra: ['mentra', 'mentra glasses', 'smart glasses os', 'mentra website', 'mentra site', 'mentraglass', 'mentraglass.com'],
  'transfi-project': ['transfi', 'trans fi', 'transfy'],
  zentipay: ['zentipay', 'zenti pay', 'zenti', 'zenith pay'],
  'clawed-chat': ['clawed', 'clawed chat', 'clawd'],
  executivelens: ['executivelens', 'executive lens'],
  'raahi-project': ['raahi', 'pune transit'],
  'ballah-code': ['ballah', 'ballah code'],
  'oncall-lens': ['oncall', 'oncall lens', 'on-call lens'],
  jugalbandi: ['jugalbandi'],
  enigma: ['enigma'],
  tedx: ['tedx', 'tedxvitpune'],
  breakgen: ['breakgen', 'break gen', 'ai keyboard platform'],
  'keyboard-project': ['keyboard project', 'keydata keyboard', 'physical keyboard study'],  // removed bare "keyboard" — too generic
  'ai-voice': ['ai voice', 'voice ai'],
  cuetv: ['cuetv', 'cue tv'],
  'org-dashboard': ['org dashboard', 'organization dashboard'],
  'black-hole': ['black hole', 'black holes'],
  'the-omakase': ['omakase', 'sushi game', 'arcade cabinet'],
  typeface: ['butlers slice', 'butler slice', 'typeface'],
  'making-of-time': ['making of time'],
  'sea-of-salt': ['sea of salt', 'why the sea is salt', 'salt mill'],
  'uv-light': ['uv light', 'blacklight'],
  'revolving-stage': ['revolving stage', 'rotating stage'],
  'the-point-cdc': ['point cdc', 'the point'],
  'office-of-diversity': ['office of diversity', 'idbea'],
  sculpture: ['sculpture', 'firodia'],
  'code-for-build': ['code for build'],
  'vj-software': ['vj software'],
  shuffle: ['shuffle'],
  drowning: ['drowning'],
  'moniac-machine': ['moniac', 'moniac machine'],
  healthapp: ['health app', 'google tasks'],
  'mentra-brand': ['mentra brand', 'mentra packaging'],
  'mentra-miniapps': ['miniapps', 'mini apps', 'mentra os'],
  'flow-fields': ['flow fields', 'generative art'],
  'dna-speculative': ['dna', 'speculative design', 'immortality'],
  ibm: ['ibm', 'cancer prognosis'],
  atps: ['atps'],
  vishwaconclave: ['vishwa', 'conclave'],
}

const STARTER_CHIPS: Record<string, string[]> = {
  '/': ['Tour this page', 'Open Mentra', 'Start with flagship work', 'Best research process'],
  '/work': ['Index view', 'Arc view', 'Start with flagship work', 'Best research process'],
  '/about': ['Tour this page', 'Role fit', 'Tell me about Mentra', 'Contact'],
  '/playbook': ['Tour this page', 'Design philosophy', 'Best research process', 'About Parth'],
}

interface FocusTopic {
  patterns: RegExp[]
  selectors: string[]
  label: string
  explanation: string
}

const WORK_FILTER_ALIASES: Record<'all' | ProjectCategory, string[]> = {
  all: ['all', 'all work', 'all projects', 'everything', 'full archive'],
  ux: ['ux', 'ux design', 'product design', 'ux work'],
  research: ['ux research', 'user research', 'research work', 'design research'],
  ai: ['ai', 'ai work', 'wearables', 'ai wearables', 'smart glasses'],
  creative: ['creative', 'creative tech', 'creative technology', 'creative work'],
  install: ['installations', 'installation', 'physical work', 'sculpture', 'physical computing'],
  brand: ['brand', 'visual', 'brand visual', 'visual design', 'branding'],
  good: ['design for good', 'good', 'social impact', 'civic', 'community'],
}

const GENERIC_PROJECT_FOCUS: FocusTopic[] = [
  {
    patterns: [/\b(challenge|problem|constraint|background|context)\b/i],
    selectors: ['#cs-problem', '#cs-hook', '#cs-context', '#cs-background', '#cs-bet', '#cs-challenge', '#cs-challenges'],
    label: 'Challenge',
    explanation: 'This section frames the real constraint behind the work. Start here before looking at polished screens.',
  },
  {
    patterns: [/\b(process|approach|research|system|how did|how was|design decisions|solution)\b/i],
    selectors: ['#cs-research', '#cs-process', '#cs-decisions', '#cs-system', '#cs-design', '#cs-product', '#cs-architecture'],
    label: 'Process',
    explanation: 'This is where the thinking becomes visible. The process section is usually where the senior-level decisions show up.',
  },
  {
    patterns: [/\b(results|result|impact|outcome|metrics|numbers|launched|launch)\b/i],
    selectors: ['#cs-results', '#cs-impact', '#cs-learnings', '#cs-reflections'],
    label: 'Impact',
    explanation: 'This section shows whether the work actually moved something, metrics, adoption, or the learning that carried forward.',
  },
  {
    patterns: [/\b(team|role|timeline|duration|who worked|who built)\b/i],
    selectors: ['#cs-vision', '#cs-timeline', '.project-header', '.project-overview'],
    label: 'Role and Timeline',
    explanation: 'This is the best place to read what Parth owned, who else was involved, and how the work unfolded over time.',
  },
]

const PROJECT_SPECIFIC_FOCUS: Record<string, FocusTopic[]> = {
  mentra: [
    {
      patterns: [/\b(app store|miniapp|store|developer|sdk|ecosystem)\b/i],
      selectors: ['#cs-store'],
      label: 'MiniApp Store',
      explanation: 'This is the app store and ecosystem layer. It is the section that turns Mentra from a device into a platform.',
    },
    {
      patterns: [/\b(os|operating system|hud|notification|notifications|voice first)\b/i],
      selectors: ['#cs-os'],
      label: 'MentraOS',
      explanation: 'This is the MentraOS section. It covers the glance-first HUD, the voice-first model, and the notification system designed for the real world.',
    },
    {
      patterns: [/\b(companion app|pairing|onboarding|phone app)\b/i],
      selectors: ['#cs-companion'],
      label: 'Companion App',
      explanation: 'This section shows how the phone app carries the heavy setup and configuration work so the glasses stay lightweight and glanceable.',
    },
    {
      patterns: [/\b(website|site|marketing site|launch site|mentraglass|commerce|buying flow|field teams)\b/i],
      selectors: ['#cs-website'],
      label: 'Live Site',
      explanation: 'This is the merged website section. It shows how the public site turns Mentra from category education into buyer and developer confidence.',
    },
  ],
  zentipay: [
    {
      patterns: [/\b(fee|fees|fee anxiety|estimator|transparency|pricing)\b/i],
      selectors: ['#cs-research', '#cs-decisions', '#cs-results'],
      label: 'Fee Transparency',
      explanation: 'This is the fee-transparency thread. It shows how the research insight about trust turned into the core product decision.',
    },
    {
      patterns: [/\b(onboarding|adaptive onboarding|signup|kyc)\b/i],
      selectors: ['#cs-decisions', '#cs-system'],
      label: 'Onboarding System',
      explanation: 'This section covers the onboarding redesign and the system work that made the product adapt across countries and user needs.',
    },
  ],
  'transfi-project': [
    {
      patterns: [/\b(compliance|kyc|jurisdiction|regulation|regulated|markets)\b/i],
      selectors: ['#cs-research', '#cs-process', '#cs-product'],
      label: 'Compliance and Product Flow',
      explanation: 'This is the compliance and product-flow layer. It shows how a regulated crypto product was made usable without flattening market differences.',
    },
    {
      patterns: [/\b(onboarding|merchant onboarding|enterprise onboarding|go to market|gtm)\b/i],
      selectors: ['#cs-screens', '#cs-gtm', '#cs-results'],
      label: 'Onboarding and Go To Market',
      explanation: 'This section shows how the enterprise onboarding flow and the go to market work were treated as one conversion problem.',
    },
  ],
  'clawed-chat': [
    {
      patterns: [/\b(receipt|receipts|ledger|audit trail|accountability)\b/i],
      selectors: ['#cs-safety'],
      label: 'Receipt Ledger',
      explanation: 'This is the safety architecture section. It explains why receipts are the trust mechanism, not just a logging feature.',
    },
    {
      patterns: [/\b(trust|safety|approval|approve|autonomy|assisted|draft first|read only)\b/i],
      selectors: ['#cs-safety', '#cs-context'],
      label: 'Safety Modes',
      explanation: 'This section shows the three-tier trust model. The product is built around progressive autonomy rather than blind execution.',
    },
    {
      patterns: [/\b(glasses|glasses experience|web hub|dashboard|inbox)\b/i],
      selectors: ['#cs-webhub', '#cs-glasses'],
      label: 'Web Hub and Glasses',
      explanation: 'These sections show how the same assistant shifts between a full web hub and a glanceable glasses interface without feeling like two products.',
    },
  ],
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function getProjectSearchTerms(project: Project): string[] {
  const aliasTerms = PROJECT_ALIASES[project.slug] || []
  return [
    project.slug,
    project.name,
    project.tag,
    ...aliasTerms,
  ].map(normalize)
}

function findProject(query: string): Project | undefined {
  const q = normalize(query)
  if (!q) return undefined

  // Exact match first (highest confidence)
  for (const project of projects) {
    const terms = getProjectSearchTerms(project)
    if (terms.some(term => term === q)) return project
  }

  // Containment match — but require the matching term to be 4+ chars to avoid
  // false positives on short words like "it", "the", "art", "a"
  for (const project of projects) {
    const terms = getProjectSearchTerms(project)
    if (terms.some(term => term.length >= 4 && (q.includes(term) || term.includes(q)))) return project
  }

  return undefined
}

function findCategory(query: string): (typeof categories)[number] | undefined {
  const q = normalize(query)
  if (!q) return undefined

  return categories.find(category => {
    const terms = [category.slug, `${category.title} ${category.titleAccent}`, ...(CATEGORY_ALIASES[category.slug] || [])]
      .map(normalize)
    return terms.some(term => term === q || (term.length >= 4 && (q.includes(term) || term.includes(q))))
  })
}

function findWorkFilter(query: string): { key: 'all' | ProjectCategory; label: string } | undefined {
  const q = normalize(query)
  if (!q) return undefined

  for (const [key, aliases] of Object.entries(WORK_FILTER_ALIASES) as Array<['all' | ProjectCategory, string[]]>) {
    if (!aliases.some(alias => {
      const term = normalize(alias)
      return term === q || (term.length >= 4 && q.includes(term))
    })) continue

    return {
      key,
      label: key === 'all' ? 'All Projects' : CATEGORY_LABELS[key],
    }
  }

  return undefined
}

function getCardElement(slug: string): HTMLElement | null {
  const link = document.querySelector(`a[href="/${slug}"]`) as HTMLElement | null
  return (link?.closest('.pcard') as HTMLElement | null) || link
}

function getSectionElement(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const el = document.querySelector(selector) as HTMLElement | null
    if (el) return el
  }
  return null
}

function getExplainedSectionAction(label: string, selectors: string[], explanation: string): ResponseAction {
  const element = getSectionElement(selectors)
  return { type: 'scroll', label, element, selectors, explanation }
}

function getCurrentWorkViewMode(): WorkViewMode {
  if (typeof window !== 'undefined') {
    const view = new URLSearchParams(window.location.search).get('view')
    if (view === 'playlist' || view === 'library') return 'library'
    if (view === 'timeline') return view
  }

  if (typeof document !== 'undefined') {
    if (document.querySelector('.work-library-shell')) return 'library'
    if (document.querySelector('.work-timeline-shell')) return 'timeline'
  }

  return 'editorial'
}

function findWorkView(query: string): WorkViewMode | undefined {
  const q = normalize(query)
  if (!q) return undefined

  return (Object.entries(WORK_VIEW_CONFIG) as Array<[WorkViewMode, (typeof WORK_VIEW_CONFIG)[WorkViewMode]]>)
    .find(([, config]) => config.aliases.some(alias => {
      const term = normalize(alias)
      return term === q || (term.length >= 4 && q.includes(term))
    }))?.[0]
}

function syncRoute(history: ChatHistory) {
  if (history.ctx.route !== history.route) {
    history.ctx.route = history.route
  }
}

function getAccessMode(project: Project) {
  if (project.access?.mode) return project.access.mode
  return project.nda ? 'request' : 'public'
}

const DEFAULT_CONTEXT_PROJECTS = ['mentra', 'zentipay', 'clawed-chat', 'executivelens', 'jugalbandi']
const EDGE_CATEGORY_ALIASES: Record<string, string> = {
  ux: 'ux-design',
  ui: 'ux-design',
  'design-engineer': 'design-engineering',
  brand: 'brand-visual',
  healthcare: 'design-for-good',
}

function relevantProjectSlugs(ctx: ChatContext, message: string, localAnswer: string) {
  const routeSlug = chatProjectSlug(ctx.route) || ctx.route.replace(/^\//, '').split(/[?#]/)[0]
  const categorySlug = EDGE_CATEGORY_ALIASES[routeSlug] || routeSlug
  const currentCategory = categories.find(category => category.slug === categorySlug)
  const categorySlugs = currentCategory
    ? [
        currentCategory.featured.slug,
        ...currentCategory.moreProjects.flat(2).map(project => project.slug),
      ]
    : []
  const haystack = `${message} ${localAnswer}`.toLowerCase()
  const directlyRelevant = projects
    .filter(project => haystack.includes(project.slug.toLowerCase()) || haystack.includes(project.name.toLowerCase()))
    .map(project => project.slug)

  return Array.from(new Set([
    routeSlug,
    ctx.lastProject || '',
    ...ctx.mentionedProjects.slice(-6),
    ...directlyRelevant,
    ...categorySlugs,
    ...DEFAULT_CONTEXT_PROJECTS,
  ].filter(Boolean))).slice(0, 6)
}

function buildPublicEdgeContext(ctx: ChatContext, message: string, localAnswer: string) {
  const relevantSlugs = new Set(relevantProjectSlugs(ctx, message, localAnswer))
  return {
    instruction:
      'Answer as Parth Pawar portfolio guide. Use only this public context. Do not invent anecdotes, motivations, quotations, measurements or team responsibilities. Prefer supplied project summaries over stylistic inferences, and state when evidence is missing. The chat is already inside this portfolio: he, him and you refer to Parth unless the conversation names someone else. Answer role-fit questions with specific evidence rather than a blanket best-person claim or a canned scope refusal. Keep replies under 120 words unless the visitor explicitly requests detail. Finish all sentences; omit generic invitations and invented personal feelings. If the user asks for private NDA details, give the safe public glimpse and invite an access request.',
    visitor: {
      persona: ctx.persona,
      lastProject: ctx.lastProject,
      mentionedProjects: ctx.mentionedProjects.slice(-6),
      questionCount: ctx.questionCount,
    },
    categories: categories.map(category => ({
      slug: category.slug,
      title: `${category.title} ${category.titleAccent}`.trim(),
      description: category.description,
    })),
    projects: projects.filter(project => relevantSlugs.has(project.slug)).map(project => ({
      slug: project.slug,
      name: project.name,
      category: CATEGORY_LABELS[project.category],
      tag: project.tag,
      year: project.year,
      desc: project.desc,
      access: getAccessMode(project),
      summaryProblem: project.summaryProblem,
      summaryRole: project.summaryRole,
      summaryTeam: project.summaryTeam,
      summaryTimeline: project.summaryTimeline,
      summaryOutcome: project.summaryOutcome,
      storyline: project.storyline,
      evidence: projectChatEvidence[project.slug],
    })),
  }
}

function rememberTurn(history: ChatHistory, question: string, answer: string) {
  history.turns.push({
    question: question.slice(0, 500),
    answer: answer.slice(0, 2200),
  })
  history.turns = history.turns.slice(-6)
}

function getProjectFocus(project: Project, query: string): FocusTopic | undefined {
  const q = normalize(query)
  const specific = (PROJECT_SPECIFIC_FOCUS[project.slug] || []).find(topic =>
    topic.patterns.some(pattern => pattern.test(q))
  )

  if (specific) return specific

  return GENERIC_PROJECT_FOCUS.find(topic => topic.patterns.some(pattern => pattern.test(q)))
}

export function createChatHistory(route: string): ChatHistory {
  const ctx = createContext(route)
  ctx.lastProject = chatProjectSlug(route)
  return { route, ctx, turns: [] }
}

function panelOverview(history: ChatHistory, question: string) {
  const slug = chatProjectSlug(history.route)
  const project = findProject(question) || projects.find(project => project.slug === slug) || projects.find(project => project.slug === history.ctx.lastProject)
  if (project) return `**[${project.name}](/${project.slug})**\n${project.summaryProblem || project.desc}\n${project.summaryRole || ''}\n${project.summaryOutcome || ''}`
  return 'For design engineering and senior product design roles, judge the fit from the work:\n\n• **[Mentra](/mentra):** Head of Design across the smart-glasses OS, companion app, MiniApps and launch site.\n• **[Clawed](/clawed-chat):** product design for an AI assistant with visible approvals and action receipts.\n• **[Jugalbandi](/jugalbandi):** a playable MIDI instrument with robotic acoustic responses.\n\nWhich role or skill would you like to assess?'
}

export async function sendMessage(
  userMessage: string,
  history: ChatHistory,
  onChunk?: (text: string) => void,
  options?: {
    onSource?: (source: 'ai' | 'notes') => void
    pageContext?: ReturnType<typeof import('./chatPageContext').getChatPageContext>
    surface?: 'cursor' | 'panel'
    cursorContext?: {
      section: string
      note: string
      step: number
      total: number
    }
  },
): Promise<string> {
  // Chat keeps paragraph/list boundaries; cursor copy retains its compact format.
  const formatAnswer = (value: string) => options?.surface === 'panel'
    ? value.split('\n').map(line => normalizeCopy(line)).join('\n').trim()
    : normalizeCopy(value)
  syncRoute(history)
  updatePersonaFromMessage(history.ctx, userMessage)
  if (options?.surface === 'cursor' && isCursorIdentityQuestion(userMessage)) {
    rememberTurn(history, userMessage, CURSOR_IDENTITY_REPLY)
    onChunk?.(CURSOR_IDENTITY_REPLY)
    return CURSOR_IDENTITY_REPLY
  }
  const portfolioQuestion = isPortfolioQuestion(userMessage, {
    route: history.route,
    lastProject: history.ctx.lastProject,
  })
  if (!portfolioQuestion && !isEdgeAIEnabled() && options?.surface !== 'panel') {
    const scoped = options?.surface === 'cursor'
      ? CURSOR_SCOPE_REPLY
      : normalizeCopy(PORTFOLIO_SCOPE_REPLY)
    rememberTurn(history, userMessage, scoped)
    onChunk?.(scoped)
    return scoped
  }
  const explicitlyNamed = findProject(userMessage)
  if (explicitlyNamed) history.ctx.lastProject = explicitlyNamed.slug
  const { text } = portfolioQuestion
    ? getResponse(userMessage, history.ctx)
    : { text: options?.surface === 'panel' ? panelOverview(history, userMessage) : CURSOR_SCOPE_REPLY }
  await new Promise(resolve => setTimeout(resolve, 0))
  const routeSlug = chatProjectSlug(history.route)
  const evidenceProject = findProject(userMessage)?.slug || (projects.some(project => project.slug === routeSlug) ? routeSlug : history.ctx.lastProject)
  let groundedAnswer = verifiedProjectAnswer(evidenceProject, userMessage) || text
  if (options?.surface === 'panel' && (/\b(best|stand.?out|different|good fit|hire him|hire you)\b/i.test(userMessage) || /^(?:ask about a specific project|ask where to start|i only (?:answer|discuss|talk))/i.test(text))) groundedAnswer = panelOverview(history, userMessage)
  if (options?.surface === 'panel') {
    const named = projects.filter(project => [project.slug, project.name, ...(PROJECT_ALIASES[project.slug] || [])].some(term => term.length > 3 && normalize(userMessage).includes(normalize(term))))
    if (/compare|difference|versus|\bvs\b/i.test(userMessage) && named.length >= 2) {
      groundedAnswer = named.slice(0, 3).map(project => `**[${project.name}](/${project.slug})**\n${project.summaryProblem || project.desc}\nRole: ${project.summaryRole || 'See the public project overview for the scope of ownership.'}\nOutcome: ${project.summaryOutcome || 'No verified outcome is recorded in the public summary.'}`).join('\n\n')
    } else if (options.pageContext && /this (page|section)|summari[sz]e|what am i looking/i.test(userMessage)) {
      const section = options.pageContext.sections.find(s => s.inViewport && s.text)
      if (section?.text) groundedAnswer = `From **${section.title}** on this page:\n\n${section.text.slice(0, 1000)}`
    }
  }
  const localAnswer = formatAnswer(groundedAnswer)

  if (!isEdgeAIEnabled()) {
    options?.onSource?.('notes')
    const fallbackAnswer = options?.surface === 'cursor'
      ? shapeCursorAnswer(localAnswer, userMessage, true)
      : localAnswer
    rememberTurn(history, userMessage, fallbackAnswer)
    onChunk?.(fallbackAnswer)
    return fallbackAnswer
  }

  const edgeAnswer = await getEdgeAIAnswer({
    message: userMessage,
    route: history.route,
    localAnswer,
    context: {
      ...buildPublicEdgeContext(history.ctx, userMessage, localAnswer),
      recentConversation: history.turns.slice(-6),
      currentPage: options?.pageContext,
      currentTourStop: options?.cursorContext,
    },
    model: getEdgeAIModel(),
    surface: options?.surface || 'panel',
  }, undefined, options?.onSource)

  if (!edgeAnswer) options?.onSource?.('notes')
  const cursorEdgeAnswer = edgeAnswer && isCursorAnswerUsable(edgeAnswer, userMessage) ? edgeAnswer : null
  const finalAnswer = options?.surface === 'cursor'
    ? shapeCursorAnswer(cursorEdgeAnswer || localAnswer, userMessage, !cursorEdgeAnswer)
    : formatAnswer(edgeAnswer || localAnswer)
  rememberTurn(history, userMessage, finalAnswer)
  onChunk?.(finalAnswer)
  return finalAnswer
}

export function getChips(route: string, questionCount: number, lastQuestion?: string, ctx?: ChatContext): string[] {
  if (questionCount === 0 || !lastQuestion) {
    if (STARTER_CHIPS[route]) return normalizeCopyList(STARTER_CHIPS[route])

    const slug = route.replace(/^\//, '')
    if (slug && slug !== 'work' && slug !== 'about') {
      return normalizeCopyList(['What was the challenge?', 'Key insight', 'Why it matters', 'Related work'])
    }
  }

  const matchedProject = lastQuestion ? findProject(lastQuestion)?.slug : undefined
  return normalizeCopyList(getDynamicChips(route, questionCount, matchedProject, ctx).slice(0, 4))
}

export function getResponseAction(question: string, route = ''): ResponseAction {
  const q = normalize(question)
  if (!q) return { type: 'none' }

  if (route === '/work') {
    const view = findWorkView(q)
    if (view) {
      const config = WORK_VIEW_CONFIG[view]
      const currentView = getCurrentWorkViewMode()

      if (currentView === view) {
        return getExplainedSectionAction(config.label, config.selectors, config.explanation)
      }

      return {
        type: 'navigate',
        path: config.path,
        routePath: '/work',
        label: config.label,
        selectors: config.selectors,
        explanation: config.explanation,
      }
    }
  }

  // Check for project match FIRST — if a specific project is named, don't filter
  const project = findProject(q)

  // Work filter only fires if no specific project was found
  if (!project) {
    const workFilter = findWorkFilter(q)
    if (
      workFilter &&
      (
        route === '/work' ||
        /\b(filter|show|only|just|all|archive|browse)\b/.test(q)
      )
    ) {
      return {
        type: 'filter',
        filterKey: workFilter.key,
        label: workFilter.label,
      }
    }
  }
  if (project) {
    const focus = getProjectFocus(project, q)
    if (focus) {
      const path = `/${project.slug}`
      const element = route === path ? getSectionElement(focus.selectors) : null
      return {
        type: route === path ? 'scroll' : 'navigate',
        slug: project.slug,
        label: `${project.name} · ${focus.label}`,
        image: project.image,
        element,
        selectors: focus.selectors,
        explanation: focus.explanation,
      }
    }

    const element = getCardElement(project.slug)
    return {
      type: element ? 'scroll' : 'navigate',
      slug: project.slug,
      label: project.name,
      image: project.image,
      element,
    }
  }

  const category = findCategory(q)
  if (category) {
    return {
      type: 'navigate',
      slug: category.slug,
      label: `${category.title} ${category.titleAccent}`,
      image: category.featured.image,
    }
  }

  if (route === '/') {
    if (/\b(hero|top|opening)\b/.test(q)) return getExplainedSectionAction('Hero', ['#hero'], 'This is the opening frame. The object carries the first impression and the caption rail keeps the context light.')
    if (/\b(featured|featured work|best work|start here|shortlist|start with (?:three|four)|start with flagship)\b/.test(q)) {
      return getExplainedSectionAction('Featured work', ['.wr-featured-v2', '#works'], 'This is the flagship work layer. It should prove systems depth, research, and range before the archive appears.')
    }
    if (/\b(disciplines|categories|domains)\b/.test(q)) return getExplainedSectionAction('Disciplines', ['.wr-disciplines'], 'This row broadens the practice quickly. It shows the spread without forcing the homepage to become a directory.')
    if (/\b(about|bio)\b/.test(q)) return getExplainedSectionAction('About', ['#about-card', '.wr-about-card'], 'This is the compressed about layer. It gives enough context to humanize the work without slowing down the homepage.')
    if (/\b(archive|more work|older projects)\b/.test(q)) return getExplainedSectionAction('Archive', ['.wr-archive'], 'This is the depth layer. It matters after the flagship work has already made the case.')
    if (/\b(stats|numbers|metrics)\b/.test(q)) return getExplainedSectionAction('Stats', ['.wr-counters'], 'These metrics act as supporting evidence, not the primary story.')
  }

  if (route === '/work') {
    if (/\b(views|modes|browse modes|ways to browse|work modes)\b/.test(q)) return getExplainedSectionAction('Work views', ['.work-view-switch'], 'There are three ways to browse this page: Editorial for reading, Index for compact scanning, and Arc for progression.')
    if (/\b(filters|categories|filter bar|pills)\b/.test(q)) return getExplainedSectionAction('Controls', ['.work-library-nav', '.work-timeline-rail', '.work-bottom-nav', '.work-view-switch'], 'The control surface changes with the view. Editorial uses the bottom filter rail, Index uses the jump bar, and Arc uses the period rail.')
    if (/\b(grid|archive|cards)\b/.test(q)) return getExplainedSectionAction('Project archive', ['.work-library-shelves', '.work-timeline-main', '.pcard-masonry'], 'The same body of work is being read three different ways here. Choose the view that matches how you want to evaluate the portfolio.')
    if (/\b(intro|header)\b/.test(q) && !/\b(project|case)\b/.test(q)) return getExplainedSectionAction('Work intro', ['.work-page-header'], 'The header frames the page as an archive, not a landing page.')
  }

  if (route === '/about') {
    if (/\b(hero|bio|intro)\b/.test(q) && !/\b(project|case)\b/.test(q)) return getExplainedSectionAction('About intro', ['.abt-photo-hero', '.abt-paper'], 'This is the personal framing layer. It sets the tone before the resume details start.')
    if (/\b(experience|timeline|resume|roles)\b/.test(q)) return getExplainedSectionAction('Experience', ['.abt-status-row', '.abt-exp', '.abt-timeline'], 'This is the experience layer. It is the fastest way to understand role fit and trajectory.')
    if (/\b(tools|skills|stack)\b/.test(q)) return getExplainedSectionAction('Tools', ['.abt-tools', '.abt-skills'], 'This section shows the working range, design systems, code, and fabrication all sitting inside the same practice.')
    if (/\b(practice|habits|daily)\b/.test(q)) return getExplainedSectionAction('Practices', ['.abt-practice-grid', '.abt-practice'], 'This is the daily-practice layer. It explains where the consistency in the work actually comes from.')
    if (/\b(contact|cta|hire)\b/.test(q)) return getExplainedSectionAction('Contact', ['.abt-cta', '.cta-v2'], 'This is the close. The page keeps the ask direct and simple.')
  }

  if (route && route !== '/' && route !== '/work' && route !== '/about') {
    if (/\b(challenge|problem|context|background)\b/.test(q)) return getExplainedSectionAction('Challenge', ['#cs-problem', '#cs-hook', '#cs-context', '#cs-background', '#cs-bet', '#cs-challenge', '#cs-challenges'], 'This is the framing section. It is where the project proves the problem was worth solving in the first place.')
    if (/\b(process|approach|research|system|solution)\b/.test(q)) return getExplainedSectionAction('Process', ['#cs-process', '#cs-research', '#cs-solution', '#cs-system', '#cs-decisions', '#cs-design'], 'This is the process section. It is usually the most useful place to judge the work.')
    if (/\b(result|impact|outcome|reflection|credits)\b/.test(q)) return getExplainedSectionAction('Results', ['#cs-results', '#cs-impact', '#cs-learnings', '.cs-thanks', '.cs-credits', '#cs-bottom-nav'], 'This section shows the payoff, the outcomes, and what carried forward after the project shipped.')
  }

  if (/\babout\b/.test(q) && !/\babout (the|this|that|a|an)\b/.test(q)) return { type: 'navigate', slug: 'about', label: 'About' }
  if (/\b(work page|all work|show work)\b/.test(q)) return { type: 'navigate', slug: 'work', label: 'Work' }
  if (/\b(home|homepage|go home)\b/.test(q)) return { type: 'navigate', slug: '', label: 'Home' }

  return { type: 'none' }
}

export function getGreeting(route: string): string {
  return normalizeCopy(getRouteGreeting(route))
}

const STATIC_TOURS: Record<string, TourStep[]> = {
  '/': [
    { text: 'Welcome. I\'ll walk you through Parth\'s work the way he\'d present it himself. The four projects up top are there to make the case fast: Mentra is the platform ambition play, TransFi is the trust-and-scale fintech story, Clawed is the AI behavior bet, and Jugalbandi is the range check.', scrollTo: '.wr-featured-v2, #works', delay: 300 },
    { text: 'Six disciplines. That\'s not a flex, it\'s the actual range. UX design and fintech pay the bills, but the creative tech and installations? That\'s where you see the thinking that makes the product work different. Parth builds physical things, not just pixels.', scrollTo: '.wr-disciplines', delay: 300 },
    { text: `The archive goes deeper. If you liked a flagship project, there are ${projects.filter(p => !p.hidden && !p.featured).length} more stories here. My suggestion: don't scroll linearly. Ask me for a shortlist based on what you care about and I'll pull the right three.`, scrollTo: '.wr-archive', delay: 300 },
    { text: 'Quick snapshot of who Parth is. Head of UI/UX at Mentra, NYU ITP grad, based in the United States. If the work speaks to you, the contact is right there. Or just ask me anything, I know every project here.', scrollTo: '#about-card, .wr-about-card', delay: 0 },
  ],
  '/about': [
    { text: 'This is Parth. Design engineer, Head of UI/UX at Mentra, building the OS for AI smart glasses in the United States. NYU ITP grad. The photo changes if you hover over it, by the way.', scrollTo: '.abt-photo-hero, .abt-paper', delay: 300 },
    { text: 'Here\'s the thing that matters: he\'s at Mentra right now designing an entire operating system for a 640-pixel-wide display. Before that, founding designer at ZentiPay, lead at TransFi. The trajectory is 0-to-1 product work at increasing scale.', scrollTo: '.abt-status-row, .abt-status-card', delay: 350 },
    { text: 'The tools section is worth a look. It\'s not just Figma, it\'s React, Python, Arduino, Blender, laser cutters. He designs it, codes it, and sometimes physically builds it. That range is why the installations and creative tech projects exist alongside the fintech work.', scrollTo: '.abt-tools, .abt-skills', delay: 350 },
    { text: 'The daily practices at the bottom explain the consistency. 100 days of poems, 100 days of sketches, 45 podcast episodes. It\'s not hustle content, it\'s a designer who actually does the reps. If you want to talk, his email is here. Or ask me anything else.', scrollTo: '.abt-practice-grid, .abt-practice', delay: 0 },
  ],
  '/playbook': [
    { text: 'This is the playbook, eight values that shape how Parth works. Not poster philosophy, each one traces back to shipped projects.', scrollTo: '.pb-hero', delay: 300 },
    { text: 'The strip rolls all eight so you can scan them fast. Below, each value gets its own section with the two concrete behaviors behind it.', scrollTo: '.pb-strip', delay: 320 },
    { text: 'Empathy and accessibility lead for a reason, that thread runs from Raahi\'s transit work to the 18px minimum text on Mentra\'s glasses.', scrollTo: '#empathy', delay: 350 },
    { text: 'If you want proof instead of principles, ask me how any value shows up in a real project and I\'ll take you to the case study.', scrollTo: '.pb-cta', delay: 0 },
  ],
}

function getWorkTourSteps(): TourStep[] {
  const totalProjects = projects.filter(project => !project.hidden).length
  const view = getCurrentWorkViewMode()

  if (view === 'library') {
    return [
      { text: 'This is Index view. It flattens the page into a compact browse surface so you can scan without the heavy editorial rhythm.', scrollTo: '.work-page-header', delay: 260 },
      { text: 'The jump bar lets you move by discipline instead of by chronology. It is the fastest mode when you know the kind of work you want.', scrollTo: '.work-library-nav', delay: 320 },
      { text: 'Each section keeps the category explanation light and the project rows compact. This mode is for lookup, not for storytelling.', scrollTo: '.work-library-shelves', delay: 0 },
    ]
  }

  if (view === 'timeline') {
    return [
      { text: 'This is Arc view. It is less about categories and more about progression, one anchor project per period, then the surrounding work.', scrollTo: '.work-page-header', delay: 260 },
      { text: 'The left rail jumps by period. It is the quick way to read how the practice evolves over time, not just what categories exist.', scrollTo: '.work-timeline-rail', delay: 320 },
      { text: 'Each period starts with one anchor project. That is the project carrying the strongest signal for that slice of the portfolio.', scrollTo: '.work-timeline-feature', delay: 320 },
      { text: 'Below that is the supporting work. It gives breadth without diluting the lead project.', scrollTo: '.work-timeline-support', delay: 0 },
    ]
  }

  return [
    { text: `This is the editorial archive. ${totalProjects} projects, with the strongest work surfaced first.`, scrollTo: '.work-page-header', delay: 260 },
    { text: 'The view switch changes the way the same body of work is read. Editorial is for the clean portfolio read, Index is for scanning, and Arc is for progression.', scrollTo: '.work-view-switch', delay: 320 },
    { text: 'The top section is the flagship layer. It should prove systems depth, research quality, and range before the archive starts asking for more time.', scrollTo: '.work-group--selected, .work-flagships-list', delay: 320 },
    { text: 'Below that, the archive becomes the depth layer. Ask me for a shortlist if you do not want to scroll linearly.', scrollTo: '.pcard-masonry, .work-bottom-nav', delay: 0 },
  ]
}

function getProjectTour(route: string): TourStep[] {
  const slug = route.replace(/^\//, '')
  const project = findProject(slug)
  const label = project?.name || slug.replace(/-/g, ' ')
  const narrative = getProjectNarrative(slug)
  const sectionIds = Array.from(document.querySelectorAll<HTMLElement>('.cs-section[id]')).map(section => section.id)

  const pickSection = (pattern: RegExp, fallbacks: string[]) => {
    const matchingId = sectionIds.find(id => pattern.test(id))
    return matchingId ? `#${matchingId}` : fallbacks.join(', ')
  }

  const deep = narrative?.deep

  // Project-specific opinionated tours
  if (deep) {
    const connected = (deep.connectedTo || []).slice(0, 2)
    const connectedNames = connected.map(s => {
      const p = projects.find(pr => pr.slug === s)
      return p ? `**[${p.name}](/${p.slug})**` : ''
    }).filter(Boolean)

    return [
      {
        text: `Let me walk you through **${label}**. ${deep.oneLiner} I'll point out what actually matters and skip the filler.`,
        scrollTo: '.project-header, .cs-header, main',
        delay: 300,
      },
      {
        text: `Okay, pay attention here. ${deep.challenge} This is the real constraint, not the brief. Everything that follows was shaped by this problem.`,
        scrollTo: pickSection(/hook|problem|challenge|context|background|bet/, ['.cs-section:nth-of-type(2)']),
        delay: 350,
      },
      {
        text: `This is where the senior thinking shows up. ${deep.process} Most case studies show you the output. This section shows you *why* those decisions were made.`,
        scrollTo: pickSection(/process|approach|solution|design|system|research|decisions/, ['.cs-section:nth-of-type(3)']),
        delay: 350,
      },
      {
        text: deep.surprisingFact
          ? `Here's something most people miss: ${deep.surprisingFact}`
          : `The key insight here: ${deep.insight}`,
        scrollTo: pickSection(/result|impact|system|store|companion|os|decisions/, ['.cs-section:nth-of-type(4)']),
        delay: 300,
      },
      {
        text: `${deep.whyItMatters}${connectedNames.length ? ` If this resonated, look at ${connectedNames.join(' and ')} next, similar thread.` : ' Ask me about the challenge, the insight, or what makes this one special.'}`,
        scrollTo: pickSection(/result|impact|reflection|learn|next|credits/, ['.cs-thanks', '.cs-credits', '.cs-bottom-nav']),
        delay: 0,
      },
    ]
  }

  // Fallback for projects without deep stories
  return [
    {
      text: `This is **${label}**. I don't have the deep story loaded for this one, but let me walk the sections. The structure will tell you a lot.`,
      scrollTo: '.project-header, .cs-header, main',
      delay: 300,
    },
    {
      text: 'Start with the framing. What was the actual problem? Skip the hero image, look for the constraint that made this project hard.',
      scrollTo: pickSection(/hook|problem|challenge|context|background|bet/, ['.cs-section:nth-of-type(2)']),
      delay: 300,
    },
    {
      text: 'Now the decisions. This is where you see whether the thinking is surface-level or structural. Look for the "why" behind each choice.',
      scrollTo: pickSection(/process|approach|solution|design|system|research/, ['.cs-section:nth-of-type(3)']),
      delay: 300,
    },
    {
      text: 'Did it land? Check the outcomes. If there are numbers, great. If there are reflections, even better. That is where you see if the designer learned something.',
      scrollTo: pickSection(/result|impact|reflection|learn|next|credits/, ['.cs-thanks', '.cs-credits', '.cs-bottom-nav']),
      delay: 0,
    },
  ]
}

export function getTourSteps(route: string): TourStep[] {
  if (route === '/work') {
    return getWorkTourSteps().map(step => ({ ...step, text: normalizeCopy(step.text) }))
  }

  if (STATIC_TOURS[route]) {
    return STATIC_TOURS[route].map(step => ({ ...step, text: normalizeCopy(step.text) }))
  }

  const slug = route.replace(/^\//, '')
  if (slug) {
    return getProjectTour(slug).map(step => ({ ...step, text: normalizeCopy(step.text) }))
  }

  return [{ text: 'Let me show you the structure.', delay: 0 }]
}
