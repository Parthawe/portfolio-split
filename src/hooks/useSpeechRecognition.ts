import { useState, useRef, useCallback } from 'react'

/**
 * Web Speech Recognition hook.
 * Returns a toggle function, listening state, and transcript.
 * Falls back gracefully if not supported.
 */

// Type the Web Speech API (not in all TS libs)
interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } }; length: number }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [denied, setDenied] = useState(false)
  const recRef = useRef<SpeechRecognitionInstance | null>(null)

  const supported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  const stop = useCallback(() => {
    if (recRef.current) {
      recRef.current.stop()
      setListening(false)
    }
  }, [])

  const start = useCallback(() => {
    if (!supported || denied) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0]?.[0]?.transcript
      if (transcript) onResult(transcript)
      setListening(false)
    }

    rec.onerror = (e: Event) => {
      setListening(false)
      // Handle permission denied specifically
      const error = (e as Event & { error?: string }).error
      if (error === 'not-allowed' || error === 'service-not-allowed') {
        setDenied(true)
      }
    }
    rec.onend = () => setListening(false)

    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
      setDenied(true)
    }
  }, [supported, denied, onResult])

  const toggle = useCallback(() => {
    if (listening) {
      stop()
    } else {
      start()
    }
  }, [listening, start, stop])

  return { start, stop, toggle, listening, supported: supported && !denied, denied }
}
