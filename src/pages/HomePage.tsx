import { isExperimental, portfolio, sibling, siblingHome } from '../config/portfolio';
import { useThemeMode } from '../hooks/useThemeMode';
import ExperienceBoundary from '../components/ExperienceBoundary';
import { useState, useEffect, lazy, Suspense, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Nav from '../components/Nav'
import ClientsMarquee from '../components/ClientsMarquee';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import TextHighlight from '../components/TextHighlight';
import FigmaSelect from '../components/FigmaSelect';
import FigmaFrameLabel from '../components/FigmaFrameLabel';
import { useDeferredMount } from '../hooks/useDeferredMount';
import { useInView } from '../hooks/useInView';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePerformanceDegraded } from '../hooks/usePerformanceDegraded';
import { canUseWebGL, useWebGLAvailable } from '../hooks/useWebGLAvailable';
import { featuredProjects, homepageSelectedProjects } from '../data/projects';
import { DEFAULT_OG_IMAGE, SITE_ORIGIN, SITE_URL } from '../config/site';
import { beginSceneStartup, isLowPowerDevice } from '../utils/performance';
import ParthDoesSection from '../components/ParthDoesSection';
import '../styles/homepage-wr.css';
import { preloadHeroEnvironmentAsset } from '../utils/preloadHeroEnvironment';


const loadHeroScene = () => import('../components/HeroScene');
const HeroScene = lazy(loadHeroScene);
const CategoryObject3D = lazy(() => import('../components/CategoryObject3D'));

const disciplines = (isExperimental ? [
  { label: 'Installations', slug: 'installations', link: '/installations' },
] : [
  { label: 'UX Design', slug: 'ux-design', link: '/ux-design' },
  { label: 'UX Research', slug: 'ux-research', link: '/ux-research' },
  { label: 'AI & Wearables', slug: 'ai', link: '/ai' },
  { label: 'Design Engineering', slug: 'design-engineering', link: '/design-engineering' },
  { label: 'Installations', slug: 'installations', link: '/installations' },
  { label: 'Brand & Visual', slug: 'brand-visual', link: '/brand-visual' },
  { label: 'Design for Good', slug: 'design-for-good', link: '/design-for-good' },
].filter(discipline => discipline.slug !== 'installations' && discipline.slug !== 'brand-visual'));

function distributeArchiveProjects<T>(items: T[], columnCount: number) {
  const columns = Array.from({ length: Math.max(1, columnCount) }, () => [] as T[]);
  items.forEach((item, index) => {
    columns[index % columns.length].push(item);
  });
  return columns;
}

const identityTabs = isExperimental ? [{
  id: 'who-i-am',
  label: 'What I make',
  heading: 'I build instruments, installations, and interfaces you can explore through sound, light, and touch.',
  script: 'what I make',
}] as const : [
  {
    id: 'who-i-am',
    label: 'Who I am',
    heading: 'Product designer who turns ambiguous systems into trusted product experiences.',
    script: 'who i am',
  },
  {
    id: 'care-about',
    label: 'What I care about',
    heading: 'I care about the moment complex technology starts feeling calm, legible, and human.',
    script: 'care about',
  },
  {
    id: 'believe-in',
    label: 'What I believe in',
    heading: 'I believe trust is built by interface behavior, not by marketing language.',
    script: 'believe in',
  },
  {
    id: 'can-cook',
    label: 'What I can cook',
    heading: 'I can cook product strategy, UX systems, prototypes, motion, and shipped front-end.',
    script: 'can cook',
  },
  {
    id: 'upto',
    label: "What I'm up to",
    heading: 'Currently designing wearable interfaces, companion apps, store flows, and launch surfaces.',
    script: 'up to',
  },
] as const;

const IDENTITY_SLIDE_INTERVAL_MS = 6500;

