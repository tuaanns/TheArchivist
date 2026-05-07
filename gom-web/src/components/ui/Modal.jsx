import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Modal = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  className,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative w-full max-h-[90vh] overflow-auto rounded-2xl bg-surface shadow-lg',
              'dark:bg-dark-surface',
              sizes[size],
              className
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-dark-stroke">
                {title && (
                  <h3 className="font-heading text-lg font-bold text-navy dark:text-ivory">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="ml-auto rounded-full p-2 text-muted hover:bg-surface-alt dark:text-dark-text-muted dark:hover:bg-dark-surface-alt"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;

