import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'SkillHunt:theme';
const VALID = new Set(['light', 'dark', 'system']);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};

const resolveAppliedTheme = (theme) => {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  }
  return theme;
};

const applyThemeClass = (appliedTheme) => {
  const root = document.documentElement;
  if (appliedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && VALID.has(saved) ? saved : 'system';
  });

  const [appliedTheme, setAppliedTheme] = useState(() =>
    resolveAppliedTheme(
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY) || 'system'
        : 'system'
    )
  );

  // Apply theme class on any change.
  useEffect(() => {
    const next = resolveAppliedTheme(theme);
    setAppliedTheme(next);
    applyThemeClass(next);
  }, [theme]);

  // React to OS-level changes when user is on "system".
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const next = e.matches ? 'dark' : 'light';
      setAppliedTheme(next);
      applyThemeClass(next);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((value) => {
    if (!VALID.has(value)) return;
    localStorage.setItem(STORAGE_KEY, value);
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(appliedTheme === 'dark' ? 'light' : 'dark');
  }, [appliedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, appliedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
