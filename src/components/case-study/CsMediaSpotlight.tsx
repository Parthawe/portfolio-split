import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CsMediaSpotlightProps {
  id?: string
  label: string
  title: string
  lede: string
  actionLabel?: string
  layout?: 'split' | 'stacked'
  children: ReactNode
}

export default function CsMediaSpotlight({
  id,
  label,
  title,
  lede,
  actionLabel = 'Open media',
  layout = 'split',
  children,
}: CsMediaSpotlightProps) {
  return (
    <motion.section
      className="cs-media-spotlight"
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      aria-label={`${label}: ${title}`}
    >
      <div className={`wrap cs-media-spotlight-grid cs-media-spotlight-grid--${layout}`}>
        <div className="cs-media-spotlight-copy">
          <h2 className="cs-media-spotlight-title">{title}</h2>
          <p>{lede}</p>
        </div>
        <div className="cs-media-spotlight-frame">
          {children}
          <span className="cs-media-spotlight-action" aria-hidden="true">{actionLabel}</span>
        </div>
      </div>
    </motion.section>
  )
}
