'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] font-medium text-slate-500 mb-2 tracking-widest uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          suppressHydrationWarning
          className={`
            w-full rounded-xl
            bg-surface/50 border border-border
            px-4 py-3 text-[14px] text-slate-100 min-h-[44px]
            placeholder:text-slate-400
            focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/15
            focus:bg-surface/70
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
