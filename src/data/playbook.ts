/* The playbook, eight working values tied to the kind of product work
   this portfolio is actually showing. */

export interface PlaybookValue {
  num: string
  slug: string
  title: string
  summary: string
  caption: string
  object: PlaybookObjectKind
  projects: { label: string; to: string }[]
  points: { lead: string; body: string }[]
}

export type PlaybookObjectKind =
  | 'empathy'
  | 'holistic-thinking'
  | 'innovation'
  | 'collaboration'
  | 'adaptability'
  | 'ethics'
  | 'learning'
  | 'empowerment'

export const PLAYBOOK_VALUES: PlaybookValue[] = [
  {
    num: '01',
    slug: 'empathy',
    title: 'Start with the person',
    summary: 'I do not begin with feature lists. I start with the pressure, uncertainty, or ambition the person brings into the product.',
    caption: 'Good judgment starts by understanding what feels risky, confusing, or urgent for the person on the other side.',
    object: 'empathy',
    projects: [
      { label: 'Mentra', to: '/mentra' },
      { label: 'ZentiPay', to: '/zentipay' },
      { label: 'The Point CDC', to: '/the-point-cdc' },
    ],
    points: [
      {
        lead: 'Stress reveals the real task',
        body: 'In fintech and AI wearables, the real problem is rarely the happy path. It is the anxious payment, the confusing setup, or the moment someone needs the system to stay legible under pressure.',
      },
      {
        lead: 'Accessibility is product behavior',
        body: 'Readable hierarchy, forgiving flows, and clear recovery paths are not extras. They are how the product proves it understands the person using it.',
      },
    ],
  },
  {
    num: '02',
    slug: 'holistic-thinking',
    title: 'Design the whole loop',
    summary: 'The product is not one screen. It is the route in, the fallback, the settings, the internal tooling, and the handoff back out.',
    caption: 'I care about coherence across touchpoints, not isolated screens that only look good in review.',
    object: 'holistic-thinking',
    projects: [
      { label: 'Mentra', to: '/mentra' },
      { label: 'ExecutiveLens', to: '/executivelens' },
      { label: 'Mentra MiniApps', to: '/mentra-miniapps' },
    ],
    points: [
      {
        lead: 'Touchpoints must agree',
        body: 'The companion app, the OS surface, the store, the setup flow, and the support path should feel like one product. If they disagree, trust drops fast.',
      },
      {
        lead: 'Operations are part of UX',
        body: 'Internal tools, moderation states, and fallback interfaces matter because they shape what customers ultimately experience. I treat them as first-class design work.',
      },
    ],
  },
  {
    num: '03',
    slug: 'innovation',
    title: 'Prototype the behavior',
    summary: 'When the category is new, static mockups lie. I prototype motion, timing, and input early so the product can be judged as behavior.',
    caption: 'I test how a system behaves before over-polishing how it looks.',
    object: 'innovation',
    projects: [
      { label: 'Mentra', to: '/mentra' },
      { label: 'Enigma', to: '/enigma' },
      { label: 'Raahi', to: '/raahi-project' },
    ],
    points: [
      {
        lead: 'Behavior before polish',
        body: 'I would rather learn from a rough prototype that answers the timing question than a perfect mockup that avoids it. New product categories need movement and feedback tested early.',
      },
      {
        lead: 'New inputs need new language',
        body: 'Glanceable displays, ambient AI, and physical interaction systems all demand fresh interface grammar. Prototyping is how I find that grammar.',
      },
    ],
  },
  {
    num: '04',
    slug: 'collaboration',
    title: 'Work in the open',
    summary: 'The fastest path to strong work is a live loop with founders, PMs, and engineers. I want the reasoning visible, not trapped in a file.',
    caption: 'The work gets better when the why is shared, not just the screen.',
    object: 'collaboration',
    projects: [
      { label: 'Mentra MiniApps', to: '/mentra-miniapps' },
      { label: 'Clawed Chat', to: '/clawed-chat' },
      { label: 'Ballah Code', to: '/ballah-code' },
    ],
    points: [
      {
        lead: 'Explain the why, not just the screen',
        body: 'Strong collaboration is not sending a polished frame at the end. It is making the decision logic legible early enough that the team can sharpen it together.',
      },
      {
        lead: 'Bridge design and implementation',
        body: 'I work comfortably close to code, which makes the loop tighter. Decisions hold up better when they can survive contact with the build.',
      },
    ],
  },
  {
    num: '05',
    slug: 'adaptability',
    title: 'Adapt without lowering the bar',
    summary: 'Zero to one product work changes shape every week. I can pivot quickly without letting the experience collapse into a pile of compromises.',
    caption: 'Flexibility matters, but coherence matters more.',
    object: 'adaptability',
    projects: [
      { label: 'Mentra', to: '/mentra' },
      { label: 'TransFi', to: '/transfi-project' },
      { label: 'ZentiPay', to: '/zentipay' },
    ],
    points: [
      {
        lead: 'Constraints are design material',
        body: 'Small displays, regulated flows, unclear requirements, or shifting roadmaps are not interruptions to the work. They are the material the work is made from.',
      },
      {
        lead: 'A moving brief still needs standards',
        body: 'Even when direction changes, the product still needs hierarchy, logic, and taste. Adaptability is not an excuse for lower-quality decisions.',
      },
    ],
  },
  {
    num: '06',
    slug: 'ethics',
    title: 'Protect trust',
    summary: 'If the product touches money, identity, or ambient AI, clarity and restraint are not optional. Trust is part of the interface.',
    caption: 'People decide whether to trust a product through a thousand small interface decisions before they read a policy page.',
    object: 'ethics',
    projects: [
      { label: 'TransFi', to: '/transfi-project' },
      { label: 'Mentra', to: '/mentra' },
      { label: 'The Point CDC', to: '/the-point-cdc' },
    ],
    points: [
      {
        lead: 'Clarity beats cleverness',
        body: 'The more consequential the product, the less patience I have for vague copy, hidden tradeoffs, or flashy behavior that obscures what is really happening.',
      },
      {
        lead: 'Ethics shows up in defaults',
        body: 'Privacy, consent, transparency, and recovery are not only policy decisions. They show up in the defaults, the labels, and what the system asks from people.',
      },
    ],
  },
  {
    num: '07',
    slug: 'learning',
    title: 'Keep learning visible',
    summary: 'Side projects, writing, fabrication, and experiments are not separate from product work. They are how I widen the range of problems I can solve.',
    caption: 'I build things to learn faster, then bring those lessons back into the shipped work.',
    object: 'learning',
    projects: [
      { label: 'Flow Fields', to: '/flow-fields' },
      { label: 'Enigma', to: '/enigma' },
    ],
    points: [
      {
        lead: 'Build to think',
        body: 'I learn best by making. Physical computing, keyboards, installations, and experimental interfaces all expand the range of behaviors I can later design for product work.',
      },
      {
        lead: 'Transfer the lesson back',
        body: 'The point is not novelty for its own sake. The point is to bring sharper instincts, better taste, and stronger systems thinking back into shipped products.',
      },
    ],
  },
  {
    num: '08',
    slug: 'empowerment',
    title: 'Leave people in control',
    summary: 'The goal is not to make a system look smart. The goal is to help someone act with confidence, recover when needed, and understand what just happened.',
    caption: 'Agency matters more than automation theater.',
    object: 'empowerment',
    projects: [
      { label: 'ExecutiveLens', to: '/executivelens' },
      { label: 'Mentra', to: '/mentra' },
      { label: 'HealthApp', to: '/healthapp' },
    ],
    points: [
      {
        lead: 'Confidence is the feature',
        body: 'A good interface reduces hesitation. It gives people just enough context to act, not a wall of system intelligence that performs sophistication without helping.',
      },
      {
        lead: 'Recovery is part of control',
        body: 'People trust products more when they can change course, undo a choice, or understand the next step after a mistake. Recovery is not secondary, it is agency.',
      },
    ],
  },
]
