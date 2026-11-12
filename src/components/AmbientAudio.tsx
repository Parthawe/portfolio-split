import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CATEGORY_LABELS, getProject, type ProjectCategory } from '../data/projects'

const STORAGE_KEY = 'pp-ambient-muted'
const AMBIENT_GAIN_BOOST = 1.75
const MAX_AMBIENT_GAIN = 0.06

type AmbientProfileKey =
  | 'arrival'
  | 'focus'
  | 'signal'
  | 'reflection'
  | 'readingRoom'
  | 'exhibit'
  | 'stage'
  | 'surface'
  | 'civic'
  | 'afterhours'
  | 'lab'

interface AmbientProfile {
  key: AmbientProfileKey
  label: string
  reason: string
  gain: number
  notes: [number, number, number]
  noteGains: [number, number, number]
  detune: [number, number, number]
  filterFrequency: number
  filterQ: number
  noiseGain: number
  noiseFilter: number
  lfo1Rate: number
  lfo1Depth: number
  lfo2Rate: number
  lfo2Depth: number
}

interface AmbientRig {
  ctx: AudioContext
  master: GainNode
  filter: BiquadFilterNode
  noteGains: [GainNode, GainNode, GainNode]
  noiseGain: GainNode
  noiseFilter: BiquadFilterNode
  lfo1Gain: GainNode
  lfo2Gain: GainNode
  osc1: OscillatorNode
  osc2: OscillatorNode
  osc3: OscillatorNode
  noise: AudioBufferSourceNode
  lfo1: OscillatorNode
  lfo2: OscillatorNode
}

