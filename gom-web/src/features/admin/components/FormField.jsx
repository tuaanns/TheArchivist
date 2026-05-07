import React from 'react';
import { cn } from '../../../lib/utils';

export const FormField = ({ 
  label, 
  error, 
  required, 
  children, 
  className 
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export const Input = ({ 
  type = 'text', 
  className, 
  error,
  ...props 
}) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full rounded-lg border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',
        'dark:border-gray-600 dark:bg-gray-700 dark:text-white',
        className
      )}
      {...props}
    />
  );
};

export const Textarea = ({ 
  className, 
  error,
  rows = 4,
  ...props 
}) => {
  return (
    <textarea
      rows={rows}
      className={cn(
        'w-full rounded-lg border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',
        'dark:border-gray-600 dark:bg-gray-700 dark:text-white',
        className
      )}
      {...props}
    />
  );
};

export const Select = ({ 
  className, 
  error,
  children,
  ...props 
}) => {
  return (
    <select
      className={cn(
        'w-full rounded-lg border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',
        'dark:border-gray-600 dark:bg-gray-700 dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};

export const Checkbox = ({ 
  label,
  className,
  ...props 
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20',
          'dark:border-gray-600 dark:bg-gray-700',
          className
        )}
        {...props}
      />
      {label && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </label>
  );
};

export default FormField;
