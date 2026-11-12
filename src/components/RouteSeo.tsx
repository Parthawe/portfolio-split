import { portfolio } from '../config/portfolio'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { categories } from '../data/categories'
import { getProject, isHiddenProject, isRoutableProject, visibleProjects, type Project } from '../data/projects'
import {
  SITE_NAME,
  SITE_ORIGIN,
  SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
} from '../config/site'

const DEFAULT_IMAGE = DEFAULT_OG_IMAGE
const CATEGORY_ALIASES: Record<string, string> = {
  '/ux': 'ux-design',
  '/ui': 'ux-design',
  '/design-engineer': 'design-engineering',
  '/creative-tech': 'design-engineering',
  '/brand': 'brand-visual',
  '/healthcare': 'design-for-good',
}

const MOTION_ROUTE_META: Record<string, { title: string; description: string; image: string }> = {
  '/perplexity': {
    title: 'Perplexity Creative Studio Motion Study · Parth Pawar',
    description: 'An independent Creative Studio motion proposal for Perplexity Computer, Deep Research, and Comet.',
    image: DEFAULT_IMAGE,
  },
  '/motion': {
    title: 'Motion Design · Parth Pawar',
    description: 'Motion systems, campaign archives, editorial studies, and production plans grounded in real product and brand behavior.',
    image: '/Assets/mockups/projects/vishwaconclave_16x9.webp',
  },
  '/motion/vishwa-conclave-motion': {
    title: 'VishwaConclave Motion Case Study · Parth Pawar',
    description: 'Official campaign archive showing how one event identity connected theme films, speaker reveals, web, merchandise, and programming.',
    image: '/Assets/mockups/projects/vishwaconclave_16x9.webp',
  },
  '/motion/mentra-motion-language': {
    title: 'Mentra Motion Language · Parth Pawar',
    description: 'A product-grounded advertising and motion-system proposal using original Mentra source assets.',
    image: '/Assets/mockups/projects/mentra_16x9.webp',
  },
  '/motion/transfi-identity-motion': {
    title: 'TransFi Identity Motion · Parth Pawar',
    description: 'A motion system that makes a complex payment observable from intent through delivery.',
    image: '/Assets/mockups/projects/transfi-project_16x9.webp',
  },
  '/motion/editing-motion-stories': {
    title: 'Cutting Systems into Stories · Parth Pawar',
    description: 'Four completed project films examined through story structure, pacing, motion graphics, and delivery.',
    image: '/Assets/mockups/projects/enigma_16x9.webp',
  },
}

interface RouteMeta {
  title: string
  description: string
  image: string
  url: string
  type: 'website' | 'article'
  robots: string
  imageAlt?: string
  schema?: Record<string, unknown>
}

function toAbsoluteUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

function parseYear(year?: string) {
  const match = year?.match(/\d{4}/)
  return match?.[0]
}

function getHomeSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'en-US',
      },
      {
        '@type': 'Person',
        name: 'Parth Pawar',
        url: SITE_URL,
        jobTitle: 'Product Designer',
        image: `${SITE_URL}/Assets/character/me/1.webp`,
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'New York University Tisch School of the Arts',
        },
        sameAs: [
          'https://www.linkedin.com/in/parth-pawar-1501/',
          'https://www.instagram.com/designwhich.works',
        ],
        knowsAbout: [
          'UX Design',
          'AI Wearables',
          'Fintech',
          'Design Engineering',
          'Physical Computing',
        ],
      },
    ],
  }
}

