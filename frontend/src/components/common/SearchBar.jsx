import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  onKeyDown,
  onSearch,
  className,
}) {
  return (
    <div className={cn('relative w-full', className)}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (onKeyDown) onKeyDown(e);
          if (e.key === 'Enter' && onSearch) {
            e.preventDefault();
            onSearch();
          }
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 shadow-soft-sm transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          aria-label="Clear search input"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
