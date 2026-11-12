import { useEffect, type RefObject } from 'react';

export function useNavScroll(navRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const update = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 20);
      nav.classList.toggle('scrolled-deep', y > 100);
    };

    // Set initial state
    update();

    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
    };
  }, [navRef]);
}
