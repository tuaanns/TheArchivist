import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// AnimatedEmptyState — icon bounce + text fade + optional CTA shimmer
export const AnimatedEmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
    {Icon && (
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        className="mb-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-ceramic/10 text-ceramic-dark dark:bg-ceramic/15"
        >
          <Icon size={36} strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    )}

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {title && (
        <h3 className="font-heading text-xl font-bold text-navy leading-card dark:text-ivory">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-2 max-w-xs text-sm leading-paragraph text-muted dark:text-dark-text-muted">
          {description}
        </p>
      )}
    </motion.div>

    {action && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-6"
      >
        {action}
      </motion.div>
    )}
  </div>
);

export default AnimatedEmptyState;