const AMBIENT_PROFILES: Record<AmbientProfileKey, AmbientProfile> = {
  arrival: {
    key: 'arrival',
    label: 'Arrival',
    reason: 'A wider, calmer bed for first impression. It makes the page feel like an opening scene instead of a feed.',
    gain: 0.03,
    notes: [130.81, 164.81, 196],
    noteGains: [0.13, 0.085, 0.07],
    detune: [-2, 3, -1],
    filterFrequency: 320,
    filterQ: 0.22,
    noiseGain: 0.022,
    noiseFilter: 210,
    lfo1Rate: 1 / 52,
    lfo1Depth: 0.022,
    lfo2Rate: 1 / 88,
    lfo2Depth: 52,
  },
  focus: {
    key: 'focus',
    label: 'Focus',
    reason: 'A drier, steadier bed for comparing projects and reading decisions without adding drama.',
    gain: 0.028,
    notes: [146.83, 196, 220],
    noteGains: [0.105, 0.072, 0.056],
    detune: [-1, 2, -2],
    filterFrequency: 255,
    filterQ: 0.16,
    noiseGain: 0.012,
    noiseFilter: 190,
    lfo1Rate: 1 / 58,
    lfo1Depth: 0.014,
    lfo2Rate: 1 / 108,
    lfo2Depth: 28,
  },
  signal: {
    key: 'signal',
    label: 'Signal',
    reason: 'A cleaner systems-led tone for AI, product, and platform work. It keeps the page precise and deliberate.',
    gain: 0.03,
    notes: [130.81, 174.61, 220],
    noteGains: [0.115, 0.08, 0.058],
    detune: [-2, 2, 1],
    filterFrequency: 295,
    filterQ: 0.2,
    noiseGain: 0.013,
    noiseFilter: 205,
    lfo1Rate: 1 / 54,
    lfo1Depth: 0.016,
    lfo2Rate: 1 / 96,
    lfo2Depth: 34,
  },
  reflection: {
    key: 'reflection',
    label: 'Reflection',
    reason: 'A warmer, slower profile for the personal side of the portfolio. It supports reflection more than performance.',
    gain: 0.027,
    notes: [174.61, 220, 261.63],
    noteGains: [0.095, 0.066, 0.053],
    detune: [1, -2, 2],
    filterFrequency: 238,
    filterQ: 0.18,
    noiseGain: 0.019,
    noiseFilter: 185,
    lfo1Rate: 1 / 68,
    lfo1Depth: 0.019,
    lfo2Rate: 1 / 92,
    lfo2Depth: 32,
  },
  readingRoom: {
    key: 'readingRoom',
    label: 'Reading Room',
    reason: 'The quietest profile in the set. It is there to hold the pace of the page without fighting the text.',
    gain: 0.021,
    notes: [98, 146.83, 196],
    noteGains: [0.082, 0.052, 0.043],
    detune: [-1, 1, -2],
    filterFrequency: 208,
    filterQ: 0.14,
    noiseGain: 0.009,
    noiseFilter: 165,
    lfo1Rate: 1 / 74,
    lfo1Depth: 0.011,
    lfo2Rate: 1 / 118,
    lfo2Depth: 18,
  },
  exhibit: {
    key: 'exhibit',
    label: 'Exhibit',
    reason: 'A slightly more textural room tone for experimental work. It makes the page feel installed, not just presented.',
    gain: 0.029,
    notes: [110, 164.81, 207.65],
    noteGains: [0.098, 0.064, 0.05],
    detune: [-3, 1, 2],
    filterFrequency: 226,
    filterQ: 0.2,
    noiseGain: 0.021,
    noiseFilter: 180,
    lfo1Rate: 1 / 62,
    lfo1Depth: 0.017,
    lfo2Rate: 1 / 82,
    lfo2Depth: 36,
  },
  stage: {
    key: 'stage',
    label: 'Stage',
    reason: 'A darker, more spatial bed for installations and physical builds. It adds room tone without becoming soundtrack.',
    gain: 0.029,
    notes: [98, 146.83, 174.61],
    noteGains: [0.102, 0.062, 0.046],
    detune: [-2, 2, -1],
    filterFrequency: 215,
    filterQ: 0.24,
    noiseGain: 0.024,
    noiseFilter: 170,
    lfo1Rate: 1 / 64,
    lfo1Depth: 0.016,
    lfo2Rate: 1 / 86,
    lfo2Depth: 40,
  },
  surface: {
    key: 'surface',
    label: 'Surface',
    reason: 'A tighter, cleaner profile for graphic and brand-led work. The goal is polish, rhythm, and restraint.',
    gain: 0.025,
    notes: [164.81, 220, 261.63],
    noteGains: [0.088, 0.056, 0.046],
    detune: [0, -1, 2],
    filterFrequency: 274,
    filterQ: 0.14,
    noiseGain: 0.01,
    noiseFilter: 200,
    lfo1Rate: 1 / 72,
    lfo1Depth: 0.012,
    lfo2Rate: 1 / 112,
    lfo2Depth: 22,
  },
  civic: {
    key: 'civic',
    label: 'Civic',
    reason: 'A warmer, more open tone for public-interest work. It should feel clear, humane, and lightly optimistic.',
    gain: 0.027,
    notes: [130.81, 174.61, 207.65],
    noteGains: [0.1, 0.068, 0.05],
    detune: [1, -1, 2],
    filterFrequency: 248,
    filterQ: 0.18,
    noiseGain: 0.016,
    noiseFilter: 188,
    lfo1Rate: 1 / 60,
    lfo1Depth: 0.015,
    lfo2Rate: 1 / 94,
    lfo2Depth: 26,
  },
  afterhours: {
    key: 'afterhours',
    label: 'Afterhours',
    reason: 'A lower, dimmer profile for archive-like or off-axis material. It lets the page feel more nocturnal and private.',
    gain: 0.024,
    notes: [87.31, 130.81, 174.61],
    noteGains: [0.09, 0.057, 0.043],
    detune: [-2, 1, -1],
    filterFrequency: 205,
    filterQ: 0.24,
    noiseGain: 0.018,
    noiseFilter: 160,
    lfo1Rate: 1 / 78,
    lfo1Depth: 0.013,
    lfo2Rate: 1 / 104,
    lfo2Depth: 20,
  },
  lab: {
    key: 'lab',
    label: 'Lab',
    reason: 'A slightly more active bed for tools and experiments. It keeps the page exploratory without turning playful.',
    gain: 0.026,
    notes: [146.83, 196, 246.94],
    noteGains: [0.094, 0.06, 0.048],
    detune: [2, -1, 1],
    filterFrequency: 286,
    filterQ: 0.19,
    noiseGain: 0.012,
    noiseFilter: 195,
    lfo1Rate: 1 / 44,
    lfo1Depth: 0.018,
    lfo2Rate: 1 / 72,
    lfo2Depth: 24,
  },
}

const CATEGORY_PROFILE_KEYS: Record<ProjectCategory, AmbientProfileKey> = {
  ux: 'focus',
  research: 'focus',
  ai: 'signal',
  creative: 'exhibit',
  install: 'stage',
  brand: 'surface',
  good: 'civic',
}

