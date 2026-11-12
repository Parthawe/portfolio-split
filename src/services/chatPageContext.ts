import { chatProjectSlug } from '../utils/chatProjectPath'
import { visibleProjects } from '../data/projects'
export type ChatScroll = { element?: HTMLElement; edge?: 'top' | 'bottom'; top?: number; label: string }
const hidden = '[hidden], [inert], .nda-gate, .nda-inline-preview, .portfolio-chat-panel'
function collectSections(detail = false) {
  const headings = Array.from(document.querySelectorAll<HTMLElement>(`#hero h1, main h1, main h2, footer h2${detail ? ', main h3' : ''}`))
  const seen = new Set<Element>()
  return headings.filter(element => element.getClientRects().length && !element.closest(hidden) && getComputedStyle(element).visibility !== 'hidden')
    .flatMap(element => {
      const section = element.closest<HTMLElement>('section, article') || element.parentElement || element
      const key = detail ? element : section
      if (seen.has(key)) return []
      seen.add(key)
      const title = element.innerText.trim().replace(/\s+/g, ' ')
      return title ? [{ title, text: section.innerText.trim().slice(0, 1800), element }] : []
    })
}
/** Rendered public evidence only. Never read form values or protected story containers. */
export function getChatSections() { return collectSections().slice(0, 80) }
export function getChatPageContext() {
  const sections = getChatSections()
  const project = visibleProjects.find(p => p.slug === chatProjectSlug(window.location.pathname))
  const restricted = project && (project.nda || (project.access?.mode && project.access.mode !== 'public'))
  const current = sections.filter(section => section.element.getBoundingClientRect().top < 180).slice(-1)[0]
  const start = Math.max(0, sections.findIndex(section => section === current) - 12)
  return {
    title: document.title,
    sections: restricted ? [] : sections.slice(start, start + 24).map(({ title, text, element }) => ({ title, text: Math.abs(sections.findIndex(section => section.element === element) - sections.findIndex(section => section === current)) <= 2 ? text.slice(0, 1000) : '', inViewport: element === current?.element || (element.getBoundingClientRect().top >= 0 && element.getBoundingClientRect().top < window.innerHeight) })),
  }
}
export function resolveChatScroll(question: string): ChatScroll | null {
  const q = question.toLowerCase().trim().replace(/[?.!]+$/, '').replace(/^(?:(?:please\s+)?(?:can|could|would)\s+you\s+|please\s+)/, '')
  if (!/^(scroll|show|take|go|jump|move|next (?:section|part)|previous (?:section|part)|back to top|keep going)/.test(q)) return null
  if (/\b(top|beginning|start of (?:the )?page)\b/.test(q)) return { edge: 'top', label: 'Top of page' }
  if (/\b(footer|contact)\b/.test(q)) {
    const footer = document.querySelector<HTMLElement>('footer')
    return footer ? { element: footer, label: 'Footer and contact' } : { edge: 'bottom', label: 'Bottom of page' }
  }
  if (/\b(bottom|end of (?:the )?page)\b/.test(q)) return { edge: 'bottom', label: 'Bottom of page' }
  const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight)
  if (/\b(middle|halfway)\b/.test(q)) return { top: Math.round(maximum / 2), label: 'Middle of page' }
  if (/\b(down|up)\b/.test(q)) {
    const direction = /\bup\b/.test(q) ? -1 : 1
    return { top: Math.max(0, Math.min(maximum, scrollY + innerHeight * (/\b(little|bit)\b/.test(q) ? .35 : .7) * direction)), label: direction > 0 ? 'Further down the page' : 'Further up the page' }
  }
  const sections = getChatSections()
  if (/\b(next|previous)\b|^keep going/.test(q)) {
    const section = /previous/.test(q)
      ? sections.filter(s => s.element.getBoundingClientRect().top < 70).slice(-1)[0]
      : sections.find(s => s.element.getBoundingClientRect().top > 140)
    return section ? { element: section.element, label: section.title } : { edge: /previous/.test(q) ? 'top' : 'bottom', label: /previous/.test(q) ? 'Top of page' : 'End of page' }
  }
  const words = q.replace(/\b(scroll|show|take|go|jump|move|me|to|the|section|please)\b/g, ' ').trim().split(/\s+/).filter(w => w.length > 2)
  const ranked = collectSections(true).map(s => ({ ...s, score: words.filter(w => s.title.toLowerCase().includes(w)).length })).sort((a,b) => b.score-a.score)
  return ranked[0]?.score ? { element: ranked[0].element, label: ranked[0].title } : null
}
