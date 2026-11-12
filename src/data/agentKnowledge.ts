import { getVisitorLocation } from '../utils/visitorLocation'
import { categories } from './categories'
import { CATEGORY_LABELS, visibleProjects as projects, type ProjectCategory } from './projects'

/* ── Types ─────────────────────────────────────────────── */

interface ProjectDeep {
  oneLiner: string          // 1 sentence hook, the thing that makes you curious
  challenge: string
  outcome: string
  insight: string
  process: string
  whyItMatters: string
  duration: string
  team: string
  platforms: string
  opinion: string           // The agent's personal take / what makes this special
  connectedTo: string[]     // Related project slugs
  surprisingFact?: string   // Something unexpected
}

interface ProjectInfo {
  slug: string
  name: string
  desc: string
  role: string
  category: string
  categorySlug: string
  year: string
  link: string
  nda?: boolean
  storyline?: {
    challenge: string
    approach: string
    result: string
  }
  deep?: ProjectDeep
}

const projectIndex = new Map<string, ProjectInfo>()
const nameIndex = new Map<string, ProjectInfo>()
const PROJECT_CATEGORY_SLUGS: Record<ProjectCategory, string> = {
  ux: 'ux-design',
  research: 'ux-research',
  ai: 'ai',
  creative: 'design-engineering',
  install: 'installations',
  brand: 'brand-visual',
  good: 'design-for-good',
}

/* ── Deep project stories ──────────────────────────────── */

