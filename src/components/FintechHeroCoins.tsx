import { lazy, Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const FintechCoinOrbit3D = lazy(() => import('./FintechCoinOrbit3D'))

export default function FintechHeroCoins() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="fintech-stage" aria-label="Continuously rotating international currency coins">
      <motion.div
        className="fintech-coin-orbit"
        initial={{ opacity: 0, scale: 0.86, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: reducedMotion ? 0 : [0, -7, 0] }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 0.72, type: 'spring', bounce: 0.16 },
          y: { duration: 6.8, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <Suspense fallback={null}>
          <FintechCoinOrbit3D reducedMotion={Boolean(reducedMotion)} />
        </Suspense>
      </motion.div>
      <p className="fintech-coin-caption">Global money · always in motion</p>
    </div>
  )
}
