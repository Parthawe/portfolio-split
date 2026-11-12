import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, useLocation } from 'react-router-dom'
import Nav from '../components/Nav'
import CategoryAsciiArtifact from '../components/CategoryAsciiArtifact'
import Footer from '../components/Footer'
import ProjectCard from '../components/ProjectCard'
import { Reveal } from '../components/Reveal'
import ProjectHeader from '../components/case-study/ProjectHeader'
import ProjectOverview from '../components/case-study/ProjectOverview'
import CsSection from '../components/case-study/CsSection'
import CsBody from '../components/case-study/CsBody'
import CsInfoGrid from '../components/case-study/CsInfoGrid'
import CsSteps from '../components/case-study/CsSteps'
import NextProject from '../components/case-study/NextProject'
import BottomNav from '../components/case-study/BottomNav'
import EditingMotionCaseStudy from './EditingMotionCaseStudy'
import { campaignCaptions } from '../data/campaignCaptions'
import transfiMotion from '../../Assets/Projects/cover/Transfi.gif'
import '../styles/motion.css'

type ProjectKey = 'vishwa' | 'mentra' | 'transfi' | 'editorial'

type MotionProject = {
  key: ProjectKey
  path: string
  title: string
  cardTitle: string
  descriptor: string
  discipline: string
  year: string
  color: string
  categorySlug: string
  heroImage: string
  heroAlt: string
  intro: string
  evidence: string
  authorship: string
  studyBoundary: string
  challenge: string
  move: string
  outcome: string
  roles: string[]
  storyTitle: string
  artTitle: string
  artNote: string
  beats: Array<{ time: string; title: string; body: string }>
  principles: Array<{ label: string; value: string }>
  frames: Array<{ src: string; alt: string; caption: string; fit?: 'cover' | 'contain' }>
  decisions: Array<{ removed: string; kept: string; reason: string }>
  aeBuild: Array<{ layer: string; technique: string; purpose: string }>
  deliveries: Array<{ key: string; value: string }>
  outputs: string[]
}

