import React from 'react';
import { Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

export function WishlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Saved Harvest & Crops</h2>
        <p className="text-xs text-slate-500 mt-0.5">Quickly access produce listings you are monitoring.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-soft-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Wishlist & Saved Crops Feature</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Cloud synchronized wishlists are scheduled for future platform updates. In the meantime, you can purchase any fresh crop directly with single-click Direct Checkout!
        </p>
        <div className="pt-2">
          <Link to="/marketplace">
            <Button icon={ShoppingBag}>
              Explore Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
