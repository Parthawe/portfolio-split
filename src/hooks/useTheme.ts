import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') return stored;
    } catch { /* private browsing or storage disabled */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    let themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-user-theme]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      themeColor.dataset.userTheme = '';
      document.head.append(themeColor);
    }
    themeColor.content = theme === 'dark' ? '#111110' : '#FAFAF8';
    try { localStorage.setItem('theme', theme); } catch { /* private browsing */ }
  }, [theme]);

  useEffect(() => {
    const syncTheme = () => {
      const next = document.documentElement.dataset.theme;
      if (next === 'light' || next === 'dark') setTheme(next);
    };

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('storage', syncTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, toggleTheme } as const;
}
