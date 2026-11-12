/**
 * Hero constellation web — an infinite field of varied glass objects.
 *
 * The 6 hero objects stay where they are. Around them blooms a large field of
 * NEW glass polyhedra — every one a different shape but the SAME size as the
 * parents — labelled with the disciplines/skills behind the work. Everything is
 * wired to its NEAREST NEIGHBOURS (not to a central hub), so it reads as a woven
 * mesh, and the field extends well past the viewport so it feels infinite.
 *
 * `layoutHeroWeb(hubPositions)` takes the 6 live hub positions and returns the
 * full node list (hubs + field) plus the neighbour edges.
 */

export type WebGeom =
  | 'ico'
  | 'dodec'
  | 'octa'
  | 'star'
  | 'cube'
  | 'tetra'
  | 'crystal'
  | 'torus'

export interface WebNode {
  id: string
  tier: 'hub' | 'field'
  position: [number, number, number]
  /** Field nodes only: which glass shape to render. */
  geom?: WebGeom
  /** Field nodes only: discipline label. */
  label?: string
  /** Field nodes only: page this discipline links to. */
  route?: string
  /** Ripple-out delay 0..1 (distance from centre), for the expand stagger. */
  delay: number
}

export interface WebEdge {
  a: string
  b: string
}

/** Hub order MUST match HeroScene's NODES array. */
export const HUB_IDS = [
  'installations',
  'design-for-good',
  'ux-design',
  'brand-visual',
  'ai',
  'design-engineering',
] as const

// Disciplines behind the work — each links to the page that talks about that
// context, so every field object is a real doorway into the portfolio. Spread
// covers all six domains (Installations included, per request).
const LINKS: { label: string; route: string }[] = [
  // Product / UX
  { label: 'User Experience', route: '/ux-design' },
  { label: 'Interaction Design', route: '/ux-design' },
  { label: 'Design Systems', route: '/ux-design' },
  { label: 'Prototyping', route: '/ux-design' },
  { label: 'User Research', route: '/ux-research' },
  { label: 'Information Architecture', route: '/ux-design' },
  { label: 'Interface Design', route: '/ux-design' },
  { label: 'Service Design', route: '/ux-design' },
  // Design engineering
  { label: 'Front-end Systems', route: '/design-engineering' },
  { label: 'Design Systems', route: '/design-engineering' },
  { label: 'Interaction Prototypes', route: '/design-engineering' },
  { label: 'Responsive UI', route: '/design-engineering' },
  { label: 'State Design', route: '/design-engineering' },
  { label: 'TypeScript', route: '/design-engineering' },
  { label: 'React', route: '/design-engineering' },
  { label: 'Accessibility', route: '/design-engineering' },
  { label: 'Motion Systems', route: '/design-engineering' },
  // AI & wearables
  { label: 'Responsible AI', route: '/ai' },
  { label: 'Machine Learning', route: '/ai' },
  { label: 'Wearables', route: '/ai-wearables' },
  { label: 'Smart Glasses', route: '/ai-wearables' },
  // Installations (explicitly linked)
  { label: 'Fabrication', route: '/installations' },
  { label: 'Material Science', route: '/installations' },
  { label: '3D Printing', route: '/installations' },
  { label: 'Large-Scale Installations', route: '/installations' },
  { label: 'Kinetic Sculpture', route: '/installations' },
  // Design for good
  { label: 'Sustainable Design', route: '/design-for-good' },
  { label: 'Civic Tech', route: '/design-for-good' },
  { label: 'Accessibility', route: '/accessibility' },
  // Brand & visual
  { label: 'Typography', route: '/brand-visual' },
  { label: 'Brand Identity', route: '/brand-visual' },
  { label: 'Art Direction', route: '/brand-visual' },
]

const GEOMS: WebGeom[] = ['ico', 'dodec', 'octa', 'star', 'cube', 'tetra', 'crystal', 'torus']

// Field sampling — a big landscape ellipse so the web bleeds far past every
// edge (feels boundless as you pan / orbit), filled by non-overlapping darts.
const FIELD = {
  count: 96,        // how many field objects to place
  rx: 22,           // horizontal half-extent — runs far past the framed view
  ry: 15,           // vertical half-extent (flatter → landscape)
  rz: 2.2,          // real depth so it reads 3D under orbit
  minDist: 2.6,     // min centre-to-centre gap → objects never overlap
  hubClear: 3.0,    // keep the field clear of the six hero objects
}

