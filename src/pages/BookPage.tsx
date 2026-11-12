import { Helmet } from 'react-helmet-async'
import { lazy, Suspense, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import '../styles/book-viewer.css'

const BookViewer = lazy(() => import('../components/BookViewer'))

export default function BookPage() {
  const [progress, setProgress] = useState({ loaded: 0, total: 62 })
  const handleProgress = useCallback((loaded: number, total: number) => setProgress({ loaded, total }), [])
  return <>
    <Helmet><title>Book Portfolio, Parth Pawar</title><meta name="description" content="Parth Pawar's original 2022 portfolio, presented as a browsable book." /></Helmet>
    <Nav />
    <main id="main-content">
      <header className="book-hero wrap">
        <div><h1 className="book-hero-title">2022 Collection</h1><p className="book-hero-subtitle">The original portfolio, bound as a book. Turn the pages to explore UX, interaction design, and engineering work.</p></div>
        <div className="book-hero-actions"><Link className="glass-action" to="/about">Back to About</Link><a className="glass-action" href="/Assets/Imagepdfportfolio.pdf" target="_blank" rel="noopener noreferrer">Open original PDF</a></div>
      </header>
      <section className="book-section" aria-label="Interactive portfolio book">
        <p className="book-reading-hint">Use the page controls, or focus the book and press the arrow keys. {progress.loaded > 0 && progress.loaded < progress.total && `${progress.loaded} of ${progress.total} pages ready.`}</p>
        <Suspense fallback={<div className="book-loading" role="status">Loading the book viewer…</div>}><BookViewer pdfUrl="/Assets/Imagepdfportfolio.pdf" onProgress={handleProgress} /></Suspense>
      </section>
    </main>
    <Footer />
  </>
}
