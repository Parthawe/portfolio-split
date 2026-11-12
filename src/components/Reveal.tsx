import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  /** Use "reveal-image" className variant */
  image?: boolean;
  /** Manual stagger index (multiplied by 0.08s) */
  staggerIndex?: number;
  /** Manual delay in seconds, overrides staggerIndex */
  delay?: number;
  /** Additional className */
  className?: string;
}

export function Reveal({
  children,
  image = false,
  staggerIndex = 0,
  delay,
  className = '',
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const computedDelay = delay ?? staggerIndex * 0.07;
  const baseClass = image ? 'reveal-image' : 'reveal';

  if (prefersReduced) {
    return (
      <div className={`${baseClass} visible ${className}`.trim()}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClass} ${className}`.trim()}
      initial={{ opacity: 0, y: 14, scale: 0.994, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0)' }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.52, delay: computedDelay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
