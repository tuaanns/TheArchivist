import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  primary:
    'bg-navy text-white hover:bg-navy-light hover:shadow-lg active:scale-[0.98] dark:bg-ceramic dark:text-navy-dark dark:hover:bg-ceramic-light',
  secondary:
    'bg-surface-alt text-navy hover:bg-stroke active:scale-[0.98] dark:bg-dark-surface-alt dark:text-dark-text dark:hover:bg-dark-stroke',
  ghost:
    'bg-transparent text-navy hover:bg-surface-alt dark:text-dark-text dark:hover:bg-dark-surface-alt',
  outline:
    'border border-stroke bg-transparent text-navy hover:bg-surface-alt dark:border-dark-stroke dark:text-dark-text dark:hover:bg-dark-surface-alt',
  danger: 'bg-danger text-white hover:bg-danger/90 active:scale-[0.98]',
  gold: 'bg-gradient-gold text-navy-dark hover:shadow-glow active:scale-[0.98]',
  link: 'bg-transparent text-navy underline-offset-4 hover:underline px-0 py-0 dark:text-ceramic',
};

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-14 px-8 text-base rounded-2xl',
  xl: 'h-16 px-10 text-base rounded-2xl',
  icon: 'h-10 w-10 rounded-full',
};

export const Button = React.forwardRef(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    loading,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onMouseEnter={() => !isDisabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 select-none overflow-hidden',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Glare effect on hover */}
      {!isDisabled && (
        <span
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent',
            'transition-transform duration-700 ease-out',
            isHovered ? 'translate-x-full' : '-translate-x-full'
          )}
          style={{ width: '50%' }}
        />
      )}

      {/* Content */}
      <span className="relative z-[1] flex items-center gap-2">
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </span>
    </button>
  );
});

export default Button;

