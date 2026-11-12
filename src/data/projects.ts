import { isExperimental, portfolio, projectSlugs } from '../config/portfolio'
/**
 * Central project registry — single source of truth.
 *
 * To add a new project:
 *  1. Add an entry here
 *  2. Create the page component in src/pages/projects/
 *  3. Done — routes, cards, and listings are auto-generated.
 *
 * To mark a project as access-limited:
 *  Set `nda: true` and `access.mode: 'request'`.
 *  Public cards and pages should show only the safe glimpse. Private material does not ship in this static build.
 * To remove a project from public discovery:
 *  Set `hidden: true` and point `page` to NotFoundPage.
 *  Keep this reserved for intentionally hidden work, not thin projects.
 *  Thin-but-presentable projects should route to a small glimpse page.
 */

export interface Project {
  /** URL slug — becomes the route path */
  slug: string
  /** Display name */
  name: string
  /** Card thumbnail image */
  image: string
  /** Generated text-free cover used on portrait card/listing surfaces (4:5) */
  cardMockup?: string
  /** Square 1:1 cover for square card slots */
  cardMockupSquare?: string
  /** Wide 16:9 cover for featured cards + case-study hero */
  cover16x9?: string
  /** Alt text for the generated cover */
  cardMockupAlt?: string
  /** Optional explicit source image for generated card mockups */
  cardMockupSource?: string
  /** Category tag shown on card (uppercase) */
  tag: string
  /** Year or year range */
  year: string
  /** One-line description for card marquee / meta */
  desc: string
  /** Category key for filtering */
  category: ProjectCategory
  /** Additional disciplines where the same project provides meaningful proof */
  secondaryCategories?: ProjectCategory[]
  /** Lazy import factory for the page component */
  page: () => Promise<{ default: React.ComponentType }>
  /** Mark as access-limited/private */
  nda?: boolean
  /** Public/private access behavior for portfolio surfaces */
  access?: {
    mode: 'public' | 'request' | 'hidden'
    publicLabel?: string
    publicPreviewImage?: string
    publicPreviewAlt?: string
  }
  /** Show in featured grid on homepage */
  featured?: boolean
  /** Featured order (lower = first) */
  featuredOrder?: number
  /** Archive order on homepage (lower = first) */
  archiveOrder?: number
  /** Hide from work page entirely */
  hidden?: boolean
  /** Loading priority */
  loading?: 'eager' | 'lazy'
  /** Quality tier: s=flagship, a=strong, b=good, c=thin, d=filler */
  tier?: 's' | 'a' | 'b' | 'c' | 'd'
  /** Explicitly include in recruiter-facing selected work */
  selected?: boolean
  /** Selected work order (lower = earlier) */
  selectedOrder?: number
  /** Flagship TL;DR: the problem the project solved */
  summaryProblem?: string
  /** Flagship TL;DR: role summary */
  summaryRole?: string
  /** Flagship TL;DR: team summary */
  summaryTeam?: string
  /** Flagship TL;DR: timeline summary */
  summaryTimeline?: string
  /** Optional milestones for the project overview timeline */
  timelineMilestones?: { period: string; label: string }[]
  /** Flagship TL;DR: primary outcome */
  summaryOutcome?: string
  /** Flagship TL;DR: key artifact image */
  summaryImage?: string
  /** Key artifact alt text */
  summaryImageAlt?: string
  /** Flagship proof stats shown above the full case study */
  summaryStats?: { label: string; value: string; note?: string }[]
  /** Optional short testimonial or stakeholder quote */
  testimonial?: { quote: string; cite: string }
  /** Homepage hover media */
  hoverMedia?: { src: string; kind?: 'image' | 'video'; alt?: string }
  /** Alternate preview media for work-page modes */
  previewMedia?: {
    playlist?: { src: string; alt: string }
    library?: { src: string; alt: string }
  }
  /** Shared project story arc used by headers, agent, and summaries */
  storyline?: {
    challenge: string
    approach: string
    result: string
  }
}

export type ProjectCategory = 'ux' | 'research' | 'ai' | 'creative' | 'install' | 'brand' | 'good'

export interface CategoryFilter {
  key: string
  label: string
}

export const CATEGORIES: CategoryFilter[] = [
  { key: 'all', label: 'All' },
  { key: 'ux', label: 'UX Design' },
  { key: 'research', label: 'UX Research' },
  { key: 'good', label: 'Design for Good' },
  { key: 'ai', label: 'AI & Wearables' },
  { key: 'creative', label: 'Design Engineering' },
  { key: 'install', label: 'Installations' },
  { key: 'brand', label: 'Brand & Visual' },
]

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  ux: 'UX Design',
  research: 'UX Research',
  ai: 'AI & Wearables',
  creative: 'Design Engineering',
  install: 'Installations',
  brand: 'Brand & Visual',
  good: 'Design for Good',
}

/* ──────────────────────────────────────────────────────────────────────
   Project Registry
   ────────────────────────────────────────────────────────────────────── */

const IMG = '/Assets/images'
const NDA_COVER = `${IMG}/nda-cover.svg`
export const NDA_PROJECT_SLUGS = [
  'transfi-project',
  'zentipay',
  'cuetv',
  'ai-voice',
] as const

const defaultCardMockup = (slug: string) => `/Assets/mockups/projects/${slug}.webp`