const deepMap: Record<string, ProjectDeep> = {
  mentra: {
    oneLiner: 'The first smart glasses with a real app store. Parth designed the entire platform, OS, app, and ecosystem.',
    challenge: 'A 640×400px display. Users glance for 2 seconds max. Every phone UI convention breaks here, scrolling, tapping, even reading.',
    outcome: '$299 launch, 88% Batch 2 pre-orders claimed, open-source OS.',
    insight: 'Wearable UI is the opposite of phone UI. Design for peripheral vision, not focus. Voice-first, glance-not-gaze.',
    process: 'Tore apart every smart glasses failure from the last decade. Found 12 reasons they failed, most were software. Built the OS around 3 principles: glance-not-gaze, voice-first, peripheral-priority.',
    whyItMatters: 'Proves wearables can be a platform, not just a gadget. The app store changes the economics entirely.',
    duration: 'Q3 2025–Present',
    team: '1 designer, 4 engineers, product + hardware',
    platforms: 'MentraOS, Companion App (iOS/Android), App Store (Web)',
    opinion: 'This is probably the most ambitious project in the portfolio. Designing an entire OS from scratch, not many designers get to do that.',
    connectedTo: ['clawed-chat', 'executivelens', 'ai-voice'],
    surprisingFact: 'The minimum text size on the glasses is 18px. That constraint shaped every single screen.',
  },
  zentipay: {
    oneLiner: 'A fintech product that discovered fee anxiety matters more than transfer speed.',
    challenge: 'Users hesitated when pricing arrived late. The problem was not speed, it was fear of hidden costs.',
    outcome: 'Public preview: screens expose pricing, progress and recovery. Measured confidence and abandonment changes are not established publicly; deeper material requires access.',
    insight: 'Upfront fees and clear recovery are the design priorities. The public record does not establish an abandonment reduction or comparison with speed optimizations.',
    process: 'Public summary covers research framing, pricing confidence, onboarding clarity, and the trust architecture. Deeper validation details are available by access request.',
    whyItMatters: 'The preview demonstrates pricing and recovery choices; it does not establish that those choices outperform speed improvements.',
    duration: '2025, detailed timeline by request',
    team: 'Sole designer + product + eng',
    platforms: 'Mobile (iOS/Android), Web dashboard',
    opinion: 'The strongest part is the product reasoning: money products have to reduce doubt before they optimize speed.',
    connectedTo: ['transfi-project'],
    surprisingFact: 'The public case study keeps the quick read visible; deeper internals are shared directly after access is approved.',
  },
  'clawed-chat': {
    oneLiner: "An AI-assistant design study organized around approvals and execution receipts.",
    challenge: "Help a person inspect what an assistant proposes before granting permission to act.",
    outcome: "Approval-mode and receipt proposals. Three-second requests and five-second results are design targets, not measured performance. Dated evaluation notes are unavailable.",
    insight: "Show the proposed action, permission boundary, and result together.",
    process: "Documented deployment choices and proposed draft, review and result stages; permission enforcement is unverified.",
    whyItMatters: 'Separating a proposed action from authorization makes the review decision explicit.',
    duration: '10 weeks, Jan–Mar 2026',
    team: 'Sole designer, 3 engineers',
    platforms: 'Web + Mentra smart glasses',
    opinion: 'The "receipt" concept is the kind of idea that seems obvious after you see it. That\'s how you know it\'s good.',
    connectedTo: ['mentra', 'executivelens', 'ballah-code'],
    surprisingFact: "The public archive does not establish participant counts or a complete recorded product task.",
  },
  executivelens: {
    oneLiner: "A meeting-brief prototype that connects decisions to transcript citations.",
    challenge: "Help someone inspect the source of a decision and its owner before following up.",
    outcome: "A prepared transcript and citation demo. Dated beta results, adoption figures, and time savings are not established publicly.",
    insight: "A summary needs inspectable evidence, not just a concise sentence.",
    process: "Organized transcript passages, summary citations, decision owners, and follow-up actions.",
    whyItMatters: 'Shows how AI augments knowledge work without adding another tool to learn.',
    duration: '2026',
    team: 'Product Designer + engineering',
    platforms: 'Smart glasses + Web dashboard',
    opinion: 'The "no UI is the best UI" approach here is bold. Most products add features; this one removes the need for them.',
    connectedTo: ['mentra', 'clawed-chat', 'transfi-project'],
    surprisingFact: "The local demo does not record meetings or run live AI; the current external product URL remains unverified.",
  },
  'transfi-project': {
    oneLiner: 'Crypto payment infrastructure across multi-market merchant flows.',
    challenge: 'Payment markets have different regulations, currencies, and user expectations. One-size-fits-all breaks immediately.',
    outcome: 'Public preview: multi-market payment infrastructure and merchant onboarding.',
    insight: 'Compliance UX is a competitive advantage. Making KYC feel fast, not punishing, directly lifts conversion.',
    process: 'Public summary covers the product framing, merchant onboarding problem, and trust-oriented UX direction. Detailed compliance flows are available by access request.',
    whyItMatters: 'Proved regulated products can have great UX. Compliance isn\'t the enemy of design, it\'s a design problem.',
    duration: '2022–2023',
    team: 'Lead Product Designer + design team',
    platforms: 'Web, Mobile',
    opinion: 'This was Parth\'s first time leading design in a high-stakes payment environment, which forced real discipline.',
    connectedTo: ['zentipay'],
    surprisingFact: 'The public preview keeps the shape of the payment problem visible while the internal compliance flows stay private.',
  },
  'raahi-project': {
    oneLiner: "A connected public-transit service concept across app, kiosk, and in-vehicle displays.",
    challenge: 'Pune has buses, metro, auto-rickshaws, and shared cabs, but zero intermodal connectivity. Users can\'t plan multi-mode journeys or pay digitally.',
    outcome: 'Service design across the mobile app, kiosk system, in-vehicle monitors, and a unified color system for 8 transport modes.',
    insight: 'Transit design is a service design problem, not just an app problem. The kiosk, the in-vehicle screen, and the phone all need to speak the same language.',
    process: 'Field research across Pune\'s transit network. Mapped pain points in route complexity, payment friction, and wayfinding. Designed a unified system spanning app, kiosk, and in-vehicle displays with a per-mode color system.',
    whyItMatters: 'Shows how civic design at scale works: the same user journey spans physical and digital touchpoints, and every one has to be simple.',
    duration: '2022',
    team: 'Designer + researcher',
    platforms: 'Mobile app, Kiosk, In-vehicle monitors',
    opinion: 'This is the project that shows Parth can think in service design, not just screens. Every touchpoint connects.',
    connectedTo: ['the-point-cdc'],
    surprisingFact: "The concept organizes eight transport modes. Commuter anxiety reduction and operational feasibility were not measured.",
  },
  'ballah-code': {
    oneLiner: 'What happens when AI isn\'t a sidebar in the IDE, it\'s the foundation.',
    challenge: 'Every IDE bolts AI on as a chat panel. What if AI was woven into every action instead?',
    outcome: 'AI-native IDE with 17 production tools — designed the full product UX.',
    insight: 'Pair programming > autocomplete. Full-project context makes AI actually useful, not just clever.',
    process: 'Joined as product designer alongside creator Isaiah Ballah. Designed the multi-workspace layout, AI tool interactions, streaming feedback patterns, and terminal integration UX.',
    whyItMatters: 'Explores what dev tools look like when AI is primary, not secondary.',
    duration: '2026',
    team: 'Isaiah Ballah (Creator/Founder) + Parth Pawar (Product Designer)',
    platforms: 'Desktop (macOS/Win/Linux)',
    opinion: 'Parth designed the UX for Isaiah Ballah\'s vision — the product solves real workflow problems because it was built by someone who lives in the terminal.',
    connectedTo: ['clawed-chat', 'ai-voice'],
  },
  'oncall-lens': {
    oneLiner: 'Sentry alert → Claude analysis → auto-generated PR fix. Built in 24 hours.',
    challenge: 'On-call engineers get paged at 3am, spend 45 min finding the bug, 30 min writing the fix.',
    outcome: 'Automated triage + fix generation. 24-hour build.',
    insight: 'The fastest incident response is the one the engineer doesn\'t do manually.',
    process: 'Built in a hackathon sprint, Sentry webhook → Claude analysis → GitHub PR.',
    whyItMatters: 'Shows how AI can handle mechanical engineering work so humans handle the judgment calls.',
    duration: '2026',
    team: 'Designer + Developer',
    platforms: 'Web (GitHub integration)',
    opinion: 'The speed is the point, 24 hours from idea to working product. That\'s the power of having both design and dev skills.',
    connectedTo: ['clawed-chat', 'ballah-code'],
  },
  jugalbandi: {
    oneLiner: 'A human plays Hexa-18 and robotic acoustic instruments answer in a musical duet.',
    challenge: 'Make neural-network interaction audible through human input and physical acoustic mechanisms.',
    outcome: 'Exhibited at the ITP Spring Show and Maker Faire Coney Island in 2024.',
    insight: 'The duet connects a performer’s digital instrument to a physical, acoustic response.',
    process: 'Hexa-18 has 18 MIDI sensor inputs: flute at the top, tanpura on the sides, and tabla inside. Flute calls the robotic flute, tanpura calls the mechanized harp, and tabla calls the rainsticks. Browser sound is synthesized; timings and responses are illustrative adaptations, not recovered model weights or actuator logs.',
    whyItMatters: 'Visitors can connect a musical gesture to a visible acoustic mechanism.',
    duration: '5 months in 2024',
    team: 'Solo project with mentorship support through NYU ITP.',
    platforms: 'Physical installation: Hexa-18 MIDI controller, robotic flute, mechanized harp, and rainsticks.',
    opinion: 'The physical response is the useful part to watch: a digital gesture becomes a moving acoustic mechanism.',
    connectedTo: ['enigma', 'revolving-stage', 'making-of-time'],
  },
  enigma: {
    oneLiner: 'A 200-neuron light sculpture makes a letter-recognition network visible.',
    challenge: 'Make the path from a handwritten letter to a network prediction visible through physical LEDs.',
    outcome: 'The project film and photographs document the original installation.',
    insight: 'Brighter LEDs show stronger activations as a submitted letter travels through the layers.',
    process: 'The original feedforward network was trained on EMNIST letters. A tablet captured handwriting, a laptop prepared a 28 by 28 input, and an Arduino Mega drove the LEDs. The browser studies are explanatory adaptations: original trained weights, measured latency and recognition accuracy are not available in the archive.',
    whyItMatters: 'Visitors can see input, hidden layers and letter output as a physical sequence.',
    duration: '2023',
    team: 'Solo',
    platforms: 'Physical light sculpture, tablet, laptop and Arduino Mega; browser adaptations support drawing and typing.',
    opinion: 'The original film is the reference for the installation. The browser view explains the layers without claiming to run the original trained model.',
    connectedTo: ['jugalbandi', 'black-hole'],
  },
  tedx: {
    oneLiner: 'Full brand identity for TEDxVITPune, stage to screen.',
    challenge: 'Stand out from hundreds of TEDx events globally with a cohesive visual system.',
    outcome: 'Complete brand system for 800+ attendees.',
    insight: 'Conference branding is environmental design. Has to work at 50 feet (stage) and 5 inches (phone) simultaneously.',
    process: 'Started with the theme, not the logo. Let the concept drive every touchpoint, stage, print, digital, merch.',
    whyItMatters: 'Early career project that shows Parth could already think in systems, not just artifacts.',
    duration: '2021',
    team: 'Lead Visual Designer',
    platforms: 'Print, Digital, Environmental',
    opinion: 'For an early project, the systems thinking here is impressive. Every piece connects.',
    connectedTo: ['typeface'],
  },
  breakgen: {
    oneLiner: 'An AI platform that turns text prompts into fabrication-ready custom keyboards.',
    challenge: 'Custom keyboards require CAD expertise, weeks of iteration, and fabrication knowledge. What if anyone could describe a keyboard and have it built?',
    outcome: 'Working platform, 200+ visitors at ITP thesis show. Text to fabrication-ready output.',
    insight: 'Generative design works best when the AI handles mechanical constraints and the human handles aesthetics and feel.',
    process: 'Built the full pipeline: prompt parsing, key layout generation, case design, and fabrication file export. Each keyboard is structurally valid and printable.',
    whyItMatters: 'It is the thesis project, the capstone of ITP. It proves that design and engineering converge when the system is smart enough.',
    duration: '2025',
    team: 'Solo (ITP thesis)',
    platforms: 'Web + physical fabrication',
    opinion: 'This is where the design-engineer identity becomes undeniable. He built the AI, designed the product, and fabricated the output.',
    connectedTo: ['ballah-code', 'jugalbandi'],
    surprisingFact: 'Every generated keyboard is structurally valid and can be 3D printed without modification.',
  },
  'keyboard-project': {
    oneLiner: 'A physical keyboard study that turns key height into a tactile data landscape.',
    challenge: 'Keyboards are usually treated as invisible flat input devices, even though their form can carry information through touch and height.',
    outcome: 'Modified keyboard object plus 3D printed data sculpture.',
    insight: 'A familiar interface becomes easier to question when it is made physical, raised, and readable by the hand.',
    process: 'Disassembled, measured, fabricated, and reassembled a keyboard study around key-height mapping and physical data representation.',
    whyItMatters: 'This is the tactile artifact that helps separate Parth’s physical-interface work from the later BreakGen AI platform.',
    duration: '2024',
    team: 'Solo',
    platforms: 'Physical fabrication',
    opinion: 'A quieter project, but useful because it shows the material thinking behind later design-engineering work.',
    connectedTo: ['breakgen', 'jugalbandi'],
  },
  'black-hole': {
    oneLiner: 'Five physical models of black hole phenomena, exhibited at the Horological Society of NY.',
    challenge: 'Make the physics of black holes tangible, not as a diagram but as a physical object you can hold.',
    outcome: 'Five models exhibited at the Horological Society of New York.',
    insight: 'Scientific visualization is most powerful when it uses the body, not the screen. Weight, texture, and light teach faster than equations.',
    process: 'Researched 5 black hole phenomena (accretion, lensing, jets, spaghettification, Hawking radiation). Modeled each in Blender, fabricated with 3D printing and mixed media.',
    whyItMatters: 'Shows the fabrication range: from digital to physical, from design to science communication.',
    duration: '2026',
    team: 'Solo',
    platforms: 'Physical (3D printing, mixed media)',
    opinion: 'The venue alone, Horological Society of NY, says something about the quality bar. These aren\'t school projects, they\'re exhibition pieces.',
    connectedTo: ['enigma', 'making-of-time'],
  },
  'the-omakase': {
    oneLiner: '2-player sushi arcade cabinet with custom RGB controllers, exhibited at ITP and WonderVille.',
    challenge: 'Build a fully playable arcade game with custom hardware controllers and exhibit it publicly.',
    outcome: 'Playable cabinet exhibited at ITP Winter Show and WonderVille NYC.',
    insight: 'Physical game design is a different discipline from screen design. The controller IS the interface, not a proxy for it.',
    process: 'Designed the game mechanics, fabricated the cabinet, built custom RGB button controllers from scratch using Arduino. The game runs in browser but the experience is entirely physical.',
    whyItMatters: 'Shows that Parth can connect game logic, physical fabrication, electronics, and exhibition design.',
    duration: '2024',
    team: 'Collaborator',
    platforms: 'Physical arcade cabinet, Web (p5.js)',
    opinion: 'WonderVille is a real arcade bar in Brooklyn. Getting exhibited there means the game was genuinely fun, not just a school demo.',
    connectedTo: ['jugalbandi', 'shuffle'],
  },
  typeface: {
    oneLiner: 'Butler\'s Slice, a geometric sliced display family with three supplied static weights and 338 glyphs per font.',
    challenge: 'Design a typeface that has a distinctive visual identity without sacrificing readability at display sizes.',
    outcome: 'Three supplied static weights (UltraLight, Regular, Bold), each containing 338 glyphs. No variable-font axis is present in the supplied fonts.',
    insight: 'Type design is the purest form of systems design: every glyph follows the same rules but must feel individually balanced.',
    process: 'Defined the slice cut system (45-degree geometric cuts on stems and bowls). Applied it across uppercase, lowercase, numerals, and punctuation. Tested at display and body sizes.',
    whyItMatters: 'Making your own typeface is the equivalent of a musician writing their own instrument. It proves design thinking at the atomic level.',
    duration: '2022',
    team: 'Solo',
    platforms: 'Glyphs, FontForge',
    opinion: 'The portfolio uses this typeface. That level of craft, designing the letters your own portfolio is set in, is rare.',
    connectedTo: ['tedx'],
  },
  'ai-voice': {
    oneLiner: 'Reframed enterprise AI voice selection from a dropdown of demos into a confidence decision.',
    challenge: 'Enterprise buyers aren\'t picking a voice, they\'re deciding whether to trust it in front of their customers. A flat list of samples tells you nothing about fit.',
    outcome: 'Public preview: selection reframed around tone, context, and emotional fit, with deeper internals available by access request.',
    insight: 'Voice choice is a confidence problem, not a preference problem. Context-aware comparison turns a guess into an informed, defensible choice.',
    process: 'Replaced static demo lists with context-aware comparison, then designed for the enterprise approval reality, making the reasoning behind a chosen voice visible and shareable so it survives stakeholder scrutiny.',
    whyItMatters: 'As AI voices become the front line of customer contact, choosing one is product judgment, not a brand setting.',
    duration: '2025',
    team: 'Product Designer, client undisclosed (NDA)',
    platforms: 'Enterprise product',
    opinion: 'The sharpest move is designing for the approval meeting, not the solo user. Most designers forget decisions like this get reviewed by teams.',
    connectedTo: ['clawed-chat', 'mentra'],
    surprisingFact: 'The whole project rests on one reframe: a dropdown became a decision about trust.',
  },
  'code-for-build': {
    oneLiner: 'A compact learning-tool concept that turns HTML and CSS structure into 3D building blocks on a phone.',
    challenge: 'A phone-only beginner learner needed a more visual way to understand abstract layout concepts like containers, padding, text, and images.',
    outcome: 'A mobile prototype concept where web-layout elements become stackable 3D blocks, paired with a preview of the resulting page structure.',
    insight: 'A div became a container block, CSS padding became the space between blocks. The metaphor kids already knew from play made abstract code tangible.',
    process: 'Started from a teen learner persona, then adapted Scratch/Blockly-style visual thinking to web layout concepts instead of presenting it as a full coding platform.',
    whyItMatters: 'Access is a design constraint, not an excuse. The best educational interfaces reveal complexity at the pace of the learner.',
    duration: '3 months, 2021',
    team: 'Sole Interaction Designer, self-initiated',
    platforms: 'Mobile app',
    opinion: 'This is strongest as a short archive glimpse: the block metaphor is useful, but it does not need a long case-study wrapper.',
    connectedTo: ['ballah-code'],
    surprisingFact: 'The clearest idea is simple: a div becomes a container block, and padding becomes physical space between blocks.',
  },
  cuetv: {
    oneLiner: 'Product design for a specialist performing-arts streaming catalogue.',
    challenge: 'Connect discovery and playback across devices for an arts audience.',
    outcome: 'A product-design project for Operabase. Detailed evidence is reserved for private review.',
    insight: 'Only the short public project overview is available in this build.',
    process: 'Discovery, playback and campaign design. Request a private review for project detail.',
    whyItMatters: 'An example of product design for a specialist audience.',
    duration: '7 months, 2021', team: 'Product Designer, for Operabase', platforms: 'Web',
    opinion: 'Use the original cover to inspect the cross-device composition.',
    connectedTo: ['jugalbandi', 'revolving-stage'], surprisingFact: 'The public cover includes television, laptop, tablet and phone.',
  },
  'dna-speculative': {
    oneLiner: 'Would you take a pill to live forever? A speculative pharmaceutical artifact that makes you actually decide.',
    challenge: 'Speculative design usually stays too abstract to provoke a real decision. A thought experiment on screen can be shrugged off, this one had to be held.',
    outcome: "Two fictional pharmaceutical packages frame different positions on longevity and mortality. Audience hesitation was not documented as a study result.",
    insight: 'Speculative design succeeds or fails on conviction. If the artifact feels finished, the participant negotiates with the scenario instead of observing it from a safe distance.',
    process: 'Built the fiction from real references, gene editing, telomere research, Chinese alchemy, memento mori, then earned belief through details: print quality, dosage language, booklet tone, unsettlingly familiar pharmaceutical packaging.',
    whyItMatters: 'Turns an abstract ethics debate about anti-aging into choice architecture. The object carries the argument.',
    duration: '2024',
    team: 'Solo, Creator, at NYU ITP',
    platforms: 'Physical packaging, print',
    opinion: 'Making Embrace Death a genuinely serious option, not a joke, is what makes the whole piece work. Most designers would have played it for irony.',
    connectedTo: ['uv-light', 'making-of-time'],
    surprisingFact: 'Neither box is the "right answer." The design work went equally into arguing both sides.',
  },
  healthapp: {
    oneLiner: 'A self-initiated Google Tasks redesign for goals, reminders and calendar conflicts.',
    challenge: 'Include personal goals and recurring care activities while keeping proposed schedule changes visible.',
    outcome: 'Original mobile and calendar concept boards. No live scheduling service, automatic sensing or health outcomes are established.',
    insight: 'A proposed calendar adjustment needs a visible confirmation or cancellation path.',
    process: 'Sketched goal selection, reminder setup and an overlap prompt; documented the existing Google Tasks baseline separately.',
    whyItMatters: 'Shows the design decisions and source limits of a planning concept.',
    duration: '4 months, 2024',
    team: 'Product Designer, independent concept',
    platforms: 'Mobile and calendar concepts',
    opinion: 'The overlap prompt is the clearest decision to inspect: what changes, and can the person decline it?',
    connectedTo: ['ibm'],
    surprisingFact: 'The original study is titled Reimagining Google Tasks App.',
  },
  ibm: {
    oneLiner: 'A research glimpse into cancer prognosis on genomic data that stays encrypted during computation.',
    challenge: 'Most clinical AI decrypts patient data before analyzing it, exposing the most sensitive information a person can share. The weak point isn\'t storage or transit, it\'s computation itself.',
    outcome: 'A research pipeline produced Kaplan-Meier survival curves for seven treatment groups, with encrypted transfer overhead measured at 42s client-side and 28s server-side.',
    insight: "The prototype explores an encrypted-data processing boundary. Privacy guarantees and runtime conclusions require the original configuration and threat model.",
    process: 'Feature selection and validation on clinical and genomic inputs, encryption with IBM\'s FHE toolkit, a neural-network workflow on encrypted data, decryption only at the point of interpretation for clustering and survival curves.',
    whyItMatters: "The case documents a research pipeline; it is not a clinically validated service or proof of complete privacy.",
    duration: '8 months, 2020',
    team: 'Research internship at IBM, with mentors and a 4-engineer student team',
    platforms: 'FHE Toolkit, Python, Java, Neural Networks',
    opinion: 'This is strongest when kept plain and technical: the value is system logic, not a polished product interface.',
    connectedTo: ['healthapp', 'raahi-project'],
    surprisingFact: "Output plots and reported runtimes need dataset, hardware, workload and validation context before comparison.",
  },
  'making-of-time': {
    oneLiner: 'Built three timekeeping systems, sundial, mechanical watch, software clock, to feel how each medium changes our relationship with time.',
    challenge: 'Not how to tell time more accurately, but how the medium of timekeeping shapes attention. Each phase demanded a completely different craft, from gnomon geometry to escapements to code.',
    outcome: 'Three working timepieces: a hand-calibrated sundial etched for NYC\'s latitude, a reassembled mechanical movement, and p5.js clocks that map time to color and live weather data.',
    insight: 'The more abstract the timekeeping medium, the more freedom to redefine what time means. A sundial is bound to the sun, a watch to physics, a digital clock only to imagination.',
    process: 'Sundial first: research gnomon geometry, hand-etch hour lines, test outdoors for weeks. Then dissect mechanical movements under magnification and reassemble one. Finally, build software clocks that communicate the quality of a moment, not just its position.',
    whyItMatters: 'Shows range across observation, precision metalwork, and code, and the kind of first-principles curiosity that treats "what is a clock?" as a design question.',
    duration: '2024',
    team: 'Solo, creator',
    platforms: 'Physical (sundial, mechanical + quartz watches), p5.js software clocks',
    opinion: 'The sundial takeaway is the best part: you can\'t glance at it like a phone, you have to stand there and interpret a shadow. That\'s a design critique of every screen we make.',
    connectedTo: ['black-hole', 'sea-of-salt', 'typeface'],
    surprisingFact: 'The sundial\'s hour lines account for the equation of time, the wobble between solar time and clock time caused by Earth\'s elliptical orbit.',
  },
  'mentra-brand': {
    oneLiner: 'The entire brand surface for Mentra\'s AI smart glasses, logo, packaging, booklet, ads, renders, designed by one person and shipped into customers\' hands.',
    challenge: 'A young hardware company judged on the shelf next to Meta Ray-Ban, with a trillion-dollar design budget behind it. And every decision becomes a factory instruction, not a reversible mockup.',
    outcome: 'Shipping. 7 packaging iterations, 4 booklet print rounds, 24 social templates, 3 render families, and YouTubers unboxing it on camera with the brand pattern visible.',
    insight: 'Constraint is the brief: screen print can\'t do gradients, laser engraving needs 0.3mm outlined strokes, embossing needs depth. Physical media teaches you to argue in vector and ship with conviction.',
    process: 'One mark built from three parallelograms that survives from 5mm temple engraving to billboard. One green (#00B869) against an industry of blue. Then packaging, booklet, photography, ads, and a creator guide strict enough for strangers to use unsupervised.',
    whyItMatters: 'Proves a systems approach beats one perfect execution, a brand 200 people can reproduce independently is worth more than any single ad.',
    duration: 'Q3 2025–Present',
    team: 'Sole designer across hardware, product, operations, and manufacturing partners',
    platforms: 'Print, packaging, laser engraving, social (12 platforms), 3D renders',
    opinion: 'The booklet is the sharpest call: page one is just a QR code, no welcome letter. Someone finally designed for what people actually do when they open a box.',
    connectedTo: ['mentra', 'mentra-miniapps', 'tedx'],
    surprisingFact: 'The box flap says \'Designed on Earth\', a nod to the open-source MentraOS community, placed exactly where Apple puts \'Designed by Apple in California.\'',
  },
  'mentra-miniapps': {
    oneLiner: "Store discovery and app-use designs for the Mentra MiniApps platform.",
    challenge: "Connect phone discovery with understandable app use and runtime status on glasses.",
    outcome: "Original Store and app-use screens, with developer submission and permission flows identified separately as proposals. No end-to-end adoption result is established here.",
    insight: "Distinguish discovery, launch, active status, and stopping an app.",
    process: "Designed Store screens and phone controls alongside Notes, Call, Guidance, and glasses experiences.",
    whyItMatters: 'Meta Ray-Ban does what Meta decides. Mentra does what anyone with an idea builds for it. That\'s the difference between a gadget and a platform.',
    duration: 'Q4 2025–Q1 2026',
    team: 'Head of UI/UX, sole designer, with 4 engineers, product, and the open-source ecosystem',
    platforms: 'MentraOS, Companion App, Web developer portal',
    opinion: 'Parth calls this the hardest design problem in the whole Mentra project, harder than the OS. The store is where the platform thesis either proves itself or dies.',
    connectedTo: ['mentra', 'clawed-chat', 'executivelens'],
    surprisingFact: "The supplied materials do not verify a fifteen-minute developer completion time.",
  },
  'moniac-machine': {
    oneLiner: 'A 1949 hydraulic economic computer reborn as a playable arcade cabinet where you run the economy.',
    challenge: 'Macroeconomic feedback loops are famously hard to teach, textbook diagrams can\'t make you feel why every policy decision creates a tradeoff somewhere else.',
    outcome: 'An exhibited arcade cabinet with 7 physical levers; playtesters could predict how interest rate changes ripple through employment and inflation after just a few rounds, and several came back to try new strategies.',
    insight: 'Emotional stakes teach systems thinking. Watching your economy collapse because you raised taxes two points too high beats weeks of reading about the inflation–unemployment tradeoff.',
    process: 'Started from Bill Phillips\' original MONIAC, which modeled the UK economy with colored water in pipes. Rebuilt that make-the-invisible-visible commitment as an iPad-and-Teensy cabinet with valve controllers, a simulation engine, and random shock cards, trade wars, disasters, pandemics.',
    whyItMatters: 'Proof that game design can carry real educational weight, economics students said it finally explained why policy decisions are so hard in practice.',
    duration: '2024',
    team: 'Solo, creator',
    platforms: 'Physical arcade cabinet (iPad, Teensy 4.0, 3D-printed valve controllers)',
    opinion: 'The best detail is the fidelity to the source: the on-screen visuals are animated flow diagrams echoing the original hydraulic pipes. It honors the 1949 machine instead of just name-dropping it.',
    connectedTo: ['black-hole', 'sea-of-salt', 'flow-fields'],
    surprisingFact: 'The original MONIAC modeled the UK national economy with actual colored water flowing through transparent tanks, a computer made of plumbing.',
  },
  'office-of-diversity': {
    oneLiner: 'A compact report-publishing project for NYU Tisch\'s IDBEA content.',
    challenge: 'A dense institutional report needed to become easier to scan, navigate, and revisit across desktop and mobile.',
    outcome: 'A structured web report that made IDBEA milestones and progress easier for the Tisch community to read.',
    insight: 'Data visualization is translation, not decoration, hold fidelity to the numbers and empathy for the reader at the same time.',
    process: 'Translated report content into responsive sections, visual summaries, and accessible reading patterns over a 3-month publishing project.',
    whyItMatters: 'Institutional trust is built in details: readable structure, accessible presentation, and restraint around sensitive content.',
    duration: '3 months, 2024',
    team: 'Website Publishing Designer, collaborating with Christina Monea at the Office of Diversity',
    platforms: 'Responsive web report',
    opinion: 'This should stay compact. It proves accessible publishing discipline without pretending to be a large product redesign.',
    connectedTo: ['the-point-cdc', 'raahi-project'],
  },
  'revolving-stage': {
    oneLiner: 'A 15-foot revolving theatre stage, engineered from scratch to carry actors mid-rotation.',
    challenge: "Design a 15 ft. rotating platform over an 8 ft. base around a 250 kg load target, within a three-month production.",
    outcome: "Built stage and original assembly/performance documentation. Independent load, noise, and scene-change timing records are unavailable.",
    insight: 'Design is a systems discipline, not a visual one. Every aesthetic decision was also structural: parallax needed specific material thicknesses, transitions needed specific rotation speeds.',
    process: 'Engineered a four-part modular assembly, platform, steel axle with thrust bearings, twin rings of silent caster wheels, wooden base, sized to fit through standard doorways and assemble on-site in a day.',
    whyItMatters: 'Broadway-style stagecraft on a college competition budget. Proof that theatrical ambition needs careful engineering, not professional-grade money.',
    duration: '3 months, 2022',
    team: 'Art Director and engineer, leading a 65+ person production for Firodia Karandak',
    platforms: 'Physical fabrication, welding, carpentry, mechanical engineering',
    opinion: 'The climax says it all: the stage rotated 135 degrees with actors still on it, mid-dialogue, as the world changed around them. That\'s design as theatre, literally.',
    connectedTo: ['tedx', 'the-omakase', 'sea-of-salt'],
    surprisingFact: "The load figure is a design target, not a certified capacity.",
  },
  'sea-of-salt': {
    oneLiner: 'A physical storytelling machine that grinds real salt as you advance through a Norse folktale.',
    challenge: 'Stories usually stay mental. The goal was a folktale where moving through the narrative leaves a visible physical cost in the room.',
    outcome: 'A working installation: slide the story forward, the mill grinds real sea salt onto a black platform. Visitors asked to take salt home as a souvenir.',
    insight: 'Physical cost makes people careful with a story. Visitors slid slowly, inch by inch, in a way text never produces.',
    process: 'Took ATU 565, the Norse tale of the mill that can\'t stop grinding, and built its tragedy into hardware: a slider mapped to a servo-driven salt mill, slow at the start, relentless at the end.',
    whyItMatters: 'It collapses the line between narrative and material. The story\'s consequence (the mill never stops) becomes the room\'s reality (the salt keeps accumulating).',
    duration: 'Storytelling course, NYU ITP, 2025',
    team: 'Parth (creator and fabricator) + collaborator Audrey Oh',
    platforms: 'Physical installation: Arduino, servo motor, 3D printing, laser cutting',
    opinion: 'The best detail is the surface: black lacquered MDF chosen so every grain of salt reads as evidence. That\'s exhibition design thinking, not just physical computing.',
    connectedTo: ['making-of-time', 'shuffle', 'moniac-machine'],
    surprisingFact: 'There\'s a live salt simulation on the project page itself, you can grind the story in the browser, and there\'s no undo.',
  },
  shuffle: {
    oneLiner: 'A motorised-slider board where balancing student life is a zero-sum game, raise Finals and Sleep physically drops.',
    challenge: 'Time trade-offs in graduate school are invisible until something breaks. A dashboard can display that; the question was how to make people feel it.',
    outcome: 'On the ITP floor it needed no instructions. Quick interactions turned into long conversations about priorities and burnout.',
    insight: 'The zero-sum rule isn\'t displayed, it\'s enforced by the hardware. When the other faders move on their own, the rules are understood without a word.',
    process: 'Started as a sketch of twelve sliders, pared down to eight that genuinely compete for the same hours. Arduino reads the fader you move and drives motors on the rest.',
    whyItMatters: 'It\'s embodied systems design: the interface enforces the trade-off instead of visualizing it. A playful, tactile object opened dialogue that forms and calendars can\'t.',
    duration: '2023',
    team: 'Solo, Parth as creator',
    platforms: 'Physical installation: Arduino (C++), 8 motorised potentiometers, laser-cut plywood, 3D-printed caps',
    opinion: 'Watching someone hesitate before letting Sleep drop to raise Finals says more about grad school than any survey. That hesitation is the product.',
    connectedTo: ['sea-of-salt', 'making-of-time', 'moniac-machine'],
    surprisingFact: 'The mechanic borrows from G80 by Fragmentin, a motorized-fader piece about planetary resource distribution, shrunk down to one student\'s week.',
  },
  'the-point-cdc': {
    oneLiner: 'Website redesign for a Bronx nonprofit that provides free WiFi and community programs in Hunts Point.',
    challenge: 'An outdated site with cluttered navigation buried the resources residents needed most, especially the free Hunts Point WiFi info, on a mostly mobile audience.',
    outcome: 'The site is live at thepoint.org. Community and staff feedback was overwhelmingly positive, especially on navigation and WiFi program access.',
    insight: 'Mobile-first is a lived reality, not a buzzword: many residents\' only internet access is a phone, which reframes every layout and hierarchy decision.',
    process: 'User research with Hunts Point residents, persona and journey mapping, an audit of the old site, then a full design system, wireframes, and high-fidelity redesign in Figma.',
    whyItMatters: 'It navigates the hardest nonprofit tension: what the org wants to say vs. what residents need to find. Prioritizing user tasks served both goals better.',
    duration: '3 months, 2024',
    team: 'Parth as lead UI/UX designer for The Point CDC',
    platforms: 'Responsive web (mobile-first)',
    opinion: 'The honest reflection is the best part: Parth admits his instincts about what residents needed were often wrong until he sat down and listened. That humility is rarer than the redesign.',
    connectedTo: ['office-of-diversity', 'code-for-build'],
    surprisingFact: 'The Point CDC runs free community WiFi through a resilient mesh network, so the website redesign was partly infrastructure documentation.',
  },
  'uv-light': {
    oneLiner: 'A multi-room blacklight installation about surveillance, where the audience had to discover the message before they could name it.',
    challenge: 'An installation about hidden information fails if it explains itself too early. The whole design problem was pacing: how much stays hidden before curiosity becomes confusion?',
    outcome: 'Participants moved from playful discovery to mild unease as portrait cards and a live camera feed revealed they\'d been the ones observed all along.',
    insight: 'Observation often arrives wrapped in invitation, convenience, and play. Friendly questions on a card became soft data collection under UV.',
    process: 'Researched participatory theater logic over gallery logic, tested invisible inks and UV paints, converted classrooms into sealed blacklight environments, and staged the reveal as a sequence ending in a Van Gogh-themed performance.',
    whyItMatters: 'Spatial work needs the same narrative discipline as product design: participants should know just enough to keep going. Here UV-reactive cues were the interface.',
    duration: '2 weeks, 2023',
    team: 'Parth as artist + collaborators Nathan, Lauren, Baiyuian at NYU ITP',
    platforms: 'Physical installation: blacklights, invisible ink, live camera feed, projection',
    opinion: 'The camera feed is the strongest move. It changed the audience\'s role mid-experience, the piece stopped being about hidden drawings and became about hidden observation.',
    connectedTo: ['revolving-stage', 'enigma', 'sea-of-salt'],
    surprisingFact: 'The final hidden message, "SHOW DON\'T TELL," doubled as the method and the critique.',
  },
  'vj-software': {
    oneLiner: 'A parking app that treats choosing a spot as a spatial decision, not a back-office form flow.',
    challenge: 'Society apps treated parking like paperwork. Residents wanted to understand proximity, access, and layout before committing, and existing tools buried that under admin dashboards.',
    outcome: 'A map-first booking experience for VJ residential societies: interactive society map, priority-window explanations, and post-booking screens that replace the office file.',
    insight: 'Residents think in proximity and movement, not spot IDs. When users experience a problem spatially, the product can\'t reduce it to form fields and dropdowns.',
    process: 'Interviewed owners and tenants, analyzed competitors like MyGate and NoBrokerHood, mapped the cash-and-office status quo, then sketched eleven paper wireframes before high-fidelity Figma flows.',
    whyItMatters: 'Service software often fails by burying the one flow people care about. Making parking the hero experience turned admin software into something genuinely useful.',
    duration: '3 months, 2022',
    team: 'Parth as UI/UX designer with UX lead Akshita Anand, for Vilas Javdekar',
    platforms: 'Mobile app',
    opinion: 'The landing screen explaining the priority window in plain language is quietly great, it makes time pressure feel like information instead of a dark pattern.',
    connectedTo: ['raahi-project', 'healthapp'],
    surprisingFact: 'The research covered two very different offline baselines, one society ran entirely on verbal explanations and cash, and the app had to beat both.',
  },
}

