import { useProofMotion } from '../hooks/useProofMotion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, lazy, Suspense } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import PageLoader from './PageLoader';
import Lightbox from './Lightbox';
import { useMagnetic } from '../hooks/useMagnetic';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useDeferredMount } from '../hooks/useDeferredMount';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { normalizeCopy } from '../utils/normalizeCopy';
import { isLowPowerDevice, prefersCanvasChrome } from '../utils/performance';
import { clearBodyScrollLocks } from '../utils/bodyScrollLock';
import { settleAnchor } from '../utils/settleAnchor';

const CollaboratorCursor = lazy(() => import('./CollaboratorCursor'));
const FigmaChrome = lazy(() => import('./FigmaChrome'));
const FigmaGrid = lazy(() => import('./FigmaGrid'));
const HandTracker = lazy(() => import('./HandTracker'));
const SiteInteractionTools = lazy(() => import('./SiteInteractionTools'));
const RouteSeo = lazy(() => import('./RouteSeo'));
const CASE_MEDIA_SELECTOR = '.cs-img img, .cs-img-full img, .proj-hero-img img';
const scrollPositions = new Map<string, number>();

type IdleCapableWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: { timeout: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

function cloneWindowEvent(event: Event) {
  if (event instanceof CustomEvent) {
    return new CustomEvent(event.type, { detail: event.detail })
  }
  return new Event(event.type)
}

function syncCaseStudyMediaState(img: HTMLImageElement) {
  if (!img.matches(CASE_MEDIA_SELECTOR)) return;

  const wrapper = img.closest('.cs-img, .cs-img-full, .proj-hero-img');
  if (!(wrapper instanceof HTMLElement)) return;

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) return;

  const ratio = width / height;
  wrapper.classList.remove('is-portrait', 'is-square', 'is-landscape');

  if (ratio < 0.92) {
    wrapper.classList.add('is-portrait');
    return;
  }

  if (ratio < 1.18) {
    wrapper.classList.add('is-square');
    return;
  }

  wrapper.classList.add('is-landscape');
}