function seed(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

function dist2(a: [number, number, number], b: [number, number, number]) {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2]
  return dx * dx + dy * dy + dz * dz
}

export function layoutHeroWeb(
  hubPositions: [number, number, number][],
): { nodes: WebNode[]; edges: WebEdge[] } {
  const nodes: WebNode[] = []

  // Hubs — participate in the mesh but render as the existing objects.
  HUB_IDS.forEach((id, i) => {
    const p = hubPositions[i] ?? [0, 0, 0]
    nodes.push({ id, tier: 'hub', position: p, delay: 0 })
  })

  // Field — dart-throwing (Poisson-ish) so NO two objects overlap: reject any
  // candidate that lands within minDist of an already-placed node (or a hub).
  const hubs = nodes.map((n) => n.position)
  const placed: [number, number, number][] = [...hubs]
  const field: [number, number, number][] = []
  const minD2 = FIELD.minDist * FIELD.minDist
  const hubClear2 = FIELD.hubClear * FIELD.hubClear
  let s = 1
  let attempts = 0
  const maxAttempts = FIELD.count * 120
  while (field.length < FIELD.count && attempts < maxAttempts) {
    attempts++
    // Uniform-ish sample inside the ellipse (sqrt keeps it from clumping centre).
    const rr = Math.sqrt(seed(s++))
    const a = seed(s++) * Math.PI * 2
    const p: [number, number, number] = [
      Math.cos(a) * rr * FIELD.rx,
      Math.sin(a) * rr * FIELD.ry,
      (seed(s++) - 0.5) * 2 * FIELD.rz,
    ]
    let ok = true
    for (let i = 0; i < placed.length; i++) {
      const isHub = i < hubs.length
      if (dist2(p, placed[i]) < (isHub ? hubClear2 : minD2)) { ok = false; break }
    }
    if (!ok) continue
    placed.push(p)
    field.push(p)
  }

  // Inner objects bloom first on expand → sort by planar radius for the ripple.
  field.sort((p, q) => (p[0] * p[0] + p[1] * p[1]) - (q[0] * q[0] + q[1] * q[1]))
  const maxR = Math.hypot(field[field.length - 1]?.[0] ?? 1, field[field.length - 1]?.[1] ?? 1) || 1
  field.forEach((p, fi) => {
    // Offset label vs geom cycles so shape and discipline vary independently.
    const link = LINKS[(fi * 3 + 1) % LINKS.length]
    nodes.push({
      id: `f${fi}`,
      tier: 'field',
      position: p,
      // Cycle archetypes so spatial neighbours rarely share a silhouette.
      geom: GEOMS[fi % GEOMS.length],
      label: link.label,
      route: link.route,
      delay: Math.min(1, Math.hypot(p[0], p[1]) / maxR),
    })
  })

  // Edges — every node links to its 3 nearest neighbours → a woven mesh.
  const edges: WebEdge[] = []
  const seen = new Set<string>()
  const addEdge = (i: number, j: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ a: nodes[i].id, b: nodes[j].id })
  }
  const K = 3
  for (let i = 0; i < nodes.length; i++) {
    const near = nodes
      .map((n, j) => ({ j, d: i === j ? Infinity : dist2(nodes[i].position, n.position) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, K)
    for (const { j } of near) addEdge(i, j)
  }

  // Weave every hub into the field. The peripheral hubs (Installations, Brand &
  // Visual) sit far from the field, so plain nearest-neighbour leaves them
  // linked only to other hubs — connect each hub to its nearest field nodes so
  // all six visibly branch into multiple discipline objects.
  const HUB_FIELD_LINKS = 4
  const fieldIdx: number[] = []
  nodes.forEach((n, j) => { if (n.tier === 'field') fieldIdx.push(j) })
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].tier !== 'hub') continue
    const near = fieldIdx
      .map((j) => ({ j, d: dist2(nodes[i].position, nodes[j].position) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, HUB_FIELD_LINKS)
    for (const { j } of near) addEdge(i, j)
  }

  return { nodes, edges }
}