for (const project of projects) {
  const registryStory = project.storyline
  const deep = deepMap[project.slug]
  const info: ProjectInfo = {
    slug: project.slug,
    name: project.name,
    desc: project.desc,
    role: project.summaryRole || deep?.team || 'Designer',
    category: CATEGORY_LABELS[project.category],
    categorySlug: PROJECT_CATEGORY_SLUGS[project.category],
    year: project.year,
    link: `/${project.slug}`,
    nda: project.nda,
    storyline: registryStory,
    deep: deep
      ? {
          ...deep,
          challenge: registryStory?.challenge || deep.challenge,
          outcome: project.summaryOutcome || deep.outcome,
          duration: project.summaryTimeline || deep.duration,
          team: project.summaryTeam || deep.team,
        }
      : undefined,
  }
  projectIndex.set(project.slug, info)
  nameIndex.set(project.name.toLowerCase(), info)
}

/* ── Bio ───────────────────────────────────────────────── */

const bio = {
  name: 'Parth Pawar', title: 'Design Engineer', location: 'United States',
  current: 'Head of UI/UX at Mentra, designing the entire platform for AI smart glasses.',
  status: 'Open to product design in AI, dev tools, fintech, 0→1.',
  email: 'parthpawar@nyu.edu',
  education: [
    { school: 'NYU Tisch / ITP', degree: 'MPS Interactive Telecommunications', years: '2022–2024' },
    { school: 'VIT Pune', degree: 'BE Computer Science', years: '2018–2022' },
  ],
  experience: [
    { period: 'Q3 2025–Now', role: 'Head of UI/UX', co: 'Mentra' },
    { period: 'Q2–Q3 2025', role: 'Founding Designer', co: 'ZentiPay' },
    { period: '2022–2023', role: 'Lead Designer', co: 'TransFi' },
    { period: '2024', role: 'Designer', co: 'The Point CDC' },
    { period: '2023–2024', role: 'TA', co: 'NYU Tisch' },
    { period: '2021–2022', role: 'Designer', co: 'Monson Fish' },
    { period: '2020–2022', role: 'Co-founder', co: 'ArtTown Podcast' },
  ],
  awards: ['Red Burn + ITP Scholarships (2024)', 'Tisch Scholarship (2023)', 'Exhibited: Maker Faire, WonderVille, NIME'],
  tools: { design: ['Figma', 'Protopie', 'After Effects'], threeD: ['Blender', '3D Printing', 'Laser Cutting'], code: ['React', 'Swift', 'Python', 'TypeScript'], creative: ['p5.js', 'TouchDesigner', 'Arduino'] },
  funFacts: [
    'Builds keyboards he doesn\'t need', '4px border-radius purist',
    'Pour-over > espresso', 'More vinyl than shelf space', 'Made his own typeface',
    'Wrote poems for 100 days straight', 'Sketches every day', 'Hosted 45 podcast episodes',
    'Rode the NYC subway blindfolded for research', 'Built this portfolio in React 19',
  ],
  practices: [
    { name: '100 Days of Poem', handle: '@poem.nyc', why: 'Poetry trains the same muscle as microcopy, saying the most with the least.' },
    { name: '100 Days of Sketch', handle: '@townforartist', why: 'Daily drawing trains the gap between seeing and noticing.' },
    { name: '50 Days of Photoshop', handle: '@designwhich.works', why: 'Pushing tools past their intended use.' },
    { name: 'ArtTown Podcast', handle: '@arttown.store', why: '45 episodes about craft, not careers.' },
  ],
}

