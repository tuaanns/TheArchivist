import React, { useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

const hexToRgba = (hex, opacity) => {
  if (!hex) return `rgba(255,255,255,${opacity})`;

  const sanitized = hex.replace('#', '');
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((char) => char + char)
          .join('')
      : sanitized;

  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int)) return `rgba(255,255,255,${opacity})`;

  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return `rgba(${r},${g},${b},${opacity})`;
};

export const GlareHover = ({
  children,
  className,
  glareColor = '#ffffff',
  glareOpacity = 0.3,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 800,
  playOnce = false,
}) => {
  const wrapperRef = useRef(null);
  const [active, setActive] = useState(false);
  const [played, setPlayed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const enabled = !playOnce || !played;
  const glowColor = useMemo(
    () => hexToRgba(glareColor, Math.min(Math.max(glareOpacity, 0), 1)),
    [glareColor, glareOpacity]
  );

  const handleMouseMove = (event) => {
    if (!enabled || !wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (!enabled) return;
    setActive(true);
  };

  const handleMouseLeave = () => {
    if (!enabled) return;
    setActive(false);
    if (playOnce) setPlayed(true);
  };

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('relative inline-block overflow-hidden rounded-[inherit]', className)}
    >
      <div className="relative z-[2]">{children}</div>

      {enabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            opacity: active ? 1 : 0,
            transition: `opacity ${Math.max(transitionDuration, 100)}ms ease`,
            background: `linear-gradient(${glareAngle}deg, transparent 0%, ${glowColor} 48%, transparent 100%), radial-gradient(${glareSize}px circle at ${position.x}% ${position.y}%, ${glowColor}, transparent 64%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  );
};

export default GlareHover;