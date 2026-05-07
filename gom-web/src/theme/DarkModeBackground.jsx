import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

// DarkModeBackground — animated aurora canvas, fixed full-screen behind all content (z-0)
export const DarkModeBackground = () => {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (resolvedTheme !== 'dark') return;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Color stops: subtle navy-to-gold-to-navy
    const colorStops = [
      { stop: 0.0, color: [10, 15, 31] },    // dark-bg navy
      { stop: 0.35, color: [20, 44, 110] },   // navy mid
      { stop: 0.6, color: [50, 30, 10] },     // warm amber hint
      { stop: 1.0, color: [10, 15, 31] },     // back to dark
    ];

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      for (let layer = 0; layer < 3; layer++) {
        const speed = 0.003 + layer * 0.0015;
        const amplitude = height * (0.08 + layer * 0.06);
        const yBase = height * (0.3 + layer * 0.2);

        // Build gradient along X
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        colorStops.forEach(({ stop, color }) => {
          grad.addColorStop(stop, `rgba(${color[0]},${color[1]},${color[2]},1)`);
        });

        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 8) {
          const t = x / width;
          const y =
            yBase +
            Math.sin(t * Math.PI * 2 + time * speed * 30 + layer) * amplitude +
            Math.sin(t * Math.PI * 4 + time * speed * 20 - layer * 0.5) * (amplitude * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.06 + layer * 0.03;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      time += 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [resolvedTheme, prefersReduced]);

  if (resolvedTheme !== 'dark') return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: prefersReduced ? 0 : 1 }}
    />
  );
};

export default DarkModeBackground;

