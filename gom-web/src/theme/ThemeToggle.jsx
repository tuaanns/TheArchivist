import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';

export const ThemeToggle = ({ className }) => {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-stroke bg-surface text-navy transition-colors',
        'hover:bg-surface-alt dark:border-dark-stroke dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surface-alt',
        className
      )}
      aria-label={isDark ? 'Switch to light' : 'Switch to dark'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default ThemeToggle;

