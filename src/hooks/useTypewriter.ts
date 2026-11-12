import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Word-by-word typewriter reveal.
 * Splits on whitespace but keeps markdown tokens (**bold**, [link](/path)) intact.
 * Uses RAF + timestamp for smooth timing independent of frame rate.
 */

// Tokenize: split into words but keep markdown constructs as single tokens
function tokenize(text: string): string[] {
  const tokens: string[] = []
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\S+)/g
  let match: RegExpExecArray | null
  let lastIndex = 0

  while ((match = regex.exec(text)) !== null) {
    // Capture any whitespace before this token
    if (match.index > lastIndex) {
      const ws = text.slice(lastIndex, match.index)
      if (tokens.length > 0) {
        tokens[tokens.length - 1] += ws
      }
    }
    tokens.push(match[0])
    lastIndex = match.index + match[0].length
  }

  // Trailing whitespace
  if (lastIndex < text.length && tokens.length > 0) {
    tokens[tokens.length - 1] += text.slice(lastIndex)
  }

  return tokens
}

interface UseTypewriterOptions {
  text: string
  speed?: number     // ms per word (default 35)
  enabled?: boolean  // false = show full text immediately
}

export function useTypewriter({ text, speed = 35, enabled = true }: UseTypewriterOptions) {
  const [wordIndex, setWordIndex] = useState(0)
  const [done, setDone] = useState(!enabled)
  const tokensRef = useRef<string[]>([])
  const prevTextRef = useRef('')
  const rafRef = useRef(0)
  const lastTickRef = useRef(0)

  // When text changes, re-tokenize but preserve already-shown words
  useEffect(() => {
    if (!enabled) {
      setDone(true)
      return
    }

    const newTokens = tokenize(text)
    tokensRef.current = newTokens

    // If text grew (streaming), keep current index, just update tokens
    if (text.startsWith(prevTextRef.current) && wordIndex > 0) {
      // Text grew, continue from where we are
      if (wordIndex >= newTokens.length) {
        setDone(true)
      } else {
        setDone(false)
      }
    } else if (text !== prevTextRef.current) {
      // Completely new text, restart
      setWordIndex(0)
      setDone(false)
    }

    prevTextRef.current = text
  }, [text, enabled, wordIndex])

  // RAF loop to advance words
  useEffect(() => {
    if (done || !enabled) return

    const tokens = tokensRef.current
    if (wordIndex >= tokens.length) {
      setDone(true)
      return
    }

    lastTickRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - lastTickRef.current
      if (elapsed >= speed) {
        lastTickRef.current = now
        setWordIndex(prev => {
          const next = prev + 1
          if (next >= tokensRef.current.length) {
            setDone(true)
            return next
          }
          return next
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [done, enabled, speed, wordIndex])

  const skip = useCallback(() => {
    setWordIndex(tokensRef.current.length)
    setDone(true)
  }, [])

  // Build displayed text from tokens up to wordIndex
  const displayed = tokensRef.current.slice(0, wordIndex).join(' ')

  return {
    displayed: done ? text : displayed,
    isTyping: !done && enabled,
    skip,
  }
}
