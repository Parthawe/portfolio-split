export type CoverPreview =
  | { kind: 'film'; src: string; tone: 'light' | 'dark'; position?: string; contain?: boolean }
  | { kind: 'screens'; sources: string[]; labels: string[]; tone: 'light' }
  | { kind: 'type'; tone: 'light' }

// Only public, existing evidence. Still covers remain the default, and Shuffle
// is deliberately absent. This registry does not change experience approval.
export const coverPreviews: Record<string, CoverPreview> = {
  mentra: { kind: 'film', src: '/Assets/cover-motion/mentra.mp4', tone: 'light', contain: true },
  'mentra-brand': { kind: 'film', src: '/Assets/cover-motion/mentra.mp4', tone: 'light', contain: true },
  'transfi-project': { kind: 'film', src: '/Assets/cover-motion/transfi-project.mp4', tone: 'light', contain: true },
  jugalbandi: { kind: 'film', src: '/Assets/cover-motion/jugalbandi.mp4', tone: 'dark', position: '62% center' },
  enigma: { kind: 'film', src: '/Assets/cover-motion/enigma.mp4', tone: 'dark', position: '46% center' },
  'moniac-machine': { kind: 'film', src: '/Assets/cover-motion/moniac-machine.mp4', tone: 'dark', contain: true },
  'the-omakase': { kind: 'film', src: '/Assets/cover-motion/the-omakase.mp4', tone: 'dark' },
  drowning: { kind: 'film', src: '/Assets/cover-motion/drowning.mp4', tone: 'dark' },
  'making-of-time': { kind: 'film', src: '/Assets/cover-motion/making-of-time.mp4', tone: 'dark' },
  vishwaconclave: { kind: 'film', src: '/Assets/cover-motion/vishwaconclave.mp4', tone: 'dark' },
  'black-hole': { kind: 'film', src: '/Assets/cover-motion/black-hole.mp4', tone: 'light', contain: true },
  'mentra-miniapps': {
    kind: 'screens', tone: 'light',
    sources: ['miniapps-discover', 'miniapps-detail', 'miniapps-installed'].map(file => `/Assets/cover-motion/${file}.webp`),
    labels: ['Discover', 'Inspect', 'Install'],
  },
  'raahi-project': {
    kind: 'screens', tone: 'light',
    sources: ['raahi-home', 'raahi-routes', 'raahi-itinerary'].map(file => `/Assets/cover-motion/${file}.webp`),
    labels: ['Choose a destination', 'Compare routes', 'Follow the itinerary'],
  },
  typeface: { kind: 'type', tone: 'light' },
}
