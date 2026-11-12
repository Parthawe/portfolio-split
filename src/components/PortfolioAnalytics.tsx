import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { analyticsConfigured, analyticsEnabled, analyticsOwnerExcluded, setAnalyticsConsent, trackDiagnostic, trackEvent, trackPage, trackSection, trackVisibleTime } from '../utils/analytics'
import { publicPage } from '../utils/analytics/policy'
import '../styles/analytics.css'

export default function PortfolioAnalytics() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => { trackPage(pathname) }, [pathname])
  useEffect(() => {
    if (!analyticsEnabled()) return
    let since = document.visibilityState === 'visible' ? performance.now() : null
    const flush = () => {
      if (since !== null) trackVisibleTime(pathname, performance.now() - since)
      since = null
    }
    const visibility = () => {
      flush()
      if (document.visibilityState === 'visible') {
        since = performance.now()
        // Re-observe after returning to a tab: an intersection may have arrived
        // while hidden and otherwise would not produce a new entry.
        document.querySelectorAll('main .cs-section[id^="cs-"]').forEach(section => {
          if (!section.closest('.nda-unlocked-section, .nda-unlocked-flow')) {
            observer.unobserve(section)
            observer.observe(section)
          }
        })
      }
    }
    const observer = new IntersectionObserver(entries => {
      if (document.visibilityState !== 'visible') return
      for (const entry of entries) {
        if (entry.isIntersecting && !entry.target.closest('.nda-unlocked-section, .nda-unlocked-flow')) {
          trackSection(entry.target.id)
          observer.unobserve(entry.target)
        }
      }
    }, { rootMargin: '0px 0px -30% 0px', threshold: 0 })
    const observed = new WeakSet<Element>()
    const observe = (section: Element) => {
      if (!observed.has(section) && !section.closest('.nda-unlocked-section, .nda-unlocked-flow')) {
        observed.add(section)
        observer.observe(section)
      }
    }
    const selector = 'main .cs-section[id^="cs-"]'
    document.querySelectorAll(selector).forEach(observe)
    const mutations = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue
        if (node.matches(selector)) observe(node)
        node.querySelectorAll(selector).forEach(observe)
      }
    })
    mutations.observe(document.getElementById('main-content') || document.body, { childList: true, subtree: true })
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pagehide', flush)
    return () => {
      flush()
      observer.disconnect()
      mutations.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('pagehide', flush)
    }
  }, [pathname, open])
  useEffect(() => {
    if (!analyticsConfigured()) return
    const preferences = () => setOpen(true)
    const error = (event: Event) => {
      if (event instanceof ErrorEvent) {
        if (event.filename && new URL(event.filename, location.origin).origin === location.origin) trackDiagnostic('client_error', { error_code: 'script_error' })
      } else if (event.target instanceof HTMLImageElement || event.target instanceof HTMLVideoElement) {
        const source = event.target.currentSrc || event.target.src
        if (source && new URL(source, location.origin).origin === location.origin) trackDiagnostic('client_error', { error_code: 'asset_error' })
      }
    }
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>('a[href]')
      if (!link) return
      // Read destinations only to classify an action; never send their contents.
      const destination = new URL(link.href, location.origin)
      if (destination.protocol === 'mailto:') {
        if (link.matches('[data-analytics-action="access_request_click"], [aria-label="Request case study access"]')) trackEvent('access_request_click')
        else if (link.matches('[data-analytics-action="resume_click"]')) trackEvent('resume_click')
        else trackEvent('contact_click')
      } else if (link.hasAttribute('download') && /resume|cv/i.test(destination.pathname)) {
        trackEvent('resume_click')
      } else if (destination.origin === location.origin && publicPage(destination.pathname).type === 'project' && publicPage(destination.pathname).path !== publicPage(location.pathname).path) {
        trackEvent('project_open', destination.pathname)
      } else if (link.matches('.cs-bnav-live, [data-analytics-action="live_project_click"]')) {
        trackEvent('live_project_click')
      }
    }
    const interaction = (event: Event) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return
      if (event instanceof KeyboardEvent && !['Enter', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      if (event.target.closest('.shuffle-object, .physical-world, .prototype-page [data-prototype], .prototype-intro button')) trackEvent('demo_start')
      else if (event.target.closest('.hero-3d-canvas, .ascii-hero-image')) trackEvent('scene_interaction')
    }
    const playback = (event: Event) => {
      if (event.target instanceof HTMLVideoElement && !event.target.autoplay) trackEvent(event.type === 'ended' ? 'media_complete' : 'media_play')
    }
    const scroll = () => {
      if (!analyticsEnabled() || document.visibilityState !== 'visible') return
      const main = document.querySelector('main')
      if (!main || main.scrollHeight <= innerHeight) return
      const rect = main.getBoundingClientRect()
      const percent = Math.min(100, Math.max(0, (innerHeight - rect.top) / rect.height * 100))
      for (const threshold of [25, 50, 75, 100] as const) {
        if (percent >= threshold) trackEvent('reading_depth', undefined, threshold)
      }
    }
    window.addEventListener('portfolio:analytics-preferences', preferences)
    window.addEventListener('error', error, true)
    document.addEventListener('click', click)
    document.addEventListener('pointerdown', interaction, { passive: true })
    document.addEventListener('keydown', interaction)
    document.addEventListener('play', playback, true)
    document.addEventListener('ended', playback, true)
    window.addEventListener('scroll', scroll, { passive: true })
    return () => {
      window.removeEventListener('portfolio:analytics-preferences', preferences)
      window.removeEventListener('error', error, true)
      document.removeEventListener('click', click)
      document.removeEventListener('pointerdown', interaction)
      document.removeEventListener('keydown', interaction)
      document.removeEventListener('play', playback, true)
      document.removeEventListener('ended', playback, true)
      window.removeEventListener('scroll', scroll)
    }
  }, [])

  if (!open) return null
  const choose = (choice: 'granted' | 'denied') => {
    setAnalyticsConsent(choice)
    setOpen(false)
  }
  return <AnalyticsConsentNotice onChoose={choose} onDismiss={() => setOpen(false)} />
}

