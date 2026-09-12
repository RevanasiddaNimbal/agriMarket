import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Boxes,
  CreditCard,
  MapPin,
  User,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

export function DashboardLayout() {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/dashboard/selling', label: 'My Listed Products', icon: Layers },
    { to: '/dashboard/inventory', label: 'Stock & Inventory', icon: Boxes },
    { to: '/dashboard/transactions', label: 'Payment History', icon: CreditCard },
    { to: '/dashboard/locations', label: 'Farm Locations', icon: MapPin },
    { to: '/profile', label: 'Profile & Account', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-emerald-900 to-slate-900 text-white p-6 sm:p-8 shadow-soft-lg mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.profilePictureUrl || 'https://img.magnific.com/premium-psd/avatar-job-profession-3d-illustration-icon_824633-9644.jpg?semt=ais_hybrid&w=740&q=80'}
              alt={user?.fullName || 'User'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-soft-sm bg-white/10"
              onError={(e) => {
                e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullName || 'User') + '&background=16a34a&color=fff';
              }}
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user?.fullName}</h1>
                {user?.phoneVerified && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-600/90 text-emerald-50 border border-emerald-400/70 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5] text-emerald-200" /> Verified Farmer
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link to="/sell" className="w-full sm:w-auto">
              <Button variant="earth" className="w-full sm:w-auto" icon={PlusCircle}>
                List New Crop
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative ambient background */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Dashboard Sub-navigation Tabs (scrollable on mobile) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-soft-sm'
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
    </div>
  );
}
