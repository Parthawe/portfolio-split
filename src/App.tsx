import { isExperimental, portfolio, projectSlugs, siblingHome, siblingSlugs } from './config/portfolio'
import { lazy, Suspense, Component, useEffect, type ReactNode } from 'react'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { ProjectReturnProvider } from './components/ProjectReturnContext'
import RootLayout from './components/RootLayout'
import Nav from './components/Nav'
import PixelLoaderVisual from './components/PixelLoaderVisual'
import PointerCursorGlyph from './components/PointerCursorGlyph'
import { projectRoutes } from './data/projectRoutes'

type ErrorBoundaryProps = { children: ReactNode; resetKey: string }

class ErrorBoundaryInner extends Component<ErrorBoundaryProps, { hasError: boolean; prevKey: string }> {
  state = { hasError: false, prevKey: '' }
  static getDerivedStateFromError() { return { hasError: true } }
  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: { hasError: boolean; prevKey: string }) {
    // Reset error state when route changes
    if (props.resetKey !== state.prevKey) {
      return { hasError: false, prevKey: props.resetKey }
    }
    return { prevKey: props.resetKey }
  }
  render() {
    if (this.state.hasError) {
      return (
        <>
          <Nav />
          <div className="app-error" role="alert">
            <main className="app-error__main">
              <div className="app-error__wordmark" aria-hidden="true">ERR</div>

              <section className="app-error__canvas" aria-labelledby="app-error-title">
                <span className="app-error__layer" aria-hidden="true">Frame / unavailable</span>

                <div className="app-error__selection" aria-hidden="true">
                  <i className="app-error__handle app-error__handle--tl" />
                  <i className="app-error__handle app-error__handle--tr" />
                  <i className="app-error__handle app-error__handle--br" />
                  <i className="app-error__handle app-error__handle--bl" />
                  <span>0 x 0</span>
                </div>

                <div className="app-error__cursor" aria-hidden="true">
                  <PointerCursorGlyph className="app-error__cursor-glyph" />
                  <span>parth</span>
                </div>

                <div className="app-error__copy">
                  <span className="app-error__eyebrow">That was not supposed to happen.</span>
                  <h1 id="app-error-title">This frame stopped rendering.</h1>
                  <p>Reload it, or head home. Your place is saved.</p>
                  <div className="app-error__actions">
                    <button type="button" onClick={() => window.location.reload()}>Retry frame</button>
                    <a href={import.meta.env.BASE_URL}>Homepage</a>
                  </div>
                </div>

                <aside className="app-error__note" aria-hidden="true">
                  <strong>Quick repair?</strong>
                  <span>I may have pushed one pixel too far.</span>
                  <em>- p.</em>
                </aside>
              </section>

              <footer className="app-error__foot" aria-hidden="true">
                <span>Autosaved</span>
                <span>Design systems should fail gracefully, too.</span>
              </footer>
            </main>
          </div>
        </>
      )
    }
    return this.props.children
  }
}

function ErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return <ErrorBoundaryInner resetKey={pathname}>{children}</ErrorBoundaryInner>
}

// Pages
const HomePage = lazy(() => import('./pages/HomePage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AfterHoursPage = lazy(() => import('./pages/AfterHoursPage'))

// Project page components — auto-generated from registry
const projectPages = projectRoutes.filter(project => projectSlugs.includes(project.slug)).map(p => ({
  slug: p.slug,
  Component: lazy(p.page),
}))

function Loading() {
  return (
    <div className="page-loader page-loader--fallback">
      <PixelLoaderVisual />
    </div>
  )
}

const TypefaceWorkshopPage=lazy(()=>import('./pages/TypefaceWorkshopPage'))
const PhysicalWorldPage = lazy(() => import('./pages/PhysicalWorldPage'))
const ShuffleSimulationPage = lazy(() => import('./pages/ShuffleSimulationPage'))

function PreviewFallback() {
  const { pathname, hash, search } = useLocation()
  const slug = pathname.replace(/^\/|\/$/g, '')
  const destination = siblingSlugs.includes(slug) ? `${siblingHome}${slug}/${search}${hash}` : undefined
  useEffect(() => {
    if (destination) window.location.replace(destination)
  }, [destination])
  return destination ? <p><a href={destination}>Open the case study</a></p> : <NotFoundPage />
}

export default function App() {
  return (
    <ErrorBoundary>
    <ProjectReturnProvider>
    <Suspense fallback={<Loading />}>
      <Routes>
        {isExperimental && <>
          <Route path="/after-hours" element={<AfterHoursPage />} />
          <Route path="/typeface/workshop" element={<TypefaceWorkshopPage />} />
          <Route path="/shuffle/simulation" element={<ShuffleSimulationPage />} />
          <Route path="/:project/world" element={<PhysicalWorldPage />} />
          <Route path="/:project/prototype" element={<PhysicalWorldPage />} />
          <Route path="/project-experiences" element={<PhysicalWorldPage />} />
        </>}
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          {portfolio.pages.filter(page => !page.includes('/'))
            .map(page => <Route key={page} path={`/${page}`} element={<CategoryPage />} />)}
          {/* Project pages — auto-generated from src/data/projects.ts */}
          {projectPages.map(({ slug, Component }) => (
            <Route key={slug} path={`/${slug}`} element={<Component />} />
          ))}
          {!isExperimental && <Route path="/mentra-website" element={<Navigate to="/mentra#cs-website" replace />} />}
          <Route path="*" element={<PreviewFallback />} />
        </Route>
      </Routes>
    </Suspense>
    </ProjectReturnProvider>
    </ErrorBoundary>
  )
}
