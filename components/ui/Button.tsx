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
    'bg-violet-600 text-white',
    'hover:bg-violet-500',
    'active:bg-violet-700',
    'glow-violet-sm',
  ].join(' '),
  secondary: [
    'bg-surface/60 text-violet-300',
    'border border-violet-500/20',
    'hover:border-violet-500/40 hover:text-violet-200 hover:bg-surface-light/40',
    'active:bg-violet-500/10',
  ].join(' '),
  danger: [
    'bg-red-500/10 text-red-400',
    'border border-red-500/20',
    'hover:bg-red-500/15 hover:border-red-500/30',
    'active:bg-red-500/20',
  ].join(' '),
  ghost: [
    'bg-transparent text-slate-400',
    'hover:text-slate-200 hover:bg-white/[0.03]',
    'active:bg-white/[0.06]',
  ].join(' '),
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth, className = '', children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.015 }}
        whileTap={disabled ? undefined : { scale: 0.975 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`
          relative inline-flex items-center justify-center gap-2
          rounded-xl px-6 py-3 text-[13px] font-semibold tracking-wide
          min-h-[44px]
          transition-all duration-150
          disabled:opacity-35 disabled:pointer-events-none
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