const ROUTE_PROFILE_KEYS: Record<string, AmbientProfileKey> = {
  '/': 'arrival',
  '/work': 'focus',
  '/about': 'reflection',
  '/book': 'readingRoom',
  '/graveyard': 'afterhours',
  '/studio': 'lab',
  '/ai': 'signal',
  '/ux': 'focus',
  '/ux-design': 'focus',
  '/design-engineering': 'focus',
  '/ux-research': 'focus',
  '/ui': 'focus',
  '/design-engineer': 'focus',
  '/creative-tech': 'focus',
  '/installations': 'stage',
  '/brand': 'surface',
  '/brand-visual': 'surface',
  '/healthcare': 'civic',
  '/design-for-good': 'civic',
  '/fintech': 'focus',
  '/crypto': 'signal',
  '/ai-wearables': 'signal',
}

const ROUTE_LABELS: Partial<Record<string, string>> = {
  '/ai': 'AI & Wearables',
  '/ux': 'UX Design',
  '/ux-design': 'UX Design',
  '/design-engineering': 'Design Engineering',
  '/ux-research': 'UX Research',
  '/ui': 'UX Design',
  '/design-engineer': 'Design Engineering',
  '/creative-tech': 'Design Engineering',
  '/installations': 'Installations',
  '/brand': 'Brand & Visual',
  '/brand-visual': 'Brand & Visual',
  '/healthcare': 'Design for Good',
  '/design-for-good': 'Design for Good',
  '/fintech': 'Fintech',
  '/crypto': 'Crypto',
  '/ai-wearables': 'AI Wearables',
}

function tune(ctx: BaseAudioContext, param: AudioParam, target: number, dur: number) {
  const t = ctx.currentTime
  param.cancelScheduledValues(t)
  param.setValueAtTime(param.value, t)
  param.linearRampToValueAtTime(target, t + dur)
}

function getPageLabel(pathname: string): string {
  if (pathname === '/') return 'Home'
  if (pathname === '/work') return 'Work'
  if (pathname === '/about') return 'About'
  if (pathname === '/book') return 'Book'
  if (pathname === '/graveyard') return 'Graveyard'
  if (pathname === '/studio') return 'Studio'
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]

  const category = CATEGORY_ROUTE_CATEGORY[pathname]
  if (category) return CATEGORY_LABELS[category]

  const slug = pathname.replace(/^\/+/, '').split('/')[0]
  const project = getProject(slug)
  if (project) return project.name

  return 'This page'
}

const CATEGORY_ROUTE_CATEGORY: Partial<Record<string, ProjectCategory>> = {
  '/ai': 'ai',
  '/ux': 'ux',
  '/ux-design': 'ux',
  '/design-engineering': 'ux',
  '/ux-research': 'research',
  '/ui': 'ux',
  '/design-engineer': 'ux',
  '/creative-tech': 'ux',
  '/installations': 'install',
  '/brand': 'brand',
  '/brand-visual': 'brand',
  '/healthcare': 'good',
  '/design-for-good': 'good',
}

function getAmbientProfile(pathname: string): AmbientProfile {
  const routeProfileKey = ROUTE_PROFILE_KEYS[pathname]
  if (routeProfileKey) return AMBIENT_PROFILES[routeProfileKey]

  const slug = pathname.replace(/^\/+/, '').split('/')[0]
  const project = getProject(slug)
  if (project) return AMBIENT_PROFILES[CATEGORY_PROFILE_KEYS[project.category]]

  return AMBIENT_PROFILES.focus
}

function getAudibleGain(profile: AmbientProfile) {
  return Math.min(profile.gain * AMBIENT_GAIN_BOOST, MAX_AMBIENT_GAIN)
}

/** Very soft brown noise — distant rain / air */
function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const seconds = 5
  const length = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let prev = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    prev = (prev + 0.01 * white) / 1.01
    data[i] = prev * 0.4
  }
  return buffer
}