export function AnalyticsConsentNotice({ onChoose, onDismiss }: { onChoose: (choice: 'granted' | 'denied') => void; onDismiss?: () => void }) {
  const notice = useRef<HTMLElement>(null)
  const dismiss = useRef(onDismiss)
  dismiss.current = onDismiss
  useEffect(() => {
    if (!dismiss.current) return
    const previous = document.activeElement as HTMLElement | null
    notice.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss.current?.() }
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('keydown', escape); if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])
  return <section ref={notice} className="analytics-consent" aria-labelledby="analytics-heading">
    <h2 id="analytics-heading">Analytics preferences</h2>
    {onDismiss && <button className="glass-action" type="button" onClick={onDismiss} aria-label="Close analytics preferences">Close</button>}
    <p>This site automatically uses Google Analytics cookies to measure visits and interactions. You can turn analytics off for this browser. Your choice won’t affect access to the site.</p>
    <p role="status">{analyticsOwnerExcluded() ? 'Owner browser excluded. ' : ''}Analytics is {analyticsEnabled() ? 'on' : 'off'} for this browser.</p>
    <details>
      <summary>What gets measured</summary>
      <p>Public pages, referring websites, device and browser information, project opens, reading depth, video plays, contact or résumé clicks, page performance, and grouped technical failures. This integration does not send form entries, chat messages, reviewer codes, error messages, or full link URLs. Advertising features are disabled.</p>
      <p>Google processes the analytics data. Read <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">how Google uses data from partner sites</a>. You can change your choice through “Analytics preferences” in the footer.</p>
    </details>
    <div className="analytics-consent__actions">
      <button type="button" onClick={() => onChoose('denied')}>Turn off analytics</button>
      <button type="button" disabled={analyticsOwnerExcluded()} onClick={() => onChoose('granted')}>Enable analytics</button>
    </div>
  </section>
}

export function AnalyticsPreferences() {
  if (!analyticsConfigured()) return null
  return <button className="analytics-preferences glass-action" type="button" onClick={() => window.dispatchEvent(new Event('portfolio:analytics-preferences'))}>Analytics preferences</button>
}