const projects: MotionProject[] = [
  {
    key: 'vishwa',
    path: 'vishwa-conclave-motion',
    title: 'VishwaConclave — A Campaign System in Motion',
    cardTitle: 'VishwaConclave: An event identity in motion',
    descriptor: 'Official 2020–21 campaign archive showing how creative direction connected theme films, speaker reveals, web, merchandise, and event programming.',
    discipline: 'Creative direction / Campaign motion',
    year: '2020–21',
    color: '#b14cff',
    categorySlug: 'brand-visual',
    heroImage: '/Assets/mockups/projects/vishwaconclave_16x9.webp',
    heroAlt: 'VishwaConclave campaign identity shown across event and social applications',
    intro: 'One annual theme, released as a sequence—not a single poster.',
    evidence: 'Official VishwaConclave films and campaign posts from 2020–21.',
    authorship: 'Creative direction, campaign system, social, web, and video production with a wider student team.',
    studyBoundary: 'The After Effects file plan is a retrospective rebuild—not the original team file. Parallel Studio retains the credited 2021 specialist-animation work.',
    challenge: 'An abstract annual theme had to become understandable before the event—and stay recognizable through weeks of speaker announcements, website and merchandise releases, reminders, countdowns, and live-programming content.',
    move: 'Treat the campaign as an editorial sequence. Begin with intrigue, reveal the theme through dimensional type and camera movement, then move from atmosphere to proof: speakers, site, schedule, experience, and registration.',
    outcome: 'The archive shows one identity changing pace without losing its voice: cinematic for the theme, editorial for speakers, direct for registration, and faster near the event.',
    roles: ['Creative direction', 'Campaign system', 'Storyboarding', 'Video production', 'Social design'],
    storyTitle: 'Intrigue. Reveal. Prove. Accelerate.',
    artTitle: 'Dimensional type turns an abstract theme into a place',
    artNote: 'Perspective, layered typography, deep violet, and controlled bursts of white created continuity across film and static output. The system could feel cinematic without making every announcement difficult to read.',
    beats: [
      { time: '01', title: 'Intrigue', body: 'Trailers establish a world before explaining it, using fragments, scale, and directional camera movement.' },
      { time: '02', title: 'Reveal', body: 'The annual theme becomes the hero and the visual metaphor becomes explicit.' },
      { time: '03', title: 'Prove', body: 'Speaker, website, merchandise, and experience drops turn atmosphere into concrete reasons to attend.' },
      { time: '04', title: 'Accelerate', body: 'Countdown and event-day edits shorten the rhythm while preserving the campaign typography and color signal.' },
    ],
    principles: [
      { label: 'Space', value: 'Type behaves like architecture, not a flat caption' },
      { label: 'Rhythm', value: 'Slow-burn reveal → clear proof → urgent countdown' },
      { label: 'Hierarchy', value: 'Theme first; speaker and registration information held still' },
      { label: 'System', value: 'One visual grammar across film, feed, story, web, and merchandise' },
    ],
    frames: [
      { src: '/Assets/Projects/VishwaConclave/motion-2021/manifesto.jpg', alt: 'VishwaConclave 2021 Accelerating the Paradigm Shift manifesto poster', caption: '01 — Theme manifesto', fit: 'cover' },
      { src: '/Assets/Projects/VishwaConclave/motion-2021/uddhab-speaker-2.jpg', alt: 'Illustrated VishwaConclave speaker artwork for Uddhab Bharali', caption: '02 — Speaker identity', fit: 'cover' },
      { src: '/Assets/Projects/VishwaConclave/motion-2021/musical-experience.jpg', alt: 'VishwaConclave 2021 musical experience announcement', caption: '03 — Programme reveal', fit: 'cover' },
      { src: '/Assets/Projects/VishwaConclave/motion-2021/merchandise.jpg', alt: 'VishwaConclave 2021 merchandise bundle announcement', caption: '04 — Campaign extension', fit: 'cover' },
    ],
    decisions: [
      { removed: 'One visual tempo for every post', kept: 'A campaign with changing gears', reason: 'Theme films earn attention slowly; speaker and registration posts need immediate clarity.' },
      { removed: 'Decorative 3D as spectacle', kept: 'Dimension as the theme metaphor', reason: 'Perspective and depth make “paradigm shift” tangible instead of merely futuristic.' },
      { removed: 'Independent launch assets', kept: 'A sequenced release calendar', reason: 'Each drop answers the question created by the one before it and moves the audience closer to the event.' },
    ],
    aeBuild: [
      { layer: '00_MASTER_CAMPAIGN', technique: 'Campaign edit + named release markers', purpose: 'The master protects the reveal order and provides a source for shorter cuts.' },
      { layer: '01_TYPE_WORLD', technique: '3D layers + cameras + null controls', purpose: 'Type, light, and perspective share one controllable dimensional system.' },
      { layer: '02_CONTENT_MODULES', technique: 'Protected pre-comps', purpose: 'Speaker, date, website, programme, and CTA cards can change without rebuilding transitions.' },
      { layer: '90_SOCIAL_DELIVERY', technique: 'Feed, story, and web-safe versions', purpose: 'Protected zones and inherited timing keep each release legible across campaign surfaces.' },
    ],
    deliveries: [
      { key: 'Campaign master', value: 'Theme reveal and narrative order' },
      { key: 'Short cuts', value: 'Anticipation and registration reminders' },
      { key: 'Content modules', value: 'Speaker · site · merchandise · programme' },
      { key: 'Surfaces', value: 'Feed · story · web · event screen' },
    ],
    outputs: ['Theme film', 'Campaign trailers', 'Speaker reveals', 'Social launch system'],
  },
  {
    key: 'mentra',
    path: 'mentra-motion-language',
    title: 'Mentra — Sell the Moment, Then the Hardware',
    cardTitle: 'Mentra: Sell the moment, then the hardware',
    descriptor: 'A proposed 15-second paid-social system built from Mentra brand, product, and campaign assets I designed—clearly separated from official footage.',
    discipline: 'Advertising motion / Hardware GTM',
    year: '2025–26',
    color: '#00b869',
    categorySlug: 'brand-visual',
    heroImage: '/Assets/Projects/mentra-brand/motion/official-site-hero-poster.png',
    heroAlt: 'Mentra smart glasses shown in the official site hero film',
    intro: 'The technology should leave the frame before the person leaves the moment.',
    evidence: 'Original Mentra identity, companion-app onboarding, glasses motion, advertising concepts, product renders, MentraOS states, and published product footage.',
    authorship: 'Brand and art direction, companion-app onboarding, glasses motion, advertising assets, renders, and the visual system. Official Mentra films are source references only.',
    studyBoundary: 'The 15-second storyboard and After Effects production plan are a portfolio proposal—not a shipped campaign or a performance claim.',
    challenge: 'Smart-glasses advertising often begins with “AI,” interface overlays, and specifications before giving people a reason to care. Mentra still has to prove credible hardware and an open platform, but the advertisement first needs to make hands-free capture and open-ear audio feel desirable in an ordinary life moment.',
    move: 'Lead with a recognizable human moment, present the glasses as eyewear, demonstrate one capability, then reveal the hardware and MentraOS system behind it. In onboarding, animate the glasses beside one instruction at a time so device setup and physical controls stay legible.',
    outcome: 'The onboarding prototype separates device discovery, update, and seven guided hardware actions into focused screens. The advertising proposal extends the same clarity into a 15-second story and shorter single-benefit cuts.',
    roles: ['Creative direction', 'Advertising system', 'Motion design', 'Product onboarding', 'Storyboard'],
    storyTitle: 'Moment. Wear. Use. Extend.',
    artTitle: 'People first. Product second. Platform third.',
    artNote: 'Human campaign frames establish desire, clean renders establish wearability and build quality, and MentraOS establishes what the product can become. White type stays direct; green acts as a recognition signal; interface overlays appear only when they explain a real capability.',
    beats: [
      { time: '00:00', title: 'Moment', body: 'Open on a human scene and a single promise: Stream your world without stepping out of it.' },
      { time: '00:03', title: 'Wear', body: 'A clean product reveal makes the glasses feel familiar, desirable, and physically believable.' },
      { time: '00:06', title: 'Use', body: 'Demonstrate one capability—capture or audio—without turning the frame into a feature dashboard.' },
      { time: '00:10', title: 'Prove', body: 'Macro and exploded views hold long enough to establish the camera, temple, and construction.' },
      { time: '00:12', title: 'Extend', body: 'MentraOS reframes the glasses as an open platform after the core benefit is understood.' },
      { time: '00:14', title: 'Act', body: 'Close on one message and one CTA, with a stable product silhouette and no final feature pile-up.' },
    ],
    principles: [
      { label: 'Advertising hierarchy', value: 'Human tension → benefit → product → platform → action' },
      { label: 'One promise', value: 'Stream, Hear, Focus, or Build—never all four in one short ad' },
      { label: 'Wearability', value: 'Show the glasses on a person before exposing technical construction' },
      { label: 'Onboarding', value: 'Device pose → highlighted control → one instruction → confirmation' },
      { label: 'Accessibility', value: 'Benefit and CTA survive sound-off and reduced-motion playback' },
    ],
    frames: [
      { src: '/Assets/Projects/mentra-brand/photos/ad-stream.webp', alt: 'Mentra Stream Your World vertical campaign advertisement', caption: '01 — Human moment', fit: 'cover' },
      { src: '/Assets/Projects/mentra-brand/photos/ad-hear.webp', alt: 'Mentra Hear Your Audio Hear the World campaign advertisement', caption: '02 — Single benefit', fit: 'cover' },
      { src: '/Assets/Projects/mentra-brand/photos/render-exploded.webp', alt: 'Exploded Mentra Live smart-glasses render showing product components', caption: '03 — Hardware proof', fit: 'cover' },
      { src: '/Assets/images/mentra/os-all-apps.png', alt: 'MentraOS interface showing available smart-glasses applications', caption: '04 — Platform extension', fit: 'contain' },
    ],
    decisions: [
      { removed: 'Opening on “AI smart glasses”', kept: 'Opening on an uninterrupted life moment', reason: 'The audience understands the human benefit before being asked to understand the category.' },
      { removed: 'A rapid four-feature montage', kept: 'One promise per paid-social spot', reason: 'Stream, Hear, Focus, and Build become memorable campaign territories instead of competing captions.' },
      { removed: 'Floating speculative HUD graphics', kept: 'Real campaign imagery and MentraOS states', reason: 'Product truth is more persuasive than generic interface decoration added in post.' },
      { removed: 'A static manual and feature list', kept: 'Animated glasses with one task per screen', reason: 'Each action points to the exact button or gesture, then shows the expected result before moving on.' },
    ],
    aeBuild: [
      { layer: '00_MASTER_CAMPAIGN', technique: '15-second working master + five beats', purpose: 'The master protects the moment → wearability → capability → product → platform hierarchy.' },
      { layer: '01_HOOK_FAMILY', technique: 'Essential Graphics + copy controls', purpose: 'Stream, Hear, Focus, and Build swap as campaign promises without changing the edit grammar.' },
      { layer: '02_LIFE_MOMENT', technique: 'Protected media + focal-point nulls', purpose: 'Lifestyle footage reframes cleanly while keeping faces, eyewear, and benefit copy readable.' },
      { layer: '03_PRODUCT_AND_OS', technique: 'Render passes + protected pre-comps', purpose: 'Hardware, macro detail, and MentraOS can enter as proof without interrupting the human story.' },
      { layer: '90_PAID_SOCIAL_SET', technique: 'Responsive versions + inherited timing', purpose: 'Short and full versions share captions, CTA, safe zones, and product end cards.' },
    ],
    deliveries: [
      { key: 'Working master', value: '15-second Moment → Wear → Use → Extend story' },
      { key: 'Short cuts', value: 'One benefit and one product proof' },
      { key: 'Hook family', value: 'Stream · Hear · Focus · Build' },
      { key: 'Surfaces', value: 'Landscape · feed · story' },
    ],
    outputs: ['Paid-social storyboard', 'Benefit spot system', 'Hardware proof sequence', 'Onboarding motion pattern'],
  },
  {
    key: 'transfi',
    path: 'transfi-identity-motion',
    title: 'TransFi — One Transaction, Made Legible',
    cardTitle: 'TransFi: One transaction, made legible',
    descriptor: 'A proposed transaction story built from product and brand states I designed for TransFi, following one payment from intent to confirmed delivery.',
    discipline: 'Product motion / Fintech GTM',
    year: '2022–23',
    color: '#48d8ff',
    categorySlug: 'fintech',
    heroImage: '/Assets/mockups/projects/transfi-project_16x9.webp',
    heroAlt: 'TransFi identity, merchant dashboard, and customer checkout presentation',
    intro: 'Make money movement feel continuous—even when the infrastructure is complex.',
    evidence: 'Original project archive: identity motion, checkout, verification, order-status, and merchant-dashboard states.',
    authorship: 'Lead product design, brand, and systems work. The product screens and identity loop come from that project archive.',
    studyBoundary: 'The 18-second storyboard and After Effects production plan are a portfolio proposal—not a shipped GTM film or a campaign-results claim.',
    challenge: 'A cross-border payment changes currency, method, network, verification state, and ownership before it is complete. Showing every layer at once creates noise; hiding the steps makes the product feel like a black box. The story needed momentum without making financial information feel unstable.',
    move: 'Follow one transaction—not a feature montage. The amount becomes the visual anchor while the interface moves through choose, wallet, method, verification, confirmation, and delivery. Expressive motion opens the story; productive motion carries every money and status state.',
    outcome: 'The proposal defines a state-based story that preserves amounts, labels, and confirmation moments while adapting to a launch explainer, checkout walkthrough, or status cutdown.',
    roles: ['Product design', 'Motion system', 'Storyboard', 'Art direction', 'Template architecture'],
    storyTitle: 'Choose. Verify. Move. Confirm.',
    artTitle: 'The transaction is the protagonist—not the network',
    artNote: 'Real checkout and dashboard states provide the proof. Blue carries continuity, cyan marks active movement, green is reserved for confirmed status, and financial values never spin, bounce, or blur between states.',
    beats: [
      { time: '00:00', title: 'Orient', body: 'A single amount and directional mark establish what is moving before the interface appears.' },
      { time: '00:02', title: 'Choose', body: 'Currency and asset enter as paired decisions; the amount stays fixed to preserve continuity.' },
      { time: '00:05', title: 'Authorize', body: 'Wallet, payment method, and verification arrive one at a time in the order the customer acts.' },
      { time: '00:09', title: 'Track', body: 'The six-step journey becomes a status route, showing progress without pretending settlement is instantaneous.' },
      { time: '00:13', title: 'Confirm', body: 'Order summary and merchant dashboard hold on the resolved state long enough to read.' },
      { time: '00:16', title: 'Sign off', body: 'The route folds back into the mark with one product sentence and no extra feature claims.' },
    ],
    principles: [
      { label: 'Continuity', value: 'One amount persists from choice to confirmation' },
      { label: 'State', value: 'Every transition has an origin, action, and resolved endpoint' },
      { label: 'Hierarchy', value: 'Amount → status → method → supporting detail' },
      { label: 'Accessibility', value: 'Meaning survives sound-off, pause, and reduced motion' },
    ],
    frames: [
      { src: '/Assets/Projects/Transfi/public/Group 1000004741.png', alt: 'TransFi currency selection visual with USD, BTC, and EUR layers', caption: '01 — Currency choice', fit: 'contain' },
      { src: '/Assets/Projects/Transfi/public/Frame 427318638.png', alt: 'TransFi buy-crypto widget with currency and asset selection screens', caption: '02 — Checkout entry', fit: 'contain' },
      { src: '/Assets/Projects/Transfi/public/Frame 427318646.png', alt: 'Six-step TransFi checkout journey from currency choice to crypto delivery', caption: '03 — Journey continuity', fit: 'cover' },
      { src: '/Assets/Projects/Transfi/public/Order Summary.png', alt: 'TransFi order summary with amount, fees, and delivery status', caption: '04 — Resolved state', fit: 'contain' },
    ],
    decisions: [
      { removed: 'Coins, particles, and a spinning globe', kept: 'One observable transaction', reason: 'A real payment journey demonstrates global infrastructure more credibly than generic fintech symbols.' },
      { removed: 'A fast six-screen carousel', kept: 'One action per beat', reason: 'Choice, authorization, verification, and settlement have different meanings and need separate attention.' },
      { removed: 'Elastic numbers and rolling counters', kept: 'Persistent amount with a firm settle', reason: 'Financial values should feel stable and comparable across every state.' },
      { removed: 'A confetti success moment', kept: 'Status change, timestamp, and quiet hold', reason: 'Confirmation is evidence. The interface should communicate completion without obscuring the details.' },
    ],
    aeBuild: [
      { layer: '00_MASTER_TRANSACTION', technique: '18-second working story + six markers', purpose: 'One marked sequence protects the order from customer intent to merchant confirmation.' },
      { layer: '01_AMOUNT_ANCHOR', technique: 'Text controls + currency variants', purpose: 'Amount, asset, and rate update without drifting between scenes or requiring duplicate animation.' },
      { layer: '02_STATE_ROUTE', technique: 'Shape layer + Trim Paths', purpose: 'A single route controls progress, chapter handoffs, and the final identity fold.' },
      { layer: '03_PRODUCT_STATES', technique: 'Figma exports + protected pre-comps', purpose: 'Checkout, KYC, payment, order, and dashboard modules reveal by decision priority.' },
      { layer: '90_DELIVERY_SET', technique: 'Responsive comps + Essential Graphics', purpose: 'Copy, currency, status, CTA, captions, and crops remain editable for new corridors.' },
    ],
    deliveries: [
      { key: 'Working story', value: '18-second intent → delivery sequence' },
      { key: 'Short cut', value: 'Choose → authorize → confirm' },
      { key: 'State template', value: 'Waiting · processing · attention · complete' },
      { key: 'Surfaces', value: 'Landscape · feed · story' },
    ],
    outputs: ['Transaction master', 'Checkout walkthrough', 'Status-story template', 'Responsive social cutdowns'],
  },
  {
    key: 'editorial',
    path: 'editing-motion-stories',
    title: 'Cutting Systems into Stories',
    cardTitle: 'Selected film editing: Enigma, Omakase + more',
    descriptor: 'Four completed project films, with a practical breakdown of selects, cause-and-effect cutting, sound, restrained graphics, and delivery.',
    discipline: 'Video editing / Editorial direction',
    year: '2023–25',
    color: '#ff6847',
    categorySlug: 'creative-tech',
    heroImage: '/Assets/mockups/projects/enigma_16x9.webp',
    heroAlt: 'Enigma neural-network sculpture illuminated during exhibition',
    intro: 'A good project film reveals the idea before it asks for attention.',
    evidence: 'Four completed films for Enigma, The Omakase, Making of Time, and Drowning.',
    authorship: 'Portfolio editing and motion graphics by Parth Pawar; the underlying projects were built with the roles and collaborators named on their full pages.',
    studyBoundary: 'The case study explains editorial decisions; it does not recast collaborative project production as solo work.',
    challenge: 'Interactive objects and performances are easy to make visually exciting but difficult to explain. A beauty reel alone cannot show what changed, why it matters, or how the audience participates.',
    move: 'Give each film one sentence and one visible transformation, then organize gestures, system responses, proof shots, atmosphere, and reactions around that narrative spine.',
    outcome: 'A repeatable editorial workflow connects four very different subjects while allowing each film to earn its own pace, sound behavior, and graphic intervention.',
    roles: ['Video editing', 'Editorial direction', 'Motion graphics', 'Sound design', 'Delivery'],
    storyTitle: 'Promise. Input. System. Payoff. Resolve.',
    artTitle: 'The cut follows the idea',
    artNote: 'Visual variety comes from the projects. Editorial consistency comes from clear causality, motivated inserts, sound continuity, restrained graphics, and proof holds.',
    beats: [
      { time: '01', title: 'Promise', body: 'Open on the transformation the viewer should understand—not a logo or generic montage.' },
      { time: '02', title: 'Input', body: 'Show the gesture, object, or spatial condition that begins the system.' },
      { time: '03', title: 'System', body: 'Use sequence, inserts, and sound to make the behavior legible.' },
      { time: '04', title: 'Payoff', body: 'Hold on the prediction, score, mechanism, or emotional state long enough to verify it.' },
      { time: '05', title: 'Resolve', body: 'Close on meaning and context without adding a second story.' },
    ],
    principles: [
      { label: 'Story', value: 'One sentence before one timeline' },
      { label: 'Causality', value: 'Input precedes response; response precedes payoff' },
      { label: 'Sound', value: 'Bridges preserve continuity across visual cuts' },
      { label: 'Versions', value: 'One master supports captions, crops, and cutdowns' },
    ],
    frames: [
      { src: '/Assets/Projects/Enigma/photos/tablet-input.jpg', alt: 'Visitor drawing on the Enigma tablet', caption: '01 — Cause before spectacle' },
      { src: '/Assets/Projects/the-omakase/photos/head-to-head-match.webp', alt: 'Two players competing at The Omakase', caption: '02 — Action before explanation' },
      { src: '/Assets/Projects/making-of-time/photos/blue-dial-hero.webp', alt: 'Mechanical watch dial from Making of Time', caption: '03 — Match ideas, not objects' },
      { src: '/Assets/Projects/Drowning/photos/WhatsApp Image 2024-10-10 at 11.54.18.webp', alt: 'Drowning greenhouse set during performance', caption: '04 — Restraint creates pressure' },
    ],
    decisions: [
      { removed: 'Chronological documentation dump', kept: 'One transformation per film', reason: 'A viewer can understand the project before absorbing its full process.' },
      { removed: 'Music-led montage first', kept: 'Causality before polish', reason: 'The story must work through picture and sync sound before a track supplies energy.' },
      { removed: 'Constant cutting speed', kept: 'Pace earned by the subject', reason: 'Competition, computation, craft, and performance require different durations.' },
      { removed: 'Graphics over every shot', kept: 'Labels only where footage cannot explain state', reason: 'Motion graphics clarify the system without competing with the project itself.' },
    ],
    aeBuild: [
      { layer: '01_INGEST_AND_SELECTS', technique: 'Story-function bins + stringouts', purpose: 'Gestures, details, environments, reactions, and proof shots stay searchable by narrative responsibility.' },
      { layer: '10_STORY_MASTER', technique: 'Marked Premiere Pro sequence', purpose: 'Promise, input, system, payoff, and resolve remain visible before polish.' },
      { layer: '20_AUDIO', technique: 'Sync + room tone + designed actions', purpose: 'Sound bridges preserve continuity and give physical behavior weight.' },
      { layer: '30_GFX_AND_COMPS', technique: 'Focused After Effects round-trips', purpose: 'Tracked screens, cleanup, state labels, titles, and end cards receive intervention without fragmenting the edit.' },
      { layer: '90_DELIVERY', technique: 'Inherited versions', purpose: 'Captioned, vertical, sound-off, and shorter outputs stay tied to one approved narrative master.' },
    ],
    deliveries: [
      { key: 'Portfolio', value: '16:9 narrative master' },
      { key: 'Accessible', value: 'Captioned and sound-off versions' },
      { key: 'Social', value: '4:5 and 9:16 reframes' },
      { key: 'Cutdowns', value: 'Short hook, demo, and proof edits' },
    ],
    outputs: ['Narrative project films', 'Demo cutdowns', 'Captioned versions', 'Responsive social masters'],
  },
]

