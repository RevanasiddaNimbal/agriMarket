import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ size = 'md', text = 'Loading...', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-3', className)}>
      <Loader2 className={cn('animate-spin text-brand-600', sizes[size])} />
      {text && <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">{text}</p>}
    </div>
  );
}
