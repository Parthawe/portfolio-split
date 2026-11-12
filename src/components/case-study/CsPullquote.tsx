import { motion } from "framer-motion";

interface CsPullquoteProps {
  quote: string;
  cite?: string;
}

export default function CsPullquote({ quote, cite }: CsPullquoteProps) {
  return (
    <motion.blockquote
      className="cs-pullquote"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
    >
      <p>{quote}</p>
      {cite && <cite>{cite}</cite>}
    </motion.blockquote>
  );
}
