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
          <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl bg-surface border border-slate-600/50
            px-4 py-3.5 text-sm text-slate-100
            placeholder:text-slate-500
            focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30
            transition-colors duration-150
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
