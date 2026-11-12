import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface CsCalloutProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function CsCallout({ children, className, style }: CsCalloutProps) {
  return (
    <motion.div
      className={`cs-callout${className ? ` ${className}` : ''}`}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
    >
      {children}
    </motion.div>
  );
}
