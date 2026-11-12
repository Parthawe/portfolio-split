import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BrandIcon from './BrandIcon'
import FigmaSelect from './FigmaSelect'
import { getProject } from '../data/projects'

type ToolGroupKey = 'systems' | 'motion' | 'physical'

type ToolItem = {
  name: string
  role: string
  why: string
  tags: string[]
}

type ToolGroup = {
  key: ToolGroupKey
  label: string
  intro: string
  projectSlug: string
  proof: string
  tools: ToolItem[]
}

function projectVisual(slug: string) {
  const project = getProject(slug)
  if (!project) {
    return {
      slug,
      name: slug,
      image: '',
      tag: '',
      year: '',
      desc: '',
    }
  }

  return {
    slug: project.slug,
    name: project.name,
    image: project.summaryImage ?? project.image,
    tag: project.tag,
    year: project.summaryTimeline ?? project.year,
    desc: project.summaryOutcome ?? project.desc,
  }
}

const toolGroups: ToolGroup[] = [
  {
    key: 'systems',
    label: 'Product systems',
    intro: 'The stack I use when the work needs structure, trust, and shipping detail.',
    projectSlug: 'mentra',
    proof: 'Most often used on AI products, fintech, and anything where state logic matters as much as visual polish.',
    tools: [
      {
        name: 'Figma',
        role: 'Structure flows, states, and systems',
        why: 'Still the fastest place to turn ambiguity into a clear product surface.',
        tags: ['IA', 'flows', 'design systems'],
      },
      {
        name: 'React',
        role: 'Prototype and production UI thinking',
        why: 'Useful when interaction quality matters and the design needs to survive contact with real behavior.',
        tags: ['states', 'interaction', 'handoff'],
      },
      {
        name: 'TypeScript',
        role: 'Stay close to implementation quality',
        why: 'Helps me reason about product logic, edges, and constraints with engineers instead of around them.',
        tags: ['logic', 'states', 'quality'],
      },
      {
        name: 'Tailwind',
        role: 'Build fast without losing control',
        why: 'Good for turning a system into real surfaces quickly while keeping spacing and hierarchy disciplined.',
        tags: ['tokens', 'layout', 'speed'],
      },
      {
        name: 'Maze',
        role: 'Validate structure early',
        why: 'Useful when I need to see whether the architecture is legible before polishing too hard.',
        tags: ['research', 'signals', 'tests'],
      },
      {
        name: 'Hotjar',
        role: 'See where the friction actually lives',
        why: 'I use it to catch behavior that polished decks usually hide.',
        tags: ['friction', 'reality', 'iteration'],
      },
    ],
  },
  {
    key: 'motion',
    label: 'Motion and 3D',
    intro: 'The tools I reach for when a flat screen cannot carry the idea by itself.',
    projectSlug: 'clawed-chat',
    proof: 'This is the layer that helps narrative work feel dimensional, branded, and memorable instead of merely explained.',
    tools: [
      {
        name: 'Blender',
        role: 'Model and stage the object language',
        why: 'Useful for shaping hero objects, product worlds, and spatial cues that carry more than screenshots can.',
        tags: ['form', 'materials', 'objects'],
      },
      {
        name: 'Three.js',
        role: 'Bring the object into interaction',
        why: 'I use it when the browser itself needs to feel like part of the experience, not just the container.',
        tags: ['webgl', 'motion', 'atmosphere'],
      },
      {
        name: 'After Effects',
        role: 'Prototype motion direction',
        why: 'The fastest place to test rhythm, emphasis, and sequencing before translating it to code.',
        tags: ['timing', 'transitions', 'story'],
      },
      {
        name: 'Premiere Pro',
        role: 'Cut narrative proof together',
        why: 'Useful when the project needs a sharper explanation than static frames can provide.',
        tags: ['editing', 'pace', 'showing'],
      },
      {
        name: 'Illustrator',
        role: 'Clean vector foundations',
        why: 'Still the right tool when the geometry itself needs to be exact before it moves.',
        tags: ['vectors', 'marks', 'shape'],
      },
      {
        name: 'Figma',
        role: 'Bridge between product and brand',
        why: 'It helps keep interface logic and visual direction in one conversation instead of two.',
        tags: ['bridge', 'direction', 'systems'],
      },
    ],
  },
  {
    key: 'physical',
    label: 'Physical builds',
    intro: 'The tools that matter when the interface has weight, wiring, timing, and room behavior.',
    projectSlug: 'revolving-stage',
    proof: 'These are the tools behind installations, instruments, stages, and the kinds of prototypes you can walk around.',
    tools: [
      {
        name: 'Arduino',
        role: 'Make behavior tangible',
        why: 'Good for getting sensors, lights, motors, and physical feedback into the loop quickly.',
        tags: ['inputs', 'outputs', 'prototypes'],
      },
      {
        name: 'Python',
        role: 'Hold the logic together',
        why: 'I use it whenever the physical system needs a reliable behavioral spine, not just a quick demo.',
        tags: ['logic', 'automation', 'control'],
      },
      {
        name: 'TouchDesigner',
        role: 'Spatial visuals and live behavior',
        why: 'Useful when the system needs to respond in real time and feel installed, not just displayed.',
        tags: ['realtime', 'visuals', 'space'],
      },
      {
        name: '3D Printing',
        role: 'Close the loop between idea and object',
        why: 'Lets me test the form factor fast instead of waiting for a perfect fabrication pass.',
        tags: ['form', 'iteration', 'fit'],
      },
      {
        name: 'Laser Cutting',
        role: 'Fast structural fabrication',
        why: 'Still the cleanest way to get accurate enclosures, mounts, and assembly logic into the prototype.',
        tags: ['fabrication', 'structure', 'speed'],
      },
      {
        name: 'p5.js',
        role: 'Sketch behavior before it hardens',
        why: 'Helpful when the interaction itself needs to be discovered before the system gets formal.',
        tags: ['sketching', 'behavior', 'tests'],
      },
    ],
  },
]

