'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  fullWidth?: boolean;
}

const styles: Record<Variant, string> = {
  primary: [
    'bg-violet-600/90 text-white',
    'hover:bg-violet-500/90',
    'active:bg-violet-700',
    'glow-v-sm',
  ].join(' '),
  secondary: [
    'bg-white/[0.03] text-violet-300/90',
    'border border-white/[0.06]',
    'hover:bg-white/[0.06] hover:text-violet-200',
    'active:bg-white/[0.08]',
  ].join(' '),
  danger: [
    'bg-red-500/10 text-red-400',
    'border border-red-500/15',
    'hover:bg-red-500/15',
    'active:bg-red-500/20',
  ].join(' '),
  ghost: [
    'bg-transparent text-slate-500',
    'hover:text-slate-300 hover:bg-white/[0.02]',
    'active:bg-white/[0.04]',
  ].join(' '),
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth, className = '', children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={disabled ? undefined : { scale: 0.98, y: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`
          relative inline-flex items-center justify-center gap-2
          rounded-lg px-5 py-3 text-[13px] font-medium tracking-wide
          min-h-[44px]
          transition-all duration-150
          disabled:opacity-30 disabled:pointer-events-none
          ${styles[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
