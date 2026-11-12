import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { getProject } from '../data/projects'
import { CONTACT_EMAIL } from '../config/site'
import '../styles/nda-gate.css'

interface NdaGateProps {
  slug: string
  delivery?: 'existing' | 'withheld'
  children?: ReactNode
  compact?: boolean
  hideWhenLocked?: boolean
  unlockedMode?: 'section' | 'flow'
}

const NDA_UNLOCK_EVENT = 'portfolio-nda-unlocked'

const GLOBAL_ACCESS_HASH = import.meta.env.VITE_NDA_ACCESS_SHA256?.trim().toLowerCase()
const PLAIN_ACCESS_CODE = import.meta.env.VITE_NDA_ACCESS_CODE?.trim()

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]

const rotateRight = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits))

function sha256HexFallback(value: string) {
  const bytes = Array.from(new TextEncoder().encode(value))
  const bitLength = bytes.length * 8
  bytes.push(0x80)
  while (bytes.length % 64 !== 56) bytes.push(0)
  for (let i = 7; i >= 0; i -= 1) bytes.push((bitLength / (2 ** (i * 8))) & 0xff)

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]
  const words = new Array<number>(64)

  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      const j = offset + i * 4
      words[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotateRight(words[i - 15], 7) ^ rotateRight(words[i - 15], 18) ^ (words[i - 15] >>> 3)
      const s1 = rotateRight(words[i - 2], 17) ^ rotateRight(words[i - 2], 19) ^ (words[i - 2] >>> 10)
      words[i] = (words[i - 16] + s0 + words[i - 7] + s1) >>> 0
    }

    let [a, b, c, d, e, f, g, h] = hash
    for (let i = 0; i < 64; i += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + s1 + ch + SHA256_K[i] + words[i]) >>> 0
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (s0 + maj) >>> 0
      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    hash[0] = (hash[0] + a) >>> 0
    hash[1] = (hash[1] + b) >>> 0
    hash[2] = (hash[2] + c) >>> 0
    hash[3] = (hash[3] + d) >>> 0
    hash[4] = (hash[4] + e) >>> 0
    hash[5] = (hash[5] + f) >>> 0
    hash[6] = (hash[6] + g) >>> 0
    hash[7] = (hash[7] + h) >>> 0
  }

  return hash.map(part => part.toString(16).padStart(8, '0')).join('')
}

