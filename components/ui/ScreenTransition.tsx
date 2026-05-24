'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  screenKey: string;
}

export function ScreenTransition({ children, screenKey }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="flex flex-col flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
