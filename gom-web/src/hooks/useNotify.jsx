import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ToastContainer } from '../components/ui/Toast';

// Global toast notification system — single Context owns toast queue, NotifyProvider mounts ToastContainer once

const NotifyContext = createContext(null);

const DEFAULT_DURATION = 4500;
const VALID_TYPES = new Set(['success', 'error', 'info', 'warning']);

export const NotifyProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Track active timers so we can clear them on dismiss / unmount.
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message, type = 'info', duration = DEFAULT_DURATION) => {
      if (message == null) return;
      const safeType = VALID_TYPES.has(type) ? type : 'info';
      // Coerce non-string messages (Error objects, axios errors) to a readable string.
      let text;
      if (typeof message === 'string') text = message;
      else if (message?.message) text = String(message.message);
      else {
        try { text = JSON.stringify(message); } catch { text = String(message); }
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message: text, type: safeType }]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss]);

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </NotifyContext.Provider>
  );
};

// Returns global { toasts, notify, dismiss }. Falls back to no-op if provider is missing.
export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) {
    if (typeof window !== 'undefined' && !window.__notifyWarned) {
      // eslint-disable-next-line no-console
      console.warn('[useNotify] NotifyProvider is not mounted. Toasts will be no-ops.');
      window.__notifyWarned = true;
    }
    return {
      toasts: [],
      notify: () => undefined,
      dismiss: () => undefined,
    };
  }
  return ctx;
}

export default useNotify;
