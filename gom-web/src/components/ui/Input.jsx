import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(function Input(
  { className, leftIcon, rightIcon, error, ...props },
  ref
) {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dark-text-muted">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border bg-surface-alt px-4 py-3 text-sm text-gray-900 placeholder:text-muted',
          'transition-all duration-200 focus:bg-surface focus:outline-none focus:border-ceramic',
          'dark:bg-dark-surface-alt dark:text-dark-text dark:placeholder:text-dark-text-muted',
          error
            ? 'border-danger focus:border-danger'
            : 'border-stroke dark:border-dark-stroke',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted dark:text-dark-text-muted">
          {rightIcon}
        </span>
      )}
    </div>
  );
});

export const Textarea = React.forwardRef(function Textarea(
  { className, error, rows = 5, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full resize-none rounded-xl border bg-surface-alt px-4 py-3 text-sm text-gray-900 placeholder:text-muted',
        'transition-all duration-200 focus:bg-surface focus:outline-none focus:border-ceramic',
        'dark:bg-dark-surface-alt dark:text-dark-text dark:placeholder:text-dark-text-muted',
        error
          ? 'border-danger focus:border-danger'
          : 'border-stroke dark:border-dark-stroke',
        className
      )}
      {...props}
    />
  );
});

export const Label = ({ className, children, ...props }) => (
  <label
    className={cn(
      'mb-2 block text-xs font-bold uppercase tracking-wide text-muted dark:text-dark-text-muted',
      className
    )}
    {...props}
  >
    {children}
  </label>
);

export const FieldError = ({ children }) => {
  if (!children) return null;
  return <p className="mt-1 text-xs text-danger">{children}</p>;
};

export default Input;

