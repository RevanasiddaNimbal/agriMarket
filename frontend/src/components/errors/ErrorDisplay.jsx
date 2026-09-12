import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

export function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An error occurred while loading this information. Please try again.',
  onRetry,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-100 max-w-md mx-auto my-6', className)}>
      <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="danger" icon={RefreshCw}>
          Retry
        </Button>
      )}
    </div>
  );
}
