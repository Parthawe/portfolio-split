import { useRef, useEffect, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavScroll } from '../hooks/useNavScroll';
import ThemeToggle from './ThemeToggle';
import FigmaSelect from './FigmaSelect';
import AmbientAudio from './AmbientAudio';
import { sibling, siblingHome } from '../config/portfolio';
import { CONTACT_EMAIL } from '../config/site';
import { setCanvasChromePreference } from '../utils/performance';
import CompactSheet from './CompactSheet';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  useNavScroll(navRef);

  const isOpenRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [rulersOn, setRulersOn] = useState(true);
  const [interactOn, setInteractOn] = useState(false);
  const [easterToolsOpen, setEasterToolsOpen] = useState(false);

  const closeMenu = useCallback(() => {
    isOpenRef.current = false;
    setMenuOpen(false);
    toggleRef.current?.classList.remove('open');
  }, []);

  const toggleMenu = useCallback(() => {
    if (isOpenRef.current) {
      closeMenu();
    } else {
      isOpenRef.current = true;
      setMenuOpen(true);
      toggleRef.current?.classList.add('open');
    }
  }, [closeMenu]);

  useEffect(() => {
    window.addEventListener('pageshow', closeMenu);
    return () => window.removeEventListener('pageshow', closeMenu);
  }, [closeMenu]);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    const navContrastClass = 'nav-on-dark';
    document.body.classList.remove(navContrastClass);

    const darkZones = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-contrast="dark"]'));
    if (!darkZones.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const hasDarkZone = entries.some((entry) => entry.isIntersecting);
        document.body.classList.toggle(navContrastClass, hasDarkZone);
      },
      { rootMargin: '-1px 0px -82% 0px', threshold: 0 }
    );

    darkZones.forEach((zone) => observer.observe(zone));

    return () => {
      observer.disconnect();
      document.body.classList.remove(navContrastClass);
    };
  }, [pathname]);

  useEffect(() => {
    const syncChromeState = () => {
      setGridOn(document.body.classList.contains('figma-grid-on'));
      setRulersOn(!document.body.classList.contains('figma-rulers-off'));
      setInteractOn(document.body.classList.contains('site-tools-open'));
    };

    syncChromeState();

    const observer = new MutationObserver(syncChromeState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onSiteToolsState = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail;
      setInteractOn(Boolean(detail?.open));
    };

    window.addEventListener('site-tools:state', onSiteToolsState);
    return () => window.removeEventListener('site-tools:state', onSiteToolsState);
  }, []);

  const toggleGrid = useCallback(() => {
    const enabled = document.body.classList.toggle('figma-grid-on');
    if (enabled) setCanvasChromePreference(true);
    if (!enabled && document.body.classList.contains('figma-rulers-off')) setCanvasChromePreference(false);
  }, []);

  const toggleRulers = useCallback(() => {
    const rulersOff = document.body.classList.toggle('figma-rulers-off');
    setCanvasChromePreference(!rulersOff || document.body.classList.contains('figma-grid-on'));
  }, []);

  const toggleInteractTools = useCallback(() => {
    setCanvasChromePreference(true);
    window.dispatchEvent(new CustomEvent('site-tools:toggle'));
  }, []);

  const preloadInteractTools = useCallback(() => {
    window.dispatchEvent(new CustomEvent('site-tools:preload'));
  }, []);

  const normalizedPathname = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
  const isHome = normalizedPathname === '/';
  const isAbout = normalizedPathname === '/about';
  const isNotes = normalizedPathname === '/notes' || normalizedPathname === '/guestbook';
  const isWriting = normalizedPathname === '/writing' || normalizedPathname.startsWith('/writing/');
  const isWork = normalizedPathname === '/work' || normalizedPathname.startsWith('/work/');
  // Project and category pages also count as "work"
  const isWorkContext = isWork || (!isHome && !isAbout && !isWriting && !isNotes && !['studio', 'book', 'graveyard'].some(r => normalizedPathname === `/${r}`));

  const handleSkipToContent = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById('main-content');
    if (!main) return;

    event.preventDefault();
    main.tabIndex = -1;
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-to-content" onClick={handleSkipToContent}>Skip to content</a>
      <nav className="nav" id="nav" ref={navRef}>
        <div className="nav-inner">
          {/* Left group, logo + links in a single pill */}
          <div className="nav-left-pill surface-glass figma-hover">
            <Link to="/" className="nav-logo figma-hover" aria-label="Parth Pawar, home">Parth<FigmaSelect /></Link>
            <Link to="/work" data-label="Work" className={`pill-link nav-pill-link figma-hover${isWorkContext ? ' active' : ''}`}><span className="nav-pill-link__label">Work</span><FigmaSelect /></Link>
            <Link to="/about" data-label="About" className={`pill-link nav-pill-link figma-hover${isAbout ? ' active' : ''}`}><span className="nav-pill-link__label">About</span><FigmaSelect /></Link>
            <a href={siblingHome} className="pill-link nav-portfolio-link">
              {sibling.name}<span aria-hidden="true">&rarr;</span>
            </a>
            <FigmaSelect />
          </div>

          {/* Right group, theme toggle + CTA */}
          <div className="nav-right">
            {easterToolsOpen && (
              <div
                className="nav-canvas-panel nav-canvas-panel--easter surface-glass surface-glass--subtle"
                id="nav-easter-tools"
                aria-label="Easter egg tools"
              >
                <button
                  type="button"
                  className={`nav-grid-toggle nav-interact-toggle${interactOn ? ' nav-grid-toggle--active' : ''}`}
                  aria-label={interactOn ? 'Exit Figma mode' : 'Enter Figma mode'}
                  aria-pressed={interactOn}
                  aria-controls="site-interaction-tools"
                  title={interactOn ? 'Exit Figma mode' : 'Enter Figma mode'}
                  onPointerEnter={preloadInteractTools}
                  onFocus={preloadInteractTools}
                  onClick={toggleInteractTools}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                    <path d="M3 3.25H12M3 7.5H12M3 11.75H12" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
                    <circle cx="5.25" cy="3.25" r="1.05" fill="var(--surface, #fff)" stroke="currentColor" strokeWidth="1.05" />
                    <circle cx="9.75" cy="7.5" r="1.05" fill="var(--surface, #fff)" stroke="currentColor" strokeWidth="1.05" />
                    <circle cx="6.75" cy="11.75" r="1.05" fill="var(--surface, #fff)" stroke="currentColor" strokeWidth="1.05" />
                  </svg>
                  <span>Figma</span>
                </button>
                <button
                  type="button"
                  className={`nav-grid-toggle${gridOn ? ' nav-grid-toggle--active' : ''}`}
                  aria-label={gridOn ? 'Hide grid overlay' : 'Show grid overlay'}
                  aria-pressed={gridOn}
                  title={gridOn ? 'Hide grid overlay' : 'Show grid overlay'}
                  onClick={toggleGrid}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M1.5 4.5H12.5M1.5 9.5H12.5M4.5 1.5V12.5M9.5 1.5V12.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" />
                  </svg>
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  className={`nav-grid-toggle${rulersOn ? ' nav-grid-toggle--active' : ''}`}
                  aria-label={rulersOn ? 'Hide rulers' : 'Show rulers'}
                  aria-pressed={rulersOn}
                  title={rulersOn ? 'Hide rulers' : 'Show rulers'}
                  onClick={toggleRulers}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 1.5V12M2 1.5H12.5M2 4.5H4.5M2 7.5H5.5M2 10.5H4.5M5 1.5V4M8 1.5V5M11 1.5V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  <span>Ruler</span>
                </button>
              </div>
            )}
            <button
              type="button"
              className={`nav-easter-toggle surface-glass surface-glass--subtle${easterToolsOpen ? ' nav-easter-toggle--active' : ''}`}
              aria-label={easterToolsOpen ? 'Hide Easter egg tools' : 'Show Easter egg tools'}
              aria-expanded={easterToolsOpen}
              aria-controls="nav-easter-tools"
              title={easterToolsOpen ? 'Hide Easter egg tools' : 'Show Easter egg tools'}
              onClick={() => setEasterToolsOpen((open) => !open)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.75C5.9 1.75 3.4 5.4 3.4 9.15C3.4 12.05 5.45 14.25 8 14.25C10.55 14.25 12.6 12.05 12.6 9.15C12.6 5.4 10.1 1.75 8 1.75Z" stroke="currentColor" strokeWidth="1.15" />
                <path d="M3.75 8.15C4.75 8.9 5.75 8.9 6.75 8.15C7.75 7.4 8.75 7.4 9.75 8.15C10.7 8.85 11.55 8.9 12.35 8.35" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
              </svg>
            </button>
            <AmbientAudio />
            <span className="nav-theme-wrap figma-hover"><ThemeToggle className="surface-glass surface-glass--subtle" /><FigmaSelect /></span>
            <a href={`mailto:${CONTACT_EMAIL}`} className="nav-cta magnetic figma-hover">Let's Talk<FigmaSelect /></a>
            <ThemeToggle className="nav-mobile-theme surface-glass surface-glass--subtle" />
            <button
              ref={toggleRef}
              className="nav-toggle"
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={toggleMenu}
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen ? (
        <CompactSheet title="Site navigation" id="mobile-navigation" onClose={closeMenu} returnFocus={toggleRef.current}>
          <ul className="mobile-nav-links">
            <li><Link to="/work" onClick={closeMenu}>Work</Link></li>
            <li><Link to="/about" onClick={closeMenu}>About</Link></li>
            <li><a href={`mailto:${CONTACT_EMAIL}`} onClick={closeMenu}>Let's Talk</a></li>
          </ul>
        </CompactSheet>
      ) : null}
    </>
  );
}
