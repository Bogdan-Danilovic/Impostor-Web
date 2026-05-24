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
          <label className="block text-[10px] font-medium text-slate-500 mb-2 tracking-[0.2em] uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          suppressHydrationWarning
          className={`
            w-full bg-white/[0.03] border-b border-white/[0.08]
            px-0 py-3 text-[15px] text-slate-100 min-h-[44px]
            placeholder:text-slate-600
            focus:outline-none focus:border-violet-500/40
            transition-colors duration-300
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
