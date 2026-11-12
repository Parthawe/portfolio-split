import { normalizeCopy } from '../utils/normalizeCopy'

export const CURSOR_WORD_LIMIT = 22
export const CURSOR_IDENTITY_REPLY = "I'm Parth's portfolio twin: AI, opinionated, and permanently on the clock."

const THINKING_LINES = [
  'Thinking cleanly.',
  'I have a take. One beat.',
  'Connecting the dots.',
]

const CODAS = {
  challenge: [
    'That tension made the work worth doing.',
    "That was the knot I couldn't ignore.",
  ],
  ownership: [
    'I like owning the messy middle, not just the final frames.',
    'I wanted responsibility for the decision, not just the screen.',
  ],
  impact: [
    "I'm proud of that shift.",
    'That part still feels good.',
  ],
  decision: [
    "I'd make that call again.",
    'That was the bet.',
  ],
} as const

function stableIndex(value: string, length: number) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash) % length
}

function emotionalCoda(question: string) {
  const normalized = question.toLowerCase()
  const key = /\b(why|challenge|problem|constraint|hard|difficult)\b/.test(normalized)
    ? 'challenge'
    : /\b(own|owned|role|responsib|contribut|build)\b/.test(normalized)
      ? 'ownership'
      : /\b(outcome|impact|result|change|changed|ship|launch)\b/.test(normalized)
        ? 'impact'
        : /\b(decision|choose|chose|approach|process|bet)\b/.test(normalized)
          ? 'decision'
          : null

  if (!key) return ''
  const options = CODAS[key]
  return options[stableIndex(question, options.length)]
}

function plainCopy(text: string) {
  return normalizeCopy(text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/(^|\s)[•*-]\s+/g, '$1')
    .replace(/^(?:(?:great question|good question|absolutely|certainly|of course)[,!.:\s-]*)+/i, '')
    .replace(/^(shipped|designed|built|created|led)\b/i, match => `I ${match.toLowerCase()}`)
    .replace(/^proves\b/i, 'The work proves')
    .replace(/\s+/g, ' ')
    .trim()
}

function ensureTerminalPunctuation(text: string) {
  const trimmed = text.trim().replace(/[,;:]+$/, '')
  if (!trimmed || /[.!?]["')\]]?$/.test(trimmed)) return trimmed
  return `${trimmed}.`
}

function truncateCompleteThought(text: string) {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= CURSOR_WORD_LIMIT) return ensureTerminalPunctuation(text)

  const shortened = words
    .slice(0, CURSOR_WORD_LIMIT)
    .join(' ')
    .replace(/[,;:]+$/, '')

  return ensureTerminalPunctuation(shortened)
}

export function shapeCursorAnswer(text: string, question: string, addEmotion = false) {
  const plain = plainCopy(text)
  const sentences = (plain.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [plain])
    .map(sentence => sentence.trim())
    .filter(Boolean)
  const firstSentence = sentences[0] || plain
  let concise = sentences.slice(0, 2).join(' ').trim()

  if (addEmotion && !/\b(i am proud|i'm proud|still feels|i would|i'd|honestly)\b/i.test(concise)) {
    const coda = emotionalCoda(question)
    if (coda) concise = `${firstSentence} ${coda}`
  }

  if (concise.split(/\s+/).filter(Boolean).length <= CURSOR_WORD_LIMIT) {
    return ensureTerminalPunctuation(concise)
  }

  if (firstSentence.split(/\s+/).filter(Boolean).length <= CURSOR_WORD_LIMIT) {
    return ensureTerminalPunctuation(firstSentence)
  }

  return truncateCompleteThought(firstSentence)
}

export function getCursorThinkingLine(question: string, route: string) {
  return THINKING_LINES[stableIndex(`${route}:${question}`, THINKING_LINES.length)]
}

export function isCursorAnswerUsable(text: string, question = '') {
  const normalized = text.trim().toLowerCase()
  if (!normalized) return false
  if (/^(as an ai|as a language model)|\b(i do not have feelings|i don't have feelings|i cannot feel emotions)\b/.test(normalized)) {
    return false
  }
  if (question && !isCursorIdentityQuestion(question) && /\b(ai counterpart|portfolio twin|i am an ai|i'm an ai)\b/.test(normalized)) {
    return false
  }
  if (/\b(?:what roles? fit|role fit|hire (?:you|parth)|best fit)\b/i.test(question)
      && !/\b(?:design engineer|senior product designer)\b/.test(normalized)) {
    return false
  }
  if (!/[.!?]["')\]]?$/.test(normalized)) return false

  const withoutPunctuation = normalized.replace(/[.!?"')\]]+$/, '')
  return !/\b(?:a|an|and|as|at|because|by|for|from|if|in|of|or|the|to|with|which|who)$/.test(withoutPunctuation)
}

export const CURSOR_SCOPE_REPLY = 'I live in this portfolio. Try a project, decision, or role fit.'

export function isCursorIdentityQuestion(question: string) {
  return /\b(are you (?:a )?human|are you real|real person|are you parth|human or ai)\b/i.test(question)
}