const catalog: Project[] = [
  {
    slug: 'after-hours',
    name: 'After Hours',
    image: '/Assets/preview-covers/after-hours.jpg',
    cardMockup: '/Assets/preview-covers/after-hours.jpg',
    cover16x9: '/Assets/preview-covers/after-hours.jpg',
    tag: 'CREATIVE CODING',
    year: '2026',
    desc: 'An interactive, generative illustration of an endless workshop floor.',
    category: 'creative',
    page: () => import('../pages/AfterHoursPage'),
  },
  {
    slug: 'perplexity',
    name: 'Perplexity Motion Study',
    image: '/Assets/preview-covers/perplexity.jpg',
    cardMockup: '/Assets/preview-covers/perplexity.jpg',
    cover16x9: '/Assets/preview-covers/perplexity.jpg',
    tag: 'MOTION DESIGN',
    year: '2026',
    desc: 'An independent motion study for Perplexity’s product stories.',
    category: 'brand',
    page: () => import('../pages/PerplexityPage'),
  },
  /* ── Featured (homepage hero grid) ── */
  {
    slug: 'mentra',
    name: 'Mentra',
    image: '/Assets/images/mentra/render-transparent.webp',
    tag: 'AI WEARABLES',
    year: '2025–Present',
    desc: 'Designed the OS, companion app, MiniApp Store, and launch site for AI smart glasses',
    category: 'ai',
    page: () => import('../pages/projects/MentraPage'),
    featured: true,
    featuredOrder: 1,
    loading: 'eager',
    tier: 's',
    selected: true,
    selectedOrder: 1,
    summaryProblem: 'First use took 9m 40s, and people who made it through setup still could not tell what was running, what sensors were active, or how to regain control.',
    summaryRole: 'Head of Design, leading research, testing, and delivery across onboarding, the runtime model, companion app, MiniApp ecosystem, and launch website.',
    summaryTeam: 'Head of Design with 2 founders, 8 engineers, 3 operators and 2 marketers.',
    summaryTimeline: 'Q3 2025–Present',
    timelineMilestones: [
      { period: 'Q3 2025', label: 'Baseline research and first-use audit' },
      { period: 'Late 2025', label: 'Companion app and runtime model' },
      { period: 'Q4 2025–Q1 2026', label: 'MiniApp ecosystem and permissions' },
      { period: 'Present', label: 'Launch systems and product iteration' },
    ],
    summaryOutcome: 'Reworked first use, pairing, and runtime control; product testing showed stronger activation, task completion, and return.',
    summaryImage: '/Assets/images/mentra/appstore-hero.webp',
    summaryImageAlt: 'Mentra companion app and app store interface on mobile and smart glasses.',
    cardMockupSource: `${IMG}/mentra/photo-angle.webp`,
    summaryStats: [
      { label: 'Time to first value', value: '9:40 → 5:10', note: 'First-use phase; dates and sample size unavailable publicly.' },
      { label: 'Pairing completion', value: '61% → 84%', note: 'First-use phase; dates and sample size unavailable publicly.' },
      { label: '7-day return', value: '22% → 41%', note: 'Later runtime phase. First-use return was 22% → 23%; cohort details unavailable publicly.' },
      { label: 'MiniApp task completion', value: '52% → 78%', note: 'Later runtime phase; dates and sample size unavailable publicly.' },
    ],
    hoverMedia: {
      src: '/Assets/images/mentra/appstore-device.png',
      alt: 'Mentra companion app store shown on a mobile device.',
    },
    previewMedia: {
      playlist: {
        src: '/Assets/images/mentra/glasses-angle.png',
        alt: 'Angled perspective render of Mentra smart glasses.',
      },
      library: {
        src: '/Assets/images/mentra/appstore-translation.webp',
        alt: 'Mentra translation MiniApp presented within the app store experience.',
      },
    },
    storyline: {
      challenge: 'AI glasses usually feel like disconnected demos unless the OS, companion app, app layer, and public launch story behave like one product.',
      approach: 'I designed the operating system, companion app, app distribution layer, and launch website together so voice, glanceable UI, developer workflows, and buyer proof reinforced the same mental model.',
      result: 'The story links hardware, software, distribution, and go-to-market instead of treating the wearable UI as the whole product.',
    },
  },
  {
    slug: 'mentra-miniapps',
    name: 'MiniApps in OS',
    image: '/Assets/mockups/projects/mentra-miniapps_16x9.webp',
    tag: 'PLATFORM DESIGN',
    year: '2025\u201326',
    desc: 'Voice-first miniapp ecosystem for smart glasses spanning captions, translation, notes, AI, and utility apps',
    category: 'ai',
    page: () => import('../pages/projects/MentraMiniAppsPage'),
    archiveOrder: 2,
    tier: 'a',
    summaryProblem: 'Smart glasses needed a real app layer, but phone-style browse patterns collapse when the screen lives in peripheral vision and the apps range from captions and translation to notes, AI, and utilities.',
    summaryRole: 'Designed the miniapp store, install flows, permissions model, and the platform patterns that let very different MiniApps coexist inside MentraOS.',
    summaryTeam: 'Sole designer partnering with 4 engineers, product, and the MentraOS open-source developer community.',
    summaryTimeline: 'Late 2025 to 2026',
    summaryOutcome: 'Designed Store discovery and app-use screens alongside proposed developer and permission flows. Original screens document the design; end-to-end adoption is not established here.',
    summaryImage: '/Assets/Projects/mentra-miniapps/figma/meet-home.png',
    summaryImageAlt: 'Mentra Call entry screen in the phone companion interface.',
    cardMockupSource: `${IMG}/mentra/os-all-apps.png`,
    summaryStats: [
      { label: 'Source screens', value: 'Phone + glasses' },
      { label: 'Developer flow', value: 'Proposal' },
      { label: 'Primary input', value: 'Voice' },
      { label: 'First-wave apps', value: 'Captions→AI' },
    ],
    previewMedia: {
      playlist: {
        src: '/Assets/Projects/mentra-miniapps/figma/conversations.png',
        alt: 'MentraOS conversation history for the wearable MiniApps platform.',
      },
      library: {
        src: '/Assets/Projects/mentra-miniapps/figma/guidance.png',
        alt: 'MentraOS guidance interface showing a MiniApp adapted to the glasses display.',
      },
    },
    storyline: {
      challenge: 'A wearable app store cannot rely on phone-era browse patterns because attention is shorter and input is constrained.',
      approach: 'I framed discovery around voice, intent, and lightweight developer primitives so mini-apps felt native to glasses instead of copied from mobile.',
      result: 'This turns hardware into an ecosystem and shows product strategy, interaction design, and platform thinking in one system.',
    },
  },
  {
    slug: 'transfi-project',
    name: 'TransFi',
    image: '/Assets/mockups/projects/transfi-project_4x5.webp',
    cardMockupSource: '/Assets/mockups/projects/transfi-project_4x5.webp',
    cardMockupAlt: 'TransFi project cover artwork.',
    tag: 'WEB3 PAYMENTS',
    year: '2023',
    desc: 'Public preview of a multi-market crypto payment infrastructure redesign',
    category: 'ux',
    page: () => import('../pages/projects/TransfiPage'),
    nda: true,
    access: {
      mode: 'request',
      publicLabel: 'Quick glimpse',
      publicPreviewImage: '/Assets/Projects/Transfi/public/Group%20550.png',
      publicPreviewAlt: 'TransFi dashboard and buy-crypto widget shown across laptop and phone mockups.',
    },
    featured: true,
    featuredOrder: 2,
    loading: 'eager',
    tier: 's',
    selected: true,
    selectedOrder: 4,
    summaryProblem: 'Cross-border crypto payments were powerful but opaque, slow to onboard, and hostile to non-crypto-native business users.',
    summaryRole: 'Lead Product Designer across dashboard UX, consumer widget flows, design system, and brand.',
    summaryTeam: 'Lead designer partnering with product, founder, and engineering.',
    summaryTimeline: '2022–23',
    summaryOutcome: 'Simplified merchant onboarding and made the payment infrastructure easier to evaluate, trust, and operate.',
    summaryImage: '/Assets/Projects/Transfi/public/Group%20550.png',
    summaryImageAlt: 'TransFi dashboard and buy-crypto widget shown across laptop and phone mockups.',
    summaryStats: [
      { label: 'Domain', value: 'Payments' },
      { label: 'Scope', value: 'Dashboard + widget' },
      { label: 'Focus', value: 'Trust + onboarding' },
      { label: 'Access', value: 'By request' },
    ],
    testimonial: {
      quote: 'Enterprise buyers needed local rails, clearer onboarding, and payment methods that matched Asian market behavior.',
      cite: 'Public synthesis',
    },
    hoverMedia: {
      src: '/Assets/mockups/projects/transfi-project_16x9.webp',
      kind: 'image',
      alt: 'TransFi project cover artwork.',
    },
    storyline: {
      challenge: 'Cross-border crypto payments were operationally powerful but cognitively heavy, with different market expectations and constraints.',
      approach: 'I simplified the flows around trust, clarity, and speed, then aligned the product language across partner, merchant, and user touchpoints.',
      result: 'The case study ties design decisions to transaction confidence, rollout constraints, and payment-system trust.',
    },
  },
  {
    slug: 'zentipay',
    name: 'ZentiPay',
    image: '/Assets/mockups/projects/zentipay_16x9.webp',
    tag: 'FINTECH',
    year: '2025',
    desc: 'Built a trust-first fintech super-app from scratch',
    category: 'ux',
    page: () => import('../pages/projects/ZentipayPage'),
    nda: true,
    access: {
      mode: 'request',
      publicLabel: 'Quick glimpse',
      publicPreviewImage: '/Assets/mockups/projects/zentipay_16x9.webp',
      publicPreviewAlt: 'ZentiPay public landing page introducing the trust-first money transfer product.',
    },
    archiveOrder: 2,
    tier: 'a',
    loading: 'eager',
    selected: true,
    selectedOrder: 5,
    summaryProblem: 'Cross-border payment users abandoned when fees moved late, language felt foreign, and the product behaved like crypto software instead of a trusted money tool.',
    summaryRole: 'Founding product designer across research, onboarding, information architecture, transaction flows, and the core design system.',
    summaryTeam: 'Sole designer working with product and engineering across web and mobile.',
    summaryTimeline: '2025',
    summaryOutcome: 'Designed transfer screens that expose pricing, progress, review, and recovery earlier. The public preview does not establish a measured confidence or abandonment change.',
    summaryImage: '/Assets/mockups/projects/zentipay_16x9.webp',
    summaryImageAlt: 'ZentiPay dashboard showing balances, transfers, and transaction status.',
    summaryStats: [
      { label: 'Domain', value: 'Fintech' },
      { label: 'Team', value: 'Solo designer' },
      { label: 'Focus', value: 'Trust architecture' },
      { label: 'Access', value: 'By request' },
    ],
    storyline: {
      challenge: 'Users hesitated when fees, status, and next steps appeared too late.',
      approach: 'I brought price, progress, recovery, and review states into one trust system.',
      result: 'The flow made cost, progress, and confidence visible before money moved.',
    },
  },
  {
    slug: 'clawed-chat',
    name: 'Clawed',
    image: '/Assets/mockups/projects/clawed-chat_16x9.webp',
    cardMockup: '/Assets/mockups/projects/clawed-chat_4x5.webp',
    cardMockupSquare: '/Assets/mockups/projects/clawed-chat_1x1.webp',
    cardMockupSource: '/Assets/mockups/projects/clawed-chat_4x5.webp',
    cardMockupAlt: 'Clawed AI assistant cover showing the product across web and smart-glasses contexts.',
    tag: 'AI ASSISTANT',
    year: '2026',
    desc: 'AI-assistant setup screens and proposed approval flows for web and glasses',
    category: 'ai',
    page: () => import('../pages/projects/ClawedChatPage'),
    featured: false,
    tier: 's',
    selected: true,
    selectedOrder: 3,
    summaryProblem: 'Help someone choose where an assistant runs and inspect a proposed action before authorizing it.',
    summaryRole: 'Sole product designer across launch site, web hub and smart-glasses interaction proposals.',
    summaryTeam: 'One designer with three engineers.',
    summaryTimeline: 'Jan–Mar 2026',
    summaryOutcome: 'Original website and documentation captures show deployment choices. Approval modes, receipts and glasses handoff remain design proposals without recorded task results.',
    summaryImage: '/Assets/Projects/Clawed.chat/landing-hero.webp',
    summaryImageAlt: 'Clawed assistant launch visual showing the AI assistant experience.',
    summaryStats: [
      {label:'Evidence',value:'Site + docs'},
      {label:'Approval flow',value:'Proposal'},
      {label:'Glasses',value:'Proposal'},
    ],
    hoverMedia: {
      src: '/Assets/Projects/Clawed.chat/landing-hero.webp',
      alt: 'Clawed AI assistant launch visual.',
    },
    storyline: {
      challenge: 'Make hosting choices understandable and keep proposed assistant actions reviewable.',
      approach: 'Separate deployment guides, then propose explicit draft, review and result stages.',
      result: 'The original captures document the setup presentation; the approval and glasses behavior still need implementation evidence and evaluation.',
    },
  },

  /* ── UX Design ── */
  {
    slug: 'executivelens',
    name: 'ExecutiveLens',
    image: `${IMG}/executivelens.webp`,
    tag: 'AI ANALYTICS',
    year: '2025–26',
    desc: 'Meeting capture, source-linked briefs and controlled follow-up proposals',
    category: 'ai',
    page: () => import('../pages/projects/ExecutiveLensPage'),
    archiveOrder: 1,
    tier: 'a',
    selected: true,
    selectedOrder: 2,
    summaryProblem: 'Meeting summaries need traceable sources, clear ownership and a review boundary before external follow-up.',
    summaryRole: 'Sole product designer across meeting capture, dashboard narrative, mobile briefing, and AI trust patterns.',
    summaryTeam: 'Design lead working with product, AI, and engineering partners.',
    summaryTimeline: '2025 to 2026',
    summaryOutcome: 'Original website evidence and a prepared citation replay show the design direction. Dated beta usage, adoption and time savings are not established.',
    summaryImage: '/Assets/images/executivelens.webp',
    summaryImageAlt: 'ExecutiveLens dashboard and meeting intelligence interface.',
    summaryStats: [
      { label: 'Evidence', value: 'Original website' },
      { label: 'Platform', value: 'Web + mobile' },
      { label: 'Core layer', value: 'Meeting AI' },
      { label: 'Trust pattern', value: 'Citations' },
    ],
    storyline: {
      challenge: 'Executives were drowning in meetings, but summary tools often stop at note-taking and miss the decision layer.',
      approach: 'I focused the product on synthesis, follow-through, and adoption so the AI felt like a working layer for leadership rather than another dashboard.',
      result: 'The prepared demo connects transcript citations to decisions and follow-up. Time savings and adoption are not established in the public record.',
    },
  },
  {
    slug: 'org-dashboard',
    name: 'OrgDashboard',
    image: `${IMG}/org-dashboard.webp`,
    tag: 'B2B SAAS',
    year: '2026',
    desc: 'A proposed workspace for company context and reviewable agent actions',
    category: 'ux',
    page: () => import('../pages/projects/OrgDashboardPage'),
    archiveOrder: 21,
    tier: 'b',
    summaryProblem: 'The brief asks how people could trace retrieved company knowledge and review an agent’s proposed external change.',
    summaryRole: 'Designed the product model, dashboard surfaces, approval flow, and agent-facing knowledge structure.',
    summaryTeam: 'Independent SaaS/product systems case study.',
    summaryTimeline: '2026',
    summaryOutcome: 'An inactive product concept with an illustrative reconstruction and prepared Figma flow. Original product screens and working integrations have not been recovered.',
    summaryStats: [
      { label: 'Status', value: 'Inactive concept' },
      { label: 'Users', value: 'Humans + agents' },
      { label: 'Material', value: 'Reconstruction' },
      { label: 'Focus', value: 'Context' },
    ],
    storyline: {
      challenge: 'Keep retrieved company context inspectable before granting permission for an external action.',
      approach: 'Propose a shared knowledge structure with a separate human review queue.',
      result: 'The reconstruction illustrates product decisions; it does not establish a working dashboard, connectors or usability outcomes.',
    },
  },
  {
    slug: 'cuetv',
    name: 'CueTV',
    image: '/Assets/mockups/projects/cuetv_16x9.webp',
    tag: 'PRODUCT DESIGN',
    year: '2021',
    desc: 'Designed a niche arts OTT platform and retargeting system for opera, ballet, and classical audiences',
    category: 'ux',
    secondaryCategories: ['research'],
    page: () => import('../pages/projects/CueTvPage'),
    nda: true,
    access: {
      mode: 'request',
      publicLabel: 'Quick glimpse',
      publicPreviewImage: '/Assets/mockups/projects/cuetv_16x9.webp',
      publicPreviewAlt: 'CueTV streaming platform across TV, laptop, tablet, and phone.',
    },
    archiveOrder: 9,
    tier: 'c',
    summaryProblem: 'Arts streaming audiences browse differently from mainstream OTT audiences, and the platform also needed a growth system that could scale across fragmented segments.',
    summaryRole: 'Product designer across audience research, browsing flows, platform structure, and ad-creative system thinking.',
    summaryTeam: 'Worked with product and growth stakeholders inside a niche streaming context.',
    summaryTimeline: '2021',
    summaryOutcome: 'Combined product design and retargeting logic into a platform strategy that supported discovery and re-engagement.',
    summaryStats: [
      { label: 'System', value: 'Retargeting' },
      { label: 'Domain', value: 'Arts OTT' },
      { label: 'Focus', value: 'Discovery + growth' },
      { label: 'Year', value: '2021' },
    ],
    storyline: {
      challenge: 'A niche arts streaming product could not borrow generic OTT patterns because expert viewers search differently and growth had to reach fragmented audiences.',
      approach: 'I paired audience research with a repeatable ad and discovery system, then tightened the platform experience around precise browsing and playback.',
      result: 'The project shows research, growth thinking, and product design working as one service system.',
    },
  },
  {
    slug: 'healthapp',
    name: 'Health App',
    image: '/Assets/mockups/projects/healthapp_16x9.webp',
    tag: 'DIGITAL HEALTH',
    year: '2024',
    desc: 'A Google Tasks redesign concept for personal goals, reminders and calendar conflicts',
    category: 'ux',
    page: () => import('../pages/projects/HealthAppPage'),
    archiveOrder: 23,
    tier: 'c',
    summaryProblem: 'Explore how personal goals and recurring care activities could fit into task planning while keeping proposed schedule changes visible.',
    summaryRole: 'Product designer on a self-initiated Google Tasks redesign, from sketches to proposed mobile and calendar screens.',
    summaryTeam: 'Independent product concept spanning product strategy, interaction design, and visual prototyping.',
    summaryTimeline: '2024',
    summaryOutcome: 'Original goal-selection, reminder and calendar-conflict boards. Automatic sensing, recommendation accuracy and health outcomes are not established.',
    summaryStats: [
      { label: 'Source', value: 'Original boards' },
      { label: 'Domain', value: 'Wellness + productivity' },
      { label: 'Format', value: 'Product concept' },
      { label: 'Year', value: '2024' },
    ],
    storyline: {
      challenge: 'Include personal goals and reminders without hiding proposed changes to the calendar.',
      approach: 'Explore goal selection, reminder time and day controls, and an explicit overlap-confirmation prompt.',
      result: 'The original boards document a concept redesign, not a running scheduling service or a validated health intervention.',
    },
  },
  {
    slug: 'medimorpho',
    nda: true,
    access: { mode: 'request', publicLabel: 'Quick glimpse', publicPreviewImage: '/Assets/Projects/MediMorpho/nyu-langone-building-clear.webp' },
    name: 'NYU Langone',
    image: '/Assets/Projects/MediMorpho/nyu-langone-building-clear.webp',
    cardMockupAlt: 'NYU Langone Health signage on the glass facade of its hospital building.',
    tag: 'HEALTHCARE UX',
    year: '2024',
    desc: 'Healthcare UX research into clearer multilingual care, communication, and follow-through',
    category: 'good',
    secondaryCategories: ['research'],
    page: () => import('../pages/projects/MediMorphoPage'),
    archiveOrder: 24,
    tier: 'a',
    summaryProblem: 'Patients with limited English proficiency can lose meaning, confidence, and agency when symptoms and medical terminology move between languages.',
    summaryRole: 'Service designer in a five-person NYU student team, spanning primary research, synthesis, system framing, and concept direction.',
    summaryTeam: 'Five-person NYU student team',
    summaryTimeline: 'January–February 2024',
    summaryOutcome: 'A healthcare research study and service-design concept. Detailed evidence is reserved for private review.',
    summaryStats: [],
    storyline: {
      challenge: 'Language barriers, medical jargon, and fragmented records can make a healthcare visit difficult to understand and even harder to remember.',
      approach: 'Ecosystem research and interviews informed a connected service concept.',
      result: 'Detailed research findings and supporting material are reserved for private review.',
    },
  },
  {
    slug: 'ibm',
    name: 'IBM Cancer Prognosis',
    image: '/Assets/mockups/projects/ibm_16x9.webp',
    cardMockupSource: '/Assets/mockups/projects/ibm_16x9.webp',
    tag: 'HEALTHCARE AI',
    year: '2020',
    desc: 'Explored encrypted genomic workflows for cancer prognosis without exposing raw patient data',
    category: 'ai',
    page: () => import('../pages/projects/IbmPage'),
    archiveOrder: 25,
    tier: 'c',
    summaryProblem: 'Cancer prognosis systems need genomic signal to be useful, but sharing raw patient data creates a serious privacy risk during computation.',
    summaryRole: 'Researcher and engineer working across encrypted system design, data analysis, and the clinical computation pipeline.',
    summaryTeam: 'Research internship at IBM with healthcare and cryptography guidance.',
    summaryTimeline: '8 months in 2020',
    summaryOutcome: 'Explored a homomorphic-encryption workflow that kept genomic data encrypted while still supporting survival prediction and treatment clustering.',
    summaryStats: [
      { label: 'Internship', value: '8 months' },
      { label: 'Domain', value: 'Healthcare AI' },
      { label: 'Core method', value: 'FHE' },
      { label: 'Output', value: 'Survival curves' },
    ],
    storyline: {
      challenge: 'Healthcare AI needs rich genomic data, but patient privacy makes ordinary machine-learning pipelines hard to trust.',
      approach: 'I explored encrypted computation as the method, keeping genomic data protected while still supporting survival analysis and treatment clustering.',
      result: 'The project shows technical research judgment: privacy was treated as the core product constraint, not a compliance note added later.',
    },
  },

  /* ── AI & Wearables ── */
  {
    slug: 'ballah-code',
    name: 'Ballah Code',
    image: `${IMG}/ballah-code.webp`,
    tag: 'AI DEV TOOLS',
    year: '2026',
    desc: 'Designed an AI-native IDE with visible tools, terminal context, and a senior-engineer interaction model',
    category: 'ai',
    page: () => import('../pages/projects/BallahCodePage'),
    archiveOrder: 17,
    tier: 'b',
    summaryProblem: 'AI coding tools often feel either too magical or too shallow, leaving developers unsure what the system changed and why.',
    summaryRole: 'Designed the IDE model, tool surfaces, interaction patterns, and product framing for an AI-native development environment.',
    summaryTeam: 'Independent product design and prototyping project.',
    summaryTimeline: '2026',
    summaryOutcome: 'Framed the editor around visible tools, senior-engineer review habits, and clearer handoffs between AI suggestions and developer control.',
    summaryStats: [
      { label: 'AI tools', value: '17' },
      { label: 'Surface', value: 'Desktop IDE' },
      { label: 'Core input', value: 'Chat + terminal' },
      { label: 'Focus', value: 'Context' },
    ],
    storyline: {
      challenge: 'Developers need AI help, but they still need traceability, control, and a workspace that respects how engineering decisions are made.',
      approach: 'I structured the experience around explicit tools, inspectable actions, and reviewable states instead of a single opaque chat box.',
      result: 'The project explains how visible AI tools, review states, and developer control can coexist inside an IDE.',
    },
  },
  {
    slug: 'ai-voice',
    name: 'AI Voice',
    image: '/Assets/mockups/projects/ai-voice_16x9.webp',
    cardMockupSource: '/Assets/mockups/projects/ai-voice_4x5.webp',
    cardMockupAlt: 'Voice Matching enterprise interface showing three suggested voice personas.',
    tag: 'CONVERSATIONAL AI',
    year: '2025',
    desc: 'Redesigned enterprise AI voice selection around tone, context, and emotional fit',
    category: 'ai',
    page: () => import('../pages/projects/AiVoicePage'),
    nda: true,
    access: {
      mode: 'request',
      publicLabel: 'Quick glimpse',
      publicPreviewImage: '/Assets/mockups/projects/ai-voice_16x9.webp',
      publicPreviewAlt: 'Voice Matching enterprise interface cover for AI voice selection work.',
    },
    archiveOrder: 32,
    tier: 'b',
    summaryProblem: 'Enterprise AI voice tools can make voice choice feel cosmetic, even when tone, context, and emotional fit shape user trust.',
    summaryRole: 'Product designer structuring voice selection, scenario evaluation, and reviewer confidence for an access-limited enterprise tool.',
    summaryTeam: 'Access-limited enterprise AI voice project.',
    summaryTimeline: '2025',
    summaryOutcome: 'Reframed voice selection as a product decision grounded in use case, emotional tone, and testing context.',
    summaryStats: [
      { label: 'Domain', value: 'Enterprise AI' },
      { label: 'Primary lens', value: 'Tone fit' },
      { label: 'Access', value: 'By request' },
      { label: 'Year', value: '2025' },
    ],
    storyline: {
      challenge: 'Enterprise voice tooling often reduces voice choice to a superficial brand setting instead of a functional design decision.',
      approach: 'I structured selection around emotional fit, scenario testing, and confidence in how a voice behaves across real customer moments.',
      result: 'The work shows sensitivity to conversation design, evaluation criteria, and the productization of an emerging AI capability.',
    },
  },

  /* ── Design for Good ── */
  {
    slug: 'raahi-project',
    name: 'Raahi',
    image: '/Assets/images/raahi.jpg',
    cardMockup: '/Assets/images/raahi.jpg',
    cardMockupAlt: 'Raahi cover: sculptural hands holding a phone with the Raahi journey planner over a dark city map',
    tag: 'CIVIC DESIGN',
    year: '2022',
    desc: 'Service design for Pune public transit — app, kiosk, and in-vehicle systems',
    category: 'good',
    secondaryCategories: ['research'],
    page: () => import('../pages/projects/RaahiPage'),
    featured: true,
    featuredOrder: 3,
    archiveOrder: 5,
    tier: 'a',
    selected: true,
    selectedOrder: 7,
    summaryProblem: 'Pune public transit broke trust across buses, metro, kiosks, and in-vehicle touchpoints, especially for riders who were not already fluent in the system.',
    summaryRole: 'User researcher and UI designer across service design, brand identity, app flows, kiosk UX, and in-vehicle information surfaces.',
    summaryTeam: 'Collaborated with one fellow designer on a self-initiated civic design project.',
    summaryTimeline: '3 months in 2022',
    summaryOutcome: 'Designed a connected transit concept intended to make the journey clearer across app, kiosk, and vehicle touchpoints. Rider impact and operational feasibility remain untested.',
    summaryImage: '/Assets/Projects/Raahi/photos/raahi-hero.webp',
    summaryImageAlt: 'Raahi hero concept showing transit app, bus, and connected wayfinding system.',
    summaryStats: [
      { label: 'Modes represented', value: '8' },
      { label: 'Core touchpoints', value: '3' },
      { label: 'Project span', value: '3 mo' },
      { label: 'Design lanes', value: 'Service + UI' },
    ],
    storyline: {
      challenge: 'Public transit systems fail when information breaks across kiosks, vehicles, and mobile touchpoints instead of acting like one journey.',
      approach: 'I designed the service as a connected system, aligning the app, in-vehicle guidance, and physical interfaces around the rider’s mental model.',
      result: 'The case study shows service design range and the ability to unify digital and environmental touchpoints.',
    },
  },
  {
    slug: 'the-point-cdc',
    name: 'The Point CDC',
    image: '/Assets/mockups/projects/the-point-cdc_16x9.webp',
    cardMockupSource: '/Assets/mockups/projects/the-point-cdc_16x9.webp',
    tag: 'COMMUNITY',
    year: '2024',
    desc: 'Rebuilt a Bronx nonprofit platform to make community programs, spaces, and services easier to navigate',
    category: 'good',
    page: () => import('../pages/projects/ThePointCdcPage'),
    archiveOrder: 7,
    tier: 'b',
    summaryProblem: 'The nonprofit had many programs, services, and community resources, but the website made residents work too hard to understand what was available.',
    summaryRole: 'UX designer across information architecture, community program navigation, responsive page structure, and accessibility-minded content hierarchy.',
    summaryTeam: 'Community-focused web redesign project for The Point CDC.',
    summaryTimeline: '2024',
    summaryOutcome: 'Rebuilt the experience around clearer service discovery, mobile-first navigation, and a calmer path from need to program detail.',
    summaryStats: [
      { label: 'Context', value: 'Bronx nonprofit' },
      { label: 'Primary users', value: 'Mobile residents' },
      { label: 'Core need', value: 'Programs + WiFi' },
      { label: 'Method', value: 'IA + research' },
    ],
    storyline: {
      challenge: 'Community websites fail when people cannot quickly find the service, space, or program that matches their immediate need.',
      approach: 'I reorganized the site around resident intent, simplified the navigation, and treated accessibility as part of the core information design.',
      result: 'The case study shows practical civic UX: clearer structure, better wayfinding, and a website that serves real community use instead of internal categories.',
    },
  },
  {
    slug: 'office-of-diversity',
    name: 'Office of Diversity',
    image: '/Assets/Projects/office-of-diversity/photos/responsive-preview.png',
    cardMockupSource: '/Assets/Projects/office-of-diversity/photos/research-wall.webp',
    tag: 'EDUCATION',
    year: '2024',
    desc: 'Compact report-publishing work for NYU Tisch’s IDBEA content',
    category: 'good',
    page: () => import('../pages/projects/OfficeOfDiversityPage'),
    archiveOrder: 30,
    tier: 'c',
    summaryProblem: 'A dense institutional report needed to become easier to scan, navigate, and revisit across desktop and mobile.',
    summaryRole: 'Website publishing designer translating report content into a clearer accessible web structure.',
    summaryTeam: 'Worked within an NYU Tisch context with accessibility as a core requirement.',
    summaryTimeline: '3 months in 2024',
    summaryOutcome: 'Created a compact web report structure that made IDBEA milestones and progress easier for the Tisch community to read.',
    summaryStats: [
      { label: 'Design target', value: 'WCAG 2.1 AA' },
      { label: 'Format shift', value: 'Report to web' },
      { label: 'Context', value: 'NYU Tisch' },
      { label: 'Year', value: '2024' },
    ],
    storyline: {
      challenge: 'A dense institutional report needed a clearer public reading experience.',
      approach: 'I structured the content into responsive sections, visual summaries, and accessible reading patterns.',
      result: 'The project is useful as a compact glimpse of accessible report publishing, not a long product case study.',
    },
  },

  /* ── Creative Technology ── */
  {
    slug: 'jugalbandi',
    name: 'Jugalbandi',
    image: '/Assets/mockups/projects/jugalbandi_16x9.webp',
    cardMockupSource: '/Assets/mockups/projects/jugalbandi_16x9.webp',
    tag: 'ML + MUSIC',
    year: '2024',
    desc: 'Neural network instrument that duets with human musicians — Maker Faire 2024',
    category: 'creative',
    page: () => import('../pages/projects/JugalbandiPage'),
    featured: true,
    featuredOrder: 4,
    tier: 's',
    selected: true,
    selectedOrder: 8,
    summaryProblem: 'Most neural network art stays abstract; I wanted people to hear computation through real acoustic mechanisms.',
    summaryRole: 'Interaction designer and fabricator across concept, behavior, electronics, and installation.',
    summaryTeam: 'Solo project with mentorship support through NYU ITP.',
    summaryTimeline: '5 months in 2024',
    summaryOutcome: 'Exhibited at the ITP Spring Show and Maker Faire Coney Island as a playable human-machine duet.',
    summaryImage: '/Assets/Projects/Jugalbandi/Photos/755.png',
    summaryImageAlt: 'Jugalbandi Hexa-18 instrument showing the acoustic-mechanical neural network layers.',
    summaryStats: [
      { label: 'Build duration', value: '5 months' },
      { label: 'Sound families', value: '3' },
      { label: 'Exhibitions', value: '2' },
      { label: 'Instrument scale', value: '1.2m tall' },
    ],
    hoverMedia: {
      src: '/Assets/Projects/Jugalbandi/Photos/755.png',
      alt: 'Jugalbandi installation performance view.',
    },
    storyline: {
      challenge: 'AI music collaborations often feel like novelty unless the machine responds with enough nuance to sustain a real duet.',
      approach: 'I built the instrument around human improvisation, giving the neural system a performable role instead of a decorative one.',
      result: 'The case study demonstrates interaction design beyond screens, where behavior, timing, and embodiment carry the experience.',
    },
  },
  {
    slug: 'vj-software',
    name: 'VJ Parivar',
    image: `${IMG}/vj.jpg`,
    tag: 'UX DESIGN',
    year: '2022',
    desc: 'Reframed residential parking as a spatial decision instead of a back-office booking flow',
    category: 'ux',
    secondaryCategories: ['research'],
    page: () => import('../pages/projects/VjSoftwarePage'),
    archiveOrder: 18,
    tier: 'b',
    summaryProblem: 'Residential parking is a spatial problem disguised as admin work, and existing society apps buried that experience inside generic management dashboards.',
    summaryRole: 'UI/UX designer across research, parking-flow strategy, interactive map concepts, wireframes, and high-fidelity prototypes.',
    summaryTeam: 'Worked with UX lead Akshita Anand for Vilas Javdekar.',
    summaryTimeline: '3 months in 2022',
    summaryOutcome: 'Reframed parking selection around map-first decision making, helping residents understand the society layout before they booked.',
    summaryStats: [
      { label: 'Duration', value: '3 months' },
      { label: 'Core flow', value: 'Parking booking' },
      { label: 'Research inputs', value: '2 personas' },
      { label: 'Client', value: 'VJ' },
    ],
    storyline: {
      challenge: 'Residents were making parking decisions without enough spatial context, which made a high-stakes housing task feel like paperwork.',
      approach: 'I moved the flow toward maps, layout awareness, and clearer comparison so residents could understand the physical choice before booking.',
      result: 'The project shows how a narrow admin flow can become better UX when the real decision model is made visible.',
    },
  },
  {
    slug: 'enigma',
    name: 'Enigma',
    image: '/Assets/mockups/projects/enigma_16x9.webp',
    cardMockupSource: '/Assets/mockups/projects/enigma_16x9.webp',
    tag: 'DEEP LEARNING',
    year: '2023',
    desc: '200-neuron light sculpture visualizing a functioning neural network',
    category: 'creative',
    page: () => import('../pages/projects/EnigmaPage'),
    archiveOrder: 10,
    tier: 'a',
    summaryProblem: 'Neural networks are usually explained through diagrams or code, which makes their behavior feel distant from the body.',
    summaryRole: 'Creative technologist designing the sculpture, light behavior, interaction logic, and exhibition story.',
    summaryTeam: 'Independent creative technology project at NYU ITP.',
    summaryTimeline: '2023',
    summaryOutcome: 'Built a 200-neuron light sculpture that made network activity spatial, visible, and easier to discuss in person.',
    summaryStats: [
      { label: 'Neurons modeled', value: '200' },
      { label: 'Medium', value: 'Light sculpture' },
      { label: 'Core topic', value: 'Deep learning' },
      { label: 'Context', value: 'NYU ITP' },
    ],
    storyline: {
      challenge: 'A functioning neural network is hard to understand when it only exists as math, diagrams, or software output.',
      approach: 'I translated the model into a physical light system where activation, connection, and response could be seen across a sculptural object.',
      result: 'The project makes machine learning tangible and gives the portfolio a strong bridge between AI systems and embodied experience.',
    },
  },
  {
    slug: 'shuffle',
    name: 'Shuffle',
    image: '/Assets/mockups/projects/shuffle_16x9.webp',
    cardMockupSource: '/Assets/mockups/projects/shuffle_16x9.webp',
    tag: 'INTERACTIVE',
    year: '2023',
    desc: 'Motorised-slider board where balancing student life becomes a zero-sum game',
    category: 'creative',
    page: () => import('../pages/projects/ShufflePage'),
    archiveOrder: 12,
    tier: 'b',
    summaryProblem: 'Student-life balance is usually discussed as advice, but the trade-offs are physical, constrained, and zero-sum.',
    summaryRole: 'Interaction designer and fabricator creating the motorized slider board, system logic, and exhibition interaction.',
    summaryTeam: 'Independent physical-computing project at NYU ITP.',
    summaryTimeline: '2023',
    summaryOutcome: 'Built an embodied system where changing one priority physically affected the others, making the invisible trade-off legible.',
    summaryStats: [
      { label: 'Medium', value: 'Motor sliders' },
      { label: 'Interaction', value: 'Zero-sum' },
      { label: 'Core theme', value: 'Balance' },
      { label: 'Context', value: 'Physical computing' },
    ],
    storyline: {
      challenge: 'Time trade-offs in graduate school are invisible until something breaks.',
      approach: 'I built a board of motorised faders where pushing one part of your life up physically drags the others down.',
      result: 'It positions the project as embodied systems design, where the interface enforces the trade-off instead of displaying it.',
    },
  },
  {
    slug: 'making-of-time',
    name: 'Making of Time',
    image: '/Assets/Projects/making-of-time/photos/blue-dial-hero.webp',
    tag: 'PHYSICAL COMPUTING',
    year: '2024',
    desc: 'Built three timekeeping systems, from sundial to mechanical watch to software clock',
    category: 'creative',
    page: () => import('../pages/projects/MakingOfTimePage'),
    archiveOrder: 13,
    tier: 'b',
    summaryProblem: 'Timekeeping is treated as a solved interface, but its meaning changes when it is built through shadow, mechanics, and software.',
    summaryRole: 'Designer and builder creating three connected timekeeping artifacts across physical computing, fabrication, and interface design.',
    summaryTeam: 'Independent fabrication and interaction study at NYU ITP.',
    summaryTimeline: '2024',
    summaryOutcome: 'Built a sundial, mechanical watch study, and software clock to compare how materials change the way time is perceived.',
    summaryStats: [
      { label: 'Artifacts', value: '3' },
      { label: 'Media', value: 'Sun + gear + code' },
      { label: 'Focus', value: 'Perception' },
      { label: 'Context', value: 'NYU ITP' },
    ],
    storyline: {
      challenge: 'Clock interfaces often hide the systems that make time visible, which makes time feel abstract and automatic.',
      approach: 'I rebuilt time through three mediums so shadow, mechanism, and code could each expose a different relationship to measurement.',
      result: 'The project shows process range and turns a familiar object into a study of material, precision, and perception.',
    },
  },
  {
    slug: 'sea-of-salt',
    name: 'Why the Sea is Salt',
    image: '/Assets/Projects/sea-of-salt/photos/salt-ground.webp',
    tag: 'STORYTELLING MACHINE',
    year: '2024',
    desc: 'A salt mill grinds real salt as you advance through a Norse folktale — story as physical material',
    category: 'creative',
    page: () => import('../pages/projects/SeaOfSaltPage'),
    archiveOrder: 22,
    tier: 'b',
    summaryProblem: 'Stories usually stay mental. I wanted a folktale where moving through the narrative would leave a visible physical cost in the room.',
    summaryRole: 'Co-created and fabricated the storytelling machine, interaction logic, salt mechanism, and exhibition behavior.',
    summaryTeam: 'Collaboration with Audrey Oh through Storytelling at NYU ITP.',
    summaryTimeline: '2024',
    summaryOutcome: 'Built a machine that literally grinds salt as the story advances, turning narrative consequence into residue visitors can see and touch.',
    summaryStats: [
      { label: 'Narrative device', value: '1 slider' },
      { label: 'Physical output', value: 'Real salt' },
      { label: 'Core medium', value: 'Story + machine' },
      { label: 'Setting', value: 'Storytelling' },
    ],
    storyline: {
      challenge: 'Folktales are often consumed passively, which makes their material richness disappear.',
      approach: 'I made the act of reading physical by linking the Norse story to grinding real salt as the narrative unfolds.',
      result: 'This is strong interaction storytelling because the medium carries the metaphor, not just the text.',
    },
  },

  {
    slug: 'flow-fields',
    name: 'Flow Fields',
    image: `${IMG}/flow-fields.svg`,
    tag: 'GENERATIVE ART',
    year: '2024',
    desc: 'Perlin noise flow fields — 2000 particles creating organic, ever-changing patterns',
    category: 'creative',
    page: () => import('../pages/projects/FlowFieldsPage'),
    archiveOrder: 14,
    tier: 'd',
    summaryProblem: 'A vector field is invisible until something moves through it, which makes the underlying system hard to read.',
    summaryRole: 'Creative coder tuning the particle system, motion behavior, and visual constraints.',
    summaryTeam: 'Independent generative-art study.',
    summaryTimeline: '2024',
    summaryOutcome: 'Built a compact sketch where particle trails reveal the hidden motion structure without extra explanation.',
    storyline: {
      challenge: 'Make an abstract generative system feel legible instead of decorative.',
      approach: 'Used Perlin noise, particle density, trail opacity, and reset timing to expose the field through motion.',
      result: 'A small but useful study in turning invisible rules into visible behavior.',
    },
  },
  {
    slug: 'embodied-web',
    name: 'Embodied Web',
    image: `${IMG}/embodied-web.svg`,
    tag: 'WEB EXPERIMENTS',
    year: '2023',
    desc: "Practice notes on breath, pose, tilt, proximity, and silhouette as browser inputs.",
    category: 'creative',
    page: () => import('../pages/projects/EmbodiedWebPage'),
    archiveOrder: 33,
    tier: 'd',
    summaryProblem: 'Most web interfaces assume a cursor, even though modern browsers can sense cameras, motion, audio, and physical context.',
    summaryRole: 'Creative technologist prototyping body-based browser interactions.',
    summaryTeam: 'NYU ITP experimental coursework.',
    summaryTimeline: '2023',
    summaryOutcome: "Recorded five input studies. Original running sketches are unavailable.",
    storyline: {
      challenge: 'Move web interaction beyond point-and-click without making the experience hard to understand.',
      approach: 'Built small experiments around familiar body actions so the input model felt immediately readable.',
      result: 'The work fed later thinking about embodied interaction, wearable UX, and interfaces that respect physical context.',
    },
  },
  {
    slug: 'feeling-patterns',
    name: 'Feeling Patterns',
    image: `${IMG}/feeling-patterns.svg`,
    tag: 'WEARABLE HAPTICS',
    year: '2023',
    desc: "Practice notes on pulse, vibration, and pressure as tactile signals.",
    category: 'creative',
    page: () => import('../pages/projects/FeelingPatternsPage'),
    archiveOrder: 34,
    tier: 'd',
    summaryProblem: 'Screen-based communication carries words and images, but it leaves out pressure, rhythm, and touch.',
    summaryRole: 'Designer and fabricator exploring haptic wearable patterns.',
    summaryTeam: 'NYU ITP wearable-tech coursework.',
    summaryTimeline: '2023',
    summaryOutcome: "Recorded tactile study concepts; original prototype photographs, recordings and recognition tests are unavailable.",
    storyline: {
      challenge: 'Design a communication vocabulary for the body without relying on a screen.',
      approach: 'Tested sleeves, vests, and pressure pads to learn which tactile patterns people could distinguish and remember.',
      result: 'The project sharpened how I think about subtle notification systems for wearable interfaces.',
    },
  },
  {
    slug: 'performance-by-design',
    name: 'Performance by Design',
    image: `${IMG}/drowning.jpg`,
    tag: 'EXPERIENCE DESIGN',
    year: '2023',
    desc: "Practice notes on lighting, spatial cues, and audience attention.",
    category: 'creative',
    page: () => import('../pages/projects/PerformanceByDesignPage'),
    archiveOrder: 35,
    tier: 'd',
    summaryProblem: 'Live experiences depend on invisible systems of timing, light, sound, and audience flow that only become obvious when they fail.',
    summaryRole: 'Experience designer studying performance systems and spatial cues.',
    summaryTeam: 'NYU ITP performance-design coursework.',
    summaryTimeline: '2023',
    summaryOutcome: "Recorded performance-design questions; original cue sheets and recordings are unavailable.",
    storyline: {
      challenge: 'Use non-screen design tools to guide attention in a room where every moment happens only once.',
      approach: 'Studied lighting cues, spatial choreography, audience movement, and reactive stage behavior as interface materials.',
      result: 'The project connects live-performance craft to digital product pacing and feedback design.',
    },
  },
  {
    slug: 'on-becoming',
    name: 'On Becoming',
    image: `${IMG}/on-becoming.svg`,
    tag: 'WRITING',
    year: '2024',
    desc: 'A reflective design journal on identity, craft, and evolving from designer to design engineer',
    category: 'creative',
    page: () => import('../pages/projects/OnBecomingPage'),
    archiveOrder: 36,
    tier: 'd',
    summaryProblem: 'My portfolio spanned fintech, physical computing, AI, and installation work, but without a clear throughline it could read as range without conviction.',
    summaryRole: 'Writer and reflective editor, using the essay to define the core question underneath the broader body of work.',
    summaryTeam: 'Independent written piece developed through critique and discussion at NYU ITP.',
    summaryTimeline: '2024',
    storyline: {
      challenge: 'The work crossed product design, physical computing, writing, and performance without an obvious shared frame.',
      approach: 'I traced the recurring method across projects: choose a medium that makes an invisible system tangible through the body.',
      result: 'The essay defined a coherent practice built around translation layers, constraint, and embodied understanding.',
    },
    summaryOutcome: 'Distilled the portfolio into one consistent thesis: translating invisible systems into experiences people can understand through the body.',
  },
  {
    slug: 'storytelling',
    name: 'Storytelling',
    image: `${IMG}/storytelling.svg`,
    tag: 'NARRATIVE DESIGN',
    year: '2025',
    desc: "Practice notes on sequence, pacing, and consequences.",
    category: 'creative',
    page: () => import('../pages/projects/StorytellingPage'),
    archiveOrder: 37,
    tier: 'd',
    summaryProblem: 'A project can have good parts and still feel flat if the reader cannot follow the tension, choice, and consequence.',
    summaryRole: 'Narrative designer translating storytelling frameworks into product and case-study structure.',
    summaryTeam: 'Independent reflection through NYU ITP storytelling work.',
    summaryTimeline: '2025',
    summaryOutcome: "Recorded narrative questions; original drafts and revision records are unavailable.",
    storyline: {
      challenge: 'Make narrative useful for design work without turning every project into marketing copy.',
      approach: 'Studied pacing, sequence, tension, and framing, then applied those patterns to case-study structure.',
      result: 'The page explains the editorial method behind the portfolio: show why a decision mattered, not just what was made.',
    },
  },
  {
    slug: 'dna-speculative',
    name: 'DNA: Speculative Design',
    image: '/Assets/Projects/DNA/photos/boxes-closed.webp',
    tag: 'BIOART',
    year: '2024',
    desc: 'Would you take a pill to live forever? Speculative pharmaceutical packaging exploring immortality and mortality',
    category: 'creative',
    page: () => import('../pages/projects/DnaPage'),
    archiveOrder: 38,
    tier: 'c',
    summaryProblem: 'Speculative design often stays too abstract to provoke a real decision, especially when the subject is as loaded as mortality.',
    summaryRole: 'Created the concept, physical packaging system, booklet narrative, and the full participant choice ritual.',
    summaryTeam: 'Independent speculative design project at NYU ITP.',
    summaryTimeline: '2024',
    summaryOutcome: 'Created fictional pharmaceutical packaging that frames a choice about immortality. Audience responses were not documented.',
    summaryStats: [
      { label: 'Choice frame', value: '2 paths' },
      { label: 'Medium', value: 'Packaging' },
      { label: 'Core theme', value: 'Mortality' },
      { label: 'Context', value: 'Bioart' },
    ],
    storyline: {
      challenge: 'A question as large as immortality can become too abstract unless people are forced into a concrete choice.',
      approach: 'I designed the speculative pharmaceutical packaging, booklet, and decision ritual so the concept felt plausible enough to unsettle participants.',
      result: 'The project works because the artifact carries the argument: people do not just read about mortality, they have to choose a version of it.',
    },
  },
  {
    slug: 'comp-media',
    name: 'Computational Media',
    image: `${IMG}/comp-media.svg`,
    tag: 'CREATIVE CODING',
    year: '2023',
    desc: 'Camera-pixel painting with 200 wandering particles, restored from the original p5.js coursework',
    category: 'creative',
    page: () => import('../pages/projects/IntroCompMediaPage'),
    archiveOrder: 38,
    tier: 'd',
    summaryProblem: 'Static design tools could not teach the behavior of systems that change, react, and generate variation over time.',
    summaryRole: 'Creative coder building weekly p5.js sketches.',
    summaryTeam: 'NYU ITP computational-media coursework.',
    summaryTimeline: '2023',
    summaryOutcome: 'Built a foundation in code-driven interaction that later supported generative art, simulations, and portfolio prototypes.',
    storyline: {
      challenge: 'Learn to think with rules, loops, randomness, and input instead of fixed visual compositions.',
      approach: 'Used weekly sketches to turn programming concepts into visible, interactive experiments.',
      result: 'The project marks the shift from designing static screens to designing responsive systems.',
    },
  },
  {
    slug: 'hypercinema',
    name: 'Hypercinema',
    image: `${IMG}/hypercinema.svg`,
    tag: 'IMMERSIVE MEDIA',
    year: '2023',
    desc: "Practice notes on viewer-directed film, spatial sound, and projection.",
    category: 'creative',
    page: () => import('../pages/projects/HypercinemaPage'),
    archiveOrder: 39,
    tier: 'd',
    summaryProblem: 'Immersive media can overwhelm people when every screen, speaker, or viewpoint competes for attention.',
    summaryRole: 'Designer experimenting with spatial narrative, 360 video, and multi-screen projection.',
    summaryTeam: 'NYU ITP immersive-media coursework.',
    summaryTimeline: '2023',
    summaryOutcome: "Recorded three film and sound studies; original playable material is unavailable.",
    storyline: {
      challenge: 'Create immersive experiences that feel navigable instead of simply expanded.',
      approach: 'Worked with 360 footage, spatial sound, and projection layouts as narrative architecture.',
      result: 'The project shaped later installation work where space, attention, and pacing carry the story.',
    },
  },
  {
    slug: 'applications',
    name: 'Applications',
    image: `${IMG}/applications.svg`,
    tag: 'FULL-STACK',
    year: '2023',
    desc: "Practice notes on collaborative storytelling and campus mood-map concepts.",
    category: 'creative',
    page: () => import('../pages/projects/ApplicationsPage'),
    archiveOrder: 40,
    tier: 'd',
    summaryProblem: 'Design ideas stay abstract until real users, data, deployment constraints, and failure modes touch them.',
    summaryRole: 'Designer and developer exploring interface states and shared-data requirements.',
    summaryTeam: 'NYU ITP applications coursework.',
    summaryTimeline: '2023',
    summaryOutcome: "Recorded application concepts and implementation questions. Original deployed builds and usage records are unavailable.",
    storyline: {
      challenge: 'Move from polished concepts to usable software with real constraints.',
      approach: 'Examined contributions, persistence, moderation, and recovery as application-design requirements.',
      result: 'The work strengthened the link between design intent, code reality, and product usefulness.',
    },
  },
  {
    slug: 'messy-humans',
    name: 'Designing for Messy Humans',
    image: `${IMG}/messy-humans.svg`,
    tag: 'INCLUSIVE DESIGN',
    year: '2023',
    desc: "Practice notes on attention, anxiety, language, and access.",
    category: 'good',
    page: () => import('../pages/projects/MessyHumansPage'),
    archiveOrder: 41,
    tier: 'd',
    summaryProblem: 'Personas and happy paths often erase the emotional, situational, and accessibility needs that shape real product use.',
    summaryRole: 'Researcher and designer exploring inclusive edge cases.',
    summaryTeam: 'Independent inclusive-design study.',
    summaryTimeline: '2023',
    summaryOutcome: "Collected interface-review prompts, not a comparative study or accessibility certification.",
    storyline: {
      challenge: 'Design for people as they are, not as clean diagrams or ideal users.',
      approach: 'Studied edge cases, emotional states, and access needs as primary inputs rather than exceptions.',
      result: 'The project keeps inclusive design present across later UX work without overstating a small study.',
    },
  },
  {
    slug: 'production-studio',
    name: 'Production Studio',
    image: `${IMG}/black-hole.jpg`,
    tag: 'TEAM LEADERSHIP',
    year: '2024',
    desc: "Practice notes on scope, integration, handoffs, and exhibition preparation.",
    category: 'creative',
    page: () => import('../pages/projects/ProductionStudioPage'),
    archiveOrder: 42,
    tier: 'd',
    summaryProblem: 'A large public installation can fail from scope, timing, and team coordination even when the concept is strong.',
    summaryRole: 'Team lead coordinating concept, build scope, critique, and show-readiness.',
    summaryTeam: 'Five-person NYU ITP production studio team.',
    summaryTimeline: '2024',
    summaryOutcome: "Recorded production questions; the named installation, original show documentation, and operational logs remain unavailable.",
    storyline: {
      challenge: 'Turn an ambitious collaborative installation into something stable enough for a public show.',
      approach: 'Used tighter scope, clearer roles, and production checkpoints to keep the build moving.',
      result: 'These are production practice notes; a complete build account requires the named installation and original operating records.',
    },
  },

  {
    slug: 'arcade-lab',
    name: 'Arcade Lab',
    image: '/Assets/mockups/projects/arcade-lab.webp',
    tag: 'GAME PROTOTYPING',
    year: '2023',
    desc: "Practice notes on physical-controller prototypes leading toward The Omakase.",
    category: 'install',
    page: () => import('../pages/projects/ArcadeLabPage'),
    archiveOrder: 27,
    tier: 'd',
    summaryProblem: 'Physical game ideas can be charming in prototype form but break down quickly when rules, controls, and social dynamics are unclear.',
    summaryRole: 'Game prototyper exploring physical controllers and party mechanics.',
    summaryTeam: 'NYU ITP arcade/game prototyping work.',
    summaryTimeline: '2023',
    summaryOutcome: "Recorded four early controller concepts. Original recordings and comparative playtest results are unavailable.",
    storyline: {
      challenge: 'Find which physical game mechanics were actually readable and replayable.',
      approach: 'Built quick prototypes, tested the control feel, and kept the strongest social mechanics.',
      result: 'The page works as a glimpse into process behind the more complete Omakase project.',
    },
  },

  /* ── Installations ── */
  {
    slug: 'black-hole',
    name: 'Black Hole',
    image: `${IMG}/black-hole.jpg`,
    tag: 'SCIENCE + FABRICATION',
    year: '2025',
    desc: 'Five physical models of black hole phenomena — exhibited at Horological Society of NY',
    category: 'install',
    page: () => import('../pages/projects/BlackHolePage'),
    archiveOrder: 2,
    tier: 'a',
    selected: true,
    selectedOrder: 10,
    summaryProblem: 'Black hole phenomena are intellectually famous but physically unintuitive, which makes most explanations memorable as trivia instead of understanding.',
    summaryRole: 'Designed and fabricated the full set of physical models, interactives, and exhibition-ready storytelling surfaces.',
    summaryTeam: 'Built with applied mathematics collaboration from Saee Joshi and mentorship from Jeffrey J Feddersen.',
    summaryTimeline: '2025',
    summaryOutcome: 'Turned five astrophysics concepts into tangible experiences for museum exhibition, making time dilation, lensing, and mergers legible through form.',
    summaryImage: '/Assets/Projects/black-hole-assets/time-trap.jpg',
    summaryImageAlt: 'Black Hole installation showing the time dilation physical model.',
    summaryStats: [
      { label: 'Phenomena modeled', value: '5' },
      { label: 'Interactive pieces', value: '3' },
      { label: 'Exhibition', value: 'HSNY' },
      { label: 'Disciplines', value: 'Science + build' },
    ],
    storyline: {
      challenge: 'Astrophysics concepts like lensing and time dilation are powerful, but they remain abstract for most audiences.',
      approach: 'I built five physical models that let people encounter black hole behavior through form, mechanism, and observation.',
      result: 'The project demonstrates that I can make complex science legible through fabrication and exhibition design.',
    },
  },
  {
    slug: 'uv-light',
    name: 'UV Light',
    image: `${IMG}/uv-light.jpg`,
    tag: 'LIGHT ART',
    year: '2023',
    desc: 'Multi-room blacklight installation with hidden messages and live projection',
    category: 'install',
    page: () => import('../pages/projects/UvLightPage'),
    archiveOrder: 8,
    tier: 'b',
    summaryProblem: 'An installation about surveillance and hidden information would fail if it explained itself too early or too literally.',
    summaryRole: 'Designed the spatial concept, participant flow, blacklight environments, and the interaction reveal logic.',
    summaryTeam: 'Collaborative installation at NYU ITP with artist collaborators.',
    summaryTimeline: '2 weeks in 2023',
    summaryOutcome: 'Built a blacklight experience where discovery, observation, and hidden messages made the theme land through participation instead of explanation.',
    summaryStats: [
      { label: 'Build time', value: '2 weeks' },
      { label: 'Primary medium', value: 'UV space' },
      { label: 'Interaction mode', value: 'Discovery' },
      { label: 'Theme', value: 'Observation' },
    ],
    storyline: {
      challenge: 'A project about hidden information needed visitors to discover the theme physically rather than be told what it meant.',
      approach: 'I used blacklight, spatial sequencing, and reveal mechanics to make participants move through layers of visibility and observation.',
      result: 'The installation turned surveillance and discovery into a room-scale interaction, giving the concept a clear experiential hook.',
    },
  },
  {
    slug: 'the-omakase',
    name: 'The Omakase',
    image: '/Assets/mockups/projects/the-omakase_16x9.webp',
    cardMockupSource: '/Assets/mockups/projects/the-omakase_16x9.webp',
    tag: 'ARCADE GAME',
    year: '2024',
    desc: '2-player sushi arcade cabinet — custom RGB controllers, exhibited at ITP + WonderVille',
    category: 'install',
    page: () => import('../pages/projects/TheOmakasePage'),
    archiveOrder: 20,
    tier: 'a',
    selected: true,
    selectedOrder: 12,
    summaryProblem: 'Most arcade games treat the cabinet as packaging, when the physical build should shape the ritual, timing, and tension of the game itself.',
    summaryRole: 'Co-designed the game with Jane Liu and Shimeng Zhou; built the cabinet with Jane Liu.',
    summaryTeam: 'Jane Liu, Shimeng Zhou and Parth Pawar. Game development by Jane and Shimeng; cabinet by Parth and Jane.',
    summaryTimeline: '2024',
    summaryOutcome: 'Built a two-player sushi arcade cabinet exhibited at ITP and WonderVille, where the hardware and social pacing became the game logic.',
    summaryImage: '/Assets/Projects/the-omakase/photos/cabinet-front.webp',
    summaryImageAlt: 'The Omakase arcade cabinet photographed from the front.',
    summaryStats: [
      { label: 'Players', value: '2' },
      { label: 'Exhibitions', value: '2' },
      { label: 'Inputs', value: '16 keys' },
      { label: 'Format', value: 'Custom cabinet' },
    ],
    storyline: {
      challenge: 'Most indie arcade games treat the cabinet as a container, not as part of the game logic.',
      approach: 'I designed the controllers, feedback, and pacing together so the physical build shaped the competitive sushi ritual.',
      result: 'The project proves I can choreograph interaction across software, hardware, and social play.',
    },
  },
  {
    slug: 'revolving-stage',
    name: 'Revolving Stage',
    image: `${IMG}/revolving-stage.webp`,
    tag: 'FABRICATION',
    year: '2022',
    desc: 'Engineered a 15-foot rotating theatre stage built to carry performers and scenery safely',
    category: 'install',
    page: () => import('../pages/projects/RevolvingStagePage'),
    archiveOrder: 11,
    tier: 'b',
    summaryProblem: 'The production needed one stage device that could shift scenes quickly in full view of the audience without sacrificing actor safety or structural stability.',
    summaryRole: 'Designed and engineered the rotating platform, axle system, and stage behavior for live performance.',
    summaryTeam: 'Theatre fabrication project built with production collaborators.',
    summaryTimeline: '2022',
    summaryOutcome: 'Built a 15 ft. revolving stage around a 250 kg design-load target and scene changes without blackout. An independent load-test record is not available.',
    summaryImage: '/Assets/Projects/RevolvingStage/photos/isometric-stage.png',
    summaryImageAlt: 'Isometric revolving stage rendering showing the rotating platform and staged scene.',
    summaryStats: [
      { label: 'Platform diameter', value: '15 ft' },
      { label: 'Load target', value: '250+ kg' },
      { label: 'Build window', value: '3 mo' },
      { label: 'Format', value: 'Live theatre' },
    ],
    storyline: {
      challenge: 'The show needed fast scenic transitions, but the mechanism had to be safe, stable, and reliable under live performance pressure.',
      approach: 'I engineered the rotating platform around load, axle behavior, performer movement, and stage timing instead of treating it as a decorative set piece.',
      result: 'The project demonstrates practical fabrication judgment: a large moving object worked as both stage infrastructure and storytelling tool.',
    },
  },
  {
    slug: 'moniac-machine',
    name: 'Moniac Machine',
    image: '/Assets/Projects/Moniac/photos/hero-cabinet.png',
    cardMockupSource: '/Assets/Projects/Moniac/photos/original-moniac.png',
    tag: 'GAME DESIGN',
    year: '2024',
    desc: 'Turned a 1949 hydraulic economic computer into a playable strategy game about systems',
    category: 'install',
    page: () => import('../pages/projects/MoniacMachinePage'),
    archiveOrder: 15,
    tier: 'b',
    summaryProblem: 'Economic systems are hard to feel because they are usually explained through abstract flows, charts, and policy language.',
    summaryRole: 'Game designer and interaction designer translating the MONIAC computer into playable mechanics and a physical-digital learning experience.',
    summaryTeam: 'Independent game and systems design project at NYU ITP.',
    summaryTimeline: '2024',
    summaryOutcome: 'Turned a historical hydraulic computer into a strategy game where players could experiment with cause, effect, and system feedback.',
    summaryStats: [
      { label: 'Policy levers', value: '7' },
      { label: 'Round length', value: '60s' },
      { label: 'Source system', value: '1949 MONIAC' },
      { label: 'Medium', value: 'Game' },
    ],
    storyline: {
      challenge: 'The original MONIAC made economics visible with water, but contemporary audiences needed a playable way into the system.',
      approach: 'I converted the machine logic into game rules, feedback loops, and cabinet-like interaction so players could test decisions rather than read a diagram.',
      result: 'The project reframes economic education as systems play, making feedback and trade-offs easier to understand.',
    },
  },
  {
    slug: 'dumb-waiter-set-design',
    name: "Set Design for Pinter's The Dumb Waiter",
    image: '/Assets/Projects/dumb-waiter/photos/card-4x5.jpg',
    cardMockup: '/Assets/Projects/dumb-waiter/photos/card-4x5.jpg',
    cardMockupSquare: '/Assets/Projects/dumb-waiter/photos/card-1x1.jpg',
    cover16x9: '/Assets/Projects/dumb-waiter/photos/cover-16x9.jpg',
    cardMockupSource: '/Assets/Projects/dumb-waiter/photos/ben-gus-wall.jpg',
    cardMockupAlt: "Scenic model for Pinter's The Dumb Waiter showing two hitmen in a dark basement room.",
    tag: 'SCENIC DESIGN',
    year: '2024',
    desc: 'John Wick-inspired basement set model for Pinter\'s one-act play about two hitmen waiting for orders',
    category: 'install',
    page: () => import('../pages/projects/DumbWaiterPage'),
    archiveOrder: 26,
    tier: 'b',
    summaryProblem: 'The play depends on waiting, invisible authority, and small talk turning dangerous, so the room had to feel ordinary and threatening at once.',
    summaryRole: 'Set designer building the scenic concept, spatial model, prop system, and visual tone.',
    summaryTeam: 'Independent theatre set design model based on Harold Pinter\'s one-act play.',
    summaryTimeline: '2024',
    summaryOutcome: 'Built a cinematic basement model where the dumb waiter, weapons wall, beds, and thresholds make the unseen system feel present.',
    summaryImage: '/Assets/Projects/dumb-waiter/photos/ben-gus-wall.jpg',
    summaryImageAlt: 'Close scenic model view of Ben and Gus inside the Dumb Waiter basement room.',
    summaryStats: [
      { label: 'Format', value: 'Scale model' },
      { label: 'Rooms implied', value: '3' },
      { label: 'Core tension', value: 'Waiting' },
      { label: 'Visual tone', value: 'Noir action' },
    ],
    storyline: {
      challenge: 'Pinter keeps the real power offstage, so the design needed to make an invisible command structure feel physically present.',
      approach: 'I used a John Wick-influenced basement language: black walls, warm wood, weapon displays, tight doorways, and a dumb waiter as the room\'s control point.',
      result: 'The set turns a waiting room into a pressure chamber where every object points back to hierarchy, obedience, and the final threat.',
    },
  },
  {
    slug: 'drowning',
    name: 'Drowning',
    image: `${IMG}/drowning.jpg`,
    tag: 'SCENIC DESIGN',
    year: '2024',
    desc: 'Greenhouse scenic scale model and lighting boards for a theatre design study',
    category: 'install',
    page: () => import('../pages/projects/DrowningPage'),
    archiveOrder: 28,
    tier: 'd',
    summaryProblem: 'A theatre set needed to create atmosphere while staying safe, navigable, and reliable during performance.',
    summaryRole: 'Scenic designer developing a scale model, material studies, and lighting boards.',
    summaryTeam: 'NYU theatre production context.',
    summaryTimeline: '2024',
    summaryOutcome: 'Built a greenhouse scale model and scene boards to explore atmosphere and lighting. Full-scale construction and backstage operation were not verified.',
    storyline: {
      challenge: 'Make a low-light scenic environment expressive without making it unsafe or fragile.',
      approach: 'Explored layered materials, lighting, and performer movement through a scale model and scene boards.',
      result: 'The project shows spatial design judgment under live-performance constraints.',
    },
  },
  {
    slug: 'sculpture',
    name: 'Sculpture',
    image: '/Assets/Projects/Sculpture/1.jpg',
    tag: 'SCULPTURE',
    year: '2020',
    desc: 'Competition sculpture glimpse from beginner practice to finished piece',
    category: 'install',
    page: () => import('../pages/projects/SculpturePage'),
    archiveOrder: 31,
    tier: 'd',
    summaryProblem: 'I needed to learn figurative sculpture quickly enough to compete with a finished physical piece.',
    summaryRole: 'Sculptor working across anatomy study, armature building, plaster/clay form, and final finish.',
    summaryTeam: 'Firodia Karandak competition sculpture work in Pune.',
    summaryTimeline: 'Dec 2019 to Mar 2022',
    summaryOutcome: 'Finished a competition sculpture that shows early hands-on range, material patience, and physical making discipline.',
    summaryStats: [
      { label: 'Context', value: 'Firodia' },
      { label: 'Medium', value: 'Sculpture' },
      { label: 'Focus', value: 'Anatomy + form' },
      { label: 'Role', value: 'Sculptor' },
    ],
    storyline: {
      challenge: 'Starting with little sculpture experience meant the project had to be learned through repeated material practice.',
      approach: 'I studied anatomy, built armatures, tested failed forms, and refined the final figure through hands-on correction.',
      result: 'This stays as a compact archive glimpse: useful proof of making ability, not a lead case study.',
    },
  },

  /* ── Brand & Visual ── */
  {
    slug: 'mentra-brand',
    name: 'Mentra Brand & Packaging',
    image: '/Assets/Projects/mentra-brand/photos/render-both-frames.webp',
    cardMockupSource: '/Assets/Projects/mentra-brand/photos/product-flat.webp',
    tag: 'BRAND & PACKAGING',
    year: '2025–26',
    desc: 'Brand identity and packaging for AI smart glasses: logo, box, booklet, ads, and 24 social templates',
    category: 'brand',
    page: () => import('../pages/projects/MentraBrandPage'),
    archiveOrder: 4,
    tier: 'a',
    selected: true,
    selectedOrder: 11,
    summaryProblem: 'A new hardware brand has to earn trust before anyone puts the product on, which means packaging, identity, and launch surfaces all have to work as one system.',
    summaryRole: 'Sole designer across logo, packaging, printed matter, render library, social templates, and advertising.',
    summaryTeam: '1 designer working across hardware, product, operations, and manufacturing partners.',
    summaryTimeline: 'Q3 2025 to 2026',
    summaryOutcome: 'Shipped a full brand system into customers’ hands, from retail box and booklet to launch assets and creator-ready templates.',
    summaryImage: '/Assets/Projects/mentra-brand/photos/render-both-frames.webp',
    summaryImageAlt: 'Mentra brand hero showing both smart-glasses frame variants.',
    summaryStats: [
      { label: 'Packaging iterations', value: '7' },
      { label: 'Booklet rounds', value: '4' },
      { label: 'Social templates', value: '24' },
      { label: 'Render families', value: '3' },
    ],
    storyline: {
      challenge: 'New hardware brands need to earn trust before the product is even in someone’s hand.',
      approach: 'I designed the identity, packaging, printed matter, and launch assets as one coherent system around clarity, confidence, and restraint.',
      result: 'It shows I can carry a product story from industrial object to shelf experience to launch surface.',
    },
  },
  {
    slug: 'tedx',
    name: 'TEDxVITPune',
    image: '/Assets/images/tedx.jpg',
    cardMockup: '/Assets/images/tedx.jpg',
    cardMockupAlt: 'TEDxVITPune stage: red TEDx letters and box-column skyline set with the red circular stage',
    tag: 'ART DIRECTION',
    year: '2021',
    desc: 'Sole stage designer on an 8-person team building a parallax cityscape stage for 800-plus attendees',
    category: 'brand',
    page: () => import('../pages/projects/TedxPage'),
    archiveOrder: 6,
    tier: 'a',
    summaryProblem: 'A large student conference needed a stage identity that could feel iconic in the room, photograph well, and stay buildable for a small stage team.',
    summaryRole: 'Art director and sole stage designer leading the visual concept, stage direction, production coordination, and execution.',
    summaryTeam: '8-person stage team for TEDxVITPune.',
    summaryTimeline: '2021',
    summaryOutcome: 'Delivered a parallax cityscape stage for 800-plus attendees, turning the event identity into a strong spatial experience.',
    summaryStats: [
      { label: 'Audience', value: '800+' },
      { label: 'Stage team', value: '8' },
      { label: 'Build span', value: '8 weeks' },
      { label: 'Role', value: 'Art director' },
    ],
    storyline: {
      challenge: 'The event needed a stage that could carry the TEDx identity at audience scale while still being buildable by a student team.',
      approach: 'I designed the stage system around layered cityscape forms, clear production guides, and a composition that worked both live and on camera.',
      result: 'The project shows leadership at scale: concept, team coordination, and physical execution all had to land together.',
    },
  },
  {
    slug: 'code-for-build',
    name: 'Code for Build',
    image: `${IMG}/code-for-build.jpg`,
    tag: 'UX DESIGN',
    year: '2021',
    desc: 'Mobile-first coding education concept using 3D building blocks',
    category: 'ux',
    page: () => import('../pages/projects/CodeForBuildPage'),
    archiveOrder: 24,
    tier: 'c',
    summaryProblem: 'A phone-only beginner learner needed a more visual way to understand HTML and CSS layout structure.',
    summaryRole: 'Interaction designer exploring lesson flow, block metaphors, mobile UI, and 3D visual explanation.',
    summaryTeam: 'Self-initiated education concept.',
    summaryTimeline: '2021',
    summaryOutcome: 'Created a mobile prototype concept where containers, padding, images, text, and buttons became stackable 3D blocks.',
    summaryStats: [
      { label: 'Audience', value: 'Teen learners' },
      { label: 'Method', value: '3D blocks' },
      { label: 'Scope', value: 'UX + brand' },
      { label: 'Duration', value: '3 mo' },
    ],
    storyline: {
      challenge: 'Coding lessons can feel abstract when the learner only has a phone and no desktop development environment.',
      approach: 'I mapped web-layout concepts to 3D blocks and paired each lesson with a preview of the resulting page structure.',
      result: 'The project is useful archive evidence of educational interaction thinking, best shown as a short glimpse.',
    },
  },
  {
    slug: 'typeface',
    name: "Butler's Slice",
    image: `${IMG}/typeface.webp`,
    tag: 'TYPE DESIGN',
    year: '2022',
    desc: 'Display typeface with geometric slice cuts: three supplied static weights, 338 glyphs per font',
    category: 'brand',
    page: () => import('../pages/projects/TypefacePage'),
    archiveOrder: 16,
    tier: 'b',
    summaryProblem: 'The typeface needed a distinctive display personality without becoming too decorative to use across a full glyph system.',
    summaryRole: 'Type designer developing the display concept, geometric slice logic, glyph set, spacing, and weight exploration.',
    summaryTeam: 'Independent type design project.',
    summaryTimeline: '2022',
    summaryOutcome: 'Developed a sliced geometric display family. The supplied UltraLight, Regular, and Bold fonts each contain 338 glyphs and have no variable-font axis.',
    summaryStats: [
      { label: 'Glyphs per font', value: '338' },
      { label: 'Weights', value: '3' },
      { label: 'Use case', value: 'Display' },
      { label: 'Tooling', value: 'Web specimen' },
    ],
    storyline: {
      challenge: 'Display type often gets attention through one-off letters, but a usable typeface needs the idea to survive across the full system.',
      approach: 'I developed a repeatable slice grammar, expanded it across hundreds of glyphs, and tested weight variation for consistency.',
      result: 'The project shows visual-system discipline at a small scale: one formal rule carried through a complete type artifact.',
    },
  },
  {
    slug: 'atps',
    name: 'ArtTown Podcast',
    image: `${IMG}/atps.webp`,
    tag: 'MEDIA',
    year: '2021',
    desc: 'Visual identity and motion graphics for an art and design podcast series',
    category: 'brand',
    page: () => import('../pages/projects/AtpsPage'),
    archiveOrder: 26,
    tier: 'd',
    summaryProblem: 'A podcast about art and design needed an identity that felt credible, flexible, and easy to reproduce across episodes.',
    summaryRole: 'Visual designer for identity, motion, and episode graphics.',
    summaryTeam: 'ArtTown podcast student media context.',
    summaryTimeline: '2021',
    summaryOutcome: 'Created a flexible visual system for an interview-led arts podcast.',
    storyline: {
      challenge: 'Give a recurring media series a recognizable system without overcomplicating production.',
      approach: 'Built reusable identity and motion patterns that could support weekly episode assets.',
      result: 'The project is a small brand-system glimpse from an earlier stage of practice.',
    },
  },
  {
    slug: 'vishwaconclave',
    name: 'VishwaConclave',
    image: '/Assets/Projects/VishwaConclave/1.jpg',
    tag: 'CREATIVE DIRECTION',
    year: '2021',
    desc: 'Creative direction, branding, and web design for a student conference',
    category: 'brand',
    page: () => import('../pages/projects/VishwaConclavePage'),
    archiveOrder: 29,
    tier: 'd',
    summaryProblem: 'A student conference needed a visual identity and web presence that could hold many speakers, sessions, and promotional moments.',
    summaryRole: 'Creative direction, branding, and web design.',
    summaryTeam: 'Student conference organizing team.',
    summaryTimeline: '2021',
    summaryOutcome: 'Delivered a conference identity and digital presence across event communications.',
    storyline: {
      challenge: 'Create a coherent public face for a multi-speaker student event.',
      approach: 'Aligned branding, visual direction, and web materials so the conference felt like one system.',
      result: 'The project stays as an early branding example with a concise story, not a long case study.',
    },
  },
  {
    slug: 'glassly',
    name: 'Glassly',
    image: '/Assets/Projects/Glassly/cover.webp',
    cardMockup: '/Assets/Projects/Glassly/cover.webp',
    cardMockupSquare: '/Assets/Projects/Glassly/cover.webp',
    cover16x9: '/Assets/Projects/Glassly/cover.webp',
    cardMockupAlt: 'Glassly identity with Even Realities G2 partner hardware',
    tag: 'WEARABLE PLATFORM',
    year: '2026',
    desc: 'A wearable-platform website, brand guide and illustrative phone-and-glasses demo',
    category: 'ai',
    page: () => import('../pages/projects/GlasslyPage'),
    archiveOrder: 100,
    summaryProblem: 'A wearable miniapp platform needs to explain what people can do, how the phone and glasses work together, and which hardware belongs to partner manufacturers.',
    summaryRole: 'Product storytelling, brand guidelines and website implementation.',
    summaryTimeline: '2026',
    summaryOutcome: 'An original website, six-scene illustrative phone-and-glasses demo and brand guidelines. The demo does not connect to hardware or establish live miniapp functionality.',
    summaryImage: '/Assets/Projects/Glassly/website-hero.webp',
    summaryImageAlt: 'Original Glassly website introducing the platform with attributed Even Realities G2 hardware',
    storyline: {
      challenge: 'Explain a wearable platform without confusing the software identity with its partner hardware.',
      approach: 'Lead with everyday miniapp use, show synchronized phone and glasses output, and apply one restrained brand system across the website.',
      result: 'The original website demo and visual rules explain the product story. Native hardware integration, adoption and conversion are not established here.',
    },
  },
]

