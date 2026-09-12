import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no records available at this time.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-soft-sm max-w-lg mx-auto my-8', className)}>
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
