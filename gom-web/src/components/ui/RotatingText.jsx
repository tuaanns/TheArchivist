import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// RotatingText — animated rotating text component
const RotatingText = ({
  texts = [],
  mainClassName = '',
  splitLevelClassName = '',
  staggerFrom = 'last',
  initial = { y: '100%' },
  animate = { y: 0 },
  exit = { y: '-120%' },
  staggerDuration = 0.025,
  transition = { type: 'spring', damping: 30, stiffness: 400 },
  rotationInterval = 2000,
  splitBy = 'characters',
  autoloop = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoloop || texts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoloop, texts.length, rotationInterval]);

  const currentText = texts[currentIndex] || '';
  const characters = splitBy === 'characters' ? currentText.split('') : [currentText];

  return (
    <div className={`inline-flex ${mainClassName}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="flex"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {characters.map((char, i) => {
            const delay =
              staggerFrom === 'last'
                ? (characters.length - 1 - i) * staggerDuration
                : i * staggerDuration;

            return (
              <motion.span
                key={`${currentIndex}-${i}`}
                className={splitLevelClassName}
                initial={initial}
                animate={animate}
                exit={exit}
                transition={{
                  ...transition,
                  delay,
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RotatingText;