function getRouteMeta(pathname: string): RouteMeta {
  const url = pathname === '/' ? SITE_URL : `${SITE_URL}${pathname}`
  const robots = 'noindex, nofollow'

  if (pathname === '/process' || pathname.startsWith('/process/')) {
    const project = getProject(pathname.split('/')[2] || '')
    const valid = pathname === '/process' || (project && isRoutableProject(project))
    return { title: valid ? `${project ? project.name + ' · ' : ''}References & process · Parth Pawar` : 'Page not found · Parth Pawar', description: 'Public project artifacts, documented influences, experiments, and design decisions.', image: toAbsoluteUrl(DEFAULT_IMAGE), url, type: project ? 'article' : 'website', robots: valid ? robots : 'noindex, nofollow' }
  }
  if (pathname === '/') {
    return {
      title: `${portfolio.name} · Parth Pawar`,
      description: portfolio.description,
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url,
      type: 'website',
      robots,
      imageAlt: DEFAULT_OG_IMAGE_ALT,
      schema: getHomeSchema(),
    }
  }

  if (pathname === '/work') {
    return {
      title: 'Work · Parth Pawar',
      description: portfolio.description,
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url,
      type: 'website',
      robots,
      imageAlt: 'Selected product design and interaction work by Parth Pawar.',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Work',
        url,
        description: 'Selected work by Parth Pawar.',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: visibleProjects.slice(0, 12).map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/${project.slug}`,
            name: project.name,
          })),
        },
      },
    }
  }

  if (pathname === '/about') {
    return {
      title: 'About · Parth Pawar',
      description: 'About Parth Pawar, Product Designer and Head of UI/UX at Mentra. Experience across AI wearables, fintech, civic tools, and design engineering.',
      image: toAbsoluteUrl('/Assets/character/me/1.webp'),
      url,
      type: 'website',
      robots,
      imageAlt: 'Portrait of Parth Pawar, Product Designer.',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        name: 'About Parth Pawar',
        url,
        mainEntity: {
          '@type': 'Person',
          name: 'Parth Pawar',
          jobTitle: 'Product Designer',
          worksFor: {
            '@type': 'Organization',
            name: 'Mentra',
          },
        },
      },
    }
  }

  if (pathname === '/accessibility') {
    return {
      title: 'Accessibility · Parth Pawar',
      description: 'Accessibility notes for Parth Pawar portfolio, including current decisions, known concerns, and planned improvements.',
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url,
      type: 'website',
      robots,
      imageAlt: DEFAULT_OG_IMAGE_ALT,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Accessibility',
        url,
        description: 'Accessibility notes for Parth Pawar portfolio.',
      },
    }
  }

  if (pathname === '/playbook') {
    return {
      title: 'Design Playbook · Parth Pawar',
      description: 'Principles, methods, and practical notes from Parth Pawar on designing trustworthy product systems.',
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url,
      type: 'website',
      robots,
      imageAlt: DEFAULT_OG_IMAGE_ALT,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Design Playbook',
        url,
        description: 'Principles and practical notes on designing trustworthy product systems.',
        author: { '@type': 'Person', name: 'Parth Pawar', url: SITE_URL },
      },
    }
  }

  if (pathname === '/healthapp') {
    return {
      title: 'Health App Concept · Parth Pawar',
      description: 'A healthcare product design concept by Parth Pawar focused on making complex information easier to understand and act on.',
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url,
      type: 'article',
      robots,
      imageAlt: 'Health app product design concept by Parth Pawar.',
    }
  }

  const motionMeta = MOTION_ROUTE_META[pathname]
  if (motionMeta) {
    return {
      title: motionMeta.title,
      description: motionMeta.description,
      image: toAbsoluteUrl(motionMeta.image),
      url,
      type: pathname === '/motion' ? 'website' : 'article',
      robots,
      imageAlt: `${motionMeta.title.replace(' · Parth Pawar', '')} by Parth Pawar.`,
    }
  }

  const categorySlug = CATEGORY_ALIASES[pathname] || pathname.replace(/^\//, '')
  const category = categories.find(item => item.slug === categorySlug)
  if (category) {
    const categoryUrl = `${SITE_URL}/${category.slug}`
    const projectsInCategory = [category.featured, ...category.moreProjects.flat()]
      .map(project => getProject(project.slug))
      .filter((project): project is Project => Boolean(project && !isHiddenProject(project)))
    return {
      title: category.metaTitle,
      description: category.metaDescription,
      image: toAbsoluteUrl(projectsInCategory[0]?.image || category.featured.image),
      url: categoryUrl,
      type: 'website',
      robots,
      imageAlt: `${category.title} portfolio work by Parth Pawar.`,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.title} ${category.titleAccent}`,
        url: categoryUrl,
        description: category.metaDescription,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projectsInCategory.map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/${project.slug}`,
            name: project.name,
          })),
        },
      },
    }
  }

  const slug = pathname.replace(/^\//, '')
  const project = getProject(slug)
  if (project && !isRoutableProject(project)) {
    return {
      title: 'Page not found · Parth Pawar',
      description: 'This page is not available in the public portfolio.',
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url,
      type: 'website',
      robots: 'noindex, nofollow',
    }
  }
  if (project) {
    const year = parseYear(project.year)
    return {
      title: `${project.name} Case Study · Parth Pawar`,
      description: `${project.desc}. Case study by Parth Pawar.`,
      image: toAbsoluteUrl(project.image || DEFAULT_IMAGE),
      url,
      type: 'article',
      robots,
      imageAlt: project.cardMockupAlt || `${project.name} case study by Parth Pawar.`,
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CreativeWork',
            name: `${project.name} Case Study`,
            headline: `${project.name} Case Study`,
            url,
            image: toAbsoluteUrl(project.image || DEFAULT_IMAGE),
            description: `${project.desc}.`,
            inLanguage: 'en-US',
            author: {
              '@type': 'Person',
              name: 'Parth Pawar',
              url: SITE_URL,
            },
            creator: {
              '@type': 'Person',
              name: 'Parth Pawar',
            },
            datePublished: year,
            keywords: [project.tag, project.category, 'Parth Pawar', 'case study'],
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Work', item: `${SITE_URL}/work` },
              { '@type': 'ListItem', position: 2, name: project.name, item: url },
            ],
          },
        ],
      },
    }
  }

  if (pathname === '/notes' || pathname === '/guestbook') {
    return {
      title: 'Notes · Parth Pawar',
      description: 'Visitor notes and feedback on Parth Pawar’s portfolio. Leave a hello or share a thought.',
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url: `${SITE_URL}/notes`,
      type: 'website',
      robots,
    }
  }

  if (pathname === '/studio') {
    return {
      title: 'Studio · Parth Pawar',
      description: 'Interactive design studio by Parth Pawar.',
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url,
      type: 'website',
      robots,
    }
  }

  if (pathname === '/book') {
    return {
      title: 'Book · Parth Pawar',
      description: 'Portfolio book by Parth Pawar.',
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url,
      type: 'website',
      robots,
    }
  }

  if (pathname === '/graveyard') {
    return {
      title: 'Graveyard · Parth Pawar',
      description: 'Archive of previous portfolio experiments by Parth Pawar.',
      image: toAbsoluteUrl(DEFAULT_IMAGE),
      url,
      type: 'website',
      robots,
    }
  }

  return {
    title: 'Page not found · Parth Pawar',
    description: 'This page is not available in the public portfolio.',
    image: toAbsoluteUrl(DEFAULT_IMAGE),
    url,
    type: 'website',
    robots: 'noindex, nofollow',
    imageAlt: DEFAULT_OG_IMAGE_ALT,
  }
}

export default function RouteSeo() {
  const location = useLocation()
  const pathname = location.pathname === '/'
    ? '/'
    : location.pathname.replace(/\/+$/, '')
  const meta = getRouteMeta(pathname)

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={meta.robots} />
      <meta name="googlebot" content={meta.robots} />
      <link rel="canonical" href={meta.url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content={meta.type} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:image:alt" content={meta.imageAlt || DEFAULT_OG_IMAGE_ALT} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <meta name="twitter:image:alt" content={meta.imageAlt || DEFAULT_OG_IMAGE_ALT} />

      {meta.schema ? (
        <script type="application/ld+json">{JSON.stringify(meta.schema)}</script>
      ) : null}
    </Helmet>
  )
}
