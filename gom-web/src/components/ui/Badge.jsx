import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-surface-alt text-navy dark:bg-dark-surface-alt dark:text-dark-text',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  gold: 'bg-ceramic/20 text-ceramic-dark',
  navy: 'bg-navy/15 text-navy dark:bg-navy/30 dark:text-ivory',
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  user: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export const Badge = ({ variant = 'default', className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
      variants[variant],
      className
    )}
    {...props}
  >
    {children}
  </span>
);

export default Badge;

