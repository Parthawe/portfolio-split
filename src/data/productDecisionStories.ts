import { mentraSlideChapters } from './caseStudySlides'
import type { SlideChapter } from '../components/case-study/CaseStudySlides'
import type { ScreenDecision } from '../components/case-study/DecisionNote'
const slide = (id: string) => {
  const found = mentraSlideChapters.flatMap(chapter => chapter.slides).find(item => item.id === id)
  if (!found) throw new Error(`Missing original Mentra slide: ${id}`)
  return found
}
export const mentraDecisionChapters: SlideChapter[] = [
  { id: 'decision-first-use', title: 'Connect before exploring apps', slides: ['97:5038', '77:2532'].map(slide) },
  { id: 'decision-runtime', title: 'Keep launch and runtime separate', slides: ['6:28341', '0:65', '0:66'].map(slide) },
  { id: 'decision-recovery', title: 'Make waiting and recovery legible', slides: ['500:3981', '500:3980'].map(slide) },
  { id: 'decision-results', title: 'Separate first-use and runtime results', slides: ['329:8449', '329:8363', '500:3979'].map(slide) },
]
export const mentraQuickProof: SlideChapter = {
  id: 'cs-design-proof',
  title: 'Give apps the home screen',
  slides: [slide('6:28341')],
}
export const mentraDecisions: Record<string, ScreenDecision> = {
  '97:5038': { question: 'How does a new wearer reach a connected device?', choice: 'Give setup its own sequence before everyday app use.', evidence: 'Follow the setup screens in order, then compare the separate pairing sequence on the next slide.' },
  '77:2532': { question: 'When can the wearer move past pairing?', choice: 'Treat connection as a first-use task with its own screens.', evidence: 'Inspect the pairing progression rather than inferring connection from the home screen.', limit: 'These are source designs; this slide alone does not demonstrate pairing reliability.' },
  '6:28341': { question: 'Should the home screen lead with device controls or apps?', choice: 'Give app launching the main area and reduce the device panel’s dominance.', evidence: 'Compare the large device card and active/inactive lists on the left with the app grid and bottom runtime entry on the right.', limit: 'Original design comparison. Evaluation dates and cohort sizes are not included in the public source.' },
  '0:65': { question: 'How can runtime controls stay available without taking over home?', choice: 'Select the bottom drawer over a persistent dock or card switcher.', evidence: 'Read the source comparison across recognition, control, idle cost, and scale.', limit: 'This is the source’s qualitative tradeoff comparison, not a timed benchmark.' },
  '0:66': { question: 'What is running, and how can it be stopped?', choice: 'Use one runtime entry for the count, app identity, background apps, data access, and control.', evidence: 'Locate the running count at the bottom, then the app actions in the open drawer.' },
  '500:3981': { question: 'What should happen before an AI answer is ready?', choice: 'Distinguish listening, working, and uncertain input.', evidence: 'Compare the Listening and Working states with the clarification choices for an uncertain MiniApp request.' },
  '500:3980': { question: 'What can a wearer do when a request fails?', choice: 'Offer a next action specific to the failure while preserving intent.', evidence: 'Connection lost leads to Reconnect; permission blocked to Settings; a failed request to Retry, Edit, or Cancel.' },
  '329:8449': { question: 'What changed in the first-use phase?', choice: 'Report process time and return together, including the small return change.', evidence: 'The source reports 9m 40s → 5m 10s and 7-day return of 22% → 23%.', limit: 'Study dates, cohort sizes, and comparison conditions are not available publicly.' },
  '329:8363': { question: 'What changed after the runtime redesign?', choice: 'Keep runtime results distinct from the earlier first-use phase.', evidence: 'The source reports MiniApp task completion of 52% → 78% and 7-day return of 22% → 41%.', limit: 'These are source-reported figures from a separate phase; they do not establish the drawer alone caused the change.' },
  '500:3979': { question: 'What changed between the prototype and production?', choice: 'Tighten running count, app attribution, and direct stop after beta.', evidence: 'Read the Designed → Shipped → After beta progression and its three named refinements.' },
}