export default function ToolsCanvas() {
  const [activeGroupKey, setActiveGroupKey] = useState<ToolGroupKey>('systems')
  const activeGroup = useMemo(
    () => toolGroups.find((group) => group.key === activeGroupKey) ?? toolGroups[0],
    [activeGroupKey],
  )
  const [activeToolName, setActiveToolName] = useState(activeGroup.tools[0]?.name ?? '')

  useEffect(() => {
    setActiveToolName(activeGroup.tools[0]?.name ?? '')
  }, [activeGroup])

  const activeTool = activeGroup.tools.find((tool) => tool.name === activeToolName) ?? activeGroup.tools[0]
  const proofProject = projectVisual(activeGroup.projectSlug)

  return (
    <section className="tools-canvas reveal">
      <div className="sec-head">
        <span className="sec-label">Tools I reach for</span>
      </div>

      <div className="tools-board">
        <div className="tools-board-head">
          <div>
            <p className="tools-board-title">Grouped by the kind of problem they help me solve.</p>
            <p className="tools-board-intro">{activeGroup.intro}</p>
          </div>
          <div className="tools-board-tabs" role="tablist" aria-label="Tool groups">
            {toolGroups.map((group) => (
              <button
                key={group.key}
                type="button"
                className={`tools-board-tab figma-hover${group.key === activeGroup.key ? ' is-active' : ''}`}
                aria-pressed={group.key === activeGroup.key}
                onClick={() => setActiveGroupKey(group.key)}
              >
                {group.label}
                <FigmaSelect />
              </button>
            ))}
          </div>
        </div>

        <div className="tools-board-grid">
          <Link to={`/${proofProject.slug}`} className="tools-board-proof figma-hover">
            <div className="tools-board-proof-media">
              <img src={proofProject.image} alt={proofProject.name} loading="lazy" />
            </div>
            <div className="tools-board-proof-copy">
              <span className="tools-board-proof-label">Recent proof</span>
              <h3>{proofProject.name}</h3>
              <p>{activeGroup.proof}</p>
              <span className="tools-board-proof-meta">{proofProject.tag} / {proofProject.year}</span>
            </div>
            <FigmaSelect />
          </Link>

          <div className="tools-board-tools" role="list" aria-label={`${activeGroup.label} tools`}>
            {activeGroup.tools.map((tool) => (
              <button
                key={tool.name}
                type="button"
                className={`tools-board-tool figma-hover${tool.name === activeTool.name ? ' is-active' : ''}`}
                onMouseEnter={() => setActiveToolName(tool.name)}
                onFocus={() => setActiveToolName(tool.name)}
                onClick={() => setActiveToolName(tool.name)}
                aria-pressed={tool.name === activeTool.name}
              >
                <span className="tools-board-tool-icon">
                  <BrandIcon name={tool.name} size={20} />
                </span>
                <span className="tools-board-tool-copy">
                  <span className="tools-board-tool-name">{tool.name}</span>
                  <span className="tools-board-tool-role">{tool.role}</span>
                </span>
                <FigmaSelect />
              </button>
            ))}
          </div>

          <motion.article
            key={`${activeGroup.key}-${activeTool.name}`}
            className="tools-board-detail surface-glass surface-glass--subtle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="tools-board-detail-top">
              <span className="tools-board-detail-logo">
                <BrandIcon name={activeTool.name} size={26} />
              </span>
              <div>
                <span className="tools-board-detail-label">Why it stays</span>
                <h3>{activeTool.name}</h3>
              </div>
            </div>
            <p className="tools-board-detail-role">{activeTool.role}</p>
            <p className="tools-board-detail-body">{activeTool.why}</p>
            <div className="tools-board-detail-tags">
              {activeTool.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}
