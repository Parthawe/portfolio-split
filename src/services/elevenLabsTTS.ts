/**
 * ElevenLabs TTS service.
 *
 * Uses the v1 text-to-speech streaming API.
 * Falls back gracefully when no API key is configured.
 *
 * Voice: "Rachel" (21m00Tcm4TlvDq8ikWAM) — warm, clear, conversational.
 * Model: eleven_multilingual_v2 — best quality, natural prosody.
 *
 * Audio is cached in-memory per text hash to minimize API calls.
 * A portfolio visitor typically triggers <20 unique utterances per session.
 */

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined

// Rachel — warm, articulate, slightly editorial. Perfect for a design portfolio guide.
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string || '21m00Tcm4TlvDq8ikWAM'
const MODEL_ID = 'eleven_multilingual_v2'
const API_BASE = 'https://api.elevenlabs.io/v1'

export const isElevenLabsAvailable = !!API_KEY

interface VoiceSettings {
  stability: number          // 0-1. Higher = more consistent, lower = more expressive
  similarity_boost: number   // 0-1. Higher = closer to original voice
  style: number              // 0-1. Style exaggeration
  use_speaker_boost: boolean
}

type SpeakMode = 'reply' | 'tour' | 'confirm'

const VOICE_PROFILES: Record<SpeakMode, VoiceSettings> = {
  reply: {
    stability: 0.45,
    similarity_boost: 0.78,
    style: 0.35,
    use_speaker_boost: true,
  },
  tour: {
    stability: 0.55,       // More stable for guided narration
    similarity_boost: 0.80,
    style: 0.25,           // Less stylized, more neutral
    use_speaker_boost: true,
  },
  confirm: {
    stability: 0.60,       // Quick confirmations should be crisp
    similarity_boost: 0.75,
    style: 0.15,
    use_speaker_boost: false,
  },
}

// In-memory audio cache — avoids re-fetching the same phrases
const audioCache = new Map<string, ArrayBuffer>()
const MAX_CACHE = 50

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return hash.toString(36)
}

function cacheKey(text: string, mode: SpeakMode): string {
  return `${mode}:${simpleHash(text)}`
}

function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')       // strip bold markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // strip links, keep label
    .replace(/\[EXPORT\]\n?/g, '')             // strip export prefix
    .replace(/[•▪◦]/g, '. ')
    .replace(/[→↗]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .trim()
}

async function fetchAudio(text: string, mode: SpeakMode): Promise<ArrayBuffer> {
  const key = cacheKey(text, mode)
  const cached = audioCache.get(key)
  if (cached) return cached

  const settings = VOICE_PROFILES[mode]

  const response = await fetch(`${API_BASE}/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY!,
    },
    body: JSON.stringify({
      text: cleanForSpeech(text),
      model_id: MODEL_ID,
      voice_settings: settings,
    }),
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  const buffer = await response.arrayBuffer()

  // Cache management — evict oldest if full
  if (audioCache.size >= MAX_CACHE) {
    const firstKey = audioCache.keys().next().value
    if (firstKey) audioCache.delete(firstKey)
  }
  audioCache.set(key, buffer)

  return buffer
}

let sessionId = 0
let currentAudioCtx: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null

/**
 * Speak text using ElevenLabs.
 * Returns a promise that resolves when speech finishes.
 * Call cancel() to stop early.
 */
export async function speak(
  text: string,
  options?: { mode?: SpeakMode; onStart?: () => void; onEnd?: () => void }
): Promise<void> {
  const mode = options?.mode || 'reply'
  const cleaned = cleanForSpeech(text)
  if (!cleaned || !API_KEY) return

  // Cancel any current playback and claim this session
  cancel()
  const mySession = ++sessionId

  try {
    const audioData = await fetchAudio(text, mode)

    // Check if we were cancelled during fetch
    if (mySession !== sessionId) return

    // Close any lingering context before creating a new one
    if (currentAudioCtx && currentAudioCtx.state !== 'closed') {
      void currentAudioCtx.close()
    }
    const ctx = new AudioContext()
    currentAudioCtx = ctx

    const audioBuffer = await ctx.decodeAudioData(audioData.slice(0))

    // Check again after decode
    if (mySession !== sessionId) {
      void ctx.close()
      return
    }

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer

    const gain = ctx.createGain()
    gain.gain.value = 0.85
    source.connect(gain)
    gain.connect(ctx.destination)

    currentSource = source

    return new Promise<void>((resolve) => {
      source.onended = () => {
        options?.onEnd?.()
        // Only clean up if we're still the active session
        if (mySession === sessionId) {
          currentSource = null
          currentAudioCtx = null
        }
        void ctx.close()
        resolve()
      }

      options?.onStart?.()
      source.start()
    })
  } catch (err) {
    if (import.meta.env.DEV) console.warn('ElevenLabs TTS failed:', err)
    if (mySession === sessionId) {
      currentSource = null
      if (currentAudioCtx) {
        void currentAudioCtx.close()
        currentAudioCtx = null
      }
    }
  }
}

export function cancel() {
  sessionId++
  if (currentSource) {
    try { currentSource.stop() } catch {}
    currentSource = null
  }
  if (currentAudioCtx) {
    void currentAudioCtx.close()
    currentAudioCtx = null
  }
}
