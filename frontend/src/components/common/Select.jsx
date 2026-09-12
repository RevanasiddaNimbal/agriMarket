import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    icon: Icon,
    className,
    id,
    placeholder = 'Select an option',
    required,
    children,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer',
            Icon && 'pl-10',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-100',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children ||
            options.map((opt) => (
              <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
                {opt.label ?? opt.name}
              </option>
            ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});