export const projects = catalog.filter(project => projectSlugs.includes(project.slug))

for (const project of projects) {
  const publicPreview = project.access?.publicPreviewImage
  if (project.access?.mode === 'request' || project.nda) {
    project.cardMockup = publicPreview || project.cardMockup || project.cardMockupSource || project.image || NDA_COVER
    project.cardMockupAlt = project.access?.publicPreviewAlt || project.cardMockupAlt || `${project.name} public preview cover`
  } else {
    project.cardMockup ??= defaultCardMockup(project.slug)
    // Fold the tag into the fallback so screen readers get real context
    // instead of a generic "project mockup" on every card.
    project.cardMockupAlt ??= project.tag
      ? `${project.name} — ${project.tag} project cover`
      : `${project.name} project cover`
  }
}

// Freshly authored cover sets. 16:9 is reserved for featured/highlight panels,
// 4:5 drives portrait Work cards, and 1:1 drives square Work cards so card
// content is not squeezed into the wrong crop.
const MOCKUPS = '/Assets/mockups/projects'
const NEW_COVER_SLUGS = new Set([
  // First batch
  'ai-voice', 'atps', 'breakgen', 'dna-speculative', 'drowning', 'healthapp',
  'making-of-time', 'moniac-machine', 'sculpture', 'the-point-cdc', 'zentipay',
  'ballah-code', 'black-hole', 'clawed-chat', 'executivelens', 'mentra',
  'mentra-miniapps', 'sea-of-salt', 'tedx', 'vishwaconclave',
  'keyboard-project', 'oncall-lens',
  // Second batch (incl. the flagship TransFi + Jugalbandi)
  'code-for-build', 'cuetv', 'enigma', 'ibm', 'jugalbandi', 'office-of-diversity',
  'raahi-project', 'revolving-stage', 'shuffle', 'the-omakase', 'transfi-project',
  'typeface', 'uv-light', 'vj-software', 'mentra-brand',
])
const SQUARE_COVER_SLUGS = new Set([
  'ai-voice', 'atps', 'breakgen', 'code-for-build', 'cuetv', 'dna-speculative',
  'drowning', 'enigma', 'healthapp', 'ibm', 'jugalbandi', 'keyboard-project',
  'making-of-time', 'moniac-machine', 'office-of-diversity', 'raahi-project',
  'revolving-stage', 'sculpture', 'shuffle', 'the-omakase', 'the-point-cdc',
  'transfi-project', 'typeface', 'uv-light', 'vj-software', 'zentipay',
  'ballah-code', 'black-hole', 'clawed-chat', 'executivelens', 'mentra',
  'mentra-brand', 'mentra-miniapps', 'oncall-lens', 'sea-of-salt', 'tedx',
  'vishwaconclave',
])
for (const project of projects) {
  if (NEW_COVER_SLUGS.has(project.slug)) {
    project.cardMockup = `${MOCKUPS}/${project.slug}_4x5.webp`
    project.cover16x9 = `${MOCKUPS}/${project.slug}_16x9.webp`
  }
  if (SQUARE_COVER_SLUGS.has(project.slug)) {
    project.cardMockupSquare = `${MOCKUPS}/${project.slug}_1x1.webp`
  }
}

