const PROJECT_ACRONYMS = new Set([
  'AI', 'API', 'AR', 'CSS', 'GDP', 'HTML', 'IBM', 'ML', 'NDA', 'NLP',
  'NYU', 'OS', 'QR', 'SDK', 'UI', 'UI/UX', 'UMLS-BERT', 'URL', 'UX', 'VR',
])

export function projectTitleLengthClass(value: string) {
  const words = value.trim().split(/\s+/).length
  if (value.length > 96 || words > 15) return 'long'
  if (value.length > 58 || words > 9) return 'medium'
  return 'short'
}

export function sentenceCaseProjectLabel(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return value

  const letters = trimmed.replace(/[^A-Za-z]/g, '')
  const isAllCaps = letters.length > 1 && letters === letters.toUpperCase()
  if (!isAllCaps) return trimmed

  let hasStarted = false
  return trimmed.split(/(\s+|\/|–|—)/).map((part) => {
    if (!/[A-Za-z]/.test(part)) return part
    if (PROJECT_ACRONYMS.has(part.toUpperCase())) return part.toUpperCase()

    const lower = part.toLowerCase()
    if (!hasStarted) {
      hasStarted = true
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    }
    return lower
  }).join('')
}

interface ProjectTimelineSource {
  summaryTimeline?: string
  timelineMilestones?: { period: string; label: string }[]
  storyline?: {
    challenge: string
    approach: string
    result: string
  }
}

/** Only authored chronology belongs in a timeline. Otherwise show the known duration. */
export function projectTimelineMilestones(project?: ProjectTimelineSource) {
  return project?.timelineMilestones ?? []
}
