import React from 'react';
import { cn } from '@/utils/cn';

export function Badge({ children, variant = 'slate', size = 'sm', className }) {
  const variants = {
    brand: 'bg-emerald-50 text-brand-700 border-brand-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 font-medium',
    sm: 'text-xs px-2.5 py-1 font-semibold',
    md: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase',
        variants[variant] || variants.slate,
        sizes[size],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {children}
    </span>
  );
}
