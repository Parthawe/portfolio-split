import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import FigmaSelect from './FigmaSelect'
import { isRequestAccessProject, type Project } from '../data/projects'

type FlagshipVariant = 'lead' | 'card'

interface FlagshipProjectShowcaseProps {
  project: Project
  index: number
  variant?: FlagshipVariant
}

export default function FlagshipProjectShowcase({
  project,
  index,
  variant = 'card',
}: FlagshipProjectShowcaseProps) {
  const toneBySlug: Record<
    string,
    { accent: string; surface: string; surfaceStrong: string; glow: string }
  > = {
    mentra: {
      accent: '#1552A4',
      surface: '#EEF5FF',
      surfaceStrong: '#DBEAFF',
      glow: 'rgba(21, 82, 164, 0.24)',
    },
    'transfi-project': {
      accent: '#313EBB',
      surface: '#F1F2FF',
      surfaceStrong: '#E1E4FF',
      glow: 'rgba(49, 62, 187, 0.24)',
    },
    'clawed-chat': {
      accent: '#8B5C2C',
      surface: '#FFF4E9',
      surfaceStrong: '#F9E5D2',
      glow: 'rgba(139, 92, 44, 0.24)',
    },
    jugalbandi: {
      accent: '#9A4F1A',
      surface: '#FFF1E6',
      surfaceStrong: '#FFE1CB',
      glow: 'rgba(154, 79, 26, 0.24)',
    },
  }
  const tone = toneBySlug[project.slug] ?? {
    accent: '#1A1A1A',
    surface: '#F5F5F5',
    surfaceStrong: '#EBEBEB',
    glow: 'rgba(26, 26, 26, 0.16)',
  }
  const mediaPositionBySlug: Record<string, { lead: string; card: string }> = {
    mentra: { lead: '52% 28%', card: '52% 24%' },
    'transfi-project': { lead: '50% 16%', card: '50% 22%' },
    'clawed-chat': { lead: '50% 18%', card: '50% 18%' },
    jugalbandi: { lead: '50% 34%', card: '50% 36%' },
  }
  const mediaPosition = mediaPositionBySlug[project.slug] ?? { lead: '50% 50%', card: '50% 50%' }
  const compactRole = project.summaryRole?.split(',')[0]?.trim() ?? project.summaryRole
  const compactTeamBySlug: Record<string, string> = {
    mentra: '1 designer + 4 engineers',
    'transfi-project': 'Solo designer + 6 engineers',
    'clawed-chat': '1 designer + 3 engineers',
    jugalbandi: 'Solo build / NYU ITP',
  }
  const compactTeam = compactTeamBySlug[project.slug] ?? project.summaryTeam
  const proofStats = project.summaryStats?.slice(0, variant === 'lead' ? 3 : 2) ?? []
  const primaryStat = proofStats[0]
  const secondaryStat = proofStats[1]
  const orderedMeta = [
    String(index + 1).padStart(2, '0'),
    project.tag,
    project.summaryTimeline || project.year,
  ]
  const proofDetails = [
    { label: 'Role', value: compactRole },
    { label: 'Team', value: compactTeam },
    { label: 'Timeline', value: project.summaryTimeline },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value))
  const cardMeta = [project.summaryTimeline || project.year, compactRole].filter(
    (value): value is string => Boolean(value),
  )
  const requestAccess = isRequestAccessProject(project)
  const statusCopy = requestAccess
    ? 'Quick glimpse first. Full details are shared by request.'
    : 'Starts with a 2 min summary, then opens into the full case study.'
  const imageSource = project.summaryImage || project.image
  const imageAlt = project.summaryImageAlt || `${project.name} showcase`

  const style = {
    '--flagship-accent': tone.accent,
    '--flagship-surface': tone.surface,
    '--flagship-surface-strong': tone.surfaceStrong,
    '--flagship-glow': tone.glow,
    '--flagship-object-position': variant === 'lead' ? mediaPosition.lead : mediaPosition.card,
  } as CSSProperties

  if (variant === 'lead') {
    return (
      <article className="wr-flagship-lead" style={style} data-project={project.slug}>
        <div className="wr-flagship-lead__copy">
          <div className="wr-flagship-lead__intro">
            <div className="wr-flagship-topline">
              {orderedMeta.map((item) => (
                <span key={item} className="wr-flagship-topline__item">{item}</span>
              ))}
              {requestAccess ? <span className="wr-flagship-topline__item wr-flagship-topline__item--quiet">Quick glimpse</span> : null}
            </div>

            <div className="wr-flagship-copyblock">
              <h2 className="wr-flagship-lead__title">{project.name}</h2>
              <p className="wr-flagship-lead__problem">{project.summaryProblem || project.desc}</p>
              {project.summaryOutcome ? (
                <p className="wr-flagship-lead__outcome">{project.summaryOutcome}</p>
              ) : null}
            </div>
          </div>

          {proofDetails.length ? (
            <div className="wr-flagship-meta-rail">
              {proofDetails.map((detail) => (
                <div key={detail.label} className="wr-flagship-meta-pill">
                  <span className="wr-flagship-meta-pill__label">{detail.label}</span>
                  <p className="wr-flagship-meta-pill__value">{detail.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="wr-flagship-lead__bottom">
            {project.testimonial ? (
              <blockquote className="wr-flagship-testimonial">
                <p>{project.testimonial.quote}</p>
                <cite>{project.testimonial.cite}</cite>
              </blockquote>
            ) : (
              <p className="wr-flagship-note">{statusCopy}</p>
            )}

            <div className="wr-flagship-lead__actions">
              {project.testimonial ? <span className="wr-flagship-note">{statusCopy}</span> : null}
              <Link to={`/${project.slug}`} className="wr-flagship-cta figma-hover">
                Open case study
                <FigmaSelect />
              </Link>
            </div>
          </div>
        </div>

        <Link
          to={`/${project.slug}`}
          className="wr-flagship-lead__media figma-hover"
          aria-label={`Open ${project.name} case study`}
        >
          <div className="wr-flagship-media__chrome">
            <span className="wr-flagship-media__eyebrow">Best place to start</span>
          </div>

          <img
            src={imageSource}
            alt={imageAlt}
            loading="eager"
            decoding="async"
          />

          {proofStats.length ? (
            <div className="wr-flagship-proof-rail">
              {proofStats.map((stat) => (
                <div key={stat.label} className="wr-flagship-proof-chip">
                  <span className="wr-flagship-proof-chip__value">{stat.value}</span>
                  <span className="wr-flagship-proof-chip__label">{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          <FigmaSelect />
        </Link>
      </article>
    )
  }

  return (
    <article className="wr-flagship-card" style={style} data-project={project.slug}>
      <Link
        to={`/${project.slug}`}
        className="wr-flagship-card__media figma-hover"
        aria-label={`Open ${project.name} case study`}
      >
        <div className="wr-flagship-card__top">
          <span className="wr-flagship-card__pill">{String(index + 1).padStart(2, '0')}</span>
          <span className="wr-flagship-card__pill">{project.tag}</span>
        </div>
        <img
          src={imageSource}
          alt={imageAlt}
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
        />
        {primaryStat ? (
          <div className="wr-flagship-card__stat">
            <span className="wr-flagship-card__stat-value">{primaryStat.value}</span>
            <span className="wr-flagship-card__stat-label">{primaryStat.label}</span>
          </div>
        ) : null}
        <FigmaSelect />
      </Link>

          <div className="wr-flagship-card__body">
            <div className="wr-flagship-card__meta">
              <span className="wr-flagship-card__index">{String(index + 1).padStart(2, '0')}</span>
              {cardMeta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

        <div className="wr-flagship-card__copy">
          <h3 className="wr-flagship-card__title">{project.name}</h3>
          <p className="wr-flagship-card__summary">{project.summaryOutcome || project.desc}</p>
        </div>

        {secondaryStat ? (
          <div className="wr-flagship-card__secondary">
            <span className="wr-flagship-card__secondary-value">{secondaryStat.value}</span>
            <small className="wr-flagship-card__secondary-label">{secondaryStat.label}</small>
          </div>
        ) : null}

        {proofDetails.length ? (
          <div className="wr-flagship-card__facts">
            {proofDetails.slice(0, 2).map((detail) => (
              <span key={detail.label} className="wr-flagship-card__fact">
                <strong>{detail.label}</strong>
                {detail.value}
              </span>
            ))}
          </div>
        ) : null}

        <div className="wr-flagship-card__footer">
          <span className="wr-flagship-card__note">{requestAccess ? 'Quick glimpse first' : '2 min summary first'}</span>
          <Link to={`/${project.slug}`} className="wr-flagship-card__cta figma-hover">
            Case study
            <FigmaSelect />
          </Link>
        </div>
      </div>
    </article>
  )
}
