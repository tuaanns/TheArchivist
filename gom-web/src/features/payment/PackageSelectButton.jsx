import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShimmerButton } from '../../components/ui/ShimmerButton';
import { cn } from '../../lib/utils';

export const PackageSelectButton = React.forwardRef(function PackageSelectButton(
  { className, selected = false, children, ...props },
  ref
) {
  const prefersReducedMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    setOffset({ x, y });
  };

  return (
    <motion.div
      onMouseMove={handlePointerMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={prefersReducedMotion ? undefined : { x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.45 }}
      className="w-full"
    >
      <ShimmerButton
        ref={ref}
        size="lg"
        variant={selected ? 'ceramic' : 'primary'}
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </ShimmerButton>
    </motion.div>
  );
});

export default PackageSelectButton;