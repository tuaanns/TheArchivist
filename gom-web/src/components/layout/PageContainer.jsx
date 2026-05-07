import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const PageContainer = ({ children, className, narrow = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className={cn(
      'mx-auto w-full px-4 pb-24 pt-10 sm:px-6 lg:px-8',
      narrow ? 'max-w-3xl' : 'max-w-content',
      className
    )}
  >
    {children}
  </motion.div>
);

export default PageContainer;

