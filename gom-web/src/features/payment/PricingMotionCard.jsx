import React, { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../../lib/utils';

gsap.registerPlugin(useGSAP);

export const PricingMotionCard = ({
  children,
  featured = false,
  selected = false,
  dimmed = false,
  onClick,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: '48%', y: '32%' });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useGSAP(
    () => {
      if (!selected || prefersReducedMotion || !cardRef.current) return;

      const badge = cardRef.current.querySelector('.selected-badge');
      const shine = cardRef.current.querySelector('.selected-shine');
      const card = cardRef.current;

      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

      timeline
        .fromTo(
          card,
          { y: 0, scale: 1 },
          {
            y: -7,
            scale: 1.045,
            duration: 0.22,
          }
        )
        .to(card, {
          y: 0,
          scale: 1,
          duration: 0.28,
          ease: 'back.out(1.4)',
        })
        .fromTo(
          badge,
          { scale: 0.5, rotate: -26, opacity: 0 },
          {
            scale: 1,
            rotate: 0,
            opacity: 1,
            duration: 0.36,
            ease: 'back.out(1.9)',
          },
          0.08
        )
        .fromTo(
          shine,
          { x: '-120%', opacity: 0 },
          { x: '220%', opacity: 0.64, duration: 0.76 },
          0.14
        );

      return () => timeline.kill();
    },
    { scope: cardRef, dependencies: [selected, prefersReducedMotion], revertOnUpdate: true }
  );

  const spotlightStyle = useMemo(
    () => ({
      background: `radial-gradient(500px circle at ${spotlight.x} ${spotlight.y}, rgba(159, 183, 201, 0.3), transparent 55%)`,
    }),
    [spotlight]
  );

  const handleMouseMove = (event) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setSpotlight({ x: `${x}%`, y: `${y}%` });
    setTilt({ x: (50 - y) / 7.8, y: (x - 50) / 6.5 });
  };

  const clearHover = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
    setSpotlight({ x: '48%', y: '32%' });
  };

  return (
    <motion.article
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={clearHover}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -12,
              scale: 1.036,
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.992 }}
      transition={{ type: 'spring', stiffness: 255, damping: 22 }}
      style={
        prefersReducedMotion
          ? undefined
          : {
              transformPerspective: 1300,
              rotateX: tilt.x,
              rotateY: tilt.y,
              transformStyle: 'preserve-3d',
            }
      }
      className={cn(
        'group pricing-card relative cursor-pointer overflow-hidden rounded-[30px] border bg-[#FFFCF7] p-7 shadow-[0_26px_64px_-38px_rgba(16,42,86,0.75)] transition-[opacity,box-shadow,border-color]',
        'dark:bg-[#101B35] dark:shadow-[0_30px_70px_-44px_rgba(0,0,0,0.9)]',
        selected
          ? 'border-navy/75 dark:border-ceramic/55'
          : featured
          ? 'border-ceramic-hover/70 dark:border-ceramic/38'
          : 'border-ceramic-border/70 dark:border-ceramic/22',
        dimmed && !selected && 'opacity-[0.78]',
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300',
          hovered && 'opacity-100'
        )}
        style={spotlightStyle}
      />

      {(featured || selected) && !prefersReducedMotion && (
        <motion.span
          className="pointer-events-none absolute top-0 h-px w-24 bg-gradient-to-r from-transparent via-ceramic-hover to-transparent"
          animate={{ x: ['-20%', '340%'] }}
          transition={{ repeat: Infinity, duration: selected ? 2.5 : 3.2, ease: 'easeInOut' }}
        />
      )}

      <div className="selected-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0" />

      <motion.div
        className={cn(
          'selected-badge absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-navy/20 bg-navy text-white shadow-md dark:border-ceramic/35 dark:bg-ceramic dark:text-navy-dark',
          selected ? 'opacity-100' : 'opacity-0'
        )}
        animate={
          selected
            ? { scale: 1, rotate: 0, opacity: 1 }
            : { scale: 0.7, rotate: -22, opacity: 0 }
        }
        transition={{ duration: 0.24 }}
      >
        <Check size={16} strokeWidth={3} />
      </motion.div>

      <div className="relative z-[1]">{children}</div>
    </motion.article>
  );
};

export default PricingMotionCard;