export default function RootLayout() {
  const location = useLocation();
  useProofMotion(location.pathname);
  const navigationType = useNavigationType();
  const ioRef = useRef<IntersectionObserver | null>(null);
  const initialRouteRef = useRef(true);
  const [visible, setVisible] = useState(true);
  const [siteToolsRequested, setSiteToolsRequested] = useState(false);
  const [siteToolsMounted, setSiteToolsMounted] = useState(false);
  const [canvasChromePreferred, setCanvasChromePreferred] = useState(() => prefersCanvasChrome());
  const isStudioRoute = location.pathname === '/studio';
  const isUtilityRoute = location.pathname === '/book' || location.pathname === '/graveyard';
  const enablePortfolioInteractions = !isStudioRoute && !isUtilityRoute;
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)', true);
  const coarsePointer = useMediaQuery('(hover: none), (pointer: coarse)');
  const desktopCanvas = useMediaQuery('(min-width: 769px)', true);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const enableFinePointerEffects = enablePortfolioInteractions && finePointer && !prefersReducedMotion;
  const enableHandTracker = enableFinePointerEffects && !coarsePointer;
  const enableFigmaChrome = !isUtilityRoute && !coarsePointer;
  const handTrackerReady = useDeferredMount(enableHandTracker, { timeout: 9000, delayMs: 5200 })
  const figmaChromeReady = enableFigmaChrome
  const siteToolsReady = enablePortfolioInteractions && desktopCanvas && finePointer && !coarsePointer
  const siteToolsRequestedRef = useRef(siteToolsRequested)
  const siteToolsMountedRef = useRef(siteToolsMounted)
  const pendingSiteToolsEventRef = useRef<Event | null>(null)

  useEffect(() => {
    siteToolsRequestedRef.current = siteToolsRequested
  }, [siteToolsRequested])

  useEffect(() => {
    siteToolsMountedRef.current = siteToolsMounted
  }, [siteToolsMounted])

  const requestSiteTools = useCallback((event?: Event) => {
    if (event && event.type !== 'site-tools:preload') {
      pendingSiteToolsEventRef.current = cloneWindowEvent(event)
    }

    if (!siteToolsRequestedRef.current) {
      siteToolsRequestedRef.current = true
      setSiteToolsRequested(true)
    }
  }, [])

  useEffect(() => {
    if (!siteToolsReady) return

    const onReady = () => setSiteToolsMounted(true)
    const onDemandRequest = (event: Event) => {
      if (siteToolsRequestedRef.current && siteToolsMountedRef.current) return
      requestSiteTools(event)
    }

    window.addEventListener('site-tools:ready', onReady)
    window.addEventListener('site-tools:preload', onDemandRequest)
    window.addEventListener('site-tools:toggle', onDemandRequest)
    window.addEventListener('site-tools:open', onDemandRequest)
    window.addEventListener('portfolio:add-comment', onDemandRequest)

    return () => {
      window.removeEventListener('site-tools:ready', onReady)
      window.removeEventListener('site-tools:preload', onDemandRequest)
      window.removeEventListener('site-tools:toggle', onDemandRequest)
      window.removeEventListener('site-tools:open', onDemandRequest)
      window.removeEventListener('portfolio:add-comment', onDemandRequest)
    }
  }, [requestSiteTools, siteToolsReady])

  useEffect(() => {
    if (!siteToolsMounted) return
    const pendingEvent = pendingSiteToolsEventRef.current
    if (!pendingEvent) return

    const frame = window.requestAnimationFrame(() => {
      pendingSiteToolsEventRef.current = null
      window.dispatchEvent(pendingEvent)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [siteToolsMounted])

  // Fade-in on mount and route change (CSS-driven, replaces Framer Motion)
  useEffect(() => {
    if (initialRouteRef.current) {
      initialRouteRef.current = false;
      return;
    }
    setVisible(false);
    // Trigger reflow so the opacity:0 is painted before transitioning to 1
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, [location.pathname]);

  const previousScrollRoute = useRef<{ pathname: string; hash: string } | null>(null);

  // Restore history positions; new routes start at their explicit anchor or top.
  useLayoutEffect(() => {
    const previous = previousScrollRoute.current;
    previousScrollRoute.current = { pathname: location.pathname, hash: location.hash };
    // Artifact selection and stage filters are views of the same process board.
    // Their query-string history entries must not reset the reading position.
    const preserveProcessPosition = location.pathname.startsWith('/process/') && previous?.pathname === location.pathname && previous.hash === location.hash;
    if (!preserveProcessPosition) clearBodyScrollLocks();
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const top = preserveProcessPosition ? window.scrollY : navigationType === 'POP' ? scrollPositions.get(location.key) ?? 0 : 0;
    // The fresh HTML shell has no scrollable route content yet. Its initial
    // zero-position restore would force layout twice as the lazy route mounts.
    const initialTop = initialRouteRef.current && top === 0 && !location.hash;
    const restore = () => {
      if (initialTop) return;
      let anchorId = location.hash.slice(1);
      try { anchorId = decodeURIComponent(anchorId); } catch { /* Treat malformed hashes as literal IDs. */ }
      const anchor = anchorId ? document.getElementById(anchorId) : null;
      if (anchor) anchor.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo({ top, behavior: 'instant' });
    };
    restore();
    const frame = requestAnimationFrame(restore);
    let anchorId = location.hash.slice(1);
    try { anchorId = decodeURIComponent(anchorId); } catch { /* Literal hash. */ }
    const stopAnchor = anchorId ? settleAnchor(anchorId) : undefined;
    return () => {
      stopAnchor?.();
      scrollPositions.set(location.key, window.scrollY);
      cancelAnimationFrame(frame);
      history.scrollRestoration = previousRestoration;
    };
  }, [location.key, location.pathname, location.hash, navigationType]);

  // Rulers change page padding and fixed-control offsets. Apply the saved
  // preference in the commit, before the route's first visible frame.
  useLayoutEffect(() => {
    document.body.classList.toggle('figma-chrome-enabled', enableFigmaChrome);
    return () => {
      document.body.classList.remove('figma-chrome-enabled');
    };
  }, [enableFigmaChrome]);

  useLayoutEffect(() => {
    const shouldShowCanvasChrome = enableFigmaChrome && desktopCanvas && finePointer && !coarsePointer && canvasChromePreferred && !isLowPowerDevice();
    document.body.classList.toggle('figma-grid-on', shouldShowCanvasChrome);
    document.body.classList.toggle('figma-coordinates-on', shouldShowCanvasChrome);
    document.body.classList.toggle('figma-rulers-off', !shouldShowCanvasChrome);
    document.body.classList.toggle('figma-reader-mode', !shouldShowCanvasChrome);

    return () => {
      document.body.classList.remove('figma-grid-on');
      document.body.classList.remove('figma-coordinates-on');
      document.body.classList.remove('figma-rulers-off');
      document.body.classList.remove('figma-reader-mode');
    };
  }, [enableFigmaChrome, desktopCanvas, finePointer, coarsePointer, canvasChromePreferred]);

  useEffect(() => {
    const syncCanvasChromePreference = () => setCanvasChromePreferred(prefersCanvasChrome())

    window.addEventListener('portfolio:canvas-chrome-preference', syncCanvasChromePreference)
    window.addEventListener('storage', syncCanvasChromePreference)
    return () => {
      window.removeEventListener('portfolio:canvas-chrome-preference', syncCanvasChromePreference)
      window.removeEventListener('storage', syncCanvasChromePreference)
    }
  }, [])

  useEffect(() => {
    const syncChromeAccent = () => {
      const main = document.querySelector<HTMLElement>('#main-content');
      const projectColor = main
        ? getComputedStyle(main).getPropertyValue('--project-color').trim()
        : '';

      if (projectColor) {
        document.body.style.setProperty('--figma-chrome-accent', projectColor);
      } else {
        document.body.style.removeProperty('--figma-chrome-accent');
      }
    };

    const frame = requestAnimationFrame(syncChromeAccent);
    const timer = window.setTimeout(syncChromeAccent, 450);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      document.body.style.removeProperty('--figma-chrome-accent');
    };
  }, [location.pathname]);

  // Normalize visible copy so long dashes do not leak into the rendered site.
  useEffect(() => {
    const normalizeTextNodes = () => {
      const root = document.getElementById('main-content') || document.body
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT
          if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT
          if (parent.closest('[data-preserve-copy]')) return NodeFilter.FILTER_REJECT
          return /[—–]/.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
        },
      })

      const nodes: Text[] = []
      let current = walker.nextNode()
      while (current) {
        nodes.push(current as Text)
        current = walker.nextNode()
      }

      nodes.forEach(node => {
        node.nodeValue = normalizeCopy(node.nodeValue || '')
      })
    }

    const idleWindow = window as IdleCapableWindow
    let idleId: number | null = null
    let timer: number | null = null

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleId = idleWindow.requestIdleCallback(normalizeTextNodes, { timeout: 1500 })
    } else {
      timer = window.setTimeout(normalizeTextNodes, 900)
    }

    return () => {
      if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId)
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [location.pathname]);

  // Persistent scroll-reveal observer, mounted once, never torn down between routes
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;

          if (!prefersReduced) {
            const parent = el.parentElement;
            if (parent) {
              const siblings = Array.from(parent.querySelectorAll(':scope > .reveal'));
              const idx = siblings.indexOf(el);
              if (idx > 0) el.style.transitionDelay = `${idx * 0.08}s`;
            }
          }

          el.classList.add('visible');
          io.unobserve(el);

          if (!prefersReduced) {
            setTimeout(() => { el.style.transitionDelay = ''; }, 900);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -10px 0px' }
    );
    ioRef.current = io;

    const observeNew = (root: Element | Document) => {
      root.querySelectorAll('.reveal:not(.visible), .reveal-image:not(.visible)').forEach((el) => {
        io.observe(el);
      });
    };

    const syncExistingMedia = (root: ParentNode) => {
      root.querySelectorAll<HTMLImageElement>(CASE_MEDIA_SELECTOR).forEach((img) => {
        if (img.complete) syncCaseStudyMediaState(img);
      });
    };

    // Initial scan
    observeNew(document);
    syncExistingMedia(document);

    // Watch for any new elements added to the DOM (batched via microtask)
    let pendingNodes: HTMLElement[] = [];
    let flushScheduled = false;
    const flushPending = () => {
      flushScheduled = false;
      const nodes = pendingNodes;
      pendingNodes = [];
      for (const node of nodes) {
        if (node.classList.contains('reveal') || node.classList.contains('reveal-image')) {
          io.observe(node);
        }
        observeNew(node);
        syncExistingMedia(node);
      }
    };
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node instanceof HTMLElement) pendingNodes.push(node);
        }
      }
      if (pendingNodes.length && !flushScheduled) {
        flushScheduled = true;
        queueMicrotask(flushPending);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Auto-hide shimmer on case study images when loaded
    const onImgLoad = (e: Event) => {
      const img = e.target as HTMLImageElement;
      if (img.tagName !== 'IMG') return;
      syncCaseStudyMediaState(img);
      const wrapper = img.closest('.cs-img');
      if (wrapper) wrapper.classList.add('loaded');
    };
    document.addEventListener('load', onImgLoad, true); // capture phase

    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener('load', onImgLoad, true);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-scan after route change — unobserve stale elements, observe new ones
  const observedRef = useRef(new Set<Element>());

  useEffect(() => {
    const io = ioRef.current;
    if (!io) return;

    // Unobserve elements no longer in the DOM (stale from prev route)
    observedRef.current.forEach(el => {
      if (!el.isConnected) {
        io.unobserve(el);
        observedRef.current.delete(el);
      }
    });

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible), .reveal-image:not(.visible)').forEach((el) => {
        if (!observedRef.current.has(el)) {
          io.observe(el);
          observedRef.current.add(el);
        }
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Magnetic buttons (desktop only)
  useMagnetic(enableFinePointerEffects);
  useKeyboardNav(enablePortfolioInteractions);

  return (
    <>
      <Suspense fallback={null}>
        <RouteSeo />
      </Suspense>
      <div className="grain" aria-hidden="true"></div>
      <div className="dot-bg" aria-hidden="true"></div>
      {enableFigmaChrome && figmaChromeReady && (
        <Suspense fallback={null}>
          <FigmaGrid />
        </Suspense>
      )}
      <PageLoader />
      <div
        id="site-zoom-stage"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.52s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Outlet />
      </div>
      <Lightbox />
      {enableFinePointerEffects && desktopCanvas && !coarsePointer && <Suspense fallback={null}><CollaboratorCursor /></Suspense>}
      {/* AmbientAudio moved to Nav */}
      {enableFigmaChrome && figmaChromeReady && (
        <Suspense fallback={null}>
          <FigmaChrome />
        </Suspense>
      )}
      {enablePortfolioInteractions && siteToolsReady && siteToolsRequested && (
        <Suspense fallback={null}>
          <SiteInteractionTools />
        </Suspense>
      )}
      {enableHandTracker && handTrackerReady && (
        <Suspense fallback={null}>
          <HandTracker />
        </Suspense>
      )}
    </>
  );
}
