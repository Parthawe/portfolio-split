import PortfolioSlider from './PortfolioSlider'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Interactive glyph playground for Butler's Slice typeface.
 *
 * Features:
 *  - Type anything and see it rendered in Butler's Slice
 *  - Weight slider (Ultralight / Regular / Bold)
 *  - Size slider
 *  - Toggle between Butler (serif) and Butler's Slice to see the "slice" difference
 *  - Click individual letters to see them large with slice details
 */

const WEIGHTS = [
  { label: 'Ultralight', value: 200, css: 'var(--tf-slice)' },
  { label: 'Regular', value: 400, css: 'var(--tf-slice)' },
  { label: 'Bold', value: 700, css: 'var(--tf-slice)' },
]

const SAMPLE_TEXTS = [
  'Hamburgevons',
  'The quick brown fox',
  'Typography is craft',
  'ABCDEFGHIJKLM',
  'Design is how it works',
]

export default function GlyphPlayground() {
  const [text, setText] = useState('Hamburgevons')
  const [weightIdx, setWeightIdx] = useState(1) // Regular
  const [fontSize, setFontSize] = useState(72)
  const [activeGlyph, setActiveGlyph] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const weight = WEIGHTS[weightIdx]

  const handleGlyphClick = useCallback((char: string) => {
    if (char === ' ') return
    setActiveGlyph(prev => prev === char ? null : char)
  }, [])

  return (
    <section className="glyph-playground reveal">
      <div className="wrap">
        {/* Controls */}
        <div className="gp-controls">
          <div className="gp-control-group">
            <label className="gp-label">Type something</label>
            <input
              ref={inputRef}
              type="text"
              className="gp-input"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type here..."
            />
          </div>

          <div className="gp-control-group">
            <label className="gp-label">Weight</label>
            <div className="gp-weight-tabs">
              {WEIGHTS.map((w, i) => (
                <button
                  key={w.label}
                  className={`gp-weight-tab ${i === weightIdx ? 'active' : ''}`}
                  onClick={() => setWeightIdx(i)}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="gp-control-group">
            <label className="gp-label">Size &middot; {fontSize}px</label>
            <PortfolioSlider
              type="range"
              className="gp-slider" aria-label="Glyph size"
              min={24}
              max={200}
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
            />
          </div>


        </div>

        {/* Preview area */}
        <div className="gp-preview">
          <motion.p
            className="gp-preview-text"
            style={{
              fontFamily: weight.css,
              fontWeight: weight.value,
              fontSize: `${fontSize}px`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {text.split('').map((char, i) => (
              <span
                key={`${char}-${i}`}
                className={`gp-glyph ${activeGlyph === char ? 'active' : ''}`}
                role="button"
                tabIndex={char === ' ' ? -1 : 0}
                onClick={() => handleGlyphClick(char)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGlyphClick(char) } }}
              >
                {char}
              </span>
            ))}
          </motion.p>
        </div>

        {/* Active glyph detail */}
        <AnimatePresence>
          {activeGlyph && (
            <motion.div
              className="gp-glyph-detail"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="gp-glyph-large">
                <span
                  style={{
                    fontFamily: 'var(--tf-slice)',
                    fontWeight: weight.value,
                  }}
                >
                  {activeGlyph}
                </span>
              </div>
              <div className="gp-glyph-info">
                <span className="gp-glyph-char">U+{activeGlyph.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}</span>
                <span className="gp-glyph-name">{activeGlyph.toUpperCase() === activeGlyph ? 'Uppercase' : 'Lowercase'} · {weight.label}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sample text suggestions */}
        <div className="gp-samples">
          {SAMPLE_TEXTS.map(s => (
            <button key={s} className="gp-sample" onClick={() => setText(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Full alphabet grid */}
        <div className="gp-alphabet">
          <div className="gp-alphabet-row">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => (
              <span
                key={c}
                className="gp-alphabet-char"
                role="button"
                tabIndex={0}
                style={{ fontFamily: 'var(--tf-slice)', fontWeight: weight.value }}
                onClick={() => handleGlyphClick(c)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGlyphClick(c) } }}
              >
                {c}
              </span>
            ))}
          </div>
          <div className="gp-alphabet-row">
            {'abcdefghijklmnopqrstuvwxyz'.split('').map(c => (
              <span
                key={c}
                className="gp-alphabet-char"
                role="button"
                tabIndex={0}
                style={{ fontFamily: 'var(--tf-slice)', fontWeight: weight.value }}
                onClick={() => handleGlyphClick(c)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGlyphClick(c) } }}
              >
                {c}
              </span>
            ))}
          </div>
          <div className="gp-alphabet-row">
            {'0123456789'.split('').map(c => (
              <span
                key={c}
                className="gp-alphabet-char"
                role="button"
                tabIndex={0}
                style={{ fontFamily: 'var(--tf-slice)', fontWeight: weight.value }}
                onClick={() => handleGlyphClick(c)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGlyphClick(c) } }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
