import { motion } from 'framer-motion';

interface CsBeforeAfterProps {
  before: { label?: string; items: string[] };
  after: { label?: string; items: string[] };
  title?: string;
}

const col = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

export default function CsBeforeAfter({ before, after, title }: CsBeforeAfterProps) {
  return (
    <motion.div
      className="cs-before-after"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
    >
      {title && <p className="cs-before-after-title">{title}</p>}
      <div className="cs-before-after-grid">
        <motion.div className="cs-ba-col cs-ba-col--before" variants={col}>
          <span className="cs-ba-label">{before.label || 'Before'}</span>
          <ul className="cs-ba-list">
            {before.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </motion.div>

        <div className="cs-ba-arrow" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <motion.div className="cs-ba-col cs-ba-col--after" variants={col}>
          <span className="cs-ba-label">{after.label || 'After'}</span>
          <ul className="cs-ba-list">
            {after.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
