import curated from './process-artifacts.json'
import { routableProjects, getProject, isRequestAccessProject } from './projects'
import { projectRecords } from './projectRecords'
import { mentraSlideChapters } from './caseStudySlides'
import { mentraDecisions } from './productDecisionStories'
import type { ScreenDecision } from '../components/case-study/DecisionNote'

export type ProcessStage = 'reference' | 'material' | 'experiment' | 'decision' | 'outcome'
export type ProcessArtifact = {
  id: string; title: string; src: string; alt: string; stage: ProcessStage;
  caption: string; sourceHref: string; creator: string; evidenceNote?: string;
  decision?: ScreenDecision;
}
export type ProcessCuration = { slug: string; artifacts: ProcessArtifact[]; exploration?: string }
const reviewed = curated as ProcessCuration[]
export const stageLabels: Record<ProcessStage, string> = {
  reference: 'Documented influences', material: 'Project material', experiment: 'Experiments', decision: 'Decisions', outcome: 'Outcomes',
}
const mentraArtifacts: ProcessArtifact[] = [
  ['6:28341', 'An app-led home', 'experiment'],
  ['0:65', 'Three ways to reach runtime controls', 'decision'],
  ['0:66', 'The runtime drawer', 'decision'],
  ['500:3981', 'Listening, working, and uncertainty', 'experiment'],
  ['500:3980', 'Recovery that preserves intent', 'decision'],
  ['500:3979', 'Prototype, shipped, after beta', 'outcome'],
].map(([id, title, stage]) => {
  const slide = mentraSlideChapters.flatMap(c => c.slides).find(s => s.id === id)!
  const decision = mentraDecisions[id]
  return { id: `mentra-${id.replace(':', '-')}`, title, src: slide.src, alt: slide.alt, stage: stage as ProcessStage,
    caption: decision.choice, sourceHref: `/mentra#${id === '500:3979' ? 'decision-results' : id.startsWith('500:') ? 'decision-recovery' : 'decision-runtime'}`, creator: 'Mentra project archive',
    evidenceNote: decision.limit, decision }
})

/** Static public projection. Never reads the private library, originals, or Figma account. */
export function getProcessCuration(slug: string): ProcessCuration | undefined {
  const project = getProject(slug)
  if (!project || project.hidden || project.access?.mode === 'hidden') return undefined
  if (isRequestAccessProject(project)) return { slug, artifacts: [] }
  if (slug === 'mentra') return { slug, artifacts: mentraArtifacts, exploration: 'How would a runtime drawer handle dozens of active apps without hiding the wearer’s most important controls?' }
  return reviewed.find(row => row.slug === slug) ?? { slug, artifacts: [] }
}
export const processProjects = routableProjects.map(project => ({ project, record: projectRecords[project.slug], curation: getProcessCuration(project.slug)! }))
export const processHref = (slug: string) => `/process/${encodeURIComponent(slug)}`
