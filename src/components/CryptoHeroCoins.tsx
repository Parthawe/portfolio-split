import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type Coin = {
  name: string
  ticker: string
  frequency: number
}

const COINS: Coin[] = [
  { name: 'Bitcoin', ticker: 'BTC', frequency: 523.25 },
  { name: 'Ethereum', ticker: 'ETH', frequency: 659.25 },
  { name: 'Solana', ticker: 'SOL', frequency: 783.99 },
]

const COIN_ORBIT_FALLBACK = '/Assets/Projects/Crypto/crypto-coin-orbit-v2.webp'
const CryptoCoinOrbit3D = lazy(() => import('./CryptoCoinOrbit3D'))

export default function CryptoHeroCoins() {
  const reduceMotion = useReducedMotion()
  const audioContextRef = useRef<AudioContext | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextCoinRef = useRef(0)
  const [activeCoin, setActiveCoin] = useState<string | null>(null)
  const [lastPlayedCoin, setLastPlayedCoin] = useState<string | null>(null)

  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    void audioContextRef.current?.close()
  }, [])

  const playCoinTone = useCallback((coin: Coin) => {
    const AudioContextClass = window.AudioContext
    const context = audioContextRef.current ?? new AudioContextClass()
    audioContextRef.current = context
    void context.resume()

    const now = context.currentTime
    const master = context.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.105, now + 0.025)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.72)
    master.connect(context.destination)

    ;[
      { ratio: 1, type: 'sine' as OscillatorType, level: 0.72, delay: 0 },
      { ratio: 1.5, type: 'triangle' as OscillatorType, level: 0.28, delay: 0.045 },
    ].forEach(({ ratio, type, level, delay }) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = type
      oscillator.frequency.setValueAtTime(coin.frequency * ratio, now + delay)
      oscillator.frequency.exponentialRampToValueAtTime(coin.frequency * ratio * 0.985, now + 0.58)
      gain.gain.setValueAtTime(level, now + delay)
      oscillator.connect(gain)
      gain.connect(master)
      oscillator.start(now + delay)
      oscillator.stop(now + 0.72)
    })
  }, [])

  const activateCoin = useCallback((coin: Coin) => {
    playCoinTone(coin)
    setActiveCoin(coin.ticker)
    setLastPlayedCoin(coin.ticker)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => setActiveCoin(null), 900)
  }, [playCoinTone])

  const activateOrbit = useCallback(() => {
    const coin = COINS[nextCoinRef.current % COINS.length]
    nextCoinRef.current += 1
    activateCoin(coin)
  }, [activateCoin])

  return (
    <div className="crypto-stage" aria-label="Interactive orbit of 3D cryptocurrency coins">
      <motion.button
        className={`crypto-coin-orbit${activeCoin ? ' is-ringing' : ''}`}
        type="button"
        onClick={activateOrbit}
        initial={{ opacity: 0, scale: 0.86, y: 18 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: reduceMotion ? 0 : [0, -8, 0],
          rotateZ: reduceMotion ? 0 : [-0.6, 0.6, -0.6],
        }}
        whileHover={reduceMotion ? undefined : { scale: 1.025, rotateX: -2, rotateY: 3 }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 0.7, type: 'spring', bounce: 0.18 },
          y: { duration: 6.4, repeat: Infinity, ease: 'easeInOut' },
          rotateZ: { duration: 8.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        aria-label="Animate the 3D crypto coin orbit and play a Bitcoin, Ethereum, or Solana tone"
      >
        <Suspense
          fallback={(
            <img
              className="crypto-coin-orbit__fallback"
              src={COIN_ORBIT_FALLBACK}
              alt=""
              width="1254"
              height="1254"
              loading="eager"
              decoding="async"
            />
          )}
        >
          <CryptoCoinOrbit3D reducedMotion={Boolean(reduceMotion)} />
        </Suspense>
      </motion.button>

      <p className="crypto-coin-hint"><span aria-hidden="true">↻</span> Tap the orbit · sound on</p>
      <span className="sr-only" aria-live="polite">{lastPlayedCoin ? `${lastPlayedCoin} coin tone played` : ''}</span>
    </div>
  )
}