/* ── Helpers ────────────────────────────────────────────── */

function fuzzyFind(query: string): ProjectInfo | undefined {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  if (!q) return undefined
  if (nameIndex.has(q)) return nameIndex.get(q)
  const s = q.replace(/\s+/g, '-')
  if (projectIndex.has(s)) return projectIndex.get(s)
  if (projectIndex.has(q)) return projectIndex.get(q)
  let best: ProjectInfo | undefined, bestScore = 0
  for (const [name, info] of nameIndex) {
    if (name.includes(q) || q.includes(name)) {
      const sc = Math.min(name.length, q.length) / Math.max(name.length, q.length)
      if (sc > bestScore) { bestScore = sc; best = info }
    }
  }
  if (best) return best
  for (const [slug, info] of projectIndex) if (slug.includes(s) || s.includes(slug)) return info
  // Word-level matching, require at least 4 chars to avoid false positives like "it", "the"
  const words = q.split(/\s+/)
  for (const [name, info] of nameIndex) if (words.some(w => w.length > 3 && name.includes(w))) return info
  return undefined
}

function pick<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('pick() called on empty array')
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRelated(p: ProjectInfo): ProjectInfo[] {
  return (p.deep?.connectedTo || []).map(s => projectIndex.get(s)).filter((x): x is ProjectInfo => !!x).slice(0, 3)
}

