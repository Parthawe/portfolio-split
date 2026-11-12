import { useId, useState } from 'react'
import { motion } from 'framer-motion'

interface ArchNode {
  id: string
  label: string
  desc: string
  row: number
  col: number
}

interface ArchConnection {
  from: string
  to: string
  label?: string
}

interface CsArchDiagramProps {
  nodes: ArchNode[]
  connections: ArchConnection[]
  cols?: number
  title?: string
}

const nodeVariant = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
}

export default function CsArchDiagram({ nodes, connections, cols = 3, title }: CsArchDiagramProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const detailId = useId()

  const connectedIds = activeNode
    ? new Set([
        activeNode,
        ...connections.filter(c => c.from === activeNode || c.to === activeNode).flatMap(c => [c.from, c.to]),
      ])
    : null

  const maxRow = nodes.length > 0 ? Math.max(...nodes.map(n => n.row)) : 0

  return (
    <div className="cs-arch">
      {title && <div className="cs-arch-title">{title}</div>}
      <motion.div
        className="cs-arch-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${maxRow + 1}, auto)` }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        transition={{ staggerChildren: 0.08 }}
      >
        {nodes.map(node => (
          <motion.button
            key={node.id}
            className={`cs-arch-node${activeNode === node.id ? ' active' : ''}${connectedIds && !connectedIds.has(node.id) ? ' dimmed' : ''}`}
            style={{ gridColumn: node.col + 1, gridRow: node.row + 1 }}
            variants={nodeVariant}
            type="button"
            aria-pressed={activeNode === node.id}
            aria-expanded={activeNode === node.id}
            aria-controls={detailId}
            onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
            onFocus={() => setActiveNode(node.id)}
            onBlur={() => setActiveNode(null)}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
          >
            <span className="cs-arch-node-label">{node.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Connection labels */}
      {activeNode && (
        <motion.div
          className="cs-arch-connections"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {connections
            .filter(c => c.from === activeNode || c.to === activeNode)
            .map(c => {
              const other = c.from === activeNode ? c.to : c.from
              const otherNode = nodes.find(n => n.id === other)
              return (
                <span key={`${c.from}-${c.to}`} className="cs-arch-conn-tag">
                  → {otherNode?.label}{c.label ? `: ${c.label}` : ''}
                </span>
              )
            })}
        </motion.div>
      )}

      {/* Detail panel */}
      <div className="cs-arch-detail" id={detailId} aria-live="polite" aria-atomic="true">
        {activeNode && (() => {
          const node = nodes.find(n => n.id === activeNode)
          return node ? (
            <motion.div
              key={node.id}
              className="cs-arch-detail-inner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <strong>{node.label}</strong>
              <p>{node.desc}</p>
            </motion.div>
          ) : null
        })()}
      </div>
    </div>
  )
}
