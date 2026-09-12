import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Breadcrumb({ items = [], className }) {
  return (
    <nav className={cn('flex items-center text-xs font-medium text-slate-500 mb-4', className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-brand-600 transition-colors">
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1" />
              {isLast || !item.to ? (
                <span className="text-slate-800 font-semibold truncate max-w-xs">{item.label}</span>
              ) : (
                <Link to={item.to} className="text-slate-500 hover:text-brand-600 transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
