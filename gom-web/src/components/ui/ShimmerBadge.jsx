import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// ShimmerBadge — badge with subtle shimmer animation for discount labels
export const ShimmerBadge = ({ children, variant = 'danger', className }) => {
  const variants = {
    danger: 'bg-danger/15 text-danger',
    ceramic: 'bg-ceramic/20 text-ceramic-dark dark:bg-ceramic/15 dark:text-ceramic',
    gold: 'bg-ceramic/15 text-ceramic-dark',
    success: 'bg-success/15 text-success',
    navy: 'bg-navy/15 text-navy dark:bg-ceramic/15 dark:text-ceramic',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative inline-flex items-center overflow-hidden rounded-full px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide',
        variants[variant],
        className
      )}
    >
      {/* Subtle shimmer */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 3,
        }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        style={{ width: '50%' }}
      />

      <span className="relative z-[1]">{children}</span>
    </motion.span>
  );
};

export default ShimmerBadge;