function useMotionPreference() {
  const [motionOn, setMotionOn] = useState(() => {
    if (typeof window === 'undefined') return true
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = (event: MediaQueryListEvent) => setMotionOn(!event.matches)
    preference.addEventListener('change', sync)
    return () => preference.removeEventListener('change', sync)
  }, [])

  return motionOn
}

function VishwaReel({ motionOn }: { motionOn: boolean }) {
  return (
    <div className="motion-preview motion-preview--vishwa">
      <video
        autoPlay={motionOn}
        controls
        loop
        muted
        playsInline
        poster="/Assets/Projects/VishwaConclave/motion-2021/posters/crafting-decade-theme.mp4.png"
        preload="metadata"
        aria-label="VishwaConclave Crafting the Decade campaign film from 2020"
      >
        <source src="/Assets/Projects/VishwaConclave/motion-2021/crafting-decade-theme.mp4" type="video/mp4" />
      </video>
      <div className="motion-vishwa__label" aria-hidden="true">
        <span>Official campaign archive</span>
        <strong>Crafting the Decade · 2020</strong>
      </div>
    </div>
  )
}

function MentraHeroFilm({ motionOn }: { motionOn: boolean }) {
  return (
    <figure className="motion-hero-film motion-hero-film--mentra">
      <video
        autoPlay={motionOn}
        controls
        loop
        muted
        playsInline
        poster="/Assets/Projects/mentra-brand/motion/official-site-hero-poster.png"
        preload="metadata"
        aria-label="Official Mentra site hero film showing Mentra smart glasses"
      >
        <source src="/Assets/Projects/mentra-brand/motion/official-site-hero.mp4" type="video/mp4" />
      </video>
      <figcaption>
        <span>Official Mentra source footage</span>
        <small>Campaign reference · film not directed by Parth</small>
      </figcaption>
    </figure>
  )
}

