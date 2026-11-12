import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PointerCursorGlyph from '../components/PointerCursorGlyph'

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404, Page Not Found · Parth Pawar</title>
        <meta name="description" content="This page doesn't exist, but great design work does. Browse Parth Pawar's portfolio." />
      </Helmet>
      <Nav />
      <main id="main-content" className="not-found">
        <div className="wrap not-found-inner">
          {/* Giant wordmark: the middle zero is a Figma-selected empty frame */}
          <motion.h1
            className="nf-wordmark"
            aria-label="404 — page not found"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease }}
          >
            <span aria-hidden="true">4</span>
            <span className="nf-hole" aria-hidden="true">
              <i className="nf-hole-handle nf-hole-handle--tl" />
              <i className="nf-hole-handle nf-hole-handle--tr" />
              <i className="nf-hole-handle nf-hole-handle--br" />
              <i className="nf-hole-handle nf-hole-handle--bl" />
              <span className="nf-hole-tag">0 × 0</span>
            </span>
            <span aria-hidden="true">4</span>
          </motion.h1>

          {/* The canvas where the page should have been */}
          <motion.div
            className="nf-canvas"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
          >
            <span className="nf-canvas-label" aria-hidden="true">portfolio.fig — frame not on this canvas</span>

            <span className="nf-scrawl" aria-hidden="true">nothing here&hellip; it got deleted</span>

            <div className="nf-marquee" aria-hidden="true" />

            <div className="nf-pin" aria-hidden="true">
              <span className="nf-pin-dot">?</span>
              <span className="nf-pin-bubble">
                This frame was moved or deleted.
                <em>— p.</em>
              </span>
            </div>

            <div className="nf-cursor nf-cursor--parth" aria-hidden="true">
              <PointerCursorGlyph className="nf-cursor__glyph" />
              <span>parth</span>
            </div>
            <div className="nf-cursor nf-cursor--you" aria-hidden="true">
              <PointerCursorGlyph className="nf-cursor__glyph" />
              <span>you</span>
            </div>

            <Link to="/graveyard" className="nf-ghost">
              <span className="nf-ghost-name">deleted-frames/</span>
              <span className="nf-ghost-hint">it might live in the graveyard &rarr;</span>
            </Link>

            <nav className="nf-links" aria-label="Places to go instead">
              <Link to="/" className="not-found-link">Homepage</Link>
              <Link to="/work" className="not-found-link">All Work</Link>
              <Link to="/about" className="not-found-link">About</Link>
            </nav>
          </motion.div>

          {/* Badge · year · smiley, like a poster footer */}
          <motion.div
            className="nf-foot"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26, ease }}
          >
            <span className="nf-badge">
              <strong>Parth Pawar</strong>
              <small>Design Engineer &amp; Fabricator</small>
            </span>
            <span className="nf-year" aria-hidden="true">2026</span>
            <span className="nf-smiley" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="13.5" stroke="currentColor" strokeWidth="2" />
                <circle cx="10.5" cy="12.5" r="1.6" fill="currentColor" />
                <circle cx="19.5" cy="12.5" r="1.6" fill="currentColor" />
                <path d="M9.5 18.5c1.4 2 3.2 3 5.5 3s4.1-1 5.5-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