const medimorphoProject = projects.find(project => project.slug === 'medimorpho')
if (medimorphoProject) {
  medimorphoProject.cardMockup = medimorphoProject.image
  medimorphoProject.cardMockupSquare = medimorphoProject.image
  medimorphoProject.cover16x9 = medimorphoProject.image
}

/* ──────────────────────────────────────────────────────────────────────
   Helper selectors
   ────────────────────────────────────────────────────────────────────── */

const WORK_PRIORITY = new Map(projectSlugs.map((slug, index) => [slug, index]))
const WORK_SELECTED_SLUGS = new Set(portfolio.featured)

const getWorkPriority = (project: Project) => WORK_PRIORITY.get(project.slug) ?? Number.MAX_SAFE_INTEGER

const sortByWorkPriority = (a: Project, b: Project) => {
  const priorityDiff = getWorkPriority(a) - getWorkPriority(b)
  if (priorityDiff !== 0) return priorityDiff
  return (a.archiveOrder ?? 99) - (b.archiveOrder ?? 99)
}

export const isRoutableProject = (project: Project) =>
  !project.hidden && project.access?.mode !== 'hidden'

const isPubliclyVisibleProject = (project: Project) =>
  isRoutableProject(project) &&
  WORK_PRIORITY.has(project.slug)

