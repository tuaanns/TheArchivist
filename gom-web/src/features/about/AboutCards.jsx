import React, { useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../../lib/utils';

gsap.registerPlugin(useGSAP);

const formatNumber = (value, decimals = 0) =>
  new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

const getEntrance = (index = 0) => {
  const directions = [
    { x: -26, y: 28 },
    { x: 30, y: 24 },
    { x: 22, y: -20 },
    { x: -20, y: -18 },
  ];
  return directions[index % directions.length];
};

export const AboutBentoGrid = ({ className, children }) => (
  <div className={cn('grid gap-6 md:grid-cols-6', className)}>{children}</div>
);

export const AboutBentoCard = ({ icon: Icon, title, desc, className, index = 0 }) => {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [glare, setGlare] = useState({ x: '55%', y: '20%' });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const entry = useMemo(() => getEntrance(index), [index]);

  const handleMove = (event) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setGlare({ x: `${x}%`, y: `${y}%` });
    setTilt({ x: (50 - y) / 9, y: (x - 50) / 8 });
  };

  const clearHover = () => {
    setHovered(false);
    setGlare({ x: '55%', y: '20%' });
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.article
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMove}
      onMouseLeave={clearHover}
      initial={{ opacity: 0, x: entry.x, y: entry.y, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -9,
              scale: 1.022,
            }
      }
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
      className={cn(
        'group relative overflow-hidden rounded-[26px] border border-ceramic-border/80 bg-[#FFFCF7] p-7 shadow-[0_24px_58px_-36px_rgba(16,42,86,0.68)]',
        'dark:border-ceramic/30 dark:bg-[#0F1830] dark:shadow-[0_26px_62px_-40px_rgba(0,0,0,0.88)]',
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300',
          hovered && 'opacity-100'
        )}
        style={{
          background: `radial-gradient(380px circle at ${glare.x} ${glare.y}, rgba(201, 216, 230, 0.38), transparent 60%)`,
        }}
      />

      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : hovered
            ? { y: [0, -4, 0], rotate: [0, -8, 8, 0] }
            : { y: 0, rotate: 0 }
        }
        transition={{ duration: 0.72, ease: 'easeInOut' }}
        className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-ceramic-border/70 bg-ceramic-soft/60 text-navy dark:border-ceramic/30 dark:bg-ceramic/18 dark:text-ivory"
      >
        <Icon size={28} />
      </motion.div>

      <h3 className="relative font-heading text-[1.42rem] font-bold leading-[1.24] text-navy dark:text-ivory">{title}</h3>
      <p className="relative mt-3 text-sm leading-[1.85] text-muted dark:text-dark-text-muted">{desc}</p>

      <div className="pointer-events-none absolute inset-x-7 bottom-0 h-px bg-gradient-to-r from-transparent via-ceramic-border/85 to-transparent dark:via-ceramic/35" />
    </motion.article>
  );
};

export const AnimatedStatCard = ({ value = 0, decimals = 0, suffix = '', label, icon: Icon, progress = 0 }) => {
  const rootRef = useRef(null);
  const valueRef = useRef(null);
  const inView = useInView(rootRef, { once: true, amount: 0.4 });

  useGSAP(
    () => {
      if (!inView || !valueRef.current) return;

      const state = { val: 0 };
      const tween = gsap.to(state, {
        val: value,
        duration: 1.25,
        ease: 'power2.out',
        onUpdate: () => {
          valueRef.current.textContent = `${formatNumber(state.val, decimals)}${suffix}`;
        },
        onComplete: () => {
          valueRef.current.textContent = `${formatNumber(value, decimals)}${suffix}`;
        },
      });

      return () => tween.kill();
    },
    { scope: rootRef, dependencies: [inView, value, decimals, suffix], revertOnUpdate: true }
  );

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-ceramic-border/65 bg-white/95 p-6 text-navy shadow-[0_20px_40px_-34px_rgba(0,0,0,0.65)] dark:border-ceramic/25 dark:bg-[#13213E] dark:text-ivory"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-heading text-4xl font-black leading-none md:text-[2.65rem]">
            <span ref={valueRef}>0</span>
          </div>
          <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted dark:text-dark-text-muted">
            {label}
          </p>
        </div>
        {Icon && (
          <div className="mt-1 rounded-xl bg-ceramic-soft/70 p-2.5 text-navy dark:bg-ceramic/20 dark:text-ceramic-soft">
            <Icon size={16} />
          </div>
        )}
      </div>

      {progress > 0 && (
        <div className="mt-5 h-1.5 rounded-full bg-ceramic-soft/85 dark:bg-ceramic/20">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: Math.min(Math.max(progress / 100, 0), 1) }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="h-full origin-left rounded-full bg-gradient-to-r from-ceramic-hover to-navy dark:from-ceramic dark:to-ceramic-soft"
          />
        </div>
      )}
    </motion.div>
  );
};

export const MissionStatementCard = ({ title, highlight, p1, p2, stats }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[34px] border border-ceramic-border/35 bg-gradient-to-br from-[#102A56] via-[#163462] to-[#1A3C6A] p-8 text-ivory shadow-[0_34px_80px_-44px_rgba(7,14,31,0.9)] md:p-12"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, rgba(201, 216, 230, 0.16), rgba(201, 162, 39, 0.06), rgba(159, 183, 201, 0.16))',
          backgroundSize: '220% 220%',
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h3 className="font-heading text-3xl font-black leading-[1.24] md:text-4xl md:leading-[1.2]">
            {title}{' '}
            <span className="text-ceramic-soft">{highlight}</span>
          </h3>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
            className="mt-6 h-px origin-left bg-gradient-to-r from-[#C9A227] via-ceramic-soft to-transparent"
          />

          <p className="mt-6 text-base leading-[1.8] text-ivory/90">{p1}</p>
          <p className="mt-4 text-base leading-[1.8] text-ivory/90">{p2}</p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.18, ease: 'easeOut' }}
            className="mt-7 h-px origin-left bg-gradient-to-r from-ceramic-soft via-[#C9A227] to-transparent"
          />
        </div>

        <div className="grid gap-4">
          {stats.map((stat) => (
            <AnimatedStatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default AboutBentoGrid;