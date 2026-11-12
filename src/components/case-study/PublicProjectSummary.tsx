import { Helmet } from 'react-helmet-async'
import { getProject } from '../../data/projects'
import Footer from '../Footer'
import Nav from '../Nav'
import CsBody from './CsBody'
import CsSection from './CsSection'
import NextProject from './NextProject'
import ProjectHeader from './ProjectHeader'

export default function PublicProjectSummary({ slug }: { slug: string }) {
  const project = getProject(slug)
  if (!project) return null

  const image = project.access?.publicPreviewImage || project.image
  return <>
    <Helmet>
      <title>{project.name} · Parth Pawar</title>
      <meta name="description" content={project.desc} />
    </Helmet>
    <Nav />
    <main id="main-content" className="project-main">
      <ProjectHeader backLink="/work" backLabel="Back to work" tags={[project.tag]}
        title={project.name} subtitle={project.desc} heroImage={image}
        heroAlt={project.access?.publicPreviewAlt || project.name} heroFraming="image"
        showHeaderSummary={false} info={[{ label: 'Year', value: project.year }]} />
      <CsSection id="overview" label="Overview" title="Project summary">
        <CsBody>
          <p>{project.summaryProblem}</p>
          <p>{project.summaryRole}</p>
          <p>{project.summaryOutcome}</p>
          <a className="proj-live-link" href={`https://designwhich.works/${slug}#case-study-access-${slug}`}>Request access on the live portfolio</a>
        </CsBody>
      </CsSection>
    </main>
    <NextProject slug={slug} title={project.name} image={image} />
    <Footer />
  </>
}
