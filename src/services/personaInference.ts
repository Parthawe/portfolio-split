import type { ChatContext, Persona } from '../data/agentKnowledge'

interface Signal {
  weight: number
  persona: Persona
}

function getSignals(ctx: ChatContext): Signal[] {
  const signals: Signal[] = []
  const ref = (ctx.referrer || '').toLowerCase()

  // ── Referrer signals ──
  if (ref.includes('linkedin.com')) signals.push({ weight: 4, persona: 'recruiter' })
  if (ref.includes('github.com')) signals.push({ weight: 3, persona: 'peer' })
  if (ref.includes('dribbble.com') || ref.includes('behance.net')) signals.push({ weight: 3, persona: 'peer' })
  if (ref.includes('angel.co') || ref.includes('wellfound.com') || ref.includes('ycombinator.com')) signals.push({ weight: 3, persona: 'founder' })

  // ── UTM signals ──
  const src = (ctx.utmSource || '').toLowerCase()
  const med = (ctx.utmMedium || '').toLowerCase()
  const camp = (ctx.utmCampaign || '').toLowerCase()
  if (src.includes('linkedin')) signals.push({ weight: 5, persona: 'recruiter' })
  if (camp.includes('hiring') || camp.includes('recruit')) signals.push({ weight: 5, persona: 'recruiter' })
  if (med === 'referral' && src.includes('github')) signals.push({ weight: 3, persona: 'peer' })

  // ── Behavioral signals ──
  const hist = ctx.visitHistory

  // Visited /about in first 3 pages — likely evaluating the person
  const aboutIdx = hist.indexOf('/about')
  if (aboutIdx >= 0 && aboutIdx < 3) signals.push({ weight: 2, persona: 'recruiter' })

  // 4+ project pages visited — browsing deeply
  // Exclude exact category paths, not startsWith (to avoid filtering /ai-voice, etc.)
  const CATEGORY_PATHS = new Set(['/', '/work', '/about', '/ai', '/ux', '/ux-design', '/ux-research', '/ui', '/design-engineer', '/design-engineering', '/creative-tech', '/installations', '/brand', '/brand-visual', '/healthcare', '/fintech', '/design-for-good', '/crypto', '/ai-wearables', '/book', '/studio', '/graveyard'])
  const projectPages = hist.filter(p => !CATEGORY_PATHS.has(p))
  if (projectPages.length >= 4) signals.push({ weight: 2, persona: 'peer' })
  if (projectPages.length >= 2 && projectPages.length < 4) signals.push({ weight: 1, persona: 'hm' })

  // Spent real time — engaged user
  if (ctx.timeOnPage > 60) signals.push({ weight: 1, persona: 'peer' })

  // ── Conversation signals ──
  // These get picked up because the rules engine sets lastTopic
  // The persona re-evaluates every few questions so these accumulate

  return signals
}

export function inferPersona(ctx: ChatContext): Persona {
  const signals = getSignals(ctx)
  if (signals.length === 0) return 'unknown'

  const scores: Record<Persona, number> = {
    recruiter: 0,
    hm: 0,
    peer: 0,
    founder: 0,
    student: 0,
    unknown: 0,
  }

  for (const s of signals) {
    scores[s.persona] += s.weight
  }

  let best: Persona = 'unknown'
  let bestScore = 0
  for (const [p, score] of Object.entries(scores) as [Persona, number][]) {
    if (score > bestScore) { bestScore = score; best = p }
  }

  // Need at least 3 points of signal to commit to a persona
  return bestScore >= 3 ? best : 'unknown'
}

/** Check if the user's message hints at a persona */
export function updatePersonaFromMessage(ctx: ChatContext, message: string): void {
  const q = message.toLowerCase()
  if (/\b(hire|hiring|recruiter|roles? fit|design engineer role|product designer role|job|position|jd|candidate)\b/.test(q)) {
    // Boost recruiter signal by pretending referrer is linkedin
    ctx.persona = inferPersona({ ...ctx, referrer: ctx.referrer || 'linkedin.com' })
  } else if (/\b(founder|startup|early.stage|zero.to.one|0.to.1|first designer)\b/.test(q)) {
    ctx.persona = inferPersona({ ...ctx, referrer: ctx.referrer || 'wellfound.com' })
  } else if (/\b(how did you|how do you|your process|what tools|code review|show me the code)\b/.test(q)) {
    // Boost peer signal
    ctx.persona = inferPersona({ ...ctx, referrer: ctx.referrer || 'github.com' })
  } else if (/\b(student|learning design|learn design|portfolio advice|break into design)\b/.test(q)) {
    ctx.persona = 'student'
  }
}
