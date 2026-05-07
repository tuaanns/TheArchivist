import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../lib/constants';

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggle: () => {},
});

const getSystemTheme = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const resolveTheme = (theme) => (theme === 'system' ? getSystemTheme() : theme);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));

  // Apply class to <html>
  useEffect(() => {
    const next = resolveTheme(theme);
    setResolvedTheme(next);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(next);
  }, [theme]);

  // Listen system change when in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = mq.matches ? 'dark' : 'light';
      setResolvedTheme(next);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next) => {
    localStorage.setItem(STORAGE_KEYS.THEME, next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

