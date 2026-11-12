import { experiencePreviewsEnabled } from '../utils/experiencePreview'
import { approvedExperiences, projectExperience, experienceHref } from '../data/projectExperiences'
import { projects } from '../data/projects'
import { Helmet } from 'react-helmet-async'
import { Link, Navigate, useParams, useLocation } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import '../components/physical-worlds/worlds.css'

export default function PhysicalWorldPage() {
  const { project } = useParams()
  const location=useLocation()
  if (project) {
    const item = projectExperience(project)
    const destination=item?experienceHref(project):'/404'
    return <Navigate to={destination===location.pathname?`/${project}`:destination} replace />
  }
  if (experiencePreviewsEnabled) return <Navigate to={`/experience-preview${location.search}`} replace />
  return <main className="physical-world-page">
    <Helmet><title>Project experiences · Parth Pawar</title></Helmet>
    <header><div><h1>Project experiences</h1><p>Interactive work reviewed for this collection.</p></div>{experiencePreviewsEnabled&&<Link to="/experience-preview">Explore draft previews</Link>}<Link to="/work">Back to Work</Link><ThemeToggle /></header>
    <div className="physical-world-index">{approvedExperiences().map(item => <Link key={item.slug} to={item.href}><strong>{projects.find(p => p.slug === item.slug)?.name ?? item.slug}</strong><span>{item.label} →</span></Link>)}</div>
  </main>
}
