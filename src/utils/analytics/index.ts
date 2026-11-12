import { eligibleHost, eventNames, publicPage, safeReferrer, safeCampaign, type AnalyticsEvent } from './policy'

const id = import.meta.env.VITE_GA4_MEASUREMENT_ID || ''
const preferenceKey = 'portfolio-analytics-consent-v1'
let started = false
let lastPath = ''
let consent: 'granted' | 'denied' | null = null
const seen = new Set<string>()
type AnalyticsWindow = Window & { dataLayer?: unknown[]; [key: `ga-disable-${string}`]: boolean }

function command(..._args: unknown[]) {
  // Google expects an arguments object in dataLayer, not a plain array.
  ;((window as unknown as AnalyticsWindow).dataLayer ||= []).push(arguments)
}

export function analyticsConfigured() {
  return eligibleHost(location.hostname, import.meta.env.PROD, id) && import.meta.env.VITE_GA4_READY === '1'
}

export function trackVisibleTime(pathname: string, milliseconds: number) {
  if (!analyticsEnabled() || milliseconds < 1000 || !Number.isFinite(milliseconds)) return
  command('event', 'visible_time', { page_path: publicPage(pathname).path, visible_seconds: Math.round(milliseconds / 1000) })
}

export function trackSection(id: string) {
  if (!analyticsEnabled() || !/^cs-[a-z0-9-]{1,60}$/.test(id)) return
  trackPage(location.pathname)
  const key = `section:${id}`
  if (seen.has(key)) return
  seen.add(key)
  command('event', 'story_section_view', { page_path: publicPage(location.pathname).path, section_id: id })
}

export function analyticsConsent() {
  if (consent) return consent
  try {
    const stored = localStorage.getItem(preferenceKey)
    if (stored === 'granted' || stored === 'denied') consent = stored
  } catch { /* Storage may be unavailable; keep the current tab usable. */ }
  return consent
}

export function analyticsOwnerExcluded() {
  try { return localStorage.getItem('portfolio-analytics-exclude') === '1' } catch { return false }
}

export function analyticsEnabled() {
  return analyticsConfigured() && analyticsConsent() !== 'denied' && !analyticsOwnerExcluded() && !navigator.webdriver
}

export function trackDiagnostic(name: 'client_error' | 'web_vital', fields: { error_code?: 'script_error' | 'asset_error'; metric_name?: 'LCP' | 'INP' | 'CLS'; value?: number; metric_id?: string; page_path?: string }) {
  if (!analyticsEnabled()) return
  if (name === 'client_error' && (fields.error_code === 'script_error' || fields.error_code === 'asset_error')) {
    const key = `error:${fields.error_code}`
    if (seen.has(key)) return
    seen.add(key)
    command('event', name, { error_code: fields.error_code, page_path: publicPage(location.pathname).path })
  } else if (name === 'web_vital' && ['LCP', 'INP', 'CLS'].includes(fields.metric_name || '') && Number.isFinite(fields.value)) {
    command('event', name, { metric_name: fields.metric_name, value: fields.value, metric_id: fields.metric_id, page_path: publicPage(fields.page_path || '/').path })
  }
}

export function setAnalyticsConsent(value: 'granted' | 'denied') {
  consent = value
  try { localStorage.setItem(preferenceKey, value) } catch { /* Tab-only choice. */ }
  if (value === 'denied') {
    ;(window as unknown as AnalyticsWindow)[`ga-disable-${id}`] = true
    // Remove this site's GA cookies when opting out.
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0]
      if (name === '_ga' || name.startsWith('_ga_')) {
        for (const domain of ['', '; domain=designwhich.works', '; domain=.designwhich.works', `; domain=${location.hostname}`]) {
          document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`
        }
      }
    }
    // Unload Google's runtime so no automatic engagement events survive revocation.
    if (started) location.reload()
  } else {
    ;(window as unknown as AnalyticsWindow)[`ga-disable-${id}`] = false
    trackPage(location.pathname)
  }
}

function start() {
  if (started || !analyticsEnabled()) return
  started = true
  command('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
  command('consent', 'update', { analytics_storage: 'granted' })
  command('js', new Date())
  command('config', id, {
    send_page_view: false,
    ...safeCampaign(location.search || ''),
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: `https://designwhich.works${publicPage(location.pathname).path}`,
    page_referrer: safeReferrer(document.referrer),
    page_title: publicPage(location.pathname).path,
    cookie_flags: 'SameSite=Lax;Secure',
  })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)
  const landingPath = publicPage(location.pathname).path
  // Load observers only when analytics is enabled. Metrics describe the document lifecycle,
  // not each React route, so retain the landing path when a callback arrives later.
  void import('web-vitals').then(({ onCLS, onINP, onLCP }) => {
    const send = (metric: { name: string; value: number; id: string }) => {
      trackDiagnostic('web_vital', { metric_name: metric.name as 'LCP' | 'INP' | 'CLS', value: metric.value, metric_id: metric.id, page_path: landingPath })
    }
    onCLS(send)
    onINP(send)
    onLCP(send)
  }).catch(() => { /* Analytics must never interrupt the portfolio. */ })
}

export function trackPage(pathname: string) {
  if (!analyticsEnabled()) return
  const page = publicPage(pathname)
  if (lastPath === page.path) return
  start()
  const referrer = lastPath ? `https://designwhich.works${lastPath}` : safeReferrer(document.referrer)
  lastPath = page.path
  seen.clear()
  const fields = { page_location: `https://designwhich.works${page.path}`, page_title: page.path, page_referrer: referrer, page_type: page.type }
  command('set', fields)
  command('event', 'page_view', fields)
  if (page.type === 'project') {
    command('event', 'project_view', { page_path: page.path, project_slug: page.path.slice(1), page_type: page.type })
  }
}

export function trackEvent(name: AnalyticsEvent, targetPath?: string, depth?: 25 | 50 | 75 | 100) {
  if (!analyticsEnabled() || !eventNames.includes(name)) return
  trackPage(location.pathname)
  const page = publicPage(location.pathname)
  const target = targetPath ? publicPage(targetPath) : undefined
  const key = `${name}:${target?.path || ''}:${depth || ''}`
  if (seen.has(key)) return
  seen.add(key)
  command('event', name, {
    page_path: page.path, page_type: page.type,
    ...(target?.type === 'project' ? { project_slug: target.path.slice(1) } : {}),
    ...(name === 'reading_depth' && depth ? { percent_scrolled: depth } : {}),
  })
}
