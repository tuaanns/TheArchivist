import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LoadingState = ({ message = 'Đang tải...', className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-4 py-16 text-muted dark:text-dark-text-muted',
      className
    )}
  >
    <Loader2 className="h-8 w-8 animate-spin text-navy dark:text-ceramic" />
    <p className="text-sm">{message}</p>
  </div>
);

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Chưa có dữ liệu',
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-4 py-16 text-center',
      className
    )}
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt dark:bg-dark-surface-alt">
      <Icon className="h-8 w-8 text-muted dark:text-dark-text-muted" />
    </div>
    <div>
      <h3 className="font-heading text-lg font-bold text-navy dark:text-ivory">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-muted dark:text-dark-text-muted">
          {description}
        </p>
      )}
    </div>
    {action}
  </div>
);

export const ErrorState = ({
  message = 'Đã có lỗi xảy ra',
  onRetry,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-4 py-16 text-center',
      className
    )}
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
      <AlertCircle className="h-8 w-8 text-danger" />
    </div>
    <p className="max-w-md text-sm text-muted dark:text-dark-text-muted">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light dark:bg-ceramic dark:text-navy-dark"
      >
        Thử lại
      </button>
    )}
  </div>
);

export const Skeleton = ({ className }) => (
  <div
    className={cn(
      'animate-pulse rounded-lg bg-surface-alt dark:bg-dark-surface-alt',
      className
    )}
  />
);

