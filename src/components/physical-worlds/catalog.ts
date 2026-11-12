import { projects } from '../../data/projects'

const objectWorlds = {
  enigma: { title: 'Enigma', setting: 'Light sculpture on an open floor', note: 'Photo-informed sculpture on an open floor. The input samples tablet strokes and typed letter shapes; hidden layers use explanatory signal mixing, not trained weights.', controls: ['Letter'], initial: [0] },
  jugalbandi: { title: 'Jugalbandi', setting: 'Hexa-18 and the acoustic machines', note: 'Photo-informed Hexa-18, mechanized harp, automated flute and rainsticks. Sound is synthesized in the browser, not recorded from the installation.', controls: ['Pluck', 'Breath', 'Rainstick tilt'], initial: [30, 30, 30, 0] },
  'sea-of-salt': { title: 'Why the Sea is Salt', setting: 'Turn the story mill by hand', note: 'Photo-informed mill and accumulating salt on an open floor. Grain motion is illustrative.', controls: ['Story progress'], initial: [0] },
  'revolving-stage': { title: 'Revolving Stage', setting: 'One platform, three scenes', note: 'Drawing-informed 15 × 8 ft deck over an 8 × 8 ft base, with storefront and garden scenery. The cutaway explains the casters and central bearing; it does not simulate structural loads.', controls: ['Stage rotation', 'Show mechanism'], initial: [0, 0] },
  'black-hole': { title: 'Black Hole', setting: 'Studies of time, fabric, binaries and light', note: 'Photo-informed time-trap exhibit with spatial studies of fabric and binary motion. These are explanatory models, not numerical relativity simulations.', controls: ['Exhibit', 'Distance / separation', 'Binary phase', 'Playback'], initial: [0, 65, 0, 1, 0] },
} as const
export type WorldSpec = { title: string; setting: string; note: string; controls: readonly string[]; initial: readonly number[]; kind?: 'screen' | 'gallery' | 'cabinet' | 'watch' | 'set'; image?: string; category?: string }
export type WorldKey = string
export const worlds: Record<WorldKey, WorldSpec> = { ...objectWorlds }
for (const slug of Object.keys(objectWorlds)) {
  const evidence = projects.find(item => item.slug === slug)
  if (evidence) worlds[slug].image = evidence.access?.publicPreviewImage || evidence.image
}
