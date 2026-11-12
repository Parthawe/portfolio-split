import { motion } from 'framer-motion';

interface CsTimelineProps {
  items: { date: string; title: string; desc: string }[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

export default function CsTimeline({ items }: CsTimelineProps) {
  return (
    <motion.div
      className="cs-timeline"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {items.map((entry) => (
        <motion.div key={entry.date} className="cs-timeline-item" variants={item}>
          <span className="cs-timeline-date">{entry.date}</span>
          <div className="cs-timeline-content">
            <h4>{entry.title}</h4>
            <p>{entry.desc}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