/* ── Section detection ─────────────────────────────────── */

export type VisibleSection = 'hero' | 'work' | 'about' | 'skills' | 'experience' | 'practices' | 'cta' | 'credits' | 'overview' | 'process' | 'features' | 'unknown'

export function detectSection(): VisibleSection {
  if (typeof window === 'undefined') return 'unknown'
  const mid = window.innerHeight * 0.4
  const checks: [string, VisibleSection][] = [
    ['.hero, .hp-hero, .hero-3d-wrap', 'hero'],
    ['.cs-credits, .abt-cta', 'cta'],
    ['.cs-process, .cs-steps, .cs-flow', 'process'],
    ['.cs-feature-grid, .cs-info-grid', 'features'],
    ['.cs-overview, .project-overview', 'overview'],
    ['.abt-practice-grid', 'practices'],
    ['.abt-timeline, .abt-exp', 'experience'],
    ['.abt-codex, .abt-vibe, .abt-tools, .abt-skills', 'skills'],
    ['.wr-grid, .work-grid, .wr-archive', 'work'],
    ['.abt-hero, .abt-intro', 'about'],
  ]
  for (const [sel, sec] of checks) {
    const el = document.querySelector(sel)
    if (el) { const r = el.getBoundingClientRect(); if (r.top < mid && r.bottom > 0) return sec }
  }
  return 'unknown'
}

/* ── Route greeting (short, curious) ───────────────────── */

