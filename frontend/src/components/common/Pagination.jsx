import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export function Pagination({
  page = 0,
  totalPages = 1,
  totalElements = 0,
  hasNext = false,
  hasPrevious = false,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-200 text-sm text-slate-600', className)}>
      <div>
        Showing page <span className="font-semibold text-slate-900">{page + 1}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
        {totalElements > 0 && (
          <span className="text-slate-400 ml-1">({totalElements} total items)</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious && page <= 0}
          onClick={() => onPageChange(page - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
          {page + 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext && page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
