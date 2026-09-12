import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  CheckCircle2,
  Clock,
  Layers,
  Boxes,
  PlusCircle,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Smartphone,
} from 'lucide-react';
import { userService } from '@/services/user/userService';
import { addressService } from '@/services/address/addressService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';

export function UserDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [addressCount, setAddressCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, addrsRes] = await Promise.allSettled([
          userService.getUserDashboard(),
          addressService.getUserAddresses(),
        ]);

        if (dashRes.status === 'fulfilled') {
          setDashboardData(dashRes.value);
        }

        if (addrsRes.status === 'fulfilled' && Array.isArray(addrsRes.value)) {
          setAddressCount(addrsRes.value.length);
        } else if (dashRes.status === 'fulfilled') {
          setAddressCount(dashRes.value?.total_addresses ?? dashRes.value?.totalAddresses ?? 0);
        }
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner text="Loading dashboard metrics..." />
      </div>
    );
  }

  const buying = dashboardData?.buying || {};
  const selling = dashboardData?.selling || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Phone Verification Notice Banner (If Unverified) */}
      {!user?.phoneVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Phone Verification Recommended</h4>
              <p className="text-xs text-slate-600">
                Verify your mobile phone number via SMS OTP to become a verified seller and receive real-time alerts.
              </p>
            </div>
          </div>
          <Link to="/profile" className="flex-shrink-0">
            <Button size="sm" variant="earth">
              Verify Phone Number
            </Button>
          </Link>
        </div>
      )}

      {/* Section 1: My Buying Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg text-slate-900">My Buying Activity</h2>
          </div>
          <Link
            to="/orders?tab=purchases"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Orders */}
          <Link
            to="/orders?tab=purchases"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Total Orders
                </span>
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{buying.total_orders ?? buying.totalOrders ?? 0}</span>
                <span className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              All time purchases
            </p>
          </Link>

          {/* Card 2: Active In Transit */}
          <Link
            to="/orders?tab=purchases&status=ACTIVE"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Active In Transit
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{buying.active_orders ?? buying.activeOrders ?? 0}</span>
                <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Dispatched & Out for delivery
            </p>
          </Link>

          {/* Card 3: Delivered */}
          <Link
            to="/orders?tab=purchases&status=DELIVERED"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Delivered
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{buying.delivered_orders ?? buying.deliveredOrders ?? 0}</span>
                <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Completed handovers
            </p>
          </Link>

          {/* Card 4: Pending Payment */}
          <Link
            to="/orders?tab=purchases&status=PENDING_PAYMENT"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Pending Payment
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{buying.pending_payment_orders ?? buying.pendingPaymentOrders ?? 0}</span>
                <span className="text-xs font-semibold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Awaiting checkout settlement
            </p>
          </Link>
        </div>
      </div>

      {/* Section 2: Farm Listings & Sales */}
      <div className="space-y-4 pt-6 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-earth-50 text-earth-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg text-slate-900">My Farm Listings & Sales</h2>
          </div>
          <Link to="/sell">
            <Button size="sm" variant="earth" icon={PlusCircle}>
              List New Produce
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Products */}
          <Link
            to="/dashboard/selling"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-earth-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Total Products
                </span>
                <div className="w-7 h-7 rounded-lg bg-earth-50 text-earth-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{selling.total_products ?? selling.totalProducts ?? 0}</span>
                <span className="text-xs font-semibold text-earth-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Catalogued produce
            </p>
          </Link>

          {/* Card 2: Active in Market */}
          <Link
            to="/dashboard/selling"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Active in Market
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{selling.active_products ?? selling.activeProducts ?? 0}</span>
                <span className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Available for direct purchase
            </p>
          </Link>

          {/* Card 3: Customer Orders */}
          <Link
            to="/orders?tab=customer"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Customer Orders
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{selling.total_product_orders ?? selling.totalProductOrders ?? 0}</span>
                <span className="text-xs font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Orders placed on your crops
            </p>
          </Link>

          {/* Card 4: Stock Batches */}
          <Link
            to="/dashboard/inventory"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-sky-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Stock Batches
                </span>
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{selling.inventory_items ?? selling.inventoryItems ?? 0}</span>
                <span className="text-xs font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Tracked inventory lines
            </p>
          </Link>
        </div>
      </div>

      {/* Section 3: Quick Navigation Cards */}
      <div className="space-y-4 pt-6 border-t border-slate-200/80">
        <h3 className="font-bold text-base text-slate-900">Services & Quick Management</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard/inventory"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-brand-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>Manage Stock & Quantities</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Update physical quantities, set reserve amounts, and monitor out-of-stock items.
              </p>
            </div>
          </Link>

          <Link
            to="/weather"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-earth-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-earth-50 text-earth-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>Weather & Agronomy Risks</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-earth-700 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Check spraying conditions, rainfall forecasts, and field-level agronomic advisories.
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/locations"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-blue-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>Delivery & Farm Addresses ({addressCount})</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage farm pin locations, warehouse pickup points, and registered delivery addresses.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
