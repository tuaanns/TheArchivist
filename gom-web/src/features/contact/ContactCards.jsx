import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { cn } from '../../lib/utils';

const getEntryDirection = (event) => {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;
  const absX = Math.abs(x / (rect.width / 2));
  const absY = Math.abs(y / (rect.height / 2));

  if (absX > absY) {
    return x > 0 ? 'right' : 'left';
  }

  return y > 0 ? 'bottom' : 'top';
};

const directionOffsets = {
  top: { x: 0, y: '-100%' },
  right: { x: '100%', y: 0 },
  bottom: { x: 0, y: '100%' },
  left: { x: '-100%', y: 0 },
};

export const ContactDirectionCard = ({
  icon: Icon,
  title,
  value,
  note,
  ctaText,
  ctaLink,
  active,
  onHover,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [direction, setDirection] = useState('top');

  const enterCard = (event) => {
    const entry = getEntryDirection(event);
    setDirection(entry);
    onHover?.();
  };

  return (
    <motion.article
      onMouseEnter={enterCard}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -10,
              scale: 1.023,
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.992 }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
      className={cn(
        'group relative isolate h-full overflow-hidden rounded-[24px] border border-ceramic-border/75 bg-[#FFFCF7] p-6 shadow-[0_20px_34px_-28px_rgba(16,42,86,0.64)]',
        'dark:border-ceramic/30 dark:bg-[#111C36] dark:shadow-[0_20px_48px_-34px_rgba(0,0,0,0.9)]',
        className
      )}
    >
      {!prefersReducedMotion && (
        <AnimatePresence mode="wait">
          <motion.div
            key={direction + String(active)}
            initial={directionOffsets[direction]}
            animate={{ x: 0, y: 0 }}
            exit={directionOffsets[direction]}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-ceramic-soft/80 via-ceramic-soft/25 to-transparent',
              'dark:from-ceramic/20 dark:via-ceramic/5',
              active ? 'opacity-100' : 'opacity-0'
            )}
          />
        </AnimatePresence>
      )}

      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : active
            ? { rotate: [0, -10, 8, 0], scale: [1, 1.07, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-ceramic-border/70 bg-ceramic-soft/65 text-navy dark:border-ceramic/35 dark:bg-ceramic/18 dark:text-ivory"
      >
        <Icon size={22} />
      </motion.div>

      <h4 className="relative font-heading text-lg font-bold leading-[1.28] text-navy dark:text-ivory">{title}</h4>
      <p className="relative mt-1 text-base font-bold leading-[1.35] text-navy dark:text-ivory">{value}</p>
      <p className="relative mt-2 text-xs leading-[1.8] text-muted dark:text-dark-text-muted">{note}</p>

      {ctaText && (
        <a
          href={ctaLink}
          className="relative mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.13em] text-ceramic-dark transition-transform duration-300 group-hover:translate-x-1 dark:text-ceramic"
        >
          {ctaText}
          <ArrowRight size={12} />
        </a>
      )}
    </motion.article>
  );
};

export const ContactHoverGrid = ({ items, className }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div
      className={cn('grid gap-6 md:grid-cols-3', className)}
      onMouseLeave={() => setActiveIndex(0)}
    >
      {items.map((item, index) => (
        <div key={item.title} className="relative" onMouseEnter={() => setActiveIndex(index)}>
          {activeIndex === index && (
            <motion.div
              layoutId="contact-hover-highlight"
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="pointer-events-none absolute -inset-1 -z-10 rounded-[28px] bg-ceramic/18 blur-lg dark:bg-ceramic/12"
            />
          )}
          <ContactDirectionCard
            {...item}
            active={activeIndex === index}
            onHover={() => setActiveIndex(index)}
          />
        </div>
      ))}
    </div>
  );
};

export const ContactFormCard = ({ title, subtitle, children, className, cardClassName }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale: 0.96, clipPath: 'inset(8% 0% 0% 0% round 28px)' }}
    whileInView={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
    viewport={{ once: true, amount: 0.18 }}
    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
  >
    <Card
      className={cn(
        'relative overflow-hidden rounded-[28px] border-ceramic-border/75 bg-[#FFFCF7] shadow-[0_24px_50px_-34px_rgba(16,42,86,0.68)] dark:border-ceramic/30 dark:bg-[#101B36]',
        cardClassName
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-ceramic-hover to-transparent" />

      <h3 className="font-heading text-2xl font-bold leading-[1.28] text-navy dark:text-ivory">{title}</h3>
      {subtitle && <p className="mt-2 text-sm leading-[1.8] text-muted dark:text-dark-text-muted">{subtitle}</p>}
      {children}
    </Card>
  </motion.div>
);

export const MagneticShimmerButton = React.forwardRef(function MagneticShimmerButton(
  { className, children, ...props },
  ref
) {
  const prefersReducedMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (event) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    setOffset({ x, y });
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={prefersReducedMotion ? undefined : { x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.4 }}
      className="w-full"
    >
      <ShimmerButton ref={ref} size="lg" variant="ceramic" className={cn('w-full', className)} {...props}>
        {children}
      </ShimmerButton>
    </motion.div>
  );
});

export const AnimatedFAQCard = ({ title, items, className }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqItems = useMemo(() => items || [], [items]);

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-[26px] border-ceramic-border/75 bg-[#FFFCF7] dark:border-ceramic/30 dark:bg-[#101B36]',
        className
      )}
    >
      <h4 className="mb-3 font-heading text-lg font-bold leading-[1.28] text-navy dark:text-ivory">{title}</h4>

      {faqItems.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question} className="border-b border-ceramic-border/70 last:border-b-0 dark:border-ceramic/20">
            <button
              type="button"
              onClick={() => setOpenIndex((prev) => (prev === index ? -1 : index))}
              className="group flex w-full items-center justify-between py-4 text-left"
              aria-expanded={open}
            >
              <span className="relative text-sm font-bold leading-[1.65] text-navy dark:text-ivory">
                {item.question}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-ceramic-hover transition-all duration-300 group-hover:w-full" />
              </span>
              <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown size={16} className="text-muted dark:text-dark-text-muted" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -5 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -4 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-4 text-sm leading-[1.82] text-muted dark:text-dark-text-muted">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </Card>
  );
};

export default ContactDirectionCard;