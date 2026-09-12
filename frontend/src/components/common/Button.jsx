import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-soft-sm hover:shadow-brand-glow focus:ring-brand-500',
    secondary: 'bg-emerald-50 hover:bg-emerald-100 text-brand-700 border border-brand-200 focus:ring-brand-500',
    earth: 'bg-earth-600 hover:bg-earth-700 text-white shadow-soft-sm focus:ring-earth-500',
    outline: 'border-2 border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-slate-700 hover:text-brand-700 focus:ring-brand-500',
    ghost: 'text-slate-600 hover:text-brand-600 hover:bg-brand-50/60 focus:ring-brand-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-soft-sm focus:ring-rose-500',
    dark: 'bg-slate-900 hover:bg-slate-800 text-white shadow-soft-sm focus:ring-slate-700',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}
