import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/common/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-soft-md">
        <Sprout className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          The agricultural page or produce item you are searching for might have been moved, harvested, or does not exist.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" icon={Home}>
            Home
          </Button>
        </Link>
        <Link to="/marketplace">
          <Button icon={ShoppingBag}>
            Explore Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
}