export default function HomePage() {
  const heroStillTheme = useThemeMode() ? 'dark' : 'light';
  const navigate = useNavigate();
  const [identityTab, setIdentityTab] = useState<(typeof identityTabs)[number]['id']>('who-i-am');
  const [heroWebOpen, setHeroWebOpen] = useState(false);
  const [heroSceneReady, setHeroSceneReady] = useState(false);
  const [heroSceneTimedOut, setHeroSceneTimedOut] = useState(false);
  const endSceneStartup = useRef<((settleMs?: number) => void) | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [disciplinesRef, disciplinesInView] = useInView<HTMLElement>(0.05, '180px 0px');
  const coarsePointer = useMediaQuery('(hover: none), (pointer: coarse)');
  const archiveSingleColumn = useMediaQuery('(max-width: 360px)');
  const archiveTwoColumn = useMediaQuery('(max-width: 1100px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const performanceDegraded = usePerformanceDegraded();
  const webglAvailable = useWebGLAvailable();
  const lowPowerDevice = isLowPowerDevice();
  const allowDecorative3D = !prefersReducedMotion;
  // Resolve capability before the deferred mount can race the hook's first effect.
  const heroSceneUnavailable = isExperimental || !allowDecorative3D || performanceDegraded || !webglAvailable || !canUseWebGL() || heroSceneTimedOut;
  useEffect(() => {
    if (!heroSceneUnavailable) return;
    setHeroSceneReady(false);
    // The renderer can unmount while its web is expanded. Clear the overlay
    // too, so the matching still and copy remain visible during fallback.
    setHeroWebOpen(false);
  }, [heroSceneUnavailable]);
  const [readerMoved, setReaderMoved] = useState(() => typeof window !== 'undefined' && window.scrollY > 40);
  useEffect(() => {
    if (readerMoved) return;
    const onScroll = () => { if (window.scrollY > 40) setReaderMoved(true); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [readerMoved]);
  const cardPreloadMargin = heroSceneReady || heroSceneUnavailable || readerMoved ? '600px 0px' : '0px';
  const mountHeroScene = useDeferredMount(!heroSceneUnavailable, {
    afterPaint: !coarsePointer && !lowPowerDevice,
    timeout: coarsePointer ? 900 : lowPowerDevice ? 1100 : 1200,
    delayMs: coarsePointer ? 220 : lowPowerDevice ? 400 : 350,
  });
  const mountDisciplineObjects = useDeferredMount(allowDecorative3D && disciplinesInView, { timeout: lowPowerDevice ? 2200 : 1400, delayMs: lowPowerDevice ? 360 : 150 });
  const archiveProjects = homepageSelectedProjects;
  const archiveColumnCount = archiveSingleColumn ? 1 : archiveTwoColumn ? 2 : 3;
  const archiveColumns = useMemo(
    () => distributeArchiveProjects(archiveProjects, archiveColumnCount),
    [archiveProjects, archiveColumnCount]
  );
  const activeIdentity = identityTabs.find(tab => tab.id === identityTab) ?? identityTabs[0];
  const flagshipColumns = [
    featuredProjects.filter((_, index) => index === 0 || index === 2),
    featuredProjects.filter((_, index) => index === 1 || index === 3),
  ];
  const getFlagshipCoverShape = (slug: string): 'portrait' | 'square' =>
    slug === 'mentra' || slug === 'jugalbandi' ? 'portrait' : 'square';


  // Fetch the visible hero while its existing idle mount waits. Loading the
  // module does not create a renderer; constrained devices keep their fallback.
  useEffect(() => {
    if (heroSceneUnavailable || !canUseWebGL()) return;
    let cancelled = false;
    const finishStartup = beginSceneStartup();
    endSceneStartup.current = finishStartup;
    const preload = preloadHeroEnvironmentAsset();
    void loadHeroScene().catch(() => {
      if (!cancelled) setHeroSceneTimedOut(true);
    });
    return () => { cancelled = true; preload?.remove(); finishStartup(); };
  }, [heroSceneUnavailable]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setIdentityTab((current) => {
        const currentIndex = identityTabs.findIndex((tab) => tab.id === current);
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % identityTabs.length;
        return identityTabs[nextIndex].id;
      });
    }, IDENTITY_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!mountHeroScene || heroSceneReady || heroSceneUnavailable) return;
    const timeoutId = window.setTimeout(() => setHeroSceneTimedOut(true), 15000);
    return () => window.clearTimeout(timeoutId);
  }, [heroSceneReady, heroSceneUnavailable, mountHeroScene]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || prefersReducedMotion) return;

    let rafId = 0;
    const update = () => {
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      hero.style.setProperty('--wr-hero-aurora-y', `${progress * -15}%`);
      hero.style.setProperty('--wr-hero-scene-opacity', `${Math.max(0, 1 - progress * 1.25)}`);
      rafId = 0;
    };
    const schedule = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <Helmet>
        <title>{portfolio.name} · Parth Pawar</title>
        <meta name="description" content={portfolio.description} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${portfolio.name} · Parth Pawar`} />
        <meta property="og:description" content={portfolio.description} />
        <meta property="og:image" content={`${SITE_ORIGIN}${DEFAULT_OG_IMAGE}`} />
        <link rel="canonical" href={SITE_URL} />
      </Helmet>

      <section
        className={`wr-hero${isExperimental ? " wr-hero--plays" : ""}${heroSceneReady && !heroSceneUnavailable ? ' is-scene-ready' : ''}${heroSceneUnavailable ? ' wr-hero--no-scene' : ''}${heroWebOpen ? ' wr-hero--web-open' : ''}`}
        id="hero"
        ref={heroRef}
        style={{ position: 'relative' }}
      >
        <FigmaFrameLabel name="Hero" />
        <div className="grain-section" aria-hidden="true" />
        <div className="wr-hero-aurora-bottom" aria-hidden="true" />
        <div className="wr-hero-web-scrim" aria-hidden="true" />

        {isExperimental ? <figure className="plays-hero-object">
          <img src="/Assets/Projects/Jugalbandi/Photos/538A3938_nsquare_23.webp" alt="Jugalbandi, a sculptural instrument for a human–machine duet" fetchPriority="high" />
          <figcaption><Link to="/jugalbandi">Jugalbandi</Link></figcaption>
        </figure> : <div className="wr-hero-still" aria-hidden="true">
          <img src={`/Assets/hero/connected-objects-${heroStillTheme}-480.webp`} srcSet={`/Assets/hero/connected-objects-${heroStillTheme}-480.webp 480w, /Assets/hero/connected-objects-${heroStillTheme}-749.webp 749w`} sizes="(max-width: 767px) 90vw, 52vw" width="749" height="759" alt="" fetchPriority="high" decoding="async" />
        </div>}
        <div className="wr-hero-3d">
          {mountHeroScene ? (
            <ExperienceBoundary onError={() => setHeroSceneTimedOut(true)}><Suspense fallback={null}>
              <HeroScene
                onNavigate={navigate}
                onExpandedChange={setHeroWebOpen}
                onReady={() => {
                  // Keep the existing 2.2s warmup after the first real frame.
                  endSceneStartup.current?.(2200);
                  setHeroSceneReady(true);
                  setHeroSceneTimedOut(false);
                }}
              />
            </Suspense></ExperienceBoundary>
          ) : null}
        </div>

        {(!heroSceneReady && !heroSceneUnavailable || heroSceneTimedOut) && <div className="hero-scene-status" role="status">
          {heroSceneTimedOut ? <>The interactive scene could not load. <button type="button" onClick={() => window.location.reload()}>Reload scene</button></> : 'Preparing the interactive scene…'}
        </div>}
        <div className="wr-hero-copy">
          <h1 className="wr-hero-title wr-hero-stage wr-hero-stage--title">{portfolio.heading}</h1>
          <p className="wr-hero-dek wr-hero-stage wr-hero-stage--dek">
            {portfolio.description}
          </p>
        </div>

      </section>

      <Nav />

      <main id="main-content">
        <div className="abt-paper">
          <section className="wr-featured-v2" id="works" style={{ position: 'relative' }}>
            <FigmaFrameLabel name="Featured Work" />
            <div className="wr-featured-v2-inner">
              <div className="reveal">
                {!isExperimental && <ClientsMarquee />}
              </div>

              <div className="wr-section-head">
                <span className="wr-label">FLAGSHIP WORK</span>
                <TextHighlight as="span" className="wr-section-highlight">Start with these four.</TextHighlight>
                <Link to="/work" className="wr-arrow-btn figma-hover">View all work &rarr;<FigmaSelect /></Link>
              </div>

              <div className="wr-feat-grid">
                {flagshipColumns.map((column, columnIndex) => (
                  <div className="wr-feat-column" key={`flagship-column-${columnIndex}`}>
                    {column.map((project) => {
                      const index = featuredProjects.findIndex(item => item.slug === project.slug);
                      const featuredInfo = [
                        project.desc,
                        project.summaryRole?.replace(/\.$/, ''),
                        ...(project.summaryStats?.slice(0, 2).map(stat => `${stat.label} ${stat.value}`) ?? []),
                      ]
                        .filter(Boolean)
                        .join(' / ');
                      const hoverMedia = ['mentra', 'jugalbandi'].includes(project.slug) ? undefined : project.hoverMedia;

                      return (
                        <div
                          key={project.slug}
                          className="wr-motion-item reveal"
                          data-project={project.slug}
                          style={{ transitionDelay: `${index * 0.06}s` }}
                        >
                          <ProjectCard
                            slug={project.slug}
                            name={project.name}
                            image={project.image}
                            hoverMediaSrc={hoverMedia?.src}
                            hoverMediaKind={hoverMedia?.kind}
                            hoverMediaAlt={hoverMedia?.alt}
                            tag={project.tag}
                            year={project.year}
                            marqueeText={featuredInfo}
                            marqueeSpeed={2}
                            loading="lazy"
                            deferUntilNearView
                            preloadMargin={cardPreloadMargin}
                            featured
                            coverShape={getFlagshipCoverShape(project.slug)}
                            nda={project.nda}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>
          </section>

          <section className="wr-identity" aria-labelledby="wr-identity-title" style={{ position: 'relative' }}>
            <FigmaFrameLabel name="Identity" />
            <div className="wr-identity-inner">
              <div className="wr-identity-tabs" role="tablist" aria-label="Identity prompts">
                {identityTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    id={`identity-tab-${tab.id}`}
                    className={`wr-identity-tab${activeIdentity.id === tab.id ? ' is-active' : ''}`}
                    role="tab"
                    aria-selected={activeIdentity.id === tab.id}
                    aria-controls="wr-identity-panel"
                    onClick={() => setIdentityTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="wr-identity-progress" aria-hidden="true">
                <span key={activeIdentity.id} />
              </div>

              <div
                key={activeIdentity.id}
                id="wr-identity-panel"
                className="wr-identity-panel wr-identity-panel--enter"
                role="tabpanel"
                aria-labelledby={`identity-tab-${activeIdentity.id}`}
              >
                <h2 className="wr-identity-title" id="wr-identity-title">
                  {activeIdentity.heading}
                </h2>
                <p className="wr-identity-script" aria-hidden="true">{activeIdentity.script}</p>
              </div>

            </div>
          </section>

          {!isExperimental && <ParthDoesSection />}

          <section
            className="wr-disciplines"
            id="disciplines"
            style={{ position: 'relative' }}
            ref={disciplinesRef}
            hidden={!heroSceneReady || heroSceneUnavailable}
          >
            <FigmaFrameLabel name="Disciplines" />
            <div className="wrap wr-disciplines-grid">
              {disciplines.map((d, i) => (
                <div
                  key={d.slug}
                  className="wr-motion-item wr-motion-item--discipline reveal"
                  style={{ transitionDelay: `${i * 0.05}s` }}
                >
                  <Link to={d.link} className="wr-discipline-item figma-hover">
                    <div className="wr-discipline-obj" aria-hidden="true">
                      {mountDisciplineObjects ? (
                        <Suspense fallback={null}>
                          <CategoryObject3D slug={d.slug} size={80} />
                        </Suspense>
                      ) : null}
                    </div>
                    <span className="wr-discipline-label">{d.label}</span>
                    <FigmaSelect />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="wr-archive" style={{ position: 'relative' }}>
            <FigmaFrameLabel name="Selected Archive" />
            <div className="wr-archive-inner">
              <div className="wr-section-head">
                <div className="wr-section-title-group">
                  <span className="wr-label">SELECTED ARCHIVE</span>
                  <TextHighlight as="span" className="wr-section-highlight">
                    More selected work
                  </TextHighlight>
                </div>
                <div className="wr-section-actions">
                  <Link to="/work" className="wr-arrow-btn figma-hover">Browse All &rarr;<FigmaSelect /></Link>
                </div>
              </div>

              <div className="wr-archive-grid" id="homepage-project-archive">
                {archiveColumns.map((column, columnIndex) => (
                  <div className="wr-archive-column" key={`home-archive-column-${columnIndex}`}>
                    {column.map((p, rowIndex) => {
                      const originalIndex = rowIndex * archiveColumnCount + columnIndex;
                      const delay = columnIndex * 0.1 + rowIndex * 0.06;
                      return (
                        <div
                          key={p.slug}
                          className="wr-motion-item reveal"
                          style={{ transitionDelay: `${delay}s` }}
                          data-archive-index={originalIndex}
                        >
                          <ProjectCard deferUntilNearView preloadMargin={cardPreloadMargin} slug={p.slug} name={p.name} image={p.image} tag={p.tag} year={p.year} desc={p.desc} nda={p.nda} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="wr-archive-reveal">
                <Link to="/work" className="wr-arrow-btn figma-hover wr-archive-reveal__button">
                  Open full archive &rarr;
                  <FigmaSelect />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="wrap preview-sibling"><a href={siblingHome}>{sibling.name} &rarr;</a></div>
      <Footer />
    </>
  );
}
