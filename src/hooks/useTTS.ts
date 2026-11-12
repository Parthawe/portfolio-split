import { useRef, useCallback, useState, useEffect } from 'react'
import {
  isElevenLabsAvailable,
  speak as elevenLabsSpeak,
  cancel as elevenLabsCancel,
} from '../services/elevenLabsTTS'

type SpeakMode = 'reply' | 'tour' | 'confirm'

interface SpeakOptions {
  mode?: SpeakMode
}

/* ══════════════════════════════════════════════════════════
   Browser SpeechSynthesis fallback
   ══════════════════════════════════════════════════════════ */

const PREFERRED_VOICE_HINTS = [
  'Samantha', 'Karen', 'Eddy', 'Daniel', 'Rishi', 'Moira', 'Tessa',
  'Google US English', 'Google UK English Female', 'Google UK English Male',
  'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Sonia', 'Microsoft Ana',
  'Microsoft Davis', 'Aaron', 'Alex',
]

const NOVELTY_VOICE_HINTS = [
  'Fred', 'Whisper', 'Zarvox', 'Bells', 'Boing', 'Trinoids', 'Albert',
  'Bad News', 'Bahh', 'Bubbles', 'Cellos', 'Deranged', 'Good News',
  'Jester', 'Organ', 'Superstar', 'Wobble',
]

function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[EXPORT\]\n?/g, '')
    .replace(/[•▪◦]/g, '. ')
    .replace(/[→↗]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .trim()
}

function splitIntoChunks(text: string): string[] {
  const cleaned = cleanForSpeech(text)
  if (!cleaned) return []

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map(chunk => chunk.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if (!current) { current = sentence; continue }
    if (`${current} ${sentence}`.length > 180) {
      chunks.push(current)
      current = sentence
      continue
    }
    current = `${current} ${sentence}`
  }

  if (current) chunks.push(current)
  return chunks
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()

  if (!lang.startsWith('en')) return -1000

  let score = 0
  if (voice.localService) score += 5
  if (lang.startsWith('en-us')) score += 4
  else if (lang.startsWith('en-gb') || lang.startsWith('en-in')) score += 3
  else score += 2

  const preferredIndex = PREFERRED_VOICE_HINTS.findIndex(hint => voice.name.includes(hint))
  if (preferredIndex >= 0) score += 22 - preferredIndex

  if (NOVELTY_VOICE_HINTS.some(hint => voice.name.includes(hint))) score -= 25
  if (/compact|espeak|festival|mbrola/.test(name)) score -= 12
  if (/google|microsoft|apple/.test(name)) score += 4

  return score
}

function getBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null
}

function getBrowserProfile(mode: SpeakMode) {
  if (mode === 'tour') return { rate: 0.92, pitch: 1.01, volume: 0.9, pause: 180 }
  if (mode === 'confirm') return { rate: 0.98, pitch: 1, volume: 0.88, pause: 120 }
  return { rate: 0.96, pitch: 1, volume: 0.9, pause: 140 }
}

/* ══════════════════════════════════════════════════════════
   Hook
   ══════════════════════════════════════════════════════════ */

export function useTTS() {
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem('folio-tts-muted') === '1' } catch { return false }
  })
  const [speaking, setSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const sessionRef = useRef(0)

  useEffect(() => {
    try { localStorage.setItem('folio-tts-muted', muted ? '1' : '0') } catch {}
  }, [muted])

  // Load browser voices (only needed for fallback)
  useEffect(() => {
    if (isElevenLabsAvailable) return
    if (typeof window === 'undefined' || typeof speechSynthesis === 'undefined') return

    const syncVoices = () => setVoices(speechSynthesis.getVoices())
    syncVoices()
    speechSynthesis.addEventListener?.('voiceschanged', syncVoices)
    return () => speechSynthesis.removeEventListener?.('voiceschanged', syncVoices)
  }, [])

  /** Speak using ElevenLabs (primary) or browser SpeechSynthesis (fallback) */
  const speakAsync = useCallback((text: string, options?: SpeakOptions): Promise<void> => {
    const mode = options?.mode || 'reply'

    // ── ElevenLabs path ──
    if (isElevenLabsAvailable) {
      return new Promise(resolve => {
        if (muted) {
          // When muted, simulate timing so tour/conversation pacing works
          const cleaned = cleanForSpeech(text)
          setTimeout(resolve, Math.max(700, cleaned.length * 16))
          return
        }

        const runId = ++sessionRef.current

        elevenLabsSpeak(text, {
          mode,
          onStart: () => {
            if (runId === sessionRef.current) setSpeaking(true)
          },
          onEnd: () => {
            if (runId === sessionRef.current) setSpeaking(false)
            resolve()
          },
        }).then(() => {
          if (runId === sessionRef.current) setSpeaking(false)
          resolve()
        }).catch(() => {
          // ElevenLabs failed — fall through silently
          setSpeaking(false)
          resolve()
        })
      })
    }

    // ── Browser SpeechSynthesis fallback ──
    const profile = getBrowserProfile(mode)

    return new Promise(resolve => {
      if (typeof speechSynthesis === 'undefined') {
        setTimeout(resolve, Math.max(900, text.length * 22))
        return
      }

      const chunks = splitIntoChunks(text)
      if (muted || chunks.length === 0) {
        setTimeout(resolve, Math.max(700, chunks.join(' ').length * 18))
        return
      }

      const runId = ++sessionRef.current
      const selectedVoice = getBestVoice(voices.length ? voices : speechSynthesis.getVoices())
      let index = 0

      speechSynthesis.cancel()

      const speakChunk = () => {
        if (runId !== sessionRef.current) {
          setSpeaking(false)
          resolve()
          return
        }

        const chunk = chunks[index]
        if (!chunk) {
          setSpeaking(false)
          resolve()
          return
        }

        const utterance = new SpeechSynthesisUtterance(chunk)
        utterance.lang = selectedVoice?.lang || 'en-US'
        if (selectedVoice) utterance.voice = selectedVoice
        utterance.rate = profile.rate
        utterance.pitch = profile.pitch
        utterance.volume = profile.volume

        utterance.onstart = () => {
          if (runId === sessionRef.current) setSpeaking(true)
        }

        utterance.onend = () => {
          if (runId !== sessionRef.current) {
            setSpeaking(false)
            resolve()
            return
          }

          index += 1
          if (index >= chunks.length) {
            setSpeaking(false)
            resolve()
            return
          }

          window.setTimeout(speakChunk, profile.pause)
        }

        utterance.onerror = () => {
          setSpeaking(false)
          resolve()
        }

        utteranceRef.current = utterance

        try {
          speechSynthesis.speak(utterance)
        } catch {
          setSpeaking(false)
          resolve()
        }
      }

      speakChunk()
    })
  }, [muted, voices])

  const speak = useCallback((text: string, options?: SpeakOptions) => {
    void speakAsync(text, options)
  }, [speakAsync])

  const cancel = useCallback(() => {
    sessionRef.current += 1

    if (isElevenLabsAvailable) {
      elevenLabsCancel()
    }

    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
    }

    setSpeaking(false)
  }, [])

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      if (!prev) {
        // Muting — stop current playback
        sessionRef.current += 1
        if (isElevenLabsAvailable) elevenLabsCancel()
        if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
      }
      return !prev
    })
  }, [])

  return { speak, speakAsync, cancel, muted, speaking, toggleMute }
}