export function getRouteGreeting(path: string): string {
  const section = detectSection()

  if (path === '/') return pick([
    "Hey, I'm Folio. I know every project here. Tell me what you're looking for and I'll point you to the right ones, or say 'tour' and I'll walk the whole page.",
    "Welcome. I can shortlist the three strongest projects for what you care about, walk you through a case study, or just answer anything. What's useful?",
    "Pick a project, ask for a hiring shortlist, or say 'tour' and I'll guide you through. I have opinions about all of this.",
  ])
  if (path === '/work') return pick([
    "Full archive. Three views now: Editorial, Index, and Arc. Ask for one and I’ll switch to it, or ask for a shortlist.",
    "This is everything. Six disciplines, from fintech to light sculptures. I can switch the page into Index or Arc mode if you want a different read.",
  ])
  if (path === '/about') {
    if (section === 'skills') return "Those tools? They're not decorative. Ask me how any of them gets used in a real shipped project."
    if (section === 'experience') return "Want the real story behind any of these roles? The Mentra and ZentiPay ones are the most interesting."
    if (section === 'practices') return "100 days of poems, 100 days of sketches, 45 podcast episodes. These explain where the consistency comes from. Ask me about any of them."
    return pick([
      "This is the person behind the work. I can tell you about the roles, the tools, the practices, or just what makes Parth different. What's useful?",
      "Resume, tools, daily practices, it's all here. Say 'tour' and I'll walk it, or ask me anything specific.",
    ])
  }

  if (path === '/playbook') return "This is the playbook, the eight values behind every project here. Ask me how any of them shows up in real shipped work, that's the interesting part."

  const cat = categories.find(c => path === `/${c.slug}`)
  if (cat) return `${cat.title} ${cat.titleAccent}. I know every project here, ask about any of them or say 'tour' for the guided version.`

  const slug = path.replace(/^\//, '')
  const p = projectIndex.get(slug)
  if (p?.deep) return `${p.deep.oneLiner} Say 'tour' and I'll walk the case study, or ask about the challenge, process, or why it matters.`
  if (p) return `**${p.name}**, ${p.desc}. Ask me anything or say 'tour' for the walkthrough.`

  return "Hey, ask me about any project."
}

/* ── Dynamic chips ─────────────────────────────────────── */

export function getDynamicChips(path: string, qCount: number, lastSlug?: string, ctx?: ChatContext): string[] {
  const section = detectSection()
  const slug = path.replace(/^\//, '')
  const p = projectIndex.get(slug) || (lastSlug ? projectIndex.get(lastSlug) : undefined)
  const persona = ctx?.persona || 'unknown'
  const scrollDepth = ctx?.scrollDepth || 0
  const timeOnPage = ctx?.timeOnPage || 0
  const visited = ctx?.visitHistory || []

  // Deep in conversation + on a project
  if (qCount > 4 && p) {
    const chips = ['Why it matters', 'Related work', 'Surprising fact']
    chips.push(persona === 'recruiter' || persona === 'hm' ? 'Role fit' : 'Hire Parth')
    if (timeOnPage > 120) chips.push('Export summary')
    return chips.slice(0, 4)
  }

  // Deep in conversation, no project
  if (qCount > 4) {
    const chips = ['Best project', 'Something unexpected']
    if (visited.length > 3) {
      const last2 = visited.filter(v => v !== '/' && v !== '/work' && v !== '/about').slice(-2)
      if (last2.length === 2) {
        const a = projectIndex.get(last2[0].replace(/^\//, ''))
        const b = projectIndex.get(last2[1].replace(/^\//, ''))
        if (a && b) chips.push(`Compare ${a.name} and ${b.name}`)
      }
    }
    chips.push('Contact')
    return chips.slice(0, 4)
  }

  // On a project page with deep story
  if (p?.deep) {
    if (scrollDepth > 80) return ['Key insight', 'Related work', 'Why it matters', 'Export summary']
    if (section === 'overview') return ['The real challenge', 'Key insight', 'How it was built', 'Team']
    if (section === 'process') return ['Why this approach?', 'What surprised you?', 'Outcome', 'Related']
    if (section === 'cta') return ['Similar work', 'Best project overall', 'Hire Parth', 'Surprising fact']
    return ['The challenge', 'Key insight', 'Your take on it', 'Related work']
  }
  if (p) return [`More on ${p.name}`, 'Similar projects', 'Best work', 'Contact']

  const cat = categories.find(c => path === `/${c.slug}`)
  if (cat) return [`Best ${cat.title} project`, 'Design approach', 'All categories', 'Contact']

  if (path === '/') {
    if (persona === 'recruiter' || persona === 'hm') return ['Hiring shortlist', 'Role fit', 'Best research process', 'Most ambitious project']
    return ['Hiring shortlist', 'Most ambitious project', 'Best research process', 'Creative range']
  }
  if (path === '/work') return ['Index view', 'Arc view', 'Start with flagship work', 'Best research process']
  if (path === '/about') {
    if (section === 'skills') return ['How he uses Figma', 'Code + design?', 'Favorite tool', 'Physical work']
    if (section === 'experience') return ['Best role?', 'Mentra story', 'ZentiPay story', 'Teaching at NYU']
    if (section === 'practices') return ['Why poetry?', 'The podcast', 'Sketching habit', 'Fun facts']
    if (persona === 'recruiter' || persona === 'hm') return ['Role fit', 'Can he code too?', 'Mentra story', 'Contact']
    return ['What kind of roles fit him?', 'Can he code too?', 'Daily practices', 'Contact']
  }
  return ['Best projects', 'About Parth', 'Hidden gem', 'Hire Parth']
}

/* ── Context ───────────────────────────────────────────── */

export type Persona = 'recruiter' | 'hm' | 'peer' | 'founder' | 'student' | 'unknown'

export interface ChatContext {
  route: string
  lastProject?: string
  mentionedProjects: string[]
  questionCount: number
  lastTopic?: string
  // Phase 1: behavioral signals
  scrollDepth: number
  timeOnPage: number
  visitHistory: string[]
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  persona: Persona
}

export function createContext(route: string): ChatContext {
  return {
    route,
    mentionedProjects: [],
    questionCount: 0,
    scrollDepth: 0,
    timeOnPage: 0,
    visitHistory: [],
    persona: 'unknown',
  }
}

export function getProjectNarrative(slug: string) {
  const project = projectIndex.get(slug)
  if (!project) return undefined

  return {
    name: project.name,
    link: project.link,
    role: project.role,
    category: project.category,
    storyline: project.storyline,
    deep: project.deep,
  }
}

/* ── Response engine ───────────────────────────────────── */
// KEY PRINCIPLES:
// 1. Short first, 2-3 lines, then offer to go deeper
// 2. Have opinions, the agent has a point of view
// 3. Connect dots, after one project, mention related ones naturally
// 4. Progressive disclosure, don't dump everything at once
// 5. Tease, build curiosity, don't satisfy it immediately

interface Rule { patterns: RegExp[]; handler: (m: RegExpMatchArray, c: ChatContext) => string }

function cp(ctx: ChatContext): ProjectInfo | undefined {
  if (ctx.lastProject) return projectIndex.get(ctx.lastProject)
  const s = ctx.route.replace(/^\//, '')
  return projectIndex.get(s)
}

const rules: Rule[] = [
  // Where to start / hiring shortlist — persona-aware
  { patterns: [/(?:hiring shortlist|recruiter|hiring manager|where should i start|what should i start with|what should i see|show me first|best three|start with three|shortlist)/i],
    handler: (_, ctx) => {
      const visited = new Set(ctx.visitHistory.map(v => v.replace(/^\//, '')))
      const unseen = (slug: string) => !visited.has(slug)

      if (ctx.persona === 'founder') {
        return "For a founder evaluating 0→1 ownership:\n\n• **[Mentra](/mentra)**, full platform from scratch, OS + app + app store.\n• **[Clawed](/clawed-chat)**, AI approval and receipt design proposals.\n• **[ZentiPay](/zentipay)**, founding designer, research to shipped product."
      }
      if (ctx.persona === 'peer') {
        const picks = [
          unseen('jugalbandi') ? '• **[Jugalbandi](/jugalbandi)**, neural network that duets with humans, Maker Faire.' : '• **[Enigma](/enigma)**, 200-neuron light sculpture at NIME.',
          unseen('typeface') ? '• **[Butler’s Slice](/typeface)**, display typeface built from one formal rule.' : '• **[Flow Fields](/flow-fields)**, compact generative-art study.',
          '• **[Mentra](/mentra)**, the systems ambition piece, full OS design.',
        ]
        return "For creative range:\n\n" + picks.join('\n')
      }
      // Default / recruiter / hm
      const picks = [
        unseen('mentra') ? '• **[Mentra](/mentra)** for systems ambition, full OS, companion app, and app store.' : '• **[ExecutiveLens](/executivelens)** for a meeting-brief prototype with inspectable citations.',
        unseen('zentipay') ? '• **[ZentiPay](/zentipay)** for research rigor and trust-driven fintech thinking.' : '• **[TransFi](/transfi-project)** for payment-infrastructure scale and merchant UX.',
        unseen('jugalbandi') ? '• **[Jugalbandi](/jugalbandi)** for creative range beyond product UI.' : '• **[Clawed](/clawed-chat)** for AI trust architecture.',
      ]
      return "Start with these three:\n\n" + picks.join('\n')
    }
  },

  // Best research process
  { patterns: [/(?:best research|research process|research rigor|strongest research)/i],
    handler: () => "If you care about research depth, start with **[ZentiPay](/zentipay)**. The public preview shows how pricing confidence became the product strategy; deeper validation detail is shared by request.\n\nThen look at **[Raahi](/raahi-project)** for embodied field research and accessibility thinking."
  },

  // Creative range
  { patterns: [/(?:creative range|experimental|unexpected|show me something different|range)/i],
    handler: () => "For range: **[Jugalbandi](/jugalbandi)**, **[Enigma](/enigma)**, and **[The Omakase](/the-omakase)**.\n\nThat trio makes the point fast: machine learning, physical computing, and playful fabrication all live in the same practice."
  },

  // Work views
  { patterns: [/(?:index view|library view|arc view|timeline view|editorial view|work views|work modes|browse modes)/i],
    handler: () => "The Work page now has three reads of the same portfolio:\n\n• **Editorial**, best first read\n• **Index**, best for compact scanning\n• **Arc**, best for progression over time\n\nTell me which one you want and I’ll switch it."
  },

  // Most ambitious
  { patterns: [/(?:most ambitious|biggest swing|highest ambition|largest scope)/i],
    handler: () => "**[Mentra](/mentra)**. Designing an OS for smart glasses, plus the companion app and app store, is the biggest systems problem in the portfolio."
  },

  // Role fit — evidence-based with honest gaps
  { patterns: [/(?:what kind of roles|where would he fit|what should i hire him for|best fit|role fit|design systems role|senior product|staff designer|0.to.1|design engineer role)/i],
    handler: (match) => {
      const q = (match.input || '').toLowerCase()

      if (/design system/i.test(q)) {
        return "**Design systems fit:** Strong. ZentiPay required a fintech component system that could cover payment flows. Mentra required a cross-platform design language (glasses + phone + web). Butler's Slice (three static weights) shows systematic precision.\n\n**Gap:** He hasn't worked on a design system as a standalone product, his systems work is always embedded in product design."
      }
      if (/0.to.1|founding|early.stage|startup/i.test(q)) {
        return "**0→1 fit:** Very strong. ZentiPay (founding designer, built from scratch), Mentra (first-ever smart glasses app store), Clawed (AI trust model from zero).\n\nThe pattern: he doesn't wait for specs, he defines the product shape."
      }
      if (/staff|principal|lead/i.test(q)) {
        return "**Senior/Staff fit:** Led design at TransFi in a high-stakes payment context. Head of UI/UX at Mentra (full platform ownership). The portfolio shows IC depth AND the ability to set direction for a team.\n\n**Gap:** Hasn't managed a design team larger than 3."
      }

      return "Best fit: design engineer or senior product designer in AI, wearables, developer tools, fintech, or 0→1 teams.\n\nEvidence: systems thinking (Mentra OS), research rigor (ZentiPay), technical depth (React, Arduino, Swift). The throughline is closing the gap between concept and shipped product.\n\n**Gap:** Less experience in enterprise B2B SaaS at scale."
    }
  },

  // Student / portfolio learning
  { patterns: [/(?:\b(?:i am|i'm|as a) (?:design )?student\b|portfolio advice|break into design|what can i learn here)/i],
    handler: () => 'Start with constraints, show the decision, then prove what changed. Pretty screens come last.'
  },

  // Design + code
  { patterns: [/(?:can he code|does he code|code too|design and build|build too|engineering depth)/i],
    handler: () => "Yes. React, TypeScript, Python, Swift, Arduino, and physical prototyping are all part of the practice.\n\nThe useful distinction is that Parth doesn't just hand off polished files, he can prototype the product logic, interaction edge cases, and physical behavior too."
  },

  // Codex practice
  { patterns: [/(?:codex|agent practice|ai workflow|uses? agents|token activity|5\.5b|five point five billion)/i],
    handler: () => "Parth uses Codex as a working design partner: start from the live surface, build in tight loops, then verify with tests, screenshots, and deployment checks.\n\nThe 5.5B tokens show repetition. The real skill is turning that repetition into a reliable system."
  },

  // Greeting
  { patterns: [/^(hi|hello|hey|sup|yo|howdy|hiya|what'?s up|heya|good\s)/i],
    handler: (_, ctx) => {
      if (ctx.questionCount > 0) return "What else?"
      const p = cp(ctx)
      if (p?.deep) return `${p.deep.oneLiner}\n\nWant the challenge or the insight?`
      return "Ask where to start, open a project, or tell me what you want to understand."
    }
  },

  // "Your take" / opinion
  { patterns: [/(?:your take|opinion|think about|what makes.*special|honest|stand out|unique)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.deep?.opinion) return p.deep.opinion
      return "The thing that makes Parth different: he designs AND builds. Figma → React → Arduino. That range changes how you solve problems."
    }
  },

  // Why it matters
  { patterns: [/(?:why.*matter|why.*care|significance|so what|why.*important|why.*interesting)/i],
    handler: (match, ctx) => {
      // A project named in the question wins over conversation context.
      const named = fuzzyFind((match.input || '').toLowerCase())
      const p = named || cp(ctx)
      if (named) { ctx.lastProject = named.slug; ctx.mentionedProjects.push(named.slug) }
      if (p?.deep) { ctx.lastTopic = 'whyItMatters'; return p.deep.whyItMatters }
      return "Ask about a specific project, the 'why it matters' is where it gets interesting."
    }
  },

  // Surprising fact
  { patterns: [/(?:surpris|unexpected|didn.t know|secret|hidden|curious fact)/i],
    handler: (match, ctx) => {
      const named = fuzzyFind((match.input || '').toLowerCase())
      const p = named || cp(ctx)
      if (named) { ctx.lastProject = named.slug; ctx.mentionedProjects.push(named.slug) }
      if (p?.deep?.surprisingFact) return p.deep.surprisingFact
      const allFacts = [...projectIndex.values()].filter(x => x.deep?.surprisingFact).map(x => `**${x.name}:** ${x.deep!.surprisingFact}`)
      if (allFacts.length) return pick(allFacts)
      const facts = new Set<string>(); while (facts.size < 2) facts.add(pick(bio.funFacts))
      return [...facts].map(f => `• ${f}`).join('\n')
    }
  },

  // Private / NDA boundaries
  { patterns: [/(?:private|nda|confidential|under wraps|not public)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.nda && p.deep) {
        return `I can share the public story: ${p.deep.oneLiner} Deeper internal details require approved access.`
      }
      return 'I only use public portfolio facts here. Nothing private gets guessed.'
    }
  },

  // Process
  { patterns: [/(?:process|how.*(?:build|make|create|approach|design|start)|methodology|workflow)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.deep) { ctx.lastTopic = 'process'; return `**How ${p.name} was built:**\n\n${p.deep.process}` }
      const cat = categories.find(c => ctx.route.replace(/^\//, '') === c.slug)
      if (cat) return cat.approach.pillars.map(x => `**${x.title}**, ${x.desc}`).join('\n\n')
      return "Parth's process: constraint-driven design, systems over screens, ship to learn. Ask about a specific project for the real details."
    }
  },

  // Ownership / contribution
  { patterns: [/(?:what did (?:parth|you|i) own|what was (?:parth's|your|my) role|ownership|contribution|responsibilit)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.deep) return `I was ${p.role}. My scope covered ${p.deep.platforms}.`
      if (p) return `I was ${p.role} on ${p.name}.`
      return 'Name a project and I will separate my ownership from the team effort.'
    }
  },

  // Decision / risk
  { patterns: [/(?:risk|risky|riskiest|tradeoff|trade-off|hardest decision|biggest bet|key decision)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.deep) {
        ctx.lastTopic = 'insight'
        return `${p.deep.insight} ${p.deep.opinion}`
      }
      return 'The recurring bet is systems over screens: solve the behavior first, then make it beautiful.'
    }
  },

  // Challenge
  { patterns: [/(?:challenge|hardest|difficult|struggle|problem|pain|obstacle)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.deep) { ctx.lastTopic = 'challenge'; return p.deep.challenge }
      return "Which project? The challenges are where it gets interesting.\n\nMentra → tiny screen. ZentiPay → fee anxiety. Clawed → AI trust."
    }
  },

  // Outcome
  { patterns: [/(?:outcome|result|impact|numbers|metrics|data|success|ship|launch)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.deep) { ctx.lastTopic = 'outcome'; return p.deep.outcome }
      return "Mentra: launch demand. ZentiPay: trust-first transfers. TransFi: payment infrastructure. Ask about any one."
    }
  },

  // Key insight
  { patterns: [/(?:key insight|learned|takeaway|lesson|realize|discover|aha)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.deep) {
        ctx.lastTopic = 'insight'
        // After sharing insight, tease the connection
        const related = getRelated(p)
        let r = `"${p.deep.insight}"`
        if (related.length) r += `\n\nInteresting connection: **${related[0].name}** builds on a similar idea.`
        return r
      }
      return "Each flagship project has its own:\n\n• **Mentra:** Glance > gaze\n• **TransFi:** Trust > opacity\n• **Clawed:** Ask > act\n• **Jugalbandi:** Embodiment > novelty\n\nWhich one?"
    }
  },

  // Related / similar
  { patterns: [/(?:related|similar|like this|connected|see also|more like)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p) {
        const rel = getRelated(p)
        if (rel.length) return `**Connected to ${p.name}:**\n\n` + rel.map(r => `• [${r.name}](${r.link}), ${r.deep?.oneLiner || r.desc}`).join('\n')
        return `${p.name} is in **${p.category}**. → [/${p.categorySlug}](/${p.categorySlug})`
      }
      return "Tell me which project, and I'll show you the connections."
    }
  },

  // Team / timeline
  { patterns: [/(?:team|timeline|how long|duration|who|collaborat|size)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.deep) return `**${p.name}:** ${p.deep.duration}\n${p.deep.team}\n${p.deep.platforms}`
      if (p) return `**${p.name}**, ${p.role} (${p.year})`
      return "Which project?"
    }
  },

  // Compare — synthesis, not just side-by-side
  { patterns: [/(?:compare|difference|vs|versus)/i],
    handler: (match, ctx) => {
      const t = (match.input || '').toLowerCase()
      const found: ProjectInfo[] = []
      for (const [, info] of projectIndex) { if (t.includes(info.name.toLowerCase()) && !found.includes(info)) found.push(info); if (found.length >= 2) break }

      // If no projects named, suggest comparing last two visited
      if (found.length < 2) {
        const projectSlugs = ctx.visitHistory
          .map(v => v.replace(/^\//, ''))
          .filter(s => projectIndex.has(s))
        const unique = [...new Set(projectSlugs)].slice(-2)
        for (const s of unique) { const p = projectIndex.get(s); if (p && !found.includes(p)) found.push(p) }
      }

      if (found.length >= 2) {
        const a = found[0], b = found[1]
        let r = `**${a.name}**, ${a.deep?.oneLiner || a.desc}\n\n**${b.name}**, ${b.deep?.oneLiner || b.desc}`

        if (a.deep && b.deep) {
          // Find cross-threads
          const sharedConnections = (a.deep.connectedTo || []).filter(s => (b.deep?.connectedTo || []).includes(s))
          const sameCategory = a.categorySlug === b.categorySlug

          if (sameCategory) {
            r += `\n\nBoth are **${a.category}** work but test different muscles. ${a.name} approaches it through ${a.deep.insight.split('.')[0].toLowerCase()}, while ${b.name} approaches it through ${b.deep.insight.split('.')[0].toLowerCase()}.`
          } else if (sharedConnections.length > 0) {
            const shared = projectIndex.get(sharedConnections[0])
            r += `\n\nDifferent domains, shared thread. Both connect to **${shared?.name || sharedConnections[0]}**. The throughline is systems thinking applied to different scales.`
          } else {
            r += `\n\nThis pair shows the range. ${a.name} is ${a.category}, ${b.name} is ${b.category}. Same designer, same rigor, completely different problem spaces.`
          }
        }
        return r
      }
      return "Name two projects and I'll compare them. Or ask to compare the last two you visited."
    }
  },

  // Best / favorite — persona-aware
  { patterns: [/(?:best|favorite|top|flagship|proudest|must.see|recommend)/i],
    handler: (_, ctx) => {
      const cat = categories.find(c => ctx.route.replace(/^\//, '') === c.slug)
      if (cat) { const f = cat.featured; return `**${f.title}**, ${f.desc}\n\n→ [/${f.slug}](/${f.slug})` }

      if (ctx.persona === 'founder') return "If I had to pick three for a founder:\n\n• **[Mentra](/mentra)**, full platform ownership from zero\n• **[Clawed](/clawed-chat)**, AI approval and receipt design proposals\n• **[ZentiPay](/zentipay)**, founding designer, research to product\n\nWhich one?"
      if (ctx.persona === 'peer') return "If I had to pick three for creative range:\n\n• **[Jugalbandi](/jugalbandi)**, neural network that duets with humans\n• **[Enigma](/enigma)**, 200-neuron light sculpture\n• **[Mentra](/mentra)**, systems ambition at platform scale\n\nWhich one?"

      return "If I had to pick three:\n\n• **[Mentra](/mentra)**, most ambitious\n• **[ZentiPay](/zentipay)**, best research process\n• **[Jugalbandi](/jugalbandi)**, strongest creative range\n\nWhich one?"
    }
  },

  // Underrated / hidden gem — editorial picks
  { patterns: [/(?:underrated|hidden gem|overlooked|sleeper|what.*miss|editorial|most people skip)/i],
    handler: () => "**[Raahi](/raahi-project)** is the one most people skip. It's filed under civic design, but the service design thinking, spanning app, kiosk, and in-vehicle screens across 8 transport modes, is the most systems-complete project outside the flagship work.\n\nAlso: **[Enigma](/enigma)**. Most AI visualization is charts. This makes you *feel* what a neural network does."
  },

  // Single best project
  { patterns: [/(?:if you had to pick one|one project|single project|best single|just one)/i],
    handler: (_, ctx) => {
      if (ctx.persona === 'founder') return "**[Mentra](/mentra)**. Designing an entire OS, companion app, and app store for a device that doesn't have established design patterns. That's the hardest systems problem here."
      if (ctx.persona === 'peer') return "**[Jugalbandi](/jugalbandi)**. Two strangers collaborate through sound without speaking. If the interaction needs instructions, it failed. That's a design philosophy, not just a project."
      return "**[Mentra](/mentra)**. Full platform from scratch, $299 launch, 88% pre-orders. It proves systems thinking, research depth, and shipping under real hardware constraints."
    }
  },

  // Project query
  { patterns: [/(?:tell me about|what is|what's|describe|explain)\s+(.+)/i, /(?:know about|info on|details on|more about)\s+(.+)/i],
    handler: (match, ctx) => {
      const fullInput = (match.input || '').replace(/[?.!,]+$/, '').trim()
      const captured = match[1].replace(/[?.!,]+$/, '').trim()
      // If captured part is a pronoun like "it"/"this"/"that", try the full input first
      const isProperCapture = captured.length > 3 && !/^(it|this|that|them|those|these)$/i.test(captured)
      const q = isProperCapture ? captured : fullInput
      const p = fuzzyFind(q) || (!isProperCapture ? cp(ctx) : undefined)
      if (p) {
        ctx.lastProject = p.slug; ctx.mentionedProjects.push(p.slug)
        if (p.deep) return `${p.deep.oneLiner}\n\n→ [Read the case study](${p.link})`
        return `**${p.name}**, ${p.desc}. ${p.role} · ${p.year}\n\n→ [View](${p.link})`
      }
      if (/parth|yourself|you|him|who/i.test(q)) return `**${bio.name}**, ${bio.title}, ${bio.location}.\n\nCurrently: ${bio.current}`
      return `Don't know "${q}", try Mentra, ZentiPay, Clawed, or a category like "AI" or "installations".`
    }
  },

  // Export summary
  { patterns: [/(?:send.*summary|export summary|share.*summary|clipboard|copy.*summary|email.*summary|mailto|summary for)/i],
    handler: (_, ctx) => {
      const discussed = [...new Set(ctx.mentionedProjects)].map(s => projectIndex.get(s)).filter((p): p is ProjectInfo => !!p)
      const visited = [...new Set(ctx.visitHistory.map(v => v.replace(/^\//, '')).filter(s => projectIndex.has(s)))].map(s => projectIndex.get(s)!).filter((p): p is ProjectInfo => !!p)
      const all = [...new Set([...discussed, ...visited])]
      const names = all.length ? all.map(p => p.name).join(', ') : 'Mentra, ZentiPay, Jugalbandi'
      const insights = all.filter(p => p.deep).slice(0, 3).map(p => `• ${p.name}: ${p.deep!.insight.split('.')[0]}.`).join('\n')

      return `[EXPORT]\n**Parth Pawar, Portfolio Summary**\n\n**Projects reviewed:** ${names}\n\n${insights ? `**Key insights:**\n${insights}\n\n` : ''}**Themes:** Systems thinking, research rigor, design-engineering fluency\n**Contact:** ${bio.email}\n**Portfolio:** https://designwhich.works`
    }
  },

  // Current
  { patterns: [/(?:currently|right now|doing now|working on|current|latest)/i],
    handler: () => `${bio.current}\n\n${bio.status}` },

  // Tools — redirect to project if one is mentioned
  { patterns: [/(?:tools?|skills?|tech|what.*use|figma|react|python|swift|arduino|blender)/i],
    handler: (match, ctx) => {
      const q = (match.input || '').toLowerCase()
      // If the query mentions a specific project, give project-scoped answer
      const mentioned = fuzzyFind(q)
      if (mentioned && mentioned.slug !== ctx.lastProject) {
        ctx.lastProject = mentioned.slug; ctx.mentionedProjects.push(mentioned.slug)
        if (mentioned.deep) return `**${mentioned.name}:** ${mentioned.deep.process}\n\n→ [Read more](${mentioned.link})`
        return `**${mentioned.name}**, ${mentioned.desc}\n\n→ [View](${mentioned.link})`
      }
      // Specific tool queries
      if (q.includes('figma')) return "Primary tool. He uses Figma for component systems, prototyping, and handoff."
      if (q.includes('react')) return "React + TypeScript for production UI. This portfolio is React 19 + Vite + Tailwind v4. He codes what he designs."
      if (q.includes('python')) return "Python for AI/ML, TensorFlow, data analysis. Used in Enigma (neural network sculpture) and AI voice projects."
      if (q.includes('arduino')) return "Physical computing, sensors, LEDs, actuators. Powers Jugalbandi, Enigma, and many ITP installations."
      if (q.includes('blender')) return "3D modeling and rendering. Used for product visualization and the Mentra hardware renders."
      return `**Design:** ${bio.tools.design.join(', ')}\n**3D/Fab:** ${bio.tools.threeD.join(', ')}\n**Code:** ${bio.tools.code.join(', ')}\n**Creative:** ${bio.tools.creative.join(', ')}\n\nFigma to terminal to soldering iron.`
    }
  },

  // Experience
  { patterns: [/(?:experience|career|jobs?|worked|resume|background|history)/i],
    handler: () => bio.experience.map(e => `**${e.role}** · ${e.co} (${e.period})`).join('\n') },

  // Education
  { patterns: [/(?:education|school|degree|nyu|itp|university|college|tisch)/i],
    handler: () => bio.education.map(e => `**${e.degree}** · ${e.school} (${e.years})`).join('\n\n') },

  // Awards
  { patterns: [/(?:awards?|recognition|achievement|scholarship|hackathon)/i],
    handler: () => bio.awards.map(a => `• ${a}`).join('\n') },

  // Contact
  { patterns: [/(?:contact|email|hire|reach|available|open to|work with)/i],
    handler: () => `**${bio.email}**\n\n${bio.status}` },

  // Fun facts
  { patterns: [/(?:fun fact|random|quirk|personal|about him|hobbies)/i],
    handler: () => { const f = new Set<string>(); while (f.size < 3) f.add(pick(bio.funFacts)); return [...f].map(x => `• ${x}`).join('\n') }
  },

  // Practices
  { patterns: [/(?:poem|sketch|photoshop|podcast|arttown|daily|practice|100 days|why poetry)/i],
    handler: (match) => {
      const q = (match.input || '').toLowerCase()
      if (q.includes('poem') || q.includes('poetry') || q.includes('why poem')) return `**${bio.practices[0].name}** (${bio.practices[0].handle})\n\n${bio.practices[0].why}`
      if (q.includes('sketch') || q.includes('draw')) return `**${bio.practices[1].name}** (${bio.practices[1].handle})\n\n${bio.practices[1].why}`
      if (q.includes('podcast') || q.includes('arttown')) return `**${bio.practices[3].name}** (${bio.practices[3].handle})\n\n${bio.practices[3].why}`
      return bio.practices.map(p => `**${p.name}** (${p.handle}), ${p.why}`).join('\n\n')
    }
  },

  // Typeface
  { patterns: [/(?:typeface|font|butler|typography)/i],
    handler: () => "**Butler's Slice**, display typeface Parth designed. 3 weights. → [about page](/about)" },

  // Categories
  { patterns: [/(?:categor|types? of|what kind|areas?|domains?|specializ)/i],
    handler: () => categories.slice(0, 6).map(c => `• [${c.title} ${c.titleAccent}](/${c.slug})`).join('\n') },

  // AI
  { patterns: [/\bai\b|artificial intelligence|machine learning|smart glass|wearable/i],
    handler: () => "**AI work:** Mentra (smart glasses OS), Clawed (AI trust), ExecutiveLens (meeting AI), AI Voice (evaluation UX), Ballah Code (AI IDE). → [/ai](/ai)" },

  // Fintech
  { patterns: [/(?:fintech|finance|payment|money|bank|crypto|web3)/i],
    handler: () => "**Fintech:** ZentiPay (trust-first transfers), TransFi (crypto payment infrastructure). Core insight: compliance UX is a moat. → [/fintech](/fintech)" },

  // Installations
  { patterns: [/(?:install|physical|sculpture|gallery|fabricat|maker)/i],
    handler: () => "**Physical:** Jugalbandi (sound at WonderVille), Enigma (neural network sculpture), Making of Time (kinetic). Arduino, sensors, LEDs. → [/installations](/installations)" },

  // Navigation
  { patterns: [/(?:go to|navigate|show|take me|where.*(?:find|see))\s+(.+)/i],
    handler: (match) => {
      const t = match[1].toLowerCase().replace(/[?.!]+$/, '').trim()
      const routes: Record<string, string> = { about: '/about', work: '/work', home: '/', projects: '/work' }
      if (routes[t]) return `→ [${routes[t]}](${routes[t]})`
      const cat = categories.find(c => c.slug.includes(t) || `${c.title} ${c.titleAccent}`.toLowerCase().includes(t))
      if (cat) return `→ [/${cat.slug}](/${cat.slug})`
      const p = fuzzyFind(t)
      if (p) return `→ [${p.link}](${p.link})`
      return `→ [/work](/work)`
    }
  },

  // This page
  { patterns: [/(?:this page|where am i|what page|what.*looking)/i],
    handler: (_, ctx) => {
      const p = cp(ctx)
      if (p?.deep) return `**${p.name}**, ${p.deep.oneLiner}`
      if (p) return `**${p.name}**, ${p.desc}`
      if (ctx.route === '/') return "Home page."
      if (ctx.route === '/work') return "Full project archive."
      if (ctx.route === '/about') return "About Parth."
      const cat = categories.find(c => ctx.route === `/${c.slug}`)
      if (cat) return `**${cat.title} ${cat.titleAccent}** category.`
      return `${ctx.route}`
    }
  },

  // Count
  { patterns: [/(?:how many|number|count|total)\s*(?:project|work|case)/i],
    handler: () => `${projectIndex.size} projects, ${categories.length} categories.` },

  // Portfolio itself
  { patterns: [/(?:how.*(?:built|made|build).*(?:portfolio|site|website)|portfolio.*(?:stack|tech)|what.*(?:portfolio|site).*(?:built|made))/i],
    handler: () => "This portfolio is React 19 + TypeScript + Tailwind v4 + Vite, deployed on GitHub Pages. The 3D scenes use Three.js. The agent you're talking to is a local rules engine, no API calls, instant responses. Even the ambient sound is procedurally generated with Web Audio API."
  },

  // Location
  { patterns: [/(?:where.*(?:based|located|live)|location|city|remote|sf|san francisco|new york|india)/i],
    handler: () => `${getVisitorLocation().label}. Open to hybrid or remote roles for the right team.\n\n${bio.status}`
  },

  // Availability
  { patterns: [/(?:when.*start|availab|notice period|timeline.*hire|start date|ready to)/i],
    handler: () => `Currently at Mentra. Open to conversations about what's next.\n\nBest way: **${bio.email}**`
  },

  // Design philosophy
  { patterns: [/(?:design philosophy|approach to design|design thinking|how.*think.*design|principles)/i],
    handler: () => "Three principles run through the work:\n\n• **Constraint-driven**, the tighter the constraint, the sharper the solution (640px glasses display, $25/month migrant worker fees)\n• **Systems over screens**, design the system first, the screens follow\n• **Ship to learn**, the prototype teaches you what the spec couldn't"
  },

  // Thanks/bye
  { patterns: [/(?:thanks|thank|thx|cheers)/i], handler: () => pick(["Sure thing.", "Anytime."]) },
  { patterns: [/(?:bye|goodbye|see ya|later|peace)/i], handler: () => `Later! **${bio.email}** if you want to connect.` },
]

const fallbacks = [
  "Ask about a specific project like Mentra, ZentiPay, or Clawed. That is where the useful detail is.",
  "Ask where to start, ask for a shortlist, or open a project and I will keep it concrete.",
]

export function getResponse(message: string, ctx: ChatContext): { text: string; chips?: string[] } {
  const t = message.trim()
  if (!t) return { text: "Ask me anything." }
  ctx.questionCount++

  for (const rule of rules) {
    for (const pat of rule.patterns) {
      const m = t.match(pat)
      if (m) {
        const text = rule.handler(m, ctx)
        // After answering, naturally suggest a connection — contextual phrasing
        let finalText = text
        const p = cp(ctx)
        if (p?.deep && ctx.questionCount > 1 && ctx.lastTopic && Math.random() > 0.4) {
          const rel = getRelated(p).filter(r => !ctx.mentionedProjects.includes(r.slug) && !ctx.visitHistory.includes(`/${r.slug}`))
          if (rel.length) {
            const r = rel[0]
            const phrases: Record<string, string> = {
              challenge: `If the constraint interests you, **[${r.name}](${r.link})** had a similar problem in a different domain.`,
              process: `The process connects to **[${r.name}](${r.link})**, similar systems thinking, different medium.`,
              insight: `That insight carries into **[${r.name}](${r.link})** too.`,
              whyItMatters: `For more on why this matters: **[${r.name}](${r.link})** builds on the same idea.`,
              outcome: `Related outcome story: **[${r.name}](${r.link})**.`,
            }
            finalText += '\n\n' + (phrases[ctx.lastTopic] || `By the way, **[${r.name}](${r.link})** connects to this.`)
          }
        }
        return { text: finalText, chips: getDynamicChips(ctx.route, ctx.questionCount, ctx.lastProject, ctx) }
      }
    }
  }

  const p = fuzzyFind(t)
  if (p) {
    ctx.lastProject = p.slug; ctx.mentionedProjects.push(p.slug)
    const text = p.deep ? p.deep.oneLiner + `\n\n→ [Case study](${p.link})` : `**${p.name}**, ${p.desc}\n\n→ [View](${p.link})`
    return { text, chips: getDynamicChips(ctx.route, ctx.questionCount, p.slug, ctx) }
  }

  return { text: pick(fallbacks), chips: getDynamicChips(ctx.route, ctx.questionCount, undefined, ctx) }
}
