import { sibling, siblingHome } from '../config/portfolio'
import { getVisitorLocation } from '../utils/visitorLocation'
import { useState, useEffect, useRef, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, type MotionValue } from 'framer-motion'
import FigmaSelect from './FigmaSelect'
import { CONTACT_EMAIL } from '../config/site'
import PocketArcadeLauncher from './PocketArcadeLauncher'

const footerGroups = [{
  title: 'Portfolio',
  links: [
    { label: 'Home', to: '/' },
    { label: 'Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: 'Accessibility', to: '/accessibility' },
  ],
}]

function FooterEnd({ meta }: { meta: React.ReactNode }) {
  return (
    <div className="ft-end">
      <div className="ft-end-meta">
        <a className="glass-action" href={siblingHome}>{sibling.name}</a>
        {meta}
      </div>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    let intervalId: number | null = null
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      )
    tick()
    const alignToMinute = window.setTimeout(() => {
      tick()
      intervalId = window.setInterval(tick, 60_000)
    }, 1000)
    return () => {
      window.clearTimeout(alignToMinute)
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [])
  return <span className="ft-clock">{time}</span>
}

export default function FooterContent({
  footerRef,
  showArcadeIntro = false,
}: {
  footerRef: RefObject<HTMLElement | null>
  showArcadeIntro?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const email = CONTACT_EMAIL
  const firstRevealRef = useRef<HTMLDivElement>(null)

  const isInView = useInView(firstRevealRef, { once: true, amount: 0.1 })
  const [skipAnim, setSkipAnim] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInView) setSkipAnim(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [isInView])

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  })

  const ctaY = useTransform(scrollYProgress, [0, 0.5], [40, 0])
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1])
  const infoY = useTransform(scrollYProgress, [0.1, 0.55], [24, 0])
  const infoOpacity = useTransform(scrollYProgress, [0.15, 0.55], [0, 1])

  const handleCopy = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const a = (y: MotionValue<number>, opacity: MotionValue<number>) =>
    skipAnim ? { y: 0, opacity: 1 } : { y, opacity }

  return (
    <div className="wrap ft-compact">
      {/* Band 1 — one composition: the ask on the left, the map on the right */}
      <motion.div className="ft-top" style={a(ctaY, ctaOpacity)} ref={firstRevealRef}>
        <div className="ft-top-cta">
          <h2 className="ft-headline-sm">
            Let's work <em>together</em>
          </h2>
          <div className="ft-contact-row">
            <a className="ft-email figma-hover" href={`mailto:${email}`}>{email}<FigmaSelect /></a>
            <button className="ft-copy-btn magnetic figma-hover" onClick={handleCopy} aria-label="Copy email">
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7.5L5.5 11L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="sr-only" role="status">Email copied</span>
                </>
              ) : 'Copy email'}
              <FigmaSelect />
            </button>
          </div>
          <div className="ft-access-row" aria-label="Quick requests">
            <a data-analytics-action="access_request_click" href={`mailto:${email}?subject=Portfolio%20case%20study%20access`} className="ft-access-link figma-hover">Request case study<FigmaSelect /></a>
            <span className="ft-access-dot" aria-hidden="true" />
            <a data-analytics-action="resume_click" href={`mailto:${email}?subject=Resume%20request`} className="ft-access-link figma-hover">Request résumé<FigmaSelect /></a>
            <span className="ft-access-dot" aria-hidden="true" />
            <a href={`mailto:${email}?subject=Project%20availability`} className="ft-access-link figma-hover">Availability<FigmaSelect /></a>
          </div>
        </div>

        <motion.div className="ft-top-links" style={a(infoY, infoOpacity)} aria-label="Footer navigation">
          <div className="ft-nav-stack">
            {footerGroups.map(group => (
              <nav className="ft-link-group" aria-label={group.title} key={group.title}>
                <h3>{group.title}</h3>
                {group.links.map(link => (
                  <Link key={link.label} to={link.to} className="ft-info-link figma-hover">
                    {link.label}
                    <FigmaSelect />
                  </Link>
                ))}
              </nav>
            ))}
          </div>
          <div className="ft-link-group ft-arcade-shelf" id="footer-arcade">
            <PocketArcadeLauncher inlineDesktop showIntro={showArcadeIntro} />
          </div>
        </motion.div>
      </motion.div>

      {/* Notes and the portfolio's closing metadata. */}
      <FooterEnd
        meta={
          <>
            <span>{getVisitorLocation().label}</span>
            <span><LiveClock /> {getVisitorLocation().clockLabel}</span>
          </>
        }
      />
    </div>
  )
}
