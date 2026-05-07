import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef(function Card(
  { className, padded = true, hoverable = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-stroke bg-surface shadow-sm transition-all duration-300',
        'dark:border-dark-stroke dark:bg-dark-surface',
        padded && 'p-6 md:p-8',
        hoverable && 'hover:-translate-y-1 hover:shadow-lg',
        className
      )}
      {...props}
    />
  );
});

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('mb-4 flex items-center justify-between', className)} {...props} />
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3
    className={cn(
      'font-heading text-xl font-bold text-navy dark:text-ivory',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ className, ...props }) => (
  <p
    className={cn('text-sm text-muted dark:text-dark-text-muted', className)}
    {...props}
  />
);

export default Card;

