import { useEffect, useRef, useCallback, useState } from 'react';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import FigmaSelect from '../FigmaSelect';
import CompactSheet from '../CompactSheet';

interface BottomNavProps {
  sections: { id: string; label: string }[];
  liveUrl?: string;
  modeAction?: { label: string; onClick: () => void };
  placement?: 'bottom' | 'side';
}

export default function BottomNav({ sections, liveUrl, modeAction, placement = 'side' }: BottomNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const progress = useReadingProgress();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [availableSections, setAvailableSections] = useState(sections);
  const [hasExpandAction, setHasExpandAction] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 680px)').matches);
  const closeChapters = useCallback(() => setMenuOpen(false), []);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 680px)');
    const sync = () => setCompact(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const usesChapterMenu = availableSections.length > 3;
  const directSections = usesChapterMenu ? [] : availableSections;
  const activeSection = availableSections.find((section) => section.id === activeSectionId) ?? availableSections[0];

  useEffect(() => {
    const updateAvailableSections = () => {
      const mounted = sections.filter((section) => document.getElementById(section.id));
      setAvailableSections(current => current.length === mounted.length &&
        current.every((section, index) => section.id === mounted[index].id && section.label === mounted[index].label)
        ? current : mounted);
      setHasExpandAction(Boolean(document.querySelector('.cs-expand-preview-btn')));
    };

    updateAvailableSections();
    const root = document.getElementById('main-content') || document.body;
    const observer = new MutationObserver(mutations => {
      // Canvas/ASCII updates do not change the chapter list.
      const relevant = mutations.some(mutation => [...mutation.addedNodes, ...mutation.removedNodes].some(node =>
        node instanceof Element && (node.matches('[id], .cs-expand-preview-btn') ||
          node.querySelector('[id], .cs-expand-preview-btn'))
      ));
      if (relevant) updateAvailableSections();
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (!menuOpen || compact) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      navRef.current?.querySelector<HTMLButtonElement>('.cs-bnav-chapters')?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen, compact]);

  const showNav = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    nav.classList.remove('is-idle');
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      nav.classList.add('is-idle');
    }, 2500);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    nav.classList.add('is-before-hero');

    // --- Active section tracking ---
    const pairs = availableSections
      .map((section) => ({ config: section, element: document.getElementById(section.id) }))
      .filter((pair): pair is { config: { id: string; label: string }; element: HTMLElement } => Boolean(pair.element));

    let sectionObserver: IntersectionObserver | undefined;
    if (pairs.length) {
      sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const match = pairs.find((pair) => pair.element === entry.target);
              if (match) setActiveSectionId(match.config.id);
            }
          });
        },
        { rootMargin: '-25% 0px -65% 0px' }
      );
      pairs.forEach((pair) => sectionObserver!.observe(pair.element));
    }

    // Keep the dock away from access forms even when Safari leaves a clicked
    // submit button unfocused. A focus-only guard can uncover it mid-click.
    let endGuardObserver: IntersectionObserver | undefined;
    const endGuards = document.querySelectorAll('.next-project, .footer, .nda-access-stack');
    if (endGuards.length) {
      const visibleEndGuards = new Set<Element>();
      endGuardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const visible = entry.isIntersecting &&
              (entry.target.matches('.nda-access-stack') || entry.intersectionRatio >= 0.1);
            if (visible) visibleEndGuards.add(entry.target);
            else visibleEndGuards.delete(entry.target);
          });
          nav.classList.toggle('is-hidden', visibleEndGuards.size > 0);
        },
        { threshold: [0, 0.1] }
      );
      endGuards.forEach((guard) => endGuardObserver!.observe(guard));
    }

    // --- Keep case controls out of the opening hero ---
    let updateHeroGuard: (() => void) | undefined;
    const hero = document.querySelector('.proj-visual-hero') || document.querySelector('.project-header');
    if (hero) {
      updateHeroGuard = () => {
        const rect = hero.getBoundingClientRect();
        const releaseLine = 0;
        const isReading = rect.bottom <= releaseLine;
        nav.classList.toggle('is-before-hero', !isReading);
        document.body.classList.toggle('case-study-reading', isReading);
      };
      updateHeroGuard();
      window.addEventListener('scroll', updateHeroGuard, { passive: true });
      window.addEventListener('resize', updateHeroGuard);
    } else {
      nav.classList.remove('is-before-hero');
      document.body.classList.add('case-study-reading');
    }

    // --- Auto-hide on scroll pause ---
    window.addEventListener('scroll', showNav, { passive: true });
    // Initial idle state after mount
    hideTimer.current = setTimeout(() => nav.classList.add('is-idle'), 3000);

    return () => {
      sectionObserver?.disconnect();
      endGuardObserver?.disconnect();
      if (updateHeroGuard) {
        window.removeEventListener('scroll', updateHeroGuard);
        window.removeEventListener('resize', updateHeroGuard);
      }
      window.removeEventListener('scroll', showNav);
      clearTimeout(hideTimer.current);
      document.body.classList.remove('case-study-reading');
    };
  }, [availableSections, showNav]);

  // Smooth scroll click handler
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setMenuOpen(false);
    const target = document.getElementById(id);
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    // The sheet must remove background inertness before focusing the chapter.
    if (compact && menuOpen) requestAnimationFrame(() => target.focus({ preventScroll: true }));
    else target.focus({ preventScroll: true });
    setActiveSectionId(id);
    window.history.replaceState(window.history.state, '', `#${encodeURIComponent(id)}`);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 24;
    const lenis = (window as unknown as Record<string, { scrollTo?: (target: number, options?: { duration?: number }) => void }>).__lenis
    if (lenis?.scrollTo && !reducedMotion) {
      lenis.scrollTo(top, { duration: 1 })
      return
    }
    window.scrollTo({ top, behavior: reducedMotion ? 'instant' : 'smooth' });
  };

  if (!availableSections.length && !hasExpandAction && !modeAction && !liveUrl) return null;

  return (
    <nav
      ref={navRef}
      className={`cs-bottom-nav cs-bottom-nav--${placement} surface-glass`}
      id="cs-bottom-nav"
      aria-label="Case study sections"
      style={{ '--cs-bnav-progress': `${progress}%` } as React.CSSProperties}
      onMouseEnter={() => {
        clearTimeout(hideTimer.current);
        navRef.current?.classList.remove('is-idle');
      }}
      onMouseLeave={() => {
        hideTimer.current = setTimeout(() => {
          navRef.current?.classList.add('is-idle');
        }, 2500);
      }}
      onFocus={() => {
        clearTimeout(hideTimer.current);
        navRef.current?.classList.remove('is-idle');
      }}
      onBlur={(e) => {
        if (navRef.current?.contains(e.relatedTarget as Node)) return;
        hideTimer.current = setTimeout(() => {
          navRef.current?.classList.add('is-idle');
        }, 2500);
      }}
    >
      {/* Reading progress bar */}
      <div className="cs-bnav-progress" />

      {usesChapterMenu && activeSection ? (
        <div className="cs-bnav-chapter-control">
          <button
            type="button"
            className="cs-bnav-link cs-bnav-chapters figma-hover"
            aria-expanded={menuOpen}
            aria-controls="cs-bnav-chapter-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="cs-bnav-current-prefix">Chapter</span>
            <span className="cs-bnav-current-label">{activeSection.label}</span>
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M2.5 7.5 6 4l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <FigmaSelect />
          </button>
          {compact ? menuOpen && (
            <CompactSheet title="Case study chapters" id="cs-bnav-chapter-menu" onClose={closeChapters} returnFocus={navRef.current?.querySelector<HTMLButtonElement>('.cs-bnav-chapters')}>
            <div className="cs-bnav-menu-list">
              {availableSections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`cs-bnav-menu-link${section.id === activeSectionId ? ' active' : ''}`}
                  aria-current={section.id === activeSectionId ? 'location' : undefined}
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={(event) => handleClick(event, section.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.label}
                </a>
              ))}
            </div>
            </CompactSheet>
          ) : (
          <div
            id="cs-bnav-chapter-menu"
            className={`cs-bnav-menu${menuOpen ? ' is-open' : ''}`}
            aria-hidden={!menuOpen}
          >
            <div className="cs-bnav-menu-head">
              <span>Case study chapters</span>
              <span>{availableSections.length}</span>
            </div>
            <div className="cs-bnav-menu-list">
              {availableSections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`cs-bnav-menu-link${section.id === activeSectionId ? ' active' : ''}`}
                  aria-current={section.id === activeSectionId ? 'location' : undefined}
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={(event) => handleClick(event, section.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.label}
                </a>
              ))}
            </div>
          </div>
          )}
        </div>
      ) : null}

      {directSections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`cs-bnav-link figma-hover${s.id === activeSectionId ? ' active' : ''}`}
          aria-current={s.id === activeSectionId ? 'location' : undefined}
          onClick={(e) => handleClick(e, s.id)}
        >
          {s.label.trim().toLowerCase() === 'tl;dr' ? 'Quick read' : s.label}
          <FigmaSelect />
        </a>
      ))}
      {modeAction && (
        <button
          type="button"
          className="cs-bnav-link cs-bnav-action figma-hover"
          onClick={() => {
            modeAction.onClick()
          }}
        >
          {modeAction.label}
          <FigmaSelect />
        </button>
      )}
      {!modeAction && hasExpandAction && (
        <button
          type="button"
          className="cs-bnav-link cs-bnav-action figma-hover"
          onClick={() => {
            document.querySelector<HTMLButtonElement>('.cs-expand-preview-btn')?.click();
          }}
        >
          Full story
          <FigmaSelect />
        </button>
      )}
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cs-bnav-link cs-bnav-live figma-hover"
        >
          Live site
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <FigmaSelect />
        </a>
      )}
    </nav>
  );
}
