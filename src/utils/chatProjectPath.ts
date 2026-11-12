import { visibleProjects } from '../data/projects'
/** Canonical public case slug for case studies and their separate preview routes. */
export function chatProjectSlug(path: string): string | undefined {
  const parts = path.split(/[?#]/)[0].split('/').filter(Boolean)
  const slug = parts[0] === 'experience-preview' ? parts[1] : parts[0]
  return visibleProjects.some(project => project.slug === slug) ? slug : undefined
}
