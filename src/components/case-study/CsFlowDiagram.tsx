import { motion } from 'framer-motion';

interface FlowNode {
  label: string;
  desc?: string;
  accent?: boolean; // highlighted node
}

interface CsFlowDiagramProps {
  nodes: FlowNode[];
  title?: string;
  direction?: 'horizontal' | 'vertical';
}

const nodeVariant = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const lineVariant = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const lineVariantV = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

export default function CsFlowDiagram({ nodes, title, direction = 'horizontal' }: CsFlowDiagramProps) {
  const isV = direction === 'vertical';

  return (
    <motion.div
      className={`cs-flow-diagram cs-flow-diagram--${direction}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    >
      {title && <p className="cs-flow-title">{title}</p>}
      <div className={`cs-flow-track cs-flow-track--${direction}`}>
        {nodes.map((node, i) => (
          <div key={i} className="cs-flow-item">
            <motion.div
              className={`cs-flow-node${node.accent ? ' cs-flow-node--accent' : ''}`}
              variants={nodeVariant}
            >
              <span className="cs-flow-node-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="cs-flow-node-label">{node.label}</span>
              {node.desc && <span className="cs-flow-node-desc">{node.desc}</span>}
            </motion.div>

            {i < nodes.length - 1 && (
              <motion.div
                className={`cs-flow-line cs-flow-line--${direction}`}
                variants={isV ? lineVariantV : lineVariant}
                style={{ transformOrigin: isV ? 'top' : 'left' }}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