/** Every public case study that should resolve by URL, including work omitted
 * from the curated Home and Work listings. */
export const routableProjects = projects.filter(isRoutableProject)

export const visibleProjects = projects
  .filter(isPubliclyVisibleProject)
  .sort(sortByWorkPriority)

const homeWorkListingProjects = visibleProjects

/** S-Tier: flagship projects for homepage featured grid */
export const featuredProjects = homeWorkListingProjects
  .filter(p => portfolio.featured.includes(p.slug))
  .sort(sortByWorkPriority)

/** Explicit recruiter-facing work list */
export const selectedWorkProjects = homeWorkListingProjects
  .filter(p => WORK_SELECTED_SLUGS.has(p.slug))
  .sort(sortByWorkPriority)

/** Homepage follow-on grid after flagship work */
export const homepageSelectedProjects = homeWorkListingProjects
  .filter(p => !portfolio.featured.includes(p.slug))

/** Remaining visible work shown below the fold on /work */
export const archiveWorkProjects = homeWorkListingProjects
  .filter(p => !selectedWorkProjects.some(selected => selected.slug === p.slug))
  .sort(sortByWorkPriority)

/** All projects for the Work page in curated mixed order */
export const allProjectsCurated = (() => {
  return homeWorkListingProjects
})()

const DESIGN_ENGINEERING_PROJECT_SLUGS = new Set([
  'mentra',
  'clawed-chat',
  'executivelens',
  'oncall-lens',
  'ballah-code',
  'zentipay',
  'transfi-project',
  'healthapp',
])

