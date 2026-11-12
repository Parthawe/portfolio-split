export const KEYS = ['CLASS', 'SLEEP', 'SOCIAL LIFE', 'JOB', 'FINALS', 'FOOD', 'ENERGY', 'HOBBY'] as const
export type Key = typeof KEYS[number]
export const LEFT: Key[] = ['CLASS', 'SLEEP', 'SOCIAL LIFE', 'JOB']
export const RIGHT: Key[] = ['FINALS', 'FOOD', 'ENERGY', 'HOBBY']

export const RELATIONS: [Key, Key, number][] = [
  ['CLASS', 'FINALS',      0.35],
  ['CLASS', 'SOCIAL LIFE', -0.25],
  ['CLASS', 'HOBBY',       -0.20],
  ['CLASS', 'SLEEP',       -0.15],
  ['SLEEP', 'ENERGY',       0.55],
  ['SLEEP', 'FINALS',       0.20],
  ['SOCIAL LIFE', 'SLEEP',  -0.20],
  ['SOCIAL LIFE', 'ENERGY', -0.15],
  ['SOCIAL LIFE', 'HOBBY',   0.10],
  ['JOB', 'FOOD',            0.40],
  ['JOB', 'SLEEP',          -0.25],
  ['JOB', 'SOCIAL LIFE',    -0.20],
  ['JOB', 'HOBBY',          -0.20],
  ['JOB', 'CLASS',          -0.15],
  ['FINALS', 'SOCIAL LIFE', -0.30],
  ['FINALS', 'HOBBY',       -0.25],
  ['FINALS', 'SLEEP',       -0.25],
  ['ENERGY', 'HOBBY',        0.30],
  ['ENERGY', 'SOCIAL LIFE',  0.15],
  ['ENERGY', 'FINALS',       0.15],
  ['FOOD', 'ENERGY',         0.25],
  ['FOOD', 'SLEEP',          0.10],
]

// Build adjacency map for quick lookup
const ADJ = new Map<Key, { target: Key; weight: number }[]>()
for (const [src, tgt, w] of RELATIONS) {
  if (!ADJ.has(src)) ADJ.set(src, [])
  ADJ.get(src)!.push({ target: tgt, weight: w })
}

// Realistic starting profile: a stressed student who goes to class
// and works part-time, but is running low on sleep and hobbies.
// Immediately shows the system is interconnected.
const INITIAL: Record<Key, number> = {
  'CLASS':       72,
  'SLEEP':       35,
  'SOCIAL LIFE': 42,
  'JOB':         58,
  'FINALS':      62,
  'FOOD':        38,
  'ENERGY':      28,
  'HOBBY':       22,
}

export function initValues(): Record<Key, number> {
  return { ...INITIAL }
}

// Propagate a change through the relationship graph (1 hop, no recursion)
export function propagate(
  values: Record<Key, number>,
  changed: Key,
  delta: number,
): Record<Key, number> {
  const next = { ...values }
  const edges = ADJ.get(changed)
  if (!edges) return next

  for (const { target, weight } of edges) {
    const push = delta * weight
    next[target] = Math.max(0, Math.min(100, next[target] + push))
  }
  return next
}
