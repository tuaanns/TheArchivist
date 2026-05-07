import React from 'react';
import { cn } from '../../lib/utils';

export const PageHeader = ({ eyebrow, title, subtitle, actions, className, centered = false }) => (
  <div
    className={cn(
      'mb-10 flex flex-col gap-2',
      centered ? 'items-center text-center' : 'items-start',
      'md:mb-14',
      className
    )}
  >
    {eyebrow && (
      <span className="text-xs font-extrabold uppercase tracking-wider leading-eyebrow text-ceramic">
        {eyebrow}
      </span>
    )}
    <h2 className="font-heading text-3xl font-extrabold leading-[1.32] text-balance text-navy dark:text-ivory md:text-4xl md:leading-[1.3]">
      {title}
    </h2>
    {subtitle && (
      <p
        className={cn(
          'max-w-2xl text-base leading-paragraph text-muted dark:text-dark-text-muted md:leading-paragraph-relaxed',
          centered && 'mx-auto text-center'
        )}
      >
        {subtitle}
      </p>
    )}
    {actions && <div className="mt-3">{actions}</div>}
  </div>
);

export default PageHeader;

