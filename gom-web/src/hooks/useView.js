import { useEffect, useState, useCallback } from 'react';

// useView — hash-based router, initial view from window.location.hash with fallback
export function useView(defaultView = 'debate') {
  const initialView =
    typeof window !== 'undefined' && window.location.hash
      ? window.location.hash.replace('#', '')
      : defaultView;

  const [view, setView] = useState(initialView);

  useEffect(() => {
    if (view) {
      window.location.hash = view;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  useEffect(() => {
    const onHash = () => {
      const next = window.location.hash.replace('#', '') || defaultView;
      setView(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [defaultView]);

  const navigate = useCallback((next) => setView(next), []);

  return [view, navigate];
}

