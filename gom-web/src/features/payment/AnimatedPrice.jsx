import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const formatViPrice = (number) => new Intl.NumberFormat('vi-VN').format(number);

export const AnimatedPrice = ({
  value = 0,
  play = true,
  duration = 1.2,
  className,
  suffix = ' đ',
}) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current) return;

    if (!play) {
      textRef.current.textContent = `${formatViPrice(value)}${suffix}`;
      return;
    }

    const state = { val: 0 };
    const tween = gsap.to(state, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (textRef.current) {
          textRef.current.textContent = `${formatViPrice(Math.round(state.val))}${suffix}`;
        }
      },
      onComplete: () => {
        if (textRef.current) {
          textRef.current.textContent = `${formatViPrice(value)}${suffix}`;
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [duration, play, suffix, value]);

  return <span ref={textRef} className={className}>{`${formatViPrice(0)}${suffix}`}</span>;
};

export default AnimatedPrice;