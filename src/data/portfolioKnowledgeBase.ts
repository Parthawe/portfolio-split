import { categories } from './categories'
import { visibleProjects as projects } from './projects'

export const PORTFOLIO_SCOPE_REPLY =
  "I can explain the projects, compare design decisions, help assess role fit, or take you to a page section. Try asking what Parth owned at Mentra."

const PAGE_TERMS = [
  'home',
  'homepage',
  'landing page',
  'hero',
  'work',
  'projects',
  'case study',
  'case studies',
  'index view',
  'arc view',
  'editorial view',
  'timeline view',
  'about',
  'portfolio',
  'website',
  'site',
  'section',
  'tour',
  'shortlist',
  'where should i start',
  'what should i see',
  'best three',
  'show me range',
  'surprise me',
  'contact',
  'hire',
  'resume',
  'experience',
  'tools',
  'skills',
  'role fit',
]

const PROFILE_TERMS = [
  'parth',
  'parth pawar',
  'design engineer',
  'mentra',
  'zentipay',
  'transfi',
  'nyu',
  'itp',
  'san francisco',
  'head of ui ux',
  'head of ui/ux',
]

const FOLLOW_UP_PATTERNS = [
  /^(why|how|what|who|when|where|which|and|more|deeper|continue|next|result|outcome|impact|team|process|challenge|insight)\b/i,
  /^(tell me more|go deeper|keep going|what else)\b/i,
]

const CLEARLY_OFF_TOPIC_PATTERNS = [
  /\b(weather|forecast|temperature)\b/i,
  /\b(stock price|sports score|recipe|horoscope)\b/i,
  /\b(president|election|politics)\b/i,
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9/&+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const projectTerms = projects.flatMap(project => [
  project.slug,
  project.name,
  project.tag,
])

const categoryTerms = categories.flatMap(category => [
  category.slug,
  category.title,
  category.titleAccent,
  `${category.title} ${category.titleAccent}`,
])

const KNOWLEDGE_TERMS = Array.from(
  new Set(
    [...PAGE_TERMS, ...PROFILE_TERMS, ...projectTerms, ...categoryTerms]
      .map(normalize)
      .filter(term => term.length > 2)
  )
)

export function isPortfolioQuestion(
  message: string,
  options?: { route?: string; lastProject?: string }
): boolean {
  const query = normalize(message)
  if (!query) return true

  if (CLEARLY_OFF_TOPIC_PATTERNS.some(pattern => pattern.test(message))) return false

  // A visitor speaking to the portfolio guide need not repeat Parth’s name.
  if (/\b(he|his|him|you|your)\b/.test(query) && /\b(why|what|who|how|best|good|fit|hire|different|work|design|help)\b/.test(query)) return true
  if (/^(hi|hello|hey|help|tell me more|more|why|what else)[!.?]*$/.test(query)) return true

  if ((options?.lastProject || (options?.route && options.route !== '/')) && FOLLOW_UP_PATTERNS.some(pattern => pattern.test(message))) {
    return true
  }

  if (PAGE_TERMS.some(term => query.includes(normalize(term)))) return true
  if (PROFILE_TERMS.some(term => query.includes(normalize(term)))) return true

  // Require 4+ char overlap to prevent false positives on short words
  return KNOWLEDGE_TERMS.some(term => query === term || (term.length >= 4 && query.includes(term)) || (query.length >= 4 && term.includes(query)))
}