export function filterProjectsByCategory(items: Project[], cat: ProjectCategory): Project[] {
  if (cat === 'creative' && !isExperimental) {
    return items.filter(p => DESIGN_ENGINEERING_PROJECT_SLUGS.has(p.slug) && isPubliclyVisibleProject(p))
  }
  return items.filter(p => (p.category === cat || p.secondaryCategories?.includes(cat)) && isPubliclyVisibleProject(p))
}

/** Get projects by category */
export function projectsByCategory(cat: ProjectCategory): Project[] {
  if (cat === 'creative' && !isExperimental) {
    return visibleProjects.filter(p => DESIGN_ENGINEERING_PROJECT_SLUGS.has(p.slug))
  }
  return visibleProjects.filter(p => p.category === cat || p.secondaryCategories?.includes(cat))
}

/** Find a single project by slug */
export function getProject(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug)
}

export function isRequestAccessProject(project?: Project): boolean {
  return Boolean(project && (project.access?.mode === 'request' || project.nda))
}

export function getProjectAccessLabel(project?: Project): string {
  if (!isRequestAccessProject(project)) return ''
  return `NDA / ${project?.access?.publicLabel || 'Quick glimpse'}`
}

export function isHiddenProject(project?: Project): boolean {
  return Boolean(project && !isPubliclyVisibleProject(project))
}