function buildRig(profile: AmbientProfile): AmbientRig {
  const ctx = new AudioContext()

  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  // Everything passes through a very dark filter — like hearing through a wall
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = profile.filterFrequency
  lp.Q.value = profile.filterQ
  lp.connect(master)

  const oscs: [OscillatorNode, OscillatorNode, OscillatorNode] = [
    ctx.createOscillator(),
    ctx.createOscillator(),
    ctx.createOscillator(),
  ]
  const gains: [GainNode, GainNode, GainNode] = [
    ctx.createGain(),
    ctx.createGain(),
    ctx.createGain(),
  ]

  profile.notes.forEach((freq, index) => {
    const osc = oscs[index]
    const gain = gains[index]
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.detune.value = profile.detune[index]
    gain.gain.value = profile.noteGains[index]
    osc.connect(gain)
    gain.connect(lp)
    osc.start()
  })

  // ── Noise: barely-there texture ──
  const noise = ctx.createBufferSource()
  noise.buffer = createNoiseBuffer(ctx)
  noise.loop = true
  const noiseLp = ctx.createBiquadFilter()
  noiseLp.type = 'lowpass'
  noiseLp.frequency.value = profile.noiseFilter
  noiseLp.Q.value = 0.1
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = profile.noiseGain
  noise.connect(noiseLp)
  noiseLp.connect(noiseGain)
  noiseGain.connect(master)
  noise.start()

  // ── LFO 1: slow volume breathing on the chord ──
  const lfo1 = ctx.createOscillator()
  lfo1.type = 'sine'
  lfo1.frequency.value = profile.lfo1Rate
  const lfo1Gain = ctx.createGain()
  lfo1Gain.gain.value = profile.lfo1Depth
  lfo1.connect(lfo1Gain)
  for (const g of gains) lfo1Gain.connect(g.gain)
  lfo1.start()

  // ── LFO 2: glacial filter sweep ──
  const lfo2 = ctx.createOscillator()
  lfo2.type = 'sine'
  lfo2.frequency.value = profile.lfo2Rate
  const lfo2Gain = ctx.createGain()
  lfo2Gain.gain.value = profile.lfo2Depth
  lfo2.connect(lfo2Gain)
  lfo2Gain.connect(lp.frequency)
  lfo2.start()

  return {
    ctx, master,
    filter: lp,
    noteGains: gains,
    noiseGain,
    noiseFilter: noiseLp,
    lfo1Gain,
    lfo2Gain,
    osc1: oscs[0], osc2: oscs[1], osc3: oscs[2],
    noise, lfo1, lfo2,
  }
}

function fade(g: GainNode, target: number, dur: number) {
  const t = g.context.currentTime
  g.gain.cancelScheduledValues(t)
  g.gain.setValueAtTime(g.gain.value, t)
  g.gain.linearRampToValueAtTime(target, t + dur)
}

