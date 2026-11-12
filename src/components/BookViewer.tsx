import { useEffect, useRef, useState, useCallback, forwardRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePrefersReduced } from '../hooks/usePrefersReduced';
import HTMLFlipBook from 'react-pageflip';
import '../styles/book-viewer.css';

const INITIAL_READY_PAGES = 4
const RENDER_BATCH = 4

async function canvasToObjectUrl(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value)
      else reject(new Error('Failed to encode page image'))
    }, 'image/jpeg', 0.88)
  })

  return URL.createObjectURL(blob)
}

/* ─── Single PDF page ─── */
const PageImage = forwardRef<HTMLDivElement, { src: string; pageNum: number; total: number }>(
  ({ src, pageNum, total }, ref) => (
    <div className="book-page" ref={ref}>
      <img src={src} alt={`Page ${pageNum}`} className="book-page-img" loading="lazy" decoding="async" draggable={false} />
      <span className="book-page-num">{pageNum} / {total}</span>
    </div>
  )
);
PageImage.displayName = 'PageImage';

/* ─── Main BookViewer ─── */
export default function BookViewer({
  pdfUrl = '/Assets/Imagepdfportfolio.pdf',
  onProgress,
  onReady,
}: {
  pdfUrl?: string;
  onProgress?: (loaded: number, total: number) => void;
  onReady?: () => void;
}) {
  const reducedMotion = usePrefersReduced();
  const isMobile = useMediaQuery('(max-width: 699px)');
  const [attempt, setAttempt] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 650, height: 840 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- HTMLFlipBook has no exported instance type
  const flipBookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void; flip: (page: number) => void; getCurrentPageIndex: () => number } } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const aspectRef = useRef(840 / 650);
  const pageUrlsRef = useRef<string[]>([])

  /* Calculate optimal dimensions, large, consume most of the screen */
  const calcDimensions = useCallback((aspect: number) => {
    const available = containerRef.current?.clientWidth || window.innerWidth;
    const portrait = window.innerWidth < 700;
    const maxWidth = (available - (portrait ? 24 : 64)) / (portrait ? 1 : 2);
    const width = Math.max(120, Math.min(650, maxWidth, (window.innerHeight * .72) / aspect));
    return { width: Math.round(width), height: Math.round(width * aspect) };
  }, []);

  /* Render all PDF pages */
  useEffect(() => {
    let cancelled = false;
    const scale = window.innerWidth < 700 ? 1.5 : 2;
    setLoading(true); setError(null); setPages([]); setCurrentPage(0);

    async function renderPdf() {
      try {
        const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const total = pdf.numPages;
        const rendered: string[] = [];
        let readyTriggered = false

        if (!cancelled) {
          setPageCount(total)
          onProgress?.(0, total)
        }

        const firstPage = await pdf.getPage(1);
        const vp = firstPage.getViewport({ scale: 1 });
        const aspect = vp.height / vp.width;
        aspectRef.current = aspect;
        if (!cancelled) setDimensions(calcDimensions(aspect));

        for (let i = 1; i <= total; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const pageUrl = await canvasToObjectUrl(canvas)
          if (cancelled) { URL.revokeObjectURL(pageUrl); return; }
          rendered.push(pageUrl);
          pageUrlsRef.current.push(pageUrl)

          if (!cancelled) onProgress?.(i, total);
          const shouldCommit = i <= INITIAL_READY_PAGES || i % RENDER_BATCH === 0 || i === total
          if (shouldCommit && !cancelled) {
            setPages(rendered.slice())

            if (!readyTriggered && i >= Math.min(INITIAL_READY_PAGES, total)) {
              readyTriggered = true
              setLoading(false)
              onReady?.()
            }

            await new Promise(r => setTimeout(r, 0))
          }
        }
        if (!cancelled) {
          setPages(rendered)
          if (!readyTriggered) {
            setLoading(false)
            onReady?.()
          }
        }
      } catch {
        if (!cancelled) { setError('Could not load the book. Please try refreshing.'); setLoading(false); }
      }
    }

    renderPdf();
    return () => {
      cancelled = true;
      pageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      pageUrlsRef.current = []
    };
  }, [pdfUrl, calcDimensions, attempt]);

  /* Resize handler, debounced */
  useEffect(() => {
    if (!pages.length) return;
    let timer: ReturnType<typeof setTimeout>;
    const handle = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setDimensions(calcDimensions(aspectRef.current));
      }, 150);
    };
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('resize', handle);
      clearTimeout(timer);
    };
  }, [pages.length, calcDimensions]);

  const onFlip = useCallback((e: { data: number }) => { setCurrentPage(e.data); }, []);
  const goNext = () => isMobile ? setCurrentPage(page => Math.min(pages.length - 1, page + 1)) : flipBookRef.current?.pageFlip()?.flipNext();
  const goPrev = () => isMobile ? setCurrentPage(page => Math.max(0, page - 1)) : flipBookRef.current?.pageFlip()?.flipPrev();
  const totalPages = pageCount || pages.length;
  const loadedPages = pages.length;


  return (
    <div className="book-viewer" ref={containerRef} tabIndex={0} role="group" aria-label="Portfolio book. Use left and right arrow keys to turn pages." onKeyDown={event => {
      if ((event.target as HTMLElement).closest('button, input, select, textarea, a')) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); event.key === 'ArrowRight' ? goNext() : goPrev(); }
    }}>
      {/* Book */}
      <div className="book-stage">
        {loading ? (
          <div className="book-loading" role="status" aria-label="Loading book">
            <div className="book-loading-spinner" />
            <span>Preparing your book...</span>
            <span className="book-loading-sub">{totalPages || 62} pages of design work</span>
          </div>
        ) : error ? (
          <div className="book-loading" role="alert">
            <span>{error}</span><button className="glass-action" onClick={() => setAttempt(value => value + 1)}>Retry book</button><a href={pdfUrl} target="_blank" rel="noopener noreferrer">Open original PDF</a>
          </div>
        ) : isMobile ? (
          <div className="book-mobile-page"><img src={pages[currentPage]} alt={`Portfolio page ${currentPage + 1}`} draggable={false} style={{ aspectRatio: `${1 / aspectRef.current}` }} /></div>
        ) : (
          <div className="book-flip-wrapper">
            {/* @ts-ignore */}
            <HTMLFlipBook
              ref={flipBookRef}
              width={dimensions.width}
              height={dimensions.height}
              size="stretch"
              minWidth={120}
              maxWidth={1100}
              minHeight={160}
              maxHeight={1200}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={onFlip}
              className="book-flipbook"
              style={{}}
              startPage={0}
              drawShadow={true}
              flippingTime={reducedMotion ? 1 : 600}
              usePortrait={isMobile}
              startZIndex={0}
              autoSize={false}
              maxShadowOpacity={0.5}
              showPageCorners={true}
              disableFlipByClick={false}
              useMouseEvents={true}
              swipeDistance={20}
              clickEventForward={true}
              renderOnlyPageLengthChange={false}
            >
              {pages.map((src, i) => (
                <PageImage key={i} src={src} pageNum={i + 1} total={totalPages} />
              ))}
            </HTMLFlipBook>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="book-controls">
        <button className="book-ctrl-btn" onClick={goPrev} disabled={loading || !!error || currentPage <= 0} aria-label="Previous page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          <span>Prev</span>
        </button>

        <div className="book-page-info"><label className="sr-only" htmlFor="book-page-select">Go to page</label><select id="book-page-select" value={Math.min(currentPage, Math.max(0, loadedPages - 1))} disabled={loading || !!error} onChange={event => isMobile ? setCurrentPage(Number(event.target.value)) : flipBookRef.current?.pageFlip()?.flip(Number(event.target.value))}>{pages.map((_, index) => <option key={index} value={index}>Page {index + 1}</option>)}</select>
          <span className="book-page-indicator">{currentPage + 1} / {totalPages || '...'}</span>
          {loadedPages < totalPages && <span className="book-page-indicator">Loaded {loadedPages}</span>}
        </div>

        <button className="book-ctrl-btn" onClick={goNext} disabled={loading || !!error || currentPage >= loadedPages - 1} aria-label="Next page">
          <span>Next</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

    </div>
  );
}