function MentraReel() {
  return (
    <div className="motion-preview motion-preview--mentra" role="img" aria-label="Mentra advertising prototype moving from a lived moment to wearable hardware, a single benefit, and MentraOS">
      <div className="motion-mentra__status" aria-hidden="true">
        <span>MENTRA LIVE / PAID SOCIAL SYSTEM</span>
        <span>15 SEC MASTER</span>
      </div>
      <div className="motion-mentra__chapter-labels" aria-hidden="true">
        <span>01 / MOMENT</span><span>02 / WEAR</span><span>03 / USE</span><span>04 / EXTEND</span>
      </div>
      <div className="motion-mentra__scene motion-mentra__scene--moment" aria-hidden="true">
        <img src="/Assets/Projects/mentra-brand/photos/ad-stream.webp" alt="" />
        <div><small>MENTRA LIVE</small><strong>Stream your world.</strong><span>Stay in the moment. Bring it with you.</span></div>
      </div>
      <div className="motion-mentra__scene motion-mentra__scene--hardware" aria-hidden="true">
        <span>Designed to wear.<br />Ready to capture.</span>
        <img src="/Assets/Projects/mentra-brand/photos/render-both-frames.webp" alt="" />
        <i />
      </div>
      <div className="motion-mentra__scene motion-mentra__scene--pov" aria-hidden="true">
        <img src="/Assets/Projects/mentra-brand/photos/ad-hear.webp" alt="" />
        <div><small>ONE BENEFIT / ONE SPOT</small><strong>Hear your audio.<br />Hear the world.</strong></div>
      </div>
      <div className="motion-mentra__scene motion-mentra__scene--platform" aria-hidden="true">
        <img src="/Assets/images/mentra/os-all-apps.png" alt="" />
        <div><small>POWERED BY MENTRAOS</small><strong>One pair. More possibilities.</strong><span>Build · install · extend</span></div>
      </div>
      <div className="motion-mentra__timeline" aria-hidden="true"><i /><span>MOMENT</span><span>WEAR</span><span>USE</span><span>EXTEND</span></div>
    </div>
  )
}

function TransfiReel({ motionOn }: { motionOn: boolean }) {
  return (
    <div className={`motion-preview motion-preview--transfi${motionOn ? '' : ' is-paused'}`} role="img" aria-label="TransFi transaction motion preview moving from currency choice through payment status to confirmation">
      <div className="motion-transfi__status" aria-hidden="true"><span>TRANSFI / TRANSACTION 01</span><span>18 SEC MASTER</span></div>
      <div className="motion-transfi__chapter-labels" aria-hidden="true">
        <span>01 / ORIENT</span><span>02 / CHOOSE</span><span>03 / MOVE</span><span>04 / CONFIRM</span>
      </div>
      <div className="motion-transfi__scene motion-transfi__scene--signal" aria-hidden="true">
        <div><img src={transfiMotion} alt="" /></div>
        <strong>One payment.<br />Every state visible.</strong>
        <p><span>$300.00</span><small>USD → 0.0925 BTC</small></p>
      </div>
      <div className="motion-transfi__scene motion-transfi__scene--choose" aria-hidden="true">
        <img src="/Assets/Projects/Transfi/public/Group 1000004741.png" alt="" />
        <div><small>CHOOSE THE CORRIDOR</small><strong>USD → BTC</strong><span>Amount remains anchored</span></div>
      </div>
      <div className="motion-transfi__scene motion-transfi__scene--move" aria-hidden="true">
        <img src="/Assets/Projects/Transfi/public/Frame 427318646.png" alt="" />
        <div><small>FOLLOW THE STATE</small><strong>Choose · verify · pay · deliver</strong></div>
      </div>
      <div className="motion-transfi__scene motion-transfi__scene--confirm" aria-hidden="true">
        <img src="/Assets/Projects/Transfi/public/Order Summary.png" alt="" />
        <div><small>TRANSACTION STATE</small><strong>Payment complete.</strong><span>Amount, fees, method, and status remain readable.</span></div>
      </div>
      <div className="motion-transfi__timeline" aria-hidden="true"><i /><span>CHOOSE</span><span>VERIFY</span><span>MOVE</span><span>CONFIRM</span></div>
    </div>
  )
}

function ProjectReel({ project, motionOn }: { project: MotionProject; motionOn: boolean }) {
  if (project.key === 'vishwa') return <VishwaReel motionOn={motionOn} />
  if (project.key === 'mentra') return <MentraReel />
  return <TransfiReel motionOn={motionOn} />
}

function VishwaCampaignBrief() {
  const items = [
    ['Audience', 'Students and young professionals deciding whether an unfamiliar conference was worth their attention.'],
    ['Communication job', 'Make an abstract annual theme feel intriguing first, then concrete enough to act on.'],
    ['Campaign proof', 'Speakers, website, programme, merchandise, registration, and the live experience.'],
    ['Production constraint', 'A student team shipping a high-frequency campaign across film, feed, story, and web.'],
  ]

  return (
    <>
      <div className="vishwa-brief-grid">
        {items.map(([label, value], index) => (
          <article key={label}><span>0{index + 1}</span><small>{label}</small><p>{value}</p></article>
        ))}
      </div>
      <div className="vishwa-cadence" aria-label="VishwaConclave campaign release sequence">
        <p>Campaign cadence</p>
        <div>
          <span><small>01</small><strong>Tease</strong></span>
          <i aria-hidden="true">→</i>
          <span><small>02</small><strong>Reveal</strong></span>
          <i aria-hidden="true">→</i>
          <span><small>03</small><strong>Prove</strong></span>
          <i aria-hidden="true">→</i>
          <span><small>04</small><strong>Convert</strong></span>
        </div>
      </div>
    </>
  )
}

