import { getVisitorLocation } from '../utils/visitorLocation'
import { lazy, Suspense, useEffect, useState } from 'react'
import '../styles/parth-does.css'
import { Link } from 'react-router-dom'
import FigmaFrameLabel from './FigmaFrameLabel'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { useInView } from '../hooks/useInView'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { isLowPowerDevice } from '../utils/performance'

const CategoryAsciiArtifact = lazy(() => import('./CategoryAsciiArtifact'))

interface Skill {
  label: string
  objectSlug: string
  description: string
}

const skills: Skill[] = [
  {
    label: 'UX Design',
    objectSlug: 'ux-design',
    description: 'I turn messy product flows into calm, learnable interfaces where every state explains what happens next.',
  },
  {
    label: 'Product Design',
    objectSlug: 'ux-design',
    description: 'I shape early product systems from research, structure, and shipped screens, not just polished mockups.',
  },
  {
    label: 'Fintech',
    objectSlug: 'fintech',
    description: 'I design payment and crypto flows around confidence: visible risk, clear status, and reviewable decisions.',
  },
  {
    label: 'Design Engineering',
    objectSlug: 'design-engineering',
    description: 'I carry interface systems from Figma into responsive, accessible production code.',
  },
  {
    label: 'Physical Computing',
    objectSlug: 'installations',
    description: 'I build responsive objects and installations that let people understand systems through touch and behavior.',
  },
  {
    label: 'Installations',
    objectSlug: 'installations',
    description: 'I compose space, hardware, and interaction into experiences that feel legible without needing instructions.',
  },
]

export default function ParthDoesSection() {
  const [skillIndex, setSkillIndex] = useState(0)
  const [sectionRef, sectionInView] = useInView<HTMLElement>(0.08, '160px 0px')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const lowPowerDevice = isLowPowerDevice()
  const mountObject = useDeferredMount(sectionInView, {
    timeout: lowPowerDevice ? 2400 : 1600,
    delayMs: lowPowerDevice ? 360 : 120,
  })
  const activeSkill = skills[skillIndex]

  useEffect(() => {
    const section = sectionRef.current
    if (prefersReducedMotion || !sectionInView || !section) return
    let timer = 0
    let lastActivity = 0
    const advance = () => {
      timer = 0
      if (document.hidden || performance.now() - lastActivity > 3500) return
      setSkillIndex(current => (current + 1) % skills.length)
      timer = window.setTimeout(advance, 3000)
    }
    const wake = () => {
      if (document.hidden) return
      lastActivity = performance.now()
      if (!timer) timer = window.setTimeout(advance, 3000)
    }
    const pause = () => { window.clearTimeout(timer); timer = 0 }
    const onVisibility = () => { if (document.hidden) pause() }
    const events = ['pointermove', 'pointerdown', 'focusin', 'keydown'] as const
    events.forEach(event => section.addEventListener(event, wake, { passive: true }))
    section.addEventListener('pointerleave', pause)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      pause()
      events.forEach(event => section.removeEventListener(event, wake))
      section.removeEventListener('pointerleave', pause)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [prefersReducedMotion, sectionInView, sectionRef])

  return (
    <section className="wr-about-section" style={{ position: 'relative' }} ref={sectionRef}>
      <FigmaFrameLabel name="About" />
      <div className="wr-about-card" id="about-card">
        <svg className="wr-about-border" preserveAspectRatio="none" aria-hidden="true">
          <line x1="12" y1="12" x2="12" y2="100%" stroke="var(--ink-15)" strokeWidth="1" strokeDasharray="1 3" />
          <line x1="100%" y1="12" x2="100%" y2="100%" stroke="var(--ink-15)" strokeWidth="1" strokeDasharray="1 3" transform="translate(-12,0)" />
          <line x1="12" y1="12" x2="100%" y2="12" stroke="var(--ink-15)" strokeWidth="1" strokeDasharray="1 3" />
          <line x1="12" y1="100%" x2="100%" y2="100%" stroke="var(--ink-15)" strokeWidth="1" strokeDasharray="1 3" transform="translate(0,-12)" />
        </svg>
        <div className="wr-about-dot" style={{ top: '11px' }} />
        <div className="wr-about-dot" style={{ top: '28%' }} />
        <div className="wr-about-dot" style={{ top: '50%' }} />
        <div className="wr-about-dot" style={{ top: '72%' }} />
        <div className="wr-about-dot" style={{ bottom: '11px' }} />

        <div className="wr-about-top">
          <div className="wr-about-top-left">
            <span className="wr-about-num">{String(skillIndex + 1).padStart(2, '0')}</span>
            <span className="wr-about-skill-label">{activeSkill.label.toUpperCase()}</span>
          </div>
          <div className="wr-about-top-right">
            <span className="wr-about-dot-sq" />
            <span className="wr-label">ABOUT</span>
            <span className="wr-about-dot-sq" />
          </div>
        </div>

        <div className="wr-about-body">
          <div className="wr-about-text">
            <h2 className="wr-about-heading">Parth Pawar</h2>
            <h2 className="wr-about-heading">does</h2>
            <div className="wr-about-cycle">
              <div className="wr-about-skill-wrap">
                <span className="wr-about-skill" key={activeSkill.label}>{activeSkill.label}</span>
              </div>
            </div>
            <p className="wr-about-desc">{activeSkill.description}</p>
            <Link to="/about" className="wr-about-readmore">read more.</Link>
            <span className="wr-about-site" aria-hidden="true">DESIGNWHICH.WORKS</span>
          </div>

          <div className="wr-about-img-col">
            <div className="wr-about-ascii-object">
              {mountObject && (
                <Suspense fallback={null}>
                  <CategoryAsciiArtifact slug={activeSkill.objectSlug} />
                </Suspense>
              )}
            </div>
          </div>
        </div>

        <div className="wr-about-vert" aria-hidden="true">DESIGNWHICH.WORKS</div>
        <div className="wr-about-bottom">
          <div className="wr-about-bottom-left">
            <span className="wr-about-dot-circle" />
            <span className="wr-about-num">{String(skillIndex + 1).padStart(2, '0')} / {String(skills.length).padStart(2, '0')}</span>
          </div>
          <div className="wr-about-bottom-right">
            <span className="wr-about-dot-sq" />
            <span className="wr-about-meta-label">CURRENTLY BASED IN</span>
            <span className="wr-about-meta-val">{getVisitorLocation().label.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
