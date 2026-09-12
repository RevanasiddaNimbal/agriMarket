import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  Truck,
  Boxes,
  DollarSign,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useToast } from '@/hooks/useToast';
import { Spinner } from '@/components/loaders/Spinner';

export function AdminDashboardPage() {
  const toast = useToast();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin metrics once on mount; no unnecessary calls or polling
  useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
      try {
        const data = await adminService.getDashboard();
        if (isMounted) setMetrics(data);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
        if (isMounted) toast.error('Failed to load administrative metrics.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner text="Loading admin overview metrics..." />
      </div>
    );
  }

  // 100% Real backend metrics from GET /api/v1/admin/dashboard (AdminDashboardResponseDto)
  const totalUsers = metrics?.total_users ?? metrics?.totalUsers ?? 0;
  const totalProducts = metrics?.total_products ?? metrics?.totalProducts ?? 0;
  const totalOrders = metrics?.total_orders ?? metrics?.totalOrders ?? 0;
  const totalDeliveries = metrics?.total_deliveries ?? metrics?.totalDeliveries ?? 0;
  const totalPayments = metrics?.total_payments ?? metrics?.totalPayments ?? 0;
  const totalPaymentTransactions =
    metrics?.total_payment_transactions ?? metrics?.totalPaymentTransactions ?? 0;
  const totalInventory = metrics?.total_inventory ?? metrics?.totalInventory ?? 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section 1: Platform Commerce & Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg text-slate-900">Platform Commerce & Activity</h2>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <Link
            to="/admin/users"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Total Users
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{totalUsers}</span>
                <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Registered platform accounts
            </p>
          </Link>

          {/* Card 2: Total Products */}
          <Link
            to="/admin/products"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Total Products
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{totalProducts}</span>
                <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Active marketplace crops
            </p>
          </Link>

          {/* Card 3: Total Orders */}
          <Link
            to="/admin/orders"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Total Orders
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{totalOrders}</span>
                <span className="text-xs font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Customer checkout orders
            </p>
          </Link>

          {/* Card 4: Total Deliveries */}
          <Link
            to="/admin/deliveries"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Total Deliveries
                </span>
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{totalDeliveries}</span>
                <span className="text-xs font-semibold text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Fulfillment dispatches
            </p>
          </Link>
        </div>
      </div>

      {/* Section 2: Financials & Stock Supervision */}
      <div className="space-y-4 pt-6 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-earth-50 text-earth-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg text-slate-900">Financials & Inventory Supervision</h2>
          </div>
          <Link
            to="/admin/payments"
            className="text-xs font-bold text-earth-700 hover:text-earth-800 flex items-center gap-1 transition-colors"
          >
            <span>View Payments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Payments */}
          <Link
            to="/admin/payments"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Total Payments
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{totalPayments}</span>
                <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Settled payment records
            </p>
          </Link>

          {/* Card 2: Payment Transactions */}
          <Link
            to="/admin/transactions"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Transactions
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{totalPaymentTransactions}</span>
                <span className="text-xs font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Payment ledger entries
            </p>
          </Link>

          {/* Card 3: Inventory Records */}
          <Link
            to="/admin/inventory"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
                  Stock Records
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{totalInventory}</span>
                <span className="text-xs font-semibold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 font-medium">
              Active crop inventory lines
            </p>
          </Link>
        </div>
      </div>

      {/* Section 3: Services & Quick Management */}
      <div className="space-y-4 pt-6 border-t border-slate-200/80">
        <h3 className="font-bold text-base text-slate-900">Services & Quick Management</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-blue-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>User Accounts & Moderation</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Inspect accounts, activate or deactivate access, lock suspicious logins, and check user verification.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-emerald-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>Catalog & Stock Supervision</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Audit farmer produce listings, check category compliance, review harvest dates, and monitor stock.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-purple-400 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>Orders & Fulfillment Pipeline</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Supervise customer orders, verify dispatch tracking, and track delivery partner handovers.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

