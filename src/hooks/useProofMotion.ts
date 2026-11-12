import { useEffect } from 'react'

/** Finite paper-unfolding motion for proof, with no scroll loop or hidden default. */
export function useProofMotion(pathname: string) {
  useEffect(() => {
    if (/\/(shuffle)(\/|$)/.test(pathname)) return
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const seen = new WeakSet<Element>(), observed = new WeakSet<Element>(), active = new Set<Animation>()
    const selector = '.case-study-slide, .cs-section-content > .cs-img, .abt-recognition-ledger, .abt-vibe-stage, .work-page-summary, .homepage-project-archive'
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return
      observer.unobserve(entry.target)
      if (seen.has(entry.target) || preference.matches || document.hidden) return
      seen.add(entry.target)
      const animation = entry.target.animate([
        { clipPath: 'inset(0 0 10% 0)', transform: 'translateY(12px)' },
        { clipPath: 'inset(0 0 0% 0)', transform: 'translateY(0)' },
      ], { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)' })
      active.add(animation)
      animation.onfinish = () => active.delete(animation)
    }), { threshold: .12 })
    const scan = (root: ParentNode) => root.querySelectorAll(selector).forEach(node => { if (!observed.has(node)) { observed.add(node); observer.observe(node) } })
    scan(document)
    const mutations = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return
      if (node.matches(selector) && !observed.has(node)) { observed.add(node); observer.observe(node) }
      scan(node)
    })))
    mutations.observe(document.getElementById('site-zoom-stage') || document.getElementById('main-content') || document.body, { childList: true, subtree: true })
    const cancel = () => { if (preference.matches || document.hidden) { active.forEach(animation => animation.cancel()); active.clear() } }
    preference.addEventListener('change', cancel)
    document.addEventListener('visibilitychange', cancel)
    return () => { observer.disconnect(); mutations.disconnect(); active.forEach(animation => animation.cancel()); preference.removeEventListener('change', cancel); document.removeEventListener('visibilitychange', cancel) }
  }, [pathname])
}
