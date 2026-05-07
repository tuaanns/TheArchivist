import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../../lib/utils';

gsap.registerPlugin(useGSAP);

export const PaymentStepper = ({ steps = [], current = 0, className }) => {
  const prefersReducedMotion = useReducedMotion();
  const rootRef = useRef(null);
  const progress = steps.length > 1 ? (Math.min(Math.max(current, 0), steps.length - 1) / (steps.length - 1)) * 100 : 0;
  const trackInset = steps.length > 0 ? `${50 / steps.length}%` : '0%';

  useGSAP(
    () => {
      if (!rootRef.current) return;

      const progressLine = rootRef.current.querySelector('.payment-stepper-progress');
      const currentStep = rootRef.current.querySelector(`[data-step-index="${current}"]`);

      if (progressLine) {
        if (prefersReducedMotion) {
          gsap.set(progressLine, { width: `${progress}%` });
        } else {
          gsap.to(progressLine, {
            width: `${progress}%`,
            duration: 0.62,
            ease: 'power3.out',
          });
        }
      }

      if (currentStep && !prefersReducedMotion) {
        gsap.fromTo(
          currentStep,
          { scale: 0.82, opacity: 0.72 },
          { scale: 1, opacity: 1, duration: 0.36, ease: 'back.out(1.7)' }
        );
      }
    },
    { scope: rootRef, dependencies: [current, progress, prefersReducedMotion], revertOnUpdate: true }
  );

  return (
    <div ref={rootRef} className={cn('relative mx-auto w-full max-w-3xl', className)}>
      <div
        className="pointer-events-none absolute top-5 h-[2px] rounded-full bg-ceramic-soft/85 dark:bg-ceramic/20"
        style={{ left: trackInset, right: trackInset }}
      >
        <div className="payment-stepper-progress h-full w-0 rounded-full bg-gradient-to-r from-ceramic-hover via-ceramic to-navy dark:from-ceramic dark:to-ceramic-soft" />
      </div>

      <ol className="relative flex items-start justify-between gap-2">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index <= current;
          return (
            <li key={step.id ?? index} className="flex flex-1 flex-col items-center text-center">
              <motion.div
                data-step-index={index}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold shadow-sm transition-colors duration-300',
                  active
                    ? 'bg-navy text-white dark:bg-ceramic dark:text-navy-dark'
                    : 'bg-ceramic-soft text-muted dark:bg-ceramic/15 dark:text-dark-text-muted'
                )}
                animate={
                  done
                    ? { boxShadow: '0 0 0 8px rgba(159,183,201,0.15)' }
                    : { boxShadow: '0 0 0 0px rgba(159,183,201,0)' }
                }
                transition={{ duration: 0.25 }}
              >
                {done ? <Check size={15} strokeWidth={3} /> : index + 1}
              </motion.div>

              <span
                className={cn(
                  'mt-3 px-2 text-[11px] font-extrabold uppercase tracking-[0.12em] leading-[1.4]',
                  active ? 'text-navy dark:text-ivory' : 'text-muted dark:text-dark-text-muted'
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default PaymentStepper;