import React from 'react';

export function SkeletonCard({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-white border border-slate-100 p-4 shadow-soft-sm animate-pulse space-y-4"
        >
          <div className="w-full h-48 bg-slate-200 rounded-xl" />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="w-16 h-4 bg-slate-200 rounded-md" />
              <div className="w-12 h-4 bg-slate-200 rounded-md" />
            </div>
            <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
            <div className="w-full h-3 bg-slate-200 rounded-md" />
          </div>
          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <div className="w-20 h-6 bg-slate-200 rounded-md" />
            <div className="w-24 h-9 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
