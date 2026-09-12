import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  ShoppingBag,
  CreditCard,
  Truck,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Button } from '@/components/common/Button';
import { getUserAvatar, getInitialsAvatar } from '@/utils/avatarUtils';

export function AdminLayout() {
  const { user } = useAuth();

  const navLinks = [
    { to: '/admin', label: 'Admin Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User Accounts', icon: Users },
    { to: '/admin/products', label: 'Product Catalog', icon: Package },
    { to: '/admin/inventory', label: 'Stock Monitoring', icon: Boxes },
    { to: '/admin/orders', label: 'Orders Monitoring', icon: ShoppingBag },
    { to: '/admin/payments', label: 'Payments & Refunds', icon: CreditCard },
    { to: '/admin/transactions', label: 'All Transactions', icon: DollarSign },
    { to: '/admin/deliveries', label: 'Delivery Dispatch', icon: Truck },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Header Banner - Same structured styling as User Dashboard banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 shadow-soft-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={getUserAvatar(user)}
                alt={user?.fullName || 'Admin'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400/40 shadow-soft-sm bg-purple-900/40"
                onError={(e) => {
                  const fallback = getInitialsAvatar(user?.fullName || 'Admin');
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
              />
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {user?.fullName || 'Administrator'}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-600/90 text-purple-50 border border-purple-400/70 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" /> Admin Console
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  icon={LayoutDashboard}
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                >
                  User Dashboard View
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative ambient background */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Admin Horizontal Sub-Navigation Tabs (scrollable on mobile) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-200">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-soft-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Main Tab Content */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
