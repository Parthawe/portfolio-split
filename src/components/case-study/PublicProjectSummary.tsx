import { Helmet } from 'react-helmet-async'
import type { ReactNode } from 'react'
import { getProject } from '../../data/projects'
import Footer from '../Footer'
import Nav from '../Nav'
import CsBody from './CsBody'
import CsSection from './CsSection'
import NextProject from './NextProject'
import ProjectHeader from './ProjectHeader'

interface PublicProjectSummaryProps {
  slug: string
  workflow?: {
    subtitle: string
    media: ReactNode
    contribution: string
    role: string
  }
}

export default function PublicProjectSummary({ slug, workflow }: PublicProjectSummaryProps) {
  const project = getProject(slug)
  if (!project) return null

  const image = project.access?.publicPreviewImage || project.image
  const accessHref = `https://designwhich.works/${slug}#case-study-access-${slug}`
  return <>
    <Helmet>
      <title>{project.name} · Parth Pawar</title>
      <meta name="description" content={project.desc} />
    </Helmet>
    <Nav />
    <main id="main-content" className="project-main">
      <ProjectHeader backLink="/work" backLabel="Back to work" tags={[project.tag]}
        title={project.name} subtitle={workflow?.subtitle ?? project.desc} heroImage={image}
        heroAlt={project.access?.publicPreviewAlt || project.name} heroFraming="image"
        openingMediaId={workflow ? 'cs-public-story' : undefined}
        visualHeroMedia={workflow && <div>
          {workflow.media}
          <section id="overview" className="public-workflow-contribution" aria-labelledby="public-workflow-contribution-title">
            <h2 id="public-workflow-contribution-title">What I did</h2>
            <p>{workflow.contribution}</p>
            <a className="glass-action" href={accessHref}>Request access on the live portfolio</a>
          </section>
        </div>}
        showHeaderSummary={false} info={workflow
          ? [{ label: 'Role', value: workflow.role }]
          : [{ label: 'Year', value: project.year }]} />
      {!workflow && <CsSection id="overview" title="Project summary">
        <CsBody>
          <p>{project.summaryProblem}</p>
          <p>{project.summaryRole}</p>
          <p>{project.summaryOutcome}</p>
          <a className="proj-live-link" href={accessHref}>Request access on the live portfolio</a>
        </CsBody>
      </CsSection>}
    </main>
    <NextProject slug={slug} title={project.name} image={image} />
    <Footer />
  </>
}
