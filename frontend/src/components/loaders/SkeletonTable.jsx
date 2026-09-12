import React from 'react';

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 p-4 shadow-soft-sm animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="w-48 h-6 bg-slate-200 rounded-md" />
        <div className="w-24 h-8 bg-slate-200 rounded-lg" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="py-4 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 bg-slate-200 rounded-md"
                style={{ width: `${Math.floor(100 / cols) - 4}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
