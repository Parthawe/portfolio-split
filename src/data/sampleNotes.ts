import type { PortfolioComment } from '../lib/commentStore'

// Illustrative entries for a local, unconfigured preview. Never written to the store.
const entries = [
  ['Sam', 'Hey Parth, leaving a little hello.'],
  ['Mira', 'The drawing experiment sent me down a rabbit hole. How did you build it?'],
  ['Alex', 'Which project would you point someone to first if they only had five minutes?'],
  ['Anonymous', 'Something about leaving a note on the internet feels right.'],
  ['Dee', 'Would be fun to hear more about the work that didn’t make it into the final case studies. The sketches, the dead ends, the things you tried once and kept thinking about.'],
  ['Jules', 'Hello!\nGlad I stopped by.'],
  ['Rory', 'I’m curious how you move between design and code during a project. Do you sketch the interaction first, or build something small and see where it goes?'],
  ['Taylor', 'A small note before I head out. See you around.'],
] as const

export const sampleNotes: PortfolioComment[] = entries.map(([authorName, body], index) => ({
  id: `preview-sample-${index}`,
  route: '/guestbook',
  xPercent: 50,
  yPercent: 50,
  selector: 'preview-sample',
  authorName,
  authorEmail: null,
  body,
  status: 'open',
  createdAt: `2026-10-${String(13 - Math.floor(index / 3)).padStart(2, '0')}T12:00:00Z`,
}))