export default function AmbientAudio() {
  const { pathname } = useLocation()
  const rigRef = useRef<AmbientRig | null>(null)
  const suspendTimerRef = useRef<number | null>(null)
  const noteTimerRef = useRef<number | null>(null)
  const startedRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [noteVisible, setNoteVisible] = useState(false)
  const [muted, setMuted] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored === null ? true : stored === '1'
    } catch {
      return true
    }
  })
  const profile = getAmbientProfile(pathname)
  const pageLabel = getPageLabel(pathname)

  const ensureRig = useCallback((initialProfile: AmbientProfile) => {
    if (!rigRef.current) rigRef.current = buildRig(initialProfile)
    return rigRef.current
  }, [])

  const retune = useCallback((nextProfile: AmbientProfile, dur = 2.4) => {
    const rig = rigRef.current
    if (!rig) return

    const oscillators = [rig.osc1, rig.osc2, rig.osc3] as const
    oscillators.forEach((osc, index) => {
      tune(rig.ctx, osc.frequency, nextProfile.notes[index], dur)
      tune(rig.ctx, osc.detune, nextProfile.detune[index], dur)
      tune(rig.ctx, rig.noteGains[index].gain, nextProfile.noteGains[index], dur)
    })

    tune(rig.ctx, rig.filter.frequency, nextProfile.filterFrequency, dur)
    tune(rig.ctx, rig.filter.Q, nextProfile.filterQ, dur)
    tune(rig.ctx, rig.noiseGain.gain, nextProfile.noiseGain, dur)
    tune(rig.ctx, rig.noiseFilter.frequency, nextProfile.noiseFilter, dur)
    tune(rig.ctx, rig.lfo1.frequency, nextProfile.lfo1Rate, dur)
    tune(rig.ctx, rig.lfo1Gain.gain, nextProfile.lfo1Depth, dur)
    tune(rig.ctx, rig.lfo2.frequency, nextProfile.lfo2Rate, dur)
    tune(rig.ctx, rig.lfo2Gain.gain, nextProfile.lfo2Depth, dur)
  }, [])

  const showNoteTemporarily = useCallback((duration = 3600) => {
    setNoteVisible(true)
    if (noteTimerRef.current) window.clearTimeout(noteTimerRef.current)
    noteTimerRef.current = window.setTimeout(() => {
      setNoteVisible(false)
      noteTimerRef.current = null
    }, duration)
  }, [])

  const resume = useCallback(async () => {
    const rig = ensureRig(profile)
    if (suspendTimerRef.current) { window.clearTimeout(suspendTimerRef.current); suspendTimerRef.current = null }
    await rig.ctx.resume()
    retune(profile, 1.8)
    fade(rig.master, getAudibleGain(profile), 4)
    setPlaying(true)
    showNoteTemporarily()
  }, [ensureRig, profile, retune, showNoteTemporarily])

  const pause = useCallback(async () => {
    const rig = rigRef.current
    if (!rig) return
    fade(rig.master, 0, 2.5)
    setPlaying(false)
    setNoteVisible(false)
    if (noteTimerRef.current) { window.clearTimeout(noteTimerRef.current); noteTimerRef.current = null }
    if (suspendTimerRef.current) window.clearTimeout(suspendTimerRef.current)
    suspendTimerRef.current = window.setTimeout(() => { void rig.ctx.suspend(); suspendTimerRef.current = null }, 2800)
  }, [])

  const firstGesture = useCallback(() => {
    if (muted) return
    startedRef.current = true
    void resume()
  }, [muted, resume])

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, muted ? '1' : '0') } catch {} }, [muted])

  useEffect(() => {
    retune(profile, 2.6)
    if (playing && rigRef.current) {
      fade(rigRef.current.master, getAudibleGain(profile), 2.4)
      showNoteTemporarily(2600)
    }
  }, [playing, profile, retune, showNoteTemporarily])

  useEffect(() => {
    if (muted) return
    // Explicit opt-in only — no scroll trigger (scroll feels surprising)
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart']
    const opts: AddEventListenerOptions = { passive: true, once: true }
    const trigger = () => firstGesture()
    for (const e of events) window.addEventListener(e, trigger, opts)
    return () => { for (const e of events) window.removeEventListener(e, trigger) }
  }, [muted, firstGesture])

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'hidden') void pause()
      else if (!muted && startedRef.current && rigRef.current) void resume()
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [muted, pause, resume])

  useEffect(() => () => {
    if (suspendTimerRef.current) window.clearTimeout(suspendTimerRef.current)
    if (noteTimerRef.current) window.clearTimeout(noteTimerRef.current)
    const rig = rigRef.current
    if (!rig) return
    rig.osc1.stop(); rig.osc2.stop(); rig.osc3.stop()
    rig.noise.stop(); rig.lfo1.stop(); rig.lfo2.stop()
    void rig.ctx.close()
    rigRef.current = null
  }, [])

  const toggle = useCallback(() => {
    if (playing) { setMuted(true); void pause(); return }
    startedRef.current = true; setMuted(false); void resume()
  }, [pause, playing, resume])

  // Bridge for the Figma panel: it hosts its own music button while the nav is hidden.
  useEffect(() => {
    const onToggle = () => toggle()
    window.addEventListener('ambient:toggle', onToggle)
    return () => window.removeEventListener('ambient:toggle', onToggle)
  }, [toggle])
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ambient:state', { detail: { playing } }))
  }, [playing])

  return (
    <div className={`ambient-ui${playing ? ' is-active' : ''}${noteVisible ? ' is-note-visible' : ''}`}>
      <button
        className={`ambient-toggle surface-glass surface-glass--subtle figma-hover${playing ? ' is-active surface-glass--active' : ''}`}
        onClick={toggle}
        type="button"
        aria-label={playing ? 'Pause ambient sound' : 'Play ambient sound'}
        aria-pressed={playing}
      >
        <svg className="ambient-toggle__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {playing ? (
            <>
              <path d="M4 10.4v3.2c0 .5.4.9.9.9h2.5l4 3.2c.6.5 1.5.1 1.5-.7V7c0-.8-.9-1.2-1.5-.7l-4 3.2H4.9c-.5 0-.9.4-.9.9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path className="ambient-toggle__wave ambient-toggle__wave--inner" d="M16 9.4c.7.7 1 1.5 1 2.6s-.3 1.9-1 2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path className="ambient-toggle__wave ambient-toggle__wave--outer" d="M18.4 7c1.2 1.3 1.8 2.9 1.8 5s-.6 3.7-1.8 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.7" />
            </>
          ) : (
            <>
              <path d="M4 10.4v3.2c0 .5.4.9.9.9h2.5l4 3.2c.6.5 1.5.1 1.5-.7V7c0-.8-.9-1.2-1.5-.7l-4 3.2H4.9c-.5 0-.9.4-.9.9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="m17 9 4 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="m21 9-4 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>
      <div
        className="ambient-note surface-glass surface-glass--subtle"
        aria-live="polite"
      >
        <p className="ambient-note__title">{pageLabel} / {profile.label}</p>
        <p className="ambient-note__body">
          {playing ? profile.reason : `${profile.reason} Turn it on to hear the page-specific bed.`}
        </p>
      </div>
    </div>
  )
}