function CampaignVideo({ src, poster, title, note, href, className = '' }: { src: string; poster?: string; title: string; note: string; href?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const captions = campaignCaptions[src.split('/').pop() || '']
  // The inspected source contains one H.264 stream and no audio stream.
  const silent = src.endsWith('/official-product-intro.mp4')
  return (
    <figure className={`vishwa-video ${className}`.trim()}>
      <div>
        <video controls playsInline muted={silent} poster={poster} preload="metadata" aria-label={title} data-caption-status={captions ? 'automatic' : undefined} onError={() => setFailed(true)}>
          <source src={src} type="video/mp4" onError={() => setFailed(true)} />
          {captions && <track kind="captions" src={captions.src} srcLang="en" label="English (automatic)" default />}
        </video>
      </div>
      <figcaption>
        <span>{title}</span>
        <small>{note}</small>
        {silent && <small>Silent clip · no audio track</small>}
        {captions && <details className="campaign-transcript">
          <summary>Read automatic captions</summary>
          <p>These captions were generated from the source audio and may contain errors.</p>
          <p>{captions.transcript}</p>
          <a href={captions.src} download>Download captions</a>
        </details>}
        {failed && <p role="status">The embedded video could not load. <a href={href || src} target="_blank" rel="noreferrer">Open video separately ↗</a></p>}
        {href && <a href={href} target="_blank" rel="noreferrer">View original post ↗</a>}
      </figcaption>
    </figure>
  )
}

function VishwaCampaignArchive() {
  const films = [
    {
      src: '/Assets/Projects/VishwaConclave/motion-2021/crafting-decade-theme.mp4',
      poster: '/Assets/Projects/VishwaConclave/motion-2021/posters/crafting-decade-theme.mp4.png',
      title: 'Theme film · Crafting the Decade',
      note: '2020 · official campaign film',
      href: 'https://www.instagram.com/p/CHfpIWpjDUw/',
    },
    {
      src: '/Assets/Projects/VishwaConclave/motion-2021/crafting-decade-trailer.mp4',
      poster: '/Assets/Projects/VishwaConclave/motion-2021/posters/crafting-decade-trailer.mp4.png',
      title: 'Trailer · Crafting the Decade',
      note: '2020 · official anticipation cut',
      href: 'https://www.instagram.com/p/CHkrXXAjthA/',
    },
    {
      src: '/Assets/Projects/VishwaConclave/motion-2021/website-release.mp4',
      poster: '/Assets/Projects/VishwaConclave/motion-2021/posters/website-release.mp4.png',
      title: 'Website release',
      note: '2021 · product and registration proof',
      href: 'https://www.instagram.com/p/CL13dm2jz24/',
    },
    {
      src: '/Assets/Projects/VishwaConclave/motion-2021/event-story.mp4',
      poster: '/Assets/Projects/VishwaConclave/motion-2021/posters/event-story.mp4.png',
      title: 'Event experience',
      note: '2021 · programme-led social film',
      href: 'https://www.instagram.com/p/CNaMg6AgO_9/',
    },
  ]

  return (
    <>
      <div className="vishwa-video-grid">
        {films.map((film) => <CampaignVideo key={film.src} {...film} />)}
      </div>

      <div className="vishwa-production-credit">
        <div>
          <p className="vishwa-production-credit__eyebrow">Collaboration credit</p>
          <h3>2021 theme-release film</h3>
          <p>The official post credits animation to <strong>Parallel Studio</strong>. My case-study scope is the creative direction and campaign system around the film; I do not present the specialist animation execution as my individual work.</p>
          <a href="https://www.instagram.com/p/CLEvdDdDYRg/" target="_blank" rel="noreferrer">View the original credit ↗</a>
        </div>
        <CampaignVideo
          src="/Assets/Projects/VishwaConclave/motion-2021/theme-release.mp4"
          poster="/Assets/Projects/VishwaConclave/motion-2021/posters/theme-release.mp4.png"
          title="Accelerating the Paradigm Shift"
          note="2021 · animation by Parallel Studio"
        />
      </div>
    </>
  )
}

function MentraVideoEvidence() {
  return (
    <>
      <div className="motion-video-provenance">
        <span>Source-footage note</span>
        <p>The hero film and product introduction were published by Mentra. They verify the physical product, real-world use, and platform context available to the proposed campaign system; I am not presenting either finished edit as a film I directed.</p>
      </div>
      <div className="vishwa-video-grid motion-source-video-grid motion-source-video-grid--single">
        <CampaignVideo
          src="/Assets/Projects/mentra-brand/motion/official-product-intro.mp4"
          poster="/Assets/Projects/mentra-brand/motion/official-product-intro-poster.png"
          title="Mentra Live · product introduction"
          note="Official Mentra product film · campaign source reference"
          href="https://mentraglass.com/"
        />
      </div>
    </>
  )
}

function MentraCommunicationBrief() {
  const items = [
    ['Audience', 'Creators and early adopters who want useful everyday eyewear—not another device competing for their attention.'],
    ['Communication job', 'Make the life moment desirable first, then prove Mentra can capture, play, and extend it without getting in the way.'],
    ['Campaign proof', 'Real Stream, Hear, Focus, teaser, hardware, and MentraOS assets—each assigned one advertising job.'],
    ['Delivery constraint', 'One recognizable campaign across six- and 15-second paid social, sound-off viewing, and responsive crops.'],
  ]

  return (
    <>
      <div className="mentra-brief-grid">
        {items.map(([label, value], index) => (
          <article key={label}><span>0{index + 1}</span><small>{label}</small><p>{value}</p></article>
        ))}
      </div>
      <div className="mentra-story-ladder" aria-label="Mentra advertising story sequence">
        <p>Advertising ladder</p>
        <div>
          <span><small>Desire</small><strong>Moment</strong></span>
          <i aria-hidden="true">→</i>
          <span><small>Accept</small><strong>Wearability</strong></span>
          <i aria-hidden="true">→</i>
          <span><small>Understand</small><strong>Capability</strong></span>
          <i aria-hidden="true">→</i>
          <span><small>Believe</small><strong>Platform</strong></span>
        </div>
      </div>
    </>
  )
}

const mentraOnboardingPrototype = 'https://www.figma.com/proto/UqMHlp3DWI2erzruqcCZNd/Mentra-All-in-One--Copy-?node-id=63254-44046&viewport=-612%2C-601%2C0.23&t=McNEtHe1mXIBKbD1-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=63254%3A44046&show-proto-sidebar=1&page-id=63254%3A33903'

function MentraOnboardingMotion({ motionOn }: { motionOn: boolean }) {
  return (
    <section className="mentra-onboarding-motion" aria-labelledby="mentra-onboarding-title">
      <div className="mentra-onboarding-motion__visual">
        <div className="mentra-onboarding-motion__visual-head">
          <span>Mentra Live · onboarding prototype</span>
          <a href={mentraOnboardingPrototype} target="_blank" rel="noreferrer">Open prototype ↗</a>
        </div>
        <video
          autoPlay={motionOn}
          controls
          loop
          muted
          playsInline
          poster="/Assets/Projects/mentra-brand/motion/mentra-onboarding-prototype-poster.jpg"
          preload="metadata"
          aria-label="Mentra onboarding prototype showing device discovery, update, and guided glasses controls"
        >
          <source src="/Assets/Projects/mentra-brand/motion/mentra-onboarding-prototype.mp4" type="video/mp4" />
        </video>
        <small>Recorded Figma prototype · 1:35 · playback controls included</small>
      </div>
      <div className="mentra-onboarding-motion__copy">
        <small>Product onboarding · interactive prototype</small>
        <h3 id="mentra-onboarding-title">Show the control. Then teach the gesture.</h3>
        <p>I used the glasses animation to point to the exact control before asking the user to act. The flow moves from finding and updating the device into a guided tutorial for capture, recording, audio, volume, and charging.</p>
        <div>
          <p><strong>1</strong><span>Action per screen</span></p>
          <p><strong>7</strong><span>Guided hardware actions</span></p>
        </div>
        <a href={mentraOnboardingPrototype} target="_blank" rel="noreferrer">Experience the onboarding prototype ↗</a>
      </div>
    </section>
  )
}

function MentraMotionSystem({ motionOn }: { motionOn: boolean }) {
  const tokens = [
    ['Hook', 'First frame', 'The benefit is legible before the first transition begins.'],
    ['Moment', 'Longest hold', 'The person, place, and reason to care receive more time than the interface.'],
    ['Proof', 'One object', 'Wearability, camera, audio, or MentraOS proves one promise at a time.'],
    ['Action', 'Stable close', 'The product silhouette, benefit line, and CTA stop moving together.'],
  ]
  const benchmarkMoves = [
    ['Human situation before specification', 'Open on celebration, concentration, or listening—then reveal how Mentra supports it.'],
    ['Eyewear before electronics', 'Show frames on a person before macro, exploded, or operating-system proof.'],
    ['One scenario per story', 'Separate Stream, Hear, Focus, and Build instead of compressing them into one feature reel.'],
  ]

  return (
    <>
      <MentraOnboardingMotion motionOn={motionOn} />

      <div className="mentra-benchmark">
        <div className="mentra-benchmark__intro">
          <small>One category reference → an original response</small>
          <h3>Borrow the lesson, not the look.</h3>
          <p>Even Realities is useful because its advertising begins with people and familiar eyewear. Mentra applies that hierarchy to different product truths: first-person capture, open-ear audio, and an open MiniApp platform.</p>
          <span><a href="https://www.evenrealities.com/" target="_blank" rel="noreferrer">View the category reference ↗</a> · No competitor assets, layouts, or copy are used.</span>
        </div>
        <div className="mentra-benchmark__moves">
          {benchmarkMoves.map(([principle, response], index) => (
            <article key={principle}><span>0{index + 1}</span><strong>{principle}</strong><p>{response}</p></article>
          ))}
        </div>
      </div>

      <div className="mentra-source-grid">
        <article className="mentra-source-card mentra-source-card--ad">
          <img src="/Assets/Projects/mentra-brand/photos/ad-stream.webp" alt="Mentra Stream Your World campaign concept" loading="lazy" />
          <p><span>01 · Stream</span><strong>Lead with a moment worth keeping.</strong></p>
        </article>
        <article className="mentra-source-card mentra-source-card--ad">
          <img src="/Assets/Projects/mentra-brand/photos/ad-hear.webp" alt="Mentra Hear Your Audio Hear the World campaign concept" loading="lazy" />
          <p><span>02 · Hear</span><strong>Show audio without visual isolation.</strong></p>
        </article>
        <article className="mentra-source-card mentra-source-card--ad">
          <img src="/Assets/Projects/mentra-brand/photos/ad-4.webp" alt="Mentra Focus campaign concept with smart glasses shown on a person" loading="lazy" />
          <p><span>03 · Focus</span><strong>Turn an attention tension into a product desire.</strong></p>
        </article>
        <article className="mentra-source-card mentra-source-card--os">
          <img src="/Assets/images/mentra/os-all-apps.png" alt="MentraOS applications interface" loading="lazy" />
          <p><span>04 · Build</span><strong>Close on an ecosystem that can keep expanding.</strong></p>
        </article>
      </div>

      <div className="mentra-token-grid" aria-label="Mentra motion timing decisions">
        {tokens.map(([name, timing, use], index) => (
          <article key={name}><span>0{index + 1}</span><small>{name}</small><strong>{timing}</strong><p>{use}</p></article>
        ))}
      </div>

      <div className="mentra-format-map">
        <div className="mentra-format-map__copy">
          <small>Paid-social composition</small>
          <h3>One campaign. Different attention conditions.</h3>
          <p>The horizontal master carries the complete moment-to-platform story. The vertical spot begins on the human hook, enlarges one benefit, and reserves a stable lower zone for product and action.</p>
        </div>
        <figure className="mentra-format mentra-format--wide">
          <img src="/Assets/Projects/mentra-brand/photos/render-both-frames.webp" alt="Mentra product render in a horizontal delivery frame" loading="lazy" />
          <i aria-hidden="true" /><figcaption>16:9 · campaign master</figcaption>
        </figure>
        <figure className="mentra-format mentra-format--vertical">
          <img src="/Assets/Projects/mentra-brand/photos/ad-stream.webp" alt="Stream Your World Mentra campaign in a vertical delivery frame" loading="lazy" />
          <i aria-hidden="true" /><figcaption>9:16 · single-benefit spot</figcaption>
        </figure>
      </div>
    </>
  )
}

function TransfiCommunicationBrief() {
  const items = [
    ['Audience', 'Merchant, growth, and operations teams evaluating whether a global payment flow feels understandable and trustworthy.'],
    ['Communication job', 'Explain one payment from customer intent to confirmed delivery without turning the infrastructure into a black box.'],
    ['Product proof', 'Real checkout, payment-method, verification, order-status, and dashboard frames from the TransFi product work.'],
    ['Delivery constraint', 'Amounts and statuses must stay readable across social crops, sound-off playback, pauses, and localized currency variants.'],
  ]
  const states = [
    ['01', 'Choose', 'Amount + currency'],
    ['02', 'Connect', 'Wallet address'],
    ['03', 'Authorize', 'Payment method'],
    ['04', 'Verify', 'Identity state'],
    ['05', 'Track', 'Order progress'],
    ['06', 'Confirm', 'Delivery + record'],
  ]

  return (
    <>
      <div className="mentra-brief-grid transfi-brief-grid">
        {items.map(([label, value], index) => (
          <article key={label}><span>0{index + 1}</span><small>{label}</small><p>{value}</p></article>
        ))}
      </div>
      <div className="transfi-state-model" aria-label="TransFi transaction state model">
        <p>Transaction model</p>
        <div>
          {states.map(([num, title, detail]) => (
            <article key={num}><span>{num}</span><strong>{title}</strong><small>{detail}</small></article>
          ))}
        </div>
      </div>
    </>
  )
}

function TransfiMotionSystem() {
  const tokens = [
    ['Brand signal', 'Chapter open', 'The identity introduces the route, then gets out of the transaction.'],
    ['State change', 'One handoff', 'The next panel enters only after the current action resolves.'],
    ['Data update', 'Fixed anchor', 'Amount and currency change without drifting around the frame.'],
    ['Proof hold', 'Longest pause', 'Fees, verification, and confirmation remain readable before the next cut.'],
  ]
  const stateRules = [
    ['Awaiting input', 'Blue focus ring', 'Only the next available action moves.'],
    ['Processing', 'Cyan route', 'Progress advances; the amount stays fixed.'],
    ['Needs attention', 'Amber hold', 'Pause on the relevant field—never shake the whole screen.'],
    ['Completed', 'Green + timestamp', 'One firm settle, then enough time to verify the record.'],
  ]

  return (
    <>
      <div className="mentra-source-grid transfi-source-grid">
        <article className="mentra-source-card mentra-source-card--os transfi-source-card">
          <img src="/Assets/Projects/Transfi/public/Group 1000004741.png" alt="TransFi currency-selection product visual" loading="lazy" />
          <p><span>01 · Intent</span><strong>Currency choice gives the story a concrete starting point.</strong></p>
        </article>
        <article className="mentra-source-card mentra-source-card--os transfi-source-card">
          <img src="/Assets/Projects/Transfi/public/Frame 427318638.png" alt="TransFi buy-crypto widget with currency and asset selectors" loading="lazy" />
          <p><span>02 · Choice</span><strong>Real interface states show what the customer actually controls.</strong></p>
        </article>
        <article className="mentra-source-card transfi-source-card transfi-source-card--journey">
          <img src="/Assets/Projects/Transfi/public/Frame 427318646.png" alt="TransFi six-step checkout and delivery journey" loading="lazy" />
          <p><span>03 · Route</span><strong>The six source screens become one continuous transaction path.</strong></p>
        </article>
        <article className="mentra-source-card mentra-source-card--os transfi-source-card transfi-source-card--summary">
          <img src="/Assets/Projects/Transfi/public/Order Summary.png" alt="TransFi order summary with fees and delivery status" loading="lazy" />
          <p><span>04 · Evidence</span><strong>The resolved record—not confetti—is the payoff.</strong></p>
        </article>
      </div>

      <div className="mentra-token-grid" aria-label="TransFi motion timing decisions">
        {tokens.map(([name, timing, use], index) => (
          <article key={name}><span>0{index + 1}</span><small>{name}</small><strong>{timing}</strong><p>{use}</p></article>
        ))}
      </div>

      <div className="transfi-state-rules" aria-label="TransFi state motion behavior">
        <div><small>Status logic</small><h3>Motion changes with transaction risk.</h3><p>A new state is not automatically a new animation. Behavior depends on whether the customer should act, wait, inspect, or trust that the payment is complete.</p></div>
        <section>
          {stateRules.map(([state, signal, behavior]) => (
            <article key={state}><strong>{state}</strong><span>{signal}</span><p>{behavior}</p></article>
          ))}
        </section>
      </div>

      <div className="mentra-format-map transfi-format-map">
        <div className="mentra-format-map__copy">
          <small>Responsive composition</small>
          <h3>Protect the amount and the next action.</h3>
          <p>The horizontal master can show the customer journey and merchant context together. The vertical cut follows one state at a time, keeps the amount in the upper third, and reserves the lower zone for the active action or confirmation.</p>
        </div>
        <figure className="mentra-format mentra-format--wide transfi-format transfi-format--wide">
          <img src="/Assets/Projects/Transfi/public/Frame 427318646.png" alt="TransFi transaction journey in a horizontal delivery frame" loading="lazy" />
          <i aria-hidden="true" /><figcaption>16:9 · end-to-end master</figcaption>
        </figure>
        <figure className="mentra-format mentra-format--vertical transfi-format transfi-format--vertical">
          <img src="/Assets/Projects/Transfi/public/Order Summary.png" alt="TransFi order summary in a vertical delivery frame" loading="lazy" />
          <i aria-hidden="true" /><figcaption>9:16 · status story</figcaption>
        </figure>
      </div>
    </>
  )
}

function MotionHeroArtifact({ motionOn }: { motionOn: boolean }) {
  return <div className="motion-hero-artifact"><CategoryAsciiArtifact slug="motion" motionEnabled={motionOn} /></div>
}

function MotionLanding({ motionOn }: { motionOn: boolean }) {
  return (
    <div className="motion-index-page category-page">
      <Helmet>
        <title>Motion Design · Parth Pawar</title>
        <meta name="description" content="Motion direction across a shipped event campaign, proposed product stories built from original design work, and four completed editorial films." />
        <meta property="og:title" content="Motion Design · Parth Pawar" />
        <meta property="og:description" content="Four motion case studies with clear authorship boundaries: shipped campaign work, product-grounded proposals, and completed films." />
        <link rel="canonical" href="https://designwhich.works/motion" />
      </Helmet>
      <Nav />
      <main id="main-content">
        <div className="wrap">
          <section className="motion-index-hero">
            <p className="motion-index-hero__eyebrow"><i aria-hidden="true" /> Motion design</p>
            <div className="motion-index-hero__copy">
              <span>Motion<br />Direction</span>
              <h1>Motion that explains the idea, proves the product, and earns the pace.</h1>
            </div>
            <MotionHeroArtifact motionOn={motionOn} />
            <div className="motion-index-hero__bottom">
              <a href="#lp-work" className="motion-index-hero__link figma-hover">See work <span aria-hidden="true">↓</span></a>
              <dl>
                <div><dt>04</dt><dd>Case studies</dd></div>
                <div><dt>Campaign + product</dt><dd>Story types</dd></div>
                <div><dt>AE + Premiere</dt><dd>Production tools</dd></div>
              </dl>
            </div>
          </section>

          <section id="lp-work" className="motion-index-work">
            <p className="lp-section-label">Shipped campaign archive</p>
            <Reveal>
              <ProjectCard
                slug={`motion/${projects[0].path}`}
                name={projects[0].cardTitle}
                image={projects[0].heroImage}
                tag={projects[0].discipline}
                year={projects[0].year}
                desc={projects[0].descriptor}
                featured
                loading="eager"
              />
            </Reveal>

            <p className="lp-section-label motion-index-work__secondary-label">Product-grounded proposals &amp; completed films</p>
            <div className="pcard-masonry motion-index-card-grid">
              {projects.slice(1).map((project) => (
                <Reveal key={project.key}>
                  <ProjectCard
                    slug={`motion/${project.path}`}
                    name={project.cardTitle}
                    image={project.heroImage}
                    hoverMediaSrc={project.key === 'mentra' && motionOn ? '/Assets/Projects/mentra-brand/motion/official-site-hero.mp4' : project.key === 'transfi' ? transfiMotion : undefined}
                    hoverMediaKind={project.key === 'mentra' ? 'video' : 'image'}
                    tag={project.discipline}
                    year={project.year}
                    desc={project.descriptor}
                    coverShape="square"
                  />
                </Reveal>
              ))}
            </div>
          </section>

          <Reveal>
            <section className="motion-index-proposal" aria-labelledby="motion-proposal-title">
              <div>
                <p className="lp-section-label">Independent creative-studio concept</p>
                <h2 id="motion-proposal-title">A motion system for products that think in public.</h2>
              </div>
              <div>
                <p>A clearly labeled proposal for Perplexity: one launch-story prototype, three product-specific territories, and a production plan built around real product behavior.</p>
                <a className="figma-hover" href="/perplexity">View the Perplexity study <span aria-hidden="true">↗</span></a>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="motion-index-method" aria-labelledby="motion-method-title">
              <p className="lp-section-label">How the work is built</p>
              <div className="motion-index-method__heading">
                <h2 id="motion-method-title">From product truth to a reusable motion system.</h2>
                <p>The goal is not one dramatic reel. It is a clear story, a controlled After Effects build, and a family of outputs the team can continue using.</p>
              </div>
              <div className="motion-index-method__grid">
                {[
                  ['01', 'Start with evidence', 'Separate shipped work, source material, collaboration, and the proposed layer before shaping the story.'],
                  ['02', 'Write the sentence', 'Define the audience, communication job, and one idea the edit must make clearer.'],
                  ['03', 'Build cause and effect', 'Order real product and brand artifacts into a storyboard before polishing movement.'],
                  ['04', 'Version from one idea', 'Plan crops, captions, cutdowns, and templates only after the main story works.'],
                ].map(([num, title, body]) => (
                  <article key={num}><span>{num}</span><h3>{title}</h3><p>{body}</p></article>
                ))}
              </div>
            </section>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function DecisionList({ decisions }: { decisions: MotionProject['decisions'] }) {
  return (
    <div className="motion-decision-list">
      {decisions.map((decision, index) => (
        <article key={decision.kept}>
          <span>0{index + 1}</span>
          <div><small>Removed</small><p>{decision.removed}</p></div>
          <b aria-hidden="true">→</b>
          <div><small>Kept</small><h3>{decision.kept}</h3><p>{decision.reason}</p></div>
        </article>
      ))}
    </div>
  )
}

function MotionEvidence({ project }: { project: MotionProject }) {
  const items = [
    ['Evidence shown', project.evidence],
    ['My authorship', project.authorship],
    ['Study boundary', project.studyBoundary],
  ]

  return (
    <aside className="motion-evidence" aria-label="Project evidence and authorship">
      {items.map(([label, value]) => <div key={label}><small>{label}</small><p>{value}</p></div>)}
    </aside>
  )
}

function MotionCaseStudy({ project, motionOn }: { project: MotionProject; motionOn: boolean }) {
  const nextProject = projects[(projects.indexOf(project) + 1) % projects.length]
  const style = { '--project-color': project.color } as CSSProperties
  const isVishwa = project.key === 'vishwa'
  const isMentra = project.key === 'mentra'
  const isTransfi = project.key === 'transfi'
  const hasBrief = isVishwa || isMentra || isTransfi
  const hasSourceVideoSection = isMentra
  const sectionNumbers = isMentra
    ? { story: '03', system: '04', art: '05', decisions: '06', afterEffects: '07' }
    : { story: '02', system: '03', art: '04', decisions: '05', afterEffects: '06' }

  return (
    <>
      <Helmet>
        <title>{project.title} · Motion Design · Parth Pawar</title>
        <meta name="description" content={project.descriptor} />
        <meta property="og:title" content={`${project.title} · Motion Design`} />
        <meta property="og:description" content={project.descriptor} />
        <meta property="og:image" content={`https://designwhich.works${project.heroImage}`} />
        <link rel="canonical" href={`https://designwhich.works/motion/${project.path}`} />
      </Helmet>
      <Nav />
      <main id="main-content" className={`project-main motion-project-main motion-project-main--${project.key}`} style={style}>
        <ProjectHeader
          backLink="/motion"
          backLabel="Back to Motion"
          categorySlug={project.categorySlug}
          tags={[project.discipline, ...project.roles.slice(0, 2)]}
          title={project.title}
          subtitle={project.descriptor}
          info={[
            { label: 'Role', value: project.roles.join(' · ') },
            { label: 'Year', value: project.year },
            { label: 'Scope', value: project.outputs.join(' · ') },
            { label: 'Status', value: isMentra ? 'Portfolio proposal · original Mentra source assets' : isVishwa ? 'Shipped campaign archive · collaborative production' : 'Portfolio proposal · original TransFi product states' },
          ]}
          heroExperience="visual"
          visualTitleMode="stacked"
          visualHeadline={project.intro}
          visualHeroImage={project.heroImage}
          visualHeroAlt={project.heroAlt}
          visualHeroMedia={isVishwa ? <VishwaReel motionOn={motionOn} /> : isMentra ? <MentraHeroFilm motionOn={motionOn} /> : undefined}
          heroTone="motion"
          showHeaderSummary={false}
        />

        <ProjectOverview sections={[
          { label: 'The challenge', content: project.challenge },
          { label: 'Motion direction', content: project.move },
          { label: 'System outcome', content: project.outcome },
        ]} />

        <MotionEvidence project={project} />

        {isVishwa && (
          <CsSection id="motion-brief" label="01 — Campaign brief" title="Build anticipation, then keep earning attention until event day.">
            <CsBody>
              <p>VishwaConclave needed more than an annual look. The campaign had to introduce an idea, establish cultural credibility, reveal the people and programme behind it, and create urgency—while a student team continued producing at social speed.</p>
            </CsBody>
            <VishwaCampaignBrief />
          </CsSection>
        )}

        {isMentra && (
          <CsSection id="motion-brief" label="01 — Advertising brief" title="Make the moment desirable before making the technology impressive.">
            <CsBody>
              <p>The advertising story has to answer four questions in order: do I recognize this moment, would I wear these glasses, what can they do for me, and why does the open platform matter? The brief turns those questions into a campaign ladder rather than a specification montage.</p>
            </CsBody>
            <MentraCommunicationBrief />
          </CsSection>
        )}

        {isTransfi && (
          <CsSection id="motion-brief" label="01 — Communication brief" title="Make one complex payment feel observable from intent to delivery.">
            <CsBody>
              <p>The story has to communicate both sides of trust: the customer understands the next action, and the merchant can see what happened. The brief converts the product flow into six visible states instead of hiding complexity behind generic speed claims.</p>
            </CsBody>
            <TransfiCommunicationBrief />
          </CsSection>
        )}

        {isMentra && (
          <CsSection id="source-video" label="02 — Source footage" title="Official footage defines what the proposed edit may show.">
            <CsBody>
              <p>These films establish the product, how it is worn, and where it is used. The storyboard reorganizes approved source material; it does not invent a different product or imply that I directed the original footage.</p>
            </CsBody>
            <MentraVideoEvidence />
          </CsSection>
        )}

        <CsSection id="motion-story" label={`${sectionNumbers.story} — Storyboard`} title={project.storyTitle}>
          <CsBody><p>{isVishwa ? 'The storyboard was not only a shot list; it was the release order of the campaign. Each phase had a different communication job, and the pacing became more direct as the event moved closer.' : isMentra ? 'The 15-second master opens on a life moment, moves through wearability and one capability, then earns the right to show hardware and MentraOS. Expressive movement hooks attention; quieter product holds provide proof; one stable message closes the advertisement.' : 'The 18-second master follows one illustrative transaction. The amount anchors the sequence; customer actions advance it; verification and settlement receive longer holds because those are the moments where trust is either earned or lost.'}</p></CsBody>
          {!isVishwa && (
            <div className="motion-case-preview">
              <ProjectReel project={project} motionOn={motionOn} />
              <p><span>{isMentra ? '15-second advertising-system prototype' : '18-second transaction-system prototype'}</span><span>{isTransfi ? 'Illustrative values from source UI · reduced-motion respected' : 'Real Mentra campaign assets · reduced-motion respected'}</span></p>
            </div>
          )}
          <CsSteps steps={project.beats.map((beat) => ({ num: beat.time, title: beat.title, desc: beat.body }))} />
        </CsSection>

        {isVishwa && (
          <CsSection id="campaign-archive" label="03 — Original campaign archive" title="The shipped sequence is the strongest process evidence.">
            <CsBody>
              <p>The official 2020–21 archive shows how the campaign moved from theme-building into speakers, website, programme, and registration. Specialist execution remains credited where it appears.</p>
            </CsBody>
            <VishwaCampaignArchive />
          </CsSection>
        )}

        {isMentra && (
          <CsSection id="motion-system" label={`${sectionNumbers.system} — Advertising strategy & motion grammar`} title="Human first. Wearable second. Technical only when it proves the promise.">
            <CsBody>
              <p>The same hierarchy guides onboarding and advertising: show the physical or human action first, then reveal one next step or capability. The onboarding pattern comes from my product work; the paid-social system remains a portfolio proposal.</p>
              <p>Even Realities is cited only as a category benchmark for beginning with people and familiar eyewear. No competitor visuals or copy are used.</p>
            </CsBody>
            <MentraMotionSystem motionOn={motionOn} />
          </CsSection>
        )}

        {isTransfi && (
          <CsSection id="motion-system" label={`${sectionNumbers.system} — Motion grammar`} title="Fast enough to feel responsive. Stable enough to trust.">
            <CsBody>
              <p>The research produced a transaction grammar rather than an effects board: natural weight for financial motion, spatial continuity between steps, one persistent amount, and different behaviors for waiting, processing, attention, and completed states.</p>
            </CsBody>
            <TransfiMotionSystem />
          </CsSection>
        )}

        <CsSection id="art-direction" label={`${sectionNumbers.art} — Art direction`} title={project.artTitle}>
          <CsBody><p>{project.artNote}</p></CsBody>
          <div className="motion-frame-grid">
            {project.frames.map((frame) => (
              <figure className={frame.fit === 'contain' ? 'is-contain' : ''} key={frame.src}>
                <div><img src={frame.src} alt={frame.alt} loading="lazy" /></div>
                <figcaption>{frame.caption}</figcaption>
              </figure>
            ))}
          </div>
          <CsInfoGrid items={project.principles.map((principle) => ({ key: principle.label, value: principle.value }))} />
        </CsSection>

        <CsSection id="motion-decisions" label={`${sectionNumbers.decisions} — Motion decisions`} title={isVishwa ? 'Specific choices, tied to the campaign' : isMentra ? 'Specific choices, tied to the advertising story' : 'Specific choices, tied to transaction trust'}>
          <CsBody><p>{isVishwa ? 'The same campaign could be atmospheric or informational because the motion rules were attached to communication jobs, not to a single visual effect.' : isMentra ? 'Every decision protects the advertising hierarchy: desire first, proof second, platform third. The system avoids category clichés that make the brand louder while making the human benefit less specific.' : 'Every decision protects continuity, comprehension, or confidence. The system removes familiar fintech effects whenever they make the actual product journey less observable.'}</p></CsBody>
          <DecisionList decisions={project.decisions} />
        </CsSection>

        <CsSection
          id="after-effects"
          label={`${sectionNumbers.afterEffects} — After Effects production plan`}
          title={isVishwa ? 'A retrospective rebuild for the campaign archive.' : isMentra ? 'One editable file for the campaign family.' : 'One editable file for the transaction story.'}
        >
          <CsBody>
            <p>{isVishwa ? 'The original media survives; the old team project file is not presented as a current deliverable. This is a documented After Effects rebuild showing how I would now organize the campaign for faster iteration, specialist collaboration, and consistent social versions.' : isMentra ? 'This build plan turns the advertising grammar into a reusable campaign tool: one master hierarchy, a swappable Stream/Hear/Focus/Build hook family, protected lifestyle and product modules, and paid-social compositions that inherit timing instead of duplicating it.' : 'This build plan turns one transaction into an editable GTM tool: a persistent amount controller, a six-marker state route, protected product pre-comps, localized copy fields, and delivery versions that inherit the same timing instead of recreating it.'}</p>
          </CsBody>
          <div className="motion-ae-callout">
            <span>Ae</span>
            <div><strong>Production spine</strong><p>{isVishwa ? 'Illustrator and Photoshop source art → After Effects type, camera, compositing, and modular content pre-comps → Premiere edit and audio → Media Encoder delivery set.' : isMentra ? 'Photoshop campaign frames + Illustrator identity vectors + Blender render passes + Figma MentraOS states → After Effects campaign rig, captions, and responsive versions → Premiere sound edit → Media Encoder delivery.' : 'Illustrator identity vectors + Figma checkout and dashboard states → After Effects route rig, amount controls, compositing, and captions → Premiere sound edit → Media Encoder delivery.'}</p></div>
          </div>
          <CsSteps steps={project.aeBuild.map((item, index) => ({ num: `0${index + 1}`, title: `${item.layer} · ${item.technique}`, desc: item.purpose }))} />
          <CsInfoGrid items={project.deliveries} />
        </CsSection>

        <NextProject
          slug={`motion/${nextProject.path}`}
          title={nextProject.cardTitle}
          image={nextProject.heroImage}
        />
        <BottomNav sections={[
          ...(hasBrief ? [{ id: 'motion-brief', label: 'Brief' }] : []),
          ...(hasSourceVideoSection ? [{ id: 'source-video', label: 'Footage' }] : []),
          { id: 'motion-story', label: 'Storyboard' },
          ...(isVishwa ? [{ id: 'campaign-archive', label: 'Archive' }] : []),
          ...(isMentra || isTransfi ? [{ id: 'motion-system', label: 'Motion system' }] : []),
          { id: 'art-direction', label: 'Art direction' },
          { id: 'motion-decisions', label: 'Decisions' },
          { id: 'after-effects', label: 'After Effects' },
        ]} />
      </main>
      <Footer />
    </>
  )
}

export default function MotionPage() {
  const { pathname } = useLocation()
  const motionOn = useMotionPreference()
  const childPath = pathname.replace(/^\/motion\/?/, '').replace(/\/$/, '')
  const project = useMemo(() => projects.find((item) => item.path === childPath), [childPath])

  if (!childPath) return <MotionLanding motionOn={motionOn} />
  if (childPath === 'clawed-agent-story') return <Navigate to="/motion/vishwa-conclave-motion" replace />
  if (!project) return <Navigate to="/motion" replace />
  if (project.key === 'editorial') return <EditingMotionCaseStudy />
  return <MotionCaseStudy project={project} motionOn={motionOn} />
}