async function sha256Hex(value: string) {
  if (!window.crypto?.subtle) return sha256HexFallback(value)
  const data = new TextEncoder().encode(value)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

function getStoredAccess(slug: string) {
  if (typeof window === 'undefined' || !window.sessionStorage) return null
  try {
    return window.sessionStorage.getItem(`portfolio-nda-access:${slug}`)
  } catch {
    return null
  }
}

function storeAccess(slug: string, hash: string) {
  if (typeof window === 'undefined' || !window.sessionStorage) return
  try {
    window.sessionStorage.setItem(`portfolio-nda-access:${slug}`, hash)
  } catch {
    // Storage can be disabled in strict browsers. The current React state still
    // unlocks the page; the user may just need to re-enter the code on reload.
  }
}

export default function NdaGate({
  slug,
  delivery = 'existing',
  children,
  compact = false,
  hideWhenLocked = false,
  unlockedMode = 'section',
}: NdaGateProps) {
  const project = getProject(slug)
  const projectName = project?.name || 'this project'
  const [email, setEmail] = useState('')
  const [context, setContext] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [codeMessage, setCodeMessage] = useState('')
  const [draftOpened, setDraftOpened] = useState(false)
  const [requestCopy, setRequestCopy] = useState<'idle' | 'copied' | 'manual'>('idle')
  const requestRevision = useRef(0)
  // The stored value is the SHA-256 of the accepted code, re-checked against
  // the configured hash — so a rotated reviewer code invalidates old grants,
  // and the literal value to forge is at least not a guessable constant.
  // This remains a client-side UX layer, not real protection (see ACCESS_MODEL.md).
  const [verified, setVerified] = useState(() => {
    const stored = getStoredAccess(slug)
    return Boolean(stored && GLOBAL_ACCESS_HASH && stored === GLOBAL_ACCESS_HASH)
  })

  useEffect(() => {
    const handleUnlock = (event: Event) => {
      const unlockedSlug = (event as CustomEvent<{ slug?: string }>).detail?.slug
      if (unlockedSlug === slug) setVerified(true)
    }

    window.addEventListener(NDA_UNLOCK_EVENT, handleUnlock)
    return () => window.removeEventListener(NDA_UNLOCK_EVENT, handleUnlock)
  }, [slug])

  const requestDraft = useMemo(() => {
    const subject = `Access request: ${projectName}`
    const body = [
      `Project: ${projectName}`,
      '',
      `Email: ${email.trim()}`,
      '',
      'Context:',
      context.trim() || 'I would like to review the full case study.',
    ].join('\n')

    return {
      href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      text: `To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${body}`,
    }
  }, [context, email, projectName])

  const copyRequest = async (button: HTMLButtonElement) => {
    if (!button.form?.reportValidity()) return
    const revision = ++requestRevision.current
    try {
      await navigator.clipboard.writeText(requestDraft.text)
      if (revision === requestRevision.current) setRequestCopy('copied')
    } catch {
      if (revision === requestRevision.current) setRequestCopy('manual')
    }
  }

  const clearRequestStatus = () => {
    requestRevision.current += 1
    setRequestCopy('idle')
    setDraftOpened(false)
  }

  if (!project?.nda && project?.access?.mode !== 'request') {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    clearRequestStatus()
    setDraftOpened(true)
    if (typeof window !== 'undefined') {
      window.location.href = requestDraft.href
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = accessCode.trim()

    if (!trimmed) {
      setCodeMessage('Enter the reviewer code you were given.')
      return
    }

    if (!GLOBAL_ACCESS_HASH && !PLAIN_ACCESS_CODE) {
      setCodeMessage('No reviewer code is configured for this build. Request access instead.')
      return
    }

    try {
      const matchesHash = GLOBAL_ACCESS_HASH
        ? await sha256Hex(trimmed) === GLOBAL_ACCESS_HASH
        : false
      const matchesPlainCode = PLAIN_ACCESS_CODE ? trimmed === PLAIN_ACCESS_CODE : false

      if (matchesHash || matchesPlainCode) {
        setVerified(true)
        window.dispatchEvent(new CustomEvent(NDA_UNLOCK_EVENT, { detail: { slug } }))
        setAccessCode('')
        setCodeMessage('Access code accepted for this browser session.')
        // Persist only in hash mode; the plain-code fallback is local-dev
        // only and re-prompts on reload rather than storing anything.
        if (typeof window !== 'undefined' && GLOBAL_ACCESS_HASH && matchesHash) {
          storeAccess(slug, GLOBAL_ACCESS_HASH)
        }
        return
      }

      setCodeMessage('That code did not match. Check the code or request access.')
    } catch {
      setCodeMessage('Could not verify the code in this browser. Request access instead.')
    }
  }

  if (verified && delivery !== 'withheld') {
    if (!children) return null

    if (unlockedMode === 'flow') {
      return (
        <motion.div
          id={`case-study-access-${slug}`}
          className="nda-unlocked-flow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <motion.section
        id={`case-study-access-${slug}`}
        className="nda-unlocked-section cs-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="wrap nda-unlocked-inner">
          {children}
        </div>
      </motion.section>
    )
  }

  if (hideWhenLocked) return null

  return (
    <motion.div
      id={`case-study-access-${slug}`}
      className={`nda-inline${compact ? ' nda-inline--compact' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nda-inline-inner">
        <header className="nda-inline-text">
          <h2 className="nda-inline-title">Continue reading</h2>
          <p className="nda-inline-desc">
            {delivery === 'withheld' ? 'Detailed material is withheld from this public build. Request a private review copy.' : 'Use the reviewer code I shared with you.'}
          </p>
        </header>

        <div className="nda-access-stack">
          {delivery !== 'withheld' && <form
            className="nda-inline-form nda-inline-form--code"
            aria-label="Unlock with reviewer code"
            onSubmit={handleCodeSubmit}
          >
            <label className="nda-field" htmlFor={`nda-reviewer-code-${slug}`}>
              <span>Reviewer code</span>
              <input
                id={`nda-reviewer-code-${slug}`}
                type="password"
                className="nda-input"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value)}
                placeholder="Enter code"
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="nda-request-submit nda-request-submit--secondary glass-action">
              Unlock
            </button>
            {codeMessage ? (
              <p className="nda-inline-confirmation">{codeMessage}</p>
            ) : null}
          </form>}

          <details className="nda-request-disclosure">
            <summary className="glass-action">Request access</summary>
          <form
            className="nda-inline-form nda-inline-form--request"
            aria-label="Request case study access"
            onSubmit={handleSubmit}
          >
            <div className="nda-request-intro">
              <span className="nda-request-kicker">No code?</span>
              <h3>Request access</h3>
              <p>
                Share your work email and what you're reviewing so I can send the right level of detail.
              </p>
            </div>
            <label className="nda-field" htmlFor={`nda-work-email-${slug}`}>
              <span>Work email</span>
              <input
                id={`nda-work-email-${slug}`}
                type="email"
                className="nda-input"
                value={email}
                onChange={e => { setEmail(e.target.value); clearRequestStatus() }}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="nda-field" htmlFor={`nda-review-context-${slug}`}>
              <span>What are you reviewing?</span>
              <textarea
                id={`nda-review-context-${slug}`}
                className="nda-input nda-textarea"
                value={context}
                onChange={e => { setContext(e.target.value); clearRequestStatus() }}
                placeholder="Hiring, collaboration, or project review"
                rows={3}
              />
            </label>
            <button type="submit" className="nda-request-submit glass-action">
              Open email draft
            </button>
            <button type="button" className="nda-request-submit nda-request-submit--secondary glass-action" onClick={e => void copyRequest(e.currentTarget)}>
              Copy request
            </button>
            <p className="nda-request-helper">
              Opens your email app. Review and send the draft to {CONTACT_EMAIL}. This website does not send or track delivery.
            </p>
            {(draftOpened || requestCopy !== 'idle') && <p className="nda-inline-confirmation" role="status">
              {requestCopy === 'copied' ? 'Request copied. Paste it into an email and send it to Parth.' : requestCopy === 'manual' ? 'Copying was blocked. Select and copy the request below.' : 'Email draft requested. If your email app did not open, copy the request instead. Nothing has been sent by this website.'}
            </p>}
            {requestCopy === 'manual' && <label className="nda-field" htmlFor={`nda-request-copy-${slug}`}>
              <span>Request to copy</span>
              <textarea id={`nda-request-copy-${slug}`} className="nda-input nda-textarea" value={requestDraft.text} readOnly rows={9} onFocus={e => e.currentTarget.select()} />
            </label>}

          </form>
          </details>
        </div>
      </div>
    </motion.div>
  )
}
