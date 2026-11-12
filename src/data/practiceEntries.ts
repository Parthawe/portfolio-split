type Practice = { description: string; focus: string; notes: string[]; limitation: string; related: { slug: string; title: string; note: string }[] }
export const practiceEntries = {
  'embodied-web': {
    description: 'Course notes on breath, pose, tilt, proximity, and silhouette as browser inputs.',
    focus: 'I explored how a physical action could make a browser response understandable without a separate explanation.',
    notes: ['Calibration and ambient noise affect whether an input feels predictable.', 'Camera, microphone, and movement inputs need permission states and manual alternatives.'],
    limitation: 'Original running sketches and recordings are unavailable in this archive.',
    related: [{ slug: 'comp-media', title: 'Computational Media', note: 'A restored camera-and-particle sketch with source notes.' }],
  },
  'feeling-patterns': {
    description: 'Course notes on pulse, vibration, and pressure as tactile signals.',
    focus: 'The studies considered how sensor timing and actuator placement change the pattern a wearer feels.',
    notes: ['A recognizable rhythm does not establish a shared emotional meaning.', 'Comfort and pattern discrimination need testing while still and while moving.'],
    limitation: 'Original prototype photographs, recordings, and recognition tests are unavailable. The generated material illustration remains an asset, but is not used here as proof of the prototypes.',
    related: [{ slug: 'mentra', title: 'Mentra', note: 'Documented decisions about feedback across phone and glasses.' }],
  },
  'performance-by-design': {
    description: 'Course notes on lighting cues, spatial choreography, and audience attention.',
    focus: 'I examined how light, sound, and movement signal a change during a live experience.',
    notes: ['A cue needs a clear relationship to the action that precedes it.', 'A visitor who enters late or leaves early still needs a coherent route.'],
    limitation: 'Original cue sheets and performance recordings are unavailable. Related scenic models are documented separately.',
    related: [{ slug: 'drowning', title: 'Drowning', note: 'Original scenic model and scene boards.' }, { slug: 'tedx', title: 'TEDxVITPune', note: 'Stage concepts, fabrication, and event photographs.' }],
  },
  'storytelling': {
    description: 'Practice notes on sequence, pacing, and the consequence of an interaction.',
    focus: 'I used the course to ask how context, decisions, and consequences can organize a design story.',
    notes: ['Place the constraint beside the decision and let the reader inspect the result.', 'An installation can explain a consequence through the action itself.'],
    limitation: 'Original narrative drafts and revision records are unavailable; these notes do not demonstrate a completed editorial study.',
    related: [{ slug: 'sea-of-salt', title: 'Why the Sea is Salt', note: 'A folktale connected to a material consequence.' }, { slug: 'enigma', title: 'Enigma', note: 'A visitor’s input followed by a visible light sequence.' }],
  },
  'hypercinema': {
    description: 'Course notes on viewer-directed film, spatial sound, and simultaneous projection.',
    focus: 'Three studies considered what happens when the viewer chooses the frame or the order of attention.',
    notes: ['Sound and movement can point toward another viewpoint.', 'Each route needs enough context to remain understandable when a viewer switches midway.'],
    limitation: 'Original playable films, sound, and projection recordings are unavailable. A generated cover cannot demonstrate the original pieces and is omitted here.',
    related: [{ slug: 'uv-light', title: 'UV Light', note: 'Original documentation of a staged reveal.' }, { slug: 'black-hole', title: 'Black Hole', note: 'Physical studies with source photographs.' }],
  },
  'applications': {
    description: 'Course notes on collaborative storytelling and campus mood-map concepts.',
    focus: 'The interface raises shared-data requirements: simultaneous contributions, persistence, moderation, and recovery.',
    notes: ['A failed submission needs a safe retry without duplicate contributions.', 'A location-based contribution needs explicit precision, retention, and removal rules.'],
    limitation: 'Original deployed builds and usage records are unavailable. These concepts do not establish a shipped service.',
    related: [{ slug: 'comp-media', title: 'Computational Media', note: 'A runnable restoration with documented changes.' }],
  },
  'messy-humans': {
    description: 'Research practice notes on distraction, anxiety, language, and access.',
    focus: 'These prompts examine the moment of use rather than assuming an attentive person on a successful path.',
    notes: ['Payments need legible fees, commitment, status, and recovery.', 'Wearable feedback needs to survive interruptions and divided attention.', 'Test semantics, keyboard access, contrast, and reduced motion with the build.'],
    limitation: 'These are review prompts, not a completed comparative study or accessibility certification.',
    related: [{ slug: 'raahi-project', title: 'Raahi', note: 'Original service research boards and transit concepts.' }],
  },
  'production-studio': {
    description: 'Course notes on scope, integration, handoffs, and exhibition preparation.',
    focus: 'The production questions concern ownership and dependencies between hardware, software, enclosure, and setup.',
    notes: ['Record what is essential when the scope changes.', 'Check physical fit and data assumptions before fabrication is fixed.', 'A handoff should let another collaborator set up and reset the work.'],
    limitation: 'The named installation, original show documentation, and operational logs are still needed for a complete production case study.',
    related: [{ slug: 'jugalbandi', title: 'Jugalbandi', note: 'Original build photographs and performance film.' }],
  },
  'arcade-lab': {
    description: 'Practice notes on four physical-controller game prototypes leading toward The Omakase.',
    focus: 'The recurring constraint was a custom controller. Slap Battle used pressure pads; Tilt Maze shared two axes; Sound Chef and Speed Sushi explored ingredient sequences.',
    notes: ['Adjacent players can notice one another while following an order.', 'Pair sound with visible feedback so neither is the only confirmation.', 'Ingredient order and color cues still need clear instructions.'],
    limitation: 'Original recordings of the four early prototypes and comparative playtest results are unavailable.',
    related: [{ slug: 'the-omakase', title: 'The Omakase', note: 'The finished cabinet, original game, controls, and performance film.' }],
  },
} satisfies Record<string, Practice>

/** Preserve existing case-study deep links as the entries become shorter. */
export const practiceAnchors: Record<keyof typeof practiceEntries, { intro: string[]; notes: string[]; related: string[] }> = {
  'embodied-web': { intro: ['cs-concept'], notes: ['cs-experiments'], related: ['cs-reflection'] },
  'feeling-patterns': { intro: ['cs-concept'], notes: ['cs-prototypes'], related: ['cs-insights'] },
  'performance-by-design': { intro: ['cs-concept'], notes: ['cs-work'], related: ['cs-reflection'] },
  'storytelling': { intro: ['cs-overview'], notes: ['cs-frameworks'], related: ['cs-application'] },
  'hypercinema': { intro: ['cs-premise'], notes: ['cs-pieces'], related: ['cs-craft'] },
  'applications': { intro: ['cs-overview'], notes: ['cs-projects'], related: ['cs-lessons'] },
  'messy-humans': { intro: ['cs-premise'], notes: ['cs-research'], related: ['cs-impact'] },
  'production-studio': { intro: ['cs-overview'], notes: ['cs-process'], related: ['cs-lessons'] },
  'arcade-lab': { intro: ['cs-overview'], notes: ['cs-prototypes'], related: ['cs-insights', 'cs-journey'] },
}
