import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const HomeSpotlightCard = ({
  icon: Icon,
  title,
  description,
  className,
  withBeam = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: '50%', y: '40%' });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const spotlightStyle = useMemo(
    () => ({
      background: `radial-gradient(420px circle at ${spotlight.x} ${spotlight.y}, rgba(159, 183, 201, 0.32), transparent 58%)`,
    }),
    [spotlight]
  );

  const handleMouseMove = (event) => {
    if (prefersReducedMotion) return;

    const { currentTarget, clientX, clientY } = event;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setSpotlight({ x: `${x}%`, y: `${y}%` });

    const rotateY = (x - 50) / 5.2;
    const rotateX = (50 - y) / 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const resetInteractiveState = () => {
    setIsHovered(false);
    setSpotlight({ x: '50%', y: '40%' });
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.article
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={resetInteractiveState}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -11,
              scale: 1.033,
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 270, damping: 22, mass: 0.75 }}
      className={cn(
        'group relative h-full overflow-hidden rounded-[26px] border border-ceramic-border/80 bg-[#FFFCF7] p-7 shadow-[0_18px_40px_-26px_rgba(16,42,86,0.6)]',
        'dark:border-ceramic/30 dark:bg-[#121C35] dark:shadow-[0_20px_50px_-30px_rgba(0,0,0,0.85)]',
        className
      )}
      style={
        prefersReducedMotion
          ? undefined
          : {
              transformPerspective: 1200,
              rotateX: tilt.x,
              rotateY: tilt.y,
              transformStyle: 'preserve-3d',
            }
      }
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300',
          isHovered && 'opacity-100'
        )}
        style={spotlightStyle}
      />

      {withBeam && !prefersReducedMotion && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-0 h-px w-28 bg-gradient-to-r from-transparent via-ceramic-hover to-transparent"
          animate={{ x: ['-30%', '330%'] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        />
      )}

      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : isHovered
            ? {
                rotate: [0, -9, 8, 0],
                y: [0, -4, -1, 0],
              }
            : { rotate: 0, y: 0 }
        }
        transition={{ duration: 0.75, ease: 'easeInOut' }}
        className={cn(
          'relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-ceramic-border/80 bg-ceramic-soft/55 text-navy shadow-sm',
          'dark:border-ceramic/40 dark:bg-ceramic/15 dark:text-ivory'
        )}
      >
        <Icon size={24} />
      </motion.div>

      <h3 className="relative font-heading text-xl font-bold leading-[1.28] text-navy dark:text-ivory">
        {title}
      </h3>
      <p className="relative mt-3 text-sm leading-[1.8] text-muted dark:text-dark-text-muted">
        {description}
      </p>

      <div className="pointer-events-none absolute inset-x-7 bottom-0 h-px bg-gradient-to-r from-transparent via-ceramic-border/80 to-transparent dark:via-ceramic/35" />
    </motion.article>
  );
};

export default HomeSpotlightCard;