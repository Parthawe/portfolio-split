import { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { isRequestAccessProject, projects, visibleProjects } from "../../data/projects";
import { sentenceCaseProjectLabel } from "../../utils/projectPresentation";

interface NextProjectProps {
  slug: string;
  title: string;
  image: string;
}

export default function NextProject({ slug, title, image }: NextProjectProps) {
  const location = useLocation()
  const currentSlug = location.pathname.split('/').filter(Boolean).pop() ?? ''
  const currentIndex = visibleProjects.findIndex(project => project.slug === currentSlug)
  const registryNext = currentIndex >= 0 && visibleProjects.length
    ? visibleProjects[(currentIndex + 1) % visibleProjects.length]
    : undefined
  const chosenProject = projects.find(pr => pr.slug === slug && !pr.hidden && pr.slug !== currentSlug)
  const project = chosenProject ?? registryNext
  const targetSlug = project?.slug
  const hiddenTarget = !targetSlug || Boolean(project?.hidden)
  const requestAccess = isRequestAccessProject(project)
  const resolvedTitle = hiddenTarget ? 'Browse more work' : project?.name || title
  const resolvedImage = project?.cardMockup || project?.image || image
  const resolvedAlt = project?.cardMockupAlt || resolvedTitle
  const resolvedHref = hiddenTarget ? '/work' : `/${targetSlug}`
  const resolvedMeta = hiddenTarget
    ? 'Public work index'
    : project?.tag
      ? sentenceCaseProjectLabel(project.tag)
      : undefined
  const resolvedDesc = hiddenTarget ? 'Continue with visible projects instead of a hidden archive entry.' : project?.desc
  const prefetch = useCallback(() => {
    if (!hiddenTarget && project?.page) void project.page().catch(() => { /* Optional prefetch; navigation owns recovery. */ })
  }, [hiddenTarget, project])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
    >
      <Link className="next-project" to={resolvedHref} onMouseEnter={prefetch} onFocus={prefetch}>
        <div className="wrap next-project-inner">
          <div>
            <div className="next-project-label">{requestAccess ? 'Next Quick Glimpse' : hiddenTarget ? 'Continue' : 'Next Project'}</div>
            <div className="next-project-title">{resolvedTitle}</div>
            {resolvedMeta && <div className="next-project-meta">{resolvedMeta}</div>}
            {resolvedDesc && <p className="next-project-desc">{resolvedDesc}</p>}
          </div>
          <div className="next-project-img">
            <img src={resolvedImage} alt={resolvedAlt} loading="lazy" decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
